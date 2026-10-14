import { BookOpen, Languages, Link2 } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import type { CSSProperties } from 'react';
import { Achtstern } from '@/components/website/Icons';
import { Link } from '@/i18n/link';
import type { Locale } from '@/i18n/routing';
import { buchTeilZiel, gepruefteUebersetzung, hadithAnker, stelle } from '@/lib/hadith/anzeige';
import type { HadithEintrag } from '@/server/queries/hadith';
import { hadithAbschnitte } from './abschnitte';
import { LinkKopieren } from './LinkKopieren';

/**
 * Lange Bücher (bis über 500 Hadithe) rendern nur, was in Sichtnähe ist: Der Browser überspringt Layout und Malen der
 * übrigen Karten (`content-visibility: auto`) und merkt sich ihre Höhe nach dem ersten Zeichnen (`auto` in
 * `contain-intrinsic-size`). Inline, weil globals.css nicht zu diesem Paket gehört; Schätzwert 26 rem ≈ mittlere Kartenhöhe (Telefon höher, Computer niedriger).
 */
const KARTE_STIL = { contentVisibility: 'auto', containIntrinsicSize: 'auto 26rem' } as CSSProperties;

const LISTE = 'flex flex-col rounded-lg border border-linie bg-weiss shadow-s1';

/**
 * Hadithe als Karten in einer Liste (AUFTRAG 3.3): Bezug „Sahih al-Bukhari n · Buch b, Hadith h“ als Überschrift,
 * arabischer Text unverändert (`lang="ar" dir="rtl"`), geprüfte Übersetzung in der Sprache der Seite, Bewertung nur mit
 * Angabe der Quelle, Anker `#h-<nummer>` und „Link kopieren“ (eine Insel für die ganze Liste; ohne JavaScript springt
 * der Link zum Anker, die Adresse steht dann in der Adresszeile).
 * „Übersetzung in Arbeit“ (Sichtabnahme Runde 2, H-7): Hat kein Hadith der Liste eine geprüfte Übersetzung, steht der
 * Hinweis einmal über der Liste (`role="note"`); nur in gemischten Listen steht er im Fuß der Karten ohne Übersetzung.
 * `gegliedert` (Buchseite, H-6): Abschnitte zu je 10 (`hadithAbschnitte`) mit einer Zwischenmarke „Hadith 8–17“ als
 * Sprungziel `#ab-<nummer>`; die Karten-Überschriften stehen dann eine Ebene tiefer (h3 unter der Marke als h2).
 * `imBuch`: In der Auswahl führt jede Karte zusätzlich zur Stelle im Buch (nur mit freigeschalteter Gesamtsammlung).
 */
export async function HadithListe({
  hadithe,
  sammlungName,
  beschriftung,
  imBuch = false,
  gegliedert = false,
}: {
  hadithe: HadithEintrag[];
  sammlungName: string;
  beschriftung: string;
  imBuch?: boolean;
  /** In Abschnitte zu je 10 gliedern (Buchseite mit Sprungleiste) */
  gegliedert?: boolean;
}) {
  const sprache = (await getLocale()) as Locale;
  const t = await getTranslations('hadith.buch');
  const ta = await getTranslations('hadith.auswahl');
  const uebersetzungen = hadithe.map((h) => gepruefteUebersetzung(h.uebersetzungen, sprache));
  const keineUebersetzung = uebersetzungen.every((ue) => ue === null);
  const abschnitte = gegliedert ? hadithAbschnitte(hadithe.map((h) => h.nummer)) : [];
  const Titel = abschnitte.length ? 'h3' : 'h2';
  const karten = (start: number, ende: number) =>
    hadithe.slice(start, ende).map((h, j) => {
      const anker = hadithAnker(h.nummer);
      const s = stelle(h.buchNr, h.imBuchNr);
      const bezug = `${sammlungName} ${h.nummer}`;
      const ue = uebersetzungen[start + j];
      return (
        <li key={h.nummer} style={KARTE_STIL} className="border-t border-linie first:border-t-0">
          <article
            id={anker}
            aria-labelledby={`${anker}-t`}
            className="flex scroll-mt-4 flex-col gap-4 px-4 py-6 target:bg-gruen-50 md:px-8 md:py-8"
          >
            <Titel id={`${anker}-t`} className="font-text text-18 leading-snug font-bold tracking-normal text-gruen-800">
              {bezug}{' '}
              <span className="font-normal text-tinte-2">
                · {s.hadith === null ? t('stelleBuch', { buch: s.buch }) : t('stelle', { buch: s.buch, hadith: s.hadith })}
              </span>
            </Titel>
            <p lang="ar" dir="rtl" className="text-24 leading-loose text-pretty md:text-30 md:leading-loose">
              {h.textAr}
            </p>
            {ue ? (
              <div className="flex max-w-text flex-col gap-1 border-s-2 border-gruen-700 ps-4">
                <p lang={sprache} className="text-18 leading-einleitung">
                  {ue.text}
                </p>
                <p className="text-16 text-tinte-2">{t('uebersetzungVon', { uebersetzer: ue.uebersetzer })}</p>
              </div>
            ) : null}
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
              <p className="flex flex-wrap gap-x-3 text-16 text-tinte-2">
                {ue || keineUebersetzung ? null : <span>{t('uebersetzungInArbeit')}</span>}
                {h.bewertung ? (
                  <span>{t('bewertung', { bewertung: h.bewertetVon ? `${h.bewertung} (${h.bewertetVon})` : h.bewertung })}</span>
                ) : null}
              </p>
              <span className="flex flex-wrap gap-x-4">
                {imBuch ? (
                  <Link
                    href={buchTeilZiel(h.buchNr, h.teil, anker)}
                    aria-label={`${ta('imBuch')}: ${bezug}`}
                    className="inline-flex min-h-12 items-center gap-2 text-16 font-bold text-gruen-800"
                  >
                    <BookOpen aria-hidden className="size-4" />
                    {ta('imBuch')}
                  </Link>
                ) : null}
                <a
                  href={`#${anker}`}
                  data-hadith-link={bezug}
                  aria-label={`${t('linkKopieren')}: ${bezug}`}
                  className="inline-flex min-h-12 items-center gap-2 text-16 font-bold text-gruen-800"
                >
                  <Link2 aria-hidden className="size-4" />
                  {t('linkKopieren')}
                </a>
              </span>
            </div>
          </article>
        </li>
      );
    });
  return (
    <>
      {keineUebersetzung && hadithe.length ? (
        <div role="note" className="flex gap-3 rounded-lg border border-linie bg-weiss px-4 py-3 text-16 shadow-s1 md:px-5">
          <Languages aria-hidden className="mt-0.5 size-5 shrink-0 text-gruen-700" />
          <p className="flex flex-col">
            <span className="font-bold">{t('uebersetzungInArbeit')}</span>
            <span className="text-tinte-2">{t('uebersetzungHinweis')}</span>
          </p>
        </div>
      ) : null}
      {abschnitte.length ? (
        <div className="flex flex-col gap-8">
          {abschnitte.map((a) => (
            <div key={a.anker} id={a.anker} className="flex scroll-mt-4 flex-col gap-3">
              {/* Zwischenmarke: Achtstern, Nummernbereich und eine feine Linie bis zum Rand */}
              <h2 id={`${a.anker}-t`} className="flex items-center gap-3 font-text text-18 leading-snug font-bold tracking-normal">
                <Achtstern aria-hidden className="size-5 shrink-0 text-gruen-700" />
                <span className="tabular-nums">{t('abschnitt', { von: a.von, bis: a.bis })}</span>
                <span aria-hidden className="flex-1 border-t border-linie" />
              </h2>
              <ol aria-labelledby={`${a.anker}-t`} className={LISTE}>
                {karten(a.start, a.ende)}
              </ol>
            </div>
          ))}
        </div>
      ) : (
        <ol aria-label={beschriftung} className={LISTE}>
          {karten(0, hadithe.length)}
        </ol>
      )}
      <LinkKopieren texte={{ kopiert: t('kopiert'), fehler: t('kopierenFehler') }} />
    </>
  );
}
