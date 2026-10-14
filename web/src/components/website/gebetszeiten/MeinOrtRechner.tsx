'use client';

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { berechneTag, qiblaRichtung } from '@/lib/gebetszeiten/berechnung';
import {
  datumIn,
  entfernungKm,
  gerundet,
  naechsterOrt,
  ORT_SPEICHER,
  unterschiede,
  type GemerkterOrt,
  type Lage,
  type OrtEintrag,
} from '@/lib/gebetszeiten/ort';
import ORTE_ROH from '@/lib/gebetszeiten/orte.json';
import { GEBETE, type Berechnungseinstellungen, type Gebet } from '@/lib/gebetszeiten/typen';
import { klassen } from '@/lib/klassen';
import { QiblaZifferblatt } from './QiblaKompassAnsicht';
import { fuelle } from './zeiten';

const ORTE = ORTE_ROH as unknown as OrtEintrag[];
const BERLIN = 'Europe/Berlin';
/** Bis zu dieser Entfernung heißt der Standort „in der Nähe von …“. */
const NAEHE_KM = 25;
const UMGEBUNG_KM = 40;
/** Raster aus Ortsauswahl und Ergebnis: links Auswahl bzw. Tabelle, ab lg rechts die Qibla (G-3: gleiche Breite). */
const RASTER = 'grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]';
/** Gleicher waagerechter Innenabstand für Kopf- und Datenzellen der Tabelle (G-3). */
const ZELLE = 'px-2';

export type MeinOrtTexte = {
  titel: string;
  einleitung: string;
  standortVerwenden: string;
  ortWaehlen: string;
  datenschutz: string;
  ohneJs: string;
  laedt: string;
  sucht: string;
  verweigert: string;
  nichtVerfuegbar: string;
  fehler: string;
  ortLabel: string;
  ortBitteWaehlen: string;
  gruppeUmgebung: string;
  gruppeWeitere: string;
  zeitenFuer: string;
  /** „Gebetszeiten in der Nähe von {ort}“ (Standort per GPS, nächster Ort ≤ 25 km). */
  naehe: string;
  /** „Gebetszeiten an Ihrem Standort“ (GPS ohne nahen Ort der Liste). */
  eigenerStandort: string;
  /** Kurzform des Unterschieds für Bildschirmleser („2 Minuten später als in Wetzlar“). */
  unterschiedVorlesen: string;
  entfernungMoschee: string;
  hinweisBerechnet: string;
  zeitzone: string;
  spalteGebet: string;
  spalteZeit: string;
  spalteUnterschied: string;
  unterschiedPlus: string;
  unterschiedMinus: string;
  unterschiedGleich: string;
  spaeter: string;
  frueher: string;
  naechstes: string;
  qiblaTitel: string;
  qiblaWert: string;
  qiblaAria: string;
  /** Beschriftung „Norden“ im Zifferblatt („N“, tr „K“) */
  qiblaNord: string;
  /** Gradzahl im Zifferblatt („{winkel}°“) */
  qiblaGrad: string;
  merken: string;
  vergessen: string;
  gemerktHinweis: string;
  andererOrt: string;
  namen: Record<Gebet, string>;
};

/** `name` ist der Ortsname der Liste oder der nächste Ort zum Standort (leer, wenn keiner nah ist). */
type Ort = { name: string; lage: Lage; zone: string; quelle: 'gps' | 'liste' | 'gemerkt' };
type Phase = 'waehlen' | 'sucht' | 'bereit' | 'verweigert' | 'fehlt' | 'fehler';

function geraeteZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || BERLIN;
  } catch {
    return BERLIN;
  }
}

function speichern(ort: Ort | null) {
  try {
    if (ort) {
      const wert: GemerkterOrt = { name: ort.name, ...gerundet(ort.lage), zone: ort.zone };
      window.localStorage.setItem(ORT_SPEICHER, JSON.stringify(wert));
    } else window.localStorage.removeItem(ORT_SPEICHER);
  } catch {
    // Gerätespeicher gesperrt (privates Fenster): Merken entfällt still, die Berechnung gilt weiter.
  }
}

/**
 * Rechner „Mein Ort“ (lazy): Standort per Geolocation (sofort gerundet) oder aus der GeoNames-Liste; Zeiten mit den
 * Einstellungen der Moschee für das heutige Datum der Zeitzone, Unterschied zu Wetzlar und Qibla am Ort (B-21).
 * Nichts davon verlässt das Gerät.
 */
export function MeinOrtRechner({
  texte,
  einstellungen,
  sprache,
  start,
  zurueck,
  symbole,
}: {
  texte: MeinOrtTexte;
  einstellungen: Berechnungseinstellungen;
  sprache: string;
  start: { art: 'gps' } | { art: 'liste' } | { art: 'gemerkt'; ort: GemerkterOrt };
  zurueck: () => void;
  symbole: { gps: ReactNode; liste: ReactNode };
}) {
  const [ort, setOrt] = useState<Ort | null>(
    start.art === 'gemerkt'
      ? { name: start.ort.name, lage: { breite: start.ort.breite, laenge: start.ort.laenge }, zone: start.ort.zone, quelle: 'gemerkt' }
      : null,
  );
  const [phase, setPhase] = useState<Phase>(() =>
    start.art === 'gemerkt' ? 'bereit' : start.art === 'liste' ? 'waehlen' : navigator.geolocation ? 'sucht' : 'fehlt',
  );
  const [gemerkt, setGemerkt] = useState(start.art === 'gemerkt');
  // Der Rechner lädt erst nach einem Klick im Browser (nie auf dem Server): die Uhrzeit steht sofort fest.
  const [jetzt, setJetzt] = useState<Date>(() => new Date());
  /** Qibla-Nadel dreht einmal von Norden zur Richtung (B-21); erst nach dem ersten Bild, damit der Übergang greift. */
  const [nadelBereit, setNadelBereit] = useState(false);

  const wetzlar = useMemo<Lage>(() => ({ breite: einstellungen.breite, laenge: einstellungen.laenge }), [einstellungen]);
  const wetzlarListe = useMemo(() => {
    const mitKm = ORTE.map((o) => ({ name: o[0], km: entfernungKm(wetzlar, { breite: o[1], laenge: o[2] }) }));
    const umgebung = mitKm.filter((o) => o.km <= UMGEBUNG_KM).sort((a, b) => a.km - b.km);
    const weitere = mitKm.filter((o) => o.km > UMGEBUNG_KM).sort((a, b) => a.name.localeCompare(b.name, sprache));
    return { umgebung, weitere };
  }, [wetzlar, sprache]);

  /** Fragt den Standort ab; der Zustand ändert sich erst in den Rückrufen. */
  function frage() {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // Sofort runden (≈ 1 km); die genaue Lage wird nirgends gespeichert oder gesendet.
        const lage = gerundet({ breite: pos.coords.latitude, laenge: pos.coords.longitude });
        const naechster = naechsterOrt(lage, ORTE);
        const name = naechster && naechster.km <= NAEHE_KM ? naechster.name : '';
        setOrt({ name, lage, zone: geraeteZone(), quelle: 'gps' });
        setPhase('bereit');
      },
      (fehler) => setPhase(fehler.code === fehler.PERMISSION_DENIED ? 'verweigert' : 'fehler'),
      { enableHighAccuracy: false, maximumAge: 10 * 60 * 1000, timeout: 15000 },
    );
  }

  function ermitteln() {
    if (!navigator.geolocation) {
      setPhase('fehlt');
      return;
    }
    setPhase('sucht');
    frage();
  }

  useEffect(() => {
    // Start „Standort verwenden“: Die Abfrage folgt direkt auf den Klick, der diesen Rechner geladen hat.
    if (start.art === 'gps' && navigator.geolocation) frage();
    const takt = window.setInterval(() => setJetzt(new Date()), 60_000);
    return () => window.clearInterval(takt);
    // Nur beim Laden: Startart ist fest.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ort) return;
    const bild = window.requestAnimationFrame(() => setNadelBereit(true));
    return () => window.cancelAnimationFrame(bild);
  }, [ort]);

  function waehle(name: string) {
    const eintrag = ORTE.find((o) => o[0] === name);
    if (!eintrag) return;
    const neu: Ort = { name: eintrag[0], lage: { breite: eintrag[1], laenge: eintrag[2] }, zone: BERLIN, quelle: 'liste' };
    setNadelBereit(false);
    setOrt(neu);
    setPhase('bereit');
    if (gemerkt) speichern(neu);
  }

  const ergebnis = useMemo(() => {
    if (!ort) return null;
    const datum = datumIn(ort.zone, jetzt);
    const eigen = berechneTag(datum, { ...einstellungen, ...ort.lage }, ort.zone);
    const vergleich = berechneTag(datum, einstellungen, ort.zone);
    const diff = unterschiede(eigen, vergleich);
    const uhr = new Intl.DateTimeFormat('de-DE', { timeZone: ort.zone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(
      jetzt,
    );
    const naechstes = GEBETE.find((g) => eigen[g] > uhr) ?? null;
    const datumText = new Intl.DateTimeFormat(sprache, { timeZone: ort.zone, weekday: 'long', day: 'numeric', month: 'long' }).format(
      jetzt,
    );
    return {
      eigen,
      diff,
      naechstes,
      datumText,
      qibla: qiblaRichtung(ort.lage.breite, ort.lage.laenge),
      km: Math.round(entfernungKm(ort.lage, wetzlar)),
      inBerlinerZeit: ort.zone === BERLIN,
    };
  }, [ort, jetzt, einstellungen, wetzlar, sprache]);

  const zahl = (n: number) => new Intl.NumberFormat(sprache, { maximumFractionDigits: 1 }).format(n);
  const titel = ort
    ? ort.quelle === 'gps'
      ? ort.name
        ? fuelle(texte.naehe, { ort: ort.name })
        : texte.eigenerStandort
      : fuelle(texte.zeitenFuer, { ort: ort.name })
    : '';
  const unterschiedText = (d: number) =>
    d === 0 ? texte.unterschiedGleich : fuelle(d > 0 ? texte.unterschiedPlus : texte.unterschiedMinus, { minuten: String(Math.abs(d)) });

  const statusText =
    phase === 'sucht'
      ? texte.sucht
      : phase === 'verweigert'
        ? texte.verweigert
        : phase === 'fehlt'
          ? texte.nichtVerfuegbar
          : phase === 'fehler'
            ? texte.fehler
            : '';

  return (
    <section aria-labelledby="mein-ort-titel" className="flex flex-col gap-6 rounded-lg border border-linie bg-weiss p-5 shadow-s1 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 id="mein-ort-titel" className="text-30 text-pretty">
          {texte.titel}
        </h2>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={ermitteln}
            className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-md border-2 border-gruen-700 bg-weiss px-4 font-bold text-gruen-800 transition duration-(--dauer-rueckmeldung) hover:bg-gruen-50 active:scale-98"
          >
            {symbole.gps}
            <span>{texte.standortVerwenden}</span>
          </button>
        </div>
      </div>

      {/* G-3: Die Ortsauswahl steht im selben Raster wie das Ergebnis darunter und ist so breit wie die Tabelle */}
      <div className={RASTER}>
        <div className="flex min-w-0 flex-col gap-2">
          <label htmlFor="mein-ort-liste" className="font-bold">
            {texte.ortLabel}
          </label>
          <select
            id="mein-ort-liste"
            value={ort?.quelle === 'liste' || (ort?.quelle === 'gemerkt' && ORTE.some((o) => o[0] === ort.name)) ? ort.name : ''}
            onChange={(e) => waehle(e.target.value)}
            className="min-h-12 w-full rounded-md border-2 border-rand bg-weiss px-3 text-18"
          >
            <option value="" disabled>
              {texte.ortBitteWaehlen}
            </option>
            <optgroup label={texte.gruppeUmgebung}>
              {wetzlarListe.umgebung.map((o) => (
                <option key={o.name} value={o.name}>
                  {o.name}
                </option>
              ))}
            </optgroup>
            <optgroup label={texte.gruppeWeitere}>
              {wetzlarListe.weitere.map((o) => (
                <option key={o.name} value={o.name}>
                  {o.name}
                </option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>

      <p role="status" className={klassen('max-w-text text-16 leading-normal', statusText ? 'text-tinte' : 'sr-only')}>
        {statusText}
      </p>

      {ort && ergebnis ? (
        <div key={ort.name} className={`blendet-ein ${RASTER}`} style={{ '--dauer': 'var(--dauer-wechsel)' } as CSSProperties}>
          <div className="flex min-w-0 flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h3 className="text-24 text-pretty">{titel}</h3>
              <p className="text-tinte-2">
                {ergebnis.datumText}
                {ergebnis.km > 0 ? ` · ${fuelle(texte.entfernungMoschee, { km: String(ergebnis.km) })}` : ''}
              </p>
              {!ergebnis.inBerlinerZeit ? <p className="text-16 text-tinte-2">{fuelle(texte.zeitzone, { zone: ort.zone })}</p> : null}
            </div>
            <table className="w-full border-collapse text-start">
              <caption className="sr-only">{titel}</caption>
              <thead>
                {/* G-3: Kopf und Zellen mit gleichem Innenabstand (ZELLE), damit Spalten bündig stehen */}
                <tr className="border-b border-linie text-16 text-tinte-2">
                  <th scope="col" className={`${ZELLE} py-2 text-start font-bold`}>
                    {texte.spalteGebet}
                  </th>
                  <th scope="col" className={`${ZELLE} py-2 text-end font-bold`}>
                    {texte.spalteZeit}
                  </th>
                  {ergebnis.inBerlinerZeit ? (
                    <th scope="col" className={`${ZELLE} py-2 text-end font-bold`}>
                      {texte.spalteUnterschied}
                    </th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {GEBETE.map((g) => {
                  const ist = ergebnis.naechstes === g;
                  return (
                    <tr key={g} className={klassen('border-b border-linie last:border-b-0', ist && 'bg-gruen-50')}>
                      <th scope="row" className={`${ZELLE} py-3 text-start font-bold`}>
                        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          {texte.namen[g]}
                          {ist ? (
                            <span className="rounded-pill bg-gruen-700 px-2 py-0.5 text-16 font-bold text-weiss">{texte.naechstes}</span>
                          ) : null}
                        </span>
                      </th>
                      <td className={`${ZELLE} py-3 text-end text-24 font-bold tabular-nums`}>{ergebnis.eigen[g]}</td>
                      {ergebnis.inBerlinerZeit ? (
                        <td className={`${ZELLE} py-3 text-end text-16 whitespace-nowrap text-tinte-2 tabular-nums`}>
                          <span aria-hidden>{unterschiedText(ergebnis.diff[g])}</span>
                          <span className="sr-only">
                            {ergebnis.diff[g] === 0
                              ? texte.unterschiedGleich
                              : fuelle(texte.unterschiedVorlesen, {
                                  minuten: String(Math.abs(ergebnis.diff[g])),
                                  richtung: ergebnis.diff[g] > 0 ? texte.spaeter : texte.frueher,
                                })}
                          </span>
                        </td>
                      ) : null}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="max-w-text text-16 leading-normal text-tinte-2">{texte.hinweisBerechnet}</p>
          </div>

          <div className="flex flex-col items-center gap-3">
            <h3 className="self-start text-24">{texte.qiblaTitel}</h3>
            <QiblaZifferblatt
              klein
              nadelDreht
              nadelWinkel={nadelBereit ? ergebnis.qibla : 0}
              nord={texte.qiblaNord}
              grad={fuelle(texte.qiblaGrad, { winkel: zahl(ergebnis.qibla) })}
              aria={fuelle(texte.qiblaAria, { winkel: zahl(ergebnis.qibla), ort: ort.name })}
            />
            <p className="text-16 text-tinte-2">{fuelle(texte.qiblaWert, { winkel: zahl(ergebnis.qibla) })}</p>
          </div>

          <div className="flex flex-wrap items-center gap-4 lg:col-span-2">
            <label className="inline-flex min-h-12 cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={gemerkt}
                onChange={(e) => {
                  setGemerkt(e.target.checked);
                  speichern(e.target.checked ? ort : null);
                }}
                className="size-5 accent-gruen-700"
              />
              <span>{texte.merken}</span>
            </label>
            {gemerkt ? <span className="text-16 text-tinte-2">{texte.gemerktHinweis}</span> : null}
            <button
              type="button"
              onClick={() => {
                speichern(null);
                setGemerkt(false);
                setOrt(null);
                zurueck();
              }}
              className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-md px-3 font-bold text-gruen-800 underline-offset-4 hover:underline"
            >
              {symbole.liste}
              <span>{gemerkt ? texte.vergessen : texte.andererOrt}</span>
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
