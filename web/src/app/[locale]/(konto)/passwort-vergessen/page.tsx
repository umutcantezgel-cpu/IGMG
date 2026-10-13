import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { PasswortVergessenFormular } from '@/components/konto/EinstiegFormulare';
import { KontoEinstieg } from '@/components/konto/KontoEinstieg';
import { pfadFuer } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { verlangeKontenSeite } from '@/lib/konto/zugang';

/** Je Anfrage gerendert, wartet auf die Sitzung (siehe Layout). */
export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  // Konten aus: auch Titel und Inhalt der Seite nicht ausliefern (Layout und Seite rendern parallel)
  await verlangeKontenSeite();
  const t = await getTranslations('konto.meta');
  return { title: t('passwortVergessen') };
}

/** Passwort vergessen: immer dieselbe Antwort, ob es die Adresse gibt oder nicht (keine Kontenaufzählung). */
export default async function PasswortVergessenSeite() {
  await verlangeKontenSeite();
  const sprache = (await getLocale()) as Locale;
  const t = await getTranslations('konto');
  return (
    <KontoEinstieg
      seite="passwort-vergessen"
      sprachZiel="/passwort-vergessen"
      titel={t('passwortVergessen.titel')}
      untertitel={t('passwortVergessen.text')}
      ohneEinordnung
    >
      <PasswortVergessenFormular zurAnmeldung={pfadFuer('/anmelden', sprache)} />
    </KontoEinstieg>
  );
}
