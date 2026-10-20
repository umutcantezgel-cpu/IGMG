import { ui } from 'next/root-params';
import { istOberflaeche, lernTexte } from '@/lib/lernapp/texte';

/**
 * Nicht gefunden innerhalb der Lern-App (ADR 0037 Nr. 2): in der Oberflächensprache, im Wurzel-Layout der Lern-App
 * (`lang`, `dir`). Greift, wenn `notFound()` innerhalb von `[ui]` ausgelöst wird.
 */
export default async function LernAppNichtGefunden() {
  const wert = await ui();
  const sprache = istOberflaeche(wert) ? wert : 'de';
  const t = lernTexte(sprache);
  return (
    <main id="inhalt" className="mx-auto flex max-w-(--container-inhalt) flex-col items-start gap-4 px-4 py-abschnitt md:px-8">
      <h1 className="text-display-1">{t('nichtGefunden.titel')}</h1>
      <p className="max-w-text text-20 leading-einleitung text-tinte-2">{t('nichtGefunden.text')}</p>
      <a href={`/lern-app/${sprache}`} className="inline-flex min-h-6 items-center underline underline-offset-4">
        {t('nichtGefunden.zurueck')}
      </a>
    </main>
  );
}
