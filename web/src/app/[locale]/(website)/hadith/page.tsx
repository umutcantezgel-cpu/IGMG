import { ArrowRight, BookOpen, Library } from 'lucide-react';
import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
import { QuellenZeile } from '@/components/website/hadith/QuellenZeile';
import { PageHeader } from '@/components/website/PageHeader';
import { Seitenrahmen } from '@/components/website/Seitenrahmen';
import { Link } from '@/i18n/link';
import type { Ziel } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { funktionAn } from '@/lib/funktionen';
import { hadithSicht } from '@/lib/hadith/anzeige';
import { text } from '@/lib/i18n/inhalt';
import { metadatenFuer } from '@/lib/seo/metadaten';
import { ladeHadithUebersicht } from '@/server/queries/hadith';

export const ensureStatic = 'navigation';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('hadith');
  return metadatenFuer({ pfad: '/hadith', titel: t('titel'), beschreibung: t('untertitel') });
}

const SPRACHEN = ['de', 'tr', 'en'] as const;

/** Wegkarte: als Link, wenn es ein Ziel gibt, sonst als ruhige Fläche mit gestricheltem Rand (noch nicht freigeschaltet). */
function Weg({
  ziel,
  Icon,
  titel,
  text: inhalt,
  stand,
}: {
  ziel: Ziel | null;
  Icon: typeof BookOpen;
  titel: string;
  text: string;
  stand: string;
}) {
  const kern: ReactNode = (
    <>
      <Icon aria-hidden className="size-7 shrink-0 text-gruen-700" />
      <span className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className="font-display text-24 leading-tight text-tinte">{titel}</span>
        <span className="text-tinte-2">{inhalt}</span>
        <span className="text-16 font-bold text-gruen-800">{stand}</span>
      </span>
    </>
  );
  if (!ziel) return <div className="flex h-full items-start gap-4 rounded-lg border border-dashed border-rand bg-weiss p-6">{kern}</div>;
  return (
    <Link
      href={ziel}
      className="group flex h-full druck items-start gap-4 rounded-lg border border-linie bg-weiss p-6 no-underline shadow-s1 transition duration-(--dauer-rueckmeldung) hover:border-gruen-700 hover:shadow-s2"
    >
      {kern}
      <ArrowRight
        aria-hidden
        className="mt-1 size-5 shrink-0 text-gruen-700 transition duration-(--dauer-rueckmeldung) motion-safe:group-hover:translate-x-1"
      />
    </Link>
  );
}

/**
 * Hadith-Einstieg (AUFTRAG 3.3): sachliche Angaben zur Sammlung aus dem Import (Bücher, Anzahl, Zählung der Quelle),
 * die Einführung als Platzhalter für den Imam (keine religiösen Aussagen von der Website), die Wege zur Auswahl und –
 * nur mit Schalter `hadith_gesamt` – zu allen Büchern, der Stand der geprüften Übersetzungen und die Quellenzeile.
 * Statisch; der Schalter wird beim Rendern gelesen (Umgebung, sonst Einstellung).
 */
export default async function HadithSeite() {
  const sprache = (await getLocale()) as Locale;
  const [t, u, schalter] = await Promise.all([getTranslations('hadith'), ladeHadithUebersicht(), funktionAn('hadith_gesamt')]);
  const sicht = hadithSicht(schalter, u.buecher.length);
  const zahl = (n: number) => new Intl.NumberFormat(sprache).format(n);
  const name = text(u.sammlung?.name, sprache) || t('bukhari.titel');
  const sammlungText = !u.sammlung
    ? t('sammlung.textLeer')
    : t(sicht.gesamt ? 'sammlung.textAn' : 'sammlung.textAus', { buecher: zahl(u.buecher.length), hadithe: zahl(u.gesamt) });

  return (
    <Seitenrahmen bereich="islam" seite="hadith" sprachZiel="/hadith" pfad={[{ label: t('breadcrumb') }]}>
      <PageHeader kennung={t('kennung')} titel={t('titel')} untertitel={t('untertitel')} />
      <div className="mx-auto flex max-w-(--container-inhalt) flex-col gap-abschnitt-klein px-4 py-abschnitt-klein md:px-8">
        <section aria-labelledby="hadith-sammlung" className="grid items-start gap-8 lg:grid-cols-3 lg:gap-12">
          <div className="flex min-w-0 flex-col gap-5 lg:col-span-2">
            <h2 id="hadith-sammlung" className="text-display-2">
              {t('sammlung.titel')}
            </h2>
            <p className="max-w-text text-20 leading-einleitung text-pretty">{sammlungText}</p>
            <p className="max-w-text self-start rounded-md border border-dashed border-rand bg-weiss px-4 py-3 text-tinte-2">
              {t('sammlung.einfuehrung')}
            </p>
            {u.sammlung ? (
              <div className="flex max-w-text flex-col gap-2">
                <h3 className="font-text text-20 font-bold tracking-normal">{t('sammlung.bezugTitel')}</h3>
                <p className="text-pretty text-tinte-2">
                  {t('sammlung.bezugText', { beispiel: `${name} 1 · ${t('buch.stelle', { buch: 1, hadith: 1 })}` })}
                </p>
              </div>
            ) : null}
          </div>
          {u.sammlung ? (
            <aside aria-labelledby="hadith-fakten" className="flex flex-col gap-4 rounded-lg border border-linie bg-weiss p-6 shadow-s1">
              <h2 id="hadith-fakten" className="font-text text-20 font-bold tracking-normal">
                {t('sammlung.fakten')}
              </h2>
              <dl className="grid grid-cols-2 gap-3">
                <div className="flex flex-col rounded-md bg-sand p-4">
                  <dt className="text-16 text-tinte-2">{t('sammlung.buecher')}</dt>
                  <dd className="text-30 font-bold tabular-nums">{zahl(u.buecher.length)}</dd>
                </div>
                <div className="flex flex-col rounded-md bg-sand p-4">
                  <dt className="text-16 text-tinte-2">{t('sammlung.hadithe')}</dt>
                  <dd className="text-30 font-bold tabular-nums">{zahl(u.gesamt)}</dd>
                </div>
                <div className="col-span-2 flex flex-col rounded-md bg-sand p-4">
                  <dt className="text-16 text-tinte-2">{t('sammlung.text')}</dt>
                  <dd className="font-bold">{t('sammlung.textWert')}</dd>
                </div>
              </dl>
            </aside>
          ) : null}
        </section>

        <section aria-labelledby="hadith-wege" className="flex flex-col gap-6">
          <h2 id="hadith-wege" className="text-display-2">
            {t('wege.titel')}
          </h2>
          <div className="grid gap-4 md:grid-cols-2 md:gap-6">
            <Weg
              ziel="/hadith/auswahl"
              Icon={BookOpen}
              titel={t('wege.auswahlTitel')}
              text={t('wege.auswahlText')}
              stand={t('wege.auswahlAnzahl', { anzahl: u.auswahlAnzahl })}
            />
            {u.sammlung ? (
              <Weg
                ziel={sicht.buecherVerlinken ? '/hadith/bukhari' : null}
                Icon={Library}
                titel={`${t('wege.alleTitel')}: ${name}`}
                text={t('wege.alleText')}
                stand={sicht.buecherVerlinken ? t('wege.alleAnzahl', { anzahl: zahl(u.buecher.length) }) : t('wege.alleAus')}
              />
            ) : null}
          </div>
        </section>

        {u.sammlung ? (
          <section aria-labelledby="hadith-stand" className="flex flex-col gap-5">
            <h2 id="hadith-stand" className="text-display-2">
              {t('stand.titel')}
            </h2>
            <p className="max-w-text text-pretty text-tinte-2">{t('stand.text')}</p>
            <ul className="grid gap-3 md:grid-cols-3">
              {SPRACHEN.map((s) => {
                const anteil = u.gesamt ? Math.round((u.geprueft[s] / u.gesamt) * 100) : 0;
                return (
                  <li key={s} className="flex flex-col gap-2 rounded-lg border border-linie bg-weiss p-5">
                    <span className="font-bold">{t(`stand.sprache.${s}`)}</span>
                    <span className="text-16 text-tinte-2 tabular-nums">
                      {t('stand.zeile', { geprueft: zahl(u.geprueft[s]), gesamt: zahl(u.gesamt) })}
                    </span>
                    <span aria-hidden className="block h-2 overflow-hidden rounded-pill border border-rand bg-sand">
                      <span className="block h-full bg-gruen-700" style={{ width: `${anteil}%` }} />
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        {u.sammlung ? <QuellenZeile /> : null}
      </div>
    </Seitenrahmen>
  );
}
