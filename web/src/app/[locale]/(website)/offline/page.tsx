import { WifiOff } from 'lucide-react';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/website/PageHeader';
import { Seitenrahmen } from '@/components/website/Seitenrahmen';
import { ErneutLadenKnopf } from '@/components/website/fehler/ErneutLadenKnopf';
import { knopfRahmen } from '@/components/website/fehler/knopf';
import { Statusblock } from '@/components/website/fehler/Statusblock';
import { Link } from '@/i18n/link';
import { metadatenFuer } from '@/lib/seo/metadaten';

export const ensureStatic = 'navigation';

/** Offline-Seite (K-15). Eine Suchmaschine soll sie nicht aufnehmen, die Adressen und hreflang setzt metadatenFuer. */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('fehlerseiten');
  const meta = await metadatenFuer({ pfad: '/offline', titel: t('offline.titel'), beschreibung: t('offline.text') });
  return { ...meta, robots: { index: false, follow: true } };
}

/**
 * Offline-Seite (Blatt S24, Variante Offline): Hinweis ohne Verbindung, „Erneut versuchen“, Link zur Startseite und zu
 * den Gebetszeiten. Die Monatstabelle fehlt bewusst (kein Design, Quelle nicht bestätigt, G-06).
 */
export default async function OfflineSeite() {
  const t = await getTranslations('fehlerseiten');
  const tl = await getTranslations('leiste');
  return (
    <Seitenrahmen bereich="keiner" seite="offline" sprachZiel="/offline" pfad={[{ label: t('offline.titel') }]}>
      <PageHeader titel={t('offline.titel')} />
      <div className="mx-auto max-w-(--container-inhalt) px-4 py-10 md:px-8 md:py-14">
        <Statusblock sinnbild={<WifiOff aria-hidden className="size-8" />} ueberschrift={t('offline.h2')} text={t('offline.text')}>
          <ErneutLadenKnopf text={t('aktion.erneut')} />
          <Link href="/" className={knopfRahmen}>
            {t('aktion.startseite')}
          </Link>
          <Link href="/gebetszeiten" className={knopfRahmen}>
            {tl('alle')}
          </Link>
        </Statusblock>
      </div>
    </Seitenrahmen>
  );
}
