import { ArrowRight, LayoutDashboard, UserRound } from 'lucide-react';
import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import NextLink from 'next/link';
import { redirect } from 'next/navigation';
import { AbmeldenKnopf } from '@/components/konto/AbmeldenKnopf';
import { AnmeldeBereich } from '@/components/konto/AnmeldeBereich';
import { KontoEinstieg } from '@/components/konto/KontoEinstieg';
import { ZweiFaktorSchritt } from '@/components/konto/ZweiFaktorSchritt';
import { Meldung } from '@/components/verwaltung/Meldung';
import { pfadFuer } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { sichererRuecksprung } from '@/lib/konto/regeln';
import { hatZugang, verlangeKontenSeite } from '@/lib/konto/zugang';
import { ladeKonto } from '@/lib/rechte/gemeinde';

/** Je Anfrage gerendert, wartet auf die Sitzung (siehe Layout). */
export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  // Konten aus: auch Titel und Inhalt der Seite nicht ausliefern (Layout und Seite rendern parallel)
  await verlangeKontenSeite();
  const t = await getTranslations('konto.meta');
  return { title: t('anmelden') };
}

const HINWEISE = ['abgemeldet', 'bestaetigt', 'eingeladen', 'passwort', 'unbestaetigt'] as const;
type Hinweis = (typeof HINWEISE)[number];

/**
 * Anmeldung (ADR 0026, AUFTRAG 2.1): E-Mail + Passwort oder Kinderzugang, danach ggf. der zweite Faktor
 * (`?schritt=zwei-faktor`). Angemeldete Konten mit Verwaltungsrolle wählen hier zwischen Verwaltung und Mein Bereich;
 * alle anderen gehen direkt nach Mein Bereich. Die Verwaltungsanmeldung bleibt verlinkt („Zugang für Mitarbeitende“).
 */
export default async function AnmeldenSeite({ searchParams }: PageProps<'/[locale]/anmelden'>) {
  await verlangeKontenSeite();
  const sprache = (await getLocale()) as Locale;
  const s = await searchParams;
  const weiter = sichererRuecksprung(s.weiter);
  const hinweis = HINWEISE.find((h) => h === s.hinweis) as Hinweis | undefined;
  const t = await getTranslations('konto');
  const k = await ladeKonto();

  if (k && hatZugang(k) && k.verwaltungsRollen.length === 0) redirect(weiter ?? pfadFuer('/mein-bereich', sprache));

  if (k) {
    const zugang = hatZugang(k);
    return (
      <KontoEinstieg seite="anmelden" sprachZiel="/anmelden" titel={zugang ? t('wahl.titel') : t('wahl.unbestaetigtTitel')}>
        <div className="flex flex-col gap-5">
          <p className="text-pretty text-tinte-2">{zugang ? t('wahl.text', { name: k.anzeigename }) : t('wahl.unbestaetigtText')}</p>
          {zugang ? (
            <ul className="grid gap-3">
              <WahlKachel href="/verwaltung" Icon={LayoutDashboard} titel={t('wahl.verwaltung')} text={t('wahl.verwaltungText')} />
              <WahlKachel
                href={weiter ?? pfadFuer('/mein-bereich', sprache)}
                Icon={UserRound}
                titel={t('wahl.meinBereich')}
                text={t('wahl.meinBereichText')}
              />
            </ul>
          ) : null}
          <div>
            <AbmeldenKnopf sprache={sprache} text={t('wahl.abmelden')} />
          </div>
        </div>
      </KontoEinstieg>
    );
  }

  if (s.schritt === 'zwei-faktor') {
    return (
      <KontoEinstieg seite="anmelden" sprachZiel="/anmelden" titel={t('zweiFaktor.titel')} untertitel={t('zweiFaktor.text')}>
        <ZweiFaktorSchritt weiter={weiter} zurueck={pfadFuer('/anmelden', sprache)} />
      </KontoEinstieg>
    );
  }

  return (
    <KontoEinstieg seite="anmelden" sprachZiel="/anmelden" titel={t('anmelden.titel')} untertitel={t('anmelden.untertitel')}>
      <div className="flex flex-col gap-6">
        {hinweis ? (
          <Meldung art={hinweis === 'unbestaetigt' ? 'info' : hinweis === 'abgemeldet' ? 'info' : 'erfolg'}>
            {t(`hinweis.${hinweis}`)}
          </Meldung>
        ) : null}
        <AnmeldeBereich
          startReiter={s.zugang === 'kind' ? 'kinder' : 'email'}
          weiter={weiter}
          links={{ passwortVergessen: pfadFuer('/passwort-vergessen', sprache) }}
        />
        <div className="flex flex-col gap-1 border-t border-linie pt-5">
          <p className="text-16 text-tinte-2">{t('anmelden.keinKonto')}</p>
          <a href={pfadFuer('/registrieren', sprache)} className="inline-flex min-h-12 items-center self-start font-bold">
            {t('anmelden.registrieren')}
          </a>
        </div>
        <div className="rounded-md bg-sand p-4">
          <p className="text-16 font-bold">{t('anmelden.mitarbeitende')}</p>
          <p className="mt-1 text-16 text-tinte-2">{t('anmelden.mitarbeitendeText')}</p>
          <NextLink href="/verwaltung/anmelden" prefetch={false} className="mt-1 inline-flex min-h-12 items-center gap-2 font-bold">
            {t('anmelden.verwaltung')}
            <ArrowRight aria-hidden className="size-5" />
          </NextLink>
        </div>
      </div>
    </KontoEinstieg>
  );
}

function WahlKachel({ href, Icon, titel, text }: { href: string; Icon: typeof LayoutDashboard; titel: string; text: string }) {
  return (
    <li>
      <NextLink
        href={href}
        prefetch={false}
        className="group flex min-h-20 items-center gap-4 rounded-lg border border-rand bg-weiss p-4 text-tinte no-underline transition duration-(--dauer-rueckmeldung) hover:border-gruen-700 hover:bg-gruen-50 hover:text-tinte active:scale-98 motion-reduce:active:scale-100"
      >
        <span className="flex size-12 shrink-0 items-center justify-center rounded-md bg-gruen-50 text-gruen-700 group-hover:bg-weiss">
          <Icon aria-hidden className="size-6" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-18 font-bold">{titel}</span>
          <span className="text-16 text-tinte-2">{text}</span>
        </span>
        <ArrowRight aria-hidden className="size-5 shrink-0 text-gruen-700" />
      </NextLink>
    </li>
  );
}
