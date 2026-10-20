import { notFound } from 'next/navigation';
import { Suspense } from 'react';

export const ensureStatic = 'navigation';

/**
 * Fangroute der Lern-App: Unbekannte Adressen unter `/lern-app/(de|tr|ar)/…` antworten mit 404 und der Seite
 * „nicht gefunden“ der Lern-App (`not-found.tsx`, im eigenen Wurzel-Layout mit `lang` und `dir`). Ohne sie träfe
 * `[locale]/[...rest]` der Website diese Adressen (Sprache „lern-app“, leere 404-Seite; Spike L0-S1).
 * Cache Components verlangt mindestens einen Wert: Platzhalter `_`. Muster wie `[locale]/[...rest]`: Die Adresse wird
 * erst innerhalb von Suspense gelesen (MUSTER 1), damit das Wurzel-Layout mit `<html lang dir>` in der Hülle steht;
 * `ensureStatic = 'navigation'` rendert die erste Anfrage vollständig, sodass der Status 404 bleibt (ohne: 200).
 */
export function generateStaticParams() {
  return [{ rest: ['_'] }];
}

export default function LernAppFangRoute({ params }: PageProps<'/lern-app/[ui]/[...rest]'>) {
  return (
    <Suspense fallback={null}>
      <NichtVorhanden params={params} />
    </Suspense>
  );
}

async function NichtVorhanden({ params }: Pick<PageProps<'/lern-app/[ui]/[...rest]'>, 'params'>): Promise<null> {
  await params;
  notFound();
}
