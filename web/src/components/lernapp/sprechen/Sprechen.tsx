'use client';

import { useEffect, useId, useRef, useState } from 'react';
import type { Note } from '@/lib/lernapp/bewertung';
import { pruefePegel, type SprechErgebnis, zielWoerter } from '@/lib/lernapp/sprechen/auswertung';
import { type GeraetBefund, pruefeGeraet } from '@/lib/lernapp/sprechen/geraet';
import { ABTASTRATE, bewerteProbe, GESAMT_MB } from '@/lib/lernapp/sprechen/modell';
import { formatiere } from '@/lib/lernapp/format';
import { Anhoeren } from '../Anhoeren';
import { Fortschrittsleiste } from '../Fortschrittsleiste';
import { InhaltText } from '../InhaltText';
import { richtung } from '../typen';
import type { AufgabenProps } from '../typen';
import { type LaufendeAufnahme, mikrofonErlaubtHier, starteAufnahme } from './aufnahme';
import { erhebeUmgebung, Erkennung, erkennbar, liesStand, merkeStand } from './erkennung';
import { Pegel } from './Pegel';

/** Zustand der Spracherkennung auf diesem Gerät für diese Übung. */
type Modus =
  | { art: 'pruefen' }
  | { art: 'ohne'; grund: 'sprache' | 'aus' | 'geraet' | 'rueckfall' | 'gewaehlt' | 'fehler'; befund?: GeraetBefund }
  | { art: 'angebot'; befund: GeraetBefund }
  | { art: 'laedt'; anteil: number }
  | { art: 'probe' }
  | { art: 'bereit'; langsamS: number | null };

type Phase = 'start' | 'aufnahme' | 'verarbeitung' | 'ergebnis';

const KNOPF = 'min-h-12 druck rounded-pill border-2 border-gruen-700 bg-weiss px-6 font-bold text-gruen-800 hover:bg-gruen-50';
const HAUPT = 'min-h-12 druck rounded-pill bg-gruen-700 px-6 font-bold text-weiss hover:bg-gruen-800';
const LEISE = 'min-h-11 font-bold text-gruen-800 underline underline-offset-4';

/**
 * Sprechübung (PLAN §4.2, ADR 0042 mit Fortschreibung S2/S5, KERN 4.0 §6 und §8):
 * - Zielsatz in seiner Sprache, optional Vorlage anhören und Übersetzung; „Aufnehmen“ per Taste (Enter/Leertaste), Pegel
 *   (B-35), höchstens 15 s, Ansagen in der Live-Region des Spielers.
 * - Die Aufnahme bleibt im Arbeitsspeicher (eigene Aufnahme anhören über eine Objekt-Adresse); nach der Übung wird alles
 *   verworfen. Mikrofon nur auf `…/ueben` und `…/wiederholen`.
 * - Spracherkennung nur mit Schalter `lernapp_sprechen`, nur für de/tr, nach Gerätecheck und auf Wunsch geladen (Knopf mit
 *   Größe), danach Probelauf; Ergebnis nur als Markierung der Zielwörter („gut verständlich“ / „teilweise verstanden“),
 *   nie die Abschrift, keine Note.
 * - Immer möglich: eigene Aufnahme anhören, vergleichen, selbst bewerten; „Ich kann gerade nicht sprechen“ überspringt.
 */
export default function Sprechen({
  aufgabe,
  weitere,
  sprache,
  ziffern,
  gesperrt,
  gibAb,
  melde,
  ueberspringe,
  optionen,
}: AufgabenProps<'sprechen'>) {
  const t = weitere.sprechen;
  const g = weitere.aufgaben2.gemeinsam;
  const id = useId();
  const ziel = aufgabe.vorgabe;
  const woerter = zielWoerter(ziel.text, ziel.sprache).anzeige;
  const f = (vorlage: string, werte?: Record<string, string | number>) => formatiere(vorlage, werte, sprache, ziffern);

  const [modus, setModus] = useState<Modus>({ art: 'pruefen' });
  const [phase, setPhase] = useState<Phase>('start');
  const [pegel, setPegel] = useState(0);
  const [eigene, setEigene] = useState<string | null>(null);
  const [ergebnis, setErgebnis] = useState<SprechErgebnis | null>(null);
  const [meldung, setMeldung] = useState<string | null>(null);
  const [mikrofon, setMikrofon] = useState(true);
  const erkennung = useRef<Erkennung | null>(null);
  const aufnahme = useRef<LaufendeAufnahme | null>(null);
  const eigeneAdresse = useRef<string | null>(null);
  const ergebnisTitel = useRef<HTMLHeadingElement>(null);
  // der Stopp nach 15 s läuft aus einer älteren Darstellung: den aktuellen Modus über eine Referenz lesen
  const modusJetzt = useRef(modus);
  useEffect(() => {
    modusJetzt.current = modus;
  }, [modus]);

  const sage = (text: string) => {
    setMeldung(text);
    melde(text);
  };

  // Gerätecheck und gemerkter Stand (ohne Netz); bei geladenem Modell startet der Worker im Hintergrund aus dem Vorrat
  useEffect(() => {
    let aktiv = true;
    async function pruefe() {
      if (!erkennbar(ziel.sprache)) return setModus({ art: 'ohne', grund: 'sprache' });
      if (!optionen.spracherkennung) return setModus({ art: 'ohne', grund: 'aus' });
      const stand = liesStand();
      if (stand.probe?.ergebnis === 'rueckfall') return setModus({ art: 'ohne', grund: 'rueckfall' });
      const befund = pruefeGeraet(await erhebeUmgebung());
      if (!aktiv) return;
      if (!befund.ok) return setModus({ art: 'ohne', grund: 'geraet', befund });
      if (!stand.geladen) return setModus({ art: 'angebot', befund });
      try {
        const e = new Erkennung();
        erkennung.current = e;
        await e.laden();
        if (aktiv)
          setModus({ art: 'bereit', langsamS: stand.probe?.ergebnis === 'langsam' ? Math.round((stand.probe.ms ?? 0) / 1000) : null });
      } catch {
        if (aktiv) setModus({ art: 'ohne', grund: 'fehler' });
      }
    }
    void pruefe();
    return () => {
      aktiv = false;
    };
  }, [ziel.sprache, optionen.spracherkennung]);

  // Aufräumen: Worker beenden (Speicher frei), Aufnahme verwerfen
  useEffect(
    () => () => {
      erkennung.current?.beende();
      aufnahme.current?.abbrechen();
      if (eigeneAdresse.current) URL.revokeObjectURL(eigeneAdresse.current);
    },
    [],
  );

  useEffect(() => {
    if (phase === 'ergebnis') ergebnisTitel.current?.focus();
  }, [phase]);

  async function ladeModell() {
    const e = erkennung.current ?? new Erkennung();
    erkennung.current = e;
    setModus({ art: 'laedt', anteil: 0 });
    try {
      await e.laden((anteil) => setModus({ art: 'laedt', anteil }));
      merkeStand({ ...liesStand(), geladen: true });
      setModus({ art: 'probe' });
      sage(t.probe);
      let ms: number | null = null;
      try {
        ms = await e.probe();
      } catch {
        ms = null;
      }
      const urteil = bewerteProbe(ms);
      merkeStand({ ...liesStand(), geladen: true, probe: { ergebnis: urteil, ms } });
      if (urteil === 'rueckfall') {
        e.beende();
        erkennung.current = null;
        setModus({ art: 'ohne', grund: 'rueckfall' });
        sage(t.rueckfall);
      } else {
        setModus({ art: 'bereit', langsamS: urteil === 'langsam' && ms ? Math.round(ms / 1000) : null });
        sage(t.bereit);
      }
    } catch {
      e.beende();
      erkennung.current = null;
      merkeStand({ ...liesStand(), probe: { ergebnis: 'rueckfall', ms: null } });
      setModus({ art: 'ohne', grund: 'fehler' });
      sage(t.fehler);
    }
  }

  async function aufnehmen() {
    if (!mikrofonErlaubtHier(location.pathname)) {
      setMikrofon(false);
      return sage(t.keinMikrofon);
    }
    try {
      setErgebnis(null);
      aufnahme.current = await starteAufnahme({ onPegel: setPegel, onEnde: () => void beenden() });
      setPhase('aufnahme');
      sage(t.laeuft);
    } catch {
      setMikrofon(false);
      sage(t.keinMikrofon);
    }
  }

  async function beenden() {
    const laufend = aufnahme.current;
    if (!laufend) return;
    aufnahme.current = null;
    setPhase('verarbeitung');
    try {
      const a = await laufend.stopp();
      if (eigeneAdresse.current) URL.revokeObjectURL(eigeneAdresse.current);
      eigeneAdresse.current = URL.createObjectURL(a.blob);
      setEigene(eigeneAdresse.current);
      if (!pruefePegel(a.pcm, ABTASTRATE).ok) {
        setPhase('start');
        return sage(t.zuLeise);
      }
      const e = erkennung.current;
      if (modusJetzt.current.art === 'bereit' && e && erkennbar(ziel.sprache)) {
        sage(t.pruefung);
        try {
          const r = await e.erkenne(a.pcm, ziel.sprache, ziel.text);
          setErgebnis(r);
          sage(t[r.status]);
        } catch {
          setModus({ art: 'ohne', grund: 'fehler' });
          sage(t.fehler);
        }
      } else sage(t.beendet);
      setPhase('ergebnis');
    } catch {
      setPhase('start');
      setMikrofon(false);
      sage(t.keinMikrofon);
    }
  }

  const bewerte = (selbst: Note) => gibAb({ typ: 'sprechen', selbst });

  const mitErkennung = modus.art === 'bereit';
  const ohneText =
    modus.art === 'ohne'
      ? modus.grund === 'sprache'
        ? t.arabisch
        : modus.grund === 'rueckfall'
          ? t.rueckfall
          : modus.grund === 'fehler'
            ? t.fehler
            : modus.grund === 'geraet'
              ? t.nichtVerfuegbar
              : null
      : null;

  return (
    <div className="flex flex-col gap-5">
      <section aria-labelledby={`${id}-ziel`} className="flex flex-col gap-3 rounded-lg bg-sand px-4 py-5">
        <h3 id={`${id}-ziel`} className="text-16 font-bold text-tinte-2">
          {t.ziel}
        </h3>
        <p className="text-30 font-bold">
          <InhaltText inhalt={ziel} gross />
        </p>
        <Anhoeren audio={ziel.audio} texte={{ ...g, anhoeren: t.vorlage }} aus={!optionen.hoeren} />
        {aufgabe.uebersetzung ? (
          <details className="text-18">
            <summary className="min-h-11 cursor-pointer py-2 font-bold text-gruen-800">{g.uebersetzung}</summary>
            <InhaltText inhalt={aufgabe.uebersetzung} />
          </details>
        ) : null}
      </section>

      {/* Spracherkennung: Angebot, Laden, Probelauf, Rückfall */}
      {modus.art === 'angebot' ? (
        <div className="flex flex-col gap-3 rounded-lg border-2 border-linie p-4">
          <p className="text-18">{t.ladenText}</p>
          {modus.befund.hinweise.map((h) => (
            <p key={h} className="text-16 text-tinte-2">
              {t.geraet[h]}
            </p>
          ))}
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => void ladeModell()} className={HAUPT}>
              {f(t.laden, { mb: GESAMT_MB })}
            </button>
            <button type="button" onClick={() => setModus({ art: 'ohne', grund: 'gewaehlt' })} className={KNOPF}>
              {t.ohne}
            </button>
          </div>
        </div>
      ) : modus.art === 'laedt' ? (
        <div className="flex flex-col gap-2">
          <Fortschrittsleiste
            anteil={modus.anteil}
            beschriftung={t.erkennen}
            wertText={f(t.laedt, { prozent: Math.round(modus.anteil * 100) })}
          />
          <p className="text-16">{f(t.laedt, { prozent: Math.round(modus.anteil * 100) })}</p>
        </div>
      ) : modus.art === 'probe' ? (
        <p className="text-16">{t.probe}</p>
      ) : modus.art === 'bereit' && modus.langsamS ? (
        <p className="text-16 text-tinte-2">{f(t.langsam, { s: modus.langsamS })}</p>
      ) : ohneText ? (
        <div className="flex flex-col gap-1 text-16 text-tinte-2">
          <p>{ohneText}</p>
          {modus.art === 'ohne' && modus.befund
            ? modus.befund.maengel.map((m) => (
                <p key={m} className="ps-4">
                  {t.geraet[m]}
                </p>
              ))
            : null}
        </div>
      ) : null}

      {/* Aufnahme */}
      {gesperrt ? null : (
        <div className="flex flex-col gap-3">
          {phase === 'aufnahme' ? (
            <>
              <Pegel pegel={pegel} text={t.laeuft} />
              <button type="button" onClick={() => void beenden()} className={`${HAUPT} self-start`}>
                {t.stopp}
              </button>
            </>
          ) : phase === 'verarbeitung' ? (
            <p className="text-18">{t.pruefung}</p>
          ) : mikrofon ? (
            <button
              type="button"
              onClick={() => void aufnehmen()}
              disabled={modus.art === 'laedt' || modus.art === 'probe'}
              className={`${phase === 'ergebnis' ? KNOPF : HAUPT} self-start disabled:opacity-60`}
            >
              {phase === 'ergebnis' ? t.nochmal : t.aufnehmen}
            </button>
          ) : null}
          {meldung && phase !== 'aufnahme' ? (
            <p aria-hidden className="text-16 text-tinte-2">
              {meldung}
            </p>
          ) : null}
        </div>
      )}

      {/* Ergebnis: nur die Wörter des Zielsatzes, nie die Abschrift */}
      {phase === 'ergebnis' || !mikrofon ? (
        <section aria-labelledby={`${id}-ergebnis`} className="flex flex-col gap-4">
          <h3 id={`${id}-ergebnis`} ref={ergebnisTitel} tabIndex={-1} className="text-20 font-bold outline-none">
            {ergebnis && mitErkennung ? t[ergebnis.status] : t.selbstVergleich}
          </h3>
          {ergebnis && mitErkennung ? (
            <>
              <ul aria-label={t.wortListe} lang={ziel.sprache} dir={richtung(ziel.sprache)} className="flex flex-wrap gap-2">
                {woerter.map((w, i) => {
                  const ok = ergebnis.treffer[i] ?? false;
                  return (
                    <li
                      key={i}
                      className={`inline-flex min-h-11 items-center gap-2 rounded-md border-2 px-3 text-20 ${ok ? 'border-gruen-700 bg-gruen-50 text-gruen-800' : 'border-warnung bg-warnung-toenung text-tinte'}`}
                    >
                      <span>{w}</span>
                      <span className="sr-only" lang={sprache} dir={richtung(sprache)}>
                        {ok ? t.erkannt : t.unsicher}
                      </span>
                      <span aria-hidden className="text-16 font-bold">
                        {ok ? '✓' : '?'}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <p className="text-16 text-tinte-2">{t.hinweisMarkierung}</p>
            </>
          ) : null}
          {eigene ? (
            <div className="flex flex-col gap-2">
              <p className="text-16 font-bold">{t.eigeneAufnahme}</p>
              <audio controls src={eigene} className="w-full max-w-120" />
            </div>
          ) : null}
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-2 text-18 font-bold">{t.selbstFrage}</legend>
            <div className="flex flex-wrap gap-3">
              {(['nochmal', 'schwer', 'gut'] as const).map((n) => (
                <button key={n} type="button" onClick={() => bewerte(n)} disabled={gesperrt} className={n === 'gut' ? HAUPT : KNOPF}>
                  {t.selbst[n]}
                </button>
              ))}
            </div>
          </fieldset>
        </section>
      ) : null}

      {gesperrt ? null : (
        <button type="button" onClick={ueberspringe} className={`${LEISE} self-start`}>
          {t.kannNicht}
        </button>
      )}
    </div>
  );
}
