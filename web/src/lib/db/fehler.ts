import { DrizzleQueryError } from 'drizzle-orm/errors';
import { PgPreparedQuery } from 'drizzle-orm/pg-core';

/**
 * Protokolle ohne Personendaten (AUFTRAG V-10): drizzle-orm hängt bei einem fehlgeschlagenen Befehl alle Parameter an
 * die Meldung (`DrizzleQueryError`, `params: …`), und der Treiber legt bei Verletzungen von Eindeutigkeit oder Prüfung
 * die betroffenen Werte in `detail` ab („Key (email)=(…)“, „Failing row contains (…)“). Unbehandelte Fehler schreibt
 * Next mit `console.error` ins Laufzeitprotokoll – mit E-Mail-Adressen, Namen oder Nachrichtentexten.
 *
 * Diese Kürzung lässt den SQL-Text (nur Platzhalter), Fehlercode, Tabelle und Constraint stehen und entfernt Parameter
 * und `detail` (auch am Treiberfehler in `cause`). Der Fehler bleibt dasselbe Objekt (Typ, `cause.code`), nur ohne Werte.
 */
export function kuerzeDbFehler(e: unknown): unknown {
  if (!(e instanceof DrizzleQueryError)) return e;
  const vorher = e.message;
  const anzahl = Array.isArray(e.params) ? e.params.length : 0;
  e.message = `Failed query: ${e.query}\nparams: [${anzahl} ausgeblendet]`;
  e.params = [];
  // Der Stapel trägt die Meldung aus dem Konstruktor als erste Zeile
  if (typeof e.stack === 'string') e.stack = e.stack.replace(vorher, e.message);
  // Treiberfehler: `detail` (pg und PGlite) und die Parameter, die PGlite zusätzlich mitführt
  const ursache: unknown = e.cause;
  if (ursache && typeof ursache === 'object') {
    for (const feld of ['detail', 'params'] as const) delete (ursache as Record<string, unknown>)[feld];
  }
  return e;
}

type Abfrage = (queryString: string, params: unknown[], query: () => Promise<unknown>) => Promise<unknown>;
const KENNUNG = Symbol.for('igmg.dbFehlerGekuerzt');

/**
 * Hängt die Kürzung einmal an die gemeinsame Stelle, an der drizzle-orm Fehler aller Postgres-Treiber verpackt
 * (`PgPreparedQuery.queryWithCache`, gilt für `pg` und PGlite, auch in Transaktionen und `db.execute`).
 */
export function installiereFehlerKuerzung(): void {
  const proto = PgPreparedQuery.prototype as unknown as { queryWithCache: Abfrage; [KENNUNG]?: true };
  if (proto[KENNUNG]) return;
  const urspruenglich = proto.queryWithCache;
  proto.queryWithCache = async function (this: unknown, ...argumente: Parameters<Abfrage>) {
    try {
      return await urspruenglich.apply(this, argumente);
    } catch (e) {
      throw kuerzeDbFehler(e);
    }
  };
  proto[KENNUNG] = true;
}
