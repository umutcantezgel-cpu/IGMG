import { User } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Text } from '@/components/website/Text';
import type { Sprache } from '@/lib/i18n/inhalt';
import type { IgmgInhalt } from '@/lib/validierung/seiteninhalte/igmg';

/** Reiter „Überblick“ (design/IGMGInfo.dc.html Z. 28–44): Wer wir sind, daneben Zahlen und Fakten. */
export async function Ueberblick({ inhalt, sprache }: { inhalt: IgmgInhalt; sprache: Sprache }) {
  const t = await getTranslations('igmg');
  const zahlen = [
    { label: t('moscheen'), wert: inhalt.zahlen.moscheen },
    { label: t('zweigstellen'), wert: inhalt.zahlen.zweigstellen },
    { label: t('menschenErreicht'), wert: inhalt.zahlen.menschenErreicht },
  ];
  return (
    <div className="flex flex-wrap items-start gap-6">
      <section
        aria-labelledby="igmg-ueberblick"
        className="flex min-w-0 flex-[2_1_520px] flex-col gap-4 rounded-lg border border-linie bg-weiss p-5 md:p-10"
      >
        <h2 id="igmg-ueberblick" className="flex items-center gap-2.5 text-30">
          <User aria-hidden className="size-7 shrink-0 text-gruen-700" />
          {t('ueberblickTitel')}
        </h2>
        <Text feld={inhalt.ueberblick.text} sprache={sprache} als="p" className="max-w-(--container-text) text-pretty" />
        <Text
          feld={inhalt.ueberblick.auftrag}
          sprache={sprache}
          als="p"
          className="max-w-(--container-text) rounded-md bg-gruen-50 px-5 py-4 text-pretty"
        />
      </section>
      <section
        aria-labelledby="igmg-zahlen"
        className="flex min-w-0 flex-[1_1_300px] flex-col gap-4 rounded-lg bg-gruen-950 p-5 text-weiss md:p-8"
      >
        <h2 id="igmg-zahlen" className="text-30">
          {t('zahlenTitel')}
        </h2>
        <dl className="flex flex-col gap-3">
          {zahlen.map((zahl) => (
            <div key={zahl.label} className="border-t border-gruen-800 py-3">
              <dt className="text-gruen-100">{zahl.label}</dt>
              <dd className="text-36 font-bold break-words tabular-nums">{zahl.wert}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
