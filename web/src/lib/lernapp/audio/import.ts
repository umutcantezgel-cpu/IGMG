import 'server-only';
import { and, eq, inArray, like, or, sql } from 'drizzle-orm';
import type { Datenbank } from '@/lib/db';
import { schema } from '@/lib/db';
import type { ImportQuelle } from '../inhalt/import';
import { leseDateien } from '../inhalt/import';
import type { AudioManifestDatei } from '../inhalt/schema';
import { textHash } from '../paket/hash';
import { stimmeFuer } from './stimmen';

/**
 * Audio-Manifest in die Datenbank (`lernapp_audio`, ADR 0039 Nr. 6.4): Aus dem Manifest wird je Clip eine Zeile mit
 * Bündel-Dateiname, Versatz, Länge, Dauer, Stimme und SHA-256; der Paketbau wählt daraus nach dem Vorrang Mensch vor
 * Sprachausgabe vor Testton (`server/queries/lernapp/pakete.ts`).
 *
 * - `abgleichen` (das eingecheckte Manifest `web/inhalte/lernapp/audio-manifest/<sprache>.json`): Zeilen der Sprache mit
 *   `tts:`- oder `mensch:`-Stimme, die nicht mehr im Manifest stehen, werden gelöscht – so verschwindet ein
 *   zurückgezogener Clip auch aus der Datenbank. Testtöne (`test:`) bleiben unberührt.
 * - Ohne `abgleichen` (zusätzliches lokales Manifest, z. B. Probelauf mit `LERNAPP_AUDIO_LOKAL`) wird nur ergänzt.
 * - **Fail closed:** Ein Clip zu einem Text mit Religionsbezug oder eine Sprachausgabe-Stimme, die für die Sprache nicht
 *   freigegeben ist, bricht den Import ab (KERN 4.0 §4, ADR 0039 Nr. 7); im eingecheckten Manifest auch eine Testton-Stimme.
 *   Die Sprecher-Vereinbarung je `mensch:`-Stimme prüft der Import noch nicht (L3-08, Audio-Studio).
 */

export class AudioImportFehler extends Error {}

export type AudioImportBericht = { sprache: string; neu: number; geaendert: number; gleich: number; entfernt: number };

/** textHashes der Texte mit Religionsbezug in den Sprachkurs-Dateien dieser Sprache (nie vertont). */
export function religionsHashes(quellen: readonly ImportQuelle[], sprache: string): Set<string> {
  const aus = new Set<string>();
  for (const { datei } of leseDateien(quellen.filter((q) => /^(?:[a-z0-9-]+\/)?sprache\//.test(q.pfad)))) {
    if (datei.art !== 'sprache' || datei.daten.kurs !== sprache) continue;
    for (const l of datei.daten.lemmata) if (l.religionsbezug) aus.add(textHash(l.lemma));
    for (const s of datei.daten.saetze) if (s.religionsbezug) aus.add(textHash(s.text));
  }
  return aus;
}

/**
 * Prüft ein Manifest gegen Stimmenregister und Religionsbezug; Rückgabe: Fehlerzeilen (leer = in Ordnung). `eingecheckt`
 * (Manifest aus dem Repository): keine Testtöne (`test:` kommt nur aus dem Testkurs-Seed, nie aus einem Manifest).
 */
export function manifestFehler(m: AudioManifestDatei, verboten: ReadonlySet<string>, { eingecheckt = false } = {}): string[] {
  const fehler: string[] = [];
  const freigegeben = stimmeFuer(m.sprache)?.id ?? null;
  for (const s of m.stimmen)
    if (s.art === 'sprachausgabe' && s.id !== freigegeben)
      fehler.push(`audio-manifest/${m.sprache}.json: Stimme ${s.id} ist für ${m.sprache} nicht freigegeben`);
    else if (eingecheckt && s.art === 'test')
      fehler.push(`audio-manifest/${m.sprache}.json: Testton-Stimme ${s.id} gehört nicht in das eingecheckte Manifest`);
  for (const c of m.clips)
    if (verboten.has(c.textHash))
      fehler.push(`audio-manifest/${m.sprache}.json: Clip ${c.textHash} gehört zu einem Text mit Religionsbezug`);
  return fehler;
}

export async function importiereAudioManifest(
  db: Datenbank,
  m: AudioManifestDatei,
  { abgleichen, verboten = new Set<string>() }: { abgleichen: boolean; verboten?: ReadonlySet<string> },
): Promise<AudioImportBericht> {
  const fehler = manifestFehler(m, verboten, { eingecheckt: abgleichen });
  if (fehler.length) throw new AudioImportFehler(fehler.join('\n'));
  const a = schema.lernappAudio;
  const datei = (schluessel: string) => schluessel.slice(schluessel.lastIndexOf('/') + 1);
  return db.transaction(async (tx) => {
    const vorher = await tx
      .select()
      .from(a)
      .where(and(eq(a.sprache, m.sprache), or(like(a.stimme, 'tts:%'), like(a.stimme, 'mensch:%'))));
    const je = new Map(vorher.map((z) => [`${z.textHash}|${z.stimme}`, z]));
    const bericht: AudioImportBericht = { sprache: m.sprache, neu: 0, geaendert: 0, gleich: 0, entfernt: 0 };
    const zeilen: (typeof a.$inferInsert)[] = [];
    for (const c of m.clips) {
      const z = je.get(`${c.textHash}|${c.stimme}`);
      je.delete(`${c.textHash}|${c.stimme}`);
      const werte = { buendel: datei(c.buendel), versatz: c.versatz, laenge: c.laenge, dauerMs: c.dauerMs, sha256: c.sha256 };
      if (z && z.buendel === werte.buendel && z.versatz === werte.versatz && z.laenge === werte.laenge && z.sha256 === werte.sha256) {
        bericht.gleich++;
        continue;
      }
      if (z) bericht.geaendert++;
      else bericht.neu++;
      zeilen.push({
        sprache: m.sprache,
        textHash: c.textHash,
        stimme: c.stimme,
        sprecherId: c.stimme.startsWith('mensch:') ? c.stimme.slice('mensch:'.length) : null,
        ...werte,
      });
    }
    for (let i = 0; i < zeilen.length; i += 500)
      await tx
        .insert(a)
        .values(zeilen.slice(i, i + 500))
        .onConflictDoUpdate({
          target: [a.sprache, a.textHash, a.stimme],
          set: {
            buendel: sql.raw('excluded.buendel'),
            versatz: sql.raw('excluded.versatz'),
            laenge: sql.raw('excluded.laenge'),
            dauerMs: sql.raw('excluded.dauer_ms'),
            sha256: sql.raw('excluded.sha256'),
          },
        });
    const weg = abgleichen ? [...je.values()].map((z) => z.id) : [];
    for (let i = 0; i < weg.length; i += 500) await tx.delete(a).where(inArray(a.id, weg.slice(i, i + 500)));
    bericht.entfernt = weg.length;
    return bericht;
  });
}
