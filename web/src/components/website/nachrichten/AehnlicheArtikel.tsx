import type { Sprache } from '@/lib/i18n/inhalt';
import type { NachrichtDaten } from '@/server/queries/nachrichten';
import { NewsCard } from '../NewsCard';

/**
 * Ähnliche Artikel (design/NewsDetails.dc.html, Seitenspalte): Abschnitt ohne Kasten mit kompakten Karten (NewsCard).
 * Die Auswahl kommt aus ladeAehnlicheNachrichten (gleiche Kategorie, neueste zuerst).
 */
export function AehnlicheArtikel({ titel, artikel, sprache }: { titel: string; artikel: NachrichtDaten[]; sprache: Sprache }) {
  return (
    <section aria-labelledby="nd-aehnlich" className="flex flex-col gap-4">
      <h2 id="nd-aehnlich" className="text-24">
        {titel}
      </h2>
      <ul className="grid gap-4">
        {artikel.map((a) => (
          <li key={a.id}>
            <NewsCard n={a} sprache={sprache} variante="kompakt" bild={a.bild} />
          </li>
        ))}
      </ul>
    </section>
  );
}
