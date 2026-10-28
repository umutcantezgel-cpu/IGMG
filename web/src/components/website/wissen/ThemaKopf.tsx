import { Stern8 } from '@/components/website/Icons';
import { EntwurfMarke } from './EntwurfMarke';
import type { Anzeige } from './typen';

/**
 * Seitenkopf der Themenseite, gestaltet wie Seitenkopf (components/website/Seitenkopf.tsx): Kennung mit Stern, Titel als
 * einzige h1, Untertitel, Achtstern-Band an der Kante. Eigene Fassung, weil Seitenkopf den Titel nur als Text annimmt;
 * der Rückfall auf Deutsch braucht lang="de" am Titel (K-02). Maße nur aus Tokens, gleiche Klassen wie Seitenkopf.
 * `marke`: Marke „Entwurf“ neben der Kennung, wenn das Thema noch nicht religiös geprüft ist (ADR 0047) – sie steht vor dem
 * Kurztext, der Hinweis mit Erklärung folgt oben im Inhalt.
 */
export function ThemaKopf({
  kennung,
  titel,
  untertitel,
  marke,
}: {
  kennung: string;
  titel: Anzeige;
  untertitel: Anzeige | null;
  marke?: string;
}) {
  return (
    <section className="border-b border-linie bg-sand">
      <div className="mx-auto flex max-w-(--container-inhalt) flex-wrap items-start gap-6 px-4 pt-8 pb-8 md:px-8 md:pt-16 md:pb-14">
        <div className="flex max-w-seitenkopf min-w-0 flex-1 basis-120 flex-col gap-3">
          <span className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="inline-flex items-center gap-2 text-16 font-bold text-gruen-800">
              <Stern8 />
              <span>{kennung}</span>
            </span>
            {marke ? <EntwurfMarke text={marke} /> : null}
          </span>
          <h1 lang={titel.lang} className="text-display-1 text-balance">
            {titel.text}
          </h1>
          {untertitel?.text ? (
            <p lang={untertitel.lang} className="max-w-text text-20 leading-einleitung text-pretty text-tinte-2">
              {untertitel.text}
            </p>
          ) : null}
        </div>
      </div>
      <div aria-hidden className="h-5 achtstern-band" />
    </section>
  );
}
