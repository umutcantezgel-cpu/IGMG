import { ChevronDown } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Stern8 } from '@/components/website/Icons';
import type { Locale } from '@/i18n/routing';
import { basisUrl } from '@/lib/seo/metadaten';

/** Datei- und Abo-Name des Veranstaltungsfeeds (wie im Feed-Namen der Route). */
const DATEI = 'igmg-wetzlar-veranstaltungen.ics';

/**
 * Abo-Adresse eines Feeds (K-19): dieselbe öffentliche Adresse wie die Metadaten, das Schema `https` durch
 * `webcal` ersetzt. Gerät und Kalenderprogramm fragen dann nach einem Abo, das sich selbst aktualisiert.
 */
export function webcalAdresse(pfad: string): string {
  return `${basisUrl().replace(/^https?:\/\//, 'webcal://')}${pfad}`;
}

const KNOPF =
  'inline-flex min-h-12 items-center justify-center rounded-md bg-gruen-700 px-6 font-bold text-weiss no-underline transition duration-(--dauer-rueckmeldung) hover:bg-gruen-800 hover:text-weiss active:scale-98';

const TEXTLINK = 'inline-flex min-h-12 items-center font-bold text-gruen-700 underline underline-offset-4';

/**
 * Kalender-Abo am Ende der Veranstaltungsliste (K-19): ruhige Karte mit Achtstern als Kennung, Titel, einem Satz und
 * zwei Handlungen. „Abonnieren“ ist der primäre Knopf (webcal-Adresse), „Datei laden“ lädt dieselben Termine als
 * .ics. Ab lg steht der Text links, die Handlungen rechts. Die Hilfe für Apple, Google und Outlook klappt auf (B-03);
 * ein Pfeil zeigt den Zustand, die https-Adresse steht darin zum Kopieren. Reine Server-Komponente.
 */
export async function KalenderAbo({ sprache }: { sprache: Locale }) {
  const t = await getTranslations('veranstaltungen');
  const pfad = `/api/ical/${sprache}/veranstaltungen`;
  return (
    <section
      aria-labelledby="kalender-abo"
      className="flex flex-col gap-4 rounded-lg border border-linie bg-weiss p-6 md:p-8 lg:grid lg:grid-cols-2 lg:items-center lg:gap-x-12"
    >
      <div className="flex flex-col gap-2">
        <h2 id="kalender-abo" className="flex items-start gap-2.5 font-text text-20 leading-snug font-bold tracking-normal">
          {/* Rubrik einer Begleitkarte in fetter Sans (L-E13) */}
          <Stern8 className="mt-1.5 size-4 shrink-0 text-tinte-2" />
          {t('aboTitel')}
        </h2>
        <p className="max-w-text text-16 text-tinte-2">{t('aboText')}</p>
      </div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 lg:justify-end">
        <a href={webcalAdresse(pfad)} className={KNOPF}>
          {t('aboAbonnieren')}
        </a>
        <a href={pfad} download={DATEI} className={TEXTLINK}>
          {t('aboDatei')}
        </a>
      </div>
      <details className="group border-t border-linie pt-4 lg:col-span-2">
        <summary className={`${TEXTLINK} cursor-pointer list-none gap-2`}>
          <ChevronDown aria-hidden className="size-5 shrink-0 group-open:rotate-180" />
          {t('aboHilfe')}
        </summary>
        <div className="tritt-auf mt-3 flex max-w-text flex-col gap-3 text-16 text-tinte-2">
          <ul className="flex flex-col gap-2">
            {t.rich('aboHilfeText', {
              zeile: (c) => <li>{c}</li>,
              strong: (c) => <strong className="text-tinte">{c}</strong>,
            })}
          </ul>
          <code className="block rounded-md bg-sand px-3 py-2 break-all select-all">{`${basisUrl()}${pfad}`}</code>
        </div>
      </details>
    </section>
  );
}
