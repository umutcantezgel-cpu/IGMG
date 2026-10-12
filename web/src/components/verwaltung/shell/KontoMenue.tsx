'use client';

import { ChevronDown, LogOut, UserRound, UserRoundCog } from 'lucide-react';
import NextLink from 'next/link';
import { useRef, useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/**
 * Kontomenü der Verwaltung (ADR 0016: Konto-Funktionen im Kopf der Verwaltung). Abmelden als Server Action.
 * Das Formular liegt außerhalb des Menüs: Beim Auswählen schließt das Menü und entfernt seinen Inhalt –
 * ein Formular darin würde nicht mehr abgeschickt.
 * INP: Radix öffnet auf pointerdown und baut den Inhalt synchron auf. Deshalb öffnet das Menü erst nach dem nächsten
 * Bild (wie das Telefonmenü der Website); der Knopf gibt sofort Rückmeldung. Nicht modal: ohne Scroll-Sperre und ohne
 * Zeigersperre auf dem ganzen Dokument; Escape, Klick daneben und Fokus außerhalb schließen weiterhin.
 */
export function KontoMenue({
  name,
  rollen,
  abmelden,
  texte,
}: {
  name: string;
  rollen: string;
  abmelden: () => Promise<void>;
  texte: { kontoMenue: string; meinKonto: string; abmelden: string };
}) {
  const formular = useRef<HTMLFormElement>(null);
  const [offen, setOffen] = useState(false);
  const umschalten = (neu: boolean) =>
    neu ? requestAnimationFrame(() => setTimeout(() => setOffen(true), 0)) : setOffen(false);
  return (
    <>
      <form ref={formular} action={abmelden} hidden />
      <DropdownMenu open={offen} onOpenChange={umschalten} modal={false}>
        <DropdownMenuTrigger className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-md border border-rand bg-weiss px-4 font-bold text-tinte transition duration-(--dauer-rueckmeldung) hover:border-gruen-700 hover:bg-gruen-50 active:scale-98 aria-expanded:border-gruen-700 aria-expanded:bg-gruen-50 max-verwaltung:size-12 max-verwaltung:justify-center max-verwaltung:px-0">
          <UserRound aria-hidden className="size-5" />
          <span className="max-w-48 truncate max-verwaltung:sr-only">{name}</span>
          <ChevronDown aria-hidden className="size-4 max-verwaltung:hidden" />
          <span className="sr-only">{texte.kontoMenue}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-64">
          <DropdownMenuLabel className="flex flex-col gap-0.5">
            <span>{name}</span>
            <span className="text-16 font-normal text-tinte-2">{rollen}</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild className="min-h-12 cursor-pointer">
            <NextLink href="/verwaltung/konto">
              <UserRoundCog aria-hidden className="size-5" />
              {texte.meinKonto}
            </NextLink>
          </DropdownMenuItem>
          <DropdownMenuItem className="min-h-12 cursor-pointer" onSelect={() => formular.current?.requestSubmit()}>
            <LogOut aria-hidden className="size-5" />
            {texte.abmelden}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
