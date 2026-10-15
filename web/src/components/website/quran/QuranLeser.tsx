'use client';

import { Check, ChevronDown, Minus, Palette, Play, Plus, SlidersHorizontal, Volume2 } from 'lucide-react';
import { lazy, Suspense, useEffect, useId, useRef, useState, useSyncExternalStore } from 'react';
import { TAJWID_FAMILIEN } from '@/lib/quran/tajwid';
import { fuelle, MODI, schreibe, SPEICHER, type LeserAusgabe, type LeserProps, type Modus } from './leser-typen';

/** Teile, die erst nach einer Handlung gebraucht werden, kommen als eigene Chunks nach (K-12). */
const Wortkarte = lazy(() => import('./Wortkarte'));
const TajwidLeiste = lazy(() => import('./TajwidLeiste'));
const Player = lazy(() => import('./Player'));
const OfflineSpeichern = lazy(() => import('./OfflineSpeichern'));

/** Farbfeld einer Tajwid-Familie: vier geschützte Leerzeichen, die Familienklasse zeichnet Farbe und Muster. */
const FARBFELD = '\u00a0'.repeat(4);

export type WortZiel = { el: HTMLElement; sure: number; vers: number; pos: number };

type Einstellungen = { modus?: Modus; tajwid?: 'an' | 'aus'; groesse?: number; ausgabe?: string | null };

/** Gespeicherte Einstellungen als Text (stabil für useSyncExternalStore); ohne Speicher null. */
function liesEinstellungen(): string | null {
  try {
    return window.localStorage.getItem(SPEICHER.einstellungen);
  } catch {
    return null;
  }
}

/** Änderungen aus anderen Fenstern derselben Seite. */
function abonniereSpeicher(neu: () => void) {
  window.addEventListener('storage', neu);
  return () => window.removeEventListener('storage', neu);
}

/** Nur bekannte Werte übernehmen; eine gespeicherte Ausgabe nur, wenn sie hier sichtbar ist. */
function gueltig(roh: string | null, ausgaben: readonly LeserAusgabe[]): Einstellungen {
  let e: Einstellungen = {};
  try {
    e = roh ? (JSON.parse(roh) as Einstellungen) : {};
  } catch {
    return {};
  }
  return {
    modus: e.modus && MODI.includes(e.modus) ? e.modus : undefined,
    tajwid: e.tajwid === 'an' || e.tajwid === 'aus' ? e.tajwid : undefined,
    groesse: typeof e.groesse === 'number' && e.groesse >= 1 && e.groesse <= 5 ? Math.round(e.groesse) : undefined,
    ausgabe: e.ausgabe && ausgaben.some((a) => a.id === e.ausgabe) ? e.ausgabe : undefined,
  };
}

function zielVon(w: HTMLElement): WortZiel | null {
  const li = w.closest<HTMLElement>('[data-v]');
  const liste = w.closest<HTMLElement>('[data-sure]');
  if (!li || !liste) return null;
  return { el: w, sure: Number(liste.dataset.sure), vers: Number(li.dataset.v), pos: Number(w.dataset.w) };
}

/** Wort fokussierbar machen (nur das gerade erreichte; der Vers bleibt der eine Tab-Halt) und fokussieren. */
function fokussiere(w: HTMLElement) {
  w.tabIndex = -1;
  w.setAttribute('role', 'button');
  w.setAttribute('aria-haspopup', 'dialog');
  w.focus();
}

/**
 * Insel des Koran-Lesers (O-Q01): Werkzeugleiste (Lesemodus, Ausgabe, Tajwid mit Legende, Schriftgröße, Abspielen) und
 * die Bedienung der statischen Verse – ein Tab-Halt je Vers, Pfeiltasten durch die Wörter (rechtsläufig: links =
 * weiter), Eingabe öffnet die Wortkarte. Wortkarte, Regel-Seitenleiste, Player und Ausgabewechsel laden erst bei
 * Bedarf. Einstellungen, Weiterlesen und Lesezeichen nur im Gerät (localStorage). Ohne JavaScript bleibt der Text voll
 * lesbar; die Leiste ist dann ausgeblendet.
 */
export function QuranLeser(props: LeserProps) {
  const { texte, ausgaben, rezitationen } = props;
  const t = texte.leser;
  const leiste = useRef<HTMLDivElement>(null);
  // Gespeicherte Ansicht (Server und Hydrierung: keine), dazu die Wahl in dieser Sitzung
  const gespeichert = gueltig(
    useSyncExternalStore(abonniereSpeicher, liesEinstellungen, () => null),
    ausgaben,
  );
  const [eigene, setEigene] = useState<Einstellungen>({});
  const modus = eigene.modus ?? gespeichert.modus ?? 'beide';
  const tajwid = (eigene.tajwid ?? gespeichert.tajwid ?? 'an') === 'an';
  const groesse = eigene.groesse ?? gespeichert.groesse ?? 2;
  const ausgabe = eigene.ausgabe !== undefined ? eigene.ausgabe : (gespeichert.ausgabe ?? props.ausgabe);
  const [offen, setOffen] = useState(false);
  const [wort, setWort] = useState<WortZiel | null>(null);
  const [regel, setRegel] = useState<{ schluessel: string; wort: WortZiel } | null>(null);
  const [spielt, setSpielt] = useState<HTMLElement | null>(null);
  const [meldung, setMeldung] = useState('');
  const panelId = useId();
  const hinweisId = useId();

  /** Einstellung ändern: für diese Sitzung und im Gerät. */
  const setze = (neu: Einstellungen) => {
    setEigene((alt) => ({ ...alt, ...neu }));
    schreibe(SPEICHER.einstellungen, { modus, tajwid: tajwid ? 'an' : 'aus', groesse, ausgabe, ...neu });
  };

  // Einhängen: Verse bedienbar machen, lange Suren nachsetzen, Weiterlesen merken
  useEffect(() => {
    const c = leiste.current?.closest<HTMLElement>('.leser');
    if (!c) return;
    c.classList.add('leser-bereit');
    for (const p of c.querySelectorAll<HTMLElement>('.vers-ar')) {
      p.tabIndex = 0;
      p.setAttribute('aria-describedby', hinweisId);
    }
    // Sehr lange Suren kommen als schlichter Text: Wörter und Tajwid nach dem ersten Zeichnen ergänzen
    if (c.querySelector('.vers-ar[data-roh]')) {
      const spaeter = window.requestIdleCallback ?? ((f: () => void) => setTimeout(f, 200));
      spaeter(() => void import('./anreichern').then(({ reichereAn }) => reichereAn(c, props.pfade.woerter)).catch(() => undefined));
    }

    const oeffne = (w: HTMLElement) => {
      const z = zielVon(w);
      if (!z) return;
      // Auch beim Antippen: aria-expanded nur an einem Element mit Rolle (wie beim Erreichen per Tastatur)
      w.setAttribute('role', 'button');
      w.setAttribute('aria-haspopup', 'dialog');
      w.setAttribute('aria-expanded', 'true');
      setWort(z);
    };
    const klick = (ev: MouseEvent) => {
      const w = (ev.target as Element).closest<HTMLElement>('.vers-ar [data-w]');
      if (w && c.contains(w)) oeffne(w);
    };
    const taste = (ev: KeyboardEvent) => {
      const ziel = ev.target as HTMLElement;
      const vers = ziel.closest<HTMLElement>('.vers-ar');
      if (!vers || !c.contains(vers)) return;
      const liste = [...vers.querySelectorAll<HTMLElement>('[data-w]')];
      if (!liste.length) return;
      const istWort = ziel.hasAttribute('data-w');
      const i = istWort ? liste.indexOf(ziel) : -1;
      let n: number | null = null;
      if (ev.key === 'ArrowLeft') n = istWort ? Math.min(i + 1, liste.length - 1) : 0;
      else if (ev.key === 'ArrowRight') n = istWort ? Math.max(i - 1, 0) : liste.length - 1;
      else if (ev.key === 'Home') n = 0;
      else if (ev.key === 'End') n = liste.length - 1;
      else if ((ev.key === 'Enter' || ev.key === ' ') && istWort) {
        ev.preventDefault();
        oeffne(ziel);
      } else if (ev.key === 'Enter') n = 0;
      else if (ev.key === 'Escape' && istWort) {
        ev.preventDefault();
        vers.focus();
      }
      if (n !== null) {
        ev.preventDefault();
        fokussiere(liste[n]);
      }
    };
    c.addEventListener('click', klick);
    c.addEventListener('keydown', taste);

    // Weiterlesen: der Vers im oberen Drittel des Fensters, gespeichert nach kurzer Ruhe
    let aktuell: HTMLElement | null = null;
    let uhr: ReturnType<typeof setTimeout> | undefined;
    const beobachter = new IntersectionObserver(
      (eintraege) => {
        for (const ein of eintraege) if (ein.isIntersecting) aktuell = ein.target as HTMLElement;
        clearTimeout(uhr);
        uhr = setTimeout(() => {
          const s = aktuell?.closest<HTMLElement>('[data-sure]')?.dataset.sure;
          if (aktuell && s)
            schreibe(SPEICHER.weiterlesen, { sure: Number(s), vers: Number(aktuell.dataset.v), cuz: props.cuz, zeit: Date.now() });
        }, 1500);
      },
      { rootMargin: '-15% 0px -60% 0px' },
    );
    for (const li of c.querySelectorAll('.vers')) beobachter.observe(li);
    return () => {
      c.removeEventListener('click', klick);
      c.removeEventListener('keydown', taste);
      beobachter.disconnect();
      clearTimeout(uhr);
    };
  }, [hinweisId, props.cuz, props.pfade.woerter]);

  // Einstellungen am Behälter: das CSS setzt Lesemodus, Tajwid-Farben und Schriftgröße um
  useEffect(() => {
    const c = leiste.current?.closest<HTMLElement>('.leser');
    if (!c) return;
    c.dataset.modus = modus;
    c.dataset.tajwid = tajwid ? 'an' : 'aus';
    c.dataset.groesse = String(groesse);
  }, [modus, tajwid, groesse]);

  // Andere Ausgabe: Text je Sure nachladen (eigener Chunk); `gezeigt` ist die Ausgabe, die gerade im Dokument steht
  const gezeigt = useRef(props.ausgabe);
  useEffect(() => {
    const c = leiste.current?.closest<HTMLElement>('.leser');
    if (!c || !ausgabe || ausgabe === gezeigt.current) return;
    let aktiv = true;
    void import('./ausgabe').then(({ setzeAusgabe }) =>
      setzeAusgabe(c, ausgabe, props.pfade.uebersetzung, texte, () => aktiv, setMeldung).then((ok) => {
        if (ok && aktiv) gezeigt.current = ausgabe;
      }),
    );
    return () => {
      aktiv = false;
    };
  }, [ausgabe, props.pfade.uebersetzung, texte]);

  const schliesseWort = () => {
    if (!wort) return;
    wort.el.removeAttribute('aria-expanded');
    fokussiere(wort.el);
    setWort(null);
  };

  const knopf =
    'inline-flex min-h-12 items-center gap-2 rounded-pill px-4 text-16 font-bold transition duration-(--dauer-rueckmeldung) druck';

  return (
    <div
      ref={leiste}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && offen) {
          setOffen(false);
          leiste.current?.querySelector<HTMLElement>('[aria-controls]')?.focus();
        }
      }}
      className="nur-mit-skript sticky top-0 z-(--ebene-kopf) border-b border-linie bg-papier"
    >
      <div role="group" aria-label={t.werkzeuge} className="mx-auto flex max-w-(--container-lesen) items-center gap-2 px-4 py-2 md:px-8">
        <button
          type="button"
          aria-expanded={offen}
          aria-controls={panelId}
          onClick={() => setOffen(!offen)}
          className={`${knopf} border ${offen ? 'border-gruen-700 bg-gruen-50' : 'border-rand bg-weiss'} text-tinte hover:border-gruen-700`}
        >
          <SlidersHorizontal aria-hidden className="size-5 text-gruen-700" />
          {t.ansicht}
          <ChevronDown aria-hidden className={`size-4 transition duration-(--dauer-rueckmeldung) ${offen ? 'rotate-180' : ''}`} />
        </button>
        <button
          type="button"
          aria-pressed={tajwid}
          onClick={() => setze({ tajwid: tajwid ? 'aus' : 'an' })}
          className={`${knopf} border ${tajwid ? 'border-gruen-700 bg-gruen-50 text-gruen-800' : 'border-rand bg-weiss text-tinte'}`}
        >
          <Palette aria-hidden className="size-5" />
          {t.tajwid}
          {/* Zustand nicht nur über die Farbe (WCAG 1.4.1): an = Häkchen */}
          {tajwid ? <Check aria-hidden className="size-4" /> : null}
        </button>
        <span className="ml-auto" />
        {rezitationen.length ? (
          <button
            type="button"
            onClick={() => setSpielt(leiste.current?.closest<HTMLElement>('.leser') ?? null)}
            className={`${knopf} bg-gruen-700 text-weiss hover:bg-gruen-800`}
          >
            <Play aria-hidden className="size-5" />
            {t.abspielen}
          </button>
        ) : (
          <span className="inline-flex items-center gap-2 text-16 text-tinte-2 max-md:hidden">
            <Volume2 aria-hidden className="size-5 shrink-0 text-gruen-700" />
            {t.rezitationFolgt}
          </span>
        )}
      </div>
      <p id={hinweisId} hidden>
        {t.tastatur}
      </p>
      <p role="status" className="sr-only">
        {meldung}
      </p>

      <div id={panelId} hidden={!offen} className="mx-auto max-w-(--container-lesen) px-4 pt-2 pb-5 md:px-8">
        <div className="grid gap-6 border-t border-linie pt-4 md:grid-cols-3">
          <fieldset className="flex flex-col gap-2 md:col-span-3">
            <legend className="mb-2 text-16 font-bold">{t.lesemodus}</legend>
            <div className="flex flex-wrap gap-2">
              {MODI.map((m) => (
                <label
                  key={m}
                  className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-pill border border-rand bg-weiss px-4 text-16 has-checked:border-gruen-700 has-checked:bg-gruen-50 has-focus-visible:outline-2 has-focus-visible:outline-gruen-950"
                >
                  <input
                    type="radio"
                    name={`${panelId}-modus`}
                    checked={modus === m}
                    onChange={() => setze({ modus: m })}
                    className="size-4 accent-gruen-700"
                  />
                  {t.modus[m]}
                </label>
              ))}
            </div>
          </fieldset>

          <>
            {ausgaben.length ? (
              <label className="flex min-w-0 flex-col gap-2 md:col-span-2">
                <span className="text-16 font-bold">{t.ausgabe}</span>
                <select
                  value={ausgabe ?? ''}
                  onChange={(e) => setze({ ausgabe: e.target.value })}
                  className="min-h-12 w-full rounded-md border border-rand bg-weiss px-3 text-16"
                >
                  {ausgabe ? null : <option value="">{t.ausgabeKeine}</option>}
                  {ausgaben.map((a) => (
                    <option key={a.id} value={a.id}>
                      {`${a.titel} (${a.sprache.toUpperCase()})${a.ausstehend ? ` – ${t.ausstehend}` : ''}`}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <div role="group" aria-label={t.schrift} className="flex items-center gap-3 md:self-end">
              <span className="text-16 font-bold">{t.schrift}</span>
              <button
                type="button"
                aria-label={t.kleiner}
                disabled={groesse <= 1}
                onClick={() => setze({ groesse: groesse - 1 })}
                className="inline-flex size-12 items-center justify-center rounded-pill border border-rand bg-weiss disabled:opacity-40"
              >
                <Minus aria-hidden className="size-5" />
              </button>
              <span aria-hidden className="flex gap-1">
                {[1, 2, 3, 4, 5].map((g) => (
                  <span key={g} className={`size-2 rounded-pill ${g <= groesse ? 'bg-gruen-700' : 'bg-linie'}`} />
                ))}
              </span>
              <button
                type="button"
                aria-label={t.groesser}
                disabled={groesse >= 5}
                onClick={() => setze({ groesse: groesse + 1 })}
                className="inline-flex size-12 items-center justify-center rounded-pill border border-rand bg-weiss disabled:opacity-40"
              >
                <Plus aria-hidden className="size-5" />
              </button>
            </div>
          </>

          <div className="flex flex-col gap-2 md:col-span-3">
            <h2 className="font-text text-16 font-bold">{t.legende}</h2>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3">
              {TAJWID_FAMILIEN.map((f) => (
                <li key={f} className="flex flex-wrap items-baseline gap-x-2 text-16">
                  <span className="inline-flex items-center gap-1.5">
                    <span aria-hidden className={`tj tj-${f} tj-probe`}>
                      {FARBFELD}
                    </span>
                    <span className={`tj tj-${f} bg-none font-bold no-underline`}>{texte.familien[f]}</span>
                  </span>
                  <span className="text-tinte-2">{texte.muster[f]}</span>
                </li>
              ))}
            </ul>
            <a href={props.pfade.tajwid} className="self-start text-16 font-bold">
              {t.legendeLink}
            </a>
          </div>
          <div className="flex flex-col gap-2 md:col-span-3">
            <h2 className="font-text text-16 font-bold">{texte.offline.titel}</h2>
            {offen ? (
              <Suspense fallback={null}>
                <OfflineSpeichern
                  texte={texte.offline}
                  pfade={props.pfade}
                  ausgabe={ausgabe}
                  htmlAusgabe={props.ausgabe}
                  rezitationen={rezitationen}
                  behaelter={() => leiste.current?.closest<HTMLElement>('.leser') ?? null}
                />
              </Suspense>
            ) : null}
          </div>
          {rezitationen.length ? null : (
            <p className="inline-flex items-center gap-2 text-16 text-tinte-2 md:hidden">
              <Volume2 aria-hidden className="size-5 shrink-0 text-gruen-700" />
              {t.rezitationFolgt}
            </p>
          )}
        </div>
      </div>

      <Suspense fallback={null}>
        {wort ? (
          <Wortkarte
            ziel={wort}
            texte={texte}
            sprache={props.sprache}
            pfadWoerter={props.pfade.woerter}
            onSchliessen={schliesseWort}
            onRegel={(schluessel) => {
              wort.el.removeAttribute('aria-expanded');
              setWort(null);
              setRegel({ schluessel, wort });
            }}
            onLesezeichen={() => {
              schreibe(SPEICHER.lesezeichen, { sure: wort.sure, vers: wort.vers, cuz: props.cuz, zeit: Date.now() });
              setMeldung(fuelle(t.lesezeichenGesetzt, { nr: wort.vers }));
            }}
          />
        ) : null}
        {regel ? (
          <TajwidLeiste
            schluessel={regel.schluessel}
            wort={regel.wort}
            texte={texte}
            sprache={props.sprache}
            pfadWoerter={props.pfade.woerter}
            pfadTajwid={props.pfade.tajwid}
            onSchliessen={() => {
              fokussiere(regel.wort.el);
              setRegel(null);
            }}
          />
        ) : null}
        {spielt ? (
          <Player
            rezitationen={rezitationen}
            texte={texte}
            pfadZeiten={props.pfade.zeiten}
            behaelter={spielt}
            onSchliessen={() => setSpielt(null)}
          />
        ) : null}
      </Suspense>
    </div>
  );
}
