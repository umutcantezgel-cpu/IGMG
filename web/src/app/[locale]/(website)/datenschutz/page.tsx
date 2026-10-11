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
  return metadatenFuer({ pfad: '/datenschutz', titel: tf('datenschutz'), beschreibung: t('beschreibungDatenschutz') });
}

/**
 * Datenschutzerklärung (Blatt S23, Gliederung Datenschutz; Design Rechtliches.dc.html): sichtbar markierter Entwurf (G-08).
 * Die verantwortliche Stelle kommt aus dem Seiteninhalt „impressum“ (eine Quelle). Die übrigen Abschnitte beschreiben die
 * tatsächliche Technik der App; Lücken und Prüfpunkte stehen als Platzhalter im Seiteninhalt „datenschutz“.
 */
export default async function DatenschutzSeite() {
  const sprache = (await getLocale()) as Locale;
  const [t, tf, ta, impressum, inhalt] = await Promise.all([
    getTranslations('rechtliches'),
    getTranslations('fuss'),
    getTranslations('allgemein'),
    ladeSeiteninhalt('impressum'),
    ladeSeiteninhalt('datenschutz'),
  ]);
  const nurDeutsch = ta('nurDeutsch');
  const v = impressum.verantwortlich;
  return (
    <Seitenrahmen bereich="keiner" seite="datenschutz" sprachZiel="/datenschutz" pfad={[{ label: tf('datenschutz') }]}>
      <PageHeader kennung={t('kennung')} titel={tf('datenschutz')} untertitel={t('untertitel')} />
      <Rechtsgliederung
        titel={t('inhaltsverzeichnis')}
        punkte={[
          { id: 'verantwortlich', titel: t('verantwortlich') },
          { id: 'daten', titel: t('daten') },
          { id: 'zweck', titel: t('zweck') },
          { id: 'speicherung', titel: t('speicherung') },
          { id: 'sicherheit', titel: t('sicherheit') },
          { id: 'empfaenger', titel: t('empfaenger') },
          { id: 'browser', titel: t('browser') },
          { id: 'rechte', titel: t('rechte') },
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
              { label: t('datenschutzbeauftragte'), wert: inhalt.datenschutzbeauftragte },
            ]}
          />
        </Abschnitt>
        <Abschnitt id="daten" titel={t('daten')}>
          <Bausteine bloecke={inhalt.daten} sprache={sprache} nurDeutsch={nurDeutsch} />
        </Abschnitt>
        <Abschnitt id="zweck" titel={t('zweck')}>
          <Bausteine bloecke={inhalt.zweck} sprache={sprache} nurDeutsch={nurDeutsch} />
        </Abschnitt>
        <Abschnitt id="speicherung" titel={t('speicherung')}>
          <Bausteine bloecke={inhalt.speicherung} sprache={sprache} nurDeutsch={nurDeutsch} />
        </Abschnitt>
        <Abschnitt id="sicherheit" titel={t('sicherheit')}>
          <Bausteine bloecke={inhalt.sicherheit} sprache={sprache} nurDeutsch={nurDeutsch} />
        </Abschnitt>
        <Abschnitt id="empfaenger" titel={t('empfaenger')}>
          <Bausteine bloecke={inhalt.empfaenger} sprache={sprache} nurDeutsch={nurDeutsch} />
        </Abschnitt>
        <Abschnitt id="browser" titel={t('browser')}>
          <Bausteine bloecke={inhalt.browser} sprache={sprache} nurDeutsch={nurDeutsch} />
        </Abschnitt>
        <Abschnitt id="rechte" titel={t('rechte')}>
          <Bausteine bloecke={inhalt.rechte} sprache={sprache} nurDeutsch={nurDeutsch} />
        </Abschnitt>
      </Rechtsgliederung>
    </Seitenrahmen>
  );
}
