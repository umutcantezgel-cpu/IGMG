import { z } from 'zod';
import { schema as dachverband } from './seiteninhalte/dachverband';
import { schema as datenschutz } from './seiteninhalte/datenschutz';
import { schema as igmg } from './seiteninhalte/igmg';
import { schema as impressum } from './seiteninhalte/impressum';
import { schema as organisation } from './seiteninhalte/organisation';
import { schema as projekte } from './seiteninhalte/projekte';
import { schema as ueberUns } from './seiteninhalte/ueber-uns';
import { schema as vorstand } from './seiteninhalte/vorstand';

import { mehrsprachig } from './mehrsprachig';
import { HTTPS_URL } from './url';

/** Externe Adresse (nur https mit Host); liegt in `./url`, damit die Schemas unter `seiteninhalte/` sie ohne Zyklus nutzen. */
export { HTTPS_URL } from './url';

export { mehrsprachig, mehrsprachigOptional } from './mehrsprachig';

/** Uhrzeit HH:MM (00:00–23:59) oder leer, wenn keine Angabe. */
const uhrzeit = z.union([z.literal(''), z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/)]);

/** Kontaktdaten (Seiteninhalte › Kontaktdaten): Footer, Kontaktseite, JSON-LD. Platzhalter nach G-05. */
export const kontaktInhalt = z.object({
  adresse: z.string().trim().max(300).default('[Adresse]'),
  telefon: z.string().trim().max(60).default('[Telefonnummer]'),
  notfallTelefon: z.string().trim().max(60).default('[Telefonnummer Notfall]'),
  /** Gültige E-Mail-Adresse (Fußzeile, Kontaktseite, mailto-Link); Standardwert unten. */
  email: z.string().trim().pipe(z.email().max(200)).default('info@igmg-wetzlar.de'),
  /** Öffnungszeiten als Zeilen (z. B. „Mo.–Fr.“ → „09:00–22:00 Uhr“), höchstens 14. */
  oeffnungszeiten: z
    .array(
      z.object({
        tage: mehrsprachig(60),
        zeiten: z.string().trim().max(60),
        /** Wochentage 0 (So) bis 6 (Sa), höchstens 7 Einträge. */
        von: z.array(z.number().int().min(0).max(6)).max(7).default([]),
        start: uhrzeit.default(''),
        ende: uhrzeit.default(''),
      }),
    )
    .max(14)
    .default([]),
  // Nur https: z.url() allein akzeptiert javascript:/data: (gespeicherte XSS, Tor A SP-A-04)
  social: z.object({ facebook: HTTPS_URL.optional(), instagram: HTTPS_URL.optional(), youtube: HTTPS_URL.optional() }).default({}),
  /** Koordinaten der Moschee (für Qibla/Gebetszeiten und Karte nach Klick); leer bis zur Bestätigung (M-010). */
  koordinaten: z.object({ breite: z.number().min(-90).max(90), laenge: z.number().min(-180).max(180) }).optional(),
  /** Webadresse wie im Design (Contact.dc.html:32); nur Text, kein Link. */
  website: z.string().trim().max(200).default('www.igmg-wetzlar.de'),
  /** Anfahrtstexte je Verkehrsmittel (Contact.dc.html:79–81); die Überschriften stehen in messages/bereiche/kontakt.json. */
  anfahrtOeffentlich: mehrsprachig(300).default({
    de: 'Bushaltestelle [Haltestelle] (Linien [Linien])',
    tr: 'Otobüs durağı [Durak] ([Hatlar])',
    en: 'Bus stop [Stop] (lines [Lines])',
  }),
  anfahrtAuto: mehrsprachig(300).default({
    de: 'Kostenlose Parkplätze vorhanden',
    tr: 'Ücretsiz park yeri mevcuttur',
    en: 'Free parking available',
  }),
  anfahrtFuss: mehrsprachig(300).default({
    de: '5 Minuten vom Wetzlarer Hauptbahnhof',
    tr: 'Wetzlar ana istasyonundan 5 dakika',
    en: '5 minutes from Wetzlar main station',
  }),
  /** Angebote der Moschee (Contact.dc.html:83), acht Einträge in Designreihenfolge. */
  angebote: z
    .array(mehrsprachig(200))
    .max(20)
    .default([
      { de: 'Fünf tägliche Gebete', tr: 'Beş vakit namaz', en: 'Five daily prayers' },
      { de: 'Freitagsgebet mit Khutba', tr: 'Hutbeli Cuma namazı', en: 'Friday prayer with Khutbah' },
      { de: 'Korankurse für alle Altersgruppen', tr: 'Her yaş için Kuran kursları', en: 'Quran courses for all ages' },
      { de: 'Islamunterricht', tr: 'Din dersleri', en: 'Islamic education' },
      { de: 'Hochzeiten und religiöse Zeremonien', tr: 'Nikah ve dini törenler', en: 'Weddings and religious ceremonies' },
      { de: 'Beratung und Seelsorge', tr: 'Danışmanlık ve manevi rehberlik', en: 'Counseling and spiritual guidance' },
      { de: 'Jugend- und Frauenorganisationen', tr: 'Gençlik ve kadın teşkilatları', en: 'Youth and women organizations' },
      { de: 'Kulturelle Veranstaltungen', tr: 'Kültürel etkinlikler', en: 'Cultural events' },
    ]),
  /** Besuchstext (Contact.dc.html:65; tr/en Bestand Contact.tsx:132, 188). */
  besuchstext: mehrsprachig(500).default({
    de: 'Alle Menschen sind herzlich eingeladen, unsere Moschee zu besuchen. Führungen sind nach Vereinbarung möglich.',
    tr: 'Tüm insanlar camiamizi ziyaret etmeye davetlidir. Rehberli turlar randevu ile mümkündür.',
    en: 'All people are cordially invited to visit our mosque. Guided tours are available by appointment.',
  }),
  /** Einleitung des Notfallkontakts (Contact.dc.html:45; tr/en Bestand Contact.tsx:127, 183). */
  notfalltext: mehrsprachig(300).default({
    de: 'Bei dringenden Angelegenheiten außerhalb der Bürozeiten:',
    tr: 'Ofis saatleri dışında acil durumlar için:',
    en: 'For urgent matters outside office hours:',
  }),
});
export type KontaktInhalt = z.infer<typeof kontaktInhalt>;

/**
 * Seiteninhalte je Bereich (Tabelle `seiteninhalt`, Schlüssel `bereich`). Je Bereich eine Schemadatei unter
 * `./seiteninhalte/` (E-027), damit Pakete parallel arbeiten. Die vier Organisationen teilen ein Schema.
 */
export const SEITENINHALT = {
  kontakt: kontaktInhalt,
  'ueber-uns': ueberUns,
  vorstand,
  projekte,
  igmg,
  'organisation-ana-teskilati': organisation,
  'organisation-kadin-teskilati': organisation,
  'organisation-genclik-teskilati': organisation,
  'organisation-kadin-genclik-teskilati': organisation,
  impressum,
  datenschutz,
  // Plan Marktstart P3: Einträge „Aus dem Dachverband“ (Freitagspredigt und Gemeinschaftsthemen, E-044 Nr. 2)
  dachverband,
} as const;
export type SeitenBereich = keyof typeof SEITENINHALT;
