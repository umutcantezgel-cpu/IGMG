import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { NichtGefundenInhalt } from '@/components/website/fehler/NichtGefundenInhalt';

export const ensureStatic = 'navigation';

/** Platzhalter für den statischen Bau: ensureStatic verlangt je Route mindestens eine vollständige Parametermenge (MUSTER 1). */
export function generateStaticParams() {
  return [{ rest: ['_'] }];
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('fehlerseiten');
  return { title: t('nichtGefunden.titel'), robots: { index: false, follow: true } };
}

/**
 * Unbekannte Adressen innerhalb einer Sprache (Blatt S24, Variante 404). Hinweis: notFound() liefert hier nur den
 * englischen Standard-404 von Next ohne Layout (Root-Layout [locale], kein app/global-not-found). Darum gibt die
 * Seite den lokalisierten Inhalt mit HTTP 200 und noindex aus (siehe ABWEICHUNGEN).
 */
export default function UnbekannteAdresse() {
  return <NichtGefundenInhalt />;
}
