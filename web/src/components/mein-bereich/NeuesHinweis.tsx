'use client';

import { BellRing, X } from 'lucide-react';
import NextLink from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { verbindeSignal, type SignalTokens } from '@/lib/echtzeit/signal';
import { uebersichtAbstand } from '@/lib/echtzeit/takt';
import { summe, zeilenDerZusammenfassung, zeilenText, type NeuesZaehlung, type ZusammenfassungThema } from '@/lib/push/rueckfall';
import { mitteilungEingeschaltet } from './mitteilung';

/** Fertig übersetzte Texte (kein next-intl im Browser, MUSTER §4). */
export type NeuesTexte = {
  titel: string;
  schliessen: string;
} & Record<ZusammenfassungThema, { eins: string; mehr: string }>;

type Antwort = { stand: number; neu: NeuesZaehlung | null; echtzeit: SignalTokens | null };

/** Neue Tokens für das Echtzeit-Signal höchstens alle 5 Minuten anfragen (Server aus → nicht bei jedem Abruf). */
const SIGNAL_PAUSE_MS = 5 * 60 * 1000;

/**
 * Hinweis „Neues“ in Mein Bereich (ADR 0034 Nr. 6, F-38): Solange die Seite sichtbar ist, fragt die Insel ruhig nach
 * (`uebersichtAbstand`: 30 s, nach 5 Minuten ohne Neues 60 s; verborgener Tab: Pause, beim Wiedereinblenden sofort) –
 * und sofort, wenn das Echtzeit-Signal eines lesbaren Kanals „Neues“ meldet (ADR 0027). Der erste Abruf liefert nur den
 * Stand: Beim ersten Laden erscheint nichts. Danach zeigt eine Statusmeldung (`role="status"`) je Bereich die Anzahl mit
 * Link – keine Namen, keine Titel, keine Inhalte. Auftritt wie B-22 (`tritt-auf`, reduziert nur Überblendung).
 * Eine Mitteilung des Browsers gibt es nur, wenn die Person sie unter „Benachrichtigungen“ auf diesem Gerät ausdrücklich
 * eingeschaltet hat und der Browser sie erlaubt – nie eine Rückfrage ohne Klick, und nur, wenn das Fenster nicht im Fokus
 * ist (sonst genügt der Hinweis in der Seite).
 */
export function NeuesHinweis({
  texte,
  ziele,
  sprache,
  ohneKanal,
}: {
  texte: NeuesTexte;
  /** Fertige Adressen je Bereich (Gruppen-Seite der Kontoart bzw. Nachrichten). */
  ziele: Record<ZusammenfassungThema, string>;
  sprache: string;
  /** Offener Kanal (Chat-Seite): dessen Nachrichten sieht die Person schon. */
  ohneKanal?: string;
}) {
  const [neu, setNeu] = useState<NeuesZaehlung | null>(null);
  /** Zählbeginn: Stand des ersten Abrufs bzw. des Schließens. */
  const seit = useRef<number | null>(null);
  const letzterStand = useRef<number | null>(null);
  const bisher = useRef(0);
  const ruheSeit = useRef(0);
  const zeitgeber = useRef<number | undefined>(undefined);
  const naechster = useRef<() => void>(() => undefined);
  const trennen = useRef<(() => void) | null>(null);
  const signalVersuch = useRef(0);
  const signalMoeglich = useRef(true);
  const beendet = useRef(false);

  const melde = useCallback(
    (zahl: NeuesZaehlung) => {
      if (!mitteilungEingeschaltet() || typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
      if (document.hasFocus()) return;
      const zeilen = zeilenDerZusammenfassung(zahl).map(({ thema, anzahl }) => zeilenText(texte[thema], anzahl));
      try {
        const m = new Notification(texte.titel, { body: zeilen.join(' · '), tag: 'igmg-neues', lang: sprache });
        m.onclick = () => {
          window.focus();
          m.close();
        };
      } catch {
        // Manche Browser erlauben Mitteilungen nur über den Service Worker: dann bleibt es beim Hinweis in der Seite
      }
    },
    [texte, sprache],
  );

  const abrufen = useCallback(async () => {
    window.clearTimeout(zeitgeber.current);
    if (beendet.current || document.hidden) return;
    const q = new URLSearchParams();
    if (seit.current !== null) q.set('seit', String(seit.current));
    if (ohneKanal) q.set('ohne', ohneKanal);
    const signalAnfragen = signalMoeglich.current && !trennen.current && Date.now() - signalVersuch.current > SIGNAL_PAUSE_MS;
    if (signalAnfragen) {
      q.set('signal', '1');
      signalVersuch.current = Date.now();
    }
    try {
      const antwort = await fetch(`/api/mein/neues?${q}`, { cache: 'no-store' });
      if (antwort.status === 401 || antwort.status === 404) {
        // Abgemeldet oder ausgeschaltet: nicht weiter fragen
        beendet.current = true;
        return;
      }
      if (antwort.ok) {
        const d = (await antwort.json()) as Antwort;
        if (seit.current === null) seit.current = d.stand;
        letzterStand.current = d.stand;
        if (d.neu) {
          const gesamt = summe(d.neu);
          if (gesamt > bisher.current) {
            ruheSeit.current = Date.now();
            melde(d.neu);
          }
          bisher.current = gesamt;
          setNeu(gesamt ? d.neu : null);
        }
        if (signalAnfragen && !d.echtzeit) signalMoeglich.current = false;
        if (d.echtzeit && !trennen.current)
          trennen.current = verbindeSignal(
            d.echtzeit,
            () => naechster.current(),
            () => {
              trennen.current = null;
            },
          );
      }
    } catch {
      // Netz weg: nächster Versuch im normalen Takt
    }
    if (!ruheSeit.current) ruheSeit.current = Date.now();
    zeitgeber.current = window.setTimeout(() => naechster.current(), uebersichtAbstand(Date.now() - ruheSeit.current));
  }, [ohneKanal, melde]);

  useEffect(() => {
    naechster.current = () => void abrufen();
  }, [abrufen]);

  useEffect(() => {
    // Abgleich mit einem externen System (Server-Abruf); der Zustand ändert sich erst nach der Antwort.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void abrufen();
    const sichtbar = () => {
      if (!document.hidden) void abrufen();
    };
    document.addEventListener('visibilitychange', sichtbar);
    return () => {
      document.removeEventListener('visibilitychange', sichtbar);
      window.clearTimeout(zeitgeber.current);
      trennen.current?.();
      trennen.current = null;
    };
  }, [abrufen]);

  const schliessen = () => {
    // Ab jetzt zählt nur, was danach neu ist
    seit.current = letzterStand.current ?? seit.current;
    bisher.current = 0;
    setNeu(null);
  };

  const zeilen = neu ? zeilenDerZusammenfassung(neu) : [];
  return (
    <div
      role="status"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-(--ebene-toast) flex justify-end md:inset-x-8 md:bottom-8 print:hidden"
    >
      {zeilen.length ? (
        <div className="tritt-auf pointer-events-auto flex w-full max-w-text items-start gap-3 rounded-lg border border-linie bg-weiss p-4 shadow-s2">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-gruen-50 text-gruen-700">
            <BellRing aria-hidden className="size-5" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col">
            <p className="pt-2 font-bold">{texte.titel}</p>
            <ul className="flex flex-col">
              {zeilen.map(({ thema, anzahl }) => (
                <li key={thema}>
                  <NextLink
                    href={ziele[thema]}
                    prefetch={false}
                    className="flex min-h-11 items-center text-pretty text-gruen-800 underline underline-offset-3 hover:text-gruen-700"
                  >
                    {zeilenText(texte[thema], anzahl)}
                  </NextLink>
                </li>
              ))}
            </ul>
          </div>
          <button
            type="button"
            onClick={schliessen}
            aria-label={texte.schliessen}
            className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-md text-tinte-2 transition duration-(--dauer-rueckmeldung) hover:bg-sand hover:text-tinte"
          >
            <X aria-hidden className="size-5" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
