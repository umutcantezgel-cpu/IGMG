/**
 * Grobe Gerätebeschreibung für die Liste der angemeldeten Sitzungen (Mein Bereich › Konto). Reine Funktion.
 * Aus dem User-Agent werden nur Browser- und Systemfamilie gelesen (Eigennamen, keine Übersetzung nötig);
 * IP-Adressen speichert die Anwendung nicht (`disableIpTracking`).
 */
export type Geraet = { browser: string | null; system: string | null };

const BROWSER: [RegExp, string][] = [
  [/Edg(A|iOS)?\//, 'Edge'],
  [/SamsungBrowser\//, 'Samsung Internet'],
  [/OPR\/|Opera/, 'Opera'],
  [/Firefox\/|FxiOS\//, 'Firefox'],
  [/Chrome\/|CriOS\//, 'Chrome'],
  [/Safari\//, 'Safari'],
];

const SYSTEM: [RegExp, string][] = [
  [/iPhone|iPad|iPod/, 'iOS'],
  [/Android/, 'Android'],
  [/Windows/, 'Windows'],
  [/Mac OS X|Macintosh/, 'macOS'],
  [/CrOS/, 'ChromeOS'],
  [/Linux/, 'Linux'],
];

export function geraetAus(userAgent: string | null | undefined): Geraet {
  if (!userAgent) return { browser: null, system: null };
  return {
    browser: BROWSER.find(([m]) => m.test(userAgent))?.[1] ?? null,
    system: SYSTEM.find(([m]) => m.test(userAgent))?.[1] ?? null,
  };
}
