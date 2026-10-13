/** Gemeinsame Klassen der Verwaltung „Lernen und Aufnahme“ (nur Tokens aus globals.css). */
export const karte = 'flex min-w-0 flex-col gap-4 rounded-lg border border-linie bg-weiss p-5 md:p-6';
export const pille = 'inline-flex items-center rounded-pill px-3 py-0.5 text-16 font-bold whitespace-nowrap';
export const pilleGut = `${pille} bg-gruen-50 text-gruen-800`;
export const pilleWarnung = `${pille} bg-warnung-toenung text-warnung`;
export const pilleFehler = `${pille} bg-fehler-toenung text-fehler`;
export const pilleNeutral = `${pille} bg-sand text-tinte-2`;
export const feldKlein = 'min-h-12 rounded-md border border-rand bg-weiss px-3 text-18';
export const ansichtLink = 'inline-flex min-h-12 items-center rounded-pill border px-4 font-bold no-underline';
export const ansichtAktiv = 'border-gruen-700 bg-gruen-700 text-weiss hover:text-weiss';
export const ansichtInaktiv = 'border-rand bg-weiss text-tinte hover:bg-gruen-50 hover:text-tinte';

/** Kalendertag „JJJJ-MM-TT“ als Date (Mittag UTC), damit die Berliner Formatierung den richtigen Tag zeigt. */
export const alsTag = (datum: string) => new Date(`${datum}T12:00:00Z`);
