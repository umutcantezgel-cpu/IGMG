import { notFound } from 'next/navigation';
import { ui } from 'next/root-params';
import { OBERFLAECHEN, istOberflaeche, lernTexte, richtung } from '@/lib/lernapp/texte';

/** Mengen für die Probe der Pluralformen (Arabisch: zero/one/two/few/many/other). */
const PROBE_MENGEN = [0, 1, 2, 3, 11, 100] as const;

/**
 * Start der Lern-App – Spike L0-S1: statischer Platzhalter je Oberflächensprache. Die Sprachwahl sind einfache Links
 * (`<a>`, ADR 0037 Nr. 9); jede Sprache trägt ihren eigenen Namen mit `lang` und `dir` (KERN 4.0 §7).
 */
export default async function LernAppStart() {
  const sprache = await ui();
  if (!istOberflaeche(sprache)) notFound();
  const t = lernTexte(sprache);
  return (
    <main id="inhalt" className="mx-auto flex max-w-(--container-inhalt) flex-col items-start gap-6 px-4 py-abschnitt md:px-8">
      <h1 className="text-display-1">{t('start.titel')}</h1>
      <p className="max-w-text text-20 leading-einleitung text-tinte-2">{t('start.hinweis')}</p>
      <nav aria-label={t('start.sprachwahl')}>
        <ul className="flex flex-wrap gap-4">
          {OBERFLAECHEN.map((andere) => (
            <li key={andere}>
              <a
                href={`/lern-app/${andere}`}
                hrefLang={andere}
                lang={andere}
                dir={richtung(andere)}
                aria-current={andere === sprache ? 'page' : undefined}
                className="inline-flex min-h-6 items-center underline underline-offset-4"
              >
                {lernTexte(andere)('sprache.eigenname')}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <section aria-labelledby="probe-mengen" className="flex flex-col gap-2">
        <h2 id="probe-mengen" className="text-24">
          {t('probe.titel')}
        </h2>
        <ul className="flex flex-col gap-1">
          {PROBE_MENGEN.map((n) => (
            <li key={n} data-menge={n}>
              {t('probe.einheiten', { n })}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
