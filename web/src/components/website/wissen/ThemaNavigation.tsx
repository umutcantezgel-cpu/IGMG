import { Check, X } from 'lucide-react';
import { Link } from '@/i18n/link';
import { cn } from '@/lib/utils';
import type { ThemaAnzeige } from './typen';

export type ThemaNavigationProps = {
  /** Überschrift „Entdecken Sie diese Themen“. */
  titel: string;
  gefiltertNach: string;
  filterEntfernen: string;
  /** Alle sichtbaren Themen in Sortierreihenfolge. */
  themen: ThemaAnzeige[];
  /** Das Thema dieser Seite. */
  aktuell: ThemaAnzeige;
};

/**
 * Themenleiste der Themenseite (design/IslamicKnowledge.dc.html Z24–31, Blatt S14). Auf der Themenseite hat jedes
 * Thema eine eigene Adresse, deshalb sind die Schaltflächen des Designs hier Links. Das aktuelle Thema trägt
 * aria-current und das Häkchen; „Filter entfernen“ führt zur Übersicht. Server-Komponente ohne Client-Code (K-12).
 */
export function ThemaNavigation({ titel, gefiltertNach, filterEntfernen, themen, aktuell }: ThemaNavigationProps) {
  return (
    <section aria-labelledby="thema-themen" className="flex flex-col gap-4">
      <h2 id="thema-themen" className="text-30 md:text-36">
        {titel}
      </h2>
      <ul aria-labelledby="thema-themen" className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,200px),1fr))] gap-3">
        {themen.map((th) => {
          const ist = th.schluessel === aktuell.schluessel;
          return (
            <li key={th.schluessel}>
              <Link
                href={{ pathname: '/islamisches-wissen/[thema]', params: { thema: th.schluessel } }}
                aria-current={ist ? 'page' : undefined}
                className={cn(
                  'flex min-h-16 items-center justify-between gap-2 rounded-lg px-4 py-3 text-18 font-bold text-tinte no-underline hover:border-gruen-700 hover:bg-gruen-50 hover:text-tinte',
                  ist ? 'border-2 border-gruen-700 bg-gruen-50' : 'border border-linie bg-weiss',
                )}
              >
                <span lang={th.label.lang}>{th.label.text}</span>
                {ist ? <Check aria-hidden className="size-5 shrink-0 text-gruen-700" /> : null}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-18">
          {gefiltertNach} <strong lang={aktuell.label.lang}>{aktuell.label.text}</strong>
        </span>
        <Link
          href="/islamisches-wissen"
          aria-label={`${filterEntfernen}: ${aktuell.label.text}`}
          className="inline-flex min-h-12 items-center gap-1.5 rounded-md border border-rand bg-weiss px-3.5 font-bold text-tinte no-underline hover:bg-gruen-50 hover:text-tinte"
        >
          <X aria-hidden className="size-4" />
          {filterEntfernen}
        </Link>
      </div>
    </section>
  );
}
