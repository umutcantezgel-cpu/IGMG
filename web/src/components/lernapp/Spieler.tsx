'use client';

import { Component, type ComponentType, type FormEvent, lazy, type ReactNode, Suspense, useEffect, useId, useRef, useState } from 'react';
import type { Antwort, Aufgabe, ImplementierterTyp, Lektion } from '@/lib/lernapp/aufgaben/schema';
import { SELBSTBEWERTUNG } from '@/lib/lernapp/bewertung';
import {
  aktuell,
  fortschritt,
  pruefe,
  type Sitzung,
  starte,
  ueberspringe,
  weiter,
  type Zusammenfassung,
  zusammenfassung,
} from '@/lib/lernapp/engine/sitzung';
import type { EreignisEntwurf } from '@/lib/lernapp/ereignisse/typen';
import { formatiere, type Werte, type Ziffern } from '@/lib/lernapp/format';
import { AUFGABEN_LADER } from './aufgaben/lader';
import { Fortschrittsleiste } from './Fortschrittsleiste';
import { Rueckmeldung } from './Rueckmeldung';
import { type AufgabenProps, type SpielerOptionen, type SpielerTexte, STANDARD_OPTIONEN, type UiSprache } from './typen';

/**
 * Lektionsspieler (PLAN §4, KERN §7–§9): spielt eine Lektion als reinen Zustandsautomaten (engine/sitzung.ts) und meldet
 * jedes Ereignis über `onEreignis` (Gerät, Nummer, Zeit und Lerntag ergänzt der Ausgang, lokal/ausgang.ts). Übungstypen
 * laden als eigene Chunks per `import()` (aufgaben/lader.ts), der nächste wird vorab geholt. Texte kommen als Prop aus
 * `messages/lernapp/<ui>.json` (Namensräume `spieler` und `aufgaben`) und werden mit `format.ts` gefüllt.
 *
 * ```tsx
 * <Spieler lektion={lektion} texte={{ spieler, aufgaben }} sprache="de" onEreignis={(e) => haengeAn(sp, profil, e)} />
 * ```
 *
 * Lektionsformat: `aufgaben/schema.ts` (`LektionSchema`, passend zum Einheitenpaket nach ADR 0039). Spielbar sind die Typen
 * in `IMPLEMENTIERT`; andere werden übersprungen. `sprechen` und `schreiben` bewerten sich selbst und gehen ohne
 * Rückmeldeblatt weiter; `grammatik_tipp` und „Ich kann gerade nicht sprechen“ überspringen ohne Wertung. Mit
 * „Sprechübungen aus“ fallen Sprechaufgaben weg, mit „Hörübungen aus“ Schrift-Aufgaben, die nur ein Hörbeispiel haben.
 */
export type SpielerProps = {
  lektion: Lektion;
  texte: SpielerTexte;
  /** Oberflächensprache (Texte, Ziffern) */
  sprache: UiSprache;
  /** Ziffern der arabischen Oberfläche (O-5, Standard östlich) */
  ziffern?: Ziffern;
  onEreignis: (ereignis: EreignisEntwurf) => void;
  onFertig?: (zusammenfassung: Zusammenfassung) => void;
  /** Ziel „Zum Lernpfad“ am Ende */
  zurueckHref?: string;
  /** Hörübungen, Sprechübungen, Spracherkennung (Einstellungen und Schalter `lernapp_sprechen`) */
  optionen?: SpielerOptionen;
};

type Komponenten = { [T in ImplementierterTyp]: ComponentType<AufgabenProps<T>> };
const erzeugeKomponenten = (): Komponenten => ({
  auswahl: lazy(AUFGABEN_LADER.auswahl),
  wortbank: lazy(AUFGABEN_LADER.wortbank),
  paare: lazy(AUFGABEN_LADER.paare),
  dialog: lazy(AUFGABEN_LADER.dialog),
  geschichte: lazy(AUFGABEN_LADER.geschichte),
  lesen_fragen: lazy(AUFGABEN_LADER.lesen_fragen),
  grammatik_tipp: lazy(AUFGABEN_LADER.grammatik_tipp),
  schrift_ar: lazy(AUFGABEN_LADER.schrift_ar),
  schrift_tr: lazy(AUFGABEN_LADER.schrift_tr),
  schrift_latein: lazy(AUFGABEN_LADER.schrift_latein),
  sprechen: lazy(AUFGABEN_LADER.sprechen),
  schreiben: lazy(AUFGABEN_LADER.schreiben),
});

/** Typen mit eigenem Abschluss (kein „Prüfen“ des Spielers): Paare und Geschichte geben selbst ab, Tipp, Sprechen und Schreiben ebenso. */
function mitPruefen(a: Aufgabe): boolean {
  if (a.typ === 'schrift_ar') return a.art !== 'nachspuren';
  return !['paare', 'geschichte', 'grammatik_tipp', 'sprechen', 'schreiben'].includes(a.typ);
}

/** Aufgaben, die mit den Einstellungen nicht spielbar sind, fallen vor dem Start weg (keine Sackgasse, KERN 4.0 §8). */
function spielbar(lektion: Lektion, o: SpielerOptionen): Lektion {
  const aufgaben = lektion.aufgaben.filter((a) => {
    if (a.typ === 'sprechen') return o.sprechen;
    if ((a.typ === 'schrift_tr' || a.typ === 'schrift_latein') && !a.vorgabe) return o.hoeren;
    return true;
  });
  return aufgaben.length === lektion.aufgaben.length ? lektion : { ...lektion, aufgaben };
}

/** Fängt einen fehlgeschlagenen Chunk-Abruf (z. B. ohne Netz) und bietet „Erneut versuchen“. */
class Ladegrenze extends Component<{ ersatz: ReactNode; children: ReactNode }, { fehler: boolean }> {
  state = { fehler: false };
  static getDerivedStateFromError() {
    return { fehler: true };
  }
  render() {
    return this.state.fehler ? this.props.ersatz : this.props.children;
  }
}

function anweisung(a: Aufgabe, texte: SpielerTexte): string {
  const t = texte.aufgaben;
  const z = texte.aufgaben2;
  if (a.typ === 'auswahl') return t.auswahl[a.anweisung];
  if (a.typ === 'wortbank') return t.wortbank[a.anweisung];
  if (a.typ === 'paare') return t.paare[a.anweisung];
  if (a.typ === 'dialog') return z.dialog.anweisung;
  if (a.typ === 'geschichte') return z.geschichte.anweisung;
  if (a.typ === 'lesen_fragen') return z.lesenFragen.anweisung;
  if (a.typ === 'grammatik_tipp') return z.grammatikTipp.anweisung;
  if (a.typ === 'schrift_ar') return z.schriftAr[a.art];
  if (a.typ === 'schrift_tr' || a.typ === 'schrift_latein') return z.schriftWahl[a.anweisung];
  if (a.typ === 'sprechen') return texte.sprechen.anweisung;
  if (a.typ === 'schreiben') return texte.schreiben.anweisung;
  return '';
}

function loesungSprache(a: Aufgabe): UiSprache | null {
  if (a.typ === 'auswahl' || a.typ === 'dialog' || a.typ === 'schrift_tr' || a.typ === 'schrift_latein')
    return a.optionen[a.richtig]?.sprache ?? null;
  if (a.typ === 'wortbank') return a.sprache;
  return null;
}

const KNOPF = 'min-h-12 druck rounded-pill bg-gruen-700 px-8 font-bold text-weiss hover:bg-gruen-800';

export function Spieler({
  lektion,
  texte,
  sprache,
  ziffern = 'oestlich',
  onEreignis,
  onFertig,
  zurueckHref,
  optionen = STANDARD_OPTIONEN,
}: SpielerProps) {
  const id = useId();
  const [s, setS] = useState<Sitzung>(() => starte(spielbar(lektion, optionen)));
  const [antwort, setAntwort] = useState<Antwort | null>(null);
  const [meldung, setMeldung] = useState('');
  const [komponenten, setKomponenten] = useState(erzeugeKomponenten);
  const [ladeVersuch, setLadeVersuch] = useState(0);
  const titel = useRef<HTMLHeadingElement>(null);
  const weiterKnopf = useRef<HTMLButtonElement>(null);
  const ersterLauf = useRef(true);
  const a = aktuell(s);
  const f = (vorlage: string, werte?: Werte) => formatiere(vorlage, werte, sprache, ziffern);

  // Fokus: nach dem Prüfen auf „Weiter“, bei neuer Aufgabe und am Ende auf die Überschrift (nicht beim ersten Anzeigen)
  useEffect(() => {
    if (ersterLauf.current) {
      ersterLauf.current = false;
      return;
    }
    if (s.phase === 'rueckmeldung') weiterKnopf.current?.focus();
    else titel.current?.focus();
  }, [s.phase, s.pos]);

  // nächsten Übungstyp vorab laden (eigener Chunk, KERN §9)
  useEffect(() => {
    const naechste = s.aufgaben[s.reihe[s.pos + 1] ?? -1];
    if (naechste && naechste.typ in AUFGABEN_LADER) void AUFGABEN_LADER[naechste.typ as ImplementierterTyp]().catch(() => undefined);
  }, [s.aufgaben, s.reihe, s.pos]);

  const sende = (ereignisse: EreignisEntwurf[]) => ereignisse.forEach((e) => onEreignis(e));

  function gibAb(x: Antwort) {
    if (s.phase !== 'frage') return;
    const r = pruefe(s, x);
    // Selbstbewertung (Sprechen, Schreiben): die Lernenden haben schon geurteilt – ohne Rückmeldeblatt weiter
    if (SELBSTBEWERTUNG.has(x.typ)) return schliesse(r.sitzung, r.ereignisse);
    setS(r.sitzung);
    setMeldung('');
    sende(r.ereignisse);
  }

  /** Nach einer Zwischenstufe direkt zur nächsten Aufgabe (bzw. zum Ende). */
  function schliesse(zwischen: Sitzung, vorher: EreignisEntwurf[]) {
    const r = weiter(zwischen);
    setS(r.sitzung);
    setAntwort(null);
    setMeldung('');
    sende([...vorher, ...r.ereignisse]);
    if (r.sitzung.phase === 'fertig') onFertig?.(zusammenfassung(r.sitzung));
  }

  /** Ohne Wertung weiter (gelesener Tipp, „Ich kann gerade nicht sprechen“). */
  function ohneWertung() {
    if (s.phase !== 'frage') return;
    const r = ueberspringe(s);
    setS(r.sitzung);
    setAntwort(null);
    setMeldung('');
    sende(r.ereignisse);
    if (r.sitzung.phase === 'fertig') onFertig?.(zusammenfassung(r.sitzung));
  }

  function absenden(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (antwort) gibAb(antwort);
  }

  function naechste() {
    const r = weiter(s);
    setS(r.sitzung);
    setAntwort(null);
    setMeldung('');
    sende(r.ereignisse);
    if (r.sitzung.phase === 'fertig') onFertig?.(zusammenfassung(r.sitzung));
  }

  function erneutLaden() {
    setKomponenten(erzeugeKomponenten());
    setLadeVersuch((n) => n + 1);
  }

  if (s.phase === 'fertig' || !a) {
    const z = zusammenfassung(s);
    return (
      <section
        aria-labelledby={`${id}-fertig`}
        className="flex flex-col items-start gap-5 rounded-lg border border-linie bg-weiss p-6 shadow-s1 md:p-10"
      >
        <h2 id={`${id}-fertig`} ref={titel} tabIndex={-1} className="text-display-2 outline-none">
          {z.gesamt || s.aufgaben.length ? texte.spieler.fertigTitel : texte.spieler.leer}
        </h2>
        {z.gesamt ? (
          <>
            <p className="text-20">{f(texte.spieler.fertigText, { richtig: z.richtig, gesamt: z.gesamt })}</p>
            <p className="text-24 font-bold text-gruen-800">{f(texte.spieler.xp, { n: z.xp })}</p>
          </>
        ) : null}
        {zurueckHref ? (
          <a href={zurueckHref} className={`${KNOPF} inline-flex items-center no-underline hover:text-weiss`}>
            {texte.spieler.zurueck}
          </a>
        ) : null}
      </section>
    );
  }

  const aufgabe = a.aufgabe;
  const Uebung = komponenten[aufgabe.typ as ImplementierterTyp] as ComponentType<AufgabenProps<ImplementierterTyp>>;
  const stand = f(texte.spieler.aufgabeVon, { nr: a.index + 1, anzahl: s.aufgaben.length });
  const auswertung = s.phase === 'rueckmeldung' ? s.letzte : null;

  return (
    <section aria-labelledby={`${id}-titel`} className="flex flex-col gap-5">
      <Fortschrittsleiste anteil={fortschritt(s)} beschriftung={texte.spieler.fortschritt} wertText={stand} />
      <p className="text-16 font-bold text-gruen-800">{a.wiederholung ? texte.spieler.nochEinmal : stand}</p>
      <form onSubmit={absenden} noValidate className="flex flex-col gap-5">
        <h2 id={`${id}-titel`} ref={titel} tabIndex={-1} className="text-24 font-bold outline-none">
          {anweisung(aufgabe, texte)}
        </h2>
        <Ladegrenze
          key={ladeVersuch}
          ersatz={
            <div className="flex flex-col items-start gap-3">
              <p className="text-18 text-fehler">{texte.spieler.ladefehler}</p>
              <button type="button" onClick={erneutLaden} className={KNOPF}>
                {texte.spieler.erneut}
              </button>
            </div>
          }
        >
          <Suspense fallback={<p className="text-18 text-tinte-2">{texte.spieler.laedt}</p>}>
            <Uebung
              key={s.pos}
              aufgabe={aufgabe as never}
              texte={texte.aufgaben}
              sprache={sprache}
              ziffern={ziffern}
              gesperrt={s.phase !== 'frage'}
              auswertung={auswertung}
              antwort={antwort as never}
              setzeAntwort={setAntwort}
              gibAb={gibAb}
              melde={setMeldung}
              weitere={texte}
              ueberspringe={ohneWertung}
              optionen={optionen}
            />
          </Suspense>
        </Ladegrenze>
        {mitPruefen(aufgabe) && s.phase === 'frage' ? (
          <button type="submit" disabled={!antwort} className={`${KNOPF} self-end disabled:bg-linie disabled:text-tinte-2`}>
            {texte.spieler.pruefen}
          </button>
        ) : null}
      </form>
      <Rueckmeldung
        auswertung={auswertung}
        texte={texte.spieler}
        loesungSprache={loesungSprache(aufgabe)}
        wirdWiederholt={auswertung !== null && !s.abgeschlossen[a.index]}
        meldung={meldung}
        onWeiter={naechste}
        weiterRef={weiterKnopf}
      />
    </section>
  );
}
