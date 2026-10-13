import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/link';
import { surenSchluessel } from '@/lib/quran/suche';
import type { SureKurz } from '@/server/queries/quran';
import { Medaillon } from './Medaillon';

/**
 * Surenraster der Übersicht (O-Q01): je Sure eine Kachel als ein Link – Nummer im Achtstern, Umschrift, arabischer
 * Name (aus der Quelle), Offenbarungsort und Verszahl. Kachel → Kopf der Surenseite als Morph (Medaillon und Name,
 * morph.ts). `data-suche` trägt den vereinfachten Namen für die Suche im Browser. Ohne Vorabruf (114 große Seiten).
 */
export async function SurenRaster({ suren }: { suren: SureKurz[] }) {
  const t = await getTranslations('quranSeite');
  return (
    <ul className="grid raster-kacheln gap-3 md:gap-4">
      {suren.map((s) => (
        <li key={s.nr} data-nr={s.nr} data-suche={surenSchluessel(s.umschrift, s.nameAr)}>
          <Link
            href={{ pathname: '/quran/[sure]', params: { sure: String(s.nr) } }}
            prefetch={false}
            data-morph-karte={`s-${s.nr}`}
            className="group grid h-full min-h-20 raster-symbol items-center gap-x-3 rounded-lg border border-linie bg-weiss py-3 pr-4 pl-3 text-tinte no-underline shadow-s1 transition duration-(--dauer-rueckmeldung) hover:border-gruen-700 hover:text-tinte hover:shadow-s2 active:scale-98"
          >
            <Medaillon nr={s.nr} morph="bild" flaeche="fill-weiss group-hover:fill-gruen-50" className="row-span-2" />
            <span className="flex min-w-0 items-baseline justify-between gap-2">
              <span data-morph="titel" className="leading-snug font-bold break-words">
                {s.umschrift}
              </span>
              <span lang="ar" dir="rtl" className="shrink-0 font-arabic text-arabisch-3 leading-ueberschrift text-tinte">
                {s.nameAr}
              </span>
            </span>
            <span className="text-16 leading-snug text-tinte-2">
              {s.ort ? `${t(`ort.${s.ort}`)} · ` : ''}
              {t('versAnzahl', { anzahl: s.verseAnzahl })}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
