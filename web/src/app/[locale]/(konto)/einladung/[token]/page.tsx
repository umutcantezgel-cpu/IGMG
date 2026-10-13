import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { AbmeldenKnopf } from '@/components/konto/AbmeldenKnopf';
import { EinladungFormular, EinladungUebernehmen, KnopfLink } from '@/components/konto/EinstiegFormulare';
import { KontoEinstieg } from '@/components/konto/KontoEinstieg';
import { Meldung } from '@/components/verwaltung/Meldung';
import { pfadFuer } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { kontoZurAdresse } from '@/lib/konto/einladung';
import { ladeKonto } from '@/lib/rechte/gemeinde';
import { ladeGueltigeEinladung } from '@/server/queries/einladung';
import { verlangeKontenSeite } from '@/lib/konto/zugang';

/** Je Anfrage gerendert, wartet auf die Sitzung (siehe Layout). */
export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  // Konten aus: auch Titel und Inhalt der Seite nicht ausliefern (Layout und Seite rendern parallel)
  await verlangeKontenSeite();
  const t = await getTranslations('konto.meta');
  return { title: t('einladung') };
}

const DATUM: Record<Locale, string> = { de: 'de-DE', tr: 'tr-TR', en: 'en-GB' };

/**
 * Einladung annehmen (ADR 0026): Eltern, Lehrkräfte und Schüler ≥ 16. Neue Adresse → Passwort festlegen; vorhandenes
 * Konto derselben Adresse → anmelden und Rollen übernehmen. Der Link selbst ist der Nachweis der Adresse.
 */
export default async function EinladungSeite({ params }: PageProps<'/[locale]/einladung/[token]'>) {
  await verlangeKontenSeite();
  const { token } = await params;
  const sprache = (await getLocale()) as Locale;
  const t = await getTranslations('konto');
  const sprachZiel = { pathname: '/einladung/[token]' as const, params: { token } };
  const einladung = await ladeGueltigeEinladung(token);
  if (!einladung) {
    return (
      <KontoEinstieg seite="einladung" sprachZiel={sprachZiel} titel={t('einladung.titel')}>
        <div className="flex flex-col gap-5">
          <Meldung art="fehler">{t('einladung.ungueltig')}</Meldung>
          <a href={pfadFuer('/anmelden', sprache)} className="inline-flex min-h-12 items-center self-start font-bold">
            {t('einladung.zurAnmeldung')}
          </a>
        </div>
      </KontoEinstieg>
    );
  }
  const rollen = [
    ...einladung.gemeindeRollen.map((r) => t(`einladung.rollen.${r}`)),
    ...(einladung.rollen.length ? [t('einladung.rollen.verwaltung')] : []),
  ];
  const gueltigBis = new Intl.DateTimeFormat(DATUM[sprache], { dateStyle: 'long', timeZone: 'Europe/Berlin' }).format(einladung.laeuftAb);
  const k = await ladeKonto();
  const gleich = k && k.email.toLowerCase() === einladung.email.toLowerCase();
  const vorhanden = !k && (await kontoZurAdresse(einladung.email));
  const hierher = pfadFuer(sprachZiel, sprache);

  return (
    <KontoEinstieg seite="einladung" sprachZiel={sprachZiel} titel={t('einladung.willkommen', { name: einladung.name })}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <p className="text-pretty">{t('einladung.text')}</p>
          <ul className="flex flex-wrap gap-2" aria-label={t('einladung.rollenLabel')}>
            {rollen.map((r) => (
              <li key={r} className="rounded-pill bg-gruen-50 px-3 py-1 text-16 font-bold text-gruen-800">
                {r}
              </li>
            ))}
          </ul>
          <p className="text-16 text-tinte-2">{t('einladung.gueltigBis', { datum: gueltigBis })}</p>
          {einladung.gemeindeRollen.includes('lehrkraft') || einladung.rollen.length ? (
            <p className="rounded-md bg-info-toenung px-4 py-3 text-16 text-pretty text-info">{t('einladung.faktorHinweis')}</p>
          ) : null}
        </div>
        {gleich ? (
          <>
            <p className="text-pretty">{t('einladung.uebernehmenText')}</p>
            <EinladungUebernehmen token={token} />
          </>
        ) : k ? (
          <>
            <Meldung art="info">{t('einladung.andereAdresse')}</Meldung>
            <AbmeldenKnopf sprache={sprache} text={t('wahl.abmelden')} />
          </>
        ) : vorhanden ? (
          <>
            <Meldung art="info">{t('einladung.vorhanden')}</Meldung>
            <KnopfLink
              href={pfadFuer({ pathname: '/anmelden', query: { weiter: hierher } }, sprache)}
              text={t('einladung.anmeldenUndAnnehmen')}
            />
          </>
        ) : (
          <EinladungFormular token={token} datenschutz={pfadFuer('/datenschutz', sprache)} />
        )}
      </div>
    </KontoEinstieg>
  );
}
