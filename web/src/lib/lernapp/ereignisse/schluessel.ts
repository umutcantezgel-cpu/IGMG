import * as z from '../z';

/**
 * Stabile Schlüssel aus dem Inhalt (z. B. `tr-aus-de`, `tr.a1.e03.l0042`, `tr-aus-de.a1.e01.l02`). Eigenes Modul, damit die
 * Paketprüfung (Aufgaben-Schemas) die Ereignis-Schemas (`typen.ts`) nicht mitlädt (KERN 4.0 §9); `typen.ts` reicht es weiter.
 */
export const SchluesselSchema = z.string().check(z.minLength(1), z.maxLength(160), z.regex(/^[a-z0-9][a-z0-9._:-]*$/i));
