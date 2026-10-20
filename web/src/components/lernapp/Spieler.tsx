'use client';

import {
  Component,
  type ComponentType,
  type FormEvent,
  lazy,
  type ReactNode,
  Suspense,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { hatAudio, HOER_TYPEN, istHoerTyp, type MitHoeren } from '@/lib/lernapp/aufgaben/hilfen';
import type { Antwort, Aufgabe, AufgabenTyp, ImplementierterTyp, Lektion } from '@/lib/lernapp/aufgaben/schema';
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
import { Abschluss } from './Abschluss';
import { AUFGABEN_LADER, bewerterFuer, ladeTyp } from './aufgaben/lader';
import { Fortschrittsleiste } from './Fortschrittsleiste';
import { Rueckmeldung } from './Rueckmeldung';
import type { AufgabenProps, SpielerTexte, UiSprache } from './typen';

/**
 * Lektionsspieler (PLAN §4, KERN §7–§9): spielt eine Lektion als reinen Zustandsautomaten (engine/sitzung.ts) und meldet
 * jedes Ereignis über `onEreignis` (Gerät, Nummer, Zeit und Lerntag ergänzt der Ausgang, lokal/ausgang.ts). Übungstypen
 * laden als eigene Chunks per `import()` (aufgaben/lader.ts), der nächste wird vorab geholt; jeder Chunk bringt seine
 * Bewertung mit (`bewerterFuer`), die Route enthält keine. Texte kommen als Prop aus
 * `messages/lernapp/<ui>.json` (Namensräume `spieler` und `aufgaben`) und werden mit `format.ts` gefüllt.
 *
 * ```tsx
 * <Spieler lektion={lektion} texte={{ spieler, aufgaben }} sprache="de" onEreignis={(e) => haengeAn(sp, profil, e)} />
 * ```
 *
 * Lektionsformat: `aufgaben/schema.ts` (`LektionSchema`, passend zum Einheitenpaket nach ADR 0039). Spielbar sind die
 * Typen aus `IMPLEMENTIERT` (L1 und L2-01); andere werden übersprungen. Hörübungen fallen mit `hoeren={false}`
 * („Hörübungen aus“) schon beim Start weg; ohne Audio oder nach „Ich kann gerade nicht hören“ überspringt sie die Übung
 * selbst (`ueberspringe`, ohne Bewertung). Texte zusätzlich aus dem Namensraum `tastatur`.
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
  /** Hörübungen an (Einstellung „Hörübungen aus“, KERN 4.0 §8) */
  hoeren?: boolean;
};

type Komponenten = { [T in ImplementierterTyp]: ComponentType<AufgabenProps<T>> };
const erzeugeKomponenten = (): Komponenten =>
  Object.fromEntries(
    (Object.keys(AUFGABEN_LADER) as ImplementierterTyp[]).map((t) => [
      t,
      lazy(() => ladeTyp(t) as unknown as Promise<{ default: ComponentType }>),
    ]),
  ) as unknown as Komponenten;

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

/** Anweisung ohne eigenes Feld: ein fester Text je Typ (`aufgaben.<typ>.<anweisung>`). */
const ANWEISUNG: Partial<Record<AufgabenTyp, string>> = {
  frei: 'uebersetze',
  hoeren_schreiben: 'schreibeGehoertes',
  minimalpaare: 'waehleGehoertes',
  luecke: 'ergaenze',
  satzbau: 'ordne',
  formen: 'ergaenze',
};

function anweisung(a: Aufgabe, t: SpielerTexte['aufgaben']): string {
  const k = ('anweisung' in a && a.anweisung) || ANWEISUNG[a.typ] || '';
  return (t as unknown as Partial<Record<string, Record<string, string>>>)[a.typ]?.[k] ?? '';
}

/** Sprache der Lösung: Antwortsprache oder Sprache der richtigen Option. */
const loesungSprache = (a: Aufgabe): UiSprache | null =>
  'sprache' in a
    ? a.sprache
    : 'richtig' in a && 'optionen' in a
      ? ((a.optionen[a.richtig] as { sprache?: UiSprache } | undefined)?.sprache ?? null)
      : null;

const KNOPF = 'min-h-12 druck rounded-pill bg-gruen-700 px-8 font-bold text-weiss hover:bg-gruen-800';

export function Spieler({ lektion, texte, sprache, ziffern = 'oestlich', onEreignis, onFertig, zurueckHref, hoeren = true }: SpielerProps) {
  const id = useId();
  const [s, setS] = useState<Sitzung>(() => starte(lektion, { ohne: hoeren ? [] : HOER_TYPEN }));
  // Aufgabe, die sich nur überspringen lässt (Hörübung ohne Audio): kein „Prüfen“
  const [nurWeiterBei, setNurWeiterBei] = useState<number | null>(null);
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

  // nächsten Übungstyp vorab laden (eigener Chunk mit Bewertung, KERN §9)
  useEffect(() => {
    const naechste = s.aufgaben[s.reihe[s.pos + 1] ?? -1];
    if (naechste && naechste.typ in AUFGABEN_LADER) void ladeTyp(naechste.typ as ImplementierterTyp).catch(() => undefined);
  }, [s.aufgaben, s.reihe, s.pos]);

  const sende = (ereignisse: EreignisEntwurf[]) => ereignisse.forEach((e) => onEreignis(e));

  function gibAb(x: Antwort) {
    // die Bewertung kommt mit dem Chunk des Typs; ohne geladene Komponente gibt es keine Antwort
    const bewerte = a && bewerterFuer(a.aufgabe.typ);
    if (s.phase !== 'frage' || !bewerte) return;
    const r = pruefe(s, x, bewerte);
    setS(r.sitzung);
    setMeldung('');
    sende(r.ereignisse);
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

  const pos = s.pos;
  const nurUeberspringen = useCallback((ja: boolean) => setNurWeiterBei((alt) => (ja ? pos : alt === pos ? null : alt)), [pos]);

  function ueberspringeAufgabe({ typen, meldung }: { typen?: readonly AufgabenTyp[]; meldung?: string } = {}) {
    if (s.phase !== 'frage') return;
    const r = ueberspringe(s, { typen });
    setS(r.sitzung);
    setAntwort(null);
    setMeldung(meldung ?? '');
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
        {z.gesamt ? <Abschluss /> : null}
        <h2 id={`${id}-fertig`} ref={titel} tabIndex={-1} className="text-display-2 outline-none">
          {z.gesamt ? texte.spieler.fertigTitel : texte.spieler.leer}
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
  // nur überspringen: Hörübung ohne Clip („Audio folgt“) oder Wiedergabe auf dem Gerät nicht möglich (meldet die Übung)
  const ohneAudio = istHoerTyp(aufgabe.typ) && !hatAudio(aufgabe as MitHoeren);
  const nurWeiter = ohneAudio || nurWeiterBei === s.pos;

  return (
    <section aria-labelledby={`${id}-titel`} className="flex flex-col gap-5">
      <Fortschrittsleiste anteil={fortschritt(s)} beschriftung={texte.spieler.fortschritt} wertText={stand} />
      <p className="text-16 font-bold text-gruen-800">{a.wiederholung ? texte.spieler.nochEinmal : stand}</p>
      <form onSubmit={absenden} noValidate data-aufgabe={aufgabe.typ} className="flex flex-col gap-5">
        <h2 id={`${id}-titel`} ref={titel} tabIndex={-1} className="text-24 font-bold outline-none">
          {anweisung(aufgabe, texte.aufgaben)}
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
              tastatur={texte.tastatur}
              ueberspringe={ueberspringeAufgabe}
              nurUeberspringen={nurUeberspringen}
            />
          </Suspense>
        </Ladegrenze>
        {aufgabe.typ !== 'paare' && s.phase === 'frage' && !nurWeiter ? (
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
