import { ExternalLink } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Stern8 } from '@/components/website/Icons';
import type { Locale } from '@/i18n/routing';
import { datumAnzeige, linkFuer, neuesteHutba } from '@/lib/dachverband/auswahl';
import { netzwerkZiel } from '@/lib/dachverband/netzwerk';
import { waehle } from '@/lib/i18n/inhalt';
import { cn } from '@/lib/utils';
import type { DachverbandEintrag } from '@/lib/validierung/seiteninhalte/dachverband';
import { heuteBerlin } from '@/lib/zeit/heute';
import { ladeSeiteninhalt } from '@/server/queries/seiteninhalte';
import { EXTERN_LINK, sprachHinweis } from './DachverbandKarte';

/**
 * Karte „Freitagspredigt vom {Datum}“ (Plan Marktstart P3, E-044 Nr. 2): Die Überschrift ist immer datiert, nie „der
 * Woche“ – im Beispielmodus friert die Seite auf dem Stand des Baus ein. Gezeigt werden nur Titel, Datum und Links zur
 * Predigt und zur Übersicht aller Predigten bei der IGMG; kein Auszug, kein Zitat (G-06), keine Anfrage beim Aufruf
 * (K-14). Server-Komponente ohne Client-JavaScript (K-12).
 */
export async function HutbaKarte({
  eintrag,
  sprache,
  stufe = 'h3',
  id = 'hutba-titel',
  className,
}: {
  eintrag: DachverbandEintrag;
  sprache: Locale;
  stufe?: 'h2' | 'h3';
  id?: string;
  className?: string;
}) {
  const t = await getTranslations('dachverband');
  const texte = { aufDeutsch: t('aufDeutsch'), aufTuerkisch: t('aufTuerkisch') };
  const titel = waehle(eintrag.titel, sprache);
  const predigt = linkFuer(eintrag, sprache);
  const alle = netzwerkZiel('freitagspredigt', sprache);
  const predigtHinweis = sprachHinweis(texte, predigt.zielSprache, sprache);
  const alleHinweis = sprachHinweis(texte, alle.zielSprache, sprache);
  const lesen = t('hutba.lesen');
  const alleText = t('abschnitt.alleHutbas');
  const Ueberschrift = stufe;
  return (
    <article
      aria-labelledby={id}
      className={cn('flex flex-col gap-4 rounded-lg border border-gruen-700 bg-gruen-50 p-5 md:p-8', className)}
    >
      <p className="inline-flex items-center gap-2 text-16 font-bold text-gruen-800">
        <Stern8 className="size-4" />
        {t('hutba.kennung')}
      </p>
      <Ueberschrift id={id} className="font-text text-24 leading-tight font-bold tracking-normal text-balance">
        {t('hutba.titel', { datum: datumAnzeige(eintrag.datum, sprache) })}
      </Ueberschrift>
      <p className="flex flex-col gap-1">
        <span lang={titel.rueckfall ? 'de' : undefined} className="text-20 leading-snug font-bold text-pretty text-gruen-800">
          {titel.text}
        </span>
        {titel.rueckfall ? <span className="text-16 text-tinte-2">{texte.aufDeutsch}</span> : null}
      </p>
      <p className="max-w-text text-16 text-tinte-2">{t('hutba.hinweis')}</p>
      <div className="flex flex-wrap gap-x-6 gap-y-1">
        <a
          href={predigt.href}
          hrefLang={predigt.zielSprache}
          rel="noopener noreferrer"
          aria-label={`${predigtHinweis ? `${lesen} ${predigtHinweis}` : lesen}: ${titel.text}`}
          className={EXTERN_LINK}
        >
          <span>{lesen}</span>
          {predigtHinweis ? <span className="font-normal text-tinte-2">{predigtHinweis}</span> : null}
          <ExternalLink aria-hidden className="size-4 shrink-0" />
        </a>
        <a
          href={alle.href}
          hrefLang={alle.zielSprache}
          rel="noopener noreferrer"
          aria-label={`${alleHinweis ? `${alleText} ${alleHinweis}` : alleText}: ${t('externeSeite')}`}
          className={EXTERN_LINK}
        >
          <span>{alleText}</span>
          {alleHinweis ? <span className="font-normal text-tinte-2">{alleHinweis}</span> : null}
          <ExternalLink aria-hidden className="size-4 shrink-0" />
        </a>
      </div>
    </article>
  );
}

/**
 * Neueste sichtbare Freitagspredigt aus dem Seiteninhalt „dachverband“ (gecacht, Tag seiteninhalt:dachverband); ohne
 * Eintrag nichts. Für Seiten, die nur die Karte zeigen (/islamisches-wissen).
 */
export async function AktuelleHutba({ sprache, stufe = 'h2', className }: { sprache: Locale; stufe?: 'h2' | 'h3'; className?: string }) {
  const [inhalt, heute] = await Promise.all([ladeSeiteninhalt('dachverband'), heuteBerlin()]);
  const hutba = neuesteHutba(inhalt.eintraege, heute.datum);
  return hutba ? <HutbaKarte eintrag={hutba} sprache={sprache} stufe={stufe} className={className} /> : null;
}
