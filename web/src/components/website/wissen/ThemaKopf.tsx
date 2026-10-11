import { Stern8 } from '@/components/website/Icons';
import type { Anzeige } from './typen';

/**
 * Seitenkopf der Themenseite, gestaltet wie PageHeader (design/PageHeader.dc.html): Kennung mit Stern, Titel als
 * einzige h1, Untertitel auf Sand. Eigene Fassung, weil PageHeader den Titel nur als Text annimmt; der Rückfall auf
 * Deutsch braucht lang="de" am Titel (K-02).
 */
export function ThemaKopf({ kennung, titel, untertitel }: { kennung: string; titel: Anzeige; untertitel: Anzeige | null }) {
  return (
    <section className="border-b border-linie bg-sand">
      <div className="mx-auto flex max-w-(--container-inhalt) flex-wrap items-start gap-6 px-4 pt-8 pb-8 md:px-8 md:pt-16 md:pb-14">
        <div className="flex max-w-[880px] min-w-0 flex-[1_1_480px] flex-col gap-3">
          <span className="inline-flex items-center gap-2 text-16 font-bold text-gruen-800">
            <Stern8 />
            <span>{kennung}</span>
          </span>
          <h1 lang={titel.lang} className="text-36 leading-[1.15] text-pretty md:text-48">
            {titel.text}
          </h1>
          {untertitel?.text ? (
            <p lang={untertitel.lang} className="max-w-[62ch] text-20 leading-[1.55] text-pretty text-tinte-2">
              {untertitel.text}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
