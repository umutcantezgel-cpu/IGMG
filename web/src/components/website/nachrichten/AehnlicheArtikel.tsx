import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/link';
import { datumLang } from '@/lib/i18n/format';
import type { Sprache } from '@/lib/i18n/inhalt';
import { cn } from '@/lib/utils';
import type { NachrichtDaten } from '@/server/queries/nachrichten';
import { textMitSprache } from '../Text';

/** Kategoriefarben wie in NewsCard (Tokens aus globals.css). */
const TOENUNG: Record<NachrichtDaten['kategorie'], string> = {
  ankuendigung: 'bg-tag-wichtig-bg text-tag-wichtig',
  gemeinde: 'bg-tag-gemeinde-bg text-tag-gemeinde',
  veranstaltung: 'bg-tag-veranstaltung-bg text-tag-veranstaltung',
  bildung: 'bg-tag-bildung-bg text-tag-bildung',
  religioes: 'bg-tag-neuigkeiten-bg text-tag-neuigkeiten',
  soziales: 'bg-tag-jugend-bg text-tag-jugend',
  neuigkeiten: 'bg-tag-neuigkeiten-bg text-tag-neuigkeiten',
};

/**
 * Ähnliche Artikel (design/NewsDetails.dc.html, Seitenspalte): je Eintrag Kategorie, Datum und Titel als Link.
 * Die Auswahl kommt aus ladeAehnlicheNachrichten (gleiche Kategorie, neueste zuerst).
 */
export async function AehnlicheArtikel({ titel, artikel, sprache }: { titel: string; artikel: NachrichtDaten[]; sprache: Sprache }) {
  const tk = await getTranslations('karten');
  return (
    <section aria-labelledby="nd-aehnlich" className="flex flex-col gap-3 rounded-lg border border-linie bg-weiss p-6">
      <h2 id="nd-aehnlich" className="text-24">
        {titel}
      </h2>
      <ul className="flex flex-col">
        {artikel.map((a) => {
          const name = textMitSprache(a.titel, sprache);
          return (
            <li key={a.id} className="border-t border-linie">
              <Link
                href={{ pathname: '/nachrichten/[slug]', params: { slug: a.slug } }}
                className="flex min-h-12 flex-col gap-1.5 py-3.5 text-tinte no-underline hover:text-gruen-800"
              >
                <span className="flex flex-wrap items-center gap-2 text-16 text-tinte-2">
                  <span className={cn('inline-flex rounded-pill px-2.5 font-bold', TOENUNG[a.kategorie])}>{tk(`nkat_${a.kategorie}`)}</span>
                  <time dateTime={a.veroeffentlichtAm}>{datumLang(new Date(a.veroeffentlichtAm), sprache)}</time>
                </span>
                <span lang={name.lang} className="text-18 leading-snug font-bold underline decoration-linie underline-offset-4">
                  {name.text}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
