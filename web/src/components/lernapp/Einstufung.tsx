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
  useMemo,
  useRef,
  useState,
} from 'react';
import { bereiteLexikon, type Lexikon } from '@/lib/lernapp/abgleich/vergleichsform';
import { brauchtHoeren } from '@/lib/lernapp/aufgaben/hilfen';
import type { Antwort, AufgabenTyp, Auswertung, ImplementierterTyp } from '@/lib/lernapp/aufgaben/schema';
import {
  beantworte,
  bedarf,
  beende,
  type EinstufungsErgebnis,
  type EinstufungsStand,
  ergebnis,
  type Kandidat,
  starteEinstufung,
  waehle,
} from '@/lib/lernapp/engine/einstufung';
import { formatiere, type Werte, type Ziffern } from '@/lib/lernapp/format';
import type { Sprache, Stufe } from '@/lib/lernapp/kurse';
import { anweisung, loesungSprache, mitPruefen } from './uebungskopf';
import { AUFGABEN_LADER, bewerterFuer, ladeTyp } from './aufgaben/lader';
import { Fortschrittsleiste } from './Fortschrittsleiste';
import { Rueckmeldung } from './Rueckmeldung';
import { type AufgabenProps, type SpielerOptionen, type SpielerTexte, STANDARD_OPTIONEN, type UiSprache } from './typen';

export type EinstufungTexte = {
  titel: string;
  text: string;
  bald: string;
  hinweis: string;
  start: string;
  laedt: string;
  nichtVerfuegbar: string;
  fortschritt: string;
  aufgabeVon: string;
  ergebnisTitel: string;
  ergebnisStufe: string;
  ergebnisText: string;
  einsteigen: string;
  gespeichert: string;
};

/** Aufgaben einer Stufe aus den Paketen (lädt die Insel; mit den Kurswörtern für den Lexikonschutz). */
export type KandidatenQuelle = (stufe: Stufe) => Promise<{ kandidaten: Kandidat[]; lexikon: string[] }>;

export type EinstufungProps = {
  kurs: string;
  /** Stufen des Kurses aufsteigend (Kursverzeichnis) */
  stufen: readonly Stufe[];
  einheiten: readonly { schluessel: string; stufe: Stufe }[];
  zielsprache: Sprache;
  ladeKandidaten: KandidatenQuelle;
  texte: EinstufungTexte;
  spielerTexte: SpielerTexte;
  sprache: UiSprache;
  ziffern: Ziffern;
  /** Einstellungen „Hörübungen aus“ usw. (für die Übungen; die Bank filtert Hörübungen schon in der Insel) */
  optionen?: SpielerOptionen;
  /** Ergebnis speichern (Ereignis `einstufung`); `null` ohne beantwortete Aufgabe */
  onFertig: (e: EinstufungsErgebnis | null) => void;
  /** Ergebnisansicht (Vorschlag, Links) */
  ergebnisAnsicht: (e: EinstufungsErgebnis | null) => ReactNode;
};

type Komponenten = { [T in ImplementierterTyp]: ComponentType<AufgabenProps<T>> };
const erzeugeKomponenten = (): Komponenten =>
  Object.fromEntries(
    (Object.keys(AUFGABEN_LADER) as ImplementierterTyp[]).map((t) => [
      t,
      lazy(() => ladeTyp(t) as unknown as Promise<{ default: ComponentType }>),
    ]),
  ) as unknown as Komponenten;

/** Fängt einen fehlgeschlagenen Chunk-Abruf (ohne Netz) ab. */
class Grenze extends Component<{ ersatz: ReactNode; children: ReactNode }, { fehler: boolean }> {
  state = { fehler: false };
  static getDerivedStateFromError() {
    return { fehler: true };
  }
  render() {
    return this.state.fehler ? this.props.ersatz : this.props.children;
  }
}

const PRUEFEN =
  'min-h-12 druck self-end rounded-pill bg-gruen-700 px-8 font-bold text-weiss hover:bg-gruen-800 disabled:bg-linie disabled:text-tinte-2';

type Phase = 'laedt' | 'frage' | 'rueckmeldung' | 'fertig' | 'fehlt';

/**
 * Einstufungstest (ADR 0043 Nr. 6, PLAN §3.1): Aufgaben aus den Paketen des Kurses, adaptiv nach `engine/einstufung.ts`,
 * ganz auf dem Gerät. Bedienung wie im Spieler – dieselben Übungs-Chunks samt Bewertung (`lader.ts`), Fokus nach dem Prüfen
 * auf „Weiter“, eine Live-Region (Rückmeldeblatt, B-29), Lektionsleiste (B-28) –, aber ohne Wiederholung falscher Aufgaben,
 * ohne Karten-Bewertung und ohne XP. Keine Zeitgrenze; abbrechen geht jederzeit über die Navigation.
 */
export function Einstufung({
  kurs,
  stufen,
  einheiten,
  zielsprache,
  ladeKandidaten,
  texte,
  spielerTexte,
  sprache,
  ziffern,
  optionen = STANDARD_OPTIONEN,
  onFertig,
  ergebnisAnsicht,
}: EinstufungProps) {
  const id = useId();
  const [st, setSt] = useState<EinstufungsStand>(() => starteEinstufung(kurs, stufen));
  const [phase, setPhase] = useState<Phase>('laedt');
  const [aktuell, setAktuell] = useState<Kandidat | null>(null);
  const [antwort, setAntwort] = useState<Antwort | null>(null);
  const [auswertung, setAuswertung] = useState<Auswertung | null>(null);
  const [meldung, setMeldung] = useState('');
  // Hörübung, deren Ton auf dem Gerät nicht spielt: nur „Überspringen“, kein „Prüfen“
  const [nurWeiter, setNurWeiter] = useState(false);
  const [komponenten] = useState(erzeugeKomponenten);
  const bank = useRef<Kandidat[]>([]);
  const geladen = useRef(new Set<Stufe>());
  const woerter = useRef(new Set<string>());
  const [lexikon, setLexikon] = useState<Lexikon | undefined>(undefined);
  const titel = useRef<HTMLHeadingElement>(null);
  const weiterKnopf = useRef<HTMLButtonElement>(null);
  const gemeldet = useRef(false);
  const f = (vorlage: string, werte?: Werte) => formatiere(vorlage, werte, sprache, ziffern);

  // nächste Aufgabe: Stufe bei Bedarf laden (Pakete, Zod in der Insel), Übungs-Chunk samt Bewertung holen
  useEffect(() => {
    if (phase !== 'laedt') return;
    let aktiv = true;
    async function naechste() {
      const stufe = bedarf(st);
      if (stufe && !geladen.current.has(stufe)) {
        const neu = await ladeKandidaten(stufe);
        geladen.current.add(stufe);
        bank.current = [...bank.current, ...neu.kandidaten];
        const vorher = woerter.current.size;
        for (const w of neu.lexikon) woerter.current.add(w);
        if (woerter.current.size !== vorher && aktiv) setLexikon(bereiteLexikon([...woerter.current], zielsprache));
      }
      const k = waehle(st, bank.current);
      if (!aktiv) return;
      if (!k) {
        setSt(beende(st));
        setPhase('fertig');
        return;
      }
      await ladeTyp(k.aufgabe.typ as ImplementierterTyp);
      if (!aktiv) return;
      setAktuell(k);
      setAntwort(null);
      setAuswertung(null);
      setNurWeiter(false);
      setPhase('frage');
    }
    naechste().catch(() => aktiv && setPhase('fehlt'));
    return () => {
      aktiv = false;
    };
  }, [phase, st, ladeKandidaten, zielsprache]);

  const fertig = phase === 'fertig';
  const e = useMemo(() => (fertig ? ergebnis(st, einheiten) : null), [fertig, st, einheiten]);
  useEffect(() => {
    if (!fertig || gemeldet.current) return;
    gemeldet.current = true;
    onFertig(e);
  }, [fertig, e, onFertig]);

  // Fokus: nach dem Prüfen auf „Weiter“, bei neuer Aufgabe und am Ende auf die Überschrift (nicht bei der ersten)
  useEffect(() => {
    if (phase === 'rueckmeldung') weiterKnopf.current?.focus();
    else if ((phase === 'frage' && st.verlauf.length > 0) || phase === 'fertig') titel.current?.focus();
  }, [phase, st.verlauf.length]);

  const gibAb = useCallback(
    (x: Antwort) => {
      const bewerte = aktuell && bewerterFuer(aktuell.aufgabe.typ);
      if (phase !== 'frage' || !aktuell || !bewerte) return;
      const a = bewerte(aktuell.aufgabe, x, { lexikon });
      setAuswertung(a);
      setSt((alt) => beantworte(alt, aktuell, a.urteil));
      setMeldung('');
      setPhase('rueckmeldung');
    },
    [aktuell, lexikon, phase],
  );

  function absenden(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    if (antwort) gibAb(antwort);
  }

  function weiter() {
    setMeldung('');
    setPhase(st.fertig ? 'fertig' : 'laedt');
  }

  // Hörübung ohne Ton oder Hören nicht möglich: ohne Wertung weiter (zählt nicht, KERN 4.0 §4); mit `typen` fallen auch
  // alle übrigen Aufgaben dieser Typen weg, mit `hoeren` alle, die Hören brauchen („Ich kann gerade nicht hören“)
  function ueberspringe({
    typen = [],
    hoeren = false,
    meldung: m,
  }: { typen?: readonly AufgabenTyp[]; hoeren?: boolean; meldung?: string } = {}) {
    if (phase !== 'frage' || !aktuell) return;
    bank.current = bank.current.filter((k) => k !== aktuell && !typen.includes(k.aufgabe.typ) && !(hoeren && brauchtHoeren(k.aufgabe)));
    setMeldung(m ?? '');
    setPhase('laedt');
  }

  if (phase === 'fehlt')
    return (
      <p role="status" className="text-18 text-tinte-2">
        {texte.nichtVerfuegbar}
      </p>
    );
  if (fertig) {
    return (
      <section aria-labelledby={`${id}-fertig`} className="flex flex-col items-start gap-5">
        <h2 id={`${id}-fertig`} ref={titel} tabIndex={-1} className="text-display-2 outline-none">
          {texte.ergebnisTitel}
        </h2>
        {ergebnisAnsicht(e)}
      </section>
    );
  }

  const stand = f(texte.aufgabeVon, { nr: st.verlauf.length + (phase === 'rueckmeldung' ? 0 : 1), anzahl: st.anzahl });
  const aufgabe = phase === 'laedt' ? null : aktuell?.aufgabe;
  const Uebung = aufgabe ? (komponenten[aufgabe.typ as ImplementierterTyp] as ComponentType<AufgabenProps<ImplementierterTyp>>) : null;
  return (
    <section aria-labelledby={`${id}-titel`} className="flex flex-col gap-5">
      <Fortschrittsleiste anteil={st.verlauf.length / st.anzahl} beschriftung={texte.fortschritt} wertText={stand} />
      <p className="text-16 font-bold text-gruen-800">{stand}</p>
      {!aufgabe || !Uebung ? (
        <p id={`${id}-titel`} className="text-18 text-tinte-2">
          {texte.laedt}
        </p>
      ) : (
        <form onSubmit={absenden} noValidate data-aufgabe={aufgabe.typ} className="flex flex-col gap-5">
          <h2 id={`${id}-titel`} ref={titel} tabIndex={-1} className="text-24 font-bold outline-none">
            {anweisung(aufgabe, spielerTexte)}
          </h2>
          <Grenze ersatz={<p className="text-18 text-fehler">{spielerTexte.spieler.ladefehler}</p>}>
            <Suspense fallback={<p className="text-18 text-tinte-2">{spielerTexte.spieler.laedt}</p>}>
              <Uebung
                key={aufgabe.schluessel}
                aufgabe={aufgabe as never}
                texte={spielerTexte.aufgaben}
                sprache={sprache}
                ziffern={ziffern}
                gesperrt={phase !== 'frage'}
                auswertung={auswertung}
                antwort={antwort as never}
                setzeAntwort={setAntwort}
                gibAb={gibAb}
                melde={setMeldung}
                tastatur={spielerTexte.tastatur}
                weitere={spielerTexte}
                ueberspringe={ueberspringe}
                nurUeberspringen={setNurWeiter}
                optionen={optionen}
              />
            </Suspense>
          </Grenze>
          {mitPruefen(aufgabe) && phase === 'frage' && !nurWeiter ? (
            <button type="submit" disabled={!antwort} className={PRUEFEN}>
              {spielerTexte.spieler.pruefen}
            </button>
          ) : null}
        </form>
      )}
      <Rueckmeldung
        auswertung={phase === 'rueckmeldung' ? auswertung : null}
        texte={spielerTexte.spieler}
        loesungSprache={aufgabe ? loesungSprache(aufgabe) : null}
        wirdWiederholt={false}
        meldung={meldung}
        onWeiter={weiter}
        weiterRef={weiterKnopf}
      />
    </section>
  );
}
