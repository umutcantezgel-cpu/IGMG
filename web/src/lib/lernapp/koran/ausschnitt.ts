/**
 * Ausschnitt einer geprüften Rezitation abspielen (Koran-Pfad, L6-05; KERN 4.0 §4: nie eine Computerstimme). Client-Modul ohne
 * Abhängigkeiten.
 *
 * Das Ende wird je Bildschirmbild geprüft (`requestAnimationFrame`, ≈ 16 ms) und nicht nur über `timeupdate` (Raster ≈ 250 ms),
 * damit die Wiedergabe nicht in das nächste Wort der Rezitation läuft. `timeupdate` bleibt als Rückfall, falls die Seite im
 * Hintergrund keine Bilder zeichnet. Die Rückgabe hält an und räumt auf; sie gehört zum Schließen der Einheit und zum
 * Verlassen der Seite.
 */

export type AusschnittZeit = { startMs: number; endeMs: number };

/** Was hier vom Audio-Element gebraucht wird (`HTMLAudioElement` erfüllt es; Tests setzen einen Ersatz ein). */
export type Wiedergabe = {
  currentTime: number;
  readonly paused: boolean;
  pause(): void;
  play(): Promise<void>;
  load(): void;
  addEventListener(art: 'loadedmetadata' | 'timeupdate' | 'ended', f: () => void, o?: { once?: boolean }): void;
  removeEventListener(art: 'timeupdate' | 'ended', f: () => void): void;
};

/** Takt für die Prüfung des Endes (im Browser `requestAnimationFrame`). */
export type Takt = { anfordern: (f: () => void) => number; abbrechen: (id: number) => void };

const BILDTAKT: Takt = {
  anfordern: (f) => requestAnimationFrame(() => f()),
  abbrechen: (id) => cancelAnimationFrame(id),
};

export function spieleAusschnitt(a: Wiedergabe, zeit: AusschnittZeit, takt: Takt = BILDTAKT): () => void {
  let aus = false;
  let rahmen: number | null = null;

  const halt = () => {
    if (aus) return;
    aus = true;
    if (rahmen !== null) takt.abbrechen(rahmen);
    rahmen = null;
    a.removeEventListener('timeupdate', pruefe);
    a.removeEventListener('ended', halt);
    a.pause();
  };

  function pruefe() {
    if (aus) return;
    if (a.currentTime * 1000 >= zeit.endeMs) return halt();
    if (rahmen === null && !a.paused)
      rahmen = takt.anfordern(() => {
        rahmen = null;
        pruefe();
      });
  }

  a.addEventListener(
    'loadedmetadata',
    () => {
      if (aus) return;
      a.currentTime = zeit.startMs / 1000;
      a.addEventListener('timeupdate', pruefe);
      a.addEventListener('ended', halt);
      void a
        .play()
        .then(pruefe)
        .catch(() => undefined);
    },
    { once: true },
  );
  a.load();
  return halt;
}
