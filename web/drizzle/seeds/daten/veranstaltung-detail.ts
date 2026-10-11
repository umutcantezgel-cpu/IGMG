// Beispiel-Detailseite aus dem Bestand (bestand/src/app/components/EventDetails.tsx:35-68), ADR 0015.
// Personennamen, Adresse und Telefonnummer durch Platzhalter ersetzt; E-Mail als Beispielwert (M-012).
import type { SeedVeranstaltung } from '../typen';

export const BEISPIEL_VERANSTALTUNG_DETAIL: SeedVeranstaltung = {
  slug: 'freitagsgebet-mit-anschliessendem-vortrag',
  titel: { de: 'Freitagsgebet mit anschließendem Vortrag' },
  kurztext: {
    de: 'Nehmen Sie teil an unserem wöchentlichen Freitagsgebet, gefolgt von einem inspirierenden Vortrag über die Bedeutung der Gemeinschaft im Islam.',
  },
  beschreibung: {
    de: [
      'Nehmen Sie teil an unserem wöchentlichen Freitagsgebet, gefolgt von einem inspirierenden Vortrag über die Bedeutung der Gemeinschaft im Islam. Der Vortrag wird sich mit aktuellen gesellschaftlichen Themen befassen und praktische Lösungen aus islamischer Sicht aufzeigen.',
    ],
  },
  kategorie: 'gebet',
  organisation: 'at',
  ort: { de: 'Hauptgebetsraum' },
  beginn: '2024-01-26T13:30',
  ende: '2024-01-26T15:00',
  wiederholung: null,
  empfohlen: false,
  kosten: 'kostenlos',
  anmeldungAktiv: true,
  plaetze: 150,
  programm: [
    { zeit: '13:30', text: { de: 'Ankunft und Vorbereitung' } },
    { zeit: '13:45', text: { de: 'Freitagsgebet (Juma)' } },
    { zeit: '14:15', text: { de: "Vortrag: 'Gemeinschaft stärken'" } },
    { zeit: '14:45', text: { de: 'Fragen & Diskussion' } },
    { zeit: '15:00', text: { de: 'Gemeinsames Beisammensein' } },
  ],
  hinweise: [
    { de: 'Angemessene Kleidung erforderlich' },
    { de: 'Pünktliches Erscheinen erwünscht' },
    { de: 'Handys bitte stumm schalten' },
  ],
  schlagwoerter: [{ de: 'Freitagsgebet' }, { de: 'Vortrag' }, { de: 'Gemeinschaft' }, { de: 'Islam' }],
  veranstalter: { name: '[Name – Imam, Veranstalter]' },
  kontakt: { name: '[Name – Kontakt Veranstaltung]', telefon: '[Telefonnummer]', email: 'events@igmg-wetzlar.de' },
  quelle: 'bestand/src/app/components/EventDetails.tsx:35-68',
};
