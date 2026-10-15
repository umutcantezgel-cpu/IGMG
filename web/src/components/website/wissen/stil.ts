/** Gestaltung der Karten und Dialoginhalte: ausschließlich Tokens aus globals.css (K-04). */

/** Schraffierte Fläche statt Foto (Utility aus globals.css: 135°-Streifen aus Tokens). */
export const STREIFEN = 'streifen-platzhalter';

/** Karte wie im Design: weiß, Linie, 12 px Radius; Hover: grüner Rand und Schatten 2 (REFERENZ §2). */
export const KARTE =
  'flex h-full flex-col gap-3 rounded-lg border border-linie bg-weiss p-6 shadow-s1 transition duration-(--dauer-rueckmeldung) hover:border-gruen-700 hover:shadow-s2';

/** Umrissknopf „Weiterlesen“ und „Mehr erfahren“ (2 px Rand, daher px-5.5 wie im Knopf der Startseite). */
export const UMRISS =
  'mt-auto inline-flex min-h-12 items-center gap-2 self-start rounded-md border-2 border-gruen-700 bg-weiss px-5.5 font-bold text-gruen-800 transition duration-(--dauer-rueckmeldung) hover:bg-gruen-50 druck';

/** Voller Knopf in Grün: „Video ansehen“ und „Artikel anzeigen“. */
export const VOLL =
  'inline-flex min-h-12 items-center gap-2 self-start rounded-md bg-gruen-700 px-6 font-bold text-weiss transition duration-(--dauer-rueckmeldung) hover:bg-gruen-800 druck';

/** Kennzeichen des Themas auf einer Karte und im Dialog. */
export const THEMA_TAG = 'inline-flex rounded-pill bg-gruen-50 px-3 py-0.5 font-bold text-gruen-800';
