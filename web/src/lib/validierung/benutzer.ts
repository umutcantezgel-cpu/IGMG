import { z } from 'zod';
import { ORGANISATION_KUERZEL, ROLLEN, type RollenZuweisung } from '@/lib/rechte/matrix';

/**
 * Konten und Rollen (C12, K-06, ADR 0003). Rollen kommen als Häkchen (`rollen`), die Organisationsredaktion zusätzlich
 * mit mindestens einer Organisation (`organisationen`). Fehlerschlüssel unter `verwaltung.benutzer.fehler.*`.
 */
const rollenFelder = {
  rollen: z.array(z.enum(ROLLEN, 'ungueltig'), 'rolleFehlt').min(1, 'rolleFehlt'),
  organisationen: z.array(z.enum(ORGANISATION_KUERZEL, 'ungueltig')).default([]),
};
type RollenEingabe = { rollen: (typeof ROLLEN)[number][]; organisationen: (typeof ORGANISATION_KUERZEL)[number][] };
const organisationPasst = (d: RollenEingabe) => !d.rollen.includes('organisationsredaktion') || d.organisationen.length > 0;
const organisationFehler = { path: ['organisationen'], message: 'organisationFehlt' };

export const rollenSchema = z.object(rollenFelder).refine(organisationPasst, organisationFehler);

export const einladungSchema = z
  .object({
    email: z.string('email').trim().toLowerCase().max(254, 'zuLang').pipe(z.email('email')),
    name: z.string('pflicht').trim().min(2, 'pflicht').max(100, 'zuLang'),
    gueltigTage: z.coerce.number('ungueltig').int('ungueltig').min(1, 'ungueltig').max(14, 'ungueltig').default(3),
    ...rollenFelder,
  })
  .refine(organisationPasst, organisationFehler);

/** Formular → Zuweisungen; Organisationen zählen nur für die Organisationsredaktion. */
export function alsZuweisungen(d: RollenEingabe): RollenZuweisung[] {
  return [...new Set(d.rollen)].flatMap((rolle): RollenZuweisung[] =>
    rolle === 'organisationsredaktion'
      ? [...new Set(d.organisationen)].map((organisation) => ({ rolle, organisation }))
      : [{ rolle, organisation: null }],
  );
}

export const passwortSchema = z
  .object({
    aktuell: z.string('pflicht').min(1, 'pflicht').max(128, 'zuLang'),
    neu: z.string('passwortKurz').min(12, 'passwortKurz').max(128, 'zuLang'),
    wiederholung: z.string('passwortGleich'),
  })
  .refine((d) => d.neu === d.wiederholung, { path: ['wiederholung'], message: 'passwortGleich' })
  .refine((d) => d.neu !== d.aktuell, { path: ['neu'], message: 'passwortGleichAlt' });
