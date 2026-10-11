import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { locale } from 'next/root-params';
import { connection } from 'next/server';
import { redirect } from 'next/navigation';

/**
 * Verwaltung (ADR 0016): nur Deutsch, je Anfrage gerendert (Nonce-CSP aus dem Proxy, ADR 0012),
 * nie indexiert. `instant = false`: Seiten dürfen auf dem Server blockieren (Sitzung).
 */
export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('verwaltung');
  return { title: t('titel'), robots: { index: false, follow: false } };
}

export default async function VerwaltungLayout({ children }: LayoutProps<'/[locale]/verwaltung'>) {
  await connection();
  if ((await locale()) !== 'de') redirect('/verwaltung');
  const nachrichten = await getMessages();
  return (
    <NextIntlClientProvider timeZone="Europe/Berlin" messages={{ verwaltung: nachrichten.verwaltung }}>
      <div className="min-h-dvh bg-papier">{children}</div>
    </NextIntlClientProvider>
  );
}
