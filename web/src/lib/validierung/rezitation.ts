import { z } from 'zod';

/**
 * Formular „Rezitation“ der Verwaltung (O-Q02, ADR 0029, ADR 0005): ein Schema für Formular und Server Action.
 * Fehlermeldungen sind Schlüssel unter `verwaltung.rezitationen.fehler`. Name Deutsch Pflicht, Türkisch/Englisch optional.
 * Die Kennung (ID) wird beim Anlegen aus dem Namen gebildet, wenn sie leer bleibt; sie steht in jedem Audiopfad.
 */
export const REZITATION_ARTEN = ['eigen', 'lizenziert'] as const;

const pflichtText = (min: number, max: number) => z.string('pflicht').trim().min(1, 'pflicht').min(min, 'zuKurz').max(max, 'zuLang');
const text = (max: number) => z.string().trim().max(max, 'zuLang').default('');

export const rezitationSchema = z.object({
  nameDe: pflichtText(2, 120),
  nameTr: text(120),
  nameEn: text(120),
  rezitator: pflichtText(2, 120),
  art: z.enum(REZITATION_ARTEN, 'art'),
  lizenz: pflichtText(2, 300),
  kennung: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^(?:[a-z0-9][a-z0-9-]{0,38}[a-z0-9])?$/, 'kennung')
    .default(''),
});
export type RezitationEingabe = z.infer<typeof rezitationSchema>;

export const REZITATION_FELDER = ['nameDe', 'nameTr', 'nameEn', 'rezitator', 'art', 'lizenz', 'kennung'] as const;

export const NEUE_REZITATION: Record<(typeof REZITATION_FELDER)[number], string> = {
  nameDe: '',
  nameTr: '',
  nameEn: '',
  rezitator: '',
  art: 'eigen',
  lizenz: '',
  kennung: '',
};

const UMLAUTE: Record<string, string> = { ä: 'ae', ö: 'oe', ü: 'ue', ß: 'ss', ç: 'c', ğ: 'g', ı: 'i', ş: 's', â: 'a', î: 'i', û: 'u' };

/** Kennung aus einem Namen: klein, Umlaute umschrieben, sonst nur a–z, 0–9 und Bindestrich, 2–36 Zeichen. */
export function kennungAus(name: string): string {
  const basis = name
    .toLowerCase()
    .replace(/[äöüßçğışâîû]/g, (z) => UMLAUTE[z] ?? z)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 36)
    .replace(/-+$/g, '');
  return basis.length >= 2 ? basis : `rezitation${basis ? `-${basis}` : ''}`;
}
