import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { KontoEinstieg } from '@/components/konto/KontoEinstieg';
import { RegistrierFormular } from '@/components/konto/RegistrierFormular';
import { pfadFuer } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { ladeKonto } from '@/lib/rechte/gemeinde';

/** Je Anfrage gerendert, wartet auf die Sitzung (siehe Layout). */
export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('konto.meta');
  return { title: t('registrieren') };
}

/** Registrierung für Gemeindemitglieder (ADR 0026). Eltern, Lehrkräfte und Schüler kommen per Einladung. */
export default async function RegistrierenSeite() {
  const sprache = (await getLocale()) as Locale;
  if (await ladeKonto()) redirect(pfadFuer('/anmelden', sprache));
  const t = await getTranslations('konto');
  return (
    <KontoEinstieg
      seite="registrieren"
      sprachZiel="/registrieren"
      titel={t('registrieren.titel')}
      untertitel={t('registrieren.untertitel')}
    >
      <div className="flex flex-col gap-6">
        <p className="rounded-md bg-info-toenung px-4 py-3 text-16 text-pretty text-info">{t('registrieren.hinweisEinladung')}</p>
        <RegistrierFormular datenschutz={pfadFuer('/datenschutz', sprache)} anmelden={pfadFuer('/anmelden', sprache)} />
        <div className="flex flex-col gap-1 border-t border-linie pt-5">
          <p className="text-16 text-tinte-2">{t('registrieren.schonKonto')}</p>
          <a href={pfadFuer('/anmelden', sprache)} className="inline-flex min-h-12 items-center self-start font-bold">
            {t('registrieren.anmelden')}
          </a>
        </div>
      </div>
    </KontoEinstieg>
  );
}
