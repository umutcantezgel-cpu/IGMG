import { SearchX } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/link';
import { PageHeader } from '../PageHeader';
import { Seitenrahmen } from '../Seitenrahmen';
import { knopfRahmen } from './knopf';
import { Statusblock } from './Statusblock';

/**
 * Inhalt „Seite nicht gefunden“ (Blatt S24, Variante 404) für die Adressen unter [locale] (Datei [...rest]/page.tsx)
 * und die Datei not-found.tsx des Abschnitts. Server-Komponente ohne Parameter: statisch (K-01), ohne Anfrage an Dritte.
 */
export async function NichtGefundenInhalt() {
  const t = await getTranslations('fehlerseiten');
  return (
    <Seitenrahmen bereich="keiner" seite="nicht-gefunden" sprachZiel="/" pfad={[{ label: t('nichtGefunden.titel') }]}>
      <PageHeader titel={t('nichtGefunden.titel')} />
      <div className="mx-auto max-w-(--container-inhalt) px-4 py-10 md:px-8 md:py-14">
        <Statusblock
          sinnbild={<SearchX aria-hidden className="size-8" />}
          ueberschrift={t('nichtGefunden.h2')}
          text={t('nichtGefunden.text')}
        >
          <Link href="/" className={knopfRahmen}>
            {t('aktion.startseite')}
          </Link>
        </Statusblock>
      </div>
    </Seitenrahmen>
  );
}
