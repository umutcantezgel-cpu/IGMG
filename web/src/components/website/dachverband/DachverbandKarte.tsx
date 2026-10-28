import { ExternalLink } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { datumAnzeige, linkFuer } from '@/lib/dachverband/auswahl';
import { waehle } from '@/lib/i18n/inhalt';
import { cn } from '@/lib/utils';
import type { DachverbandEintrag } from '@/lib/validierung/seiteninhalte/dachverband';

/** Externer Textlink zur IGMG (Klickziel 48 px, Unterstreichung wie die Verweisliste). */
export const EXTERN_LINK =
  'inline-flex min-h-12 flex-wrap items-center gap-x-2 self-start font-bold text-gruen-700 underline underline-offset-4 transition duration-(--dauer-rueckmeldung) hover:decoration-2';

/**
 * Sichtbarer Sprachhinweis zur Zielsprache („(auf Deutsch)“, „(auf Türkisch)“, „(auf Englisch)“) oder nichts, wenn sie zur
 * Seite passt. Englische Ziele gibt es nur bei eigenen Adressen der Redaktion (Hadsch & Umra); wer sie anbietet, gibt
 * `aufEnglisch` mit.
 */
export function sprachHinweis(
  texte: { aufDeutsch: string; aufTuerkisch: string; aufEnglisch?: string },
  ziel: Locale,
  sprache: Locale,
): string | undefined {
  if (ziel === sprache) return undefined;
  return ziel === 'de' ? texte.aufDeutsch : ziel === 'tr' ? texte.aufTuerkisch : texte.aufEnglisch;
}

/**
 * Ein Eintrag „Aus dem Dachverband“ (Plan Marktstart P3): Art, Datum, Titel, Kurztext und ein externer Link zur Seite bei
 * der IGMG – keine Bilder, keine Anfrage beim Aufruf (K-14), kein Client-JavaScript (K-12). Fehlt die Sprache, erscheinen
 * Titel bzw. Kurztext auf Deutsch mit `lang="de"` und sichtbarem Hinweis (K-02); der Link nennt die Sprache des Ziels.
 * Freitagspredigten haben nie einen Kurztext (G-06). `rahmen`: als Karte, sonst als Zeile einer umrahmten Liste.
 */
export async function DachverbandKarte({
  eintrag,
  sprache,
  stufe = 'h3',
  rahmen = true,
  className,
}: {
  eintrag: DachverbandEintrag;
  sprache: Locale;
  stufe?: 'h3' | 'h4';
  rahmen?: boolean;
  className?: string;
}) {
  const t = await getTranslations('dachverband');
  const titel = waehle(eintrag.titel, sprache);
  const kurz = eintrag.art !== 'hutba' && eintrag.kurztext ? waehle(eintrag.kurztext, sprache) : null;
  const link = linkFuer(eintrag, sprache);
  const texte = { aufDeutsch: t('aufDeutsch'), aufTuerkisch: t('aufTuerkisch') };
  const zielHinweis = sprachHinweis(texte, link.zielSprache, sprache);
  const lesen = t('karte.lesen');
  const sichtbar = zielHinweis ? `${lesen} ${zielHinweis}` : lesen;
  const Ueberschrift = stufe;
  return (
    <article
      className={cn(
        'flex h-full flex-col gap-3',
        rahmen ? 'rounded-lg border border-linie bg-weiss p-5 shadow-s1 md:p-6' : 'px-5 py-4 md:px-6',
        className,
      )}
    >
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-16">
        <span className="inline-flex rounded-pill bg-gruen-50 px-3 py-0.5 font-bold text-gruen-800">{t(`arten.${eintrag.art}`)}</span>
        <time dateTime={eintrag.datum} className="text-tinte-2">
          {datumAnzeige(eintrag.datum, sprache)}
        </time>
      </p>
      <div className="flex flex-col gap-1">
        <Ueberschrift
          lang={titel.rueckfall ? 'de' : undefined}
          className="font-text text-20 leading-snug font-bold tracking-normal text-balance"
        >
          {titel.text}
        </Ueberschrift>
        {titel.rueckfall ? <span className="text-16 text-tinte-2">{texte.aufDeutsch}</span> : null}
      </div>
      {kurz?.text ? (
        <p className="max-w-text text-18 leading-relaxed text-pretty text-tinte-2">
          <span lang={kurz.rueckfall ? 'de' : undefined}>{kurz.text}</span>
          {/* Hinweis in der Seitensprache, außerhalb von lang="de" (WCAG 3.1.2) */}
          {kurz.rueckfall && !titel.rueckfall ? <span className="text-16"> {texte.aufDeutsch}</span> : null}
        </p>
      ) : null}
      <a
        href={link.href}
        hrefLang={link.zielSprache}
        rel="noopener noreferrer"
        aria-label={`${sichtbar}: ${titel.text}`}
        className={cn(EXTERN_LINK, 'mt-auto')}
      >
        <span>{lesen}</span>
        {zielHinweis ? <span className="font-normal text-tinte-2">{zielHinweis}</span> : null}
        <ExternalLink aria-hidden className="size-4 shrink-0" />
      </a>
    </article>
  );
}
