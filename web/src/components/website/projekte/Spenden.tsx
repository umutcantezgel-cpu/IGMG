import { Banknote } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Text } from '@/components/website/Text';
import type { Sprache } from '@/lib/i18n/inhalt';
import type { ProjekteInhalt } from '@/lib/validierung/seiteninhalte/projekte';
import { betrag, brauchtRueckfall, fortschritt } from './hilfen';

/**
 * Spenden (Design Projects.dc.html D:40–52, Sprungziel #spenden): Titel und Text aus dem Seiteninhalt, Fortschritt als
 * Fortschrittsbalken (role="progressbar") nur aus gesammeltem Betrag und Ziel, Bankverbindung als Platzhalter. Die Karte
 * steht rechts neben dem Aufruf in „Unterstützen“; #spendenkonto führt zur Bankverbindung. Ohne Beträge zeigt die Seite
 * Platzhalter und keinen Prozentwert.
 */
export async function Spenden({ inhalt, sprache }: { inhalt: ProjekteInhalt; sprache: Sprache }) {
  const t = await getTranslations('projekte');
  const tAllg = await getTranslations('allgemein');
  const s = inhalt.spende;
  const prozent = fortschritt(s.gesammelt, s.ziel);
  const rueckfall = brauchtRueckfall(sprache, [s.titel, s.text, s.bankverbindung]);
  const betragText =
    s.gesammelt === null || s.ziel === null ? t('platzhalter.gemeinde') : `${betrag(s.gesammelt, sprache)} / ${betrag(s.ziel, sprache)}`;
  const standText = prozent === null ? t('platzhalter.gemeinde') : t('spenden.prozent', { prozent });
  return (
    <section
      id="spenden"
      aria-labelledby="spenden-titel"
      className="flex scroll-mt-24 flex-col gap-4 rounded-lg bg-weiss p-5 text-tinte shadow-s2 md:p-8"
    >
      <h3 id="spenden-titel" className="flex items-center gap-3 font-text text-24 leading-snug font-bold tracking-normal">
        <Banknote aria-hidden className="size-7 shrink-0 text-gruen-700" />
        <Text feld={s.titel} sprache={sprache} />
      </h3>
      <Text feld={s.text} sprache={sprache} als="p" className="text-pretty" />
      {rueckfall ? <p className="text-16 text-tinte-2">{tAllg('nurDeutsch')}</p> : null}
      <div className="flex flex-col gap-2 rounded-lg bg-sand p-4">
        <div className="flex flex-wrap justify-between gap-2">
          <span className="text-tinte-2">{t('bezeichnungen.gesammelt')}</span>
          <strong>{betragText}</strong>
        </div>
        <div
          role="progressbar"
          aria-label={t('spenden.fortschritt')}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={prozent ?? undefined}
          aria-valuetext={standText}
          className="h-3 overflow-hidden rounded-pill border border-rand bg-weiss"
        >
          <span aria-hidden className="block h-full bg-gruen-700" style={{ width: `${prozent ?? 0}%` }} />
        </div>
        <span className="font-bold text-gruen-800">{standText}</span>
      </div>
      <dl id="spendenkonto" className="flex scroll-mt-24 flex-col gap-1 rounded-lg border border-dashed border-rand px-4 py-3 text-16">
        <dt className="font-bold">{t('bezeichnungen.spendenkonto')}</dt>
        <dd>
          <Text feld={s.bankverbindung} sprache={sprache} />
        </dd>
      </dl>
    </section>
  );
}
