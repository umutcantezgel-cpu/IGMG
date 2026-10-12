import type { ReactNode } from 'react';
import { Stern8 } from '@/components/website/Icons';

/**
 * Kopf jeder Verwaltungsseite (H-B06): Kennung der Gruppe mit grünem Achtstern, Titel als h1 im Display, optional
 * eine Einleitung im Lesemaß und rechts eine Aktion (Knopf). Auf dem Telefon fällt die Aktion unter den Titel.
 * Die Kennung ist die Gruppe des Moduls (`shell.gruppe.<gruppe>`), die Übersicht nennt „Verwaltung“.
 */
export function VerwaltungsKopf({
  titel,
  kennung,
  einleitung,
  aktion,
  titelLang,
}: {
  titel: string;
  kennung?: string;
  einleitung?: ReactNode;
  aktion?: ReactNode;
  titelLang?: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex min-w-0 flex-col gap-2">
        {kennung ? (
          <span className="inline-flex items-center gap-2 text-16 font-bold text-gruen-800">
            <Stern8 aria-hidden className="size-4 shrink-0" />
            {kennung}
          </span>
        ) : null}
        <h1 lang={titelLang} className="text-display-2">
          {titel}
        </h1>
        {einleitung ? <p className="max-w-einleitung text-20 leading-einleitung text-pretty text-tinte-2">{einleitung}</p> : null}
      </div>
      {aktion}
    </div>
  );
}
