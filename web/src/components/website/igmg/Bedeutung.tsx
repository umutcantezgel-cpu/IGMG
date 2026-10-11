import { Compass } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Text } from '@/components/website/Text';
import type { Sprache } from '@/lib/i18n/inhalt';
import type { IgmgInhalt } from '@/lib/validierung/seiteninhalte/igmg';

/** Reiter „Bedeutung“ (design/IGMGInfo.dc.html Z. 46–55): was der Name Millî Görüş bedeutet, drei Absätze. */
export async function Bedeutung({ inhalt, sprache }: { inhalt: IgmgInhalt; sprache: Sprache }) {
  const t = await getTranslations('igmg');
  return (
    <section aria-labelledby="igmg-bedeutung" className="flex flex-col gap-4 rounded-lg border border-linie bg-weiss p-5 md:p-10">
      <h2 id="igmg-bedeutung" className="flex items-center gap-2.5 text-display-2">
        <Compass aria-hidden className="size-7 shrink-0 text-gruen-700" />
        {t('bedeutungTitel')}
      </h2>
      <div className="flex max-w-text flex-col gap-4 text-pretty">
        {inhalt.bedeutung.absaetze.map((absatz, i) => (
          <Text key={i} feld={absatz} sprache={sprache} als="p" />
        ))}
      </div>
    </section>
  );
}
