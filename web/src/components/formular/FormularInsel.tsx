'use client';

import { useActionState, useEffect, useRef, type ReactNode } from 'react';
import type { FormularAntwort } from '@/lib/formulare/ergebnis';

/**
 * Einzige Client-Insel öffentlicher Formulare (E-028, K-12): hält den Action-Zustand und zeigt die Ansicht, die die
 * Action auf dem Server gerendert hat – zuerst `children` (Felder vom Server), danach `antwort.ansicht`.
 * Bleibt an derselben Stelle im Baum, auch wenn die Seite nach dem Absenden neu rendert (z. B. „ausgebucht“) –
 * die Erfolgsmeldung bleibt dann sichtbar. Fokus nach jeder Antwort auf `[data-fokus]`.
 */
export function FormularInsel({
  aktion,
  children,
}: {
  aktion: (vorher: FormularAntwort | null, fd: FormData) => Promise<FormularAntwort>;
  children?: ReactNode;
}) {
  const [antwort, absenden] = useActionState(aktion, null);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (antwort) ref.current?.querySelector<HTMLElement>('[data-fokus]')?.focus();
  }, [antwort]);
  if (!antwort && !children) return null;
  return (
    <div ref={ref}>
      {antwort?.status === 'erfolg' ? (
        antwort.ansicht
      ) : (
        <form action={absenden} className="relative flex flex-col gap-4" noValidate>
          {antwort?.ansicht ?? children}
        </form>
      )}
    </div>
  );
}
