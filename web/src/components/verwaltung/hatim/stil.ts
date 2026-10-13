/** Pillen der Hatim-Verwaltung: Sichtbarkeit (Entwurf/veröffentlicht) und Stand (läuft/vollendet/archiviert). */
export const pille = 'inline-flex items-center rounded-pill px-3 py-0.5 text-16 font-bold whitespace-nowrap';
export const SICHTBAR_FARBE = { entwurf: 'bg-sand text-tinte-2', veroeffentlicht: 'bg-gruen-50 text-gruen-800' } as const;
export const STATUS_FARBE = {
  offen: 'bg-info-toenung text-info',
  abgeschlossen: 'bg-gruen-50 text-gruen-800',
  archiviert: 'bg-sand text-tinte-2',
} as const;
