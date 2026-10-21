import { z } from 'zod';
import { SchriftArSchema } from '../aufgaben/schrift_ar';
import { RICHTUNGEN, SPRACH_STUFEN, SPRACHEN, istSchluesselVon, zerlegeRichtung, type RichtungId, type Sprache } from '../kurse';
import { EIGENE_STUFEN } from '../kurse';
import { enthaeltArabisch } from '../waechter/kern.mjs';

/**
 * Inhaltsdateien der Lern-App (PLAN §6.1, §6.6; ADR 0039, ADR 0041, ADR 0045). Quelle des Imports
 * (`web/scripts/lernapp/import.ts`, `inhalt/import.ts`) und des Prüfgerüsts (`pnpm lernapp:pruefen`).
 *
 * - `web/inhalte/lernapp/sprache/<ziel>/<stufe>/<einheit>.json` → {@link SprachEinheitDatei}: Einheit, Lemmata, Sätze,
 *   Lektionen mit Aufgaben-Vorlagen. Gemeinsam für beide Richtungen derselben Zielsprache.
 * - `web/inhalte/lernapp/uebersetzung/<richtung>/<stufe>/<einheit>.json` → {@link UebersetzungDatei}: Übersetzungen und
 *   Glossen in die Ausgangssprache (mit angenommenen Alternativen) und die Tipps der Richtung.
 *
 * Aufgaben stehen als **Vorlage** im Inhalt (Verweise auf Lemma- und Satzschlüssel); der Paketbau (paket/bauen.ts) macht
 * daraus je Richtung die Aufgaben des Spielers (aufgaben/schema.ts). L1 kennt `auswahl`, `wortbank` und `paare`; L2-01
 * ergänzt `bild_wort`, `frei`, `hoeren_waehlen`, `hoeren_schreiben`, `minimalpaare`, `luecke`, `satzbau`, `formen` und
 * `harakat`, L2-02 `dialog`, `geschichte`, `lesen_fragen`, `grammatik_tipp`, `schrift_ar`, `schrift_tr`, `schrift_latein`,
 * `sprechen` und `schreiben`. Vorlagen für den Wissenskurs und `koran_wort` (L2-03) folgen mit L6.
 *
 * Schlüssel (stabil, `kurse.ts` `istSchluesselVon`): Einheit `<kurs>.<stufe>.eNN`; alles der Einheit beginnt mit dem
 * Einheitenschlüssel (`….w001` Lemma, `….s0001` Satz, `….l01` Lektion, `….l01.a01` Aufgabe, `….<ausgang>.t01` Tipp).
 * Verweise dürfen auf Lemmata und Sätze anderer Einheiten desselben Kurses zeigen (Wiederholung früherer Wörter).
 *
 * Herkunft je Eintrag (ADR 0045, KERN 4.0 §1): `quelle` (`ki:<lauf>…`, `tatoeba:<id>`, `wiktionary:<ausgabe>:<seitentitel>`
 * (ADR 0045 Fortschreibung S7 Nr. 7), `kaikki:<id>`, `redaktion`, `test:<name>` nur im Testkurs), `lizenz` aus
 * {@link ERLAUBTE_LIZENZEN}, `namensnennung` wo die Lizenz sie verlangt.
 *
 * L3-02 ergänzt die übrigen Inhaltsdateien (Rahmenplan, Leitfaden, Wissenskurs, Koran-Pfad, Aussprache, Audio-Manifest,
 * Bildkarten; {@link pruefeWeitereDatei}) und `kinderGeeignet` je Einheit; die JSON-Schemas erzeugt `pnpm lernapp:schemas`.
 * Einträge mit Religionsbezug tragen `religionsbezug: true` (zwei religiöse Freigaben, keine Sprachausgabe, KERN 4.0 §2.3).
 */

export const SPRACH_FORMAT = 'igmg-lernapp-sprache';
export const UEBERSETZUNG_FORMAT = 'igmg-lernapp-uebersetzung';

/**
 * Zulässige Lizenzen ausgelieferter Inhalte (KERN 4.0 §1: nur CC0, CC BY, CC BY-SA; kein NC, ND, Research-only). Eigene
 * Lerninhalte stehen unter CC BY-SA 4.0 (L0-E02); Tatoeba-Sätze unter CC BY 2.0 FR (ADR 0045).
 */
export const ERLAUBTE_LIZENZEN = ['CC-BY-SA-4.0', 'CC-BY-4.0', 'CC-BY-2.0-FR', 'CC0-1.0'] as const;
export type Lizenz = (typeof ERLAUBTE_LIZENZEN)[number];
/** Lizenzen, die eine Namensnennung je Eintrag verlangen, wenn der Eintrag nicht eigener Inhalt ist. */
const MIT_NAMENSNENNUNG: ReadonlySet<string> = new Set(['CC-BY-4.0', 'CC-BY-2.0-FR']);

/** Herkunft eines Eintrags. */
export const QuelleSchema = z
  .string()
  .max(200)
  .regex(
    /^(?:ki:[A-Za-z0-9._/:-]{1,180}|tatoeba:\d{1,12}|kaikki:[A-Za-z0-9._:-]{1,120}|wiktionary:(?:en|de|tr):[^\s:][^\n\r\t]{0,150}|redaktion|test:[a-z0-9-]{1,60})$/u,
    { message: 'Quelle: ki:<lauf>, tatoeba:<id>, wiktionary:<ausgabe>:<seitentitel>, kaikki:<id>, redaktion oder test:<name>' },
  );

const Text = (max: number) =>
  z
    .string()
    .trim()
    .min(1)
    .max(max)
    .refine((t) => t === t.normalize('NFC'), { message: 'Text nicht in NFC' });

/** Text in den Oberflächensprachen (LernText, mindestens eine Sprache). */
export const LernTextSchema = z
  .strictObject({ de: Text(300).optional(), tr: Text(300).optional(), ar: Text(300).optional() })
  .refine((t) => Object.keys(t).length > 0, { message: 'mindestens eine Sprache' });

const Schluessel = z.string().max(120);

const herkunft = {
  quelle: QuelleSchema,
  lizenz: z.enum(ERLAUBTE_LIZENZEN),
  namensnennung: z.string().trim().min(1).max(300).optional(),
  religionsbezug: z.boolean().optional(),
};

export const LemmaSchema = z.strictObject({
  schluessel: Schluessel,
  lemma: Text(80),
  wortart: z.string().trim().min(1).max(40).optional(),
  merkmale: z.record(z.string().max(40), z.string().max(80)).optional(),
  formen: z.record(z.string().max(40), z.string().max(120)).optional(),
  frequenzRang: z.int().min(1).max(10_000_000).optional(),
  /** Motiv der Bildkarte (Schlüssel in `web/inhalte/lernapp/symbole/symbole.json`, KERN 4.0 §5; Import prüft die Freigabe) */
  symbol: z
    .string()
    .regex(/^[a-z0-9-]{1,60}$/)
    .optional(),
  ...herkunft,
});
export type LemmaEintrag = z.infer<typeof LemmaSchema>;

export const SatzSchema = z.strictObject({
  schluessel: Schluessel,
  text: Text(600),
  /** Wörter für Wortbank und Abgleich; ohne Angabe aus dem Text (abgleich/tokens.ts `zerlege`). */
  tokens: z.array(z.string().trim().min(1).max(80)).max(80).optional(),
  ...herkunft,
});
export type SatzEintrag = z.infer<typeof SatzSchema>;

const Verweis = Schluessel;

/** Aufgaben-Vorlagen (L1). `ziel`/`satz`/`lemmata` verweisen auf Lemma- bzw. Satzschlüssel des Kurses. */
export const AuswahlVorlageSchema = z.strictObject({
  schluessel: Schluessel,
  typ: z.literal('auswahl'),
  /** `waehleUebersetzung`: Zieltext vorgegeben, Übersetzung wählen; `waehleWort`: Übersetzung vorgegeben, Zieltext wählen */
  anweisung: z.enum(['waehleUebersetzung', 'waehleWort']),
  ziel: Verweis,
  ablenker: z.array(Verweis).min(1).max(5),
});
export const WortbankVorlageSchema = z.strictObject({
  schluessel: Schluessel,
  typ: z.literal('wortbank'),
  anweisung: z.literal('uebersetze'),
  satz: Verweis,
  /** `ziel`: aus der Ausgangssprache in die Zielsprache legen; `ausgang`: den Zielsatz in die Ausgangssprache übersetzen */
  nach: z.enum(['ziel', 'ausgang']),
  /** nur bei `nach: 'ziel'`: weitere richtige Fassungen in der Zielsprache */
  alternativen: z.array(Text(600)).max(20).optional(),
  /** nur bei `nach: 'ziel'`: Ablenker-Kacheln in der Zielsprache (bei `ausgang` wählt der Paketbau sie aus der Einheit) */
  ablenker: z.array(Text(60)).max(8).optional(),
});
export const PaareVorlageSchema = z.strictObject({
  schluessel: Schluessel,
  typ: z.literal('paare'),
  lemmata: z.array(Verweis).min(2).max(6),
});

/**
 * Aufgaben-Vorlagen (L2-01). `ziel` verweist auf ein Lemma oder einen Satz der Zielsprache; der Paketbau nimmt Text, Audio
 * und Übersetzung daraus. Eigene Texte einer Vorlage (Alternativen, Ablenker, Varianten, Tabellen) prüft der Religionswächter
 * mit dem Kennzeichen des Ziels (`vorlageTexte`).
 */
const Ablenker = z.array(Verweis).min(1).max(5);
export const BildWortVorlageSchema = z.strictObject({
  schluessel: Schluessel,
  typ: z.literal('bild_wort'),
  /** Lemma mit `symbol`; die Optionen sind Wörter der Zielsprache */
  ziel: Verweis,
  ablenker: Ablenker,
});
export const FreiVorlageSchema = z.strictObject({
  schluessel: Schluessel,
  typ: z.literal('frei'),
  ziel: Verweis,
  /** `ziel`: aus der Ausgangssprache in die Zielsprache schreiben; `ausgang`: den Zieltext in die Ausgangssprache übersetzen */
  nach: z.enum(['ziel', 'ausgang']),
  /** nur bei `nach: 'ziel'`: weitere richtige Fassungen in der Zielsprache */
  alternativen: z.array(Text(600)).max(20).optional(),
});
export const HoerenWaehlenVorlageSchema = z.strictObject({
  schluessel: Schluessel,
  typ: z.literal('hoeren_waehlen'),
  /** `waehleGehoertes`: Optionen in der Zielsprache; `waehleBedeutung`: Übersetzungen */
  anweisung: z.enum(['waehleGehoertes', 'waehleBedeutung']),
  ziel: Verweis,
  ablenker: Ablenker,
});
export const HoerenSchreibenVorlageSchema = z.strictObject({
  schluessel: Schluessel,
  typ: z.literal('hoeren_schreiben'),
  ziel: Verweis,
  alternativen: z.array(Text(600)).max(20).optional(),
});
export const MinimalpaareVorlageSchema = z.strictObject({
  schluessel: Schluessel,
  typ: z.literal('minimalpaare'),
  /** gehörtes Wort; Ablenker sind die fast gleichen Wörter */
  ziel: Verweis,
  ablenker: z.array(Verweis).min(1).max(3),
});
export const LueckeVorlageSchema = z.strictObject({
  schluessel: Schluessel,
  typ: z.literal('luecke'),
  /** Satz der Zielsprache */
  ziel: Verweis,
  /** Stelle des fehlenden Worts (0 = erstes Wort, Wörter durch Leerraum getrennt) */
  wort: z.int().min(0).max(80),
  /** mit Ablenkern: Wahl unter Optionen; ohne: Freitext */
  ablenker: z.array(Text(60)).min(1).max(5).optional(),
  /** weitere richtige Fassungen des Worts */
  alternativen: z.array(Text(60)).max(10).optional(),
});
export const SatzbauVorlageSchema = z.strictObject({
  schluessel: Schluessel,
  typ: z.literal('satzbau'),
  /** Satz der Zielsprache; seine Wörter sind die Kacheln */
  ziel: Verweis,
  /** andere richtige Wortstellungen derselben Wörter */
  alternativen: z.array(Text(600)).max(20).optional(),
});
export const FormenVorlageSchema = z.strictObject({
  schluessel: Schluessel,
  typ: z.literal('formen'),
  /** Lemma, dessen Formen gefragt sind (Titel und Wiederholungskarte) */
  lemma: Verweis.optional(),
  /** Köpfe in der Zielsprache (z. B. Pronomen, Zeitform) */
  zeilen: z.array(Text(60)).min(1).max(12),
  spalten: z.array(Text(60)).min(1).max(8),
  zellen: z
    .array(
      z.strictObject({
        zeile: z.int().min(0),
        spalte: z.int().min(0),
        loesungen: z.array(Text(60)).min(1).max(10),
        vorgabe: z.boolean().optional(),
      }),
    )
    .min(1)
    .max(96),
});
export const HarakatVorlageSchema = z.strictObject({
  schluessel: Schluessel,
  typ: z.literal('harakat'),
  /** richtig vokalisiertes Lemma oder richtiger Satz (nur Kurs `ar`) */
  ziel: Verweis,
  /** falsch vokalisierte Schreibungen desselben Gerüsts */
  varianten: z.array(Text(120)).min(1).max(3),
});

// ——— L2-02 (PLAN §4, §4.2–§4.4) ———

const Verweise = (min: number, max: number) => z.array(Verweis).min(min).max(max);

/** Gespräch: Zeilen der Personen a/b als Sätze, danach die passende Antwort (Satz) mit Ablenkern (Sätze). */
export const DialogVorlageSchema = z.strictObject({
  schluessel: Schluessel,
  typ: z.literal('dialog'),
  zeilen: z
    .array(z.strictObject({ sprecher: z.enum(['a', 'b']), satz: Verweis }))
    .min(1)
    .max(20),
  antwort: Verweis,
  ablenker: Verweise(1, 5),
});

/** Frage mit Auswahl: Frage (Satz), richtige Antwort und Ablenker (Lemmata oder Sätze) in der Zielsprache. */
const AuswahlFrageVorlage = { frage: Verweis, antwort: Verweis, ablenker: Verweise(1, 5) };

/** Geschichte: Zeilen (Sätze, optional mit Person), eingestreute Fragen nach der Zeile `nach`. */
export const GeschichteVorlageSchema = z.strictObject({
  schluessel: Schluessel,
  typ: z.literal('geschichte'),
  titel: Verweis.optional(),
  zeilen: z
    .array(z.strictObject({ sprecher: z.enum(['a', 'b', 'c']).optional(), satz: Verweis }))
    .min(1)
    .max(60),
  fragen: z
    .array(z.strictObject({ nach: z.int().min(0).max(59), ...AuswahlFrageVorlage }))
    .max(10)
    .default([]),
});

/** Lesetext (Absätze als Sätze), Glossen (Lemmata mit Übersetzung) und Fragen (Auswahl oder richtig/falsch/nicht im Text). */
export const LesenFragenVorlageSchema = z.strictObject({
  schluessel: Schluessel,
  typ: z.literal('lesen_fragen'),
  titel: Verweis.optional(),
  absaetze: Verweise(1, 40),
  glossen: Verweise(0, 200).default([]),
  fragen: z
    .array(
      z.discriminatedUnion('art', [
        z.strictObject({ art: z.literal('auswahl'), ...AuswahlFrageVorlage }),
        z.strictObject({ art: z.literal('rfn'), aussage: Verweis, richtig: z.enum(['richtig', 'falsch', 'nicht_im_text']) }),
      ]),
    )
    .min(1)
    .max(10),
});

/**
 * Grammatik-Tipp im Lektionsfluss: verweist auf einen Tipp der Übersetzungsdatei (`<einheit>.<ausgang>.<tipp>`, je Richtung
 * eigener Text). Überschriften des Tiptap-Dokuments werden Abschnitte, Absätze Text, Zitatblöcke Beispiele in der Zielsprache.
 */
export const GrammatikTippVorlageSchema = z.strictObject({
  schluessel: Schluessel,
  typ: z.literal('grammatik_tipp'),
  tipp: z.string().regex(/^t\d{2}$/, { message: 'tipp: tNN' }),
});

/** Schrift-Vorkurs Arabisch: Buchstaben über Schlüssel (`lib/elifbe/alphabet.ts`), keine Wörter; geprüft wie im Spieler. */
export const SchriftArVorlageSchema = z.strictObject({
  schluessel: Schluessel,
  typ: z.literal('schrift_ar'),
  art: z.enum(['erkennen', 'zuordnen', 'lesen', 'nachspuren']),
  ziel: z.string().regex(/^[a-z]+$/),
  ablenker: z
    .array(z.string().regex(/^[a-z]+$/))
    .min(1)
    .max(5)
    .optional(),
  form: z.enum(['anfang', 'mitte', 'ende']).optional(),
  vokal: z
    .string()
    .regex(/^[a-z-]+$/)
    .optional(),
});

/** Schrift-Vorkurse Lateinschrift: kurze Zeichenketten der Zielsprache, optional ein Hörbeispiel (Lemma/Satz mit Audio). */
const schriftWahlVorlage = <T extends 'schrift_tr' | 'schrift_latein'>(typ: T) =>
  z.strictObject({
    schluessel: Schluessel,
    typ: z.literal(typ),
    anweisung: z.enum(['waehleBuchstabe', 'waehleWort', 'grossKlein']),
    vorgabe: Text(60).optional(),
    hoeren: Verweis.optional(),
    optionen: z.array(Text(60)).min(2).max(6),
    richtig: z.int().min(0).max(5),
  });
export const SchriftTrVorlageSchema = schriftWahlVorlage('schrift_tr');
export const SchriftLateinVorlageSchema = schriftWahlVorlage('schrift_latein');

/** Sprechübung: ein Satz der Zielsprache (mit Übersetzung, wo es eine gibt). */
export const SprechenVorlageSchema = z.strictObject({ schluessel: Schluessel, typ: z.literal('sprechen'), satz: Verweis });

/** Schreibübung (B1–C1): Aufgabe (Satz), Wortzahl, Pflichtwörter, 1–2 Musterantworten (Sätze). */
export const SchreibenVorlageSchema = z.strictObject({
  schluessel: Schluessel,
  typ: z.literal('schreiben'),
  aufgabe: Verweis,
  woerter: z.strictObject({ min: z.int().min(1).max(600), max: z.int().min(1).max(600) }),
  pflichtwoerter: z.array(Text(60)).min(1).max(10).optional(),
  muster: Verweise(1, 2),
});

export const AufgabeVorlageSchema = z.discriminatedUnion('typ', [
  AuswahlVorlageSchema,
  WortbankVorlageSchema,
  PaareVorlageSchema,
  BildWortVorlageSchema,
  FreiVorlageSchema,
  HoerenWaehlenVorlageSchema,
  HoerenSchreibenVorlageSchema,
  MinimalpaareVorlageSchema,
  LueckeVorlageSchema,
  SatzbauVorlageSchema,
  FormenVorlageSchema,
  HarakatVorlageSchema,
  DialogVorlageSchema,
  GeschichteVorlageSchema,
  LesenFragenVorlageSchema,
  GrammatikTippVorlageSchema,
  SchriftArVorlageSchema,
  SchriftTrVorlageSchema,
  SchriftLateinVorlageSchema,
  SprechenVorlageSchema,
  SchreibenVorlageSchema,
]);
export type AufgabeVorlage = z.infer<typeof AufgabeVorlageSchema>;

/** Prüfungen der L2-02-Vorlagen über das Schema hinaus (Reihenfolge, Bereiche, Ablenker, Schrift wie im Spieler). */
export function pruefeVorlageL2(a: AufgabeVorlage): string[] {
  const fehler: string[] = [];
  const ablenkerOk = (ziel: string, ablenker: readonly string[]) => new Set([ziel, ...ablenker]).size === ablenker.length + 1;
  if (a.typ === 'dialog' && !ablenkerOk(a.antwort, a.ablenker)) fehler.push('Ablenker doppelt oder gleich der Antwort');
  if (a.typ === 'geschichte')
    a.fragen.forEach((f, k) => {
      if (f.nach >= a.zeilen.length) fehler.push(`Frage ${k + 1} nach dem Ende`);
      if (k > 0 && a.fragen[k - 1]!.nach > f.nach) fehler.push(`Frage ${k + 1} nicht in Reihenfolge`);
      if (!ablenkerOk(f.antwort, f.ablenker)) fehler.push(`Frage ${k + 1}: Ablenker doppelt oder gleich der Antwort`);
    });
  if (a.typ === 'lesen_fragen')
    a.fragen.forEach((f, k) => {
      if (f.art === 'auswahl' && !ablenkerOk(f.antwort, f.ablenker))
        fehler.push(`Frage ${k + 1}: Ablenker doppelt oder gleich der Antwort`);
    });
  if ((a.typ === 'schrift_tr' || a.typ === 'schrift_latein') && (a.richtig >= a.optionen.length || (!a.vorgabe && !a.hoeren)))
    fehler.push('richtig außerhalb der Optionen oder weder Vorgabe noch Hörbeispiel');
  if (a.typ === 'schreiben' && a.woerter.max < a.woerter.min) fehler.push('Wortzahl: min ≤ max');
  if (a.typ === 'schrift_ar') {
    const r = SchriftArSchema.safeParse(a);
    if (!r.success) fehler.push(...r.error.issues.map((x) => `schrift_ar: ${x.message}`));
  }
  return fehler;
}

export const LEKTION_ARTEN = ['lektion', 'geschichte', 'wiederholung', 'pruefstein', 'schrift', 'schreiben', 'sprechen'] as const;

export const LektionVorlageSchema = z.strictObject({
  schluessel: Schluessel,
  art: z.enum(LEKTION_ARTEN).default('lektion'),
  ziel: LernTextSchema.optional(),
  kinderGeeignet: z.boolean().optional(),
  aufgaben: z.array(AufgabeVorlageSchema).min(1).max(40),
});

/** Verweise einer Aufgaben-Vorlage auf Lemmata bzw. Sätze. */
export function verweiseVon(a: AufgabeVorlage): string[] {
  switch (a.typ) {
    case 'auswahl':
    case 'bild_wort':
    case 'hoeren_waehlen':
    case 'minimalpaare':
      return [a.ziel, ...a.ablenker];
    case 'wortbank':
      return [a.satz];
    case 'paare':
      return [...a.lemmata];
    case 'formen':
      return a.lemma ? [a.lemma] : [];
    case 'frei':
    case 'hoeren_schreiben':
    case 'luecke':
    case 'satzbau':
    case 'harakat':
      return [a.ziel];
    case 'dialog':
      return [...a.zeilen.map((z) => z.satz), a.antwort, ...a.ablenker];
    case 'geschichte':
      return [
        ...(a.titel ? [a.titel] : []),
        ...a.zeilen.map((z) => z.satz),
        ...a.fragen.flatMap((f) => [f.frage, f.antwort, ...f.ablenker]),
      ];
    case 'lesen_fragen':
      return [
        ...(a.titel ? [a.titel] : []),
        ...a.absaetze,
        ...a.glossen,
        ...a.fragen.flatMap((f) => (f.art === 'auswahl' ? [f.frage, f.antwort, ...f.ablenker] : [f.aussage])),
      ];
    case 'schrift_tr':
    case 'schrift_latein':
      return a.hoeren ? [a.hoeren] : [];
    case 'sprechen':
      return [a.satz];
    case 'schreiben':
      return [a.aufgabe, ...a.muster];
    case 'grammatik_tipp':
    case 'schrift_ar':
      return [];
  }
}

/** Hauptverweis einer Vorlage (sein Kennzeichen `religionsbezug` gilt für die eigenen Texte der Vorlage). */
export function hauptVerweis(a: AufgabeVorlage): string | null {
  switch (a.typ) {
    case 'wortbank':
      return a.satz;
    case 'formen':
      return a.lemma ?? null;
    case 'dialog':
      return a.antwort;
    case 'schrift_tr':
    case 'schrift_latein':
      return a.hoeren ?? null;
    case 'sprechen':
      return a.satz;
    case 'schreiben':
      return a.aufgabe;
    case 'paare':
    case 'geschichte':
    case 'lesen_fragen':
    case 'grammatik_tipp':
    case 'schrift_ar':
      return null;
    default:
      return a.ziel;
  }
}

/** Eigene Texte einer Vorlage (nicht aus Lemmata oder Sätzen): für Religionswächter und Prüfer. */
export function vorlageTexte(a: AufgabeVorlage): string[] {
  switch (a.typ) {
    case 'wortbank':
      return [...(a.alternativen ?? []), ...(a.ablenker ?? [])];
    case 'frei':
    case 'hoeren_schreiben':
    case 'satzbau':
      return [...(a.alternativen ?? [])];
    case 'luecke':
      return [...(a.ablenker ?? []), ...(a.alternativen ?? [])];
    case 'formen':
      return [...a.zeilen, ...a.spalten, ...a.zellen.flatMap((c) => c.loesungen)];
    case 'harakat':
      return [...a.varianten];
    case 'schrift_tr':
    case 'schrift_latein':
      return [...(a.vorgabe ? [a.vorgabe] : []), ...a.optionen];
    case 'schreiben':
      return [...(a.pflichtwoerter ?? [])];
    default:
      return [];
  }
}

const StatusSchema = z.enum(['entwurf', 'automatisch_geprueft']).default('entwurf');

function eindeutig(werte: readonly string[], ctx: z.RefinementCtx, pfad: (string | number)[], was: string) {
  const gesehen = new Set<string>();
  for (const w of werte) {
    if (gesehen.has(w)) ctx.addIssue({ code: 'custom', message: `${was} doppelt: ${w}`, path: pfad });
    gesehen.add(w);
  }
}

function namensnennungPruefen(
  e: { lizenz: string; namensnennung?: string; quelle: string },
  ctx: z.RefinementCtx,
  pfad: (string | number)[],
) {
  const eigen = e.quelle === 'redaktion' || e.quelle.startsWith('ki:') || e.quelle.startsWith('test:');
  if (!eigen && MIT_NAMENSNENNUNG.has(e.lizenz) && !e.namensnennung)
    ctx.addIssue({ code: 'custom', message: 'Namensnennung fehlt', path: [...pfad, 'namensnennung'] });
}

export const SprachEinheitDateiSchema = z
  .strictObject({
    format: z.literal(SPRACH_FORMAT),
    version: z.literal(1),
    /** Stand nach dem Import: `automatisch_geprueft` erst nach Prüfern und Gegenprüfung (PLAN §6.3), sonst `entwurf` */
    status: StatusSchema,
    kurs: z.enum(SPRACHEN),
    stufe: z.enum(SPRACH_STUFEN),
    einheit: z.strictObject({
      schluessel: Schluessel,
      reihenfolge: z.int().min(1).max(999),
      thema: LernTextSchema,
      kannBeschreibungen: z.array(LernTextSchema).max(12).optional(),
      symbol: z.string().max(200).optional(),
      /** nur für eine Ausgangssprache (z. B. Schrift-Vorkurs) */
      nurFuerAusgang: z.enum(SPRACHEN).optional(),
      /** für Kinder geeignet (Leitfaden `kinder`): A1–B1 Pflicht und `true` (Prüfer „kindgeeignet“, L3-02) */
      kinderGeeignet: z.boolean().optional(),
    }),
    lemmata: z.array(LemmaSchema).max(400).default([]),
    saetze: z.array(SatzSchema).max(1000).default([]),
    lektionen: z.array(LektionVorlageSchema).min(1).max(20),
  })
  .superRefine((d, ctx) => {
    const e = d.einheit.schluessel;
    if (!istSchluesselVon(d.kurs, e) || !e.startsWith(`${d.kurs}.${d.stufe}.`))
      ctx.addIssue({ code: 'custom', message: `Einheit ${e} passt nicht zu ${d.kurs}.${d.stufe}`, path: ['einheit', 'schluessel'] });
    if (d.einheit.nurFuerAusgang === d.kurs)
      ctx.addIssue({ code: 'custom', message: 'nurFuerAusgang gleich der Zielsprache', path: ['einheit', 'nurFuerAusgang'] });
    const eigen = (s: string) => istSchluesselVon(d.kurs, s) && s.startsWith(`${e}.`);
    d.lemmata.forEach((l, i) => {
      if (!eigen(l.schluessel))
        ctx.addIssue({ code: 'custom', message: `Lemma-Schlüssel ${l.schluessel}`, path: ['lemmata', i, 'schluessel'] });
      namensnennungPruefen(l, ctx, ['lemmata', i]);
    });
    d.saetze.forEach((s, i) => {
      if (!eigen(s.schluessel))
        ctx.addIssue({ code: 'custom', message: `Satz-Schlüssel ${s.schluessel}`, path: ['saetze', i, 'schluessel'] });
      namensnennungPruefen(s, ctx, ['saetze', i]);
    });
    d.lektionen.forEach((l, i) => {
      if (!eigen(l.schluessel))
        ctx.addIssue({ code: 'custom', message: `Lektion-Schlüssel ${l.schluessel}`, path: ['lektionen', i, 'schluessel'] });
      l.aufgaben.forEach((a, j) => {
        if (!istSchluesselVon(d.kurs, a.schluessel) || !a.schluessel.startsWith(`${l.schluessel}.`))
          ctx.addIssue({
            code: 'custom',
            message: `Aufgaben-Schlüssel ${a.schluessel}`,
            path: ['lektionen', i, 'aufgaben', j, 'schluessel'],
          });
        for (const v of verweiseVon(a))
          if (!istSchluesselVon(d.kurs, v))
            ctx.addIssue({ code: 'custom', message: `Verweis ${v} nicht im Kurs ${d.kurs}`, path: ['lektionen', i, 'aufgaben', j] });
        if (
          (a.typ === 'auswahl' || a.typ === 'bild_wort' || a.typ === 'hoeren_waehlen' || a.typ === 'minimalpaare') &&
          new Set([a.ziel, ...a.ablenker]).size !== a.ablenker.length + 1
        )
          ctx.addIssue({ code: 'custom', message: 'Ablenker doppelt oder gleich dem Ziel', path: ['lektionen', i, 'aufgaben', j] });
        if (a.typ === 'harakat' && d.kurs !== 'ar')
          ctx.addIssue({ code: 'custom', message: 'harakat nur im Kurs ar', path: ['lektionen', i, 'aufgaben', j] });
        if (a.typ === 'frei' && a.nach === 'ausgang' && a.alternativen?.length)
          ctx.addIssue({ code: 'custom', message: 'alternativen nur bei nach: ziel', path: ['lektionen', i, 'aufgaben', j] });
        if (a.typ === 'formen')
          a.zellen.forEach((c, k) => {
            if (c.zeile >= a.zeilen.length || c.spalte >= a.spalten.length)
              ctx.addIssue({ code: 'custom', message: 'Zelle außerhalb der Tabelle', path: ['lektionen', i, 'aufgaben', j, 'zellen', k] });
          });
        if (a.typ === 'paare' && new Set(a.lemmata).size !== a.lemmata.length)
          ctx.addIssue({ code: 'custom', message: 'Paare doppelt', path: ['lektionen', i, 'aufgaben', j] });
        if (a.typ === 'wortbank' && a.nach === 'ausgang' && (a.alternativen?.length || a.ablenker?.length))
          ctx.addIssue({ code: 'custom', message: 'alternativen/ablenker nur bei nach: ziel', path: ['lektionen', i, 'aufgaben', j] });
        for (const fehler of pruefeVorlageL2(a)) ctx.addIssue({ code: 'custom', message: fehler, path: ['lektionen', i, 'aufgaben', j] });
      });
    });
    const alle = [
      e,
      ...d.lemmata.map((l) => l.schluessel),
      ...d.saetze.map((s) => s.schluessel),
      ...d.lektionen.map((l) => l.schluessel),
      ...d.lektionen.flatMap((l) => l.aufgaben.map((a) => a.schluessel)),
    ];
    eindeutig(alle, ctx, [], 'Schlüssel');
  });
export type SprachEinheitDatei = z.infer<typeof SprachEinheitDateiSchema>;

/** Tiptap-Dokument (ADR 0006); der Inhalt wird beim Anzeigen wie im CMS gerendert. */
export const TiptapSchema = z.looseObject({ type: z.literal('doc'), content: z.array(z.unknown()).max(200).optional() });

export const UebersetzungEintragSchema = z.strictObject({
  /** Lemma- oder Satzschlüssel der Zielsprache */
  bezug: Verweis,
  text: Text(600),
  /** weitere angenommene Fassungen in der Ausgangssprache */
  alternativen: z.array(Text(600)).max(30).optional(),
  ...herkunft,
});
export type UebersetzungEintrag = z.infer<typeof UebersetzungEintragSchema>;

export const TippVorlageSchema = z.strictObject({
  schluessel: Schluessel,
  titel: Text(200).optional(),
  inhalt: TiptapSchema,
  religionsbezug: z.boolean().optional(),
  quelle: QuelleSchema.optional(),
});

export const UebersetzungDateiSchema = z
  .strictObject({
    format: z.literal(UEBERSETZUNG_FORMAT),
    version: z.literal(1),
    status: StatusSchema,
    richtung: z.enum(RICHTUNGEN),
    einheit: Schluessel,
    eintraege: z.array(UebersetzungEintragSchema).max(2000),
    tipps: z.array(TippVorlageSchema).max(20).default([]),
  })
  .superRefine((d, ctx) => {
    const { ziel, ausgang } = zerlegeRichtung(d.richtung);
    if (!istSchluesselVon(ziel, d.einheit))
      ctx.addIssue({ code: 'custom', message: `Einheit ${d.einheit} nicht im Kurs ${ziel}`, path: ['einheit'] });
    d.eintraege.forEach((e, i) => {
      if (!istSchluesselVon(ziel, e.bezug)) ctx.addIssue({ code: 'custom', message: `Bezug ${e.bezug}`, path: ['eintraege', i, 'bezug'] });
      namensnennungPruefen(e, ctx, ['eintraege', i]);
    });
    eindeutig(
      d.eintraege.map((e) => e.bezug),
      ctx,
      ['eintraege'],
      'Bezug',
    );
    d.tipps.forEach((t, i) => {
      if (!t.schluessel.startsWith(`${d.einheit}.${ausgang}.`) || !istSchluesselVon(ziel, t.schluessel))
        ctx.addIssue({ code: 'custom', message: `Tipp-Schlüssel ${t.schluessel}`, path: ['tipps', i, 'schluessel'] });
    });
    eindeutig(
      d.tipps.map((t) => t.schluessel),
      ctx,
      ['tipps'],
      'Tipp',
    );
  });
export type UebersetzungDatei = z.infer<typeof UebersetzungDateiSchema>;

// ——— L3-02: weitere Inhaltsdateien (PLAN §6.1; ADR 0039, ADR 0040, ADR 0045) ———
//
// Rahmenpläne und Inhaltsleitfaden (`rahmen/`), Wissenskurs (`islam/`), Koran-Arabisch-Pfad (`koran/pfad.json`),
// Aussprache-Überschreibungen (`aussprache/`), Audio-Manifest (`audio-manifest/`) und Bildkarten (`symbole/`). Daraus erzeugt
// `pnpm lernapp:schemas` die JSON-Schemas unter `web/inhalte/lernapp/schemas/`; `pnpm lernapp:pruefen` prüft alle Dateien.
// Arabische Schrift steht nur in Sprachkurs, Übersetzung und Aussprache (KERN 4.0 §3); alle anderen Dateien prüft
// {@link arabischFrei} – auch verschleiert (Entitäten, Codepunkte).

/** Kein Zeichen arabischer Schrift in irgendeiner Zeichenkette (auch als Entität oder Codepunkt); Meldung ohne Schrift. */
function arabischFrei(wert: unknown, ctx: z.RefinementCtx, pfad: (string | number)[] = []): void {
  if (typeof wert === 'string') {
    if (enthaeltArabisch(wert))
      ctx.addIssue({ code: 'custom', message: 'arabische Schrift nicht erlaubt (nur Umschrift oder Verweis, KERN 4.0 §3)', path: pfad });
    return;
  }
  if (Array.isArray(wert)) wert.forEach((x, i) => arabischFrei(x, ctx, [...pfad, i]));
  else if (wert && typeof wert === 'object') for (const [k, v] of Object.entries(wert)) arabischFrei(v, ctx, [...pfad, k]);
}

const Datum = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Datum JJJJ-MM-TT' });
const Version = z.string().regex(/^\d+\.\d+\.\d+(?:-[a-z0-9.]+)?$/, { message: 'Version x.y.z[-zusatz]' });
const Hex64 = z.string().regex(/^[0-9a-f]{64}$/, { message: 'SHA-256 (hex)' });
const Liste = (max: number, laenge = 400) => z.array(Text(laenge)).max(max);
/** GER-Stufe in Großschrift (Leitfaden) */
const GER = z.enum(['A1', 'A2', 'B1', 'B2', 'C1']);

// ——— Rahmenplan `rahmen/<sprache>.rahmen.json` (PLAN §6.2; L0-E19: eigene Kann-Beschreibungen, nur Umschrift) ———

export const RahmenEinheitSchema = z.strictObject({
  schluessel: Schluessel,
  titel: Text(120),
  /** Thema aus dem Inhaltsleitfaden (`leitfaden.json` → `themen[].id`) */
  thema: z.string().regex(/^[a-z0-9_]+$/),
  kannBeschreibungen: Liste(8, 300).min(1),
  kommunikation: Liste(12, 200),
  /** Kennungen aus `grammatik[]` bzw. `wortfelder[]` (Wiederholungseinheiten nennen viele) */
  grammatik: z.array(z.string().max(80)).max(60),
  wortfelder: z.array(z.string().max(80)).max(60),
  lemmaBudget: z.int().min(0).max(400),
  geschichte: Text(1000).nullable(),
  lesetext: Text(1000).nullable(),
  sprechen: Text(600).nullable(),
  schreiben: Text(600).nullable(),
  /** Kennungen aus dem Leitfaden (`religionsbezug.orte_ereignisse` R-NN, `formeln.liste` F-<sprache>-NN) */
  religionsbezugKandidaten: z.array(z.string().regex(/^(?:R-\d{2}|F-(?:de|tr|ar)-\d{2})$/)).max(40),
  /** A1–B1 immer true (Leitfaden `kinder.kennzeichnung`; Prüfer „kindgeeignet“) */
  kinderGeeignet: z.boolean(),
  stationen: z.array(z.enum(LEKTION_ARTEN)).min(1).max(12),
});
export type RahmenEinheit = z.infer<typeof RahmenEinheitSchema>;

export const RahmenDateiSchema = z
  .strictObject({
    sprache: z.enum(SPRACHEN),
    version: Version,
    stand: Datum,
    /** Pflichthinweis (L0-E19, ADR 0045 Nr. 8) */
    hinweis: z.literal('orientiert am GER (Europarat 2001/2020)'),
    quelle: QuelleSchema,
    ausgangssprachen: z.array(z.enum(SPRACHEN)).length(2),
    grammatik: z
      .array(
        z.strictObject({
          id: z.string().regex(/^(?:de|tr|ar)\.g\.[a-z0-9_-]+$/),
          stufe: z.enum(SPRACH_STUFEN),
          titel: Text(120),
          kurz: Text(500),
          beispiele: Liste(10, 200),
          voraus: z.array(z.string().max(80)).max(20),
        }),
      )
      .max(400),
    wortfelder: z
      .array(z.strictObject({ id: z.string().regex(/^(?:de|tr|ar)\.w\.[a-z0-9_-]+$/), titel: Text(120), beispiele: Liste(40, 80) }))
      .max(400),
    vorkurs: z
      .array(
        z.strictObject({
          schluessel: z.string().regex(/^(?:de|tr|ar)\.v\.l\d{2}$/),
          titel: Text(120),
          ziel: Text(400),
          inhalt: Liste(20, 400),
          fuer: z.array(z.enum(SPRACHEN)).min(1).max(2),
        }),
      )
      .max(20),
    stufen: z
      .array(
        z.strictObject({
          stufe: z.enum(SPRACH_STUFEN),
          lemmaBudget: z.int().min(1).max(5000),
          saetze: z.int().min(1).max(20_000),
          kannBeschreibungen: Liste(12, 300).min(1),
          abdeckungZiel: Text(1500),
          einheiten: z.array(RahmenEinheitSchema).min(1).max(20),
        }),
      )
      .length(SPRACH_STUFEN.length),
  })
  .superRefine((r, ctx) => {
    arabischFrei(r, ctx);
    const s = r.sprache;
    if (r.ausgangssprachen.includes(s) || new Set(r.ausgangssprachen).size !== 2)
      ctx.addIssue({ code: 'custom', message: 'zwei Ausgangssprachen ungleich der Zielsprache', path: ['ausgangssprachen'] });
    const grammatik = new Set<string>();
    r.grammatik.forEach((g, i) => {
      if (!g.id.startsWith(`${s}.g.`) || grammatik.has(g.id))
        ctx.addIssue({ code: 'custom', message: `Grammatik-Kennung ${g.id}`, path: ['grammatik', i, 'id'] });
      grammatik.add(g.id);
    });
    r.grammatik.forEach((g, i) =>
      g.voraus.forEach((v, j) => {
        if (!grammatik.has(v))
          ctx.addIssue({ code: 'custom', message: `Voraussetzung ${v} unbekannt`, path: ['grammatik', i, 'voraus', j] });
      }),
    );
    const wortfelder = new Set<string>();
    r.wortfelder.forEach((w, i) => {
      if (!w.id.startsWith(`${s}.w.`) || wortfelder.has(w.id))
        ctx.addIssue({ code: 'custom', message: `Wortfeld-Kennung ${w.id}`, path: ['wortfelder', i, 'id'] });
      wortfelder.add(w.id);
    });
    r.vorkurs.forEach((v, i) => {
      if (!v.schluessel.startsWith(`${s}.v.`) || v.fuer.includes(s))
        ctx.addIssue({ code: 'custom', message: `Vorkurs ${v.schluessel}`, path: ['vorkurs', i] });
    });
    const einheiten = new Set<string>();
    r.stufen.forEach((st, i) => {
      if (st.stufe !== SPRACH_STUFEN[i])
        ctx.addIssue({ code: 'custom', message: `Stufe ${i + 1} muss ${SPRACH_STUFEN[i]} sein`, path: ['stufen', i, 'stufe'] });
      st.einheiten.forEach((e, j) => {
        const erwartet = `${s}.${st.stufe}.e${String(j + 1).padStart(2, '0')}`;
        if (e.schluessel !== erwartet || einheiten.has(e.schluessel))
          ctx.addIssue({ code: 'custom', message: `Einheit ${e.schluessel}: erwartet ${erwartet}`, path: ['stufen', i, 'einheiten', j] });
        einheiten.add(e.schluessel);
        e.grammatik.forEach((g) => {
          if (!grammatik.has(g)) ctx.addIssue({ code: 'custom', message: `Grammatik ${g} unbekannt`, path: ['stufen', i, 'einheiten', j] });
        });
        e.wortfelder.forEach((w) => {
          if (!wortfelder.has(w)) ctx.addIssue({ code: 'custom', message: `Wortfeld ${w} unbekannt`, path: ['stufen', i, 'einheiten', j] });
        });
      });
    });
  });
export type RahmenDatei = z.infer<typeof RahmenDateiSchema>;

// ——— Inhaltsleitfaden `rahmen/leitfaden.json` (LM-09): geprüft werden die Teile, die Werkzeuge lesen ———

const Formen = z.array(z.string().trim().min(1).max(80)).max(200);
/** Formen einer Tabu-Kategorie in de/tr (Prüfarten `teil`, `anfang`, `wort`, `phrase`; Ausnahmen; Kontext). */
export const TabuFormenLateinSchema = z.strictObject({
  teil: Formen.optional(),
  anfang: Formen.optional(),
  wort: Formen.optional(),
  phrase: Formen.optional(),
  ausnahmen: Formen.optional(),
  phrase_ausnahmen: Formen.optional(),
  kontext: Formen.optional(),
  hinweis: z.string().max(1000).optional(),
});
/** Formen in Umschrift (DIN 31635); die Muster in arabischer Schrift entstehen erst im Werkzeug aus `web/daten/kaikki`. */
export const TabuFormenArSchema = z.strictObject({
  umschrift: Formen.optional(),
  phrase: Formen.optional(),
  mehrdeutig: z
    .array(z.strictObject({ umschrift: z.string().trim().min(1).max(80), faellt_zusammen_mit: z.string().max(200) }))
    .max(100)
    .optional(),
  kontext_umschrift: Formen.optional(),
  hinweis: z.string().max(1000).optional(),
});
export const TabuKategorieSchema = z
  .looseObject({
    id: z.string().regex(/^[a-z_]+$/),
    titel: Text(200),
    regel: z.enum(['verboten', 'nur_sachlich', 'offene_frage']),
    ab_stufe: GER.optional(),
    standard: z.string().max(2000).optional(),
    formen: z.strictObject({ de: TabuFormenLateinSchema, tr: TabuFormenLateinSchema, ar: TabuFormenArSchema }),
  })
  .superRefine((k, ctx) => {
    if (k.regel === 'nur_sachlich' && !k.ab_stufe)
      ctx.addIssue({ code: 'custom', message: 'nur_sachlich braucht ab_stufe', path: ['ab_stufe'] });
    if (k.regel === 'offene_frage' && !k.standard)
      ctx.addIssue({ code: 'custom', message: 'offene_frage braucht standard', path: ['standard'] });
  });
export type TabuKategorie = z.infer<typeof TabuKategorieSchema>;

const Namensliste = z.array(z.string().trim().min(1).max(60)).max(200);
export const LeitfadenSchema = z
  .looseObject({
    id: z.literal('inhaltsleitfaden-sprachkurse'),
    version: Version,
    stand: Datum,
    umschrift: z.looseObject({ din_zu_wiktionary: z.record(z.string().min(1).max(2), z.string().min(1).max(3)) }),
    namen: z.looseObject({
      vornamen: z.record(z.enum(SPRACHEN), z.looseObject({ weiblich: Namensliste, maennlich: Namensliste })),
      familiennamen: z.record(z.enum(SPRACHEN), Namensliste),
    }),
    tabu: z.looseObject({ kategorien: z.array(TabuKategorieSchema).min(1).max(50) }),
    themen: z
      .array(
        z.looseObject({
          id: z.string().regex(/^[a-z0-9_]+$/),
          titel: Text(200),
          stufen: z.array(GER).min(1).max(5),
          kindgeeignet: z.boolean(),
        }),
      )
      .min(1)
      .max(200),
    religionsbezug: z.looseObject({
      orte_ereignisse: z
        .array(
          z.looseObject({
            id: z.string().regex(/^R-\d{2}$/),
            de: z.string().trim().min(1).max(200),
            tr: z.string().trim().min(1).max(200),
            ar: z.string().trim().min(1).max(200).nullable(),
            ab_stufe: GER,
          }),
        )
        .max(100),
      formeln: z.looseObject({
        status: z.enum(['gesperrt', 'freigegeben']),
        religionsbezug: z.literal(true),
        sprachausgabe: z.literal(false),
        liste: z
          .array(z.looseObject({ id: z.string().regex(/^F-(?:de|tr|ar)-\d{2}$/), sprache: z.enum(SPRACHEN), begriff: Text(300) }))
          .max(200),
      }),
    }),
    kinder: z.looseObject({ stufen: z.record(GER, z.string().max(200)) }),
  })
  .superRefine((l, ctx) => {
    arabischFrei(l, ctx);
    for (const [teil, ids] of [
      ['tabu.kategorien', l.tabu.kategorien.map((k) => k.id)],
      ['themen', l.themen.map((t) => t.id)],
      ['religionsbezug', [...l.religionsbezug.orte_ereignisse.map((o) => o.id), ...l.religionsbezug.formeln.liste.map((f) => f.id)]],
    ] as const)
      eindeutig(ids, ctx, [teil], 'Kennung');
  });
export type Leitfaden = z.infer<typeof LeitfadenSchema>;

// ——— Wissenskurs `islam/<bereich>/<einheit>.json` (ADR 0040 Nr. 2, 4, 5; Fortschreibung S8; kein Arabisch) ———

export const ISLAM_FORMAT = 'igmg-lernapp-islam';
/** Bereiche des Wissenskurses (PLAN §5.2). */
export const ISLAM_BEREICHE = [
  'akaid',
  'taharah',
  'salah',
  'sawm',
  'zakat',
  'hajj',
  'halal_haram',
  'akhlaq',
  'siyar',
  'grundwissen',
] as const;
/**
 * Quellenregister der benannten Werke (KERN 4.0 §2.4, ADR 0045 Nr. 12, Fortschreibung S8 Nr. 7): Art, ob als Beleg zulässig
 * (zurückgestellt: Marāqī al-Falāḥ, al-ʿAqāʾid an-Nasafiyya, LM-33), höchste Passage (Radd al-Muḥtār nur ms1–6764).
 */
export const ISLAM_WERKE = {
  quduri: { art: 'fiqh', zulaessig: true },
  nur_al_idah: { art: 'fiqh', zulaessig: true },
  maraqi_al_falah: { art: 'fiqh', zulaessig: false },
  hidaya: { art: 'fiqh', zulaessig: true },
  ikhtiyar: { art: 'fiqh', zulaessig: true },
  radd_al_muhtar: { art: 'fiqh', zulaessig: true, hoechstePassage: 6764 },
  fiqh_akbar: { art: 'aqida', zulaessig: true },
  tahawiyya: { art: 'aqida', zulaessig: true },
  nasafiyya: { art: 'aqida', zulaessig: false },
} as const satisfies Record<string, { art: 'fiqh' | 'aqida'; zulaessig: boolean; hoechstePassage?: number }>;
export type IslamWerk = keyof typeof ISLAM_WERKE;
const WERKE = Object.keys(ISLAM_WERKE) as [IslamWerk, ...IslamWerk[]];

/** Beleg je Aussage: Fundstelle, nie Wortlaut (ADR 0040 Nr. 4, Fortschreibung S8 Nr. 1). */
export const IslamBelegSchema = z.strictObject({
  werk: z.enum(WERKE),
  /** Kitab/Bab/Fasl in Umschrift */
  kapitel: Text(300),
  ausgabe: Text(300),
  band: z.int().min(1).max(30).optional(),
  seite: z.int().min(1).max(5000).optional(),
  /** Kennung aus dem Passagen-Index, z. B. `quduri.ms0042` */
  passage: z.string().regex(/^[a-z_]+\.ms\d{1,5}$/, { message: 'Passage: <werk>.msNNNN' }),
  /** OpenITI-Version-URI mit Meilenstein (nur Fundstelle, kein Text) */
  fundstelle: z
    .string()
    .regex(/^\d{4}[A-Za-z]+\.[A-Za-z]+\.[A-Za-z0-9]+(?:-[a-z]{3}\d)?(?:\.[a-z]+)?#ms\d{1,5}$/, {
      message: 'Fundstelle: OpenITI-URI#msNNNN',
    })
    .optional(),
  passageSha256Text: Hex64.optional(),
  zitatVon: z.int().min(0).optional(),
  zitatBis: z.int().min(0).optional(),
  /** KI-Aussagen immer `sinngemaess`; `woertlich` nur für von Menschen übersetzte Stellen */
  art: z.enum(['sinngemaess', 'woertlich']).default('sinngemaess'),
});

/** Verweis auf Vers oder Hadith; angezeigt mit freigegebener Übersetzung aus der Datenbank, sonst „Übersetzung folgt“. */
export const IslamVerweisSchema = z.discriminatedUnion('art', [
  z.strictObject({ art: z.literal('koran'), stelle: z.string().regex(/^\d{1,3}:\d{1,3}(?:-\d{1,3})?$/) }),
  z.strictObject({ art: z.literal('hadith'), sammlung: z.enum(['bukhari']), nummer: z.int().min(1).max(10_000) }),
]);

const IslamHerkunft = { quelle: QuelleSchema, lizenz: z.literal('CC-BY-SA-4.0') };
const DeText = (max: number) => Text(max);

/** Quizfrage (ADR 0040 Nr. 2: nur aus einer Aussage, zwei eigene Freigaben); Antworttexte auf Deutsch. */
export const IslamAufgabeSchema = z.discriminatedUnion('typ', [
  z.strictObject({
    schluessel: Schluessel,
    typ: z.literal('auswahl'),
    aussage: Schluessel,
    frage: DeText(300),
    optionen: z.array(DeText(200)).min(2).max(6),
    richtig: z.int().min(0).max(5),
    ...IslamHerkunft,
  }),
  z.strictObject({
    schluessel: Schluessel,
    typ: z.literal('wahr_falsch'),
    aussage: Schluessel,
    behauptung: DeText(300),
    richtig: z.boolean(),
    begruendung: DeText(500),
    ...IslamHerkunft,
  }),
  z.strictObject({
    schluessel: Schluessel,
    typ: z.literal('zuordnen'),
    aussage: Schluessel,
    anweisung: DeText(300),
    paare: z
      .array(z.strictObject({ links: DeText(120), rechts: DeText(120) }))
      .min(2)
      .max(6),
    ...IslamHerkunft,
  }),
  z.strictObject({
    schluessel: Schluessel,
    typ: z.literal('reihenfolge'),
    aussage: Schluessel,
    anweisung: DeText(300),
    schritte: z.array(DeText(200)).min(2).max(10),
    ...IslamHerkunft,
  }),
  z.strictObject({
    schluessel: Schluessel,
    typ: z.literal('luecke'),
    aussage: Schluessel,
    /** Text mit genau einer Lücke `___` */
    text: DeText(400).refine((t) => t.split('___').length === 2, { message: 'genau eine Lücke ___' }),
    loesung: DeText(120),
    ablenker: z.array(DeText(120)).max(5).default([]),
    ...IslamHerkunft,
  }),
  z.strictObject({
    schluessel: Schluessel,
    typ: z.literal('fallfrage'),
    aussage: Schluessel,
    /** allgemeiner Lehrfall, keine Auskunft zu persönlichen Fällen (KERN 4.0 §2.2 Nr. 3) */
    fall: DeText(600),
    frage: DeText(300),
    optionen: z.array(DeText(200)).min(2).max(6),
    richtig: z.int().min(0).max(5),
    ...IslamHerkunft,
  }),
]);

export const IslamAussageSchema = z.strictObject({
  schluessel: Schluessel,
  text: DeText(800),
  /** Meinung innerhalb der Schule – nur wenn die Quelle sie nennt (ADR 0040 Nr. 4) */
  meinung: z.enum(['abu_hanifa', 'abu_yusuf', 'muhammad', 'zufar', 'fatwa']).optional(),
  strittig: z.boolean().default(false),
  kinderGeeignet: z.boolean().default(true),
  belege: z.array(IslamBelegSchema).min(1).max(10),
  verweise: z.array(IslamVerweisSchema).max(10).default([]),
  ...IslamHerkunft,
});

export const IslamEinheitDateiSchema = z
  .strictObject({
    format: z.literal(ISLAM_FORMAT),
    version: z.literal(1),
    status: StatusSchema,
    kurs: z.literal('islam'),
    bereich: z.enum(ISLAM_BEREICHE),
    stufe: z.enum(EIGENE_STUFEN),
    einheit: z.strictObject({
      schluessel: Schluessel,
      reihenfolge: z.int().min(1).max(999),
      thema: LernTextSchema,
      kannBeschreibungen: z.array(LernTextSchema).max(12).optional(),
      symbol: z.string().max(200).optional(),
    }),
    lektionen: z
      .array(
        z.strictObject({
          schluessel: Schluessel,
          titel: DeText(200),
          /** Pflicht je Lektion (O-9, LM-17) */
          kinderGeeignet: z.boolean(),
          aussagen: z.array(IslamAussageSchema).min(1).max(40),
          aufgaben: z.array(IslamAufgabeSchema).max(60).default([]),
        }),
      )
      .min(1)
      .max(20),
  })
  .superRefine((d, ctx) => {
    arabischFrei(d, ctx);
    const e = d.einheit.schluessel;
    if (!istSchluesselVon('islam', e) || !new RegExp(`^islam\\.${d.stufe}\\.e\\d{2}$`).test(e))
      ctx.addIssue({ code: 'custom', message: `Einheit ${e} passt nicht zu islam.${d.stufe}.eNN`, path: ['einheit', 'schluessel'] });
    const alle: string[] = [e];
    const aussagen = new Set<string>();
    d.lektionen.forEach((l, i) => {
      if (!l.schluessel.startsWith(`${e}.`) || !istSchluesselVon('islam', l.schluessel))
        ctx.addIssue({ code: 'custom', message: `Lektion-Schlüssel ${l.schluessel}`, path: ['lektionen', i, 'schluessel'] });
      alle.push(l.schluessel);
      l.aussagen.forEach((a, j) => {
        if (!a.schluessel.startsWith(`${l.schluessel}.`))
          ctx.addIssue({ code: 'custom', message: `Aussage-Schlüssel ${a.schluessel}`, path: ['lektionen', i, 'aussagen', j] });
        alle.push(a.schluessel);
        aussagen.add(a.schluessel);
        a.belege.forEach((b, k) => {
          const werk = ISLAM_WERKE[b.werk] as { art: 'fiqh' | 'aqida'; zulaessig: boolean; hoechstePassage?: number };
          const ort = ['lektionen', i, 'aussagen', j, 'belege', k];
          if (!werk.zulaessig) ctx.addIssue({ code: 'custom', message: `Werk ${b.werk} ist als Beleg zurückgestellt (LM-33)`, path: ort });
          if (!b.passage.startsWith(`${b.werk}.`)) ctx.addIssue({ code: 'custom', message: 'Passage gehört nicht zum Werk', path: ort });
          const nr = Number(b.passage.split('.ms')[1]);
          if (werk.hoechstePassage && nr > werk.hoechstePassage)
            ctx.addIssue({ code: 'custom', message: `Passage außerhalb des Registers (bis ms${werk.hoechstePassage})`, path: ort });
          // Glaubensaussagen: maturiditisch oder hanefitisch; Fiqh: hanefitische Fiqh-Werke (ADR 0040 Nr. 4)
          if (d.bereich !== 'akaid' && werk.art !== 'fiqh')
            ctx.addIssue({ code: 'custom', message: `Fiqh-Aussage braucht ein Fiqh-Werk (${b.werk})`, path: ort });
          if ((b.zitatVon === undefined) !== (b.zitatBis === undefined) || (b.zitatVon ?? 0) > (b.zitatBis ?? 0))
            ctx.addIssue({ code: 'custom', message: 'Zitatbereich: zitatVon ≤ zitatBis, beide oder keiner', path: ort });
          if (b.art === 'woertlich' && a.quelle.startsWith('ki:'))
            ctx.addIssue({ code: 'custom', message: 'KI-Aussagen sind sinngemäß, nie wörtlich (ADR 0040 Nr. 4)', path: ort });
        });
      });
      l.aufgaben.forEach((a, j) => {
        if (!a.schluessel.startsWith(`${l.schluessel}.`))
          ctx.addIssue({ code: 'custom', message: `Aufgaben-Schlüssel ${a.schluessel}`, path: ['lektionen', i, 'aufgaben', j] });
        alle.push(a.schluessel);
        if (!aussagen.has(a.aussage))
          ctx.addIssue({
            code: 'custom',
            message: `Aufgabe ohne Aussage dieser Einheit: ${a.aussage}`,
            path: ['lektionen', i, 'aufgaben', j],
          });
        if ((a.typ === 'auswahl' || a.typ === 'fallfrage') && a.richtig >= a.optionen.length)
          ctx.addIssue({ code: 'custom', message: 'richtig außerhalb der Optionen', path: ['lektionen', i, 'aufgaben', j] });
      });
      // Aussagen müssen vor ihren Aufgaben stehen: Aufgaben nur zu Aussagen derselben oder früherer Lektionen
    });
    eindeutig(alle, ctx, [], 'Schlüssel');
  });
export type IslamEinheitDatei = z.infer<typeof IslamEinheitDateiSchema>;

// ——— Koran-Arabisch-Pfad `koran/pfad.json` (ADR 0040 Nr. 5; nur Verweise, keine Bedeutungen, kein Arabisch) ———

export const KORAN_FORMAT = 'igmg-lernapp-koran-pfad';
/** Wortform als Verweis `sure:vers:wort` in den gepinnten Tanzil-Text (Wortzählung wie `quran_wortform`). */
export const WortformVerweisSchema = z
  .string()
  .regex(/^\d{1,3}:\d{1,3}:\d{1,3}$/, { message: 'Wortform: sure:vers:wort' })
  .refine((v) => {
    const [s, vers, w] = v.split(':').map(Number);
    return s! >= 1 && s! <= 114 && vers! >= 1 && w! >= 1;
  }, 'Wortform außerhalb des Korans');

export const KoranPfadDateiSchema = z
  .strictObject({
    format: z.literal(KORAN_FORMAT),
    version: z.literal(1),
    kurs: z.literal('koran'),
    einheiten: z
      .array(
        z.strictObject({
          schluessel: Schluessel,
          stufe: z.enum(EIGENE_STUFEN),
          reihenfolge: z.int().min(1).max(999),
          thema: LernTextSchema,
          lektionen: z
            .array(
              z.strictObject({
                schluessel: Schluessel,
                /** Wortformen der Lektion; Bedeutungen nur aus `quran_wortbedeutung` mit zwei Freigaben (LM-13) */
                wortformen: z.array(WortformVerweisSchema).min(1).max(60),
                aufgaben: z
                  .array(
                    z.strictObject({
                      schluessel: Schluessel,
                      typ: z.literal('koran_wort'),
                      /** `wurzel` erst mit geprüfter Wurzeltabelle (LM-31) */
                      art: z.enum(['bedeutung', 'wortform', 'wurzel']),
                      wortform: WortformVerweisSchema,
                      ablenker: z.array(WortformVerweisSchema).min(1).max(5),
                    }),
                  )
                  .max(40)
                  .default([]),
              }),
            )
            .min(1)
            .max(20),
        }),
      )
      .max(60),
  })
  .superRefine((d, ctx) => {
    arabischFrei(d, ctx);
    const alle: string[] = [];
    d.einheiten.forEach((e, i) => {
      if (!new RegExp(`^koran\\.${e.stufe}\\.e\\d{2}$`).test(e.schluessel))
        ctx.addIssue({ code: 'custom', message: `Einheit ${e.schluessel}: koran.<stufe>.eNN`, path: ['einheiten', i, 'schluessel'] });
      alle.push(e.schluessel);
      e.lektionen.forEach((l, j) => {
        if (!l.schluessel.startsWith(`${e.schluessel}.`) || !istSchluesselVon('koran', l.schluessel))
          ctx.addIssue({ code: 'custom', message: `Lektion-Schlüssel ${l.schluessel}`, path: ['einheiten', i, 'lektionen', j] });
        alle.push(l.schluessel);
        const formen = new Set(l.wortformen);
        l.aufgaben.forEach((a, k) => {
          alle.push(a.schluessel);
          if (!a.schluessel.startsWith(`${l.schluessel}.`) || !formen.has(a.wortform) || a.ablenker.includes(a.wortform))
            ctx.addIssue({
              code: 'custom',
              message: `Aufgabe ${a.schluessel}: Wortform nicht in der Lektion`,
              path: ['einheiten', i, 'lektionen', j, 'aufgaben', k],
            });
        });
      });
    });
    eindeutig(alle, ctx, [], 'Schlüssel');
  });
export type KoranPfadDatei = z.infer<typeof KoranPfadDateiSchema>;

// ——— Aussprache-Überschreibungen `aussprache/<sprache>.json` (ADR 0039 Nr. 6.2, PLAN §6.8) ———

export const AUSSPRACHE_FORMAT = 'igmg-lernapp-aussprache';
export const AusspracheDateiSchema = z
  .strictObject({
    format: z.literal(AUSSPRACHE_FORMAT),
    version: z.literal(1),
    sprache: z.enum(SPRACHEN),
    eintraege: z
      .array(
        z.strictObject({
          /** Wort oder Wortgruppe, wie es im Inhalt steht */
          text: Text(120),
          /** Schreibung für die Sprachausgabe (z. B. getrennt, voll vokalisiert) */
          ersatz: Text(200).optional(),
          /** Phonemfolge der Engine (IPA bzw. Engine-Alphabet) */
          phoneme: z.string().trim().min(1).max(200).optional(),
          ganzesWort: z.boolean().default(true),
          /** nur für diese Stimmen (`tts:<modell>@<sha>`); ohne Angabe für alle */
          stimmen: z.array(z.string().max(120)).max(10).optional(),
          grund: z.string().trim().max(300).optional(),
          quelle: QuelleSchema,
        }),
      )
      .max(10_000),
  })
  .superRefine((d, ctx) => {
    d.eintraege.forEach((e, i) => {
      if (!e.ersatz && !e.phoneme) ctx.addIssue({ code: 'custom', message: 'ersatz oder phoneme', path: ['eintraege', i] });
    });
    eindeutig(
      d.eintraege.map((e) => e.text),
      ctx,
      ['eintraege'],
      'Text',
    );
  });
export type AusspracheDatei = z.infer<typeof AusspracheDateiSchema>;

// ——— Audio-Manifest `audio-manifest/<sprache>.json` (ADR 0039 Nr. 6.4, Fortschreibung S4/S5; KERN 4.0 §4) ———

export const AUDIO_MANIFEST_FORMAT = 'igmg-lernapp-audio-manifest';
/** Stimme: `tts:<modell>@<sha>`, `mensch:<sprecherId>` (Vereinbarung Pflicht) oder `test:<name>` (synthetische Töne). */
export const StimmeSchema = z.string().regex(/^(?:tts:[a-z0-9._-]{1,80}@[0-9a-f]{7,64}|mensch:[0-9a-f-]{36}|test:[a-z0-9-]{1,40})$/, {
  message: 'Stimme: tts:<modell>@<sha>, mensch:<id> oder test:<name>',
});
export const AudioManifestDateiSchema = z
  .strictObject({
    format: z.literal(AUDIO_MANIFEST_FORMAT),
    version: z.literal(1),
    sprache: z.enum(SPRACHEN),
    stimmen: z
      .array(
        z.strictObject({
          id: StimmeSchema,
          art: z.enum(['sprachausgabe', 'mensch', 'test']),
          bezeichnung: Text(200),
          engine: z.string().max(120).optional(),
          /** Lizenz von Modell bzw. Gewichten und der Trainingsdaten (ADR 0045 Nr. 11, freie Kette) */
          modellLizenz: z.string().max(60).optional(),
          datenLizenz: z.string().max(60).optional(),
          /** Namensnennung in der App und auf `/quellen` */
          namensnennung: Text(600),
          /** Wasserzeichen des Modells (offengelegt, z. B. Chatterbox) */
          wasserzeichen: z.boolean().default(false),
        }),
      )
      .max(50),
    clips: z
      .array(
        z.strictObject({
          textHash: Hex64,
          buendel: z.string().regex(/^lernapp\/audio\/(?:de|tr|ar)\/[a-z0-9.-]+-[0-9a-f]{16}\.lpa$/),
          versatz: z.int().min(0),
          laenge: z.int().min(1),
          dauerMs: z.int().min(1),
          stimme: StimmeSchema,
          sha256: Hex64,
          format: z.literal('webm-opus'),
        }),
      )
      .max(200_000),
  })
  .superRefine((d, ctx) => {
    const stimmen = new Map(d.stimmen.map((s) => [s.id, s]));
    d.stimmen.forEach((s, i) => {
      const praefix = { sprachausgabe: 'tts:', mensch: 'mensch:', test: 'test:' }[s.art];
      if (!s.id.startsWith(praefix))
        ctx.addIssue({ code: 'custom', message: `Stimme ${s.id} passt nicht zu ${s.art}`, path: ['stimmen', i] });
    });
    eindeutig(
      d.stimmen.map((s) => s.id),
      ctx,
      ['stimmen'],
      'Stimme',
    );
    d.clips.forEach((c, i) => {
      if (!stimmen.has(c.stimme))
        ctx.addIssue({ code: 'custom', message: `Stimme ${c.stimme} nicht im Manifest`, path: ['clips', i, 'stimme'] });
      if (!c.buendel.startsWith(`lernapp/audio/${d.sprache}/`))
        ctx.addIssue({ code: 'custom', message: 'Bündel einer anderen Sprache', path: ['clips', i, 'buendel'] });
    });
    eindeutig(
      d.clips.map((c) => `${c.textHash}|${c.stimme}`),
      ctx,
      ['clips'],
      'Clip (textHash, Stimme)',
    );
  });
export type AudioManifestDatei = z.infer<typeof AudioManifestDateiSchema>;

// ——— Bildkarten `symbole/symbole.json` (KERN 4.0 §5, §7; ADR 0045 Nr. 9; Motivliste LM-34) ———

export const SYMBOLE_FORMAT = 'igmg-lernapp-symbole';
/**
 * Lizenz je Herkunft: Lucide ISC, Tabler MIT, OpenMoji 17.0.0 CC BY-SA 4.0 (Namensnennung), eigene Zeichnung (`eigen:`,
 * `redaktion`) CC BY-SA 4.0 oder CC0.
 */
const SYMBOL_LIZENZ: Record<string, readonly string[]> = {
  lucide: ['ISC'],
  tabler: ['MIT'],
  openmoji: ['CC-BY-SA-4.0'],
  eigen: ['CC-BY-SA-4.0', 'CC0-1.0'],
  redaktion: ['CC-BY-SA-4.0', 'CC0-1.0'],
};
const SymbolZahl = z.number().min(-48).max(48);
const SymbolPunkte = z.string().regex(/^[0-9.,\s-]{1,1000}$/, { message: 'nur Zahlen' });
/** Grundformen im 24er Raster (wie Lucide sie liefert): nur Zahlen bzw. Pfaddaten, keine Skripte, keine Verweise. */
const SymbolElementSchema = z.discriminatedUnion('art', [
  z.strictObject({
    art: z.literal('path'),
    d: z.string().regex(/^[MmLlHhVvCcSsQqTtAaZz0-9.,\s-]{1,2000}$/, { message: 'nur SVG-Pfaddaten' }),
  }),
  z.strictObject({ art: z.literal('circle'), cx: SymbolZahl, cy: SymbolZahl, r: SymbolZahl }),
  z.strictObject({ art: z.literal('ellipse'), cx: SymbolZahl, cy: SymbolZahl, rx: SymbolZahl, ry: SymbolZahl }),
  z.strictObject({
    art: z.literal('rect'),
    x: SymbolZahl,
    y: SymbolZahl,
    width: SymbolZahl,
    height: SymbolZahl,
    rx: SymbolZahl.optional(),
    ry: SymbolZahl.optional(),
  }),
  z.strictObject({ art: z.literal('line'), x1: SymbolZahl, y1: SymbolZahl, x2: SymbolZahl, y2: SymbolZahl }),
  z.strictObject({ art: z.literal('polyline'), points: SymbolPunkte }),
  z.strictObject({ art: z.literal('polygon'), points: SymbolPunkte }),
]);
/**
 * Register der Bildkarten (Format wie `lib/lernapp/symbole.ts`, erzeugt mit `scripts/lernapp/symbole.mjs`): je Motiv-Schlüssel
 * Motiv (deutsch, aus der Motivliste des Leitfadens), Gruppe, Herkunft, Lizenz, Freigabe der Redaktion (LM-34) und Geometrie.
 */
export const SymbolDateiSchema = z
  .strictObject({
    _hinweis: z.string().max(2000).optional(),
    format: z.literal(SYMBOLE_FORMAT),
    version: z.literal(1),
    symbole: z.record(
      z
        .string()
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
        .max(60),
      z.strictObject({
        motiv: Text(120),
        gruppe: z.string().regex(/^[a-z]{1,40}$/),
        quelle: z
          .string()
          .regex(
            /^(?:lucide:[a-z0-9-]+@\d+\.\d+\.\d+|tabler:[a-z0-9-]+@\d+\.\d+\.\d+|openmoji:[0-9A-F-]+@17\.0\.0|eigen:[a-z0-9-]+|redaktion)$/,
          ),
        lizenz: z.enum(['ISC', 'MIT', 'CC0-1.0', 'CC-BY-SA-4.0']),
        namensnennung: Text(300).optional(),
        /** Freigabe der Motivliste durch die Redaktion (LM-34); ohne sie nur im Testkurs */
        freigegeben: z.boolean(),
        elemente: z.array(SymbolElementSchema).min(1).max(40),
      }),
    ),
  })
  .superRefine((d, ctx) => {
    arabischFrei(d, ctx);
    if (Object.keys(d.symbole).length > 3000) ctx.addIssue({ code: 'custom', message: 'höchstens 3000 Symbole', path: ['symbole'] });
    for (const [id, s] of Object.entries(d.symbole)) {
      const herkunft = s.quelle.split(':')[0]!;
      if (!SYMBOL_LIZENZ[herkunft]?.includes(s.lizenz))
        ctx.addIssue({ code: 'custom', message: `Lizenz ${s.lizenz} passt nicht zu ${herkunft}`, path: ['symbole', id, 'lizenz'] });
      if (herkunft === 'openmoji' && !s.namensnennung)
        ctx.addIssue({ code: 'custom', message: 'OpenMoji braucht Namensnennung', path: ['symbole', id, 'namensnennung'] });
    }
  });
export type SymbolDatei = z.infer<typeof SymbolDateiSchema>;

/** Arten aller Inhaltsdateien unter `web/inhalte/lernapp/` (ohne die erzeugten `schemas/`). */
export type WeitereDatei =
  | { art: 'rahmen'; daten: RahmenDatei }
  | { art: 'leitfaden'; daten: Leitfaden }
  | { art: 'islam'; daten: IslamEinheitDatei }
  | { art: 'koran'; daten: KoranPfadDatei }
  | { art: 'aussprache'; daten: AusspracheDatei }
  | { art: 'audio_manifest'; daten: AudioManifestDatei }
  | { art: 'symbole'; daten: SymbolDatei };

/** Schemas je Dateiart (Name der JSON-Schema-Datei unter `web/inhalte/lernapp/schemas/`). */
export const DATEI_SCHEMAS = {
  'sprache-einheit': SprachEinheitDateiSchema,
  uebersetzung: UebersetzungDateiSchema,
  rahmen: RahmenDateiSchema,
  leitfaden: LeitfadenSchema,
  'islam-einheit': IslamEinheitDateiSchema,
  'koran-pfad': KoranPfadDateiSchema,
  aussprache: AusspracheDateiSchema,
  'audio-manifest': AudioManifestDateiSchema,
  symbole: SymbolDateiSchema,
} as const;

/**
 * Art einer Datei nach ihrem Pfad relativ zu `web/inhalte/lernapp/` (PLAN §6.1). `null`: keine Inhaltsdatei (z. B. die
 * Markdown-Fassung des Rahmenplans); `'unbekannt'`: JSON an einem nicht vorgesehenen Ort.
 */
export function dateiArtVon(pfad: string): keyof typeof DATEI_SCHEMAS | 'unbekannt' | null {
  if (!pfad.endsWith('.json')) return null;
  if (/^schemas\/[a-z-]+\.schema\.json$/.test(pfad)) return null;
  if (pfad === 'rahmen/leitfaden.json') return 'leitfaden';
  if (/^rahmen\/(?:de|tr|ar)\.rahmen\.json$/.test(pfad)) return 'rahmen';
  if (/^sprache\//.test(pfad)) return 'sprache-einheit';
  if (/^uebersetzung\//.test(pfad)) return 'uebersetzung';
  if (/^islam\//.test(pfad)) return 'islam-einheit';
  if (pfad === 'koran/pfad.json') return 'koran-pfad';
  if (/^aussprache\/(?:de|tr|ar)\.json$/.test(pfad)) return 'aussprache';
  if (/^audio-manifest\/(?:de|tr|ar)\.json$/.test(pfad)) return 'audio-manifest';
  if (pfad === 'symbole/symbole.json') return 'symbole';
  return 'unbekannt';
}

/** Weitere Inhaltsdatei nach ihrem Pfad prüfen (Sprache und Übersetzung: {@link pruefeInhaltDatei}). */
export function pruefeWeitereDatei(pfad: string, roh: unknown): { ok: true; datei: WeitereDatei } | { ok: false; fehler: string[] } {
  const art = dateiArtVon(pfad);
  const fehler = (e: z.ZodError) => ({ ok: false as const, fehler: e.issues.map((i) => `${i.path.join('.') || '$'}: ${i.message}`) });
  const gleich = (erwartet: string, ist: string | undefined) =>
    ist === erwartet ? null : { ok: false as const, fehler: [`gehört nach ${erwartet}`] };
  switch (art) {
    case 'rahmen': {
      const r = RahmenDateiSchema.safeParse(roh);
      if (!r.success) return fehler(r.error);
      return gleich(`rahmen/${r.data.sprache}.rahmen.json`, pfad) ?? { ok: true, datei: { art: 'rahmen', daten: r.data } };
    }
    case 'leitfaden': {
      const r = LeitfadenSchema.safeParse(roh);
      return r.success ? { ok: true, datei: { art: 'leitfaden', daten: r.data } } : fehler(r.error);
    }
    case 'islam-einheit': {
      const r = IslamEinheitDateiSchema.safeParse(roh);
      if (!r.success) return fehler(r.error);
      return (
        gleich(`islam/${r.data.bereich}/${r.data.einheit.schluessel}.json`, pfad) ?? { ok: true, datei: { art: 'islam', daten: r.data } }
      );
    }
    case 'koran-pfad': {
      const r = KoranPfadDateiSchema.safeParse(roh);
      return r.success ? { ok: true, datei: { art: 'koran', daten: r.data } } : fehler(r.error);
    }
    case 'aussprache': {
      const r = AusspracheDateiSchema.safeParse(roh);
      if (!r.success) return fehler(r.error);
      return gleich(`aussprache/${r.data.sprache}.json`, pfad) ?? { ok: true, datei: { art: 'aussprache', daten: r.data } };
    }
    case 'audio-manifest': {
      const r = AudioManifestDateiSchema.safeParse(roh);
      if (!r.success) return fehler(r.error);
      return gleich(`audio-manifest/${r.data.sprache}.json`, pfad) ?? { ok: true, datei: { art: 'audio_manifest', daten: r.data } };
    }
    case 'symbole': {
      const r = SymbolDateiSchema.safeParse(roh);
      return r.success ? { ok: true, datei: { art: 'symbole', daten: r.data } } : fehler(r.error);
    }
    case 'sprache-einheit':
    case 'uebersetzung':
      return { ok: false, fehler: ['Sprach- und Übersetzungsdateien prüft pruefeInhaltDatei'] };
    case 'unbekannt':
      return { ok: false, fehler: ['keine vorgesehene Inhaltsdatei (PLAN §6.1)'] };
    case null:
      return { ok: false, fehler: ['keine Inhaltsdatei'] };
  }
}

export type InhaltDatei = { art: 'sprache'; daten: SprachEinheitDatei } | { art: 'uebersetzung'; daten: UebersetzungDatei };

/** Inhaltsdatei nach ihrem `format` prüfen. */
export function pruefeInhaltDatei(roh: unknown): { ok: true; datei: InhaltDatei } | { ok: false; fehler: string[] } {
  const format = (roh as { format?: unknown } | null)?.format;
  const ergebnis =
    format === SPRACH_FORMAT
      ? SprachEinheitDateiSchema.safeParse(roh)
      : format === UEBERSETZUNG_FORMAT
        ? UebersetzungDateiSchema.safeParse(roh)
        : null;
  if (!ergebnis) return { ok: false, fehler: [`format unbekannt: ${String(format)}`] };
  if (!ergebnis.success) return { ok: false, fehler: ergebnis.error.issues.map((i) => `${i.path.join('.') || '$'}: ${i.message}`) };
  return format === SPRACH_FORMAT
    ? { ok: true, datei: { art: 'sprache', daten: ergebnis.data as SprachEinheitDatei } }
    : { ok: true, datei: { art: 'uebersetzung', daten: ergebnis.data as UebersetzungDatei } };
}

/** Erwarteter Ablageort einer Inhaltsdatei relativ zu `web/inhalte/lernapp/` (prüft `lernapp:pruefen`). */
export function erwarteterPfad(d: InhaltDatei): string {
  if (d.art === 'sprache') return `sprache/${d.daten.kurs}/${d.daten.stufe}/${d.daten.einheit.schluessel}.json`;
  const stufe = d.daten.einheit.split('.')[1] ?? '';
  return `uebersetzung/${d.daten.richtung}/${stufe}/${d.daten.einheit}.json`;
}

export type { RichtungId, Sprache };
