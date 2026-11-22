import { ArrowRight, Banknote } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { textMitSprache } from '@/components/website/Text';
import { Link } from '@/i18n/link';
import type { Sprache } from '@/lib/i18n/inhalt';
import { cn } from '@/lib/utils';
import type { ProjekteInhalt } from '@/lib/validierung/seiteninhalte/projekte';
import { betrag, brauchtRueckfall, fortschritt } from './hilfen';

/**
 * Spenden (Design Projects.dc.html D:40–52, Sprungziel #spenden): Titel und Text aus dem Seiteninhalt, Fortschritt als
 * Fortschrittsbalken (role="progressbar") nur aus gesammeltem Betrag und Ziel, darunter die Bankverbindung. Die Karte
 * steht rechts neben dem Aufruf in „Unterstützen“; #spendenkonto führt zur Bankverbindung.
 * Platzhalter der Gemeinde „[…]“ erscheinen nicht (`src/lib/inhalt/platzhalter.ts`): Ohne Beträge entfällt der Spendenstand;
 * ohne Bankverbindung steht dort ein Satz, dass die Gemeinde sie auf Anfrage nennt, mit dem Weg zur Kontaktseite –
 * keine erfundenen Bankdaten.
 */
export async function Spenden({ inhalt, sprache }: { inhalt: ProjekteInhalt; sprache: Sprache }) {
  const t = await getTranslations('projekte');
  const tAllg = await getTranslations('allgemein');
  const s = inhalt.spende;
  const titel = textMitSprache(s.titel, sprache, { platzhalter: true });
  const text = textMitSprache(s.text, sprache, { platzhalter: true });
  const bank = textMitSprache(s.bankverbindung, sprache, { platzhalter: true });
  const prozent = fortschritt(s.gesammelt, s.ziel);
  const rueckfall = brauchtRueckfall(sprache, [s.titel, s.text, s.bankverbindung]);
  const betragText = s.gesammelt === null || s.ziel === null ? null : `${betrag(s.gesammelt, sprache)} / ${betrag(s.ziel, sprache)}`;
  return (
    <section
      id="spenden"
      aria-labelledby="spenden-titel"
      className="flex scroll-mt-24 flex-col gap-4 rounded-lg border border-linie bg-weiss p-5 text-tinte shadow-s2 md:p-8"
    >
      <h3 id="spenden-titel" className="flex items-center gap-3 font-text text-24 leading-snug font-bold tracking-normal">
        <Banknote aria-hidden className="size-7 shrink-0 text-gruen-700" />
        {titel.text ? <span lang={titel.lang}>{titel.text}</span> : t('spenden.titel')}
      </h3>
      {text.text ? (
        <p lang={text.lang} className="text-pretty">
          {text.text}
        </p>
      ) : null}
      {rueckfall ? <p className="text-16 text-tinte-2">{tAllg('nurDeutsch')}</p> : null}
      {betragText !== null ? (
        <div className="flex flex-col gap-2 rounded-lg bg-sand p-4">
          <div className="flex flex-wrap justify-between gap-2">
            <span className="text-tinte-2">{t('bezeichnungen.gesammelt')}</span>
            <strong>{betragText}</strong>
          </div>
          {prozent !== null ? (
            <>
              <div
                role="progressbar"
                aria-label={t('spenden.fortschritt')}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={prozent}
                aria-valuetext={t('spenden.prozent', { prozent })}
                className="h-3 overflow-hidden rounded-pill border border-rand bg-weiss"
              >
                <span aria-hidden className="block h-full bg-gruen-700" style={{ width: `${prozent}%` }} />
              </div>
              <span className="font-bold text-gruen-800">{t('spenden.prozent', { prozent })}</span>
            </>
          ) : null}
        </div>
      ) : null}
      {/* Mit Bankverbindung der gestrichelte Kasten des Designs; ohne sie ein ruhiger Hinweis auf Sand */}
      <dl
        id="spendenkonto"
        className={cn(
          'flex scroll-mt-24 flex-col gap-1 rounded-lg px-4 py-3 text-16',
          bank.text ? 'border border-dashed border-rand' : 'bg-sand',
        )}
      >
        <dt className="font-bold">{t('bezeichnungen.spendenkonto')}</dt>
        {bank.text ? (
          <dd lang={bank.lang}>{bank.text}</dd>
        ) : (
          <dd className="flex flex-col items-start">
            {t('spenden.aufAnfrage')}
            <Link
              href="/kontakt"
              aria-label={t('linkKontext', { sichtbar: t('unterstuetzen.knopf'), titel: t('bezeichnungen.spendenkonto') })}
              className="inline-flex min-h-12 items-center gap-2 font-bold text-gruen-700 underline underline-offset-4"
            >
              {t('unterstuetzen.knopf')}
              <ArrowRight aria-hidden className="size-5" />
            </Link>
          </dd>
        )}
      </dl>
    </section>
  );
}
