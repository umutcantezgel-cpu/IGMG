'use server';

import { eq } from 'drizzle-orm';
import { refresh } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { protokolliere } from '@/lib/audit';
import { inhaltGeaendert } from '@/lib/cache/aktualisieren';
import { TAG } from '@/lib/cache/tags';
import { db, schema } from '@/lib/db';
import { ABGESCHLOSSEN, bearbeitungsRecht, EINGANG_STATUS } from '@/lib/eingaenge/arten';
import { hoechstfristOffen, ladeLoeschfristen, loeschenNachAbschluss } from '@/lib/eingaenge/fristen';
import { verschluessele } from '@/lib/krypto';
import { darf, KeinRecht, verlangeRecht, type Angemeldet } from '@/lib/rechte/pruefe';
import { ladeEingangKopf, type EingangZeile } from '@/server/queries/verwaltung/eingaenge';

/**
 * Verwaltung „Eingänge“ (C08, V08, ADR 0005, G-07). Reihenfolge je Action: Sitzung mit 2FA und Verwaltungszugang →
 * Eingang sichtbar (Art und Organisation) → Bearbeitungsrecht der Art → Speichern mit Audit (ohne Personendaten).
 * Echte Löschung ohne Papierkorb (K-05): Eingang, Einwilligungen, Notizen und Mail-Ausgang.
 */
const e = schema.eingang;

async function mitEingang(id: unknown): Promise<{ a: Angemeldet; kopf: EingangZeile }> {
  const a = await verlangeRecht('verwaltung.betreten');
  const kopf = await ladeEingangKopf(String(id ?? ''), a);
  if (!kopf) throw new KeinRecht();
  if (!darf(a.rollen, bearbeitungsRecht(kopf.art), { organisation: kopf.organisation })) throw new KeinRecht();
  return { a, kopf };
}

/** Status ändern. Abschluss (erledigt/abgelehnt) startet die Löschfrist, Wiederöffnen setzt die Höchstfrist (außer der Terminfrist). */
export async function setzeStatus(fd: FormData): Promise<void> {
  // Recht zuerst (Tor B/C N3), dann die übrigen Eingaben
  const { a, kopf } = await mitEingang(fd.get('id'));
  const p = z.object({ status: z.enum(EINGANG_STATUS) }).safeParse({ status: fd.get('status') });
  if (!p.success) throw new KeinRecht();
  if (kopf.status === p.data.status) return;
  const jetzt = new Date();
  const abschluss = ABGESCHLOSSEN.has(p.data.status);
  const fristen = abschluss ? await ladeLoeschfristen() : null;
  let bezugId: string | null = null;
  await db.transaction(async (tx) => {
    const [alt] = await tx.select({ loeschenAb: e.loeschenAb, bezugId: e.bezugId }).from(e).where(eq(e.id, kopf.id));
    bezugId = alt?.bezugId ?? null;
    await tx
      .update(e)
      .set({
        status: p.data.status,
        erledigtAm: abschluss ? jetzt : null,
        // Anmeldungen behalten die Frist nach dem Termin; sonst Frist ab Abschluss bzw. Höchstfrist ab Wiederöffnen (B4)
        loeschenAb: abschluss
          ? loeschenNachAbschluss(kopf.art, jetzt, fristen!, alt?.loeschenAb ?? null)
          : kopf.art === 'veranstaltungsanmeldung' && alt?.loeschenAb
            ? alt.loeschenAb
            : hoechstfristOffen(jetzt),
        bearbeitetVon: a.benutzerId,
      })
      .where(eq(e.id, kopf.id));
    await protokolliere(
      {
        benutzerId: a.benutzerId,
        aktion: 'eingang.status',
        zielTyp: 'eingang',
        zielId: kopf.id,
        details: { art: kopf.art, von: kopf.status, nach: p.data.status },
      },
      tx,
    );
  });
  // Abgelehnte Anmeldungen zählen nicht als belegte Plätze – Platzzahl öffentlich sofort aktualisieren
  if (kopf.art === 'veranstaltungsanmeldung' && bezugId) inhaltGeaendert(TAG.anmeldungenVon(bezugId));
  refresh();
}

const notizSchema = z.object({ text: z.string().trim().min(1).max(2000) });

/** Interne Notiz (verschlüsselt, nur in der Verwaltung sichtbar). */
export async function notizHinzufuegen(fd: FormData): Promise<void> {
  const { a, kopf } = await mitEingang(fd.get('id'));
  const p = notizSchema.safeParse({ text: fd.get('text') });
  if (!p.success) throw new KeinRecht();
  const paket = verschluessele(p.data.text);
  await db.transaction(async (tx) => {
    await tx
      .insert(schema.eingangNotiz)
      .values({ eingangId: kopf.id, textVerschluesselt: paket.daten, schluesselId: paket.schluesselId, autorId: a.benutzerId });
    await protokolliere(
      { benutzerId: a.benutzerId, aktion: 'eingang.notiz', zielTyp: 'eingang', zielId: kopf.id, details: { art: kopf.art } },
      tx,
    );
  });
  refresh();
}

/** Endgültig löschen (K-05, G-07): Eingang samt Einwilligungen, Notizen (Kaskade) und Mail-Ausgang. */
export async function endgueltigLoeschen(fd: FormData): Promise<void> {
  const { a, kopf } = await mitEingang(fd.get('id'));
  const [roh] = await db.select({ bezugId: e.bezugId }).from(e).where(eq(e.id, kopf.id));
  await db.transaction(async (tx) => {
    await tx.delete(schema.mailAusgang).where(eq(schema.mailAusgang.bezugEingangId, kopf.id));
    await tx.delete(e).where(eq(e.id, kopf.id));
    await protokolliere(
      { benutzerId: a.benutzerId, aktion: 'eingang.geloescht', zielTyp: 'eingang', zielId: kopf.id, details: { art: kopf.art } },
      tx,
    );
  });
  // Platzzählung der Veranstaltung sofort aktualisieren
  if (kopf.art === 'veranstaltungsanmeldung' && roh?.bezugId) inhaltGeaendert(TAG.anmeldungenVon(roh.bezugId));
  redirect('/verwaltung/eingaenge?geloescht=1');
}
