import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { NichtGefundenInhalt } from '@/components/website/fehler/NichtGefundenInhalt';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('fehlerseiten');
  return { title: t('nichtGefunden.titel'), robots: { index: false, follow: true } };
}

/**
 * Seite nicht gefunden innerhalb einer Sprache (Blatt S24, Variante 404). Greift, wenn notFound() innerhalb des
 * Abschnitts ausgelöst wird. Die Adressen ohne Treffer rendert [...rest]/page.tsx mit demselben Inhalt.
 */
export default function NotFound() {
  return <NichtGefundenInhalt />;
}
