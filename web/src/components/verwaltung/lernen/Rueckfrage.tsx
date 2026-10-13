'use client';

import type { ReactNode } from 'react';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

/**
 * Rückfrage vor folgenreichen Aktionen (Sperren, Löschen) mit sichtbarem Text am Auslöser. „Abbrechen“ hat den Fokus
 * zuerst; das Formular liegt im Dialogfuß außerhalb eines Menüs (Muster 4).
 */
export function Rueckfrage({
  aktion,
  felder,
  texte,
  icon,
  gefaehrlich = false,
}: {
  aktion: (fd: FormData) => Promise<void>;
  felder: Record<string, string>;
  texte: { ausloeser: string; titel: string; text: string; bestaetigen: string; abbrechen: string };
  icon?: ReactNode;
  gefaehrlich?: boolean;
}) {
  const abbrechenRef = useRef<HTMLButtonElement>(null);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={gefaehrlich ? 'self-start border-fehler text-fehler hover:bg-fehler-toenung hover:text-fehler' : 'self-start'}
        >
          {icon}
          {texte.ausloeser}
        </Button>
      </DialogTrigger>
      <DialogContent
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          abbrechenRef.current?.focus();
        }}
      >
        <DialogHeader>
          <DialogTitle>{texte.titel}</DialogTitle>
          <DialogDescription>{texte.text}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button ref={abbrechenRef} variant="outline">
              {texte.abbrechen}
            </Button>
          </DialogClose>
          <form action={aktion}>
            {Object.entries(felder).map(([name, wert]) => (
              <input key={name} type="hidden" name={name} value={wert} />
            ))}
            <Button type="submit" variant={gefaehrlich ? 'destructive' : 'default'}>
              {icon}
              {texte.bestaetigen}
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
