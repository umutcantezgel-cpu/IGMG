import 'server-only';
import { headers } from 'next/headers';
import { after } from 'next/server';
import type { z } from 'zod';
import { protokolliere } from '@/lib/audit';
import { db, schema } from '@/lib/db';
import { sha256, verschluessele } from '@/lib/krypto';
import { versendeOffeneMails } from '@/lib/mail/ausgang';
import { clientAdresse } from '@/lib/sicherheit/ip';
import { pruefeAltcha } from '@/lib/validierung/altcha';
import { pruefeRate, STANDARD_GRENZE, type Grenze } from '@/lib/validierung/ratenbegrenzung';
import { FELD_ALTCHA, FELD_HONIGTOPF, type FormularErgebnis } from './ergebnis';
import { feldFehler, rohwerte } from './rohwerte';

type EingangArt = (typeof schema.eingangArtEnum.enumValues)[number];

export type GeplanteMail = {
  /** Empfänger: Adresse (Bestätigung an Absender) oder „rolle:<art>“ (Benachrichtigung der zuständigen Rollen). */
  an: string;
  vorlage: 'bestaetigung' | 'benachrichtigung';
  sprache: 'de' | 'tr' | 'en';
  /** Nur Anzeigewerte für die Vorlage – bei Benachrichtigungen KEINE Formulardaten (ADR 0005). */
  daten: Record<string, string>;
};

export type Einwilligung = { schluessel: string; text: string };

/**
 * Schutzschritte jeder öffentlichen Einsendung (K-07, ADR 0005), in fester Reihenfolge: 1 Ratenbegrenzung je IP und
 * Formular → 2 Honigtopf (ausgefüllt: scheinbarer Erfolg) → 3 ALTCHA (einmal verwendbar) → 4 Zod → Zusatzprüfung.
 * Für Formulare, die nicht als Eingang gespeichert werden (Meldung → Ticket, E-037); sonst `verarbeiteFormular`.
 */
export async function pruefeEinsendung<S extends z.ZodType>(o: {
  /** Schlüssel der Ratenbegrenzung (`formular-<kennung>`) */
  kennung: string;
  fd: FormData;
  schema: S;
  mehrfach?: readonly string[];
  grenze?: Grenze;
  pruefen?: (daten: z.infer<S>) => Promise<FormularErgebnis | null>;
}): Promise<{ ok: true; daten: z.infer<S>; roh: Record<string, unknown> } | { ok: false; ergebnis: FormularErgebnis }> {
  const roh = rohwerte(o.fd, o.mehrfach);
  // 1 Ratenbegrenzung je IP und Formular (IP nur als HMAC)
  const ip = clientAdresse(await headers());
  const rate = await pruefeRate(`formular-${o.kennung}`, ip, o.grenze ?? STANDARD_GRENZE);
  if (!rate.erlaubt) return { ok: false, ergebnis: { status: 'fehler', fehler: 'zuViele', werte: roh } };
  // 2 Honigtopf
  const topf = o.fd.get(FELD_HONIGTOPF);
  if (typeof topf === 'string' && topf.trim() !== '') return { ok: false, ergebnis: { status: 'erfolg' } };
  // 3 ALTCHA (einmal verwendbar)
  if (!(await pruefeAltcha(o.fd.get(FELD_ALTCHA)))) return { ok: false, ergebnis: { status: 'fehler', fehler: 'altcha', werte: roh } };
  // 4 Zod
  const geprueft = o.schema.safeParse(roh);
  if (!geprueft.success)
    return { ok: false, ergebnis: { status: 'fehler', fehler: 'pruefen', feldFehler: feldFehler(geprueft.error.issues), werte: roh } };
  const daten = geprueft.data as z.infer<S>;
  if (o.pruefen) {
    const zusatz = await o.pruefen(daten);
    if (zusatz) return { ok: false, ergebnis: zusatz.status === 'fehler' ? { ...zusatz, werte: roh } : zusatz };
  }
  return { ok: true, daten, roh };
}

/**
 * Öffentliches Formular verarbeiten (K-07, ADR 0005) – feste Reihenfolge:
 * 1 Ratenbegrenzung → 2 Honigtopf → 3 ALTCHA (verbraucht) → 4 Zod → 5 Speichern in einer Transaktion
 * (eingang verschlüsselt + einwilligung mit Textversion + mail_ausgang verschlüsselt) → 6 Versand nach der Antwort
 * → 7 `{ status: 'erfolg' }` ohne Personendaten.
 * Honigtopf ausgefüllt: scheinbarer Erfolg, nichts gespeichert (Bots erfahren nichts).
 */
export async function verarbeiteFormular<S extends z.ZodType>(o: {
  art: EingangArt;
  fd: FormData;
  schema: S;
  sprache: 'de' | 'tr' | 'en';
  mehrfach?: readonly string[];
  grenze?: Grenze;
  /** Pflicht-Einwilligungen: Schlüssel des angezeigten Texts und genau dieser Text (für die Textversion). */
  einwilligungen: (daten: z.infer<S>) => Einwilligung[];
  bezugId?: (daten: z.infer<S>) => string | null;
  anzahl?: (daten: z.infer<S>) => number;
  /** Löschfrist beim Anlegen, falls schon bekannt (z. B. 30 Tage nach einer Veranstaltung, M-050); sonst setzt C08 sie. */
  loeschenAb?: (daten: z.infer<S>) => Date | null;
  /** Zusätzliche Prüfung nach Zod (z. B. Platzzahl); Rückgabe = Fehler oder null. */
  pruefen?: (daten: z.infer<S>) => Promise<FormularErgebnis | null>;
  mails: (daten: z.infer<S>, eingangId: string) => GeplanteMail[];
}): Promise<FormularErgebnis> {
  const p = await pruefeEinsendung({
    kennung: o.art,
    fd: o.fd,
    schema: o.schema,
    mehrfach: o.mehrfach,
    grenze: o.grenze,
    pruefen: o.pruefen,
  });
  if (!p.ok) return p.ergebnis;
  const daten = p.daten;
  // 5 Speichern (Transaktion)
  const paket = verschluessele(daten);
  await db.transaction(async (tx) => {
    const [eingang] = await tx
      .insert(schema.eingang)
      .values({
        art: o.art,
        sprache: o.sprache,
        bezugId: o.bezugId?.(daten) ?? null,
        anzahl: o.anzahl?.(daten) ?? 1,
        datenVerschluesselt: paket.daten,
        schluesselId: paket.schluesselId,
        loeschenAb: o.loeschenAb?.(daten) ?? null,
      })
      .returning({ id: schema.eingang.id });
    // Nachvollziehbarkeit (G-07, Tor A SP-A-07): Anlegen protokollieren – ohne Personendaten, nur die Art
    await protokolliere(
      { benutzerId: null, aktion: 'eingang.angelegt', zielTyp: 'eingang', zielId: eingang.id, details: { art: o.art } },
      tx,
    );
    const einwilligungen = o.einwilligungen(daten);
    if (einwilligungen.length)
      await tx.insert(schema.einwilligung).values(
        einwilligungen.map((e) => ({
          eingangId: eingang.id,
          textSchluessel: e.schluessel,
          textVersion: sha256(e.text),
          sprache: o.sprache,
        })),
      );
    const mails = o.mails(daten, eingang.id);
    if (mails.length)
      await tx.insert(schema.mailAusgang).values(
        mails.map((m) => {
          const v = verschluessele({ an: m.an, daten: m.daten });
          return {
            vorlage: m.vorlage,
            sprache: m.sprache,
            datenVerschluesselt: v.daten,
            schluesselId: v.schluesselId,
            bezugEingangId: eingang.id,
          };
        }),
      );
  });
  // 6 Versand nach der Antwort (Fehler bleiben im Ausgang und werden erneut versucht)
  after(() => versendeOffeneMails().catch(() => undefined));
  // 7
  return { status: 'erfolg' };
}
