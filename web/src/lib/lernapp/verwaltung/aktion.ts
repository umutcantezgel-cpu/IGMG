import 'server-only';
import { datenbankVerfuegbar } from '@/lib/db/verfuegbar';
import { funktionAn } from '@/lib/funktionen';
import type { Aktion } from '@/lib/rechte/matrix';
import { type Angemeldet, KeinRecht, verlangeRecht } from '@/lib/rechte/pruefe';
import { formelTreffer } from '../formelkandidat';
import { LATEIN_FORMELN } from '../formelliste';
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
 * `lernapp:pruefen`. Koran- und Hadith-4-Gramme sind immer Rot; ein Treffer im Formel-Lexikon oder eine lateinische Formel
 * der Formelliste (F-de, F-tr; `formelkandidat.ts`, wie der Inhaltsprüfer und der Paketbau – Gegenprüfung N2) nur bei
 * Einträgen mit `religionsbezug` erlaubt (die brauchen ohnehin zwei religiöse Freigaben und die freigegebene Liste). Die
 * Sprache des Texts kennt die Aktion nicht sicher, also beide Lateinschriften. Ergebnis ohne arabische Schrift und ohne
 * Fundstelle.
 */
export function waechterBefund(text: string, religionsbezug: boolean): null | 'formel' | 'wortfolge' {
  const w = ladeWaechter();
  if (vierGrammTreffer(text, w.index)) return 'wortfolge';
  if (religionsbezug) return null;
  if (lexikonTreffer(text, w.lexikon)) return 'formel';
  if (formelTreffer(text, 'de', LATEIN_FORMELN) || formelTreffer(text, 'tr', LATEIN_FORMELN)) return 'formel';
  return null;
}
