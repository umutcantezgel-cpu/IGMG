import 'server-only';
import { datenbankVerfuegbar } from '@/lib/db/verfuegbar';
import { funktionAn } from '@/lib/funktionen';
import type { Aktion } from '@/lib/rechte/matrix';
import { type Angemeldet, KeinRecht, verlangeRecht } from '@/lib/rechte/pruefe';
import { ladeWaechter } from '../inhalt/religion';
import { lexikonTreffer, vierGrammTreffer } from '../waechter/kern.mjs';

/**
 * Gemeinsamer Rahmen der Server Actions der Lern-App-Verwaltung (L3-06): Reihenfolge Datenbank (Beispielmodus: Hinweis
 * statt Fehler) → Sitzung mit zweitem Faktor und Recht (`verlangeRecht`) → Schalter `lernapp`. Rückgabe statt Ausnahme,
 * damit Formulare und Tastenkürzel eine Meldung zeigen. Audit schreibt jede Action selbst, ohne Inhalte.
 */
export type LernappZustand = {
  fehler?: string;
  feldFehler?: Partial<Record<string, string>>;
  werte?: Record<string, string>;
  gespeichert?: number;
  hinweis?: string;
  /** Kennung eines angelegten Datensatzes (z. B. Stichprobe) */
  id?: string;
};

export async function mitLernappRecht(aktion: Aktion, f: (a: Angemeldet) => Promise<LernappZustand>): Promise<LernappZustand> {
  if (!datenbankVerfuegbar()) return { fehler: 'ohneDatenbank' };
  let a: Angemeldet;
  try {
    a = await verlangeRecht(aktion);
  } catch (e) {
    if (e instanceof KeinRecht) return { fehler: 'keinRecht' };
    throw e;
  }
  if (!(await funktionAn('lernapp'))) return { fehler: 'aus' };
  return f(a);
}

/**
 * Religionswächter für Eingaben der Verwaltung (S-L1 M-3, ADR 0040 Fortschreibung S-L1 Nr. 1): dasselbe Modul wie Import und
 * `lernapp:pruefen`. Koran- und Hadith-4-Gramme sind immer Rot; ein Treffer im Formel-Lexikon nur bei Einträgen mit
 * `religionsbezug` erlaubt (die brauchen ohnehin zwei religiöse Freigaben). Ergebnis ohne arabische Schrift und ohne Fundstelle.
 */
export function waechterBefund(text: string, religionsbezug: boolean): null | 'formel' | 'wortfolge' {
  const w = ladeWaechter();
  if (vierGrammTreffer(text, w.index)) return 'wortfolge';
  if (!religionsbezug && lexikonTreffer(text, w.lexikon)) return 'formel';
  return null;
}
