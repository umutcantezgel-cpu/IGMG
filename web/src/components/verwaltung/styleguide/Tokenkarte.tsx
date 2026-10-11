import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';

/**
 * Karte eines Tokens: Vorschau (für Hilfstechnik ausgeblendet; Name und Wert stehen daneben), Token-Name, Wert,
 * Verwendung und – nur wenn der Token-Kommentar ein Verhältnis nennt – die Kontrastangabe.
 */
export async function Tokenkarte({
  name,
  wert,
  verwendung,
  kontrast,
  vorschau,
}: {
  name: string;
  wert: string;
  verwendung: string;
  kontrast?: string;
  vorschau: ReactNode;
}) {
  const t = await getTranslations('verwaltung.styleguide');
  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-linie bg-weiss">
      <div aria-hidden="true">{vorschau}</div>
      <dl className="flex flex-col gap-3 p-4 text-16">
        <div className="flex flex-col">
          <dt className="text-tinte-2">{t('token')}</dt>
          <dd className="font-mono font-bold break-all">{name}</dd>
        </div>
        <div className="flex flex-col">
          <dt className="text-tinte-2">{t('wert')}</dt>
          <dd className="font-mono break-all">{wert}</dd>
        </div>
        <div className="flex flex-col">
          <dt className="text-tinte-2">{t('verwendung')}</dt>
          <dd>{verwendung}</dd>
        </div>
        {kontrast ? (
          <div className="flex flex-col">
            <dt className="text-tinte-2">{t('kontrast')}</dt>
            <dd className="font-mono">{kontrast}</dd>
          </div>
        ) : null}
      </dl>
    </article>
  );
}
