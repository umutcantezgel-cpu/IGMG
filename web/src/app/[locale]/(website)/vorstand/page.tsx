import { ArrowRight, Heart } from 'lucide-react';
import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { Stern8 } from '@/components/website/Icons';
import { PageHeader } from '@/components/website/PageHeader';
import { PersonCard } from '@/components/website/PersonCard';
import { Seitenrahmen } from '@/components/website/Seitenrahmen';
import { Link } from '@/i18n/link';
import type { Locale } from '@/i18n/routing';
import { metadatenFuer } from '@/lib/seo/metadaten';
import { ladeSeiteninhalt } from '@/server/queries/seiteninhalte';

export const ensureStatic = 'navigation';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('vorstand');
  return metadatenFuer({ pfad: '/vorstand', titel: t('titel'), beschreibung: t('untertitel') });
}

/** Zeitraum wie im Design: „1975–1979“; die laufende Amtszeit endet mit „Heute“ („2025 – Heute“). */
function zeitraum(v: { von: string; bis: string; aktuell: boolean }, heute: string): string {
  if (v.bis) return `${v.von}–${v.bis}`;
  return v.aktuell ? `${v.von} – ${heute}` : v.von;
}

/**
 * Vorstand (design/BoardMembers.dc.html, Blatt S09): zuerst der aktuelle Vorstand, dann die Vorsitzenden als
 * Kartenraster, danach Dank mit Link zur Kontaktseite. Personen und Jahre kommen aus dem Seiteninhalt (G-04).
 */
export default async function VorstandSeite() {
  const sprache = (await getLocale()) as Locale;
  const t = await getTranslations('vorstand');
  const tp = await getTranslations('kopf');
  const inhalt = await ladeSeiteninhalt('vorstand');
  return (
    <Seitenrahmen bereich="moschee" seite="vorstand" sprachZiel="/vorstand" pfad={[{ label: tp('vorstand') }]}>
      <PageHeader kennung={t('kennung')} titel={t('titel')} untertitel={t('untertitel')} />
      <div className="mx-auto flex max-w-(--container-inhalt) flex-col gap-12 px-4 pt-8 pb-12 md:gap-20 md:px-8 md:pt-16 md:pb-24">
        <section aria-labelledby="vorstand-aktuell" className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 id="vorstand-aktuell" className="text-30 md:text-36">
              {t('aktuellTitel')}
            </h2>
            <p className="max-w-[62ch] text-20 text-tinte-2">{t('aktuellText')}</p>
          </div>
          {inhalt.vorstand.length > 0 ? (
            <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,340px),1fr))] gap-6">
              {inhalt.vorstand.map((m, i) => (
                <li key={i}>
                  <PersonCard
                    variante="board"
                    sprache={sprache}
                    person={{
                      name: m.name,
                      funktion: m.funktion,
                      seit: m.seit || undefined,
                      liste: m.aufgaben,
                      email: m.email || undefined,
                      telefon: m.telefon,
                    }}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p>{t('leer')}</p>
          )}
        </section>

        <section aria-labelledby="vorstand-vorsitz" className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <span className="inline-flex items-center gap-2 text-16 font-bold text-gruen-800">
              <Stern8 />
              {t('fuehrungSeit', { jahr: inhalt.fuehrungSeit })}
            </span>
            <h2 id="vorstand-vorsitz" className="text-30 md:text-36">
              {t('vorsitzTitel')}
            </h2>
            <p className="text-20 text-tinte-2">{t('vorsitzUntertitel')}</p>
          </div>
          {inhalt.vorsitzende.length > 0 ? (
            <ol className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] items-start gap-4">
              {inhalt.vorsitzende.map((v, i) => (
                <li key={i}>
                  <PersonCard
                    variante="leader"
                    sprache={sprache}
                    person={{
                      name: v.name,
                      rolle: v.aktuell ? t('rolleAktuell') : t('rolleEhemalig'),
                      zeitraum: zeitraum(v, t('heute')),
                      aktuell: v.aktuell,
                      liste: v.erfolge,
                    }}
                  />
                </li>
              ))}
            </ol>
          ) : (
            <p>{t('leer')}</p>
          )}
        </section>

        <section aria-labelledby="vorstand-dank" className="flex flex-col gap-3 rounded-lg bg-gruen-50 p-6 md:p-12">
          <h2 id="vorstand-dank" className="flex items-center gap-3 text-30 md:text-36">
            <Heart aria-hidden className="size-7 shrink-0 text-gruen-800" />
            {t('dankTitel')}
          </h2>
          <p className="max-w-(--container-text) text-18 text-pretty">{t('dankText')}</p>
          <Link
            href="/kontakt"
            aria-label={`${t('dankLink')}: ${t('dankTitel')}`}
            className="inline-flex min-h-12 items-center gap-2 self-start font-bold text-gruen-800 underline underline-offset-4"
          >
            {t('dankLink')}
            <ArrowRight aria-hidden className="size-5" />
          </Link>
        </section>
      </div>
    </Seitenrahmen>
  );
}
