import { z } from 'zod';
import { NETZWERK_SCHLUESSEL } from '../../dachverband/netzwerk';
import { faqEintrag } from '../bloecke';
import { mehrsprachig, mehrsprachigOptional } from '../mehrsprachig';
import { datumIso, igmgUrl, youtubeId } from '../url';

/**
 * Seiteninhalt „hadsch-umra“ (Plan Marktstart P4, E-044, ADR 0046): Seite „Hadsch & Umra“ der Gemeinde. Gereist wird mit
 * IGMG Reisen (Hadsch-Umra Reisen GmbH der IGMG); die Seite sammelt Fristen, Programme, Abflüge ab Frankfurt/Hessen, den
 * Weg zur Anmeldung, Unterlagen, Videos (erst nach Klick, K-14) und organisatorische Fragen. Überschriften und
 * Bedienelemente stehen in messages/bereiche/hadsch-umra.json.
 *
 * Regeln:
 * - Links nur zum IGMG-Netzwerk: ein Schlüssel aus `netzwerk.ts` (gepflegte Adressen je Sprache) oder eine eigene Adresse
 *   mit Host aus der Positivliste (`igmgUrl`) – keine Drittseiten, keine Bilder.
 * - Programme haben bewusst kein Preisfeld: Preise legt IGMG Reisen fest und ändert sie; die Seite verweist dorthin.
 * - Anmeldung ohne Telefonnummer der Regionalstelle (G-04: keine Mobilnummern aus dem Crawl); die Ansprechperson der
 *   Gemeinde bleibt ein Platzhalter, bis die Gemeinde sie nennt (G-05, M-104).
 * - Fragen nur organisatorisch (kein Fiqh, ADR 0030 Nr. 4); religiöse Erklärung über das Wissensthema `hajj-umrah`.
 * - Hinweise verschwinden nach ihrem Tag `bis`, Abflüge nach dem Abflugtag (`lib/hadsch-umra/auswahl.ts`).
 * Alle Felder haben gültige Standardwerte (`parse({})`, tests/unit/seiteninhalte-grenzen.test.ts).
 */

/** Sprachen einer Zielseite (Seite nur auf Türkisch: Hinweis „(auf Türkisch)“ in jeder anderen Sprache). */
export const ZIEL_SPRACHEN = ['de', 'tr', 'en'] as const;

/**
 * Linkziel: Schlüssel aus dem IGMG-Netzwerk oder eigene Adressen beim Dachverband bzw. IGMG Reisen. `seitenSprache` nennt
 * die Sprache der Hauptadresse, wenn sie nicht Deutsch ist (z. B. die Kulturreisen nur auf Türkisch).
 */
export const hadschUmraZiel = z.union([
  z.enum(NETZWERK_SCHLUESSEL),
  z.object({
    de: igmgUrl,
    tr: igmgUrl.optional(),
    en: igmgUrl.optional(),
    seitenSprache: z.enum(ZIEL_SPRACHEN).optional(),
  }),
]);
export type HadschUmraZiel = z.output<typeof hadschUmraZiel>;

/** Arten der Programme und Abflüge; Bezeichnungen unter `hadschUmra.arten`. */
export const PROGRAMM_ARTEN = ['hadsch', 'umra', 'kultur'] as const;
export const ABFLUG_ARTEN = ['hadsch', 'umra'] as const;
export type AbflugArt = (typeof ABFLUG_ARTEN)[number];

/**
 * Sprache einer Unterlage: Deutsch, Türkisch, zweisprachig Deutsch/Türkisch, Englisch oder in mehreren Sprachen (eine
 * Seite mit Fassungen zum Herunterladen, z. B. der Umra-Begleiter auf Deutsch, Türkisch, Englisch und Französisch).
 */
export const UNTERLAGEN_SPRACHEN = ['de', 'tr', 'de-tr', 'en', 'mehrsprachig'] as const;

/** Flughafen als IATA-Code (drei Großbuchstaben), mehrere mit Schrägstrich („DUS/FRA“). */
const FLUGHAFEN = /^[A-Z]{3}(\/[A-Z]{3}){0,2}$/;
const flughafen = z.string().trim().regex(FLUGHAFEN);

/** Jahr oder Jahresangabe der Quelle (z. B. „2016“). */
const jahr = z
  .string()
  .trim()
  .regex(/^\d{4}$/);

export const HINWEISE_MAX = 6;
export const PROGRAMME_MAX = 12;
export const ABFLUEGE_MAX = 24;
export const UNTERLAGEN_MAX = 12;
export const VIDEOS_MAX = 12;
export const FAQ_MAX = 10;

/** Frist oder kurzer Hinweis; nach dem Tag `bis` (inklusive) blendet die Seite ihn aus. */
export const hinweis = z.object({ text: mehrsprachig(400), bis: datumIso, link: hadschUmraZiel.optional() });

/** Reiseprogramm bei IGMG Reisen – ohne Preisfeld. */
export const programm = z.object({
  art: z.enum(PROGRAMM_ARTEN),
  titel: mehrsprachig(160),
  text: mehrsprachigOptional(500).optional(),
  link: hadschUmraZiel,
});

/** Abflug einer Gruppe: Gruppe, Abflug- und Zielflughafen (IATA, falls belegt), Hin- und Rückflug. */
export const abflug = z
  .object({
    art: z.enum(ABFLUG_ARTEN),
    gruppe: mehrsprachig(120),
    abflughafen: flughafen.optional(),
    zielflughafen: flughafen.optional(),
    hin: datumIso,
    rueck: datumIso,
  })
  .refine((a) => a.rueck >= a.hin, { path: ['rueck'], message: 'rueckVorHin' });

export const unterlage = z.object({
  titel: mehrsprachig(160),
  url: hadschUmraZiel,
  sprache: z.enum(UNTERLAGEN_SPRACHEN),
  jahr: jahr.optional(),
});

export const video = z.object({ youtubeId, titel: mehrsprachig(160), jahr: jahr.optional() });

const EINLEITUNG = '[Text fehlt: Einleitung Hadsch & Umra]';
const ANMELDUNG = '[Text fehlt: Anmeldung]';

export const schema = z.object({
  einleitung: mehrsprachig(1200).default({ de: EINLEITUNG }),
  hinweise: z.array(hinweis).max(HINWEISE_MAX).default([]),
  programme: z.array(programm).max(PROGRAMME_MAX).default([]),
  abfluege: z
    .object({
      /** Tag, an dem die Termine gegen die Quelle geprüft wurden. */
      stand: datumIso.optional(),
      /** Seiten bei IGMG Reisen, aus denen die Termine stammen (Quellenangabe unter der Tabelle). */
      quellen: z.array(hadschUmraZiel).max(4).default([]),
      eintraege: z.array(abflug).max(ABFLUEGE_MAX).default([]),
    })
    .default({ quellen: [], eintraege: [] }),
  anmeldung: z.object({ text: mehrsprachig(1000), stelle: hadschUmraZiel.optional() }).default({ text: { de: ANMELDUNG } }),
  ansprechperson: z
    .object({
      name: z.string().trim().min(1).max(120).default('[Ansprechperson Hadsch & Umra – von der Gemeinde]'),
      telefon: z.string().trim().min(1).max(60).default('[Telefonnummer]'),
      sprechzeit: mehrsprachigOptional(200).optional(),
    })
    .default({ name: '[Ansprechperson Hadsch & Umra – von der Gemeinde]', telefon: '[Telefonnummer]' }),
  unterlagen: z.array(unterlage).max(UNTERLAGEN_MAX).default([]),
  videos: z.array(video).max(VIDEOS_MAX).default([]),
  /** Organisatorische Fragen (Anmeldung, Fristen, Abflug, Unterlagen); Ausgabe wie der Baustein „Fragen und Antworten“. */
  faq: z.array(faqEintrag).max(FAQ_MAX).default([]),
  /** Tag der letzten Prüfung gegen die Quellen (Quellenzeile am Seitenende); leer ausgeblendet. */
  stand: z.union([z.literal(''), datumIso]).default(''),
});

export type HadschUmraInhalt = z.infer<typeof schema>;
export type Abflug = HadschUmraInhalt['abfluege']['eintraege'][number];
export type Hinweis = HadschUmraInhalt['hinweise'][number];
