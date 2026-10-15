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
 * Seitenkopf wie auf allen Seiten: der Satz steht als Untertitel im Kopf, die Zustandsgrafik rechts mittig zu Titel und
 * Satz (Zierde des Kopfs, dekorativ). Darunter die Seitenachse (H-B14): Startseiten-Knopf und fünf Wege in Kacheln, ab xl
 * in einer Reihe (Namen aus den bestehenden Schlüsseln, keine neuen Texte).
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
      <PageHeader
        titel={t('nichtGefunden.titel')}
        untertitel={t('nichtGefunden.text')}
        zierde={<Zustandsgrafik art="nichtGefunden" groesse={120} />}
      />
      <div className="mx-auto max-w-(--container-inhalt) px-4 pt-abschnitt-klein pb-abschnitt md:px-8">
        <Statusblock ausrichtung="start">
          <Link href="/" className={knopfPrimaer}>
            {t('aktion.startseite')}
          </Link>
          <ul className="grid w-full raster-kacheln gap-3 lg:grid-cols-3 xl:grid-cols-5">
            {wege.map(({ href, text, Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="flex min-h-14 druck items-center gap-3 rounded-md border border-linie bg-weiss px-4 font-bold text-gruen-800 no-underline transition duration-(--dauer-rueckmeldung) hover:border-gruen-700 hover:bg-gruen-50"
                >
                  <Icon aria-hidden className="size-5 shrink-0 text-gruen-700" />
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
