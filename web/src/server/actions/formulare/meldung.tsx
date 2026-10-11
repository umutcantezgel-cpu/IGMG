'use server';

import { randomUUID } from 'node:crypto';
import { getTranslations } from 'next-intl/server';
import { after } from 'next/server';
import { MeldungErfolg, MeldungFormular } from '@/components/website/formulare/MeldungFormular';
import { protokolliere } from '@/lib/audit';
import { db, schema } from '@/lib/db';
import type { FormularAntwort } from '@/lib/formulare/ergebnis';
import { zurueckOhneSkript } from '@/lib/formulare/ohne-skript';
import { pruefeEinsendung, type GeplanteMail } from '@/lib/formulare/verarbeiten';
import { datumOhneWochentag, isoZeit } from '@/lib/i18n/format';
import { sha256, verschluessele } from '@/lib/krypto';
import { versendeOffeneMails } from '@/lib/mail/ausgang';
import { meldungSchema } from '@/lib/validierung/formulare/meldung';
import type { Melder } from '@/lib/validierung/ticket';

type Sprache = 'de' | 'tr' | 'en';

/** Melderangaben wie in `melderSchema` plus der Nachweis der Einwilligung (E-037). */
type MelderMitEinwilligung = Melder & {
  einwilligung: { schluessel: string; textVersion: string; sprache: Sprache; erteiltAm: string };
};

/** Textschlüssel der Einwilligung in der Textversion (Hash des Textes aus `meldung.einwilligung`). */
const EINWILLIGUNG_SCHLUESSEL = 'meldung.einwilligung';

/**
 * Öffentliche Meldung (C10b, E-034, E-037): Schutz über `pruefeEinsendung` (Rate → Honigtopf → ALTCHA → Zod), kein
 * Eingang, sondern ein Ticket. Eine Transaktion legt Ticket, Melderangaben (verschlüsselt, mit Einwilligungsnachweis),
 * Audit und Mails an. Benachrichtigung an die Berechtigten ohne Formulardaten; Bestätigung nur mit E-Mail-Adresse.
 */
export async function sendeMeldung(_vorher: FormularAntwort | null, fd: FormData): Promise<FormularAntwort> {
  await zurueckOhneSkript();
  const sprache = (['de', 'tr', 'en'].includes(String(fd.get('sprache'))) ? fd.get('sprache') : 'de') as Sprache;
  const pruefung = await pruefeEinsendung({ kennung: 'meldung', fd, schema: meldungSchema });
  if (!pruefung.ok) {
    // Honigtopf ausgefüllt: scheinbarer Erfolg, nichts gespeichert (Bots erfahren nichts)
    if (pruefung.ergebnis.status === 'erfolg')
      return { status: 'erfolg', ansicht: <MeldungErfolg sprache={sprache} bestaetigung={false} /> };
    const fehler = pruefung.ergebnis.status === 'fehler' ? pruefung.ergebnis : { status: 'fehler' as const, fehler: 'allgemein' };
    // Formular erneut mit Werten und Fehlern; neuer ALTCHA-Schlüssel (Lösungen sind einmalig)
    return {
      status: 'fehler',
      fehler: fehler.fehler,
      feldFehler: fehler.feldFehler,
      ansicht: <MeldungFormular sprache={sprache} ergebnis={fehler} altchaSchluessel={randomUUID()} />,
    };
  }

  const daten = pruefung.daten;
  const jetzt = new Date();
  const t = await getTranslations({ locale: sprache, namespace: 'meldung' });
  const melder: MelderMitEinwilligung = {
    vorname: daten.vorname,
    nachname: daten.nachname,
    ...(daten.telefon ? { telefon: daten.telefon } : {}),
    ...(daten.email ? { email: daten.email } : {}),
    rueckmeldung: daten.rueckmeldung === 'ja',
    ...(daten.rueckmeldung === 'ja' && daten.rueckmeldeArt ? { rueckmeldeArt: daten.rueckmeldeArt } : {}),
    einwilligung: {
      schluessel: EINWILLIGUNG_SCHLUESSEL,
      textVersion: sha256(t('einwilligung')),
      sprache,
      erteiltAm: isoZeit(jetzt),
    },
  };
  const paket = verschluessele(melder);

  await db.transaction(async (tx) => {
    const [neu] = await tx
      .insert(schema.ticket)
      .values({
        titel: daten.betreff,
        beschreibung: daten.beschreibung,
        typ: daten.typ,
        organisation: daten.organisation === '' ? null : daten.organisation,
        status: 'offen',
        melderVerschluesselt: paket.daten,
        schluesselId: paket.schluesselId,
      })
      .returning({ id: schema.ticket.id });
    await protokolliere(
      {
        benutzerId: null,
        aktion: 'ticket.angelegt',
        zielTyp: 'ticket',
        zielId: neu.id,
        details: { typ: daten.typ, oeffentlich: true },
      },
      tx,
    );
    // Benachrichtigung ohne Formulardaten (nur Art und Verweis); Bestätigung nur mit E-Mail-Adresse
    const mails: GeplanteMail[] = [
      {
        an: 'recht:ticket.bearbeiten',
        vorlage: 'benachrichtigung',
        sprache: 'de',
        daten: { art: 'meldung', pfad: `/verwaltung/tickets/${neu.id}` },
      },
    ];
    if (daten.email)
      mails.push({
        an: daten.email,
        vorlage: 'bestaetigung',
        sprache,
        daten: { art: 'meldung', datum: datumOhneWochentag(jetzt, sprache) },
      });
    await tx.insert(schema.mailAusgang).values(
      mails.map((m) => {
        const v = verschluessele({ an: m.an, daten: m.daten });
        return { vorlage: m.vorlage, sprache: m.sprache, datenVerschluesselt: v.daten, schluesselId: v.schluesselId };
      }),
    );
  });
  // Versand nach der Antwort (Fehler bleiben im Ausgang und werden erneut versucht)
  after(() => versendeOffeneMails().catch(() => undefined));
  return { status: 'erfolg', ansicht: <MeldungErfolg sprache={sprache} bestaetigung={daten.email !== ''} /> };
}
