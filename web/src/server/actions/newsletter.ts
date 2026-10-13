'use server';

import { and, eq, isNull } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { after } from 'next/server';
import { protokolliere } from '@/lib/audit';
import { db, schema } from '@/lib/db';
import { verschluessele } from '@/lib/krypto';
import { versendeOffeneMails } from '@/lib/mail/ausgang';
import { NEWSLETTER_EMPFAENGER } from '@/lib/newsletter/mails';
import { NEWSLETTER_VORLAGE } from '@/lib/newsletter/vorlagen';
import { verlangeRecht, type Angemeldet } from '@/lib/rechte/pruefe';
import { ausgabeAusFormular, ausgabeDatensatz, ausgabeSchema } from '@/lib/validierung/newsletter';
import { empfaengerBedingung } from '@/server/queries/verwaltung/newsletter';

/**
 * Verwaltung „Newsletter“ (AUFTRAG 3.10, K-B). Schreiben und Versenden mit `newsletter.senden` (Redaktion,
 * Administration); Lesen (`newsletter.lesen`) zeigt nur Zahlen. Der Versand legt je Empfänger eine Zeile im
 * Mail-Ausgang an – ohne Adresse (nur „newsletter:<Abo-ID>“, entschlüsselt erst beim Senden) und mit Abmeldelink in
 * jeder Mail. Gesendet wird in Paketen nach der Antwort und danach über die Wartungsroute `mail-ausgang`.
 */
export type AusgabeZustand = {
  fehler?: string;
  feldFehler?: Record<string, string>;
  werte?: Record<string, string | string[]>;
  gespeichert?: number;
  versendet?: number;
};

const n = schema.newsletterAusgabe;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** Zeilen je Einfügen in den Mail-Ausgang und Mails je Versandpaket. */
const PAKET = 200;
const VERSANDPAKET = 50;

async function recht(): Promise<Angemeldet | null> {
  try {
    return await verlangeRecht('newsletter.senden');
  } catch {
    return null;
  }
}

/** Ausgabe anlegen (ohne `id`) oder ändern – nur, solange sie nicht versendet ist. */
export async function speichereAusgabe(_vorher: AusgabeZustand, fd: FormData): Promise<AusgabeZustand> {
  const a = await recht();
  if (!a) return { fehler: 'keinRecht' };
  const id = String(fd.get('id') ?? '');
  const werte = ausgabeAusFormular(fd);
  if (id && !UUID.test(id)) return { fehler: 'nichtGefunden', werte };
  const p = ausgabeSchema.safeParse(werte);
  if (!p.success) {
    const feldFehler: Record<string, string> = {};
    for (const f of p.error.issues) {
      const feld = String(f.path[0] ?? 'formular');
      feldFehler[feld] ??= /^[a-zA-Z]+$/.test(f.message) && f.message.length < 30 ? f.message : 'ungueltig';
    }
    return { fehler: 'pruefen', feldFehler, werte };
  }
  const daten = ausgabeDatensatz(p.data);
  const zielId = await db.transaction(async (tx) => {
    if (id) {
      const r = await tx
        .update(n)
        .set(daten)
        .where(and(eq(n.id, id), isNull(n.versendetAm)))
        .returning({ id: n.id });
      if (!r.length) return null;
      await protokolliere({ benutzerId: a.benutzerId, aktion: 'inhalt.geaendert', zielTyp: 'newsletter_ausgabe', zielId: id }, tx);
      return id;
    }
    const [neu] = await tx
      .insert(n)
      .values({ ...daten, erstelltVon: a.benutzerId })
      .returning({ id: n.id });
    await protokolliere({ benutzerId: a.benutzerId, aktion: 'inhalt.angelegt', zielTyp: 'newsletter_ausgabe', zielId: neu.id }, tx);
    return neu.id;
  });
  if (!zielId) return { fehler: 'schonVersendet', werte };
  if (!id) redirect(`/verwaltung/newsletter/${zielId}?angelegt=1`);
  return { gespeichert: Date.now() };
}

/**
 * Ausgabe versenden: genau einmal (bedingtes UPDATE auf `versendetAm`), nur nach ausdrücklicher Bestätigung.
 * Empfänger: bestätigt, nicht abgemeldet, mit mindestens einem Thema der Ausgabe (ohne Themen: alle).
 */
export async function versendeAusgabe(_vorher: AusgabeZustand, fd: FormData): Promise<AusgabeZustand> {
  const a = await recht();
  if (!a) return { fehler: 'keinRecht' };
  const id = String(fd.get('id') ?? '');
  if (!UUID.test(id)) return { fehler: 'nichtGefunden' };
  if (fd.get('bestaetigt') !== 'ja') return { fehler: 'bestaetigen', feldFehler: { bestaetigt: 'bestaetigen' } };
  const anzahl = await db.transaction(async (tx) => {
    const [ausgabe] = await tx
      .update(n)
      .set({ versendetAm: new Date() })
      .where(and(eq(n.id, id), isNull(n.versendetAm)))
      .returning({ id: n.id, themen: n.themen });
    if (!ausgabe) return null;
    const empfaenger = await tx
      .select({ id: schema.newsletterAbo.id, sprache: schema.newsletterAbo.sprache })
      .from(schema.newsletterAbo)
      .where(empfaengerBedingung(ausgabe.themen));
    for (let i = 0; i < empfaenger.length; i += PAKET) {
      await tx.insert(schema.mailAusgang).values(
        empfaenger.slice(i, i + PAKET).map((e) => {
          const v = verschluessele({ an: `${NEWSLETTER_EMPFAENGER}${e.id}`, daten: { ausgabeId: id, aboId: e.id } });
          return {
            vorlage: NEWSLETTER_VORLAGE.ausgabe,
            sprache: ['de', 'tr', 'en'].includes(e.sprache) ? e.sprache : 'de',
            datenVerschluesselt: v.daten,
            schluesselId: v.schluesselId,
          };
        }),
      );
    }
    await tx.update(n).set({ empfaenger: empfaenger.length }).where(eq(n.id, id));
    await protokolliere(
      {
        benutzerId: a.benutzerId,
        aktion: 'newsletter.versendet',
        zielTyp: 'newsletter_ausgabe',
        zielId: id,
        details: { empfaenger: empfaenger.length },
      },
      tx,
    );
    return empfaenger.length;
  });
  if (anzahl === null) return { fehler: 'schonVersendet' };
  // Versand in Paketen nach der Antwort; was übrig bleibt, holt die Wartungsroute mail-ausgang
  after(async () => {
    for (let runde = 0; runde < Math.ceil(anzahl / VERSANDPAKET) && runde < 10; runde++) {
      const r = await versendeOffeneMails(VERSANDPAKET).catch(() => ({ gesendet: 0, fehler: 0 }));
      if (r.gesendet + r.fehler === 0) break;
    }
  });
  return { versendet: anzahl };
}

/** Entwurf löschen (versendete Ausgaben bleiben als Nachweis). */
export async function loescheAusgabe(fd: FormData): Promise<void> {
  const a = await verlangeRecht('newsletter.senden');
  const id = String(fd.get('id') ?? '');
  if (!UUID.test(id)) return;
  const geloescht = await db.transaction(async (tx) => {
    const r = await tx
      .delete(n)
      .where(and(eq(n.id, id), isNull(n.versendetAm)))
      .returning({ id: n.id });
    if (r.length)
      await protokolliere({ benutzerId: a.benutzerId, aktion: 'inhalt.geloescht', zielTyp: 'newsletter_ausgabe', zielId: id }, tx);
    return r.length > 0;
  });
  if (geloescht) redirect('/verwaltung/newsletter?geloescht=1');
}
