'use client';

import { useCallback, useEffect, useId, useMemo, useState, type ReactNode } from 'react';
import { addiereTage, freieRuhetage, ruhezeitraeume } from '@/lib/lernapp/ereignisse/serie';
import { formatiere, intlSprache, type Ziffern } from '@/lib/lernapp/format';
import type { Oberflaeche, Sprache } from '@/lib/lernapp/kurse';
import {
  einstellungsSpeicher,
  ladeRuhetage,
  PAUSETAGE,
  pruefeRuhezeit,
  RUHEZEIT_HOECHSTENS,
  STANDARD_EINSTELLUNGEN,
  TAGESZIELE,
  trageRuhezeitEin,
  zielAus,
  zielSchluessel,
  type Einstellungen,
  type RuhezeitFehler,
} from '@/lib/lernapp/oberflaeche/einstellungen';
import { heute, STAND_GEAENDERT } from '@/lib/lernapp/oberflaeche/geraet';

export type EinstellungenTexte = {
  ausgang: string;
  ausgangText: string;
  ausgangWieOberflaeche: string;
  tagesziel: string;
  tageszielText: string;
  zielKeins: string;
  zielXp: string;
  zielLektionen: string;
  ziffern: string;
  ziffernText: string;
  ziffernArab: string;
  ziffernLatn: string;
  uebungen: string;
  hoeren: string;
  hoerenText: string;
  sprechen: string;
  sprechenText: string;
  serie: string;
  serieText: string;
  pausetage: string;
  ruhezeit: string;
  ruhezeitText: string;
  ruhezeitVon: string;
  ruhezeitBis: string;
  ruhezeitEintragen: string;
  ruhezeitEingetragen: string;
  ruhezeitFrei: string;
  ruhezeitListe: string;
  ruhezeitZeitraum: string;
  ruhezeitFehler: Record<RuhezeitFehler, string>;
  gespeichert: string;
  nichtGespeichert: string;
};

const ZEILE = 'flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-3 py-2 hover:bg-gruen-50';
const FELD = 'size-5 shrink-0 accent-gruen-700';
const DATUM = 'min-h-11 rounded-md border border-rand bg-weiss px-3 text-18';

function Gruppe({ id, titel, text, children }: { id: string; titel: string; text?: string; children: ReactNode }) {
  return (
    <fieldset
      aria-describedby={text ? `${id}-text` : undefined}
      className="flex flex-col gap-2 rounded-lg border border-linie bg-weiss p-5"
    >
      <legend className="float-start w-full font-display text-24">{titel}</legend>
      {text ? (
        <p id={`${id}-text`} className="text-16 text-tinte-2">
          {text}
        </p>
      ) : null}
      <div className="flex flex-col gap-1">{children}</div>
    </fieldset>
  );
}

/**
 * Ruhezeit (ADR 0043 Nr. 3): Zeitraum von–bis eintragen (Ereignis `pause`, höchstens 30 Tage am Stück und 30 Tage je
 * Kalenderjahr), vorher oder nachträglich. Geprüft wird vor dem Eintragen (`pruefeRuhezeit`); Fehler stehen als Text am
 * Feld (WCAG 3.3.1), die Bestätigung in der einen Live-Region des Formulars (`melde`). Eingetragene Zeiträume stehen als
 * Liste darunter; das Protokoll nimmt nur Neues an, darum gibt es kein Entfernen.
 */
function Ruhezeit({
  ui,
  ziffern,
  texte,
  melde,
}: {
  ui: Oberflaeche;
  ziffern: Ziffern;
  texte: EinstellungenTexte;
  melde: (text: string) => void;
}) {
  const id = useId();
  // Lerntag und Ruhetage erst im Browser (die Hülle ist statisch vorgerendert und kennt weder Datum noch Gerät)
  const [stand, setStand] = useState<{ tage: string[]; jetzt: string } | null>(null);
  const [von, setVon] = useState('');
  const [bis, setBis] = useState('');
  const [fehler, setFehler] = useState<RuhezeitFehler | null>(null);
  const [laeuft, setLaeuft] = useState(false);
  const lade = useCallback(
    () =>
      void ladeRuhetage().then(
        (tage) => setStand({ tage, jetzt: heute() }),
        () => setStand({ tage: [], jetzt: heute() }),
      ),
    [],
  );
  useEffect(() => {
    lade();
    window.addEventListener(STAND_GEAENDERT, lade);
    return () => window.removeEventListener(STAND_GEAENDERT, lade);
  }, [lade]);

  const tage = stand?.tage ?? [];
  const jetzt = stand?.jetzt;
  const datum = new Intl.DateTimeFormat(intlSprache(ui, ziffern), { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  const zeige = (tag: string) => datum.format(new Date(`${tag}T00:00:00Z`));
  const jahr = jetzt?.slice(0, 4);
  const zeitraeume = jahr ? ruhezeitraeume(tage).filter((z) => z.bis >= `${jahr}-01-01`) : [];

  async function eintragen() {
    const f = pruefeRuhezeit(von, bis, jetzt ?? heute(), tage);
    setFehler(f);
    if (f) return;
    setLaeuft(true);
    const ok = await trageRuhezeitEin(ui, von, bis);
    setLaeuft(false);
    if (ok) {
      setVon('');
      setBis('');
    }
    melde(ok ? texte.ruhezeitEingetragen : texte.nichtGespeichert);
    lade();
  }

  return (
    <div className="flex flex-col gap-3 border-t border-linie pt-4">
      <h3 id={`${id}-titel`} className="font-bold">
        {texte.ruhezeit}
      </h3>
      <p className="text-16 text-tinte-2">{texte.ruhezeitText}</p>
      <p className="min-h-6 text-16">
        {jahr ? formatiere(texte.ruhezeitFrei, { n: freieRuhetage(tage, jahr, RUHEZEIT_HOECHSTENS) }, ui, ziffern) : null}
      </p>
      <div role="group" aria-labelledby={`${id}-titel`} className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-16 font-bold">
          {texte.ruhezeitVon}
          <input
            type="date"
            value={von}
            min={jetzt ? addiereTage(jetzt, -366) : undefined}
            max={jetzt ? addiereTage(jetzt, 366) : undefined}
            onChange={(e) => setVon(e.target.value)}
            aria-invalid={fehler ? true : undefined}
            aria-describedby={fehler ? `${id}-fehler` : undefined}
            className={DATUM}
          />
        </label>
        <label className="flex flex-col gap-1 text-16 font-bold">
          {texte.ruhezeitBis}
          <input
            type="date"
            value={bis}
            min={von || (jetzt ? addiereTage(jetzt, -366) : undefined)}
            max={jetzt ? addiereTage(jetzt, 366) : undefined}
            onChange={(e) => setBis(e.target.value)}
            aria-invalid={fehler ? true : undefined}
            aria-describedby={fehler ? `${id}-fehler` : undefined}
            className={DATUM}
          />
        </label>
        <button
          type="button"
          onClick={() => void eintragen()}
          disabled={laeuft}
          className="min-h-11 druck rounded-pill bg-gruen-700 px-6 font-bold text-weiss hover:bg-gruen-800 disabled:bg-linie disabled:text-tinte-2"
        >
          {texte.ruhezeitEintragen}
        </button>
      </div>
      {fehler ? (
        <p id={`${id}-fehler`} className="text-16 font-bold text-fehler">
          {texte.ruhezeitFehler[fehler]}
        </p>
      ) : null}
      {zeitraeume.length ? (
        <div className="flex flex-col gap-1">
          <p className="text-16 font-bold">{texte.ruhezeitListe}</p>
          <ul className="flex flex-col gap-1 text-16">
            {zeitraeume.map((z) => (
              <li key={z.von}>{formatiere(texte.ruhezeitZeitraum, { von: zeige(z.von), bis: zeige(z.bis) }, ui, ziffern)}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

/**
 * Einstellungen auf dem Gerät (PLAN §3.1, ADR 0037 Nr. 7, ADR 0043 Nr. 2–3, KERN 4.0 §7–§8): Ausgangssprache, Tagesziel,
 * Serie (Pausetage je Woche 0–3, Ruhezeit), Ziffern (nur in der arabischen Oberfläche), Hör- und Sprechübungen. Jede Änderung wird sofort gespeichert (kein
 * Absenden, kein Kontextwechsel – WCAG 3.2.2) und in einer Live-Region bestätigt. Formular ohne JavaScript bleibt
 * lesbar; gespeichert wird im Protokoll des Profils auf dem Gerät (Ereignis `einstellung` bzw. `tagesziel`, kein Netz;
 * mit gebundenem Konto gleicht der Abgleich sie ab).
 */
export function EinstellungenFormular({
  ui,
  texte,
  sprachen,
}: {
  ui: Oberflaeche;
  texte: EinstellungenTexte;
  /** Ausgangssprachen mit Eigennamen (in ihrer Sprache) */
  sprachen: { sprache: Sprache; eigenname: string; dir: 'ltr' | 'rtl' }[];
}) {
  const [e, setE] = useState<Einstellungen>(STANDARD_EINSTELLUNGEN);
  const [meldung, setMeldung] = useState('');
  const speicher = useMemo(() => einstellungsSpeicher(ui), [ui]);
  useEffect(() => {
    let aktiv = true;
    const laden = () => void speicher.laden().then((neu) => aktiv && setE(neu));
    laden();
    // ein Abgleich kann Einstellungen eines anderen Geräts bringen
    window.addEventListener(STAND_GEAENDERT, laden);
    return () => {
      aktiv = false;
      window.removeEventListener(STAND_GEAENDERT, laden);
    };
  }, [speicher]);

  const aendern = (teil: Partial<Einstellungen>) => {
    const neu = { ...e, ...teil };
    setE(neu);
    void speicher.speichern(neu).then((ok) => setMeldung(ok ? texte.gespeichert : texte.nichtGespeichert));
  };

  const zahlSprache = (z: Ziffern = e.ziffern) => intlSprache(ui, z);
  const zielText = (schluessel: string) => {
    const ziel = zielAus(schluessel);
    if (!ziel || ziel.art === 'kein') return texte.zielKeins;
    return formatiere(ziel.art === 'xp' ? texte.zielXp : texte.zielLektionen, { n: ziel.wert }, ui, e.ziffern);
  };

  return (
    <div className="flex flex-col gap-6">
      <Gruppe id="ausgang" titel={texte.ausgang} text={texte.ausgangText}>
        <label className={ZEILE}>
          <input type="radio" name="ausgang" className={FELD} checked={e.ausgang === null} onChange={() => aendern({ ausgang: null })} />
          {texte.ausgangWieOberflaeche}
        </label>
        {sprachen.map((s) => (
          <label key={s.sprache} className={ZEILE}>
            <input
              type="radio"
              name="ausgang"
              value={s.sprache}
              className={FELD}
              checked={e.ausgang === s.sprache}
              onChange={() => aendern({ ausgang: s.sprache })}
            />
            <span lang={s.sprache} dir={s.dir}>
              {s.eigenname}
            </span>
          </label>
        ))}
      </Gruppe>

      <Gruppe id="tagesziel" titel={texte.tagesziel} text={texte.tageszielText}>
        {TAGESZIELE.map((z) => {
          const schluessel = zielSchluessel(z);
          return (
            <label key={schluessel} className={ZEILE}>
              <input
                type="radio"
                name="tagesziel"
                value={schluessel}
                className={FELD}
                checked={zielSchluessel(e.tagesziel) === schluessel}
                onChange={() => aendern({ tagesziel: z })}
              />
              {zielText(schluessel)}
            </label>
          );
        })}
      </Gruppe>

      <Gruppe id="serie" titel={texte.serie} text={texte.serieText}>
        {PAUSETAGE.map((n) => (
          <label key={n} className={ZEILE}>
            <input
              type="radio"
              name="pausetage"
              value={n}
              className={FELD}
              checked={e.pausetage === n}
              onChange={() => aendern({ pausetage: n })}
            />
            {formatiere(texte.pausetage, { n }, ui, e.ziffern)}
          </label>
        ))}
        <Ruhezeit ui={ui} ziffern={e.ziffern} texte={texte} melde={setMeldung} />
      </Gruppe>

      {ui === 'ar' ? (
        <Gruppe id="ziffern" titel={texte.ziffern} text={texte.ziffernText}>
          {(['oestlich', 'westlich'] as const).map((z) => (
            <label key={z} className={ZEILE}>
              <input
                type="radio"
                name="ziffern"
                value={z}
                className={FELD}
                checked={e.ziffern === z}
                onChange={() => aendern({ ziffern: z })}
              />
              <span>
                {z === 'oestlich' ? texte.ziffernArab : texte.ziffernLatn}{' '}
                <span className="text-tinte-2 tabular-nums">({new Intl.NumberFormat(zahlSprache(z)).format(123)})</span>
              </span>
            </label>
          ))}
        </Gruppe>
      ) : null}

      <Gruppe id="uebungen" titel={texte.uebungen}>
        {(['hoeren', 'sprechen'] as const).map((art) => (
          <label
            key={art}
            className="grid min-h-11 cursor-pointer raster-symbol items-center gap-x-3 rounded-md px-3 py-2 hover:bg-gruen-50"
          >
            <input
              type="checkbox"
              name={art}
              className={FELD}
              checked={e[art]}
              aria-describedby={`${art}-text`}
              onChange={(ev) => aendern({ [art]: ev.target.checked })}
            />
            <span className="font-bold">{texte[art]}</span>
            <span id={`${art}-text`} className="col-start-2 text-16 text-tinte-2">
              {texte[art === 'hoeren' ? 'hoerenText' : 'sprechenText']}
            </span>
          </label>
        ))}
      </Gruppe>

      <p role="status" className="min-h-6 text-16 font-bold text-gruen-800">
        {meldung}
      </p>
    </div>
  );
}
