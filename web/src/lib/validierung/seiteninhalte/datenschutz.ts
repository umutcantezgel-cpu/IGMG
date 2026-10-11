import { z } from 'zod';
import { bausteine } from './impressum';

/**
 * Seiteninhalt „datenschutz“ (Blatt S23, Gliederung Datenschutz; Welle A). Entwurf nach G-08: Die Abschnitte beschreiben
 * die tatsächliche Technik der App; Lücken stehen als Platzhalter in eckigen Klammern (G-05). Die verantwortliche Stelle
 * kommt aus „impressum“ (eine Quelle). Überschriften und Entwurfshinweis stehen in messages/bereiche/rechtliches.json.
 */

/** Standardtext, wenn ein Abschnitt fehlt: sichtbarer Platzhalter statt leerer Seite (Muster „[Text fehlt: …]“). */
const fehlt = (abschnitt: string) => [{ art: 'absatz' as const, text: { de: `[Text fehlt: ${abschnitt}]` } }];

export const schema = z.object({
  datenschutzbeauftragte: z.string().trim().max(300).default('[Datenschutzbeauftragte/r – Angaben von der Gemeinde]'),
  daten: bausteine.default(fehlt('Erhobene Daten')),
  zweck: bausteine.default(fehlt('Zweck und Rechtsgrundlage')),
  speicherung: bausteine.default(fehlt('Speicherdauer und Löschung')),
  sicherheit: bausteine.default(fehlt('Sicherheit Ihrer Daten')),
  empfaenger: bausteine.default(fehlt('Empfänger und Dienste Dritter')),
  browser: bausteine.default(fehlt('Cookies und Speicher im Browser')),
  rechte: bausteine.default(fehlt('Ihre Rechte')),
});

export type DatenschutzInhalt = z.infer<typeof schema>;
