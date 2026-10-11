import { ArrowRight, Megaphone } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { textMitSprache } from '@/components/website/Text';
import type { Sprache } from '@/lib/i18n/inhalt';
import { istErlaubterLink } from '@/lib/inhalt/links';
import { ladeAnkuendigungen } from '@/server/queries/ankuendigungen';

/**
 * Block „Ankündigungen“ oberhalb der Nachrichtenliste (E-033): aktive Ankündigungen nach Priorität, in den
 * Info-Farben der Kategorie „Ankündigung“ (01 Grundlagen). Server-Komponente ohne Client-JS; leer = nichts rendern.
 */
export async function Ankuendigungen({ sprache }: { sprache: Sprache }) {
  const liste = await ladeAnkuendigungen();
  if (liste.length === 0) return null;
  const t = await getTranslations('nachrichten.ankuendigungen');
  return (
    <section aria-labelledby="ankuendigungen-titel" className="mb-10 flex flex-col gap-5 md:mb-14">
      <h2 id="ankuendigungen-titel" className="flex items-center gap-3 text-display-2">
        <Megaphone aria-hidden className="size-7 shrink-0 text-info" />
        {t('titel')}
      </h2>
      <ul className="grid gap-4 md:grid-cols-2">
        {liste.map((a) => {
          const titel = textMitSprache(a.titel, sprache);
          const inhalt = textMitSprache(a.inhalt, sprache);
          // Erneut prüfen, bevor ein Link ausgegeben wird (ADR 0006): gespeicherte Werte sind nicht vertrauenswürdig
          const link = a.link && istErlaubterLink(a.link) ? a.link : null;
          return (
            <li key={a.id} className="flex flex-col gap-3 rounded-lg border border-info bg-info-toenung p-5 md:p-6">
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex rounded-pill bg-weiss px-3 py-0.5 text-16 leading-normal font-bold text-info">
                  {t('kategorie')}
                </span>
                {a.prioritaet === 'hoch' ? (
                  <span className="inline-flex rounded-pill bg-tag-wichtig-bg px-3 py-0.5 text-16 leading-normal font-bold text-tag-wichtig">
                    {t('wichtig')}
                  </span>
                ) : null}
              </div>
              <h3 lang={titel.lang} className="font-text text-24 leading-tight font-bold tracking-normal text-balance">
                {titel.text}
              </h3>
              <p lang={inhalt.lang} className="text-18 leading-relaxed text-pretty text-tinte">
                {inhalt.text}
              </p>
              {link ? (
                <a
                  href={link}
                  {...(link.startsWith('https://') ? { rel: 'noopener noreferrer' } : {})}
                  aria-label={`${t('mehrErfahren')}: ${titel.text}`}
                  className="inline-flex min-h-12 items-center gap-2 self-start font-bold text-info underline underline-offset-4"
                >
                  <span>{t('mehrErfahren')}</span>
                  <ArrowRight aria-hidden className="size-5" />
                </a>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
