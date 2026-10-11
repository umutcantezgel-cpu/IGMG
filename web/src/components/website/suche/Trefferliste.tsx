import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/link';
import { cn } from '@/lib/utils';
import { MARKE_AN, MARKE_AUS, type SuchArt, type SuchTreffer } from '@/server/queries/suche';

/** Reihenfolge der Bereiche in der Trefferliste (wie die Auswahl in der Suche). */
const BEREICHE: SuchArt[] = ['nachricht', 'veranstaltung', 'wissen'];

/** Tönung je Bereich (wie NewsCard und EventCard), an der Zahl-Pille der Gruppe – nur Token-Klassen. */
const TOENUNG: Record<SuchArt, string> = {
  nachricht: 'bg-tag-neuigkeiten-bg text-tag-neuigkeiten',
  veranstaltung: 'bg-tag-veranstaltung-bg text-tag-veranstaltung',
  wissen: 'bg-tag-bildung-bg text-tag-bildung',
};

const ZIEL = {
  nachricht: (slug: string) => ({ pathname: '/nachrichten/[slug]' as const, params: { slug } }),
  veranstaltung: (slug: string) => ({ pathname: '/veranstaltungen/[slug]' as const, params: { slug } }),
  wissen: (slug: string) => ({ pathname: '/islamisches-wissen/[thema]' as const, params: { thema: slug } }),
};

/** Ausschnitt mit Trefferwörtern: Marken aus ts_headline → <mark>, sonst reiner Text (kein HTML aus der Datenbank). */
function Ausschnitt({ text }: { text: string }) {
  const teile = text.split(new RegExp(`(${MARKE_AN}[^${MARKE_AUS}]*${MARKE_AUS})`));
  return (
    <p className="text-pretty text-tinte-2">
      {teile.map((teil, i) =>
        teil.startsWith(MARKE_AN) ? (
          <mark key={i} className="rounded-sm bg-warnung-toenung px-0.5 text-tinte">
            {teil.slice(1, -1)}
          </mark>
        ) : (
          teil
        ),
      )}
    </p>
  );
}

/**
 * Treffer gruppiert nach Bereichen: je Gruppe Überschrift mit Zahl, Einträge als Karten im Kartenraster.
 * Die ganze Karte ist klickbar (Titel-Link mit ::after, REFERENZ §2). Datum gibt die Abfrage nicht her – entfällt.
 */
export async function Trefferliste({ treffer }: { treffer: SuchTreffer[] }) {
  const t = await getTranslations('suche');
  const gruppen = BEREICHE.map((art) => ({ art, eintraege: treffer.filter((z) => z.art === art) })).filter((g) => g.eintraege.length > 0);
  return (
    <div className="flex flex-col gap-10">
      {gruppen.map(({ art, eintraege }) => (
        <section key={art} aria-labelledby={`suche-gruppe-${art}`} className="flex flex-col gap-5">
          <h3 id={`suche-gruppe-${art}`} className="flex flex-wrap items-center gap-3 text-24 leading-tight font-bold">
            <span>{t(`art.${art}`)}</span>
            <span aria-hidden="true" className={cn('inline-flex rounded-pill px-3 text-16 leading-normal font-bold', TOENUNG[art])}>
              {eintraege.length}
            </span>
            <span className="sr-only">{t('gruppe', { anzahl: eintraege.length })}</span>
          </h3>
          <ol className="grid raster-karten gap-6">
            {eintraege.map((z) => (
              <li key={`${z.art}-${z.slug}`}>
                <article className="relative flex h-full flex-col gap-3 rounded-lg border border-linie bg-weiss p-6 text-18 leading-relaxed shadow-s1 transition duration-(--dauer-rueckmeldung) hover:border-gruen-700 hover:shadow-s2">
                  <h4 className="text-20 leading-snug font-bold text-balance">
                    <Link
                      href={ZIEL[z.art](z.slug)}
                      className="text-tinte no-underline after:absolute after:inset-0 after:rounded-lg hover:text-gruen-800 hover:underline"
                    >
                      {z.titel}
                    </Link>
                  </h4>
                  {z.ausschnitt ? <Ausschnitt text={z.ausschnitt} /> : null}
                </article>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
