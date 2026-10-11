import type { z } from 'zod';
import { schema } from '../../../src/lib/db';
import { schema as datenschutzSchema } from '../../../src/lib/validierung/seiteninhalte/datenschutz';
import { schema as impressumSchema } from '../../../src/lib/validierung/seiteninhalte/impressum';
import type { BereichsSeed } from './typ';

/**
 * Beispielinhalte „impressum“ und „datenschutz“ (Blatt S23; Welle A). Entwürfe nach G-08: alle Angaben zur Gemeinde
 * sind Platzhalter in eckigen Klammern (G-05, kein Beispielwert wie die Adresse im Design). Die Datenschutzerklärung
 * beschreibt die Technik des Codes; was der Code noch nicht tut, steht als Hinweis für die Prüfung. Keine Personennamen (G-04).
 * Fundstellen: Quelle je Zeile; Bestandsfelder nach Blatt S23, Beschriftungen der Schüler-Voranmeldung im Bestand geprüft.
 */

const impressum: z.input<typeof impressumSchema> = {
  verantwortlich: {
    name: '[Name und Rechtsform – Vorstand]',
    anschrift: '[Anschrift]',
    telefon: '[Telefonnummer]',
    email: '[E-Mail-Adresse]',
    vertretung: '[Vertretungsberechtigte – Vorstand]',
    register: '[Registergericht und Registernummer]',
  },
  weitere: [
    { art: 'absatz', text: { de: 'Weitere Angaben: [Text – Rechtsberatung].' } },
    {
      art: 'absatz',
      text: {
        de: '[Hinweis für die Prüfung: Die bisherige Webseite enthält keine Rechtsangaben. Die Pflichtangaben und ihr Lieferant sind offen.]',
      },
    },
  ],
};

const datenschutz: z.input<typeof datenschutzSchema> = {
  datenschutzbeauftragte: '[Datenschutzbeauftragte/r – Angaben von der Gemeinde]',
  daten: [
    {
      art: 'absatz',
      text: {
        de: 'Beim Aufruf der öffentlichen Seiten verarbeitet der Server die Verbindungsdaten, die für die Auslieferung der Seite nötig sind. Angaben zum Hoster und zur Aufbewahrung der Server-Protokolle: [Hoster – Angaben von der Gemeinde]; [Frist – Gemeinde].',
      },
    },
    {
      art: 'liste',
      titel: { de: 'Veranstaltungsanmeldung' },
      punkte: [
        { de: 'Name (Pflicht)' },
        { de: 'E-Mail-Adresse (Pflicht)' },
        { de: 'Telefonnummer (freiwillig)' },
        { de: 'Anzahl der Personen, 1 bis 10 (Pflicht)' },
        { de: 'Einwilligung mit Zeitpunkt und Textfassung (Pflicht)' },
        { de: 'gewählte Veranstaltung und Sprache der Seite' },
      ],
    },
    {
      art: 'liste',
      titel: { de: 'Schüler-Voranmeldung für Bildungsangebote' },
      punkte: [
        { de: 'Gewünschte Klasse und Geschlecht des Kindes (Pflicht)' },
        { de: 'Vorname, Nachname und Geburtsdatum des Kindes (Pflicht)' },
        { de: 'Anschrift: Straße und Hausnummer, Postleitzahl, Ort (Pflicht)' },
        { de: 'Elternteil 1: Name, Telefonnummer und E-Mail-Adresse (Pflicht)' },
        { de: 'Elternteil 2: Name, Telefonnummer und E-Mail-Adresse (freiwillig)' },
        { de: 'Namen von Geschwisterkindern, die bereits angemeldet sind (freiwillig)' },
        { de: 'Name der Person, die das Formular ausfüllt (Pflicht)' },
        { de: 'Zwei Einverständniserklärungen mit Zeitpunkt und Textfassung (Pflicht)' },
      ],
    },
    { art: 'absatz', text: { de: '[Angaben zu Kindern – Prüfung durch die Rechtsberatung]' } },
    {
      art: 'absatz',
      text: {
        de: 'Weitere Formulare: Die folgenden Formulare sind in dieser Fassung noch nicht eingebaut. Ihre Felder sind vorläufig und werden vor einer Freigabe geprüft.',
      },
    },
    {
      art: 'liste',
      titel: { de: 'Mitgliedsantrag' },
      punkte: [
        { de: 'Name und E-Mail-Adresse (Pflicht)' },
        { de: 'Telefon, Adresse und Stadt (optional)' },
        { de: 'Altersgruppe und Geschlecht' },
        { de: 'Interessen und bisherige Erfahrungen' },
        { de: 'Motivation (Pflicht)' },
        { de: 'Newsletter' },
        { de: 'Datenschutz-Einwilligung (Pflicht)' },
      ],
    },
    {
      art: 'liste',
      titel: { de: 'Anfrage für eine Webseite der Moschee' },
      punkte: [
        { de: 'Name der Moschee, Ansprechperson und E-Mail-Adresse (Pflicht)' },
        { de: 'Telefon' },
        { de: 'Anschrift, Stadt, Postleitzahl und Land (Pflicht)' },
        { de: 'Website und Mitgliederzahl' },
        { de: 'Anforderungen, Budget, Zeitrahmen und Zusatzangaben' },
        { de: 'Einwilligung (Pflicht)' },
      ],
    },
    {
      art: 'liste',
      titel: { de: 'Rückmeldung zu einem Angebot' },
      punkte: [
        { de: 'Name, Nachname und Telefon (Pflicht)' },
        { de: 'E-Mail-Adresse (optional)' },
        { de: 'Organisation (Pflicht)' },
        { de: 'Rückmeldung und gewünschte Rückmeldeart' },
        { de: 'Art der Nachricht (Pflicht) und Text (Pflicht)' },
      ],
    },
    {
      art: 'absatz',
      text: {
        de: '[Hinweis für die Prüfung: Dieses Formular erhebt bisher keine Einwilligung; die Telefonnummer ist Pflicht.]',
      },
    },
  ],
  zweck: [
    {
      art: 'absatz',
      text: {
        de: 'Anmeldungen zu Veranstaltungen verarbeiten wir, um die Veranstaltung zu organisieren und Sie per E-Mail zu erreichen. Die Einwilligung lautet: „Ich willige ein, dass die IGMG Wetzlar meine Angaben zur Organisation dieser Veranstaltung verarbeitet und mich dazu per E-Mail kontaktiert.“',
      },
    },
    { art: 'absatz', text: { de: 'Rechtsgrundlage: [Text – Rechtsberatung].' } },
    {
      art: 'absatz',
      text: {
        de: 'Schüler-Voranmeldungen verarbeiten wir, um Ihr Kind auf die Warteliste der Bildungsangebote zu setzen und Sie dazu zu kontaktieren. Die Einverständniserklärungen lauten: „Einverständnis zur Kontaktaufnahme“ und „Zustimmung zur Datenschutzerklärung. Bei Nichtinteresse werden die Daten wieder gelöscht.“ Rechtsgrundlage: [Text – Rechtsberatung].',
      },
    },
    {
      art: 'absatz',
      text: {
        de: 'Für die weiteren Formulare gilt der Zweck aus dem jeweiligen Einwilligungstext, zum Beispiel „zu Beratungszwecken“ (Anfrage für eine Webseite der Moschee). Rechtsgrundlage: [Text – Rechtsberatung].',
      },
    },
  ],
  speicherung: [
    {
      art: 'absatz',
      text: {
        de: '[Hinweis für die Prüfung: Die Einwilligung zur Veranstaltungsanmeldung sagt eine Löschung „nach der Veranstaltung“ zu. Anmeldungen zu einmaligen Terminen werden beim Eingang für 30 Tage nach dem Termin zur Löschung vorgemerkt; die automatische Löschung wird vor der Freigabe eingerichtet (M-050, M-079).]',
      },
    },
    { art: 'absatz', text: { de: 'Löschfrist für Anmeldungen zu Veranstaltungen: [Frist – Vorstand].' } },
    {
      art: 'absatz',
      text: { de: 'Löschfristen der weiteren Formulare: [Frist je Formular – Vorstand].' },
    },
    { art: 'absatz', text: { de: 'Server-Protokolle: [Frist – Hoster und Vorstand].' } },
  ],
  sicherheit: [
    {
      art: 'absatz',
      text: {
        de: 'Formulardaten werden verschlüsselt gespeichert (AES-256-GCM). Im Klartext stehen nur Angaben, die für Platzzählung und Bearbeitung gebraucht werden: Art, Status, Sprache, Veranstaltung, Personenzahl und Zeitpunkte.',
      },
    },
    {
      art: 'absatz',
      text: {
        de: 'Auf die Eingänge greifen nur Ehrenamtliche zu, die sich mit einem zweiten Faktor angemeldet haben und eine passende Rolle besitzen.',
      },
    },
    {
      art: 'absatz',
      text: {
        de: 'Zum Schutz vor Massenanfragen sind je Formular und Absender höchstens fünf Anfragen in zehn Minuten möglich. Die IP-Adresse wird dafür nicht gespeichert, sondern nur als nicht umkehrbarer Prüfwert.',
      },
    },
  ],
  empfaenger: [
    {
      art: 'absatz',
      text: {
        de: 'Formulardaten sehen nur die zuständigen Ehrenamtlichen in der Verwaltung. Der Versand der E-Mails läuft über einen SMTP-Dienst: [Anbieter – Angaben von der Gemeinde].',
      },
    },
    {
      art: 'absatz',
      text: {
        de: 'Nach einer Anmeldung erhalten Sie eine Bestätigung an die angegebene E-Mail-Adresse mit Veranstaltung, Termin und Datum. Die Benachrichtigung der zuständigen Ehrenamtlichen enthält keine Formulardaten, sondern nur einen Hinweis und einen Link in die Verwaltung.',
      },
    },
    {
      art: 'absatz',
      text: {
        de: 'Die öffentlichen Seiten laden keine Inhalte von Dritten. Schriften, Bilder und Skripte stammen von dieser Website; auch der Bot-Schutz (ALTCHA) läuft auf dem eigenen Server ohne Cookies.',
      },
    },
    {
      art: 'absatz',
      text: {
        de: 'Karte: Eine Karte zeigt die Lage der Moschee erst nach einem Klick. Dann lädt der Browser Kartendaten von OpenStreetMap; dabei wird Ihre IP-Adresse an OpenStreetMap übermittelt.',
      },
    },
    {
      art: 'absatz',
      text: { de: '[Hinweis für die Prüfung: Die Karte ist in dieser Fassung noch nicht eingebaut. Die Angabe gilt erst mit dem Einbau.]' },
    },
  ],
  browser: [
    { art: 'absatz', text: { de: 'Auf den öffentlichen Seiten setzt die Website keine Cookies.' } },
    {
      art: 'absatz',
      text: {
        de: 'Im Browser merkt sich die Website nur, dass Sie den Konzept-Hinweis bestätigt haben: den Eintrag „igmg-konzepthinweis-gesehen“ im lokalen Speicher mit dem Wert „1“. Er enthält keine personenbezogenen Daten und wird nicht an den Server gesendet.',
      },
    },
    {
      art: 'absatz',
      text: {
        de: 'Der Qibla-Kompass nutzt die Lage- und Bewegungssensoren Ihres Geräts erst, nachdem Sie ihn einschalten. Diese Daten werden auf dem Gerät verarbeitet und nicht an den Server übertragen.',
      },
    },
    {
      art: 'absatz',
      text: {
        de: 'Im Anmeldebereich der Verwaltung, der nur für Berechtigte bestimmt ist, setzt die Website technisch notwendige Cookies für die Anmeldung. Die Anmeldung läuft nach acht Stunden ab.',
      },
    },
    {
      art: 'absatz',
      text: {
        de: '[Hinweis für die Prüfung: Ob und wie der Anmeldebereich der Verwaltung in dieser Erklärung erscheint, ist offen.]',
      },
    },
  ],
  rechte: [
    {
      art: 'absatz',
      text: {
        de: 'Zu Auskunft, Berichtigung und Löschung Ihrer Daten, zur Protokollierung von Zugriffen und zum Export: [Text – Rechtsberatung].',
      },
    },
    { art: 'absatz', text: { de: 'Fragen zum Datenschutz richten Sie an die oben genannte verantwortliche Stelle.' } },
  ],
};

const QUELLE_IMPRESSUM =
  'Blatt S23 (ABSCHNITTE: Gliederung Impressum; G-05, G-08); design/Footer.dc.html:29–31 (Platzhalter statt Beispielwert)';

const QUELLE_DATENSCHUTZ =
  'Blatt S23 (ABSCHNITTE: Gliederung Datenschutz; DATEN: Bestandsfelder je Formular, Schüler-Voranmeldung-Beschriftungen gegengeprüft); ' +
  'Technik: src/lib/validierung/formulare/veranstaltungsanmeldung.ts, src/lib/formulare/verarbeiten.ts, src/lib/krypto/index.ts, ' +
  'src/lib/validierung/ratenbegrenzung.ts, src/lib/validierung/altcha.ts, src/lib/mail/vorlagen/index.tsx, ' +
  'src/components/website/KonzeptHinweis.tsx, src/components/website/gebetszeiten/QiblaKompass.tsx, src/lib/auth/optionen.ts; ' +
  'messages/de.json (veranstaltung.formular.einwilligung)';

/** Seed „rechtliches“ (Welle A): idempotent (onConflictDoNothing), Beispielinhalte mit Quelle, Prüfung gegen die Schemata. */
export const seed: BereichsSeed = async (db) => {
  const zeilen = [
    { bereich: 'impressum', istBeispiel: true, quelle: QUELLE_IMPRESSUM, inhalt: impressumSchema.parse(impressum) },
    { bereich: 'datenschutz', istBeispiel: true, quelle: QUELLE_DATENSCHUTZ, inhalt: datenschutzSchema.parse(datenschutz) },
  ];
  const r = await db
    .insert(schema.seiteninhalt)
    .values(zeilen)
    .onConflictDoNothing({ target: schema.seiteninhalt.bereich })
    .returning({ bereich: schema.seiteninhalt.bereich });
  return r.length;
};
