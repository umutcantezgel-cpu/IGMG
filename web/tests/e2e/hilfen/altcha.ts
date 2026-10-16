/**
 * Wartezeit auf die ALTCHA-Lösung im Browser (Proof-of-Work, ADR 0005, `KOSTEN` in src/lib/validierung/altcha.ts).
 * Die Dauer hängt allein an der Rechenleistung: gemessen auf 4 Kernen (Xeon 2,1 GHz) ohne Fremdlast 0,9–8,4 s, im vollen
 * Lauf neben parallelen Bauten bis über 20 s (Nacharbeit 2, P4, tests/e2e/LIESMICH.md). Die Tests geben ihr deshalb
 * 60 s – die Testzeiten der Formular-Specs (≥ 150 s) lassen das zu.
 */
export const ALTCHA_MS = 60_000;
