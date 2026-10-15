import { getLocale, getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
import { AbmeldenKnopf } from '@/components/konto/AbmeldenKnopf';
import { Breadcrumbs, type PfadEintrag } from '@/components/website/Breadcrumbs';
import { Footer } from '@/components/website/Footer';
import { Header, type KopfKonto } from '@/components/website/Header';
import { KontoKopfMenue } from '@/components/website/kopf/KontoKopfMenue';
import type { Ziel } from '@/i18n/navigation';

/** Initiale und Vorname aus dem Anzeigenamen („Emre B.“ → „E“, „Emre“). */
export function kopfName(anzeigename: string, sprache: string): { initiale: string; vorname: string } {
  const name = anzeigename.trim();
  return {
    initiale: Array.from(name)[0]?.toLocaleUpperCase(sprache) ?? '',
    vorname: name.split(/\s+/)[0] ?? '',
  };
}

/**
 * Schlichte Hülle der Konto-Seiten (ADR 0026): Sprunglink, Kopf und Fuß der Website, optional Brotkrumen.
 * Bewusst ohne `Seitenrahmen`: Dessen Konzept-Hinweis startet mit einem Inline-Skript, das die strikte Nonce-CSP der
 * Konto-Seiten (proxy.ts) zu Recht blockiert; ohne Gebetszeitenleiste und ohne JSON-LD (Seiten sind `noindex`).
 * Mit `konto` (angemeldet, „Mein Bereich“) zeigt der Kopf die Kontoschaltfläche statt „Anmelden“ (Sichtabnahme X-1);
 * das Abmelden-Formular entsteht hier, damit der Kopf öffentlicher Seiten die Server Action nie lädt.
 */
export async function KontoHuelle({
  seite,
  sprachZiel,
  pfad,
  konto,
  children,
}: {
  seite: string;
  sprachZiel: Ziel;
  pfad?: PfadEintrag[];
  konto?: { anzeigename: string };
  children: ReactNode;
}) {
  const [t, sprache] = await Promise.all([getTranslations('kopf'), getLocale()]);
  const name = konto ? kopfName(konto.anzeigename, sprache) : null;
  const abmelden = <AbmeldenKnopf sprache={sprache} text={t('abmelden')} variante="zeile" />;
  const kopfKonto: KopfKonto | undefined = name
    ? { ...name, abmelden, menue: <KontoKopfMenue initiale={name.initiale} vorname={name.vorname} abmelden={abmelden} /> }
    : undefined;
  return (
    <>
      <a
        href="#inhalt"
        className="sr-only z-(--ebene-sprung) rounded-md bg-gruen-950 px-4 py-3 font-bold text-weiss focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:text-weiss"
      >
        {t('zumInhalt')}
      </a>
      <Header aktiv="keiner" aktuell={seite} sprachZiel={sprachZiel} konto={kopfKonto} />
      {pfad && pfad.length > 0 ? <Breadcrumbs pfad={pfad} /> : null}
      <main id="inhalt" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Footer />
    </>
  );
}
