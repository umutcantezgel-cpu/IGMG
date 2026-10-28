import { Info } from 'lucide-react';
import { GEBETE, type Gebet } from '@/lib/gebetszeiten/typen';
import { cn } from '@/lib/utils';
import type { GebetszeitenMonat } from '@/server/queries/gebetszeiten';
import { tagKurz } from './zeiten';

export type MonatsTabelleTexte = {
  titel: string;
  untertitel: string;
  berechnet: string;
  /** Marke je gerechnetem Tag in einem gemischten Monat („vorläufig“, ADR 0048) */
  vorlaeufig: string;
  ramadan: string;
  datum: string;
  namen: Record<Gebet, string>;
  /** Zeiten sind berechnet und nicht von der Gemeinde bestätigt (G-06). */
  hinweis: boolean;
};

/**
 * Monatsübersicht eines Monats (Tab Monatlich, Blatt S02): jeder Tag des Monats, Ramadan-Tage mit Textmarke,
 * Hinweis „berechnet (vorläufig)“ solange die Quelle nicht bestätigt ist. Mischt ein Monat Tabellen-Tage (IGMG oder
 * Import) mit gerechneten Tagen, trägt jeder gerechnete Tag die Marke „vorläufig“ (ADR 0048). Die Tabelle hat eine
 * Beschriftung (caption).
 */
export function MonatsTabelle({ monat, texte }: { monat: GebetszeitenMonat; texte: MonatsTabelleTexte }) {
  const jeTag = monat.quelle === 'gemischt' && texte.hinweis;
  return (
    <section className="flex flex-col gap-4 rounded-lg border border-linie bg-weiss p-5 md:p-8">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <p className="text-16 leading-einleitung text-tinte-2">{texte.untertitel}</p>
        {texte.hinweis ? (
          <span className="inline-flex items-center gap-1.5 rounded-pill bg-warnung-toenung px-2.5 py-0.5 text-16 font-bold text-warnung">
            <Info aria-hidden className="size-4" />
            {texte.berechnet}
          </span>
        ) : null}
      </div>
      <div className="relative overflow-x-auto rounded-md border border-linie">
        <table className="w-full min-w-2xl border-collapse text-18 tabular-nums">
          <caption className="px-4 pt-4 pb-3 text-left font-display text-24 leading-tight">{texte.titel}</caption>
          <thead>
            <tr className="bg-sand text-left">
              <th scope="col" className="px-3.5 py-3">
                {texte.datum}
              </th>
              {GEBETE.map((g) => (
                <th key={g} scope="col" className="px-3.5 py-3">
                  {texte.namen[g]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {monat.tage.map((tag) => (
              <tr key={tag.datum} className={cn('border-t border-linie', tag.ramadan ? 'bg-gruen-50' : 'bg-weiss')}>
                <th scope="row" className="px-3.5 py-3 text-left font-bold">
                  <span className="flex flex-wrap items-center gap-2">
                    {tagKurz(tag.datum)}
                    {tag.ramadan ? (
                      <span className="rounded-pill bg-gruen-700 px-2 py-0.5 text-16 font-bold text-weiss">{texte.ramadan}</span>
                    ) : null}
                    {jeTag && tag.quelle === 'berechnet' ? (
                      <span className="rounded-pill bg-warnung-toenung px-2 py-0.5 text-16 font-bold text-warnung">{texte.vorlaeufig}</span>
                    ) : null}
                  </span>
                </th>
                {GEBETE.map((g) => (
                  <td key={g} className="px-3.5 py-3">
                    {tag[g]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
