// Bedingung für den Testkurs in der Bau-Datenbank (scripts/bau-datenbank.mjs), eigene Datei für den Regeltest
// tests/unit/lernapp/bau-datenbank.test.ts (das Bau-Skript selbst führt beim Import alles aus).

/**
 * Den Testkurs mit synthetischen Tönen (ADR 0039 Nr. 11) in die Bau-Datenbank? Nur auf ausdrücklichen Wunsch
 * (`LERNAPP_TESTKURS=1`, z. B. für eine Vorführung im Beispielmodus). `VERCEL=1` allein reicht nicht: Der Vercel-Bau ohne
 * Datenbank ist die öffentliche Test-Domain und zeigt nur die echten Einheiten – keine Testeinheit, keine Testtöne (Stufe C,
 * L15-1). E2E und Tests importieren den Testkurs selbst (`scripts/e2e-datenbank.mjs`).
 * @param {Record<string, string | undefined>} env
 * @returns {boolean}
 */
export const testkursImBau = (env) => env.LERNAPP_TESTKURS === '1';
