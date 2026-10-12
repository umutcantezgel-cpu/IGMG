'use client';

import { Menu, X } from 'lucide-react';
import { createContext, type Dispatch, type ReactNode, type SetStateAction, useContext, useEffect, useMemo, useRef, useState } from 'react';

type MenueWert = { offen: boolean; setOffen: Dispatch<SetStateAction<boolean>> };

const MenueKontext = createContext<MenueWert | null>(null);

/**
 * Hält den Zustand des Verwaltungsmenüs für Kopfzeile und Seitenleiste (H-B05): Der Knopf in der Kopfzeile öffnet die
 * Navigationskarte unter 900 px. Auf dem Bildschirm ab 900 px ist die Seitenleiste immer sichtbar.
 */
export function MenueZustand({ children }: { children: ReactNode }) {
  const [offen, setOffen] = useState(false);
  const wert = useMemo(() => ({ offen, setOffen }), [offen]);
  return <MenueKontext value={wert}>{children}</MenueKontext>;
}

export function useMenue(): MenueWert {
  const wert = useContext(MenueKontext);
  if (!wert) throw new Error('useMenue muss innerhalb von MenueZustand verwendet werden.');
  return wert;
}

/** Menüknopf der Kopfzeile (nur unter 900 px): nur Symbol, Beschriftung für Hilfstechnik. Escape schließt das geöffnete
 * Menü und gibt den Fokus an den Knopf zurück (Muster „Disclosure“). */
export function MenueKnopf({ texte }: { texte: { oeffnen: string; schliessen: string } }) {
  const { offen, setOffen } = useMenue();
  const knopf = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!offen) return;
    const taste = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOffen(false);
      knopf.current?.focus();
    };
    document.addEventListener('keydown', taste);
    return () => document.removeEventListener('keydown', taste);
  }, [offen, setOffen]);
  return (
    <button
      ref={knopf}
      type="button"
      aria-expanded={offen}
      aria-controls="verwaltung-navigation"
      onClick={() => setOffen((o) => !o)}
      className="inline-flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-md border border-rand bg-weiss transition duration-(--dauer-rueckmeldung) hover:bg-gruen-50 active:scale-98 verwaltung:hidden"
    >
      {offen ? <X aria-hidden className="size-6" /> : <Menu aria-hidden className="size-6" />}
      <span className="sr-only">{offen ? texte.schliessen : texte.oeffnen}</span>
    </button>
  );
}
