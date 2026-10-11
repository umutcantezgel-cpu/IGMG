import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/website/PageHeader';
import { Seitenrahmen } from '@/components/website/Seitenrahmen';
import { Abschnitt, Angaben, Bausteine, Entwurfshinweis, Rechtsgliederung } from '@/components/website/rechtliches/Rechtstext';
import type { Locale } from '@/i18n/routing';
import { metadatenFuer } from '@/lib/seo/metadaten';
import { ladeSeiteninhalt } from '@/server/queries/seiteninhalte';

export const ensureStatic = 'navigation';

export async function generateMetadata(): Promise<Metadata> {
  const [t, tf] = await Promise.all([getTranslations('rechtliches'), getTranslations('fuss')]);
  return metadatenFuer({ pfad: '/impressum', titel: tf('impressum'), beschreibung: t('beschreibungImpressum') });
}

/**
 * Impressum (Blatt S23, Gliederung Impressum; Design Rechtliches.dc.html): sichtbar markierter Entwurf (G-08).
 * Angaben zur Gemeinde stehen als Platzhalter im Seiteninhalt „impressum“, bis die Gemeinde sie liefert (G-05).
 */
export default async function ImpressumSeite() {
  const sprache = (await getLocale()) as Locale;
  const [t, tf, ta, inhalt] = await Promise.all([
    getTranslations('rechtliches'),
    getTranslations('fuss'),
    getTranslations('allgemein'),
    ladeSeiteninhalt('impressum'),
  ]);
  const nurDeutsch = ta('nurDeutsch');
  const v = inhalt.verantwortlich;
  return (
    <Seitenrahmen bereich="keiner" seite="impressum" sprachZiel="/impressum" pfad={[{ label: tf('impressum') }]}>
      <PageHeader kennung={t('kennung')} titel={tf('impressum')} untertitel={t('untertitel')} />
      <Rechtsgliederung
        titel={t('inhaltsverzeichnis')}
        punkte={[
          { id: 'verantwortlich', titel: t('verantwortlich') },
          { id: 'weitere', titel: t('weitere') },
        ]}
        entwurf={<Entwurfshinweis titel={t('entwurf')} text={t('entwurfText')} />}
      >
        <Abschnitt id="verantwortlich" titel={t('verantwortlich')}>
          <Angaben
            sprache={sprache}
            nurDeutsch={nurDeutsch}
            eintraege={[
              { label: t('name'), wert: v.name },
              { label: t('anschrift'), wert: v.anschrift },
              { label: t('telefon'), wert: v.telefon },
              { label: t('email'), wert: v.email },
              { label: t('vertretung'), wert: v.vertretung },
              { label: t('register'), wert: v.register },
            ]}
          />
        </Abschnitt>
        <Abschnitt id="weitere" titel={t('weitere')}>
          <Bausteine bloecke={inhalt.weitere} sprache={sprache} nurDeutsch={nurDeutsch} />
        </Abschnitt>
      </Rechtsgliederung>
    </Seitenrahmen>
  );
}
