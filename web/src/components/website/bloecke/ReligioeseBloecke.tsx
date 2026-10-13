import { ArrowRight, BookOpenText, Quote } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/link';
import type { Sprache } from '@/lib/i18n/inhalt';
import type { BlockVon } from '@/lib/validierung/bloecke';
import { ladeHadith, ladeVerse } from '@/server/queries/bloecke';
import { BlockRahmen } from './hilfen';

/**
 * Verweis-Bausteine „Koranvers“ und „Hadith“ (ADR 0030): Der arabische Text kommt unverändert aus der importierten
 * Quelle (lang="ar", dir="rtl"), eine Übersetzung nur, wenn sie freigegeben ist – mit Angabe der Übersetzung. Fehlt
 * etwas, steht ein ehrlicher Hinweis statt eines erfundenen Texts.
 */
const KARTE = 'flex flex-col gap-5 rounded-lg border border-linie bg-weiss p-6 shadow-s1 md:p-8';
const ARABISCH = 'font-arabic text-30 leading-loose text-tinte md:text-36 md:leading-loose';

export async function VersAnsicht({ b, sprache }: { b: BlockVon<'vers'>; sprache: Sprache }) {
  const [t, daten] = await Promise.all([getTranslations({ locale: sprache, namespace: 'bloecke' }), ladeVerse(b.sure, b.von, b.bis)]);
  const stelle =
    b.von === b.bis ? t('versStelle', { sure: b.sure, vers: b.von }) : t('verseStelle', { sure: b.sure, von: b.von, bis: b.bis });
  if (!daten)
    return (
      <BlockRahmen>
        <div className={KARTE}>
          <p className="flex items-center gap-2 font-bold text-gruen-800">
            <BookOpenText aria-hidden className="size-5" />
            {stelle}
          </p>
          <p className="text-18 text-tinte-2">{t('versFehlt')}</p>
        </div>
      </BlockRahmen>
    );
  const name = daten.name?.[sprache] || daten.nameUmschrift || '';
  const uebersetzung = b.uebersetzung ? daten.uebersetzungen[sprache] : undefined;
  const id = `b-${b.id}`;
  return (
    <BlockRahmen beschriftung={id}>
      <figure className={KARTE}>
        <figcaption className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <span id={id} className="flex items-center gap-2 font-bold text-gruen-800">
            <BookOpenText aria-hidden className="size-5 shrink-0" />
            {name ? t('sureName', { name }) : null} {stelle}
          </span>
          <Link
            href={{ pathname: '/quran/[sure]', params: { sure: String(b.sure) } }}
            className="inline-flex min-h-12 items-center gap-1 text-16 font-bold text-gruen-700 underline underline-offset-4"
          >
            {t('imKoranLesen')}
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        </figcaption>
        <blockquote lang="ar" dir="rtl" className={ARABISCH}>
          {daten.verse.map((v) => (
            <span key={v.nr}>
              {v.textAr}{' '}
              <span
                lang={sprache}
                dir="ltr"
                className="inline-flex size-8 items-center justify-center rounded-pill border border-linie align-middle font-text text-16 font-bold text-gruen-800 tabular-nums"
              >
                {v.nr}
              </span>{' '}
            </span>
          ))}
        </blockquote>
        {uebersetzung ? (
          <div className="flex flex-col gap-2 border-t border-linie pt-4">
            <p className="text-18 text-pretty">
              {uebersetzung.verse.map((v) => (
                <span key={v.nr}>
                  <sup className="font-bold text-gruen-800">{v.nr}</sup> {v.text}{' '}
                </span>
              ))}
            </p>
            <p className="text-16 text-tinte-2">{t('uebersetzungVon', { name: uebersetzung.uebersetzer, titel: uebersetzung.titel })}</p>
          </div>
        ) : b.uebersetzung ? (
          <p className="border-t border-linie pt-4 text-16 text-tinte-2">{t('uebersetzungFolgt')}</p>
        ) : null}
      </figure>
    </BlockRahmen>
  );
}

export async function HadithAnsicht({ b, sprache }: { b: BlockVon<'hadith'>; sprache: Sprache }) {
  const [t, daten] = await Promise.all([getTranslations({ locale: sprache, namespace: 'bloecke' }), ladeHadith(b.sammlung, b.nummer)]);
  const sammlung = daten ? daten.sammlungName[sprache] || daten.sammlungName.de : t(`sammlung.${b.sammlung}`);
  const bezug = t('hadithBezug', { sammlung, nummer: b.nummer });
  const uebersetzung = daten?.uebersetzungen[sprache];
  const id = `b-${b.id}`;
  return (
    <BlockRahmen beschriftung={id}>
      <figure className={KARTE}>
        <figcaption id={id} className="flex items-center gap-2 font-bold text-gruen-800">
          <Quote aria-hidden className="size-5 shrink-0" />
          {bezug}
        </figcaption>
        {daten?.textAr ? (
          <blockquote lang="ar" dir="rtl" className={ARABISCH}>
            {daten.textAr}
          </blockquote>
        ) : null}
        {uebersetzung ? (
          <div className="flex flex-col gap-2 border-t border-linie pt-4">
            <p className="text-18 text-pretty">{uebersetzung.text}</p>
            <p className="text-16 text-tinte-2">{t('hadithUebersetzungVon', { name: uebersetzung.uebersetzer })}</p>
          </div>
        ) : (
          <p className={daten?.textAr ? 'border-t border-linie pt-4 text-16 text-tinte-2' : 'text-18 text-tinte-2'}>
            {daten?.textAr ? t('uebersetzungFolgt') : t('hadithFolgt')}
          </p>
        )}
      </figure>
    </BlockRahmen>
  );
}
