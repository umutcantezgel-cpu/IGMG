import { begriffTeile as teile, lateinFormeln, passtWort as passt } from '../../formelkandidat';
import { SPRACH_STUFEN, type Sprache } from '../../kurse';
import { textHash } from '../../paket/hash';
import { type Leitfaden, verweiseVon } from '../schema';
import type { Inhalte } from './dateien';
import { ladeKaikki } from './daten';
import { arabischeKandidaten, arabischNormal } from './sprache';
import { arabischBekannt, tabuWoerter } from './tabu';
import type { SprachStufe, TextEintrag } from './texte';
import { Befunde } from './typen';

/**
 * Prüfer „Religionsbezug“ (Leitfaden `religionsbezug`, KERN 4.0 §2.3, §4; ADR 0045 Fortschreibung S7 Nr. 4):
 *
 * - **Kandidaten aus dem Leitfaden:** Begriffe aus `orte_ereignisse` (R-NN, de/tr, ar über kaikki wie im Tabu-Prüfer) verlangen
 *   `religionsbezug: true` → sonst `menschlich_klaeren` (Kandidat, z. B. tr. „hoca“ ist auch die Lehrkraft). Gekennzeichnet,
 *   aber unter `ab_stufe` → ebenfalls an Menschen. Den harten, „fail closed“ Teil leistet das Formel-Lexikon des Wächters
 *   (`religion.ts`).
 * - **Formeln der Formelliste** (F-de, F-tr in Lateinschrift; F-ar über dieselben Umschrift-Muster wie die R-Kandidaten, also
 *   die Namen der Formeln, soweit kaikki sie auflöst; Stufe C N2, Z-L10): Solange die Liste `gesperrt` ist (LM-09, KERN 4.0
 *   §2.3), ist ein Treffer ohne Kennzeichen **blockierend**; mit Kennzeichen geht er an Menschen (der Eintrag bleibt bis zur
 *   Listenfreigabe verborgen, `freigabe.ts`). Bei freigegebener Liste gilt wie bei den R-Kandidaten `menschlich_klaeren` ohne
 *   Kennzeichen. Arabische F-Kandidaten sind schärfer gefasst: Namen, die kaikki auch als Alltagswort ohne Thema Religion
 *   führt, zählen nicht (Name des Grußes = „Frieden“); ein Treffer verlangt, dass die Vokalzeichen im Text denen der kaikki-
 *   Form nicht widersprechen (`vokalVertraeglich`) und keine Tāʾ marbūṭa als Pronomen abgetrennt ist. Deutsche Zusätze
 *   („ʿĪd-Gruß“) fallen vor der Auflösung weg. **Wirksam** ist der arabische Zweig heute für keinen der 17 Einträge (Stand
 *   26.10.2026, `formelMusterZahl`, im Unit-Test festgehalten): Die meisten Namen stehen nicht im kaikki-Kernauszug, die
 *   übrigen sind als Alltagswort mehrdeutig. Arabische Formeln schützt damit nur das Formel-Lexikon des Wächters; was dort
 *   fehlt (Fest-, Ramadan-, Freitagsgruß), ergänzt nur ein Mensch (LM-09).
 * - **Arabisch:** Wörter in der Vergleichsform des Wächters ohne Klitika; ein bekanntes Wort des kaikki-Kernauszugs wird nicht
 *   falsch zerlegt (`arabischeKandidaten`; sonst ergäbe „weit“ nach bi- das Wort für Fest). Die Vergleichsform
 *   macht Alif mit Hamza oben und unten gleich; ein Treffer verlangt deshalb zusätzlich, dass kein Alif im Text ein anderes
 *   Hamza bzw. Madda trägt als im Muster (Alif ohne Zeichen passt zu allen). So trifft das Wort für „vor/vorn“ (Hamza oben)
 *   nicht das für den Vorbeter (Hamza unten). Der Wächter selbst bleibt unverändert.
 * - **kaikki-Thema Religion/Islam** (ADR 0045 Fortschreibung S7 Nr. 4): Ein Lemma mit Quelle `wiktionary:<ausgabe>:<titel>`, dessen
 *   Artikel im Kernauszug das Thema Religion/Islam trägt, ist ohne Kennzeichen ein Hinweis (Kandidat für Kennzeichen und
 *   Formel-Lexikon). Wörter im Fließtext werden nicht so geprüft: Viele Alltagswörter haben eine religiöse Nebenbedeutung.
 * - **nie Lernziel** (Leitfaden `religionsbezug.regeln`): Ein Prüfstein verweist nie auf gekennzeichnete Einträge (blockierend).
 * - **keine Sprachausgabe** (KERN 4.0 §4): Kein Clip im Audio-Manifest gehört zu einem gekennzeichneten Text oder zu einem
 *   Text des Wissenskurses (blockierend).
 */

/**
 * Arabisches Muster: Vergleichsform → dieselben Wörter mit Hamza-Platzhaltern (`h`, `hamzaWoerter`) und ihren kurzen Vokalen
 * je Buchstabe (`v`, `vokalFolge`; leer, wenn sie sich nicht zuordnen lassen).
 */
type ArForm = { h: string; v: readonly (string | null)[] };
type ArMuster = Map<string, ArForm[]>;
type Begriff = {
  id: string;
  abStufe: SprachStufe | null;
  latein: Partial<Record<'de' | 'tr', string[][]>>;
  ar: ArMuster[][];
  /** Formel aus `formeln.liste` (F-…): bei gesperrter Liste ohne Kennzeichen blockierend */
  formel: boolean;
};

/** Thema Religion im kaikki-Kernauszug (`mk`). */
const RELIGIONS_THEMA = /^thema:(?:islam|religion|christianity|judaism|theology|bible|biblical)$/i;

/**
 * Platzhalter für Alif mit Hamza oben, Hamza unten und Madda: Buchstaben, die die Normalisierung des Wächters unverändert
 * lässt und die im Arabischen nicht vorkommen. So stehen die Wörter mit Hamza an derselben Stelle wie in `tabuWoerter`.
 */
const HAMZA_ALIF: Record<string, string> = { '\u0623': '\u06C6', '\u0625': '\u06C7', '\u0622': '\u06C8' };
const PLATZHALTER = new Set(Object.values(HAMZA_ALIF));
/**
 * Platzhalter für Tāʾ marbūṭa (in der Vergleichsform Hāʾ): Die Kandidaten ohne Klitika trennen ein Hāʾ als Pronomen ab, eine
 * Tāʾ marbūṭa ist aber nie ein Pronomen (sonst träfe der Name des Friedensgrußes das Wort für „Sicherheit“ im Abschiedsgruß).
 */
const TA_MARBUTA = '\u06C9';
/** Wörter eines arabischen Texts wie `tabuWoerter`, aber Alif mit Hamza bzw. Madda und Tāʾ marbūṭa als Platzhalter. */
const hamzaWoerter = (text: string) =>
  tabuWoerter(
    text
      .normalize('NFC')
      .replace(/[\u0622\u0623\u0625]/g, (z) => HAMZA_ALIF[z]!)
      .replace(/\u0629/g, TA_MARBUTA),
    'ar',
  );

/** Kurze Vokale (Fatha, Damma, Kasra) und Sukun; Schadda und Tanwin bleiben außen vor. */
const VOKAL = /[\u064E\u064F\u0650\u0652]/;
const BUCHSTABE = /^[\u0621-\u064A\u0671-\u06D3]$/;

/**
 * Wörter eines arabischen Texts als Folgen der kurzen Vokale je Buchstabe (null = ohne Vokal), Buchstabe für Buchstabe
 * wie `tabuWoerter` (gleiche Zerlegung, gleiche Normalisierung je Zeichen).
 */
function vokalWoerter(text: string): (string | null)[][] {
  const woerter: (string | null)[][] = [];
  for (const roh of text.normalize('NFC').split(/\s+/u)) {
    let wort: (string | null)[] = [];
    for (const z of roh.normalize('NFKD')) {
      if (VOKAL.test(z)) {
        if (wort.length) wort[wort.length - 1] = z;
        continue;
      }
      const n = arabischNormal(z);
      if (!n) continue;
      if (BUCHSTABE.test(n)) wort.push(null);
      else if (wort.length) {
        woerter.push(wort);
        wort = [];
      }
    }
    if (wort.length) woerter.push(wort);
  }
  return woerter;
}

/** Vokalfolge eines Worts (ein Eintrag je Buchstabe der Vergleichsform). */
const vokalFolge = (wort: string): (string | null)[] => vokalWoerter(wort).flat();

/**
 * Widersprechen die Vokale des Texts an der Fundstelle denen des Musters? Nur Buchstaben, an denen beide einen kurzen Vokal
 * tragen; der letzte Buchstabe des Musters zählt nicht (Kasus- und Modusendungen).
 */
function vokalVertraeglich(text: readonly (string | null)[], muster: readonly (string | null)[]): boolean {
  for (let i = 0; i < muster.length - 1 && i < text.length; i++) {
    const a = text[i];
    const b = muster[i];
    if (a && b && a !== b) return false;
  }
  return true;
}
/** Gleich bis auf Alif: verschieden nur, wo beide ein Alif mit verschiedenem Hamza bzw. Madda tragen. */
function hamzaVertraeglich(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i] && PLATZHALTER.has(a[i]!) && PLATZHALTER.has(b[i]!)) return false;
  return true;
}

/** Deutscher Zusatz am Namen einer arabischen Formel („-Gruß“, „-Formel“): gehört nicht zur Umschrift. */
const ohneDeutschenZusatz = (t: string) => t.replace(/-\p{Lu}\p{Ll}+$/u, '');

function begriffe(leitfaden: Leitfaden, daten: string): Begriff[] {
  const tabelle = leitfaden.umschrift.din_zu_wiktionary;
  // je Umschrift die Wörter (ohne Vokale wie bisher), ihre vokalisierte Form (`kanon` bzw. Plural) und ob der Artikel das
  // Thema Religion trägt
  type RomWort = { w: string; vokalisiert: string; religioes: boolean };
  const rom = new Map<string, RomWort[]>();
  for (const e of ladeKaikki('ar', daten))
    if (e.rom) {
      const k = e.rom.normalize('NFC').toLowerCase();
      const religioes = (e.mk ?? []).some((x) => RELIGIONS_THEMA.test(x));
      rom.set(k, [
        ...(rom.get(k) ?? []),
        { w: e.w, vokalisiert: e.kanon ?? e.w, religioes },
        ...(e.pl ?? []).map((p) => ({ w: p, vokalisiert: p, religioes })),
      ]);
    }
  /** Muster je Wort der Umschrift; `eindeutig`: jedes aufgelöste Wort trägt im kaikki-Artikel das Thema Religion. */
  const umschrift = (u: string): { folge: ArMuster[]; eindeutig: boolean } | null => {
    const folge: ArMuster[] = [];
    let eindeutig = true;
    for (const wort of u.split(/\s+/).filter(Boolean)) {
      let r = wort.normalize('NFC').toLowerCase();
      for (const [din, wikt] of Object.entries(tabelle)) r = r.split(din.toLowerCase()).join(wikt);
      r = r.replace(/^(?:a[lšṣṭḍẓṯḏnrstdz]-|l-)/u, '');
      const varianten = [r, `ʔ${r}`, r.replace(/ī$/, 'iyy')];
      const muster: ArMuster = new Map();
      for (const x of varianten.flatMap((v) => rom.get(v) ?? [])) {
        const n = arabischNormal(x.w);
        if (n.length < 2) continue;
        if (!x.religioes) eindeutig = false;
        // ohne verwertbare Hamza-Form gilt die Vergleichsform selbst (Alif ohne Zeichen passt zu allen)
        const h = hamzaWoerter(x.w).join('');
        const v = arabischNormal(x.vokalisiert) === n ? vokalFolge(x.vokalisiert) : [];
        muster.set(n, [...(muster.get(n) ?? []), { h: h.length === n.length ? h : n, v: v.length === n.length ? v : [] }]);
      }
      if (!muster.size) return null;
      folge.push(muster);
    }
    return folge.length ? { folge, eindeutig } : null;
  };
  const ab = (s: string | undefined) => (s ? (s.toLowerCase() as SprachStufe) : null);
  const ergebnis: Begriff[] = leitfaden.religionsbezug.orte_ereignisse.map((o) => ({
    id: o.id,
    abStufe: ab(o.ab_stufe),
    latein: { de: teile(o.de).map((t) => tabuWoerter(t, 'de')), tr: teile(o.tr).map((t) => tabuWoerter(t, 'tr')) },
    ar: o.ar
      ? teile(o.ar)
          .flatMap((t) => umschrift(t)?.folge ?? [])
          .map((m) => [m])
      : [],
    formel: false,
  }));
  for (const f of leitfaden.religionsbezug.formeln.liste)
    ergebnis.push(
      f.sprache === 'ar'
        ? {
            id: f.id,
            abStufe: null,
            latein: {},
            // Namen der Formeln in Umschrift (z. B. „Ḥamdala“). Was kaikki nicht auflöst, fällt weg – ebenso Namen, die kaikki
            // (auch) als Alltagswort ohne Thema Religion führt: Der Name des Grußes ist zugleich „Frieden“, der der
            // Schwurformel „Eid“; ihr Treffer sagt nichts über eine Formel (Stand 25.10.2026: 14 bzw. 94 Fehltreffer in den
            // Inhalten, u. a. „in Frieden leben“, „Abteilung“). Den Gruß selbst fängt das Formel-Lexikon des Wächters.
            ar: teile(f.begriff)
              .flatMap((t) => umschrift(ohneDeutschenZusatz(t)) ?? [])
              .filter((x) => x.eindeutig)
              .flatMap((x) => x.folge)
              .map((m) => [m]),
            formel: true,
          }
        : {
            id: f.id,
            abStufe: null,
            // gleiche Wortfolgen wie im Paketbau und in der Verwaltung (`formelkandidat.ts`)
            latein: Object.fromEntries(lateinFormeln([f]).map((x) => [x.sprache, x.folgen.map((w) => [...w])])),
            ar: [],
            formel: true,
          },
    );
  return ergebnis;
}

/**
 * Wirksamkeit der Formelliste im Prüfer: je Eintrag (F-…) die Zahl seiner Muster (lateinische Wortfolgen bzw. arabische
 * Muster aus der kaikki-Umschrift). 0 heißt: Der Prüfer erkennt diese Formel nicht (Stand 26.10.2026 alle 17 F-ar-Einträge:
 * nicht in kaikki, deutscher Zusatz oder als Alltagswort mehrdeutig) – dann schützt nur das Formel-Lexikon des Wächters.
 */
export function formelMusterZahl(leitfaden: Leitfaden, daten: string): Map<string, number> {
  return new Map(
    begriffe(leitfaden, daten)
      .filter((b) => b.formel)
      .map((b) => [b.id, b.ar.length + Object.values(b.latein).reduce((n, folgen) => n + folgen.filter((f) => f.length).length, 0)]),
  );
}

/** Strengerer Vergleich für Formeln (F-Kandidaten): Vokale des Worts im Text, sofern sie sich zuordnen lassen. */
type Streng = { vokale: readonly (string | null)[] | undefined };

/**
 * Passt das Muster auf ein arabisches Wort? `token` in Vergleichsform, `hamza` dasselbe Wort mit Hamza-Platzhaltern
 * (fehlt es oder weicht die Länge ab, entfällt der Hamza-Vergleich), `kandidaten` seine Lesarten ohne Klitika. `streng`
 * (Formeln): keine Tāʾ marbūṭa als abgetrenntes Pronomen, und die Vokale dürfen denen des Musters nicht widersprechen.
 */
function passtArabisch(m: ArMuster, token: string, hamza: string | undefined, kandidaten: readonly string[], streng?: Streng): boolean {
  return kandidaten.some((k) => {
    const formen = m.get(k);
    if (!formen) return false;
    if (hamza?.length !== token.length) return true;
    // Lage des Kandidaten im Wort: hinter keinem oder einem Klitikum (höchstens drei Buchstaben)
    for (let i = 0; i <= 3; i++) {
      if (!token.startsWith(k, i)) continue;
      if (streng && hamza[i + k.length] === TA_MARBUTA) continue;
      const vokale = streng?.vokale?.length === token.length ? streng.vokale.slice(i, i + k.length) : null;
      if (
        formen.some(
          (f) => hamzaVertraeglich(hamza.slice(i, i + k.length), f.h) && (!vokale || !f.v.length || vokalVertraeglich(vokale, f.v)),
        )
      )
        return true;
    }
    return false;
  });
}

/**
 * Trifft der Begriff die Wörter eines Texts? Nur ar: `hamza` die Wörter mit Hamza-Platzhaltern, `kandidaten` je Wort die
 * Lesarten ohne Klitika.
 */
function trifft(
  b: Begriff,
  tokens: readonly string[],
  sprache: Sprache,
  hamza: readonly string[],
  kandidaten: readonly string[][],
  vokale: readonly (string | null)[][],
): boolean {
  if (sprache === 'ar')
    return b.ar.some((folge) =>
      tokens.some((_, i) =>
        folge.every(
          (m, j) =>
            i + j < tokens.length &&
            passtArabisch(m, tokens[i + j]!, hamza[i + j], kandidaten[i + j]!, b.formel ? { vokale: vokale[i + j] } : undefined),
        ),
      ),
    );
  return (b.latein[sprache] ?? []).some(
    (folge) => folge.length > 0 && tokens.some((_, i) => folge.every((w, j) => tokens[i + j] !== undefined && passt(tokens[i + j]!, w))),
  );
}

/** Artikel (`<ausgabe>|<seitentitel>`) des kaikki-Kernauszugs mit Thema Religion. */
function religionsArtikel(daten: string): Set<string> {
  const m = new Set<string>();
  for (const sprache of ['de', 'tr', 'ar'] as const)
    for (const e of ladeKaikki(sprache, daten))
      if ((e.mk ?? []).some((x) => RELIGIONS_THEMA.test(x))) m.add(`${e.q}|${e.w.normalize('NFC')}`);
  return m;
}

export function pruefeReligionsbezug(inhalte: Inhalte, texte: readonly TextEintrag[], daten: string): Befunde {
  const b = new Befunde('religionsbezug');
  const leitfaden = inhalte.leitfaden?.daten;
  if (leitfaden) {
    const liste = begriffe(leitfaden, daten);
    const gesperrt = leitfaden.religionsbezug.formeln.status === 'gesperrt';
    const bekannt = arabischBekannt(daten);
    const gemeldet = new Set<string>();
    for (const t of texte) {
      const tokens = tabuWoerter(t.text, t.sprache);
      const ar = t.sprache === 'ar';
      const hamza = ar ? hamzaWoerter(t.text) : [];
      const kandidaten = ar ? tokens.map((x) => arabischeKandidaten(x, bekannt)) : [];
      const vokale = ar ? vokalWoerter(t.text) : [];
      for (const begriff of liste) {
        if (
          !trifft(
            begriff,
            tokens,
            t.sprache,
            hamza.length === tokens.length ? hamza : [],
            kandidaten,
            vokale.length === tokens.length ? vokale : [],
          )
        )
          continue;
        const k = `${t.datei}|${t.ort}|${begriff.id}`;
        if (gemeldet.has(k)) continue;
        gemeldet.add(k);
        if (begriff.formel && gesperrt)
          if (t.religionsbezug !== true)
            b.blockierend(
              t.datei,
              'Formel aus der Formelliste ohne Kennzeichen religionsbezug: true – die Liste ist gesperrt (LM-09, KERN 4.0 §2.3)',
              t.ort,
              begriff.id,
            );
          else
            b.mensch(
              t.datei,
              'Formel bei gesperrter Formelliste – bleibt bis zur Listenfreigabe verborgen – menschlich_klaeren',
              t.ort,
              begriff.id,
            );
        else if (t.religionsbezug !== true)
          b.mensch(t.datei, `Religionsbezug-Kandidat ohne Kennzeichen religionsbezug: true – menschlich_klaeren`, t.ort, begriff.id);
        else if (begriff.abStufe && SPRACH_STUFEN.indexOf(t.stufe) < SPRACH_STUFEN.indexOf(begriff.abStufe))
          b.mensch(t.datei, `Religionsbezug vor Stufe ${begriff.abStufe.toUpperCase()} – menschlich_klaeren`, t.ort, begriff.id);
      }
    }
  }

  // Lemmata aus Wiktionary mit Thema Religion
  if (inhalte.sprache.some((x) => x.daten.lemmata.some((l) => l.quelle.startsWith('wiktionary:')))) {
    const artikel = religionsArtikel(daten);
    for (const { pfad, daten: d } of inhalte.sprache)
      for (const l of d.lemmata) {
        const t = l.quelle.match(/^wiktionary:(en|de|tr):(.+)$/);
        if (t && !l.religionsbezug && artikel.has(`${t[1]}|${t[2]!.normalize('NFC')}`))
          b.warnung(
            pfad,
            'Wiktionary-Artikel mit Thema Religion – Kandidat für religionsbezug und Formel-Lexikon',
            l.schluessel,
            'kaikki-religion',
          );
      }
  }

  // Prüfstein ohne gekennzeichnete Einträge
  const gekennzeichnet = new Set<string>();
  for (const { daten: d } of inhalte.sprache)
    for (const x of [...d.lemmata, ...d.saetze]) if (x.religionsbezug) gekennzeichnet.add(x.schluessel);
  for (const { pfad, daten: d } of inhalte.sprache)
    for (const l of d.lektionen)
      if (l.art === 'pruefstein')
        for (const a of l.aufgaben)
          if (verweiseVon(a).some((v) => gekennzeichnet.has(v)))
            b.blockierend(pfad, 'Prüfstein verweist auf einen Eintrag mit Religionsbezug (nie Lernziel)', a.schluessel);

  // Keine Sprachausgabe für Religionsbezug und Wissenskurs
  const verboten = new Map<string, string>();
  for (const t of texte)
    if (t.religionsbezug === true && (t.art === 'lemma' || t.art === 'form' || t.art === 'satz'))
      verboten.set(`${t.sprache}|${textHash(t.text)}`, t.ort);
  for (const { daten: d } of inhalte.islam)
    for (const l of d.lektionen) for (const a of l.aussagen) verboten.set(`de|${textHash(a.text)}`, a.schluessel);
  for (const { pfad, daten: d } of inhalte.audio)
    d.clips.forEach((c, i) => {
      const ort = verboten.get(`${d.sprache}|${c.textHash}`);
      if (ort) b.blockierend(pfad, `Clip für ${ort} (Religionsbezug bzw. Wissenskurs: nie Sprachausgabe, KERN 4.0 §4)`, `clips.${i}`);
    });
  return b;
}
