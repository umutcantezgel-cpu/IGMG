import { klassen } from '@/lib/klassen';

/**
 * Kategorie-Marken der Nachrichten (AUFTRAG 4, SVG-Programm je Route; Formsystem K-008): je Kategorie eine Fläche aus
 * der Geometrie des Achtsterns – Quadrat 6–18 und dasselbe Quadrat um 45° gedreht (Spitzen bei 3,5 und 20,5) – im
 * 24-px-Raster. Klein (16 px) gezeichnet, darum als Fläche (Umrisse lesen sich so klein wie Zahnräder, Sichtprüfung E2).
 * Unterschieden wird über die Form, nicht über die Farbe: Die Marke nimmt `currentColor` der neutralen Pille (H-C01:
 * keine Kategorie trägt eine Org- oder Markenfarbe), „Wichtig“ bleibt rot über die Pille. Dekorativ (`aria-hidden`) –
 * der Name der Kategorie steht immer als Text daneben. Statisch, ohne JavaScript; nutzbar in Server- und Client-Komponenten.
 */
const RAUTE = 'M12 3.5 20.5 12 12 20.5 3.5 12Z';
const ACHTSTERN = 'M12 3.5 14.5 6H18v3.5l2.5 2.5-2.5 2.5V18h-3.5L12 20.5 9.5 18H6v-3.5L3.5 12 6 9.5V6h3.5Z';

export const KATEGORIE_MARKEN = {
  // Ankündigung: die gedrehte Hälfte des Sterns (Raute)
  ankuendigung: { d: RAUTE, loch: false },
  // Veranstaltung: die stehende Hälfte des Sterns (Quadrat, wie ein Kalenderblatt)
  veranstaltung: { d: 'M5 5h14v14H5Z', loch: false },
  // Gemeinde: die vier Spitzen des Sterns, jede für sich (vier um eine Mitte)
  gemeinde: {
    d: 'M12 3 15.5 6.5 12 10 8.5 6.5Z M17.5 8.5 21 12 17.5 15.5 14 12Z M12 14 15.5 17.5 12 21 8.5 17.5Z M6.5 8.5 10 12 6.5 15.5 3 12Z',
    loch: false,
  },
  // Bildung: Quadrat mit Rautenfenster (ein aufgeschlagenes Blatt)
  bildung: { d: 'M4.5 4.5h15v15h-15Z M12 7.5 16.5 12 12 16.5 7.5 12Z', loch: true },
  // Religiös: der volle Achtstern (ein Fenster in der Mitte läse sich in 16 px wie ein Zahnrad)
  religioes: { d: ACHTSTERN, loch: false },
  // Soziales: zwei verschränkte Rauten (die Überschneidung bleibt offen)
  soziales: { d: 'M8.5 6 14.5 12 8.5 18 2.5 12Z M15.5 6 21.5 12 15.5 18 9.5 12Z', loch: true },
  // Neuigkeiten: Raute mit Quadratfenster
  neuigkeiten: { d: `${RAUTE} M9.5 9.5h5v5h-5Z`, loch: true },
  // Wichtig: Raute mit ausgespartem Ausrufezeichen, wie ein Hinweisschild (rot über die Pille)
  wichtig: { d: `${RAUTE} M10.9 7.5h2.2v6h-2.2Z M10.9 14.9h2.2v2.2h-2.2Z`, loch: true },
} as const;

export type MarkenKategorie = keyof typeof KATEGORIE_MARKEN;

export function KategorieMarke({ kategorie, className }: { kategorie: string; className?: string }) {
  const marke = KATEGORIE_MARKEN[kategorie as MarkenKategorie] ?? KATEGORIE_MARKEN.neuigkeiten;
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      data-marke={kategorie}
      className={klassen('shrink-0', className ?? 'size-4')}
    >
      <path d={marke.d} fill="currentColor" fillRule={marke.loch ? 'evenodd' : 'nonzero'} />
    </svg>
  );
}
