'use client';

import { LogIn } from 'lucide-react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { LadeStern } from '@/components/website/Zustandsgrafik';

/**
 * Absendeknopf der Formulare des Testzugangs (ADR 0052): zeigt, dass die Anmeldung läuft. Der erste Zugriff einer frischen
 * Instanz lädt die Datenbank und dauert einige Sekunden – ohne Rückmeldung sähe das nach „geht nicht“ aus. Ohne
 * JavaScript bleibt es ein gewöhnlicher Absendeknopf.
 */
export function AnmeldeKnopf({ text, laeuft, klein, ariaLabel }: { text: string; laeuft: string; klein?: boolean; ariaLabel?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant={klein ? 'secondary' : 'default'}
      size={klein ? 'sm' : 'default'}
      aria-label={pending ? undefined : ariaLabel}
      aria-disabled={pending || undefined}
      className={klein ? 'w-full whitespace-nowrap' : 'w-full'}
    >
      {pending ? <LadeStern /> : <LogIn aria-hidden />}
      {pending ? laeuft : text}
    </Button>
  );
}
