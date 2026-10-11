import { Calendar, CircleCheck, Clock, Hammer, Target, type LucideIcon } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Bildplatzhalter } from '@/components/website/Bildplatzhalter';
import { Text, textMitSprache } from '@/components/website/Text';
import type { Sprache } from '@/lib/i18n/inhalt';
import { cn } from '@/lib/utils';
import type { ProjektStatus, ProjekteInhalt } from '@/lib/validierung/seiteninhalte/projekte';
import { brauchtRueckfall } from './hilfen';

const STATUS_STIL: Record<ProjektStatus, { Icon: LucideIcon; klasse: string }> = {
  in_planung: { Icon: Clock, klasse: 'border-warnung bg-warnung-toenung text-warnung' },
  im_bau: { Icon: Hammer, klasse: 'border-info bg-info-toenung text-info' },
  fertiggestellt: { Icon: CircleCheck, klasse: 'border-gruen-700 bg-gruen-50 text-gruen-800' },
};

/**
 * Bauprojekt (Design Projects.dc.html D:22–37): 3D-Platzhalter mit Name und Status, Projektbeschreibung, Beginn und
 * Fertigstellung. Die 3D-Ansicht ist eine beschriftete Fläche, kein 3D-Viewer und keine Bibliothek (Briefing).
 */
export async function Bauprojekt({ inhalt, sprache }: { inhalt: ProjekteInhalt; sprache: Sprache }) {
  const t = await getTranslations('projekte');
  const tAllg = await getTranslations('allgemein');
  const p = inhalt.projekt;
  const name = textMitSprache(p.name, sprache).text;
  const { Icon: StatusIcon, klasse } = STATUS_STIL[p.status];
  const rueckfall = brauchtRueckfall(sprache, [p.name, p.ort, p.beschreibung]);
  return (
    <section aria-labelledby="projekt-beschreibung" className="grid items-stretch gap-8 lg:grid-cols-12 lg:gap-12">
      <div className="relative min-h-70 min-w-0 md:min-h-115 lg:col-span-7">
        <Bildplatzhalter beschriftung={t('3d.text', { name })} className="absolute inset-0 rounded-lg border border-linie pb-32 md:pb-0" />
        <div className="absolute inset-x-4 bottom-4 flex flex-wrap items-center justify-between gap-2">
          <span className="flex flex-col rounded-lg border border-linie bg-weiss px-3.5 py-2 leading-snug">
            <Text feld={p.name} sprache={sprache} als="strong" />
            <Text feld={p.ort} sprache={sprache} className="text-16 text-tinte-2" />
          </span>
          <span className={cn('inline-flex items-center gap-1.5 rounded-pill border px-3 py-0.5 text-16 font-bold', klasse)}>
            <StatusIcon aria-hidden className="size-4 shrink-0" />
            {t(`status.${p.status}`)}
          </span>
        </div>
      </div>
      <div className="flex min-w-0 flex-col justify-center gap-4 lg:col-span-5">
        <h2 id="projekt-beschreibung" className="text-display-2">
          {t('bezeichnungen.beschreibung')}
        </h2>
        <Text feld={p.beschreibung} sprache={sprache} als="p" className="max-w-text text-18 leading-relaxed text-pretty" />
        {rueckfall ? <p className="text-16 text-tinte-2">{tAllg('nurDeutsch')}</p> : null}
        <dl className="grid grid-cols-2 gap-3">
          <Fakt Icon={Calendar} label={t('bezeichnungen.beginn')} wert={p.beginn === null ? t('platzhalter.gemeinde') : String(p.beginn)} />
          <Fakt
            Icon={Target}
            label={t('bezeichnungen.fertigstellung')}
            wert={p.fertigstellung === null ? t('platzhalter.gemeinde') : String(p.fertigstellung)}
          />
        </dl>
      </div>
    </section>
  );
}

/** Kennzahl mit Symbol (Beginn, Fertigstellung): Symbol links, Bezeichnung und Wert rechts. */
function Fakt({ Icon, label, wert }: { Icon: LucideIcon; label: string; wert: string }) {
  return (
    <div className="grid raster-symbol items-start gap-x-3 rounded-lg bg-sand p-4">
      <Icon aria-hidden className="row-span-2 mt-0.5 size-6 shrink-0 text-gruen-700" />
      <dt className="text-16 leading-snug text-tinte-2">{label}</dt>
      <dd className="text-24 font-bold hyphens-none">{wert}</dd>
    </div>
  );
}
