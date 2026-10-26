import { ExternalLink, Info } from 'lucide-react';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { getLocale, getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/website/PageHeader';
import { Abschnitt, Rechtsgliederung } from '@/components/website/rechtliches/Rechtstext';
import { Seitenrahmen } from '@/components/website/Seitenrahmen';
import { freigegebeneStimme } from '@/lib/lernapp/audio/stimmen';
import { SPRACHEN } from '@/lib/lernapp/kurse';
import { LIZENZTEXTE } from '@/lib/lernapp/lizenztexte';
import { metadatenFuer } from '@/lib/seo/metadaten';
import { ABSCHNITTE, BIBLIOTHEKEN, type QuellenEintrag } from './verzeichnis';

export const ensureStatic = 'navigation';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('quellen');
  return metadatenFuer({ pfad: '/quellen', titel: t('titel'), beschreibung: t('untertitel') });
}

/** Links in der Begriffsliste: Klickziel 48 px (K-11), der Rand ragt in den Zeilenabstand, damit Text und Bezeichnung fluchten. */
const LINK = 'inline-flex min-h-12 items-center gap-1.5 font-bold wrap-anywhere';
const LINK_IN_ZEILE = `${LINK} -my-2.5`;

/** Ein Eintrag mit Anker: Name als Überschrift, Angaben als Begriffsliste (Urheber, Lizenz, Fassung, Herkunft, …). */
async function Eintrag({ e }: { e: QuellenEintrag }) {
  const t = await getTranslations('quellen');
  const zeilen: { label: string; wert: ReactNode }[] = [
    { label: t('felder.urheber'), wert: e.urheber },
    {
      label: t('felder.lizenz'),
      wert: e.lizenz ? (
        <a href={e.lizenz.url} className={LINK_IN_ZEILE}>
          {e.lizenz.name}
        </a>
      ) : (
        t(`eintraege.${e.id}.lizenz`)
      ),
    },
    { label: t('felder.fassung'), wert: t(`eintraege.${e.id}.fassung`) },
    ...(e.herkunft
      ? [
          {
            label: t('felder.herkunft'),
            wert: (
              <a href={e.herkunft.url} className={LINK_IN_ZEILE}>
                {e.herkunft.name}
              </a>
            ),
          },
        ]
      : []),
    ...(e.drittlizenzen
      ? [
          {
            label: t('felder.drittlizenzen'),
            wert: (
              <a href={e.drittlizenzen.url} lang="en" className={LINK_IN_ZEILE}>
                {e.drittlizenzen.name}
              </a>
            ),
          },
        ]
      : []),
    { label: t('felder.verwendung'), wert: t(`eintraege.${e.id}.verwendung`) },
    ...(e.aenderungen ? [{ label: t('felder.aenderungen'), wert: t(`eintraege.${e.id}.aenderungen`) }] : []),
    ...(e.namensnennung
      ? [
          {
            label: t('felder.namensnennung'),
            wert: (
              <span lang="de" className="wrap-anywhere">
                {e.namensnennung}
              </span>
            ),
          },
        ]
      : []),
  ];
  return (
    <article id={e.id} aria-labelledby={`${e.id}-titel`} className="flex scroll-mt-24 flex-col gap-3 border-t border-linie pt-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4">
        <h3 id={`${e.id}-titel`} className="font-text text-20 font-bold tracking-normal">
          {e.name}
        </h3>
        <a href={e.url} aria-label={`${t('felder.projekt')}: ${e.name}`} className={`${LINK} text-16`}>
          {t('felder.projekt')}
          <ExternalLink aria-hidden className="size-4" />
        </a>
      </div>
      <dl className="flex flex-col">
        {zeilen.map((z) => (
          <div key={z.label} className="grid gap-x-4 gap-y-0.5 py-1.5 md:grid-cols-4">
            <dt className="text-16 font-bold text-tinte-2 md:pt-0.5">{z.label}</dt>
            <dd className="max-w-(--container-text) text-pretty md:col-span-3">{z.wert}</dd>
          </div>
        ))}
      </dl>
      {e.hinweis ? (
        <p className="flex gap-2.5 rounded-md bg-info-toenung px-4 py-3 text-16 text-tinte">
          <Info aria-hidden className="mt-0.5 size-5 shrink-0 text-info" />
          <span>{t(`eintraege.${e.id}.hinweis`)}</span>
        </p>
      ) : null}
    </article>
  );
}

/**
 * Quellen und Lizenzen (AUFTRAG 5, ADR 0025): jede übernommene Datenquelle, Schrift und die wichtigsten Bibliotheken mit
 * Urheber, Lizenz, Fassung, Verwendung und Änderungen; jeder Abschnitt und jeder Eintrag hat einen Anker
 * (z. B. /quellen#hadith). Belege in web/daten/<quelle>/QUELLE.md. Statisch. Lern-App (L8-03, ADR 0045 Nr. 15): Sprachdaten
 * mit Namensnennung, Bildkarten, Spracherkennung mit den Drittlizenzen von ONNX Runtime (Volltext vom eigenen Ursprung).
 * Sprachausgabe: vorgesehene Stimmen mit Herkunftskette; Sprachen ohne freigegebene Stimme aus `audio/stimmen.ts` (Stufe C).
 * Schriften mit dem OFL-Volltext, Bibliotheken samt libvips hinter sharp (Stufe C, Z-L17).
 */
export default async function QuellenSeite() {
  const t = await getTranslations('quellen');
  // Sprachen der Lern-App ohne freigegebene Stimme (keine Stimme oder Hörabnahme LM-06 offen): dort „Audio folgt“ (Z-L21)
  const ohneStimme = SPRACHEN.filter((x) => !freigegebeneStimme(x));
  const aufzaehlung = new Intl.ListFormat(await getLocale(), { type: 'conjunction' });
  const punkte = [...ABSCHNITTE.map((a) => a.id), 'bibliotheken'].map((id) => ({ id, titel: t(`abschnitte.${id}`) }));
  return (
    <Seitenrahmen bereich="keiner" seite="quellen" sprachZiel="/quellen" pfad={[{ label: t('titel') }]}>
      <PageHeader kennung={t('kennung')} titel={t('titel')} untertitel={t('untertitel')} />
      <Rechtsgliederung
        titel={t('inhaltsverzeichnis')}
        punkte={punkte}
        entwurf={
          <div role="note" className="flex gap-3 rounded-lg border border-linie bg-weiss p-5">
            <Info aria-hidden className="mt-0.5 size-6 shrink-0 text-gruen-700" />
            <div className="flex flex-col gap-1">
              <p className="font-bold">{t('standTitel')}</p>
              <p className="text-pretty text-tinte-2">{t('standText')}</p>
            </div>
          </div>
        }
      >
        {ABSCHNITTE.map((a) => (
          <Abschnitt key={a.id} id={a.id} titel={t(`abschnitte.${a.id}`)}>
            <p className="max-w-(--container-text) text-pretty text-tinte-2">{t(`einleitung.${a.id}`)}</p>
            {a.zusatz === 'uebersetzungsbedingungen' ? (
              <div className="flex flex-col gap-2 rounded-md bg-sand p-4">
                <h3 className="font-text text-18 font-bold tracking-normal">{t('uebersetzungsbedingungen.titel')}</h3>
                <p className="text-pretty">{t('uebersetzungsbedingungen.text')}</p>
                <figure className="flex flex-col gap-1">
                  <figcaption className="text-16 text-tinte-2">{t('uebersetzungsbedingungen.wortlaut')}</figcaption>
                  <blockquote lang="en" className="border-s-2 border-gruen-700 ps-3 text-16 italic">
                    {t('uebersetzungsbedingungen.zitat')}
                  </blockquote>
                </figure>
              </div>
            ) : null}
            {a.zusatz === 'stimmen' && ohneStimme.length ? (
              <p className="max-w-(--container-text) text-pretty text-tinte-2">
                {t('stimmen.ohneFreigabe', { sprachen: aufzaehlung.format(ohneStimme.map((x) => t(`stimmen.sprachen.${x}`))) })}
              </p>
            ) : null}
            {a.eintraege.map((e) => (
              <Eintrag key={e.id} e={e} />
            ))}
            {a.zusatz === 'ofl' ? (
              <details className="rounded-md border border-linie bg-weiss">
                <summary className="flex min-h-12 cursor-pointer items-center px-4 py-3 font-bold">{t('ofl.titel')}</summary>
                <pre lang="en" dir="ltr" className="overflow-x-auto px-4 pb-4 font-text text-16 whitespace-pre-wrap">
                  {LIZENZTEXTE['OFL-1.1']}
                </pre>
              </details>
            ) : null}
          </Abschnitt>
        ))}
        <Abschnitt id="bibliotheken" titel={t('abschnitte.bibliotheken')}>
          <p className="max-w-(--container-text) text-pretty text-tinte-2">{t('einleitung.bibliotheken')}</p>
          <ul className="grid gap-x-6 md:grid-cols-2">
            {BIBLIOTHEKEN.map((b) => (
              <li key={b.id} className="flex flex-wrap items-center justify-between gap-x-3 border-t border-linie py-2">
                <span className="flex min-w-0 flex-col">
                  <a href={b.url} className="inline-flex min-h-12 items-center font-bold">
                    {b.name}
                  </a>
                  <span className="text-16 text-tinte-2">{t(`bibliotheken.zwecke.${b.id}`)}</span>
                </span>
                <a
                  href={b.lizenz.url}
                  aria-label={`${t('bibliotheken.lizenz')} ${b.name}: ${b.lizenz.name}`}
                  className="inline-flex min-h-12 items-center"
                >
                  <span className="rounded-pill border border-linie bg-sand px-3 py-0.5 text-16 font-bold text-tinte-2">
                    {b.lizenz.name}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </Abschnitt>
      </Rechtsgliederung>
    </Seitenrahmen>
  );
}
