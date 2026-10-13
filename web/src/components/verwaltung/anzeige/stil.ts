/** Pillen der Anzeige-Verwaltung: Sichtbarkeit (Entwurf/sichtbar) und religiöse Freigabe (Vers/Hadith). */
export const pille = 'inline-flex items-center rounded-pill px-3 py-0.5 text-16 font-bold whitespace-nowrap';
export const STATUS_FARBE = { entwurf: 'bg-sand text-tinte-2', veroeffentlicht: 'bg-gruen-50 text-gruen-800' } as const;
export const FREIGABE_FARBE = {
  entwurf: 'border border-dashed border-rand bg-weiss text-tinte-2',
  zur_pruefung: 'bg-warnung-toenung text-tinte',
  geprueft: 'bg-gruen-50 text-gruen-800',
} as const;
export const KARTE = 'flex flex-col gap-4 rounded-lg border border-linie bg-weiss p-5 shadow-s1 md:p-6';
