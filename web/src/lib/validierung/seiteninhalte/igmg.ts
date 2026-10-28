import { z } from 'zod';
import { NETZWERK_SCHLUESSEL } from '../../dachverband/netzwerk';
import { faqEintrag } from '../bloecke';
import { mehrsprachig, mehrsprachigOptional } from '../mehrsprachig';
import { datumIso, mehrsprachigeUrl, verweis } from '../url';

/**
 * Seiteninhalt „igmg“ (Blatt S12, Abschnitt DATEN; Plan Marktstart P1, ADR 0046): redaktionelle Texte, Kennzahlen,
 * Leitbild, Struktur, Zentralkontakt, Verweise und Fragen der IGMG-Seite. Überschriften, Reiter und Bedienelemente stehen
 * in messages/bereiche/igmg.json. Fehlt ein Wert, bleibt ein Platzhalter in eckigen Klammern (G-05); neue Felder sind
 * leer bzw. `null` und werden dann ausgeblendet. Gespeicherte Fassungen aus der Zeit vor P1 parsen weiter (ADR 0019).
 */

/** Art einer Kennzahl: genau („44“), Mindestwert („über 700“) oder gerundet („rund 200.000“). */
export const ZAHL_ARTEN = ['genau', 'ueber', 'rund'] as const;
export type ZahlArt = (typeof ZAHL_ARTEN)[number];

/**
 * Kennzahl: neu als Wert mit Art und optionalem Zusatz („davon 3 im Aufbau“); die Ausgabe formatiert je Sprache
 * (`formatKennzahl`, src/lib/dachverband/kennzahl.ts). Ein Text wie vor P1 („518“, „[Zahl fehlt: …]“) bleibt gültig und
 * erscheint unverändert (Blatt S12, Auffälligkeit 1).
 */
export const kennzahl = z.union([
  z.object({
    wert: z.number().int().min(0).max(1_000_000_000),
    art: z.enum(ZAHL_ARTEN).default('genau'),
    zusatz: mehrsprachigOptional(80).optional(),
  }),
  z.string().trim().max(40),
]);
export type Kennzahl = z.output<typeof kennzahl>;

/** Kennzahl mit Platzhalter als Standard (bestehende Felder). */
const zahl = (bezeichnung: string) => kennzahl.default(`[Zahl fehlt: ${bezeichnung}]`);
/** Neue Kennzahl: ohne Angabe `null` und ausgeblendet. */
const zahlOptional = () => kennzahl.nullable().default(null);

/** Stand der Kennzahlen als Monat JJJJ-MM (Broschüren nennen nur den Monat) oder leer. */
const monat = z.union([z.literal(''), z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/)]);

/** Kontaktwert der Zentralverwaltung, nicht mehrsprachig; bis zur Bestätigung ein Platzhalter (G-05, Laufbuch lb:225–226, lb:250). */
const kontaktWert = (platzhalter: string, max = 200) => z.string().trim().max(max).default(platzhalter);

/** E-Mail der Zentralverwaltung (mailto-Link, wenn gültig): gültige Adresse, leer oder der Platzhalter (G-05). */
const kontaktMail = (platzhalter: string) =>
  z
    .string()
    .trim()
    .pipe(z.union([z.email().max(200), z.literal(''), z.literal(platzhalter)]))
    .default(platzhalter);

/** Fachverein oder Einrichtung im Umfeld der IGMG (Strukturseite): Eigenname, Arbeitsfeld, Adresse nur wenn belegt. */
export const fachverein = z.object({
  name: z.string().trim().min(1).max(120),
  bereich: mehrsprachig(120),
  url: mehrsprachigeUrl.nullable().default(null),
});

/**
 * Verweis unter „Mehr bei der IGMG“: Schlüssel aus dem IGMG-Netzwerk (`netzwerk.ts`; Titel und Kurzbeschreibung kommen
 * gepflegt aus messages/bereiche/dachverband.json, die Adresse je Sprache aus dem Verzeichnis) oder ein eigener Verweis
 * der Redaktion mit Titel und Adresse. Schlüssel bevorzugt: eine Stelle für Linkpflege und Übersetzung.
 */
export const igmgVerweis = z.union([z.enum(NETZWERK_SCHLUESSEL), verweis]);
export type IgmgVerweis = z.output<typeof igmgVerweis>;

/**
 * Seiteninhalt „igmg“. Alle Felder haben Standardwerte, damit eine fehlende Zeile trotzdem rendert (ladeSeiteninhalt).
 * Listen dürfen leer sein; mehrsprachige Texte: Deutsch Pflicht, Türkisch und Englisch mit sichtbarem Rückfall (K-02).
 */
export const schema = z.object({
  ueberblick: z
    .object({
      text: mehrsprachig(2000).default({ de: '[Text fehlt: Überblick]' }),
      auftrag: mehrsprachig(2000).default({ de: '[Text fehlt: Auftrag]' }),
    })
    .default({ text: { de: '[Text fehlt: Überblick]' }, auftrag: { de: '[Text fehlt: Auftrag]' } }),
  zahlen: z
    .object({
      moscheen: zahl('Moscheen'),
      zweigstellen: zahl('Zweigstellen'),
      /** Ohne Beleg leer (ausgeblendet); bleibt für gespeicherte Fassungen erhalten. */
      menschenErreicht: zahl('Menschen erreicht'),
      regionen: zahlOptional(),
      mitglieder: zahlOptional(),
      /** Ehrenamtliche in Leitungsfunktionen (Broschüre: „administrators“, „idareci“). */
      mitwirkende: zahlOptional(),
      /** Region der Gemeinde mit ihrer Zahl an Zweigstellen; der Name ist ein Eigenname („Hessen“). */
      region: z
        .object({ name: z.string().trim().min(1).max(80), zweigstellen: kennzahl })
        .nullable()
        .default(null),
      stand: monat.default(''),
      /** Beleg der Zahlen (sichtbar im Zahlenkasten). */
      quelle: verweis.nullable().default(null),
    })
    .default({
      moscheen: '[Zahl fehlt: Moscheen]',
      zweigstellen: '[Zahl fehlt: Zweigstellen]',
      menschenErreicht: '[Zahl fehlt: Menschen erreicht]',
      regionen: null,
      mitglieder: null,
      mitwirkende: null,
      region: null,
      stand: '',
      quelle: null,
    }),
  /** Kernaussagen aus den Grundsätzen, eigenständig formuliert (ADR 0046); Prüfung durch den Imam (M-101). */
  leitbild: z
    .object({ punkte: z.array(mehrsprachig(400)).max(8).default([]), quelle: igmgVerweis.nullable().default(null) })
    .default({ punkte: [], quelle: null }),
  bedeutung: z.object({ absaetze: z.array(mehrsprachig(2000)).max(6).default([]) }).default({ absaetze: [] }),
  geschichte: z
    .object({
      eintraege: z
        .array(z.object({ label: mehrsprachig(120), text: mehrsprachig(2000) }))
        .max(12)
        .default([]),
    })
    .default({ eintraege: [] }),
  struktur: z
    .object({
      praesidium: mehrsprachig(2000).default({ de: '[Text fehlt: Präsidium]' }),
      /** Erweiterter Vorstand (früher „Ausführungsausschuss“; Schlüssel bleibt für gespeicherte Fassungen). */
      ausschuss: mehrsprachig(2000).default({ de: '[Text fehlt: Erweiterter Vorstand]' }),
      /** Organe laut Satzung; leer ausgeblendet. */
      gremien: mehrsprachigOptional(2000).default({ de: '' }),
      fachvereine: z.array(fachverein).max(16).default([]),
    })
    .default({
      praesidium: { de: '[Text fehlt: Präsidium]' },
      ausschuss: { de: '[Text fehlt: Erweiterter Vorstand]' },
      gremien: { de: '' },
      fachvereine: [],
    }),
  kontakt: z
    .object({
      adresse: kontaktWert('[Adresse]', 300),
      telefon: kontaktWert('[Telefonnummer]', 60),
      email: kontaktMail('[E-Mail]'),
      /** Website; als Link nur, wenn sie eine https-Adresse ist (sonst Text wie im Bestand). */
      website: kontaktWert('[Website]'),
      /** Registergericht und Nummer; leer ausgeblendet. */
      register: kontaktWert('', 120),
    })
    .default({ adresse: '[Adresse]', telefon: '[Telefonnummer]', email: '[E-Mail]', website: '[Website]', register: '' }),
  /** „Mehr bei der IGMG“ unter den Reitern. */
  verweise: z.array(igmgVerweis).max(16).default([]),
  /** Organisatorische Fragen (keine Fiqh-Fragen, ADR 0046 Nr. 5); Ausgabe wie der Baustein „Fragen und Antworten“. */
  faq: z.array(faqEintrag).max(8).default([]),
  /** Tag der letzten Prüfung gegen die Quellen (Quellenzeile unter den Reitern); leer ausgeblendet. */
  stand: z.union([z.literal(''), datumIso]).default(''),
});

export type IgmgInhalt = z.infer<typeof schema>;
