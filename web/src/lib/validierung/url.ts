import { z } from 'zod';
import { ERLAUBTE_HOSTS } from '../dachverband/netzwerk';
import { YOUTUBE_ID, youtubeIdAus } from '../einbettung/youtube';
import { mehrsprachig, mehrsprachigOptional } from './mehrsprachig';

/**
 * Adressen, Verweise und Kalendertage für Seiteninhalte (Plan Marktstart). Eigenes Modul, damit die Schemas unter
 * `seiteninhalte/` es importieren können: `seiteninhalte.ts` importiert jene und exportiert `HTTPS_URL` weiter
 * (sonst Importzyklus mit Zugriff vor der Initialisierung).
 */

/** Externe Adresse: nur https mit Host (keine javascript:-, data:- oder http-Links in öffentlichen Seiten). */
export const HTTPS_URL = z.url({ protocol: /^https$/, hostname: z.regexes.domain });

/** Adresse je Sprache: Deutsch Pflicht, Türkisch/Englisch optional (fehlt eine, gilt die deutsche Adresse). */
export const mehrsprachigeUrl = z.object({ de: HTTPS_URL, tr: HTTPS_URL.optional(), en: HTTPS_URL.optional() });

/** Verweis auf eine externe Seite (gerendert von `Verweisliste`): Titel, kurze Beschreibung, Adresse je Sprache. */
export const verweis = z.object({
  titel: mehrsprachig(160),
  beschreibung: mehrsprachigOptional(300).optional(),
  url: mehrsprachigeUrl,
});
export type Verweis = z.infer<typeof verweis>;

/** Kalendertag JJJJ-MM-TT; Zod prüft Monatslänge und Schaltjahr mit (31. Februar wird abgelehnt). */
export const datumIso = z.iso.date();

/**
 * YouTube-Video-ID. Eingefügte Adressen (`youtu.be/…`, `watch?v=…`, `/embed/…`, `/shorts/…`) werden zur ID; gespeichert
 * wird nur die ID – die Einbettungsadresse baut `youtubeEinbettung` (youtube-nocookie, erst nach Klick, K-14).
 */
export const youtubeId = z.preprocess(
  (roh) => (typeof roh === 'string' ? (youtubeIdAus(roh) ?? roh.trim()) : roh),
  z.string().refine((id) => YOUTUBE_ID.test(id)),
);

/** Host einer Adresse oder leer, wenn sie sich nicht lesen lässt. */
function hostVon(adresse: string): string {
  try {
    return new URL(adresse).hostname;
  } catch {
    return '';
  }
}

/** Adresse beim Dachverband, bei IGMG Reisen oder einem Fachverein: https und Host aus der Positivliste (`netzwerk.ts`). */
export const igmgUrl = HTTPS_URL.refine((adresse) => ERLAUBTE_HOSTS.includes(hostVon(adresse)));
