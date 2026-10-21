import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';
import type { JSONContent } from '@tiptap/core';
import { user } from './auth';
import { medium } from './medien';

/**
 * Lern-App – Inhalte (ADR 0039, ADR 0040, ADR 0041; PLAN §3.9). Migration 0018.
 *
 * - **Schlüssel** sind stabil und sprechend (`ar.a1.e03`, `ar.a1.e03.l02`, `ar.a1.e03.s0042`) und überleben jeden Import;
 *   die UUID ist nur der interne Bezug. Der Import (L1-05) gleicht über den Schlüssel ab.
 * - **inhaltHash** = SHA-256 des kanonischen JSON eines Bausteins (`web/src/lib/lernapp/paket/hash.ts`). Prüfungen und
 *   Freigaben gelten genau einem Hash; jede Änderung setzt sie zurück (KERN 4.0 §2.3).
 * - **Sichtbarkeit** entscheiden die reinen Regeln in `web/src/lib/lernapp/freigabe.ts` aus Status, Prüfungen und
 *   Kennzeichen `religionsbezug` – nie eine Spalte allein.
 * - **Herkunft:** `quelle` (`ki:<lauf>/<modell>/<promptVersion>`, `tatoeba:<id>`, `redaktion`), `lizenz`, `namensnennung`
 *   (ADR 0045); `verfasstVon` (KI-Lauf oder Konto der Redaktion) schließt die Person von der Freigabe aus (ADR 0040 Nr. 5);
 *   `menschlichGeprueft` friert von Menschen korrigierte Einträge gegen KI-Importe ein (ADR 0040 Nr. 7, ADR 0041 Nr. 6).
 * - Werte der Enums stehen zusätzlich in `web/src/lib/lernapp/kurse.ts` (Unit-Test prüft Gleichheit); andere Pakete
 *   importieren Sprachen, Kurse, Richtungen und Stufen nur von dort.
 */

/** Text der Lern-App in den Oberflächen- bzw. Ausgangssprachen (PLAN Befund 16; die Website kennt de/tr/en). */
export type LernText = Partial<Record<'de' | 'tr' | 'ar', string>>;

/** Sprachen der Lern-App: Ziel-, Ausgangs- und Oberflächensprachen (L3-E08). */
export const lernappSpracheEnum = pgEnum('lernapp_sprache', ['de', 'tr', 'ar']);
/** Kursarten: Sprachkurs (Zielsprache), Wissen (`islam`, nur Deutsch), Koran-Arabisch (`koran`). */
export const lernappKursArtEnum = pgEnum('lernapp_kurs_art', ['sprache', 'wissen', 'koran']);
/** Stufen: GER-Niveaus der Sprachkurse (L3-E04) bzw. eigene Stufen für Wissen und Koran-Arabisch. */
export const lernappStufeEnum = pgEnum('lernapp_stufe', ['a1', 'a2', 'b1', 'b2', 'c1', 'grund', 'aufbau', 'vertiefung']);
/**
 * Stand eines Bausteins (ADR 0041 Nr. 2): `entwurf` (nur Vorschau der Verwaltung) → `automatisch_geprueft` (öffentlich mit
 * Hinweis, Schalter `lernapp_ungeprueft`) → `veroeffentlicht` (Stichprobe bestanden). `gesperrt`: zurückgezogen oder nach
 * einer Meldung gesperrt (ADR 0041 Nr. 9, KERN §2.3 „Zurückziehen wirkt sofort“) – nie sichtbar. Für Wissen und Einträge mit
 * Religionsbezug entscheiden zusätzlich die zwei Freigaben (ADR 0040 Nr. 5).
 */
export const lernappStatusEnum = pgEnum('lernapp_status', ['entwurf', 'automatisch_geprueft', 'veroeffentlicht', 'gesperrt']);
export const lernappLektionArtEnum = pgEnum('lernapp_lektion_art', [
  'lektion',
  'geschichte',
  'wiederholung',
  'pruefstein',
  'schrift',
  'schreiben',
  'sprechen',
]);
export const lernappTextArtEnum = pgEnum('lernapp_text_art', ['dialog', 'geschichte', 'lesetext']);

/** Gemeinsame Spalten der prüfbaren Bausteine. */
const bausteinSpalten = () => ({
  /** SHA-256 des kanonischen JSON (hex, 64 Zeichen). */
  inhaltHash: text().notNull(),
  status: lernappStatusEnum().notNull().default('entwurf'),
  /** KI-Lauf (`ki:<lauf>`) oder Konto der Redaktion, das den aktuellen Stand verfasst hat (ADR 0040 Nr. 5). */
  verfasstVon: text(),
  /** Von Menschen korrigiert: Ein KI-Import überschreibt nicht, sondern legt einen Konflikt an (ADR 0040 Nr. 7). */
  menschlichGeprueft: boolean().notNull().default(false),
  erstelltAm: timestamp({ withTimezone: true }).notNull().defaultNow(),
  aktualisiertAm: timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

/** Herkunft und Lizenz je Eintrag (ADR 0045; ohne beides blockiert `pnpm lernapp:pruefen`). */
const herkunftSpalten = () => ({
  quelle: text().notNull(),
  lizenz: text().notNull(),
  namensnennung: text(),
});

/** Kurse: Zielsprachen `de`, `tr`, `ar`, Wissen `islam`, Koran-Arabisch `koran`. `version` steigt mit jeder Veröffentlichung. */
export const lernappKurs = pgTable('lernapp_kurs', {
  id: text().primaryKey(),
  art: lernappKursArtEnum().notNull(),
  /** Sprache des Inhalts: Zielsprache des Sprachkurses; Wissen `de`, Koran-Arabisch `ar`. */
  zielsprache: lernappSpracheEnum().notNull(),
  titel: jsonb().$type<LernText>().notNull().default({}),
  version: integer().notNull().default(1),
  aktiv: boolean().notNull().default(false),
  aktualisiertAm: timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

/** Richtungen der Sprachkurse (`tr-aus-de` …): Zielsprache des Kurses aus einer Ausgangssprache. */
export const lernappRichtung = pgTable(
  'lernapp_richtung',
  {
    id: text().primaryKey(),
    kursId: text()
      .notNull()
      .references(() => lernappKurs.id, { onDelete: 'cascade' }),
    ausgangssprache: lernappSpracheEnum().notNull(),
    titel: jsonb().$type<LernText>().notNull().default({}),
    aktiv: boolean().notNull().default(false),
  },
  (t) => [unique('lernapp_richtung_eindeutig').on(t.kursId, t.ausgangssprache)],
);

/** Abschnitt je Kurs und Stufe; „Ich kann …“-Beschreibungen in eigenen Worten (L0-E19). */
export const lernappAbschnitt = pgTable(
  'lernapp_abschnitt',
  {
    id: uuid().primaryKey().defaultRandom(),
    kursId: text()
      .notNull()
      .references(() => lernappKurs.id, { onDelete: 'cascade' }),
    stufe: lernappStufeEnum().notNull(),
    reihenfolge: smallint().notNull(),
    titel: jsonb().$type<LernText>().notNull().default({}),
    kannBeschreibungen: jsonb().$type<LernText[]>().notNull().default([]),
  },
  (t) => [unique('lernapp_abschnitt_eindeutig').on(t.kursId, t.stufe)],
);

/** Einheit (Station am Lernweg). `nurFuerAusgang`: nur für eine Ausgangssprache (z. B. Schrift-Vorkurs). */
export const lernappEinheit = pgTable(
  'lernapp_einheit',
  {
    id: uuid().primaryKey().defaultRandom(),
    abschnittId: uuid()
      .notNull()
      .references(() => lernappAbschnitt.id, { onDelete: 'cascade' }),
    schluessel: text().notNull().unique(),
    reihenfolge: smallint().notNull(),
    thema: jsonb().$type<LernText>().notNull().default({}),
    kannBeschreibungen: jsonb().$type<LernText[]>().notNull().default([]),
    /** Lucide-Name oder Symbolpfad aus `web/inhalte/lernapp/symbole/`. */
    symbol: text(),
    nurFuerAusgang: lernappSpracheEnum(),
    ...bausteinSpalten(),
  },
  (t) => [index('lernapp_einheit_abschnitt_idx').on(t.abschnittId, t.reihenfolge)],
);

/** Lektion einer Einheit. `kinderGeeignet` je Lektion (Wissen, O-9/LM-17). */
export const lernappLektion = pgTable(
  'lernapp_lektion',
  {
    id: uuid().primaryKey().defaultRandom(),
    einheitId: uuid()
      .notNull()
      .references(() => lernappEinheit.id, { onDelete: 'cascade' }),
    schluessel: text().notNull().unique(),
    art: lernappLektionArtEnum().notNull().default('lektion'),
    reihenfolge: smallint().notNull(),
    ziel: jsonb().$type<LernText>().notNull().default({}),
    kinderGeeignet: boolean().notNull().default(true),
    ...bausteinSpalten(),
  },
  (t) => [index('lernapp_lektion_einheit_idx').on(t.einheitId, t.reihenfolge)],
);

/**
 * Aufgabe einer Lektion. `typ` nach PLAN §4 (z. B. `auswahl`, `wortbank`, `paare`, `wahr_falsch`, `koran_wort`); `daten` ist
 * die Zod-Union aus `web/src/lib/lernapp/aufgaben/schema.ts` (L1-04/L2). Quizfragen des Wissenskurses beziehen sich auf eine
 * Aussage (`aussageId`) und brauchen selbst zwei Freigaben (ADR 0040 Nr. 2).
 */
export const lernappAufgabe = pgTable(
  'lernapp_aufgabe',
  {
    id: uuid().primaryKey().defaultRandom(),
    lektionId: uuid()
      .notNull()
      .references(() => lernappLektion.id, { onDelete: 'cascade' }),
    schluessel: text().notNull().unique(),
    typ: text().notNull(),
    daten: jsonb().$type<Record<string, unknown>>().notNull(),
    reihenfolge: smallint().notNull(),
    aussageId: uuid().references(() => lernappAussage.id, { onDelete: 'cascade' }),
    religionsbezug: boolean().notNull().default(false),
    quelle: text(),
    ...bausteinSpalten(),
  },
  (t) => [index('lernapp_aufgabe_lektion_idx').on(t.lektionId, t.reihenfolge), index('lernapp_aufgabe_aussage_idx').on(t.aussageId)],
);

/** Lemma je Zielsprache (Wortschatz). */
export const lernappLemma = pgTable(
  'lernapp_lemma',
  {
    id: uuid().primaryKey().defaultRandom(),
    kursId: text()
      .notNull()
      .references(() => lernappKurs.id, { onDelete: 'cascade' }),
    schluessel: text().notNull().unique(),
    lemma: text().notNull(),
    wortart: text(),
    merkmale: jsonb().$type<Record<string, string>>().notNull().default({}),
    formen: jsonb().$type<Record<string, string>>().notNull().default({}),
    stufe: lernappStufeEnum().notNull(),
    frequenzRang: integer(),
    symbol: text(),
    /** Religiöse Formel oder Begriff: zwei religiöse Freigaben, keine Sprachausgabe (KERN 4.0 §2.3, §3). */
    religionsbezug: boolean().notNull().default(false),
    ...herkunftSpalten(),
    ...bausteinSpalten(),
  },
  (t) => [index('lernapp_lemma_kurs_stufe_idx').on(t.kursId, t.stufe), index('lernapp_lemma_kurs_lemma_idx').on(t.kursId, t.lemma)],
);

/** Satz je Zielsprache (Schlüssel z. B. `ar.a1.e03.s0042`). `tokens` für Wortbank und Abgleich. */
export const lernappSatz = pgTable(
  'lernapp_satz',
  {
    id: uuid().primaryKey().defaultRandom(),
    kursId: text()
      .notNull()
      .references(() => lernappKurs.id, { onDelete: 'cascade' }),
    einheitId: uuid().references(() => lernappEinheit.id, { onDelete: 'set null' }),
    schluessel: text().notNull().unique(),
    text: text().notNull(),
    tokens: jsonb().$type<string[]>().notNull().default([]),
    stufe: lernappStufeEnum().notNull(),
    religionsbezug: boolean().notNull().default(false),
    ...herkunftSpalten(),
    ...bausteinSpalten(),
  },
  (t) => [index('lernapp_satz_kurs_stufe_idx').on(t.kursId, t.stufe), index('lernapp_satz_einheit_idx').on(t.einheitId)],
);

/**
 * Übersetzung eines Lemmas (Glosse) oder Satzes in eine Ausgangssprache – je Richtung genau eine, mit angenommenen
 * Alternativen. Genau einer der Bezüge ist gesetzt.
 */
export const lernappUebersetzung = pgTable(
  'lernapp_uebersetzung',
  {
    id: uuid().primaryKey().defaultRandom(),
    lemmaId: uuid().references(() => lernappLemma.id, { onDelete: 'cascade' }),
    satzId: uuid().references(() => lernappSatz.id, { onDelete: 'cascade' }),
    sprache: lernappSpracheEnum().notNull(),
    text: text().notNull(),
    alternativen: jsonb().$type<string[]>().notNull().default([]),
    religionsbezug: boolean().notNull().default(false),
    ...herkunftSpalten(),
    ...bausteinSpalten(),
  },
  (t) => [
    unique('lernapp_uebersetzung_eindeutig').on(t.lemmaId, t.satzId, t.sprache).nullsNotDistinct(),
    index('lernapp_uebersetzung_satz_idx').on(t.satzId),
    check('lernapp_uebersetzung_ein_bezug', sql`num_nonnulls(${t.lemmaId}, ${t.satzId}) = 1`),
  ],
);

/** Grammatik- und kontrastive Tipps je Einheit und Ausgangssprache (Tiptap-JSON, ADR 0006). */
export const lernappTipp = pgTable(
  'lernapp_tipp',
  {
    id: uuid().primaryKey().defaultRandom(),
    einheitId: uuid()
      .notNull()
      .references(() => lernappEinheit.id, { onDelete: 'cascade' }),
    schluessel: text().notNull().unique(),
    ausgangssprache: lernappSpracheEnum().notNull(),
    reihenfolge: smallint().notNull().default(0),
    titel: text(),
    inhalt: jsonb().$type<JSONContent>().notNull(),
    religionsbezug: boolean().notNull().default(false),
    quelle: text(),
    ...bausteinSpalten(),
  },
  (t) => [index('lernapp_tipp_einheit_idx').on(t.einheitId, t.ausgangssprache)],
);

export type LernappTextZeile = { sprecher: string | null; satzId: string };
export type LernappTextFrage = { aufgabeSchluessel: string; nachZeile: number };

/** Dialog, Geschichte, Lesetext: Zeilen verweisen auf Sätze, Fragen auf Aufgaben. */
export const lernappText = pgTable(
  'lernapp_text',
  {
    id: uuid().primaryKey().defaultRandom(),
    einheitId: uuid()
      .notNull()
      .references(() => lernappEinheit.id, { onDelete: 'cascade' }),
    lektionId: uuid().references(() => lernappLektion.id, { onDelete: 'set null' }),
    schluessel: text().notNull().unique(),
    art: lernappTextArtEnum().notNull(),
    titel: jsonb().$type<LernText>().notNull().default({}),
    zeilen: jsonb().$type<LernappTextZeile[]>().notNull().default([]),
    fragen: jsonb().$type<LernappTextFrage[]>().notNull().default([]),
    religionsbezug: boolean().notNull().default(false),
    quelle: text(),
    ...bausteinSpalten(),
  },
  (t) => [index('lernapp_text_einheit_idx').on(t.einheitId)],
);

/**
 * Aussage des Wissenskurses (nur Deutsch, eigene Worte, KERN 4.0 §2.1 Nr. 2). `meinung`: Meinung innerhalb der Schule, nur
 * wenn die Quelle sie nennt (z. B. `abu_yusuf`, `muhammad`, `fatwa`); `strittig` weist das Thema als strittig aus.
 * Sichtbar erst mit zwei Freigaben zum aktuellen Hash und mindestens einem am Original geprüften Beleg (ADR 0040 Nr. 4/5).
 */
export const lernappAussage = pgTable(
  'lernapp_aussage',
  {
    id: uuid().primaryKey().defaultRandom(),
    lektionId: uuid()
      .notNull()
      .references(() => lernappLektion.id, { onDelete: 'cascade' }),
    schluessel: text().notNull().unique(),
    text: text().notNull(),
    reihenfolge: smallint().notNull(),
    meinung: text(),
    strittig: boolean().notNull().default(false),
    kinderGeeignet: boolean().notNull().default(true),
    quelle: text(),
    ...bausteinSpalten(),
  },
  (t) => [index('lernapp_aussage_lektion_idx').on(t.lektionId, t.reihenfolge)],
);

export const lernappQuelleArtEnum = pgEnum('lernapp_quelle_art', ['fiqh', 'aqida', 'ilmihal', 'offene_daten']);

/**
 * Quellenregister (ADR 0045 Nr. 12): nur Metadaten. OpenITI-Texte liegen nie im Repository und nie hier – `sha256` ist die
 * Prüfsumme der lokalen Arbeitskopie. `nurVerweis`: nur Seitenverweis für Menschen (İlmihal, LM-05).
 */
export const lernappQuelle = pgTable('lernapp_quelle', {
  id: uuid().primaryKey().defaultRandom(),
  kurz: text().notNull().unique(),
  werk: text().notNull(),
  autor: text(),
  todesjahr: smallint(),
  ausgabe: text(),
  art: lernappQuelleArtEnum().notNull(),
  openitiUri: text(),
  sha256: text(),
  lizenz: text(),
  nurVerweis: boolean().notNull().default(false),
  aktualisiertAm: timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const lernappBelegArtEnum = pgEnum('lernapp_beleg_art', ['sinngemaess', 'woertlich']);
export type LernappStelle = { kitab?: string; bab?: string; fasl?: string; band?: string; seite?: string };

/**
 * Beleg einer Aussage oder eines Tipps (ADR 0040 Nr. 4). KI-Aussagen sind immer `sinngemaess`; `woertlich` nur für Stellen,
 * die Menschen übersetzt haben. `zitatVon`/`zitatBis`: Zeichenbereich in der lokalen Arbeitskopie (Prüfung nur lokal).
 */
export const lernappBeleg = pgTable(
  'lernapp_beleg',
  {
    id: uuid().primaryKey().defaultRandom(),
    aussageId: uuid().references(() => lernappAussage.id, { onDelete: 'cascade' }),
    tippId: uuid().references(() => lernappTipp.id, { onDelete: 'cascade' }),
    quelleId: uuid()
      .notNull()
      .references(() => lernappQuelle.id, { onDelete: 'restrict' }),
    passage: text().notNull(),
    stelle: jsonb().$type<LernappStelle>().notNull().default({}),
    zitatVon: integer(),
    zitatBis: integer(),
    art: lernappBelegArtEnum().notNull().default('sinngemaess'),
    ...bausteinSpalten(),
  },
  (t) => [
    index('lernapp_beleg_aussage_idx').on(t.aussageId),
    index('lernapp_beleg_tipp_idx').on(t.tippId),
    check('lernapp_beleg_ein_bezug', sql`num_nonnulls(${t.aussageId}, ${t.tippId}) = 1`),
  ],
);

/**
 * Sprecher*innen menschlicher Aufnahmen: nur mit hinterlegter Vereinbarung (ADR 0029 Nr. 4, Pflicht). Modul B der
 * Vereinbarung (`web/docs/recht/entwuerfe/vereinbarung-sprecher-lernapp.md`) getrennt: `kiSyntheseErlaubt` = B1 (Training
 * einer eigenen Stimme), `klonenErlaubt` = B2 (Referenzstimme ohne Training; ADR 0045, Fortschreibung S3/S8 Nr. 4,
 * Migration 0020).
 */
export const lernappSprecher = pgTable('lernapp_sprecher', {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  vereinbarungMediumId: uuid()
    .notNull()
    .references(() => medium.id, { onDelete: 'restrict' }),
  kiSyntheseErlaubt: boolean().notNull().default(false),
  klonenErlaubt: boolean().notNull().default(false),
  erstelltAm: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const lernappAufnahmeStatusEnum = pgEnum('lernapp_aufnahme_status', ['neu', 'gebuendelt', 'verworfen']);

/**
 * Menschliche Aufnahme aus dem Audio-Studio (Verwaltung L3-06, ADR 0039 Nr. 8, Migration 0020): Rohdatei im privaten
 * Speicher unter ihrem Inhalts-Hash (`lernapp/aufnahmen/<sprache>/<textHash16>-<sha16>.<endung>`, Format nur über Magic
 * Bytes), nur mit einer Sprecherin oder einem Sprecher mit Vereinbarung. Die Audio-Kette (L3-05) normiert, bündelt und
 * trägt den Clip mit der Stimme `mensch:<sprecherId>` in `lernapp_audio` ein (`gebuendelt`). Je Sprache, Text und Person
 * eine Aufnahme; eine neue ersetzt die alte. Nie für Einträge mit Religionsbezug, Wissen oder Koran-Arabisch.
 */
export const lernappAufnahme = pgTable(
  'lernapp_aufnahme',
  {
    id: uuid().primaryKey().defaultRandom(),
    sprache: lernappSpracheEnum().notNull(),
    textHash: text().notNull(),
    /** Lemma oder Satz, für den aufgenommen wurde (stabiler Schlüssel). */
    schluessel: text().notNull(),
    sprecherId: uuid()
      .notNull()
      .references(() => lernappSprecher.id, { onDelete: 'restrict' }),
    pfad: text().notNull(),
    mime: text().notNull(),
    bytes: integer().notNull(),
    sha256: text().notNull(),
    dauerMs: integer(),
    status: lernappAufnahmeStatusEnum().notNull().default('neu'),
    erstelltVon: text().references(() => user.id, { onDelete: 'set null' }),
    erstelltAm: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    unique('lernapp_aufnahme_eindeutig').on(t.sprache, t.textHash, t.sprecherId),
    index('lernapp_aufnahme_status_idx').on(t.status, t.sprache),
  ],
);

export const lernappStimmenWahlEnum = pgEnum('lernapp_stimmen_wahl', ['sprachausgabe', 'mensch']);

/**
 * Wahl der Stimme je Clip (Audio-Studio, Migration 0020): Ohne Zeile gilt der Vorrang „Mensch vor Sprachausgabe“
 * (`server/queries/lernapp/pakete.ts`); `sprachausgabe` liefert eine vorhandene menschliche Aufnahme nicht aus.
 */
export const lernappAudioWahl = pgTable(
  'lernapp_audio_wahl',
  {
    sprache: lernappSpracheEnum().notNull(),
    textHash: text().notNull(),
    wahl: lernappStimmenWahlEnum().notNull(),
    geaendertVon: text().references(() => user.id, { onDelete: 'set null' }),
    geaendertAm: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.sprache, t.textHash] })],
);

/**
 * Lern-Audio je Text-Hash (ADR 0039): Clip im Bündel `.lpa` (Versatz, Länge). `stimme`: `tts:<modell>@<sha>` oder
 * `mensch:<sprecherId>`; die menschliche Aufnahme ersetzt die Sprachausgabe je Hash. Nie für Religionsbezug, Wissen, Koran.
 */
export const lernappAudio = pgTable(
  'lernapp_audio',
  {
    id: uuid().primaryKey().defaultRandom(),
    sprache: lernappSpracheEnum().notNull(),
    textHash: text().notNull(),
    stimme: text().notNull(),
    sprecherId: uuid().references(() => lernappSprecher.id, { onDelete: 'restrict' }),
    buendel: text().notNull(),
    versatz: integer().notNull(),
    laenge: integer().notNull(),
    dauerMs: integer().notNull(),
    sha256: text().notNull(),
    erstelltAm: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique('lernapp_audio_eindeutig').on(t.sprache, t.textHash, t.stimme), index('lernapp_audio_buendel_idx').on(t.buendel)],
);

/** Was eine Prüfung betrifft (Tabellenname ohne Vorsilbe bzw. religiöse Sonderfälle aus L6). */
export const lernappInhaltTypEnum = pgEnum('lernapp_inhalt_typ', [
  'einheit',
  'lektion',
  'aufgabe',
  'lemma',
  'satz',
  'uebersetzung',
  'tipp',
  'text',
  'aussage',
  'beleg',
  'audio',
  'formelliste',
  'koran_bedeutung',
  'wurzel',
]);
/** Art der Prüfung: Sprache (Zieltext bzw. Übersetzung, ADR 0041) oder religiös (zwei Freigaben, ADR 0040). */
export const lernappPruefArtEnum = pgEnum('lernapp_pruef_art', ['sprache_ziel', 'sprache_uebersetzung', 'religioes']);
/** Urteil: Sprache `ok`/`korrektur`/`abgelehnt` (ADR 0041 Nr. 4); religiös `ok`/`aenderungsvorschlag`/`abgelehnt` (ADR 0040 Nr. 5). */
export const lernappUrteilEnum = pgEnum('lernapp_urteil', ['ok', 'korrektur', 'aenderungsvorschlag', 'abgelehnt']);
/** Fehlerkategorie (ADR 0041 Nr. 4): kritisch = bedeutung, grammatik, anstoessig, aussprache; leicht = natuerlichkeit, zeichensetzung. */
export const lernappFehlerEnum = pgEnum('lernapp_fehler', [
  'bedeutung',
  'grammatik',
  'anstoessig',
  'aussprache',
  'natuerlichkeit',
  'zeichensetzung',
]);

export const lernappStichprobeArtEnum = pgEnum('lernapp_stichprobe_art', ['zieltext', 'uebersetzung', 'audio']);
export const lernappEntscheidungEnum = pgEnum('lernapp_entscheidung', ['offen', 'bestanden', 'nachbessern']);
export type LernappStichprobeErgebnis = { geprueft: number; kritisch: number; leicht: number };

/**
 * Stichprobe je Einheit und Art (ADR 0041 Nr. 3/5): Startwert und Auswahl reproduzierbar gespeichert; `richtungId` nur bei
 * Übersetzungen. Die Annahmeregel rechnet `web/src/lib/lernapp/stichprobe.ts`.
 */
export const lernappStichprobe = pgTable(
  'lernapp_stichprobe',
  {
    id: uuid().primaryKey().defaultRandom(),
    einheitId: uuid()
      .notNull()
      .references(() => lernappEinheit.id, { onDelete: 'cascade' }),
    sprache: lernappSpracheEnum().notNull(),
    richtungId: text().references(() => lernappRichtung.id, { onDelete: 'cascade' }),
    art: lernappStichprobeArtEnum().notNull(),
    einlauf: boolean().notNull().default(false),
    seed: text().notNull(),
    groesse: integer().notNull(),
    /** Schlüssel der gezogenen Einträge in Ziehungsreihenfolge. */
    auswahl: jsonb().$type<string[]>().notNull().default([]),
    ergebnis: jsonb().$type<LernappStichprobeErgebnis>(),
    entscheidung: lernappEntscheidungEnum().notNull().default('offen'),
    /** Hash der Einheit beim Ziehen (Änderung nach Bestehen, ADR 0041 Nr. 7). */
    einheitHash: text(),
    gezogenAm: timestamp({ withTimezone: true }).notNull().defaultNow(),
    entschiedenAm: timestamp({ withTimezone: true }),
    entschiedenVon: text().references(() => user.id, { onDelete: 'set null' }),
  },
  (t) => [index('lernapp_stichprobe_einheit_idx').on(t.einheitId, t.art)],
);

export type LernappBelegGeprueft = { belegId: string; inhaltHash: string };

/**
 * Prüfung eines Bausteins zu genau einem Hash (ADR 0040 Nr. 5, ADR 0041 Nr. 4). Prüfende bearbeiten nicht selbst. Wird ein
 * Konto gelöscht, bleibt die Prüfung ohne Person stehen und zählt nicht mehr als Freigabe (`freigabe.ts`). Verlauf
 * religiöser Freigaben zusätzlich in `freigabe` (ADR 0030).
 */
export const lernappPruefung = pgTable(
  'lernapp_pruefung',
  {
    id: uuid().primaryKey().defaultRandom(),
    inhaltTyp: lernappInhaltTypEnum().notNull(),
    /** UUID des Bausteins bzw. Schlüssel (Formelliste, Koran-Bedeutung, Wurzel). */
    inhaltId: text().notNull(),
    inhaltHash: text().notNull(),
    art: lernappPruefArtEnum().notNull(),
    pruefendeId: text().references(() => user.id, { onDelete: 'set null' }),
    urteil: lernappUrteilEnum().notNull(),
    kategorie: lernappFehlerEnum(),
    /** Je Beleg „am Original geprüft“ (nur religiös): Beleg und dessen Hash zum Zeitpunkt der Prüfung. */
    belegeGeprueft: jsonb().$type<LernappBelegGeprueft[]>().notNull().default([]),
    /** Korrektur bzw. Änderungsvorschlag als Text (die Redaktion arbeitet ihn ein). */
    korrektur: text(),
    kommentar: text(),
    stichprobeId: uuid().references(() => lernappStichprobe.id, { onDelete: 'set null' }),
    am: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('lernapp_pruefung_inhalt_idx').on(t.inhaltTyp, t.inhaltId, t.inhaltHash),
    index('lernapp_pruefung_pruefende_idx').on(t.pruefendeId),
    index('lernapp_pruefung_stichprobe_idx').on(t.stichprobeId),
  ],
);

export const lernappEbeneEnum = pgEnum('lernapp_ebene', ['muttersprache', 'sehr_gut']);

/** Sprachen der Prüfenden (ADR 0041 Nr. 1): `lernapp.sprache.pruefen` gilt nur für diese (`darfSprachePruefen`). */
export const lernappPrueferSprache = pgTable(
  'lernapp_pruefer_sprache',
  {
    benutzerId: text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    sprache: lernappSpracheEnum().notNull(),
    ebene: lernappEbeneEnum().notNull(),
    erstelltAm: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.benutzerId, t.sprache] })],
);

export const lernappMeldungKategorieEnum = pgEnum('lernapp_meldung_kategorie', [
  'antwort_richtig',
  'fehler_zieltext',
  'fehler_uebersetzung',
  'fehler_audio',
  'anstoessig',
  'sonstiges',
]);
export const lernappMeldungStatusEnum = pgEnum('lernapp_meldung_status', ['offen', 'erledigt']);

/**
 * Meldung aus der App (ADR 0041 Nr. 9, KERN 4.0 §5): ohne Personenbezug, nur Aufgabenschlüssel und Kategorie. `antwort` nur
 * von angemeldeten Personen ab 16 und nur auf Wunsch – ohne Konto und bei Kindern nie (prüft die Route, L3-06).
 */
export const lernappMeldung = pgTable(
  'lernapp_meldung',
  {
    id: uuid().primaryKey().defaultRandom(),
    aufgabeSchluessel: text().notNull(),
    kategorie: lernappMeldungKategorieEnum().notNull(),
    antwort: text(),
    status: lernappMeldungStatusEnum().notNull().default('offen'),
    am: timestamp({ withTimezone: true }).notNull().defaultNow(),
    erledigtAm: timestamp({ withTimezone: true }),
    erledigtVon: text().references(() => user.id, { onDelete: 'set null' }),
  },
  (t) => [index('lernapp_meldung_aufgabe_idx').on(t.aufgabeSchluessel), index('lernapp_meldung_status_idx').on(t.status, t.am)],
);
