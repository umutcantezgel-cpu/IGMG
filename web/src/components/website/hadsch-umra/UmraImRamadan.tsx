import { ArrowRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Stern8 } from '@/components/website/Icons';
import { Link } from '@/i18n/link';

/**
 * Querlink „Umra im Ramadan“ auf /ramadan (Plan Marktstart P4): kurzer Kasten mit einem internen Link auf /hadsch-umra.
 * Eigene Komponente mit eigenen Texten (`hadschUmra.ramadan`), damit die Ramadan-Seite nur eine Zeile braucht.
 * Server-Komponente ohne Client-JavaScript (K-12).
 */
export async function UmraImRamadan() {
  const t = await getTranslations('hadschUmra.ramadan');
  return (
    <section aria-labelledby="ramadan-umra" className="flex flex-col gap-3 rounded-lg border border-linie bg-weiss p-6">
      <h2 id="ramadan-umra" className="flex items-center gap-2.5 font-text text-20 font-bold tracking-normal">
        <Stern8 aria-hidden className="size-4 shrink-0 text-gruen-700" />
        {t('titel')}
      </h2>
      <p className="text-tinte-2">{t('text')}</p>
      <Link
        href="/hadsch-umra"
        className="inline-flex min-h-12 items-center gap-2 self-start font-bold text-gruen-700 underline underline-offset-4"
      >
        {t('link')}
        <ArrowRight aria-hidden className="size-5" />
      </Link>
    </section>
  );
}
