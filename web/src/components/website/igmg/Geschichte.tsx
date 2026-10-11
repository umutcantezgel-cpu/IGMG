import { Calendar } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Text } from '@/components/website/Text';
import type { Sprache } from '@/lib/i18n/inhalt';
import type { IgmgInhalt } from '@/lib/validierung/seiteninhalte/igmg';

/** Reiter „Geschichte“ (design/IGMGInfo.dc.html Z. 57–66): fünf Stationen in fester Reihenfolge, Jahreszahl links. */
export async function Geschichte({ inhalt, sprache }: { inhalt: IgmgInhalt; sprache: Sprache }) {
  const t = await getTranslations('igmg');
  return (
    <section aria-labelledby="igmg-geschichte" className="flex flex-col gap-4 rounded-lg border border-linie bg-weiss p-5 md:p-10">
      <h2 id="igmg-geschichte" className="flex items-center gap-2.5 text-display-2">
        <Calendar aria-hidden className="size-7 shrink-0 text-gruen-700" />
        {t('geschichteTitel')}
      </h2>
      <ol className="flex flex-col">
        {inhalt.geschichte.eintraege.map((eintrag, i) => (
          <li key={i} className="flex flex-wrap gap-x-6 gap-y-2 border-t border-linie py-4">
            {/* Auf dem Telefon steht die Jahreszahl über dem Text, ab 640 px links daneben (200 px) */}
            <Text feld={eintrag.label} sprache={sprache} als="strong" className="max-w-full shrink-0 font-bold text-gruen-800 sm:w-50" />
            <Text feld={eintrag.text} sprache={sprache} als="p" className="max-w-text min-w-0 flex-1 basis-105 text-pretty" />
          </li>
        ))}
      </ol>
    </section>
  );
}
