import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import { morphStil } from '@/components/website/morph';
import { NachOben } from '@/components/website/NachOben';
import { PageHeader } from '@/components/website/PageHeader';
import { Seitenrahmen } from '@/components/website/Seitenrahmen';
import { Link } from '@/i18n/link';
import type { Locale } from '@/i18n/routing';
import { buchTeilZiel } from '@/lib/hadith/anzeige';
import { text } from '@/lib/i18n/inhalt';
import type { HadithBuch } from '@/server/queries/hadith';
import { hadithAbschnitte, type HadithAbschnitt } from './abschnitte';
import { BuchBlaettern } from './BuchBlaettern';
import { BuchStern } from './BuchStern';
import { HadithListe } from './HadithListe';
import { QuellenZeile } from './QuellenZeile';
import { TeilNavigation } from './TeilNavigation';

/**
 * Buchseite und Teilseiten von Sahih al-Bukhari (AUFTRAG 3.3): Kopf mit Rückweg, Kennung, dem Hinweis auf den Titel der
 * Quelle (Englisch) und dem Titel in einer Zeile mit der Buchnummer im Achtstern (Morph-Ziel der Kachel; Sichtabnahme
 * H-3, H-4), darunter die Hadithe dieses Teils in der Reihenfolge der Quelle. Ab lg begleitet eine mitlaufende Spalte
 * den Lesetext (Umfang, Nummernbereich, Teile, Blättern, Quelle); bis lg steht unter dem Kopf eine kompakte Leiste mit
 * Umfang, Nummern und dem Weg weiter, die Spalte folgt der Liste (H-2). Auf langen Strecken führt „Nach oben“ zurück.
 * Lange Bücher stehen in Teilen zu je 100 Hadithen, Teil 1 ist die Buchseite. Sichtabnahme Runde 2: Die Gebetsleiste
 * steht als eine Zeile (X-8); die Liste ist in Abschnitte zu je 10 gegliedert, die Sprungleiste führt zu ihnen – bis lg
 * in der kompakten Leiste unter dem Kopf, ab lg in der mitlaufenden Spalte (H-6).
 */
export async function BuchAnsicht({ daten }: { daten: HadithBuch }) {
  const sprache = (await getLocale()) as Locale;
  const [t, th] = await Promise.all([getTranslations('hadith.buch'), getTranslations('hadith')]);
  const { buch: b, hadithe, teil, teile } = daten;
  const name = text(daten.sammlung.name, sprache) || th('bukhari.titel');
  const kennung = t('kennung', { nr: b.nr });
  const mitTeilen = teile > 1;
  const ziel = buchTeilZiel(b.nr, teil);
  const abschnitte = hadithAbschnitte(hadithe.map((h) => h.nummer));
  const sprung = abschnitte.length ? (
    <Sprungleiste abschnitte={abschnitte} titel={t('sprungTitel')} linkText={(a) => t('abschnitt', { von: a.von, bis: a.bis })} />
  ) : null;
  // Weg weiter für die kompakte Leiste: erst der nächste Teil dieses Buchs, sonst das nächste Buch
  const weiter =
    teil < teile
      ? { href: buchTeilZiel(b.nr, teil + 1), text: t('weiter', { teil: teil + 1 }) }
      : daten.naechstes
        ? { href: { pathname: '/hadith/bukhari/[buch]' as const, params: { buch: String(daten.naechstes.nr) } }, text: t('naechstes') }
        : null;
  return (
    <Seitenrahmen
      bereich="islam"
      seite="hadith"
      sprachZiel={ziel}
      kompakteLeiste
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
        titelHinweis={t('titelHinweis')}
        titel={b.titelEn}
        titelLang="en"
        titelId="buch-titel"
        titelStil={morphStil(`hb-${b.nr}-titel`, 'text')}
        titelZeichen={<BuchStern nr={b.nr} art="kopf" stil={morphStil(`hb-${b.nr}-bild`)} />}
        untertitel={
          mitTeilen
            ? `${t('untertitelKurz', { anzahl: b.anzahl })} ${t('teilHinweis', { teile })}`
            : t('untertitelKurz', { anzahl: b.anzahl })
        }
      />
      <div className="mx-auto grid max-w-(--container-inhalt) items-start gap-10 px-4 pt-8 pb-abschnitt-klein md:px-8 md:pt-12 lg:grid-cols-3 lg:gap-12">
        <div className="flex min-w-0 flex-col gap-6 lg:col-span-2">
          {/* Bis lg: Umfang, Nummern und der Weg weiter gleich unter dem Kopf (die Spalte folgt erst nach der Liste) */}
          {hadithe.length ? (
            <div className="flex flex-col rounded-lg border border-linie bg-weiss shadow-s1 lg:hidden">
              <div className="flex min-h-14 flex-wrap items-center justify-between gap-x-3 py-1 ps-4 pe-1">
                <p className="text-16">
                  <span className="font-bold">{th('bukhari.anzahl', { anzahl: b.anzahl })}</span>
                  <span aria-hidden className="text-tinte-2">
                    {' · '}
                  </span>
                  <span className="text-tinte-2 tabular-nums">
                    {t('leisteNummern', { von: hadithe[0].nummer, bis: hadithe.at(-1)?.nummer ?? hadithe[0].nummer })}
                  </span>
                </p>
                {weiter ? (
                  <Link
                    href={weiter.href}
                    className="ms-auto inline-flex min-h-12 items-center gap-2 rounded-md px-2 font-bold text-gruen-800 no-underline transition duration-(--dauer-rueckmeldung) hover:bg-gruen-50 hover:text-gruen-800 active:scale-98"
                  >
                    {weiter.text}
                    <ArrowRight aria-hidden className="size-5" />
                  </Link>
                ) : null}
              </div>
              {sprung ? <div className="border-t border-linie px-3 pt-3 pb-3 md:px-4">{sprung}</div> : null}
            </div>
          ) : null}
          {hadithe.length ? (
            <HadithListe
              hadithe={hadithe}
              sammlungName={name}
              beschriftung={mitTeilen ? t('listeTeil', { nr: b.nr, teil }) : t('liste', { nr: b.nr })}
              gegliedert
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
          {sprung ? <div className="max-lg:hidden">{sprung}</div> : null}
          <TeilNavigation buchNr={b.nr} teil={teil} teile={teile} anzahl={b.anzahl} />
          <BuchBlaettern vorher={daten.vorher} naechstes={daten.naechstes} spalte />
          <QuellenZeile />
        </aside>
      </div>
      <NachOben text={t('nachOben')} />
    </Seitenrahmen>
  );
}

/**
 * Sprungleiste zu den Abschnitten der Liste (H-6): ein Link je Abschnitt mit dem Nummernbereich, ohne JavaScript ein
 * Sprung zum Anker `#ab-<nummer>`. Kurze Bereiche („48–58“) stehen zu fünft in einer Zeile, längere zu dritt – so bricht
 * keine Beschriftung um und die Leiste wird nie zum Wischstreifen. Ziele 48 px hoch (K-009).
 */
function Sprungleiste({
  abschnitte,
  titel,
  linkText,
}: {
  abschnitte: HadithAbschnitt[];
  titel: string;
  linkText: (a: HadithAbschnitt) => string;
}) {
  const kurz = abschnitte.every((a) => `${a.von}–${a.bis}`.length <= 5);
  return (
    <nav aria-label={titel} className="@container flex flex-col gap-2">
      <h2 className="font-text text-16 leading-snug font-bold tracking-normal text-tinte-2 lg:text-18 lg:text-tinte">{titel}</h2>
      {/* Fünf Pillen erst ab 20rem Breite (Container): darunter und in schmalen Spalten (lg 1024–1130 px) drei – nie zweizeilig */}
      <ul className={kurz ? 'grid grid-cols-3 gap-2 @xs:grid-cols-5' : 'grid grid-cols-3 gap-2'}>
        {abschnitte.map((a) => (
          <li key={a.anker} className="flex">
            <a
              href={`#${a.anker}`}
              aria-label={linkText(a)}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-pill border border-linie bg-weiss px-1 text-16 font-bold whitespace-nowrap text-gruen-800 tabular-nums no-underline transition duration-(--dauer-rueckmeldung) hover:border-gruen-700 hover:bg-gruen-50 hover:text-gruen-800 active:scale-98"
            >
              {a.von}–{a.bis}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
