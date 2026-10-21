import { SPRACH_STUFEN, type Sprache } from '../../kurse';
import { textHash } from '../../paket/hash';
import { type Leitfaden, verweiseVon } from '../schema';
import type { Inhalte } from './dateien';
import { ladeKaikki } from './daten';
import { arabischeKandidaten, arabischNormal } from './sprache';
import { tabuWoerter } from './tabu';
import type { SprachStufe, TextEintrag } from './texte';
import { Befunde } from './typen';

/**
 * Prüfer „Religionsbezug“ (Leitfaden `religionsbezug`, KERN 4.0 §2.3, §4; ADR 0045 Fortschreibung S7 Nr. 4):
 *
 * - **Kandidaten aus dem Leitfaden:** Begriffe aus `orte_ereignisse` (R-NN, de/tr, ar über kaikki wie im Tabu-Prüfer) und den
 *   Formeln in Lateinschrift (F-de, F-tr) verlangen `religionsbezug: true` → sonst `menschlich_klaeren` (Kandidat, z. B. tr.
 *   „hoca“ ist auch die Lehrkraft). Gekennzeichnet, aber unter `ab_stufe` → ebenfalls an Menschen. Den harten, „fail closed“
 *   Teil leistet das Formel-Lexikon des Wächters (`religion.ts`).
 * - **kaikki-Thema Religion/Islam** (ADR 0045 Fortschreibung S7 Nr. 4): Ein Lemma mit Quelle `wiktionary:<ausgabe>:<titel>`, dessen
 *   Artikel im Kernauszug das Thema Religion/Islam trägt, ist ohne Kennzeichen ein Hinweis (Kandidat für Kennzeichen und
 *   Formel-Lexikon). Wörter im Fließtext werden nicht so geprüft: Viele Alltagswörter haben eine religiöse Nebenbedeutung.
 * - **nie Lernziel** (Leitfaden `religionsbezug.regeln`): Ein Prüfstein verweist nie auf gekennzeichnete Einträge (blockierend).
 * - **keine Sprachausgabe** (KERN 4.0 §4): Kein Clip im Audio-Manifest gehört zu einem gekennzeichneten Text oder zu einem
 *   Text des Wissenskurses (blockierend).
 */

type Begriff = { id: string; abStufe: SprachStufe | null; latein: Partial<Record<'de' | 'tr', string[][]>>; ar: Set<string>[][] };

const teile = (s: string) =>
  s
    .replace(/\([^)]*\)/g, ' ')
    .split(/[,/]/)
    .map((x) => x.trim())
    .filter(Boolean);

function begriffe(leitfaden: Leitfaden, daten: string): Begriff[] {
  const tabelle = leitfaden.umschrift.din_zu_wiktionary;
  const rom = new Map<string, string[]>();
  for (const e of ladeKaikki('ar', daten))
    if (e.rom) {
      const k = e.rom.normalize('NFC').toLowerCase();
      rom.set(k, [...(rom.get(k) ?? []), arabischNormal(e.w), ...(e.pl ?? []).map(arabischNormal)]);
    }
  const umschrift = (u: string): Set<string>[] | null => {
    const folge: Set<string>[] = [];
    for (const wort of u.split(/\s+/).filter(Boolean)) {
      let r = wort.normalize('NFC').toLowerCase();
      for (const [din, wikt] of Object.entries(tabelle)) r = r.split(din.toLowerCase()).join(wikt);
      r = r.replace(/^(?:a[lšṣṭḍẓṯḏnrstdz]-|l-)/u, '');
      const varianten = [r, `ʔ${r}`, r.replace(/ī$/, 'iyy')];
      const muster = new Set(varianten.flatMap((v) => rom.get(v) ?? []).filter((m) => m.length >= 2));
      if (!muster.size) return null;
      folge.push(muster);
    }
    return folge.length ? folge : null;
  };
  const ab = (s: string | undefined) => (s ? (s.toLowerCase() as SprachStufe) : null);
  const ergebnis: Begriff[] = leitfaden.religionsbezug.orte_ereignisse.map((o) => ({
    id: o.id,
    abStufe: ab(o.ab_stufe),
    latein: { de: teile(o.de).map((t) => tabuWoerter(t, 'de')), tr: teile(o.tr).map((t) => tabuWoerter(t, 'tr')) },
    ar: o.ar
      ? teile(o.ar)
          .flatMap((t) => umschrift(t) ?? [])
          .map((m) => [m])
      : [],
  }));
  for (const f of leitfaden.religionsbezug.formeln.liste)
    if (f.sprache !== 'ar')
      ergebnis.push({
        id: f.id,
        abStufe: null,
        latein: { [f.sprache]: teile(f.begriff).map((t) => tabuWoerter(t, f.sprache as 'de' | 'tr')) },
        ar: [],
      });
  return ergebnis;
}

const passt = (token: string, wort: string) => token === wort || (wort.length >= 4 && token.startsWith(wort));

/** Trifft der Begriff die Wörter eines Texts? `kandidaten`: je Wort die arabischen Lesarten ohne Klitika (nur ar). */
function trifft(b: Begriff, tokens: readonly string[], sprache: Sprache, kandidaten: readonly string[][]): boolean {
  if (sprache === 'ar')
    return b.ar.some((folge) => tokens.some((_, i) => folge.every((m, j) => kandidaten[i + j]?.some((k) => m.has(k)) ?? false)));
  return (b.latein[sprache] ?? []).some(
    (folge) => folge.length > 0 && tokens.some((_, i) => folge.every((w, j) => tokens[i + j] !== undefined && passt(tokens[i + j]!, w))),
  );
}

/** Artikel (`<ausgabe>|<seitentitel>`) des kaikki-Kernauszugs mit Thema Religion. */
function religionsArtikel(daten: string): Set<string> {
  const m = new Set<string>();
  for (const sprache of ['de', 'tr', 'ar'] as const)
    for (const e of ladeKaikki(sprache, daten))
      if ((e.mk ?? []).some((x) => /^thema:(?:islam|religion|christianity|judaism|theology|bible|biblical)$/i.test(x)))
        m.add(`${e.q}|${e.w.normalize('NFC')}`);
  return m;
}

export function pruefeReligionsbezug(inhalte: Inhalte, texte: readonly TextEintrag[], daten: string): Befunde {
  const b = new Befunde('religionsbezug');
  const leitfaden = inhalte.leitfaden?.daten;
  if (leitfaden) {
    const liste = begriffe(leitfaden, daten);
    const gemeldet = new Set<string>();
    for (const t of texte) {
      const tokens = tabuWoerter(t.text, t.sprache);
      const kandidaten = t.sprache === 'ar' ? tokens.map(arabischeKandidaten) : [];
      for (const begriff of liste) {
        if (!trifft(begriff, tokens, t.sprache, kandidaten)) continue;
        const k = `${t.datei}|${t.ort}|${begriff.id}`;
        if (gemeldet.has(k)) continue;
        gemeldet.add(k);
        if (t.religionsbezug !== true)
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
