import { BookOpen, ExternalLink } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { netzwerkZiel } from '@/lib/dachverband/netzwerk';
import { klassen } from '@/lib/klassen';

/**
 * Kasten „Ramadan-Begleiter der IGMG“ auf /ramadan (Plan Marktstart P7): Verweis auf das Begleitheft des Dachverbands, je
 * Sprache mit dem Titel der passenden Fassung („Mein Ramadan Begleiter“, „Ramazan Yoldaşım“, „Ramadan Guide“). Die Seite
 * bei der IGMG bietet alle drei Fassungen an, deshalb ohne Sprachhinweis und mit `hrefLang` der Seite (Netzwerk-Ziel
 * `ramazanYoldasim`). Nur ein Link, kein Bild, keine Anfrage beim Aufruf (K-14). Server-Komponente ohne Client-Code (K-12).
 */
export async function RamadanBegleiter({ sprache, className }: { sprache: Locale; className?: string }) {
  const [t, td] = await Promise.all([getTranslations('ramadan.begleiter'), getTranslations('dachverband')]);
  const ziel = netzwerkZiel('ramazanYoldasim', sprache);
  return (
    <section
      aria-labelledby="ramadan-begleiter"
      data-ramadan="begleiter"
      className={klassen('flex flex-col gap-3 rounded-lg border border-linie bg-weiss p-6', className)}
    >
      <h2 id="ramadan-begleiter" className="flex items-center gap-2.5 font-text text-20 font-bold tracking-normal">
        <BookOpen aria-hidden className="size-5 shrink-0 text-gruen-700" />
        {t('titel')}
      </h2>
      <p className="max-w-text text-tinte-2">{t('text')}</p>
      <a
        href={ziel.href}
        hrefLang={ziel.zielSprache}
        rel="noopener noreferrer"
        aria-label={`${t('link')}: ${td('externeSeite')}`}
        className="inline-flex min-h-12 items-center gap-2 self-start font-bold text-gruen-700 underline underline-offset-4"
      >
        {t('link')}
        <ExternalLink aria-hidden className="size-4 shrink-0" />
      </a>
    </section>
  );
}
