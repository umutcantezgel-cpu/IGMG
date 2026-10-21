'use client';

import { ChevronLeft, ChevronRight, Save, Shuffle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { type KeyboardEvent, useId, useRef, useState, useSyncExternalStore, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Meldung } from '@/components/verwaltung/Meldung';
import { FEHLER, KRITISCHE_FEHLER } from '@/lib/lernapp/freigabe';
import { formatiere } from '@/lib/lernapp/format';
import { type Oberflaeche, richtung, type Sprache } from '@/lib/lernapp/kurse';
import type { LernappZustand } from '@/lib/lernapp/verwaltung/aktion';
import { cn } from '@/lib/utils';
import { eintragPruefen, stichprobeZiehen } from '@/server/actions/lernapp-sprachpruefung';
import { ClipAnhoeren, type ClipQuelle } from './ClipAnhoeren';

/**
 * Prüfoberfläche Sprache (ADR 0041 Nr. 10, PLAN §7.2; L3-06). Dreisprachig ist nur die Bedienung (`ui`, Texte als Props aus
 * `messages/verwaltung/lernapp-pruefung.json`); das Gerüst bleibt links-nach-rechts, jeder Text trägt `lang` und `dir`,
 * Inhaltsblöcke die Sprache ihres Inhalts. Tastenkürzel: 1 = in Ordnung und weiter, 2 = Korrektur, 3 = abgelehnt,
 * N/P = nächster bzw. vorheriger Eintrag. Sie wirken nur, solange der Fokus im Prüfbereich liegt und nicht in einem
 * Eingabefeld, und lassen sich ausschalten (WCAG 2.1.4, KERN 4.0 §8); gehaltene Tasten und Eingaben während des Speicherns
 * zählen nicht.
 */

/** Schalter „Tastenkürzel“ je Gerät (Bequemlichkeit, `localStorage`; ohne Speicher gilt er für diese Sitzung). */
const KUERZEL_SCHLUESSEL = 'igmg-verwaltung-pruefung-kuerzel';
let kuerzelOhneSpeicher: boolean | null = null;
const kuerzelHoerer = new Set<() => void>();
function kuerzelLesen(): boolean {
  if (kuerzelOhneSpeicher !== null) return kuerzelOhneSpeicher;
  try {
    return window.localStorage.getItem(KUERZEL_SCHLUESSEL) !== 'aus';
  } catch {
    return true;
  }
}
function kuerzelSetzen(an: boolean) {
  kuerzelOhneSpeicher = an;
  try {
    window.localStorage.setItem(KUERZEL_SCHLUESSEL, an ? 'an' : 'aus');
  } catch {
    // ohne Speicher: nur für diese Sitzung
  }
  kuerzelHoerer.forEach((f) => f());
}
function kuerzelAbo(f: () => void) {
  kuerzelHoerer.add(f);
  return () => {
    kuerzelHoerer.delete(f);
  };
}

/** Eingabefelder, in denen Ziffern und Buchstaben Eingaben sind (Kürzel wirken dort nie). */
function istEingabe(ziel: EventTarget | null): boolean {
  if (!(ziel instanceof HTMLElement)) return false;
  return ziel.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(ziel.tagName);
}

type Texte = Record<string, string>;
type Urteil = 'ok' | 'korrektur' | 'abgelehnt';

const sprachAttr = (s: Sprache) => ({ lang: s, dir: richtung(s) });
const arabisch = (s: Sprache) => (s === 'ar' ? 'font-arabic text-arabisch-3' : undefined);

/** Stichprobe ziehen und sie danach öffnen (Weiterleitung im selben Übergang, unabhängig vom Neuzeichnen der Warteschlange). */
export function ZiehenKnopf({
  einheit,
  art,
  richtung: r,
  ui,
  texte,
}: {
  einheit: string;
  art: string;
  richtung: string | null;
  ui: Oberflaeche;
  texte: { knopf: string; laeuft: string; fehler: Texte };
}) {
  const router = useRouter();
  const [z, setZ] = useState<LernappZustand>({});
  const [laeuft, starte] = useTransition();
  const absenden = (fd: FormData) =>
    starte(async () => {
      const ergebnis = await stichprobeZiehen({}, fd);
      setZ(ergebnis);
      if (ergebnis.id) router.push(`/verwaltung/lernapp/sprachpruefung/${ergebnis.id}?ui=${ui}`);
    });
  return (
    <form action={absenden} className="flex flex-col gap-2">
      <input type="hidden" name="einheit" value={einheit} />
      <input type="hidden" name="art" value={art} />
      {r ? <input type="hidden" name="richtung" value={r} /> : null}
      {z.fehler ? (
        <p role="alert" {...sprachAttr(ui)} className="text-16 font-bold text-fehler">
          {texte.fehler[z.fehler] ?? texte.fehler.unbekannt}
        </p>
      ) : null}
      <Button type="submit" variant="secondary" size="sm" disabled={laeuft} className="self-start" {...sprachAttr(ui)}>
        <Shuffle aria-hidden />
        {laeuft ? texte.laeuft : texte.knopf}
      </Button>
    </form>
  );
}

export type PruefEintrag = {
  schluessel: string;
  /** Sprache des Zieltexts bzw. der Übersetzung */
  zielSprache: Sprache;
  ausgangSprache: Sprache | null;
  text: string;
  uebersetzung: { text: string; alternativen: string[] } | null;
  clip: ClipQuelle | null;
  fehlt: boolean;
  urteil: { urteil: Urteil; kategorie: string | null } | null;
};

export function PruefOberflaeche({
  stichprobe,
  ui,
  art,
  eintraege: start,
  offen,
  texte,
}: {
  stichprobe: string;
  ui: Oberflaeche;
  art: 'zieltext' | 'uebersetzung' | 'audio';
  eintraege: PruefEintrag[];
  /** Stichprobe noch nicht entschieden */
  offen: boolean;
  texte: { s: Texte; urteile: Record<Urteil, string>; kategorien: Record<string, string>; tasten: Texte; fehler: Texte };
}) {
  const router = useRouter();
  const id = useId();
  const [eintraege, setEintraege] = useState(start);
  const ersterOffener = Math.max(
    0,
    start.findIndex((e) => !e.urteil && !e.fehlt),
  );
  const [nr, setNr] = useState(ersterOffener);
  const [urteil, setUrteil] = useState<Urteil | null>(null);
  const [kategorie, setKategorie] = useState<string | null>(null);
  const [meldung, setMeldung] = useState<{ art: 'fehler' | 'erfolg'; text: string } | null>(null);
  const [feldFehler, setFeldFehler] = useState<LernappZustand['feldFehler']>({});
  const [laeuft, starte] = useTransition();
  const kuerzel = useSyncExternalStore(kuerzelAbo, kuerzelLesen, () => true);
  // Sperre gegen doppeltes Absenden (gehaltene oder doppelt gedrückte Taste), gilt sofort, nicht erst nach dem Neuzeichnen
  const sendet = useRef(false);
  const kuerzelId = useId();
  const kopf = useRef<HTMLHeadingElement>(null);
  const korrekturFeld = useRef<HTMLTextAreaElement>(null);
  const kategorieGruppe = useRef<HTMLFieldSetElement>(null);
  const formular = useRef<HTMLFormElement>(null);
  const e = eintraege[nr];
  const ui$ = sprachAttr(ui);
  const urteilSprache = art === 'uebersetzung' && e?.ausgangSprache ? e.ausgangSprache : (e?.zielSprache ?? ui);

  function zeige(i: number) {
    const ziel = Math.min(Math.max(0, i), eintraege.length - 1);
    setNr(ziel);
    setUrteil(null);
    setKategorie(null);
    setFeldFehler({});
    requestAnimationFrame(() => kopf.current?.focus());
  }

  function sende(neu: Urteil, felder: FormData) {
    if (!e || e.fehlt || !offen || laeuft || sendet.current) return;
    sendet.current = true;
    felder.set('stichprobe', stichprobe);
    felder.set('eintrag', e.schluessel);
    felder.set('urteil', neu);
    setMeldung(null);
    starte(async () => {
      const z = await eintragPruefen({}, felder).finally(() => {
        sendet.current = false;
      });
      if (z.fehler) {
        setFeldFehler(z.feldFehler ?? {});
        setMeldung({ art: 'fehler', text: texte.fehler[z.fehler] ?? texte.fehler.unbekannt! });
        return;
      }
      const kat = neu === 'ok' ? null : String(felder.get('kategorie') ?? '') || null;
      const liste = eintraege.map((x, i) => (i === nr ? { ...x, urteil: { urteil: neu, kategorie: kat } } : x));
      setEintraege(liste);
      setMeldung({ art: 'erfolg', text: texte.s.gespeichert! });
      if (z.hinweis === 'bestanden' || z.hinweis === 'nachbessern') {
        router.refresh();
        return;
      }
      const naechster = liste.findIndex((x, i) => i > nr && !x.urteil && !x.fehlt);
      const irgendeiner = liste.findIndex((x) => !x.urteil && !x.fehlt);
      zeige(naechster >= 0 ? naechster : irgendeiner >= 0 ? irgendeiner : nr);
    });
  }

  // Tastenkürzel: nur im Prüfbereich (Hörer am Abschnitt), nur eingeschaltet, nie in Eingabefeldern, ohne Wiederholung
  function taste(ev: KeyboardEvent<HTMLElement>) {
    if (!kuerzel || ev.repeat || ev.altKey || ev.ctrlKey || ev.metaKey || istEingabe(ev.target)) return;
    if (ev.key === '1') {
      ev.preventDefault();
      sende('ok', new FormData());
    } else if (ev.key === '2') {
      ev.preventDefault();
      setUrteil('korrektur');
      requestAnimationFrame(() => korrekturFeld.current?.focus());
    } else if (ev.key === '3') {
      ev.preventDefault();
      setUrteil('abgelehnt');
      requestAnimationFrame(() => kategorieGruppe.current?.querySelector('input')?.focus());
    } else if (ev.key === 'n' || ev.key === 'N') {
      ev.preventDefault();
      zeige(nr + 1);
    } else if (ev.key === 'p' || ev.key === 'P') {
      ev.preventDefault();
      zeige(nr - 1);
    }
  }

  if (!e) return null;
  const geprueft = eintraege.filter((x) => x.urteil && !x.fehlt).length;
  const fehlerText = (feld: string) => {
    const k = feldFehler?.[feld];
    return k ? (texte.fehler[k] ?? texte.fehler.pruefen) : undefined;
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <section
        aria-labelledby={`${id}-kopf`}
        onKeyDown={taste}
        className="flex min-w-0 flex-col gap-4 rounded-lg border border-linie bg-weiss p-4 md:p-6 lg:col-span-2"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id={`${id}-kopf`} ref={kopf} tabIndex={-1} className="text-24 outline-none" {...ui$}>
            {formatiere(texte.s.eintrag!, { nr: nr + 1, anzahl: eintraege.length }, ui, 'westlich')}
          </h2>
          <p className="text-16 text-tinte-2" {...ui$}>
            {formatiere(texte.s.fortschritt!, { geprueft, groesse: eintraege.filter((x) => !x.fehlt).length }, ui, 'westlich')}
          </p>
        </div>
        <p className="font-mono text-16 text-tinte-2">{e.schluessel}</p>
        <div aria-live="polite" className="empty:hidden">
          {meldung ? <Meldung art={meldung.art}>{<span {...ui$}>{meldung.text}</span>}</Meldung> : null}
        </div>
        {e.fehlt ? (
          <Meldung art="info">
            <span {...ui$}>{texte.s.fehlt}</span>
          </Meldung>
        ) : (
          <>
            <div className="flex flex-col gap-1">
              <h3 className="text-16 font-bold text-tinte-2" {...ui$}>
                {texte.s.zieltext}
              </h3>
              <p {...sprachAttr(e.zielSprache)} className={cn('text-24', arabisch(e.zielSprache))}>
                {e.text}
              </p>
            </div>
            {e.uebersetzung && e.ausgangSprache ? (
              <div className="flex flex-col gap-1">
                <h3 className="text-16 font-bold text-tinte-2" {...ui$}>
                  {texte.s.uebersetzung}
                </h3>
                <p {...sprachAttr(e.ausgangSprache)} className={cn('text-24', arabisch(e.ausgangSprache))}>
                  {e.uebersetzung.text}
                </p>
                {e.uebersetzung.alternativen.length ? (
                  <>
                    <h4 className="text-16 font-bold text-tinte-2" {...ui$}>
                      {texte.s.alternativen}
                    </h4>
                    <ul {...sprachAttr(e.ausgangSprache)} className={cn('list-disc ps-6', arabisch(e.ausgangSprache))}>
                      {e.uebersetzung.alternativen.map((a) => (
                        <li key={a}>{a}</li>
                      ))}
                    </ul>
                  </>
                ) : null}
              </div>
            ) : null}
            {e.clip ? (
              <div className="flex flex-col gap-1" {...ui$}>
                <h3 className="text-16 font-bold text-tinte-2">{texte.s.clip}</h3>
                <ClipAnhoeren
                  quelle={e.clip}
                  texte={{ anhoeren: texte.s.anhoeren!, langsam: texte.s.langsam!, stopp: texte.s.anhalten!, fehler: texte.s.clipFehlt! }}
                />
              </div>
            ) : null}
            {e.urteil ? (
              <p className="font-bold" {...ui$}>
                {formatiere(
                  texte.s.beurteilt!,
                  {
                    urteil: `${texte.urteile[e.urteil.urteil]}${e.urteil.kategorie ? ` (${texte.kategorien[e.urteil.kategorie] ?? e.urteil.kategorie})` : ''}`,
                  },
                  ui,
                )}
              </p>
            ) : null}
            {offen ? (
              <form
                ref={formular}
                noValidate
                onSubmit={(ev) => {
                  ev.preventDefault();
                  if (urteil) sende(urteil, new FormData(ev.currentTarget));
                  else setFeldFehler({ urteil: 'urteilFehlt' });
                }}
                className="flex flex-col gap-4"
              >
                <fieldset className="flex flex-col gap-2" aria-describedby={fehlerText('urteil') ? `${id}-urteil-fehler` : undefined}>
                  <legend className="font-bold" {...ui$}>
                    {texte.s.urteil}
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {(['ok', 'korrektur', 'abgelehnt'] as const).map((u, i) => (
                      <label
                        key={u}
                        className={cn(
                          'inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-md border px-4 font-bold',
                          urteil === u ? 'border-gruen-700 bg-gruen-50' : 'border-rand bg-weiss',
                        )}
                        {...ui$}
                      >
                        <input
                          type="radio"
                          name="urteil-wahl"
                          value={u}
                          checked={urteil === u}
                          onChange={() => setUrteil(u)}
                          aria-keyshortcuts={kuerzel ? String(i + 1) : undefined}
                          className="size-5"
                        />
                        {texte.urteile[u]}
                      </label>
                    ))}
                  </div>
                  {fehlerText('urteil') ? (
                    <p id={`${id}-urteil-fehler`} className="text-16 font-bold text-fehler" {...ui$}>
                      {fehlerText('urteil')}
                    </p>
                  ) : null}
                </fieldset>
                {urteil && urteil !== 'ok' ? (
                  <>
                    <fieldset ref={kategorieGruppe} className="flex flex-col gap-2">
                      <legend className="font-bold" {...ui$}>
                        {texte.s.kategorie}
                      </legend>
                      {[
                        { titel: texte.s.kritisch, liste: FEHLER.filter((f) => KRITISCHE_FEHLER.includes(f)) },
                        { titel: texte.s.leicht, liste: FEHLER.filter((f) => !KRITISCHE_FEHLER.includes(f)) },
                      ].map((g) => (
                        <div key={g.titel} className="flex flex-col gap-1">
                          <span className="text-16 text-tinte-2" {...ui$}>
                            {g.titel}
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {g.liste.map((f) => (
                              <label
                                key={f}
                                className={cn(
                                  'inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-md border px-3',
                                  kategorie === f ? 'border-gruen-700 bg-gruen-50' : 'border-rand bg-weiss',
                                )}
                                {...ui$}
                              >
                                <input
                                  type="radio"
                                  name="kategorie"
                                  value={f}
                                  checked={kategorie === f}
                                  onChange={() => setKategorie(f)}
                                  className="size-5"
                                />
                                {texte.kategorien[f]}
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                      {fehlerText('kategorie') ? (
                        <p className="text-16 font-bold text-fehler" {...ui$}>
                          {fehlerText('kategorie')}
                        </p>
                      ) : null}
                    </fieldset>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor={`${id}-korrektur`} className="font-bold" {...ui$}>
                        {texte.s.korrektur}
                      </label>
                      <textarea
                        ref={korrekturFeld}
                        id={`${id}-korrektur`}
                        name="korrektur"
                        rows={3}
                        maxLength={600}
                        {...sprachAttr(urteilSprache)}
                        aria-describedby={`${id}-korrektur-hinweis`}
                        aria-invalid={fehlerText('korrektur') ? true : undefined}
                        className={cn(
                          'w-full rounded-md border border-rand bg-weiss px-3.5 py-2 text-18 aria-invalid:border-2 aria-invalid:border-fehler',
                          arabisch(urteilSprache),
                        )}
                      />
                      <p id={`${id}-korrektur-hinweis`} className="text-16 text-tinte-2" {...ui$}>
                        {texte.s.korrekturHinweis}
                      </p>
                      {fehlerText('korrektur') ? (
                        <p className="text-16 font-bold text-fehler" {...ui$}>
                          {fehlerText('korrektur')}
                        </p>
                      ) : null}
                    </div>
                  </>
                ) : null}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor={`${id}-kommentar`} className="font-bold" {...ui$}>
                    {texte.s.kommentar}
                  </label>
                  <textarea
                    id={`${id}-kommentar`}
                    name="kommentar"
                    rows={2}
                    maxLength={500}
                    dir="auto"
                    aria-invalid={fehlerText('kommentar') ? true : undefined}
                    className="w-full rounded-md border border-rand bg-weiss px-3.5 py-2 text-18 aria-invalid:border-2 aria-invalid:border-fehler"
                  />
                  {fehlerText('kommentar') ? (
                    <p className="text-16 font-bold text-fehler" {...ui$}>
                      {fehlerText('kommentar')}
                    </p>
                  ) : null}
                </div>
                <Button type="submit" disabled={laeuft} className="self-start" {...ui$}>
                  <Save aria-hidden />
                  {laeuft ? texte.s.laeuft : texte.s.speichern}
                </Button>
              </form>
            ) : null}
          </>
        )}
        <div className="flex flex-wrap gap-2 border-t border-linie pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => zeige(nr - 1)}
            disabled={nr === 0}
            aria-keyshortcuts={kuerzel ? 'P' : undefined}
            {...ui$}
          >
            <ChevronLeft aria-hidden />
            {texte.s.voriger}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => zeige(nr + 1)}
            disabled={nr >= eintraege.length - 1}
            aria-keyshortcuts={kuerzel ? 'N' : undefined}
            {...ui$}
          >
            {texte.s.naechster}
            <ChevronRight aria-hidden />
          </Button>
        </div>
      </section>
      <aside className="flex flex-col gap-4">
        <section aria-labelledby={`${id}-liste`} className="flex flex-col gap-2 rounded-lg border border-linie bg-weiss p-4">
          <h2 id={`${id}-liste`} className="text-20" {...ui$}>
            {texte.s.liste}
          </h2>
          <ol className="flex flex-col gap-1">
            {eintraege.map((x, i) => (
              <li key={x.schluessel}>
                <button
                  type="button"
                  onClick={() => zeige(i)}
                  aria-current={i === nr ? 'step' : undefined}
                  className={cn(
                    'flex min-h-11 w-full items-center justify-between gap-2 rounded-md px-2 text-start text-16',
                    i === nr ? 'bg-gruen-50 font-bold' : 'hover:bg-sand',
                  )}
                >
                  <span className="min-w-0 truncate font-mono">{x.schluessel}</span>
                  <span className="shrink-0" {...ui$}>
                    {x.fehlt ? '–' : x.urteil ? texte.urteile[x.urteil.urteil] : texte.s.offen}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </section>
        <section aria-labelledby={`${id}-tasten`} className="flex flex-col gap-2 rounded-lg border border-linie bg-weiss p-4" {...ui$}>
          <h2 id={`${id}-tasten`} className="text-20">
            {texte.tasten.titel}
          </h2>
          <label htmlFor={kuerzelId} className="flex min-h-12 cursor-pointer items-center gap-3 font-bold">
            <input
              id={kuerzelId}
              type="checkbox"
              checked={kuerzel}
              onChange={(ev) => kuerzelSetzen(ev.currentTarget.checked)}
              className="size-5"
            />
            {texte.tasten.schalter}
          </label>
          <ul className={cn('flex flex-col gap-1 text-16', !kuerzel && 'text-tinte-2')}>
            {(['ok', 'korrektur', 'abgelehnt', 'naechster', 'voriger'] as const).map((k) => (
              <li key={k}>{texte.tasten[k]}</li>
            ))}
          </ul>
          <p className="text-16 text-tinte-2">{texte.tasten.hinweis}</p>
        </section>
      </aside>
    </div>
  );
}
