import { ladeBuendel } from '../lokal/vorrat';

/**
 * Lern-Audio im Browser (ADR 0039 Nr. 3 mit Fortschreibung S4/S5 Nr. 3–4). Client-Modul der Hörübungen.
 *
 * - Das Bündel `.lpa` wird ganz geladen (Vorrat zuerst, nie mit `Range`, `lokal/vorrat.ts`), der Clip mit `Blob.slice`
 *   geschnitten und über eine Objekt-URL in **einem** wiederverwendeten `<audio>` gespielt; die URL wird nach `ended`/`error`
 *   bzw. beim nächsten Clip widerrufen. Kein `createMediaElementSource`, kein MSE, kein Abspielen ohne Tippen.
 * - „Langsam“: nach dem Setzen der Quelle `defaultPlaybackRate = playbackRate = 0.75` mit `preservesPitch` (und
 *   `webkitPreservesPitch`).
 * - Rückfallstufen: (1) `canPlayType('audio/webm; codecs="opus"')` nicht leer → direkt; (2) leer oder `MediaError` beim
 *   ersten Clip → `decodeAudioData` der Scheibe → WAV (`wav.ts`, erst bei Bedarf geladen); (3) sonst „Hören ist auf diesem
 *   Gerät nicht möglich“, die Hörübungen werden übersprungen (KERN 4.0 §4). Der gefundene Weg wird auf dem Gerät gemerkt.
 */

export type Clip = { buendel: string; versatz: number; laenge: number; dauerMs?: number };
export type Weg = 'direkt' | 'wav' | 'aus';
/** Ergebnis eines Abspielversuchs: gespielt bis zum Ende, Bündel nicht ladbar (ohne Netz und Vorrat), nicht möglich. */
export type Abspielergebnis = 'gespielt' | 'kein_netz' | 'nicht_moeglich' | 'abgebrochen';

export const WEG_SCHLUESSEL = 'igmg-lernapp-audioweg';
export const LANGSAM = 0.75;
const WEBM_OPUS = 'audio/webm; codecs="opus"';

let element: HTMLAudioElement | null = null;
let url: string | null = null;
let lauf = 0;

function gemerkterWeg(): Weg | null {
  try {
    const w = localStorage.getItem(WEG_SCHLUESSEL);
    return w === 'direkt' || w === 'wav' || w === 'aus' ? w : null;
  } catch {
    return null;
  }
}

function merkeWeg(w: Weg): void {
  try {
    localStorage.setItem(WEG_SCHLUESSEL, w);
  } catch {
    // ohne Speicher: nur für diese Sitzung
  }
}

/** Das eine `<audio>` der Lern-App (unsichtbar, ohne Bedienelemente; die Knöpfe stehen in der Übung). */
export function audioElement(): HTMLAudioElement {
  if (!element) {
    element = document.createElement('audio');
    element.preload = 'auto';
  }
  return element;
}

function gibFrei(): void {
  if (url) URL.revokeObjectURL(url);
  url = null;
}

/** Laufendes Abspielen beenden (Übung verlassen). */
export function stoppe(): void {
  lauf++;
  if (element) {
    element.pause();
    element.removeAttribute('src');
    element.load();
  }
  gibFrei();
}

/** Ein Blob bis zum Ende spielen; `false` bei Medienfehler (Format nicht abspielbar). */
function spieleBlob(blob: Blob, langsam: boolean, nr: number): Promise<'ende' | 'fehler' | 'abgebrochen'> {
  const a = audioElement();
  gibFrei();
  url = URL.createObjectURL(blob);
  a.src = url;
  const rate = langsam ? LANGSAM : 1;
  a.defaultPlaybackRate = rate;
  a.playbackRate = rate;
  a.preservesPitch = true;
  (a as HTMLAudioElement & { webkitPreservesPitch?: boolean }).webkitPreservesPitch = true;
  return new Promise((fertig) => {
    const ende = (e: 'ende' | 'fehler' | 'abgebrochen') => {
      a.removeEventListener('ended', beiEnde);
      a.removeEventListener('error', beiFehler);
      if (nr === lauf) gibFrei();
      fertig(e);
    };
    const beiEnde = () => ende(nr === lauf ? 'ende' : 'abgebrochen');
    const beiFehler = () => ende(nr === lauf ? 'fehler' : 'abgebrochen');
    a.addEventListener('ended', beiEnde);
    a.addEventListener('error', beiFehler);
    a.play().catch((e: unknown) => {
      // NotSupportedError bzw. MediaError: Format nicht abspielbar; AbortError: neuer Clip oder Stopp
      const name = e instanceof DOMException ? e.name : '';
      ende(nr !== lauf || name === 'AbortError' ? 'abgebrochen' : 'fehler');
    });
  });
}

/**
 * Einen Clip spielen (nach einem Tippen). Wählt den Weg nach den Rückfallstufen und merkt ihn sich; ein Medienfehler auf
 * dem direkten Weg führt einmal zur WAV-Umwandlung.
 */
export async function spiele(clip: Clip, { langsam = false }: { langsam?: boolean } = {}): Promise<Abspielergebnis> {
  const nr = ++lauf;
  const a = audioElement();
  let weg = gemerkterWeg() ?? (a.canPlayType(WEBM_OPUS) ? 'direkt' : 'wav');
  if (weg === 'aus') return 'nicht_moeglich';
  const buendel = await ladeBuendel(clip.buendel);
  if (nr !== lauf) return 'abgebrochen';
  if (!buendel) return 'kein_netz';
  // wie `schneideClip` (paket/buendel.ts), ohne dessen Kopf-Leser in den Chunk zu ziehen
  const scheibe = buendel.slice(clip.versatz, clip.versatz + clip.laenge, 'audio/webm');
  if (weg === 'direkt') {
    const r = await spieleBlob(scheibe, langsam, nr);
    if (r === 'ende') {
      merkeWeg('direkt');
      return 'gespielt';
    }
    if (r === 'abgebrochen') return 'abgebrochen';
    weg = 'wav';
  }
  try {
    const { alsWav } = await import('./wav');
    const wav = await alsWav(scheibe);
    if (nr !== lauf) return 'abgebrochen';
    const r = await spieleBlob(wav, langsam, nr);
    if (r === 'ende') {
      merkeWeg('wav');
      return 'gespielt';
    }
    if (r === 'abgebrochen') return 'abgebrochen';
  } catch {
    // Dekodieren nicht möglich
  }
  if (nr !== lauf) return 'abgebrochen';
  merkeWeg('aus');
  return 'nicht_moeglich';
}

/** Hören auf diesem Gerät schon als unmöglich bekannt? */
export const hoerenUnmoeglich = (): boolean => gemerkterWeg() === 'aus';
