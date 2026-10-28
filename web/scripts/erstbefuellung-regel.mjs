// Bedingungen der Erstbefüllung im Vercel-Bau (E-047, Nachtrag ADR 0019 vom 28.10.2026), eigene Datei für den Regeltest
// tests/unit/erstbefuellung.test.ts (das Bau-Skript selbst führt beim Import alles aus). Ausführung:
// scripts/erstbefuellung.ts mit src/lib/wartung/erstbefuellung.ts.

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const VARIABLEN = ['ERSTBEFUELLUNG', 'ERSTE_VERWALTUNG_EMAIL', 'ERSTE_VERWALTUNG_NAME'];

/** @typedef {{ seed: boolean, einladung: { email: string, name: string } | null, hinweise: string[], fehler: string[] }} ErstbefuellungPlan */

/** @param {string | undefined} wert */
const gesetzt = (wert) => (wert?.trim() ? wert.trim() : undefined);

/**
 * Was der Bau mit Datenbank zusätzlich tut, solange niemand eine Kommandozeile an der Datenbank hat: die Seeds einmalig
 * einspielen (`ERSTBEFUELLUNG=1`) und das erste Verwaltungskonto einladen (`ERSTE_VERWALTUNG_EMAIL` und
 * `ERSTE_VERWALTUNG_NAME`). Beides nur in Production (`VERCEL_ENV=production`); in anderen Bauläufen bleibt es bei einem
 * Hinweis. Unvollständige oder ungültige Angaben in Production sind ein Fehler (der Bau bricht ab), damit kein
 * Einladungslink stillschweigend ausbleibt.
 * @param {Record<string, string | undefined>} env
 * @returns {ErstbefuellungPlan}
 */
export function erstbefuellungImBau(env) {
  const flag = gesetzt(env.ERSTBEFUELLUNG);
  const email = gesetzt(env.ERSTE_VERWALTUNG_EMAIL)?.toLowerCase();
  const name = gesetzt(env.ERSTE_VERWALTUNG_NAME);
  /** @type {ErstbefuellungPlan} */
  const plan = { seed: false, einladung: null, hinweise: [], fehler: [] };
  if (env.VERCEL_ENV !== 'production') {
    const da = VARIABLEN.filter((v) => gesetzt(env[v]) !== undefined);
    if (da.length) plan.hinweise.push(`${da.join(', ')} gilt nur im Production-Bau – hier übersprungen.`);
    return plan;
  }
  if (flag !== undefined && flag !== '1') plan.fehler.push(`ERSTBEFUELLUNG muss 1 sein (gesetzt: „${flag}“).`);
  plan.seed = flag === '1';
  if (email === undefined && name === undefined) return plan;
  if (email === undefined) plan.fehler.push('ERSTE_VERWALTUNG_NAME ist gesetzt, ERSTE_VERWALTUNG_EMAIL fehlt.');
  else if (!EMAIL.test(email)) plan.fehler.push('ERSTE_VERWALTUNG_EMAIL ist keine gültige E-Mail-Adresse.');
  if (name === undefined) plan.fehler.push('ERSTE_VERWALTUNG_EMAIL ist gesetzt, ERSTE_VERWALTUNG_NAME fehlt.');
  if (!plan.fehler.length && email !== undefined && name !== undefined) plan.einladung = { email, name };
  return plan;
}

/**
 * Basis des Einladungslinks im Production-Bau: `APP_URL`, sonst die Produktionsadresse von Vercel
 * (`VERCEL_PROJECT_PRODUCTION_URL`). Nie die Adresse des einzelnen Deployments: Die steht hinter dem Vercel-Schutz.
 * @param {Record<string, string | undefined>} env
 * @returns {string | undefined}
 */
export function einladungsBasis(env) {
  const app = gesetzt(env.APP_URL);
  if (app) return app.replace(/\/+$/, '');
  const host = gesetzt(env.VERCEL_PROJECT_PRODUCTION_URL);
  return host ? `https://${host.replace(/^https?:\/\//, '').replace(/\/+$/, '')}` : undefined;
}
