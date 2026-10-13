import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { connection } from 'next/server';
import { verlangeKontenSeite } from '@/lib/konto/zugang';

/**
 * Konto-Einstieg und „Mein Bereich“ (ADR 0026): je Anfrage gerendert (Nonce-CSP, `no-store`, `noindex` aus dem Proxy),
 * hinter dem Funktionsschalter `konten` (aus → 404, ADR 0035). `instant = false`: Die Seiten dürfen auf dem Server auf
 * die Sitzung warten. Im Browser nur die Texte der Konto-Bereiche (kein vollständiger Sprachkatalog).
 */
export const instant = false;

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function KontoLayout({ children }: LayoutProps<'/[locale]'>) {
  await connection();
  await verlangeKontenSeite();
  const n = await getMessages();
  return (
    <NextIntlClientProvider timeZone="Europe/Berlin" messages={{ konto: n.konto, meinBereich: n.meinBereich }}>
      {children}
    </NextIntlClientProvider>
  );
}
