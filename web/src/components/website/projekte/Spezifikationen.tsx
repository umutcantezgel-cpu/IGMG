import { Check, House } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Text } from '@/components/website/Text';
import type { Sprache } from '@/lib/i18n/inhalt';
import type { ProjekteInhalt } from '@/lib/validierung/seiteninhalte/projekte';
import { brauchtRueckfall, zahl } from './hilfen';

/** Projektspezifikationen (Design Projects.dc.html D:55–62): Kapazität und Fläche als Kennzahlen, Einrichtungen als Chips. */
export async function Spezifikationen({ inhalt, sprache }: { inhalt: ProjekteInhalt; sprache: Sprache }) {
  const t = await getTranslations('projekte');
  const tAllg = await getTranslations('allgemein');
  const p = inhalt.projekt;
  const rueckfall = brauchtRueckfall(sprache, [p.kapazitaet.einheit, ...p.einrichtungen]);
  return (
    <section aria-labelledby="spezifikationen-titel" className="flex flex-col gap-4 rounded-lg border border-linie bg-weiss p-5 md:p-8">
      <h2 id="spezifikationen-titel" className="flex items-center gap-3 text-30">
        <House aria-hidden className="size-7 shrink-0 text-gruen-700" />
        {t('bezeichnungen.spezifikationen')}
      </h2>
      <dl className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-sand p-4">
          <dt className="text-16 text-tinte-2">{t('bezeichnungen.kapazitaet')}</dt>
          <dd className="text-24 font-bold hyphens-none">
            {p.kapazitaet.wert === null ? (
              t('platzhalter.gemeinde')
            ) : (
              <>
                {zahl(p.kapazitaet.wert, sprache)} <Text feld={p.kapazitaet.einheit} sprache={sprache} />
              </>
            )}
          </dd>
        </div>
        <div className="rounded-lg bg-sand p-4">
          <dt className="text-16 text-tinte-2">{t('bezeichnungen.flaeche')}</dt>
          <dd className="text-24 font-bold hyphens-none">
            {p.flaecheM2 === null ? t('platzhalter.gemeinde') : `${zahl(p.flaecheM2, sprache)} ${t('einheiten.m2')}`}
          </dd>
        </div>
      </dl>
      <div className="flex flex-col gap-2">
        <span className="text-16 font-bold text-tinte-2">{t('bezeichnungen.einrichtungen')}</span>
        {p.einrichtungen.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {p.einrichtungen.map((e, i) => (
              <li key={i} className="inline-flex items-center gap-1.5 rounded-pill bg-gruen-50 px-3 py-1 text-16 font-bold text-gruen-800">
                <Check aria-hidden className="size-4 shrink-0" />
                <Text feld={e} sprache={sprache} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-16 text-tinte-2">{t('platzhalter.gemeinde')}</p>
        )}
      </div>
      {rueckfall ? <p className="text-16 text-tinte-2">{tAllg('nurDeutsch')}</p> : null}
    </section>
  );
}
