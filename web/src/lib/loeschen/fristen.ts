import { TZDate } from '@date-fns/tz';

/**
 * Reine Fristregeln der Gemeinde-Plattform (DSFA D-14, D-16; Löschkonzept L-14, L-15). Ohne Datenbank, unit-getestet
 * (`tests/unit/loeschfristen-regeln.test.ts`). Die Fristen sind Vorschläge der DSFA, bis Vorstand und DSB entscheiden
 * (MENSCHEN MN-11); Änderung nur hier und im Löschkonzept.
 */
const ZONE = 'Europe/Berlin';
const TAG_MS = 86_400_000;

/** D-14: Einwilligungsnachweise ohne Lernende bis zum Ende der Verjährung (3 Jahre ab Ende des Jahres). */
export const NACHWEIS_JAHRE = 3;

/**
 * Ende der Aufbewahrung eines Einwilligungsnachweises, wenn die Lernenden am `ereignis` gelöscht werden: Die
 * regelmäßige Verjährung (§§ 195, 199 BGB) beginnt mit dem Schluss des Jahres und dauert drei Jahre – der Nachweis
 * bleibt also bis zum 1. Januar des vierten Folgejahres, 0 Uhr Wetzlarer Zeit.
 */
export function nachweisFrist(ereignis: Date): Date {
  const jahr = new TZDate(ereignis.getTime(), ZONE).getFullYear();
  return new Date(new TZDate(jahr + NACHWEIS_JAHRE + 1, 0, 1, 0, 0, 0, ZONE).getTime());
}

/** D-16: Gemeinde-Konten ohne Anmeldung werden nach 24 Monaten gelöscht, mit Vorwarnung 30 Tage vorher. */
export const INAKTIV_MONATE = 24;
export const VORWARNUNG_TAGE = 30;

/** `d` plus `monate` Kalendermonate (UTC; der Tag rutscht am Monatsende wie bei `Date`). */
export function plusMonate(d: Date, monate: number): Date {
  const z = new Date(d.getTime());
  z.setUTCMonth(z.getUTCMonth() + monate);
  return z;
}

export type InaktivStufe = 'aktiv' | 'warnen' | 'warten' | 'loeschen';

/**
 * Stufe eines Kontos im Löschlauf: `zuletztAktiv` ist die letzte Anmeldung (sonst die Anlage des Kontos). Eine
 * Vorwarnung, nach der sich die Person wieder angemeldet hat, zählt nicht mehr. Gelöscht wird frühestens 24 Monate
 * nach der letzten Anmeldung **und** 30 Tage nach der Vorwarnung – niemand verliert sein Konto ohne volle Frist.
 */
export function inaktivStufe(k: { zuletztAktiv: Date; gewarntAm: Date | null }, jetzt: Date): InaktivStufe {
  const loeschAb = plusMonate(k.zuletztAktiv, INAKTIV_MONATE).getTime();
  const gewarnt = k.gewarntAm && k.gewarntAm.getTime() >= k.zuletztAktiv.getTime() ? k.gewarntAm : null;
  const t = jetzt.getTime();
  if (!gewarnt) return t >= loeschAb - VORWARNUNG_TAGE * TAG_MS ? 'warnen' : 'aktiv';
  return t >= Math.max(loeschAb, gewarnt.getTime() + VORWARNUNG_TAGE * TAG_MS) ? 'loeschen' : 'warten';
}

/** Löschdatum, das die Vorwarnung nennt (bei Vorwarnung `jetzt`). */
export function inaktivLoeschDatum(zuletztAktiv: Date, gewarntAm: Date): Date {
  return new Date(Math.max(plusMonate(zuletztAktiv, INAKTIV_MONATE).getTime(), gewarntAm.getTime() + VORWARNUNG_TAGE * TAG_MS));
}

/**
 * Vorfilter der Abfrage: Konten, deren letzte Aktivität vor diesem Zeitpunkt liegt, können fällig sein (ein Tag
 * Spielraum für die Monatsrechnung). Was wirklich gilt, entscheidet `inaktivStufe`.
 */
export function inaktivVorfilter(jetzt: Date): Date {
  return new Date(plusMonate(jetzt, -INAKTIV_MONATE).getTime() + (VORWARNUNG_TAGE + 1) * TAG_MS);
}
