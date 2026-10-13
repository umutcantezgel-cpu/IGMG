import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import { morphStil } from '@/components/website/morph';
import { PageHeader } from '@/components/website/PageHeader';
import { Seitenrahmen } from '@/components/website/Seitenrahmen';
import { Link } from '@/i18n/link';
import type { Locale } from '@/i18n/routing';
import { buchTeilZiel } from '@/lib/hadith/anzeige';
import { text } from '@/lib/i18n/inhalt';
import type { HadithBuch } from '@/server/queries/hadith';
import { BuchBlaettern } from './BuchBlaettern';
import { BuchStern } from './BuchStern';
import { HadithListe } from './HadithListe';
import { QuellenZeile } from './QuellenZeile';
import { TeilNavigation } from './TeilNavigation';

/**
 * Buchseite und Teilseiten von Sahih al-Bukhari (AUFTRAG 3.3): Kopf mit der Buchnummer im Achtstern (Morph-Ziel der
 * Kachel) und dem Titel der Quelle (Englisch), darunter die Hadithe dieses Teils in der Reihenfolge der Quelle.
 * Ab lg begleitet eine schmale Spalte den Lesetext (Umfang, Nummernbereich, Teile, Blättern, Quelle); auf dem Telefon
 * folgt sie der Liste. Lange Bücher stehen in Teilen zu je 100 Hadithen, Teil 1 ist die Buchseite.
 */
export async function BuchAnsicht({ daten }: { daten: HadithBuch }) {
  const sprache = (await getLocale()) as Locale;
  const [t, th] = await Promise.all([getTranslations('hadith.buch'), getTranslations('hadith')]);
  const { buch: b, hadithe, teil, teile } = daten;
  const name = text(daten.sammlung.name, sprache) || th('bukhari.titel');
  const kennung = t('kennung', { nr: b.nr });
  const mitTeilen = teile > 1;
  const ziel = buchTeilZiel(b.nr, teil);
  return (
    <Seitenrahmen
      bereich="islam"
      seite="hadith"
      sprachZiel={ziel}
      pfad={[
        { label: th('breadcrumb'), ziel: '/hadith' },
        { label: name, ziel: '/hadith/bukhari' },
        ...(teil > 1 ? [{ label: kennung, ziel: buchTeilZiel(b.nr, 1) }, { label: t('teil', { teil }) }] : [{ label: kennung }]),
      ]}
    >
      <PageHeader
        oben={
          <Link
            href="/hadith/bukhari"
            className="inline-flex min-h-12 items-center gap-2 self-start font-bold text-gruen-700 underline underline-offset-4"
          >
            <ArrowLeft aria-hidden className="size-5" />
            {t('zurueck')}
          </Link>
        }
        kennung={`${name} · ${mitTeilen ? t('teilKennung', { nr: b.nr, teil, teile }) : kennung}`}
        titel={b.titelEn}
        titelLang="en"
        titelId="buch-titel"
        titelStil={morphStil(`hb-${b.nr}-titel`, 'text')}
        untertitel={mitTeilen ? `${t('untertitel', { anzahl: b.anzahl })} ${t('teilHinweis', { teile })}` : t('untertitel', { anzahl: b.anzahl })}
        zierde={<BuchStern nr={b.nr} art="kopf" stil={morphStil(`hb-${b.nr}-bild`)} />}
      />
      <div className="mx-auto grid max-w-(--container-inhalt) items-start gap-10 px-4 pt-8 pb-abschnitt-klein md:px-8 md:pt-12 lg:grid-cols-3 lg:gap-12">
        <div className="flex min-w-0 flex-col gap-6 lg:col-span-2">
          {hadithe.length ? (
            <HadithListe
              hadithe={hadithe}
              sammlungName={name}
              beschriftung={mitTeilen ? t('listeTeil', { nr: b.nr, teil }) : t('liste', { nr: b.nr })}
            />
          ) : null}
          {teil < teile ? (
            <Link
              href={buchTeilZiel(b.nr, teil + 1)}
              rel="next"
              className="inline-flex min-h-12 items-center gap-2 self-end rounded-md border border-gruen-700 bg-weiss px-4 py-2 font-bold text-gruen-800 no-underline transition duration-(--dauer-rueckmeldung) hover:bg-gruen-50 active:scale-98"
            >
              {t('weiter', { teil: teil + 1 })}
              <ArrowRight aria-hidden className="size-5" />
            </Link>
          ) : null}
        </div>
        {/* Begleitspalte: ab lg mitlaufend neben dem Lesetext, auf dem Telefon nach der Liste */}
        <aside aria-label={t('dieserBand')} className="flex min-w-0 flex-col gap-6 lg:sticky lg:top-8">
          {hadithe.length ? (
            <dl className="grid grid-cols-2 gap-3 rounded-lg border border-linie bg-weiss p-5 shadow-s1">
              <div className="flex flex-col">
                <dt className="text-16 text-tinte-2">{t('umfang')}</dt>
                <dd className="font-bold">{th('bukhari.anzahl', { anzahl: b.anzahl })}</dd>
              </div>
              <div className="flex flex-col">
                <dt className="text-16 text-tinte-2">{t('nummern')}</dt>
                <dd className="font-bold tabular-nums">
                  {hadithe[0].nummer}–{hadithe.at(-1)?.nummer}
                </dd>
              </div>
            </dl>
          ) : null}
          <TeilNavigation buchNr={b.nr} teil={teil} teile={teile} anzahl={b.anzahl} />
          <BuchBlaettern vorher={daten.vorher} naechstes={daten.naechstes} spalte />
          <QuellenZeile />
        </aside>
      </div>
    </Seitenrahmen>
  );
}
