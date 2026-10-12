/**
 * Kurzes Datum je Kalendertag „JJJJ-MM-TT“ (z. B. „Mo., 12. Okt.“) für zeitabhängige Inseln im Browser. Auf dem Server
 * berechnet und als Text übergeben (H-L01): Im Browser kostete das erste Datumsformat beim Laden spürbar Rechenzeit.
 */
export function datumszeilen(daten: string[], locale: string): Record<string, string> {
  const format = new Intl.DateTimeFormat(locale, { timeZone: 'UTC', weekday: 'short', day: 'numeric', month: 'short' });
  return Object.fromEntries(
    daten.map((datum) => {
      const [j, m, t] = datum.split('-').map(Number);
      return [datum, format.format(new Date(Date.UTC(j, m - 1, t, 12)))];
    }),
  );
}
