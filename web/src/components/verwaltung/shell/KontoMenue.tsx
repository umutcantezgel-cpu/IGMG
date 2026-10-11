'use client';

import { ChevronDown, LogOut, UserRound, UserRoundCog } from 'lucide-react';
import NextLink from 'next/link';
import { useRef } from 'react';
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
  return (
    <>
      <form ref={formular} action={abmelden} hidden />
      <DropdownMenu>
        <DropdownMenuTrigger className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-md border border-gruen-700 bg-gruen-50 px-4 font-bold text-gruen-800 hover:bg-gruen-100">
          <UserRound aria-hidden className="size-5" />
          <span className="max-w-48 truncate">{name}</span>
          <ChevronDown aria-hidden className="size-4" />
          <span className="sr-only">{texte.kontoMenue}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-64">
          <DropdownMenuLabel className="flex flex-col gap-0.5">
            <span>{name}</span>
            <span className="text-16 font-normal text-tinte-2">{rollen}</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild className="min-h-11 cursor-pointer">
            <NextLink href="/verwaltung/konto">
              <UserRoundCog aria-hidden className="size-5" />
              {texte.meinKonto}
            </NextLink>
          </DropdownMenuItem>
          <DropdownMenuItem className="min-h-11 cursor-pointer" onSelect={() => formular.current?.requestSubmit()}>
            <LogOut aria-hidden className="size-5" />
            {texte.abmelden}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
