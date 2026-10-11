/** Gestaltung der Karten und Dialoginhalte: ausschließlich Tokens aus globals.css (K-04). */

/** Schraffierte Fläche statt Foto (Design: 135°-Streifen aus Tokens). */
export const STREIFEN = 'bg-[repeating-linear-gradient(135deg,var(--color-sand)_0_10px,var(--color-papier)_10px_20px)]';

/** Karte wie im Design: weiß, Linie, 12 px Radius. */
export const KARTE = 'flex h-full flex-col gap-3 rounded-lg border border-linie bg-weiss p-6';

/** Umrissknopf „Weiterlesen“ und „Mehr erfahren“. */
export const UMRISS =
  'mt-auto inline-flex min-h-12 items-center gap-2 self-start rounded-md border-2 border-gruen-700 bg-weiss px-5 font-bold text-gruen-800 hover:bg-gruen-50';

/** Voller Knopf in Grün: „Video ansehen“ und „Artikel anzeigen“. */
export const VOLL =
  'inline-flex min-h-12 items-center gap-2 self-start rounded-md bg-gruen-700 px-5 font-bold text-weiss hover:bg-gruen-800';

/** Kennzeichen des Themas auf einer Karte und im Dialog. */
export const THEMA_TAG = 'inline-flex rounded-pill bg-gruen-50 px-3 py-0.5 font-bold text-gruen-800';
