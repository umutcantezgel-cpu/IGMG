'use client';

import { Trash2 } from 'lucide-react';
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
 * „Folie löschen“ auf der Folienseite (VA-2): beschrifteter Knopf, als zerstörende Aktion ausgezeichnet wie der
 * Papierkorb in den Listen, mit Rückfrage (nicht umkehrbar, K-05; Abbrechen hat den Fokus zuerst).
 */
export function FolieLoeschen({
  id,
  aktion,
  texte,
}: {
  id: string;
  aktion: (fd: FormData) => Promise<void>;
  texte: { ausloeser: string; titel: string; text: string; abbrechen: string };
}) {
  const abbrechenRef = useRef<HTMLButtonElement>(null);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-fehler text-fehler hover:bg-fehler-toenung hover:text-fehler">
          <Trash2 aria-hidden />
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
            <input type="hidden" name="id" value={id} />
            <Button type="submit" variant="destructive">
              <Trash2 aria-hidden />
              {texte.ausloeser}
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
