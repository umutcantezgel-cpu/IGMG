import { zerlege } from '../abgleich/tokens';
import type { Sprache } from '../kurse';
import type { ImportQuelle } from '../inhalt/import';
import { leseDateien } from '../inhalt/import';
import type { Waechter } from '../inhalt/religion';
import type { AudioManifestDatei, SprachEinheitDatei } from '../inhalt/schema';
import { textHash } from '../paket/hash';
import { vertonbar } from '../verwaltung/audio';
import { hatTrenner, lexikonTreffer, vierGrammTreffer } from '../waechter/kern.mjs';
import { stimmeFuer } from './stimmen';

/**
 * Arbeitsliste der Sprachausgabe (`pnpm lernapp:audio-liste <sprache>`, ADR 0039 Nr. 6.1, PLAN §6.8 Schritt 1):
 * je Text der Zielsprache ein Eintrag (textHash, Text, Stimme), nur für fehlende Clips.
 *
 * **Nie vertont** (KERN 4.0 §2.2 Nr. 8, §4; ADR 0039 Nr. 7) – drei Riegel:
 * 1. Nur Sprachkurs-Dateien (`sprache/<kurs>/…`, Kurs = Zielsprache). Wissenskurs (`islam/`), Koran-Arabisch (`koran/`) und
 *    Übersetzungen sind keine Quelle.
 * 2. Nur Einträge ohne `religionsbezug` in Einheiten außer `gesperrt` (`vertonbar`, gleiche Regel wie im Audio-Studio).
 * 3. Wächter: Ein Treffer im Formel-Lexikon oder ein Koran-/Hadith-4-Gramm schließt den Text aus, auch ohne Kennzeichen
 *    (der Prüfer meldet ihn ohnehin als Fehler; die Liste vertont ihn nie).
 *
 * Ein Text bekommt je Sprache genau einen Clip (textHash = SHA-256 des Texts in NFC). Er liegt im Bündel der ersten
 * Einheit, in der er vorkommt (Stufe, dann gemeinsame vor Vorkurs-Einheiten, dann Schlüssel); spätere Einheiten verweisen
 * dorthin.
 */

export type AudioEintragArt = 'lemma' | 'satz';

export type VertonbarerText = {
  textHash: string;
  text: string;
  sprache: Sprache;
  /** Einheit, deren Bündel den Clip aufnimmt */
  einheit: string;
  /** Schlüssel des ersten Eintrags mit diesem Text */
  schluessel: string;
  art: AudioEintragArt;
  /** Wörter (wie im Antwortabgleich); Rückerkennung nur für Sätze ab 4 Wörtern (PLAN §6.8 Nr. 6) */
  woerter: number;
};

export type ListenZeile = VertonbarerText & { stimme: string };

export type Ausschluss = { schluessel: string; grund: 'religionsbezug' | 'gesperrt' | 'waechter' };

const STUFEN = ['a1', 'a2', 'b1', 'b2', 'c1'];

/** Reihenfolge der Einheiten: Stufe, gemeinsame vor Vorkurs-Einheiten (`nurFuerAusgang`), dann Schlüssel. */
function einheitRang(d: SprachEinheitDatei): [number, number, string] {
  return [STUFEN.indexOf(d.stufe), d.einheit.nurFuerAusgang ? 1 : 0, d.einheit.schluessel];
}

const vergleiche = (a: [number, number, string], b: [number, number, string]) =>
  a[0] - b[0] || a[1] - b[1] || (a[2] < b[2] ? -1 : a[2] > b[2] ? 1 : 0);

/** Treffer des Religionswächters (Formel-Lexikon, Koran-/Hadith-4-Gramm)? */
export function waechterTrifft(text: string, w: Waechter): boolean {
  return Boolean(lexikonTreffer(text, w.lexikon)) || (hatTrenner(text) && Boolean(vierGrammTreffer(text, w.index)));
}

/**
 * Vertonbare Texte einer Zielsprache aus den Inhaltsdateien (Pfade relativ zu `web/inhalte/lernapp/`). Ungültige Dateien
 * brechen ab (`ImportFehler`, wie der Import). Ohne Wächter (nur in Tests) entfällt Riegel 3.
 */
export function vertonbareTexte(
  quellen: readonly ImportQuelle[],
  sprache: Sprache,
  optionen: { waechter: Waechter | null },
): { texte: VertonbarerText[]; ausgeschlossen: Ausschluss[] } {
  // Riegel 1: nur Sprachkurs-Dateien dieser Zielsprache
  const nurSprache = quellen.filter((q) => /^(?:[a-z0-9-]+\/)?sprache\//.test(q.pfad));
  const dateien = leseDateien(nurSprache)
    .map((x) => x.datei)
    .filter((d): d is { art: 'sprache'; daten: SprachEinheitDatei } => d.art === 'sprache' && d.daten.kurs === sprache)
    .map((d) => d.daten)
    .sort((a, b) => vergleiche(einheitRang(a), einheitRang(b)));

  const texte = new Map<string, VertonbarerText>();
  const ausgeschlossen: Ausschluss[] = [];
  // Ein Text, der irgendwo mit Religionsbezug oder als Wächter-Treffer vorkommt, bekommt nie einen Clip – auch nicht über
  // einen gleichlautenden Eintrag ohne Kennzeichen.
  const nie = new Set<string>();
  for (const d of dateien) {
    const eintraege = [
      ...d.lemmata.map((l) => ({
        schluessel: l.schluessel,
        text: l.lemma,
        religionsbezug: l.religionsbezug ?? false,
        art: 'lemma' as const,
      })),
      ...d.saetze.map((s) => ({ schluessel: s.schluessel, text: s.text, religionsbezug: s.religionsbezug ?? false, art: 'satz' as const })),
    ];
    for (const e of eintraege) {
      // Riegel 2
      if (!vertonbar({ kurs: d.kurs, religionsbezug: e.religionsbezug, status: d.status })) {
        ausgeschlossen.push({ schluessel: e.schluessel, grund: e.religionsbezug ? 'religionsbezug' : 'gesperrt' });
        if (e.religionsbezug) nie.add(textHash(e.text));
        continue;
      }
      // Riegel 3
      if (optionen.waechter && waechterTrifft(e.text, optionen.waechter)) {
        ausgeschlossen.push({ schluessel: e.schluessel, grund: 'waechter' });
        nie.add(textHash(e.text));
        continue;
      }
      const hash = textHash(e.text);
      if (texte.has(hash)) continue;
      texte.set(hash, {
        textHash: hash,
        text: e.text.normalize('NFC'),
        sprache,
        einheit: d.einheit.schluessel,
        schluessel: e.schluessel,
        art: e.art,
        woerter: zerlege(e.text).length,
      });
    }
  }
  return {
    texte: [...texte.values()].filter((t) => !nie.has(t.textHash)),
    ausgeschlossen,
  };
}

/**
 * Fehlende Einträge: kein Clip der aktuellen Stimme und keine menschliche Aufnahme im Manifest. Clips einer früheren
 * Stimme (anderer Modell-SHA) zählen nicht – nach einem neuen Export wird neu erzeugt.
 */
export function fehlende(texte: readonly VertonbarerText[], manifest: AudioManifestDatei | null, stimme: string): VertonbarerText[] {
  const vorhanden = new Set(
    (manifest?.clips ?? []).filter((c) => c.stimme === stimme || c.stimme.startsWith('mensch:')).map((c) => c.textHash),
  );
  return texte.filter((t) => !vorhanden.has(t.textHash));
}

/**
 * Arbeitsliste einer Zielsprache: `null`, wenn die Sprache keine freigegebene Stimme hat (tr, ar: „Audio folgt“).
 */
export function audioListe(
  quellen: readonly ImportQuelle[],
  sprache: Sprache,
  optionen: { waechter: Waechter | null; manifest: AudioManifestDatei | null },
): { zeilen: ListenZeile[]; vertonbar: number; ausgeschlossen: Ausschluss[] } | null {
  const stimme = stimmeFuer(sprache);
  if (!stimme) return null;
  const { texte, ausgeschlossen } = vertonbareTexte(quellen, sprache, { waechter: optionen.waechter });
  const zeilen = fehlende(texte, optionen.manifest, stimme.id).map((t) => ({ ...t, stimme: stimme.id }));
  return { zeilen, vertonbar: texte.length, ausgeschlossen };
}

/** Zeilen als JSONL (eine Zeile je Eintrag, Schlüssel in fester Reihenfolge). */
export function alsJsonl(zeilen: readonly ListenZeile[]): string {
  return zeilen
    .map((z) =>
      JSON.stringify({
        textHash: z.textHash,
        text: z.text,
        stimme: z.stimme,
        sprache: z.sprache,
        einheit: z.einheit,
        schluessel: z.schluessel,
        art: z.art,
        woerter: z.woerter,
      }),
    )
    .map((z) => `${z}\n`)
    .join('');
}

/** JSONL lesen (Leerzeilen erlaubt); prüft nur die Felder, die die Kette braucht. */
export function leseJsonl(text: string): ListenZeile[] {
  return text
    .split('\n')
    .filter((z) => z.trim())
    .map((z, i) => {
      const o = JSON.parse(z) as ListenZeile;
      if (!/^[0-9a-f]{64}$/.test(o.textHash) || typeof o.text !== 'string' || textHash(o.text) !== o.textHash)
        throw new Error(`Zeile ${i + 1}: textHash passt nicht zum Text`);
      if (typeof o.einheit !== 'string' || typeof o.stimme !== 'string') throw new Error(`Zeile ${i + 1}: Einheit oder Stimme fehlt`);
      return o;
    });
}
