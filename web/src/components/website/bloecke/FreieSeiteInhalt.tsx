import { Languages } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/website/PageHeader';
import { textMitSprache } from '@/components/website/Text';
import type { Sprache } from '@/lib/i18n/inhalt';
import { uebersetzungsstand } from '@/lib/validierung/bloecke';
import type { SeiteOeffentlich } from '@/server/queries/seiten';
import { Bloecke } from './Bloecke';

/**
 * Inhalt einer freien Seite: Kopf (Titel, Kurzbeschreibung, Hinweis auf deutschen Rückfall) und Bausteine. Öffentliche
 * Seite und Vorschau der Verwaltung nutzen dieselbe Ausgabe.
 */
export async function FreieSeiteInhalt({
  seite,
  sprache,
  eingebettet = false,
}: {
  seite: SeiteOeffentlich;
  sprache: Sprache;
  /** In einer Verwaltungsseite (Fassung ansehen): Titel als h2 statt eigenem Seitenkopf mit h1. */
  eingebettet?: boolean;
}) {
  const [t, tk] = await Promise.all([getTranslations({ locale: sprache, namespace: 'bloecke' }), getTranslations({ locale: sprache, namespace: 'karten' })]);
  const titel = textMitSprache(seite.titel, sprache);
  const beschreibung = textMitSprache(seite.beschreibung, sprache);
  const stand = sprache === 'de' ? 100 : uebersetzungsstand(seite.titel, seite.beschreibung, seite.bloecke)[sprache];
  const hinweis =
    stand < 100 ? (
      <span className="inline-flex items-center gap-1.5 self-start rounded-pill bg-info-toenung px-3 py-0.5 text-16 font-bold text-info">
        <Languages aria-hidden className="size-4" />
        {stand === 0 ? t('nurDeutsch') : t('teilweiseDeutsch')}
      </span>
    ) : null;
  if (eingebettet)
    return (
      <>
        <div className="flex flex-col gap-3 border-b border-linie bg-sand px-4 py-8 md:px-8">
          <h2 lang={titel.lang} className="text-display-2 text-balance">
            {titel.text}
          </h2>
          {beschreibung.text ? (
            <p lang={beschreibung.lang} className="max-w-text text-20 leading-einleitung text-tinte-2">
              {beschreibung.text}
            </p>
          ) : null}
          {hinweis}
        </div>
        <Bloecke bloecke={seite.bloecke} sprache={sprache} bilder={seite.bilder} dateien={seite.dateien} />
      </>
    );
  return (
    <>
      <PageHeader
        kennung={seite.organisation ? tk(`orgName_${seite.organisation}`) : t('kennung')}
        titel={titel.text}
        titelLang={titel.lang}
        untertitel={beschreibung.text || undefined}
        untertitelLang={beschreibung.lang}
        kinder={hinweis}
      />
      <Bloecke bloecke={seite.bloecke} sprache={sprache} bilder={seite.bilder} dateien={seite.dateien} />
    </>
  );
}
