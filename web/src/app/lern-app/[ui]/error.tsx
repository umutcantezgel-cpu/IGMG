'use client';

import { useFehlerTexte } from '@/components/lernapp/FehlerTexte';

/**
 * Fehlerseite der Lern-App (ADR 0037 Nr. 2): eigene Gestalt, Texte in der Oberflächensprache aus dem Wurzel-Layout
 * (`FehlerTexteAnbieter`, kein next-intl im Client); `lang` und `dir` setzt das Wurzel-Layout. „Erneut versuchen“
 * rendert den Abschnitt neu. Fehler im Wurzel-Layout selbst fängt `app/global-error.tsx`.
 */
export default function LernAppFehler({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const t = useFehlerTexte();
  if (!t) return null;
  return (
    <main id="inhalt" className="mx-auto flex w-full max-w-(--container-inhalt) flex-col items-start gap-4 px-4 py-abschnitt md:px-8">
      <h1 className="text-display-1">{t.titel}</h1>
      <p className="max-w-einleitung text-20 leading-einleitung text-tinte-2">{t.text}</p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => retry()}
          className="inline-flex min-h-12 druck cursor-pointer items-center rounded-md bg-gruen-700 px-6 font-bold text-weiss hover:bg-gruen-800"
        >
          {t.nochmal}
        </button>
        <a
          href={t.startAdresse}
          className="inline-flex min-h-12 items-center rounded-md border border-rand bg-weiss px-6 font-bold no-underline"
        >
          {t.start}
        </a>
      </div>
    </main>
  );
}
