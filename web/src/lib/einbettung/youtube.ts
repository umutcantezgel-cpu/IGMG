/**
 * YouTube nur nach Klick (K-14, Plan Marktstart): Video-ID aus einer eingefügten Adresse und die beiden Adressen, die die
 * Website daraus baut. Rein, ohne Abhängigkeiten – genutzt vom Schema `youtubeId` (`src/lib/validierung/url.ts`) und von den
 * Seiten, die `NachKlick` die fertige Einbettungsadresse übergeben. Vorschaubilder von YouTube (ytimg) gibt es nicht.
 */

/** Video-ID: genau 11 Zeichen aus Buchstaben, Ziffern, „_“ und „-“. */
export const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

/** Hosts, deren Adressen eine Video-ID tragen können (mit und ohne „www.“, mobil, ohne Cookies). */
const HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com']);

/**
 * Video-ID aus einer Eingabe: die ID selbst, `youtu.be/<id>`, `youtube.com/watch?v=<id>`, `…/embed/<id>` oder
 * `…/shorts/<id>` (mit oder ohne `https://`). Alles andere ergibt `null`.
 */
export function youtubeIdAus(roh: string): string | null {
  const eingabe = roh.trim();
  if (YOUTUBE_ID.test(eingabe)) return eingabe;
  let adresse: URL;
  try {
    adresse = new URL(/^[a-z][a-z\d+.-]*:\/\//i.test(eingabe) ? eingabe : `https://${eingabe}`);
  } catch {
    return null;
  }
  if (adresse.protocol !== 'https:' && adresse.protocol !== 'http:') return null;
  const host = adresse.hostname.toLowerCase();
  const teile = adresse.pathname.split('/').filter(Boolean);
  let id: string | null | undefined;
  if (host === 'youtu.be') id = teile.length === 1 ? teile[0] : undefined;
  else if (HOSTS.has(host)) {
    if (teile.length === 1 && teile[0] === 'watch') id = adresse.searchParams.get('v');
    else if (teile.length === 2 && (teile[0] === 'embed' || teile[0] === 'shorts')) id = teile[1];
  }
  return id && YOUTUBE_ID.test(id) ? id : null;
}

/** Prüft eine Video-ID; die Adressen unten entstehen nur aus geprüften IDs (Programmierfehler sonst). */
function geprueft(id: string): string {
  if (!YOUTUBE_ID.test(id)) throw new Error(`Ungültige YouTube-ID: ${id}`);
  return id;
}

/** Einbettung erst nach dem Klick: youtube-nocookie startet sofort (der Klick war die Absicht), keine fremden Vorschläge. */
export function youtubeEinbettung(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${geprueft(id)}?autoplay=1&rel=0`;
}

/** Reiner Link „Auf YouTube ansehen“ (keine Anfrage beim Seitenaufruf). */
export function youtubeLink(id: string): string {
  return `https://www.youtube.com/watch?v=${geprueft(id)}`;
}
