import type { ReactNode } from 'react';
import { Stern8 } from '@/components/website/Icons';
import { textMitSprache } from '@/components/website/Text';
import type { Sprache } from '@/lib/i18n/inhalt';
import type { MehrsprachigText } from '@/lib/validierung/bloecke';
import { cn } from '@/lib/utils';

/** Text in der Seitensprache mit sichtbarem Rückfall (lang="de", ADR 0002). */
export function tx(w: MehrsprachigText | null | undefined, sprache: Sprache) {
  return textMitSprache(w ? { de: w.de, tr: w.tr, en: w.en } : null, sprache);
}

/** Klartext in Absätze: Leerzeile trennt Absätze, einfacher Umbruch wird zu <br>. */
export function Absaetze({ text, lang, className }: { text: string; lang?: string; className?: string }) {
  const absaetze = text
    .split(/\n\s*\n/)
    .map((a) => a.trim())
    .filter(Boolean);
  return (
    <div lang={lang} className={cn('flex flex-col gap-3', className)}>
      {absaetze.map((a, i) => (
        <p key={i}>
          {a.split('\n').map((zeile, k) => (
            <span key={k}>
              {k > 0 ? <br /> : null}
              {zeile}
            </span>
          ))}
        </p>
      ))}
    </div>
  );
}

/** Abschnittskopf eines Bausteins: Kennung mit Achtstern (optional) und Titel als h2 (H-B12). */
export function BlockKopf({ id, titel, lang, kennung }: { id: string; titel: string; lang?: string; kennung?: string }) {
  return (
    <div className="flex max-w-einleitung flex-col gap-2">
      {kennung ? (
        <span className="inline-flex items-center gap-2 text-16 font-bold text-gruen-800">
          <Stern8 className="size-4" />
          {kennung}
        </span>
      ) : null}
      <h2 id={id} lang={lang} className="text-display-2 text-balance">
        {titel}
      </h2>
    </div>
  );
}

/** Breite eines Bausteins im Raster der Seite: Lesespalte oder ganze Inhaltsbreite. */
export function BlockRahmen({ breit = false, children, beschriftung }: { breit?: boolean; children: ReactNode; beschriftung?: string }) {
  return (
    <section aria-labelledby={beschriftung} className="mx-auto w-full max-w-(--container-inhalt) px-4 md:px-8">
      <div className={cn('flex min-w-0 flex-col gap-6', !breit && 'max-w-seitenkopf')}>{children}</div>
    </section>
  );
}

/** Dateigröße lesbar („1,2 MB“). */
export function dateiGroesse(bytes: number, sprache: Sprache): string {
  const locale = { de: 'de-DE', tr: 'tr-TR', en: 'en-GB' }[sprache];
  if (bytes < 1024 * 1024) return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(Math.max(1, bytes / 1024))} KB`;
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(bytes / 1024 / 1024)} MB`;
}
