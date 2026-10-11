import { Building2, Target, Users } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { OrgCard } from '@/components/website/OrgCard';
import { Text } from '@/components/website/Text';
import type { Sprache } from '@/lib/i18n/inhalt';
import type { IgmgInhalt } from '@/lib/validierung/seiteninhalte/igmg';

/**
 * Reiter „Struktur“ (design/IGMGInfo.dc.html Z. 68–95): Zentralverband mit Präsidium und Ausführungsausschuss,
 * drei Organisationsstufen und die vier Organisationskarten.
 */
export async function Struktur({ inhalt, sprache }: { inhalt: IgmgInhalt; sprache: Sprache }) {
  const t = await getTranslations('igmg');
  const stufen = [
    { Icon: Building2, titel: t('stufe1Titel'), text: t('stufe1Text') },
    { Icon: Users, titel: t('stufe2Titel'), text: t('stufe2Text') },
    { Icon: Target, titel: t('stufe3Titel'), text: t('stufe3Text') },
  ];
  return (
    <div className="flex flex-col gap-6">
      <section aria-labelledby="igmg-zentralverband" className="flex flex-col gap-4 rounded-lg border border-linie bg-weiss p-5 md:p-10">
        <h2 id="igmg-zentralverband" className="text-display-2">
          {t('strukturTitel')}
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex min-w-0 flex-col gap-2">
            <h3 className="text-20 font-bold">{t('praesidium')}</h3>
            <Text feld={inhalt.struktur.praesidium} sprache={sprache} als="p" />
          </div>
          <div className="flex min-w-0 flex-col gap-2">
            <h3 className="text-20 font-bold">{t('ausschuss')}</h3>
            <Text feld={inhalt.struktur.ausschuss} sprache={sprache} als="p" />
          </div>
        </div>
      </section>
      <section aria-labelledby="igmg-orgstruktur" className="flex flex-col gap-4">
        <h2 id="igmg-orgstruktur" className="text-display-2">
          {t('organisationsstrukturTitel')}
        </h2>
        <ol className="grid raster-kacheln gap-4">
          {stufen.map(({ Icon, titel, text }) => (
            <li key={titel} className="flex items-start gap-3.5 rounded-lg border border-linie bg-weiss p-5">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-gruen-50 text-gruen-800">
                <Icon aria-hidden className="size-6" />
              </span>
              <div className="flex min-w-0 flex-col gap-1">
                <h3 className="text-20 font-bold">{titel}</h3>
                <p className="text-16 text-tinte-2">{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
      <section aria-labelledby="igmg-organisationen" className="flex flex-col gap-4">
        <h2 id="igmg-organisationen" className="text-display-2">
          {t('organisationenTitel')}
        </h2>
        <div className="grid raster-kacheln gap-4">
          <OrgCard org="at" />
          <OrgCard org="kt" />
          <OrgCard org="gt" />
          <OrgCard org="kgt" />
        </div>
      </section>
    </div>
  );
}
