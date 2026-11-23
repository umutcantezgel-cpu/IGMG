import { FlaskConical } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import NextLink from 'next/link';
import { vorfuehrung } from '@/lib/vorfuehrung/modus';

/**
 * Band der Vorführung mit Testzugang (ADR 0052) über den Bereichen hinter der Anmeldung: Beispieldaten, Änderungen
 * bleiben nicht – und der Weg zurück zur Wahl des Zugangs. Außerhalb der Vorführung nichts.
 */
export async function TestBand() {
  if (!vorfuehrung()) return null;
  const t = await getTranslations('verwaltung.vorfuehrung');
  return (
    <aside className="border-b border-warnung bg-warnung-toenung text-tinte">
      <div className="mx-auto flex max-w-(--container-inhalt) flex-wrap items-center gap-x-6 gap-y-1 px-4 py-2 text-16 md:px-8">
        <p className="flex items-center gap-2 font-bold">
          <FlaskConical aria-hidden className="size-5 shrink-0" />
          {t('band')}
        </p>
        <NextLink href="/verwaltung/anmelden" prefetch={false} className="inline-flex min-h-11 items-center font-bold">
          {t('bandWechseln')}
        </NextLink>
      </div>
    </aside>
  );
}
