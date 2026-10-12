import { BookOpen, Calendar, Clock, Mail, Search, type LucideIcon } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/link';
import { PageHeader } from '../PageHeader';
import { Seitenrahmen } from '../Seitenrahmen';
import { Zustandsgrafik } from '../Zustandsgrafik';
import { knopfPrimaer } from './knopf';
import { Statusblock } from './Statusblock';

/**
 * Inhalt „Seite nicht gefunden“ (Blatt S24, Variante 404) für die Adressen unter [locale] (Datei [...rest]/page.tsx)
 * und die Datei not-found.tsx des Abschnitts. Server-Komponente ohne Parameter: statisch (K-01), ohne Anfrage an Dritte.
 * Seitenkopf wie auf allen Seiten, die Zustandsgrafik rechts neben dem Titel (Zierde des Kopfs, dekorativ). Darunter die
 * Seitenachse (H-B14): Satz, Startseiten-Knopf und fünf Wege in Kacheln, ab xl in einer Reihe (Namen aus den bestehenden
 * Schlüsseln, keine neuen Texte).
 */
export async function NichtGefundenInhalt() {
  const t = await getTranslations('fehlerseiten');
  const tk = await getTranslations('kopf');
  const ts = await getTranslations('suche');
  const wege: {
    href: '/gebetszeiten' | '/veranstaltungen' | '/bildung/korankurse' | '/kontakt' | '/suche';
    text: string;
    Icon: LucideIcon;
  }[] = [
    { href: '/gebetszeiten', text: tk('gebetszeiten'), Icon: Clock },
    { href: '/veranstaltungen', text: tk('veranstaltungen'), Icon: Calendar },
    { href: '/bildung/korankurse', text: tk('korankurse'), Icon: BookOpen },
    { href: '/kontakt', text: tk('kontakt'), Icon: Mail },
    { href: '/suche', text: ts('titel'), Icon: Search },
  ];
  return (
    <Seitenrahmen bereich="keiner" seite="nicht-gefunden" sprachZiel="/" pfad={[{ label: t('nichtGefunden.titel') }]}>
      <PageHeader titel={t('nichtGefunden.titel')} zierde={<Zustandsgrafik art="nichtGefunden" groesse={120} />} />
      <div className="mx-auto max-w-(--container-inhalt) px-4 pt-abschnitt-klein pb-abschnitt md:px-8">
        <Statusblock ausrichtung="start" text={t('nichtGefunden.text')}>
          <Link href="/" className={knopfPrimaer}>
            {t('aktion.startseite')}
          </Link>
          <ul className="grid w-full raster-kacheln gap-3 lg:grid-cols-3 xl:grid-cols-5">
            {wege.map(({ href, text, Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="flex min-h-14 items-center gap-3 rounded-md border border-linie bg-weiss px-3 font-bold text-gruen-800 no-underline transition duration-(--dauer-rueckmeldung) hover:border-gruen-700 hover:bg-gruen-50 active:scale-98"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-pill bg-gruen-50 text-gruen-700">
                    <Icon aria-hidden className="size-5" />
                  </span>
                  {text}
                </Link>
              </li>
            ))}
          </ul>
        </Statusblock>
      </div>
    </Seitenrahmen>
  );
}
