import { z } from 'zod';
import { SchriftArSchema } from '../aufgaben/schrift_ar';
import { RICHTUNGEN, SPRACH_STUFEN, SPRACHEN, istSchluesselVon, zerlegeRichtung, type RichtungId, type Sprache } from '../kurse';

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
 * daraus je Richtung die Aufgaben des Spielers (aufgaben/schema.ts). L1 kennt `auswahl`, `wortbank` und `paare`; L2-02 ergänzt
 * `dialog`, `geschichte`, `lesen_fragen`, `grammatik_tipp`, `schrift_ar`, `schrift_tr`, `schrift_latein`, `sprechen` und
 * `schreiben`; die übrigen Typen aus PLAN §4 folgen hier und im Paketbau.
 *
 * Schlüssel (stabil, `kurse.ts` `istSchluesselVon`): Einheit `<kurs>.<stufe>.eNN`; alles der Einheit beginnt mit dem
 * Einheitenschlüssel (`….w001` Lemma, `….s0001` Satz, `….l01` Lektion, `….l01.a01` Aufgabe, `….<ausgang>.t01` Tipp).
 * Verweise dürfen auf Lemmata und Sätze anderer Einheiten desselben Kurses zeigen (Wiederholung früherer Wörter).
 *
 * Herkunft je Eintrag (ADR 0045, KERN 4.0 §1): `quelle` (`ki:<lauf>…`, `tatoeba:<id>`, `kaikki:<id>`, `redaktion`,
 * `test:<name>` nur im Testkurs), `lizenz` aus {@link ERLAUBTE_LIZENZEN}, `namensnennung` wo die Lizenz sie verlangt.
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
  .regex(/^(?:ki:[A-Za-z0-9._/:-]{1,180}|tatoeba:\d{1,12}|kaikki:[A-Za-z0-9._:-]{1,120}|redaktion|test:[a-z0-9-]{1,60})$/, {
    message: 'Quelle: ki:<lauf>, tatoeba:<id>, kaikki:<id>, redaktion oder test:<name>',
  });

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
  /** Symbol der Bildkarte (Pfad aus `web/inhalte/lernapp/symbole/`, KERN 4.0 §5) */
  symbol: z.string().max(200).optional(),
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
      return [a.ziel, ...a.ablenker];
    case 'wortbank':
      return [a.satz];
    case 'paare':
      return [...a.lemmata];
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
        if (a.typ === 'auswahl' && new Set([a.ziel, ...a.ablenker]).size !== a.ablenker.length + 1)
          ctx.addIssue({ code: 'custom', message: 'Ablenker doppelt oder gleich dem Ziel', path: ['lektionen', i, 'aufgaben', j] });
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
