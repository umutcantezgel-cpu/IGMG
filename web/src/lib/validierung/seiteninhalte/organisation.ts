import { z } from 'zod';
import { mehrsprachig } from '../mehrsprachig';

/**
 * Symbole der Aktivitätskarten (design/OrganizationPage.dc.html Z.100/108/116/124). Die Zuordnung zu Lucide-Icons
 * steht in src/components/website/organisation/stil.ts, damit diese Validierung ohne Oberflächen-Code auskommt.
 */
export const AKTIVITAET_SYMBOLE = ['heart', 'book-open', 'users', 'graduation-cap', 'pencil', 'target', 'monitor', 'star'] as const;
export type AktivitaetSymbol = (typeof AKTIVITAET_SYMBOLE)[number];

/** E-Mail der Organisation (mailto-Link, wenn gültig): gültige Adresse, leer oder der Platzhalter (G-05). */
const kontaktMail = (platzhalter: string) =>
  z
    .string()
    .trim()
    .pipe(z.union([z.email().max(200), z.literal(''), z.literal(platzhalter)]))
    .default(platzhalter);

/**
 * Seiteninhalt „organisation“ (Blatt C11): je Organisation ein Datensatz im Bereich `organisation-<slug>`
 * (Registry seiteninhalte.ts). Fehlt ein Feld, bleibt ein Platzhalter in eckigen Klammern (G-05).
 * Mehrsprachig: Deutsch Pflicht, Türkisch und Englisch mit sichtbarem Rückfall auf Deutsch (K-02).
 * Titel, Untertitel, Über-Titel und Bezeichnungen sind feste Texte im Namensraum `organisation` (messages/bereiche).
 */
export const schema = z.object({
  /** Über-Text „Über die …“ (about.description, D Z.97/105/113/121) */
  beschreibung: mehrsprachig(1200).default({ de: '[Beschreibung]' }),
  /** Missionstext (about.missionText, D Z.98/106/114/122) */
  mission: mehrsprachig(600).default({ de: '[Missionstext]' }),
  /** Vision (about.visionText, D Z.99/107/115/123) */
  vision: mehrsprachig(600).default({ de: '[Visionstext]' }),
  /** Aktivitäten als Karten: Symbol, Titel und Text (D Z.100/108/116/124) */
  aktivitaeten: z
    .array(
      z.object({
        symbol: z.enum(AKTIVITAET_SYMBOLE).default('star'),
        titel: mehrsprachig(120),
        text: mehrsprachig(400),
      }),
    )
    .max(8)
    .default([]),
  /** Öffnungszeiten als Zeilen (D Z.103/111/119/127; im Bestand nur Deutsch, tr und en mit Rückfall) */
  oeffnungszeiten: z.array(mehrsprachig(120)).max(10).default([]),
  /** Kontakt-Platzhalter (D Z.74–76): gelten bis zur Bestätigung durch die Gemeinde */
  kontakt: z
    .object({
      adresse: z.string().trim().max(300).default('[Adresse]'),
      telefon: z.string().trim().max(60).default('[Telefonnummer]'),
      email: kontaktMail('[E-Mail]'),
    })
    .default({ adresse: '[Adresse]', telefon: '[Telefonnummer]', email: '[E-Mail]' }),
});

export type OrganisationInhalt = z.infer<typeof schema>;
