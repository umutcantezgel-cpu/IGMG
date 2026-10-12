import { Text, textMitSprache } from '@/components/website/Text';
import { Link } from '@/i18n/link';
import { datumLang } from '@/lib/i18n/format';
import type { Sprache } from '@/lib/i18n/inhalt';
import type { NachrichtDaten } from '@/server/queries/nachrichten';

/**
 * Kompakte Nachrichtenliste der Organisationsseite (design/OrganizationPage.dc.html, „Aktuelle Nachrichten“):
 * Datum, Titel serifenlos fett als Link zum Artikel; die ganze Zeile ist klickbar (after:-Fläche), Kurztext und
 * Trennlinien. Ein eigener „Weiterlesen“-Link entfällt.
 */
export function OrgMeldungen({ meldungen, sprache }: { meldungen: NachrichtDaten[]; sprache: Sprache }) {
  return (
    <ul className="flex flex-col">
      {meldungen.map((n) => {
        const titel = textMitSprache(n.titel, sprache);
        const ziel = { pathname: '/nachrichten/[slug]' as const, params: { slug: n.slug } };
        return (
          <li key={n.id} className="relative flex flex-col gap-1.5 border-t border-linie py-4 first:border-t-0 first:pt-2">
            <span className="text-16 text-tinte-2">{datumLang(new Date(n.veroeffentlichtAm), sprache)}</span>
            <h3 lang={titel.lang} className="font-text text-20 leading-snug font-bold tracking-normal">
              <Link
                href={ziel}
                className="text-tinte no-underline after:absolute after:inset-0 hover:text-gruen-800 hover:underline hover:underline-offset-4"
              >
                {titel.text}
              </Link>
            </h3>
            <Text feld={n.kurztext} sprache={sprache} als="p" className="text-16 text-tinte-2" />
          </li>
        );
      })}
    </ul>
  );
}
