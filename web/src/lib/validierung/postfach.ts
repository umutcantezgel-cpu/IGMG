import { z } from 'zod';

/**
 * Internes Postfach der Verwaltung (C09): ein Zod-Schema für Formular und Server Action (ADR 0005).
 * Fehler sind Schlüssel unter `verwaltung.postfach.fehler`; Feldnamen = Schlüssel des Schemas.
 * Text ist Klartext (kein HTML); die Anzeige escaped ihn und erhält Zeilenumbrüche.
 */
export const BETREFF_MAX = 150;
export const TEXT_MAX = 5000;
export const EMPFAENGER_MAX = 50;

/** Steuerzeichen außer Tabulator und Zeilenumbruch sind im Klartext nicht erlaubt. */
export function hatSteuerzeichen(wert: string): boolean {
  for (const zeichen of wert) {
    const code = zeichen.charCodeAt(0);
    if ((code < 32 && code !== 9 && code !== 10) || code === 127) return true;
  }
  return false;
}

const betreff = z
  .string('pflicht')
  .transform((s) => s.trim())
  .pipe(
    z
      .string()
      .min(1, 'pflicht')
      .max(BETREFF_MAX, 'zuLang')
      .refine((s) => !hatSteuerzeichen(s), 'steuerzeichen'),
  );

/** Nachrichtentext: Zeilenenden vereinheitlichen, am Rand kürzen, höchstens 5000 Zeichen. */
const text = z
  .string('pflicht')
  .transform((s) => s.replace(/\r\n?/g, '\n').trim())
  .pipe(
    z
      .string()
      .min(1, 'pflicht')
      .max(TEXT_MAX, 'zuLang')
      .refine((s) => !hatSteuerzeichen(s), 'steuerzeichen'),
  );

export const neueUnterhaltungSchema = z.object({
  betreff,
  empfaenger: z.array(z.string().min(1, 'ungueltig').max(100, 'ungueltig')).max(EMPFAENGER_MAX, 'zuLang').min(1, 'empfaengerFehlt'),
  text,
});

export const antwortSchema = z.object({ text });

export type NeueUnterhaltungEingabe = z.infer<typeof neueUnterhaltungSchema>;

/** FormData → Rohobjekt für die Schemata. Mehrfachfelder (Empfänger) als Liste; fehlt die Auswahl, ist sie leer. */
export function ausFormular(fd: FormData): Record<string, unknown> {
  const roh: Record<string, unknown> = { empfaenger: [] };
  for (const [k, v] of fd.entries()) {
    if (typeof v !== 'string' || k.startsWith('$ACTION')) continue;
    if (k === 'empfaenger') (roh.empfaenger as string[]).push(v);
    else roh[k] = v;
  }
  return roh;
}

/** Fehlermeldungen je Feld als Schlüssel (nur Kleinbuchstaben-Schlüssel der Texte, sonst „ungueltig“). */
export function feldFehlerAus(fehler: z.ZodError): Record<string, string> {
  const ergebnis: Record<string, string> = {};
  for (const f of fehler.issues) {
    const feld = String(f.path[0] ?? 'formular');
    ergebnis[feld] ??= /^[a-zA-Z]+$/.test(f.message) && f.message.length < 30 ? f.message : 'ungueltig';
  }
  return ergebnis;
}
