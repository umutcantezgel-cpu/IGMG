import { Bell, BookMarked, ExternalLink, House, type LucideIcon, Presentation, Route, UserCog, Users, UsersRound } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import NextLink from 'next/link';
import type { ReactNode } from 'react';
import { AbmeldenKnopf } from '@/components/konto/AbmeldenKnopf';
import { PageHeader } from '@/components/website/PageHeader';
import { KontoHuelle, kopfName } from '@/components/konto/KontoHuelle';
import type { PfadEintrag } from '@/components/website/Breadcrumbs';
import { pfadFuer, type Ziel } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { funktionAn } from '@/lib/funktionen';
import { kindDarfPush } from '@/lib/push/abo';
import { ladeGruppenKontext, type Konto } from '@/lib/rechte/gemeinde';
import { bereicheFuer, type BereichFunktion, type BereichLage, type BereichSchluessel } from './eintraege';

export const BEREICH_ICON: Record<BereichSchluessel, LucideIcon> = {
  start: House,
  kinder: Users,
  unterricht: Presentation,
  lernweg: Route,
  gruppe: UsersRound,
  lesezeichen: BookMarked,
  benachrichtigungen: Bell,
  konto: UserCog,
};

/**
 * Lage für die Navigation: ausgeschaltete Funktionen (ADR 0035), Push-Freigabe eines Kinderkontos (ADR 0034) und die
 * eigene Gruppe eines Schülers (Ziel „Meine Gruppe“). Der Gruppenkontext ist je Anfrage zwischengespeichert.
 */
async function bereichLage(konto: Konto): Promise<BereichLage> {
  const funktionen: BereichFunktion[] = ['lernplattform', 'push'];
  const an = await Promise.all(funktionen.map((f) => funktionAn(f)));
  const aus = funktionen.filter((_, i) => !an[i]);
  const [kindPush, kontext] = await Promise.all([
    konto.istKind ? kindDarfPush(konto.benutzerId) : Promise.resolve(false),
    konto.gemeindeRollen.includes('schueler') && !aus.includes('lernplattform') ? ladeGruppenKontext(konto.benutzerId) : null,
  ]);
  const eigene = kontext ? [...kontext.eigeneGruppen][0] : undefined;
  return {
    aus,
    kindPush,
    gruppe: kontext ? (eigene ? { pathname: '/mein-bereich/gruppen/[id]', params: { id: eigene } } : null) : undefined,
  };
}

/**
 * Hülle von „Mein Bereich“ (ADR 0026): Kopf und Fuß der Website, Seitenkopf mit Kennung, darunter die Navigation je
 * Kontoart (ab 1024 px als Seitenleiste mit Kontokarte, darunter als waagerechte Reihe) und der Inhalt. Noch nicht
 * gebaute Bereiche stehen in der Seitenleiste als „bald verfügbar“ (ohne Link).
 */
export async function MeinBereichRahmen({
  konto,
  aktuell,
  titel,
  untertitel,
  sprachZiel,
  zwischen = [],
  children,
}: {
  konto: Konto;
  aktuell: BereichSchluessel;
  titel: string;
  untertitel?: string;
  sprachZiel: Ziel;
  /** Brotkrumen zwischen „Mein Bereich“ und dieser Seite (tiefere Seiten, z. B. Unterricht › Gruppe). */
  zwischen?: PfadEintrag[];
  children: ReactNode;
}) {
  const sprache = (await getLocale()) as Locale;
  const [t, lage] = await Promise.all([getTranslations('meinBereich'), bereichLage(konto)]);
  const eintraege = bereicheFuer(konto.gemeindeRollen, konto.istKind, lage);
  const pfad: PfadEintrag[] =
    aktuell === 'start' && !zwischen.length
      ? [{ label: t('kennung') }]
      : [{ label: t('kennung'), ziel: '/mein-bereich' }, ...zwischen, { label: titel }];
  const kontoarten = [
    ...konto.gemeindeRollen.map((r) => t(`kontoart.${r}`)),
    ...(konto.verwaltungsRollen.length ? [t('kontoart.verwaltung')] : []),
  ];
  const initial = kopfName(konto.anzeigename, sprache).initiale;

  return (
    <KontoHuelle seite="mein-bereich" sprachZiel={sprachZiel} pfad={pfad} konto={konto}>
      <PageHeader kennung={t('kennung')} titel={titel} untertitel={untertitel} />
      <div className="mx-auto grid max-w-(--container-inhalt) gap-8 px-4 pt-6 pb-abschnitt md:px-8 md:pt-10 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-12 print:block">
        <aside className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-6 lg:self-start print:hidden">
          <div className="hidden items-center gap-3 rounded-lg border border-linie bg-weiss p-4 lg:flex">
            <span
              aria-hidden
              className="flex size-12 shrink-0 items-center justify-center rounded-pill bg-gruen-700 font-display text-24 text-weiss"
            >
              {initial}
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="truncate font-bold">{konto.anzeigename}</span>
              <span className="text-16 text-tinte-2">{kontoarten.join(' · ')}</span>
            </span>
          </div>
          <nav aria-label={t('nav.label')} className="relative -mx-4 overflow-x-auto px-4 lg:mx-0 lg:overflow-visible lg:px-0">
            <ul className="flex gap-2 pb-1 lg:flex-col lg:gap-1 lg:pb-0">
              {eintraege.map((e) => {
                const Icon = BEREICH_ICON[e.schluessel];
                const hier = e.schluessel === aktuell;
                if (!e.gebaut || !e.ziel) {
                  return (
                    <li key={e.schluessel} className="max-lg:hidden">
                      <span className="flex min-h-12 items-center gap-3 rounded-md px-3 text-18 text-tinte-3">
                        <Icon aria-hidden className="size-5 shrink-0" />
                        <span className="flex-1">{t(`nav.${e.schluessel}`)}</span>
                        <span className="rounded-pill bg-sand px-2 py-0.5 text-16 text-tinte-2">{t('nav.bald')}</span>
                      </span>
                    </li>
                  );
                }
                return (
                  <li key={e.schluessel} className="shrink-0">
                    <NextLink
                      href={pfadFuer(e.ziel, sprache)}
                      prefetch={false}
                      aria-current={hier ? 'page' : undefined}
                      className={`flex min-h-12 items-center gap-3 rounded-md px-3 text-18 font-bold whitespace-nowrap no-underline transition duration-(--dauer-rueckmeldung) max-lg:border ${hier ? 'bg-gruen-50 text-gruen-800 max-lg:border-gruen-700' : 'text-tinte hover:bg-sand hover:text-tinte max-lg:border-rand max-lg:bg-weiss'}`}
                    >
                      <Icon aria-hidden className="size-5 shrink-0" />
                      {t(`nav.${e.schluessel}`)}
                    </NextLink>
                  </li>
                );
              })}
              {konto.verwaltungsRollen.length ? (
                <li className="shrink-0 lg:mt-2 lg:border-t lg:border-linie lg:pt-2">
                  <NextLink
                    href="/verwaltung"
                    prefetch={false}
                    className="flex min-h-12 items-center gap-3 rounded-md px-3 text-18 font-bold whitespace-nowrap text-tinte no-underline transition duration-(--dauer-rueckmeldung) hover:bg-sand hover:text-tinte max-lg:border max-lg:border-rand max-lg:bg-weiss"
                  >
                    <ExternalLink aria-hidden className="size-5 shrink-0" />
                    {t('nav.verwaltung')}
                  </NextLink>
                </li>
              ) : null}
            </ul>
          </nav>
          <div className="hidden border-t border-linie pt-2 lg:block">
            <AbmeldenKnopf sprache={sprache} text={t('nav.abmelden')} variante="zeile" />
          </div>
        </aside>
        <div className="flex min-w-0 flex-col gap-8">
          {children}
          <div className="border-t border-linie pt-6 lg:hidden print:hidden">
            <AbmeldenKnopf sprache={sprache} text={t('nav.abmelden')} />
          </div>
        </div>
      </div>
    </KontoHuelle>
  );
}
