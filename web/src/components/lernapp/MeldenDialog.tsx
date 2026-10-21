'use client';

import { X } from 'lucide-react';
import { type FormEvent, useEffect, useId, useRef, useState } from 'react';
import type { KursSlug } from '@/lib/lernapp/kurse';
import type { MeldungKategorie } from '@/lib/lernapp/meldung';
import { alsErgebnis, type MeldeErgebnis, loeseAltcha, sendeMeldung } from '@/lib/lernapp/oberflaeche/melden';
import type { MeldenTexte } from './typen';

export type MeldenDialogProps = {
  kurs: KursSlug;
  /** Schlüssel der Aufgabe (wie im Paket) */
  aufgabe: string;
  texte: MeldenTexte;
  /** nach dem Schließen (Escape, „Abbrechen“, „Schließen“): Fokus zurück auf „Fehler melden“ */
  onSchliessen: () => void;
};

type Lage = { art: 'bereit' } | { art: 'sendet' } | { art: 'gesendet' } | { art: 'fehler'; ergebnis: MeldeErgebnis };

const KNOPF = 'min-h-12 druck rounded-pill px-6 font-bold';

/**
 * Melde-Dialog des Spielers (ADR 0041 Nr. 9, KERN 4.0 §5/§6/§8, L3-06b): eigener Chunk, erst nach dem Klick auf „Fehler
 * melden“ geladen (Spieler-Budget). Natives `<dialog>` (Fokus bleibt im Dialog, Escape schließt). Beim Öffnen holt und löst er
 * die ALTCHA-Aufgabe im Hintergrund, während die Kategorie gewählt wird. Gesendet werden nur Aufgabe und Kategorie; ohne Netz
 * ein ehrlicher Hinweis (nichts gespeichert). Die Statuszeile des Dialogs sagt Senden, Dank und Fehler an. Die Kategorien
 * kommen aus den Texten (gleich `MELDUNG_KATEGORIEN`, Unit-Test), damit der Chunk ohne Zod auskommt.
 */
export default function MeldenDialog({ kurs, aufgabe, texte, onSchliessen }: MeldenDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  const [kategorie, setKategorie] = useState<MeldungKategorie | null>(null);
  const [fehltWahl, setFehltWahl] = useState(false);
  const [lage, setLage] = useState<Lage>({ art: 'bereit' });
  const altcha = useRef<Promise<string> | null>(null);
  const abbruch = useRef<AbortController | null>(null);
  const ersteWahl = useRef<HTMLInputElement>(null);
  const schliessenKnopf = useRef<HTMLButtonElement>(null);

  const neueAltcha = () => {
    const ac = new AbortController();
    abbruch.current?.abort();
    abbruch.current = ac;
    const p = loeseAltcha(ac.signal);
    p.catch(() => undefined);
    altcha.current = p;
    return p;
  };

  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
    neueAltcha();
    return () => abbruch.current?.abort();
  }, []);

  useEffect(() => {
    if (lage.art === 'gesendet') schliessenKnopf.current?.focus();
  }, [lage.art]);

  const schliesse = () => ref.current?.close();

  async function senden(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    if (lage.art === 'sendet') return;
    if (!kategorie) {
      setFehltWahl(true);
      ersteWahl.current?.focus();
      return;
    }
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return setLage({ art: 'fehler', ergebnis: 'ohne_netz' });
    setLage({ art: 'sendet' });
    let loesung: string;
    try {
      loesung = await (altcha.current ?? neueAltcha()).catch(() => neueAltcha());
    } catch (e) {
      altcha.current = null;
      return setLage({ art: 'fehler', ergebnis: alsErgebnis(e) });
    }
    // jede Lösung gilt einmal: ein weiterer Versuch braucht eine neue
    altcha.current = null;
    const ergebnis = await sendeMeldung({ kurs, aufgabe, kategorie, altcha: loesung });
    if (ergebnis === 'ok') return setLage({ art: 'gesendet' });
    setLage({ art: 'fehler', ergebnis });
    if (ergebnis !== 'nicht_moeglich') neueAltcha();
  }

  const status =
    lage.art === 'sendet'
      ? texte.sendet
      : lage.art === 'gesendet'
        ? texte.danke
        : lage.art === 'fehler'
          ? {
              ohne_netz: texte.ohneNetz,
              zu_viele: texte.zuViele,
              nicht_moeglich: texte.nichtMoeglich,
              fehler: texte.fehler,
              ok: texte.danke,
            }[lage.ergebnis]
          : '';

  return (
    <dialog
      ref={ref}
      aria-labelledby={`${id}-titel`}
      onClose={onSchliessen}
      className="m-auto max-h-full w-full max-w-160 overflow-y-auto bg-transparent p-4 text-tinte backdrop:bg-tinte/55"
    >
      <div className="relative flex flex-col gap-4 rounded-lg bg-weiss p-5 md:p-8">
        <button
          type="button"
          aria-label={texte.schliessen}
          onClick={schliesse}
          className="absolute end-3 top-3 inline-flex size-12 druck items-center justify-center rounded-md border border-rand bg-weiss hover:bg-gruen-50"
        >
          <X aria-hidden className="size-6" />
        </button>
        <h2 id={`${id}-titel`} className="pe-14 text-24 font-bold">
          {texte.titel}
        </h2>
        {lage.art === 'gesendet' ? null : <p className="text-18">{texte.text}</p>}
        <form onSubmit={senden} noValidate className="flex flex-col gap-4">
          {lage.art === 'gesendet' ? null : (
            <fieldset
              className="flex flex-col gap-2"
              aria-describedby={fehltWahl && !kategorie ? `${id}-wahl` : undefined}
              disabled={lage.art === 'sendet'}
            >
              <legend className="mb-2 text-18 font-bold">{texte.kategorie}</legend>
              {(Object.keys(texte.kategorien) as MeldungKategorie[]).map((k, i) => (
                <label
                  key={k}
                  className="flex min-h-12 cursor-pointer items-center gap-3 rounded-md border-2 border-linie px-4 text-18 has-checked:border-gruen-700 has-checked:bg-gruen-50"
                >
                  <input
                    ref={i === 0 ? ersteWahl : undefined}
                    type="radio"
                    name="kategorie"
                    value={k}
                    checked={kategorie === k}
                    onChange={() => {
                      setKategorie(k);
                      setFehltWahl(false);
                    }}
                    className="size-5 shrink-0 accent-gruen-700"
                  />
                  {texte.kategorien[k]}
                </label>
              ))}
              {fehltWahl && !kategorie ? (
                <p id={`${id}-wahl`} className="text-16 font-bold text-fehler">
                  {texte.waehlen}
                </p>
              ) : null}
            </fieldset>
          )}
          {lage.art === 'gesendet' ? null : <p className="text-16 text-tinte-2">{texte.schutz}</p>}
          <p role="status" className={lage.art === 'fehler' ? 'text-18 font-bold text-fehler' : 'text-18 font-bold text-gruen-800'}>
            {status}
          </p>
          <div className="flex flex-wrap justify-end gap-3">
            {lage.art === 'gesendet' ? (
              <button
                ref={schliessenKnopf}
                type="button"
                onClick={schliesse}
                className={`${KNOPF} bg-gruen-700 text-weiss hover:bg-gruen-800`}
              >
                {texte.schliessen}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={schliesse}
                  className={`${KNOPF} border-2 border-gruen-700 bg-weiss text-gruen-800 hover:bg-gruen-50`}
                >
                  {texte.abbrechen}
                </button>
                <button
                  type="submit"
                  disabled={lage.art === 'sendet'}
                  className={`${KNOPF} bg-gruen-700 text-weiss hover:bg-gruen-800 disabled:bg-linie disabled:text-tinte-2`}
                >
                  {lage.art === 'sendet' ? texte.sendet : texte.senden}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </dialog>
  );
}
