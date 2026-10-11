import { Banknote, Heart } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Text, textMitSprache } from '@/components/website/Text';
import { Link } from '@/i18n/link';
import type { Sprache } from '@/lib/i18n/inhalt';
import type { ProjekteInhalt } from '@/lib/validierung/seiteninhalte/projekte';
import { betrag, brauchtRueckfall, fortschritt } from './hilfen';

/**
 * Spenden (Design Projects.dc.html D:40–52, Sprungziel #spenden): Titel und Text aus dem Seiteninhalt, Fortschritt als
 * Fortschrittsbalken (role="progressbar") nur aus gesammeltem Betrag und Ziel, Bankverbindung als Platzhalter, zwei
 * Schaltflächen. Ohne Beträge zeigt die Seite Platzhalter und keinen Prozentwert.
 */
export async function Spenden({ inhalt, sprache }: { inhalt: ProjekteInhalt; sprache: Sprache }) {
  const t = await getTranslations('projekte');
  const tAllg = await getTranslations('allgemein');
  const s = inhalt.spende;
  const titel = textMitSprache(s.titel, sprache).text;
  const prozent = fortschritt(s.gesammelt, s.ziel);
  const rueckfall = brauchtRueckfall(sprache, [s.titel, s.text, s.bankverbindung]);
  const betragText =
    s.gesammelt === null || s.ziel === null ? t('platzhalter.gemeinde') : `${betrag(s.gesammelt, sprache)} / ${betrag(s.ziel, sprache)}`;
  const standText = prozent === null ? t('platzhalter.gemeinde') : t('spenden.prozent', { prozent });
  return (
    <section
      id="spenden"
      aria-labelledby="spenden-titel"
      className="flex scroll-mt-24 flex-col gap-4 rounded-lg border-2 border-gruen-700 bg-weiss p-5 md:p-8"
    >
      <h2 id="spenden-titel" className="flex items-center gap-3 text-30">
        <Banknote aria-hidden className="size-7 shrink-0 text-gruen-700" />
        <Text feld={s.titel} sprache={sprache} />
      </h2>
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
      <dl className="flex flex-col gap-1 rounded-lg border border-dashed border-rand px-4 py-3 text-16">
        <dt className="font-bold">{t('bezeichnungen.spendenkonto')}</dt>
        <dd>
          <Text feld={s.bankverbindung} sprache={sprache} />
        </dd>
      </dl>
      <div className="flex flex-wrap gap-3">
        <Link
          href={{ pathname: '/projekte', hash: 'spenden' }}
          aria-label={t('linkKontext', { sichtbar: t('spenden.jetzt'), titel })}
          className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-gruen-700 px-6 font-bold text-weiss no-underline hover:bg-gruen-800"
        >
          <Heart aria-hidden className="size-5 shrink-0" />
          {t('spenden.jetzt')}
        </Link>
        <Link
          href={{ pathname: '/projekte', hash: 'meilensteine' }}
          aria-label={t('linkKontext', { sichtbar: t('spenden.mehr'), titel: t('bezeichnungen.meilensteine') })}
          className="inline-flex min-h-12 items-center rounded-lg border-2 border-gruen-700 bg-weiss px-6 font-bold text-gruen-800 no-underline hover:bg-gruen-50"
        >
          {t('spenden.mehr')}
        </Link>
      </div>
    </section>
  );
}
