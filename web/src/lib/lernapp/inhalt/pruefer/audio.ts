import { freigegebeneStimme, stimmeFuer } from '../../audio/stimmen';
import { textHash } from '../../paket/hash';
import type { Inhalte } from './dateien';
import { Befunde } from './typen';

/**
 * Prüfer „Audio“ (KERN 4.0 §2.2 Nr. 8 und §4, ADR 0039 Nr. 7, PLAN §6.8 „nie vertont“): Das Audio-Manifest einer Sprache
 * enthält keinen Clip zu einem Text mit Religionsbezug, zu einem Text des Wissenskurses oder des Koran-Arabisch-Pfads, und
 * Sprachausgabe nur mit der für die Sprache freigegebenen Stimme (je Sprache eine oder keine, L3-E10a; freigegeben erst nach
 * bestandener Hörabnahme, `hoerabnahme: 'bestanden'` in `audio/stimmen.ts`, LM-06, Z-L21), keine Testtöne (`test:` nur aus
 * dem Testkurs-Seed). Blockierend.
 */
export function pruefeAudio(inhalte: Inhalte): Befunde {
  const b = new Befunde('audio');
  if (!inhalte.audio.length) return b;

  // Texte mit Religionsbezug je Sprache (Sprachkurse) und alle Zeichenketten aus Wissen und Koran-Pfad
  const religion = new Map<string, Set<string>>();
  for (const { daten: d } of inhalte.sprache) {
    const s = religion.get(d.kurs) ?? new Set<string>();
    for (const l of d.lemmata) if (l.religionsbezug) s.add(textHash(l.lemma));
    for (const x of d.saetze) if (x.religionsbezug) s.add(textHash(x.text));
    religion.set(d.kurs, s);
  }
  const religioeseKurse = new Set<string>();
  const sammle = (wert: unknown): void => {
    if (typeof wert === 'string') religioeseKurse.add(textHash(wert));
    else if (Array.isArray(wert)) wert.forEach(sammle);
    else if (wert && typeof wert === 'object') Object.values(wert).forEach(sammle);
  };
  for (const { daten } of inhalte.islam) sammle(daten);
  if (inhalte.koran) sammle(inhalte.koran.daten);

  for (const { pfad, daten: m } of inhalte.audio) {
    const registriert = stimmeFuer(m.sprache)?.id ?? null;
    const freigegeben = freigegebeneStimme(m.sprache)?.id ?? null;
    m.stimmen.forEach((s, i) => {
      if (s.art === 'sprachausgabe' && s.id !== registriert)
        b.blockierend(
          pfad,
          `Sprachausgabe ${s.id} ist für ${m.sprache} nicht freigegeben (src/lib/lernapp/audio/stimmen.ts)`,
          `stimmen.${i}`,
        );
      else if (s.art === 'sprachausgabe' && s.id !== freigegeben)
        b.blockierend(
          pfad,
          `Sprachausgabe ${s.id}: Hörabnahme offen (LM-06) – bis dahin „Audio folgt“ (src/lib/lernapp/audio/stimmen.ts)`,
          `stimmen.${i}`,
        );
      else if (s.art === 'test') b.blockierend(pfad, `Testton-Stimme ${s.id} gehört nicht in ein eingechecktes Manifest`, `stimmen.${i}`);
    });
    const verboten = religion.get(m.sprache) ?? new Set<string>();
    m.clips.forEach((c, i) => {
      if (verboten.has(c.textHash)) b.blockierend(pfad, 'Clip zu einem Text mit Religionsbezug (nie vertont)', `clips.${i}`);
      else if (religioeseKurse.has(c.textHash))
        b.blockierend(pfad, 'Clip zu einem Text aus Wissenskurs oder Koran-Arabisch-Pfad (nie vertont)', `clips.${i}`);
    });
  }
  return b;
}
