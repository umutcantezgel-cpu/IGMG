import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
import { Breadcrumbs, type PfadEintrag } from '@/components/website/Breadcrumbs';
import { Footer } from '@/components/website/Footer';
import { Header } from '@/components/website/Header';
import type { Ziel } from '@/i18n/navigation';

/**
 * Schlichte Hülle der Konto-Seiten (ADR 0026): Sprunglink, Kopf und Fuß der Website, optional Brotkrumen.
 * Bewusst ohne `Seitenrahmen`: Dessen Konzept-Hinweis startet mit einem Inline-Skript, das die strikte Nonce-CSP der
 * Konto-Seiten (proxy.ts) zu Recht blockiert; ohne Gebetszeitenleiste und ohne JSON-LD (Seiten sind `noindex`).
 */
export async function KontoHuelle({
  seite,
  sprachZiel,
  pfad,
  children,
}: {
  seite: string;
  sprachZiel: Ziel;
  pfad?: PfadEintrag[];
  children: ReactNode;
}) {
  const t = await getTranslations('kopf');
  return (
    <>
      <a
        href="#inhalt"
        className="sr-only z-(--ebene-sprung) rounded-md bg-gruen-950 px-4 py-3 font-bold text-weiss focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:text-weiss"
      >
        {t('zumInhalt')}
      </a>
      <Header aktiv="keiner" aktuell={seite} sprachZiel={sprachZiel} />
      {pfad && pfad.length > 0 ? <Breadcrumbs pfad={pfad} /> : null}
      <main id="inhalt" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Footer />
    </>
  );
}
