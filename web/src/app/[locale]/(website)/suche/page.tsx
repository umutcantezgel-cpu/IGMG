import { Search } from 'lucide-react';
import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/website/PageHeader';
import { Seitenrahmen } from '@/components/website/Seitenrahmen';
import { Link } from '@/i18n/link';
import type { Locale } from '@/i18n/routing';
import { metadatenFuer } from '@/lib/seo/metadaten';
import { bereinigeSuche, MARKE_AN, MARKE_AUS, suche, type SuchTreffer } from '@/server/queries/suche';

// Die Suche rendert je Anfrage und blockierend, ohne Suspense: Gestreamte Treffer setzt React erst per Skript an ihren
// Platz – ohne JavaScript bliebe der Platzhalter stehen. Das GET-Formular lädt die Seite ohnehin neu; die Treffer selbst
// sind je Begriff gecacht (`suche`). `instant = false` nimmt die Seite aus der Prüfung auf eine statische Hülle aus.
export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('suche');
  // Trefferseiten nicht indexieren (doppelte Inhalte), Links aber folgen
  return {
    ...(await metadatenFuer({ pfad: '/suche', titel: t('titel'), beschreibung: t('untertitel') })),
    robots: { index: false, follow: true },
  };
}

const ZIEL = {
  nachricht: (slug: string) => ({ pathname: '/nachrichten/[slug]' as const, params: { slug } }),
  veranstaltung: (slug: string) => ({ pathname: '/veranstaltungen/[slug]' as const, params: { slug } }),
  wissen: (slug: string) => ({ pathname: '/islamisches-wissen/[thema]' as const, params: { thema: slug } }),
};

/** Ausschnitt mit Trefferwörtern: Marken aus ts_headline → <mark>, sonst reiner Text (kein HTML aus der Datenbank). */
function Ausschnitt({ text }: { text: string }) {
  const teile = text.split(new RegExp(`(${MARKE_AN}[^${MARKE_AUS}]*${MARKE_AUS})`));
  return (
    <p className="text-tinte-2">
      {teile.map((t, i) =>
        t.startsWith(MARKE_AN) ? (
          <mark key={i} className="rounded-sm bg-warnung-toenung px-0.5 text-tinte">
            {t.slice(1, -1)}
          </mark>
        ) : (
          t
        ),
      )}
    </p>
  );
}

async function SuchFormular({ begriff }: { begriff: string }) {
  const t = await getTranslations('suche');
  return (
    <form method="get" role="search" className="flex flex-col gap-2">
      <label htmlFor="suche-feld" className="font-bold">
        {t('feld')}
      </label>
      <p id="suche-hinweis" className="text-16 text-tinte-2">
        {t('hinweis')}
      </p>
      <div className="flex flex-wrap gap-3">
        <input
          id="suche-feld"
          type="search"
          name="q"
          defaultValue={begriff}
          minLength={2}
          maxLength={100}
          aria-describedby="suche-hinweis"
          className="min-h-12 min-w-0 flex-1 rounded-md border border-rand bg-weiss px-3.5 text-18"
        />
        <button
          type="submit"
          className="inline-flex min-h-12 items-center gap-2 rounded-md bg-gruen-700 px-6 text-18 font-bold text-weiss hover:bg-gruen-800"
        >
          <Search aria-hidden className="size-5" />
          {t('absenden')}
        </button>
      </div>
    </form>
  );
}

async function Ergebnisse({
  searchParams,
  sprache,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
  sprache: Locale;
}) {
  const [sp, t] = await Promise.all([searchParams, getTranslations('suche')]);
  const begriff = bereinigeSuche(Array.isArray(sp.q) ? sp.q[0] : sp.q);
  const treffer: SuchTreffer[] = begriff.length >= 2 ? await suche(begriff, sprache) : [];
  return (
    <>
      <SuchFormular begriff={begriff} />
      <section aria-labelledby="suche-ergebnisse" className="flex flex-col gap-4">
        <h2 id="suche-ergebnisse" className="text-24" aria-live="polite">
          {begriff.length < 2 ? t('leer') : treffer.length ? t('ergebnisse', { anzahl: treffer.length, begriff }) : t('keine', { begriff })}
        </h2>
        {treffer.length ? (
          <ol className="flex flex-col gap-4">
            {treffer.map((z) => (
              <li key={`${z.art}-${z.slug}`} className="flex flex-col gap-1 rounded-lg border border-linie bg-weiss p-5">
                <span className="text-16 font-bold text-gruen-700">{t(`art.${z.art}`)}</span>
                <Link href={ZIEL[z.art](z.slug)} className="text-20 font-bold text-tinte underline underline-offset-4">
                  {z.titel}
                </Link>
                {z.ausschnitt ? <Ausschnitt text={z.ausschnitt} /> : null}
              </li>
            ))}
          </ol>
        ) : null}
      </section>
    </>
  );
}

/** Suche (ADR 0013, D-S1): je Anfrage gerendert, ohne JavaScript nutzbar (GET-Formular, Treffer im HTML). */
export default async function SucheSeite({ searchParams }: PageProps<'/[locale]/suche'>) {
  const sprache = (await getLocale()) as Locale;
  const t = await getTranslations('suche');
  return (
    <Seitenrahmen bereich="keiner" seite="suche" sprachZiel="/suche" pfad={[{ label: t('titel') }]}>
      <PageHeader titel={t('titel')} untertitel={t('untertitel')} />
      <div className="mx-auto flex w-full max-w-(--container-text) flex-col gap-6 px-4 pt-8 pb-12 md:px-8 md:pt-12 md:pb-24">
        <Ergebnisse searchParams={searchParams} sprache={sprache} />
      </div>
    </Seitenrahmen>
  );
}
