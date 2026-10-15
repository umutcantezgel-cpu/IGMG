import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/link';
import type { HadithBuchKurz } from '@/server/queries/hadith';
import { BuchStern } from './BuchStern';

/**
 * Raster der Bücher von Sahih al-Bukhari (K-005 `raster-kacheln`): Nummer im Achtstern, Titel der Quelle (Englisch,
 * `lang="en"`), Anzahl. Jede Karte ist ein einziger Link; Stern und Titel sind für den Seitenwechsel markiert
 * (Hadith-Buch → Kopf, AUFTRAG 4). Server-Komponente.
 */
export async function BuchKacheln({ buecher }: { buecher: HadithBuchKurz[] }) {
  const t = await getTranslations('hadith.bukhari');
  return (
    <ul className="grid raster-kacheln gap-3 md:gap-4">
      {buecher.map((b) => (
        <li key={b.nr}>
          <Link
            href={{ pathname: '/hadith/bukhari/[buch]', params: { buch: String(b.nr) } }}
            data-morph-karte={`hb-${b.nr}`}
            className="group flex h-full min-h-16 druck items-center gap-4 rounded-lg border border-linie bg-weiss p-4 text-tinte no-underline shadow-s1 transition duration-(--dauer-rueckmeldung) hover:border-gruen-700 hover:text-tinte hover:shadow-s2"
          >
            <BuchStern nr={b.nr} art="kachel" morph="bild" />
            <span className="flex min-w-0 flex-col gap-1">
              <span className="sr-only">{t('buch', { nr: b.nr })}: </span>
              <span lang="en" data-morph="titel" className="leading-snug font-bold break-words">
                {b.titelEn}
              </span>
              <span className="text-16 text-tinte-2">{t('anzahl', { anzahl: b.anzahl })}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
