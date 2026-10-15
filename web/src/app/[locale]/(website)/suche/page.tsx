import { ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { HadithTrefferliste } from '@/components/website/hadith/HadithTrefferliste';
import { PageHeader } from '@/components/website/PageHeader';
import { Seitenrahmen } from '@/components/website/Seitenrahmen';
import { SucheFormular } from '@/components/website/suche/SucheFormular';
import { SucheLeer } from '@/components/website/suche/SucheLeer';
import { Trefferliste } from '@/components/website/suche/Trefferliste';
import { Link } from '@/i18n/link';
import type { Locale } from '@/i18n/routing';
import { funktionAn } from '@/lib/funktionen';
import { metadatenFuer } from '@/lib/seo/metadaten';
import { bereinigeSuche, suche, sucheHadith } from '@/server/queries/suche';

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

/** Sekundärer Knopf (wie auf der Startseite): Rand 2 px, Farbe und Druck. Mobil volle Breite, Text mittig. */
const sekundaer =
  'inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md border-2 border-gruen-700 bg-weiss px-4 text-center font-bold text-gruen-800 no-underline transition duration-(--dauer-rueckmeldung) hover:bg-gruen-50 hover:text-gruen-800 druck sm:w-auto sm:px-5.5';

/**
 * Formular, dann Treffer je Bereich oder ein Leerzustand (kein Begriff / keine Treffer). Mit Schalter `hadith_gesamt`
 * kommen der Filter „Hadith“ (Feld `bereich`) und die Gruppe „Hadith“ dazu (AUFTRAG 3.3); „Hadith“ sucht nur dort.
 */
async function Ergebnisse({
  searchParams,
  sprache,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
  sprache: Locale;
}) {
  const [sp, t, ts, th, hadithAn] = await Promise.all([
    searchParams,
    getTranslations('suche'),
    getTranslations('start'),
    getTranslations('hadith.suche'),
    funktionAn('hadith_gesamt'),
  ]);
  const begriff = bereinigeSuche(Array.isArray(sp.q) ? sp.q[0] : sp.q);
  const nurHadith = hadithAn && (Array.isArray(sp.bereich) ? sp.bereich[0] : sp.bereich) === 'hadith';
  const [treffer, hadithTreffer] =
    begriff.length >= 2 ? await Promise.all([nurHadith ? [] : suche(begriff, sprache), hadithAn ? sucheHadith(begriff) : []]) : [[], []];
  const anzahl = treffer.length + hadithTreffer.length;
  return (
    <>
      <SucheFormular
        begriff={begriff}
        filter={
          hadithAn
            ? {
                legende: th('filter'),
                aktiv: nurHadith ? 'hadith' : 'alle',
                optionen: [
                  { wert: 'alle', label: th('alle') },
                  { wert: 'hadith', label: th('hadith') },
                ],
                hinweis: th('hinweis'),
              }
            : undefined
        }
      />
      {begriff.length < 2 ? (
        <SucheLeer text={t('leer')} />
      ) : anzahl ? (
        <section aria-labelledby="suche-ergebnisse" className="flex flex-col gap-10">
          <h2 id="suche-ergebnisse" aria-live="polite" className="text-display-2 text-balance">
            {t('ergebnisse', { anzahl, begriff })}
          </h2>
          {treffer.length ? <Trefferliste treffer={treffer} /> : null}
          {hadithTreffer.length ? <HadithTrefferliste treffer={hadithTreffer} /> : null}
        </section>
      ) : (
        <SucheLeer
          status
          text={t('keine', { begriff })}
          kinder={
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-center">
              <Link href="/veranstaltungen" className={sekundaer}>
                <span className="text-balance">{ts('alleVeranstaltungen')}</span>
                <ArrowRight aria-hidden="true" className="size-5 shrink-0" />
              </Link>
              <Link href="/nachrichten" className={sekundaer}>
                <span className="text-balance">{ts('alleNeuigkeiten')}</span>
                <ArrowRight aria-hidden="true" className="size-5 shrink-0" />
              </Link>
            </div>
          }
        />
      )}
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
      <div className="mx-auto flex max-w-(--container-inhalt) flex-col gap-10 px-4 py-abschnitt-klein md:px-8">
        <Ergebnisse searchParams={searchParams} sprache={sprache} />
      </div>
    </Seitenrahmen>
  );
}
