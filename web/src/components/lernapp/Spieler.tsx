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
import { brauchtHoeren, hatAudio, HOER_TYPEN, istHoerTyp, type MitHoeren } from '@/lib/lernapp/aufgaben/hilfen';
import type { Antwort, AufgabenTyp, ImplementierterTyp, Lektion } from '@/lib/lernapp/aufgaben/schema';
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
import { Abschluss } from './Abschluss';
import { anweisung, loesungSprache, mitPruefen } from './uebungskopf';
import { AUFGABEN_LADER, bewerterFuer, ladeTyp } from './aufgaben/lader';
import { Fortschrittsleiste } from './Fortschrittsleiste';
import { Rueckmeldung } from './Rueckmeldung';
import { type AufgabenProps, type SpielerOptionen, type SpielerTexte, STANDARD_OPTIONEN, type UiSprache } from './typen';

/**
 * Lektionsspieler (PLAN §4, KERN §7–§9): spielt eine Lektion als reinen Zustandsautomaten (engine/sitzung.ts) und meldet
 * jedes Ereignis über `onEreignis` (Gerät, Nummer, Zeit und Lerntag ergänzt der Ausgang, lokal/ausgang.ts). Übungstypen
 * laden als eigene Chunks per `import()` (aufgaben/lader.ts), der nächste wird ab der ersten Eingabe vorab geholt; jeder
 * Chunk bringt seine Bewertung mit (`bewerterFuer`), die Route enthält keine. Texte kommen als Prop aus
 * `messages/lernapp/<ui>.json` (Namensräume `spieler` und `aufgaben`) und werden mit `format.ts` gefüllt.
 *
 * ```tsx
 * <Spieler lektion={lektion} texte={{ spieler, aufgaben }} sprache="de" onEreignis={(e) => haengeAn(sp, profil, e)} />
 * ```
 *
 * Lektionsformat: `aufgaben/schema.ts` (`LektionSchema`, passend zum Einheitenpaket nach ADR 0039). Spielbar sind die Typen
 * in `IMPLEMENTIERT` (alle Typen aus PLAN §4); andere werden übersprungen. Hörübungen fallen mit „Hörübungen aus“
 * (`optionen.hoeren`) schon beim Start weg, Sprechaufgaben mit „Sprechübungen aus“, Schrift-Aufgaben, die nur ein
 * Hörbeispiel haben, ebenso. Ohne Audio oder nach „Ich kann gerade nicht hören“ überspringt die Übung selbst
 * (`ueberspringe`, ohne Bewertung). `sprechen` und `schreiben` bewerten sich selbst und gehen ohne Rückmeldeblatt weiter;
 * `grammatik_tipp` und „Ich kann gerade nicht sprechen“ überspringen ohne Wertung. Texte zusätzlich aus den Namensräumen
 * `tastatur`, `aufgaben2`, `sprechen` und `schreiben`.
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
const erzeugeKomponenten = (): Komponenten =>
  Object.fromEntries(
    (Object.keys(AUFGABEN_LADER) as ImplementierterTyp[]).map((t) => [
      t,
      lazy(() => ladeTyp(t) as unknown as Promise<{ default: ComponentType }>),
    ]),
  ) as unknown as Komponenten;

/** Aufgaben, die mit den Einstellungen nicht spielbar sind, fallen vor dem Start weg (keine Sackgasse, KERN 4.0 §8). */
function spielbar(lektion: Lektion, o: SpielerOptionen): Lektion {
  const aufgaben = lektion.aufgaben.filter((a) => {
    if (a.typ === 'sprechen') return o.sprechen;
    return o.hoeren || !brauchtHoeren(a);
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

/** Ereignisse, die als erste Eingabe gelten (Zeiger, Taste; Klick auch für Screenreader im Lesemodus). */
const EINGABEN = ['pointerdown', 'keydown', 'click'] as const;

/** `true` ab der ersten Eingabe auf der Seite (einmal, in der Einfangphase). */
function useErsteEingabe(): boolean {
  const [da, setDa] = useState(false);
  useEffect(() => {
    if (da) return;
    const an = () => setDa(true);
    for (const art of EINGABEN) document.addEventListener(art, an, { capture: true, once: true });
    return () => {
      for (const art of EINGABEN) document.removeEventListener(art, an, { capture: true });
    };
  }, [da]);
  return da;
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
  const [s, setS] = useState<Sitzung>(() => starte(spielbar(lektion, optionen), { ohne: optionen.hoeren ? [] : HOER_TYPEN }));
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

  // nächsten Übungstyp vorab laden (eigener Chunk mit Bewertung, KERN §9) – ab der ersten Eingabe, damit beim Öffnen nur
  // die erste Aufgabe lädt (Spieler-Route: zusätzlich zur Hülle ≤ 60 KB, TBT)
  const eingabe = useErsteEingabe();
  useEffect(() => {
    const naechste = s.aufgaben[s.reihe[s.pos + 1] ?? -1];
    if (eingabe && naechste && naechste.typ in AUFGABEN_LADER) void ladeTyp(naechste.typ as ImplementierterTyp).catch(() => undefined);
  }, [eingabe, s.aufgaben, s.reihe, s.pos]);

  const sende = (ereignisse: EreignisEntwurf[]) => ereignisse.forEach((e) => onEreignis(e));

  function gibAb(x: Antwort) {
    // die Bewertung kommt mit dem Chunk des Typs; ohne geladene Komponente gibt es keine Antwort
    const bewerte = a && bewerterFuer(a.aufgabe.typ);
    if (s.phase !== 'frage' || !bewerte) return;
    const r = pruefe(s, x, bewerte);
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

  /** Ohne Wertung weiter (gelesener Tipp, Hörübung ohne Audio, „Ich kann gerade nicht hören/sprechen“). */
  function ueberspringeAufgabe({ typen, hoeren, meldung }: { typen?: readonly AufgabenTyp[]; hoeren?: boolean; meldung?: string } = {}) {
    if (s.phase !== 'frage') return;
    const r = ueberspringe(s, { typen, hoeren });
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
  // nur überspringen: Hörübung ohne Clip („Audio folgt“) oder Wiedergabe auf dem Gerät nicht möglich (meldet die Übung)
  const ohneAudio = istHoerTyp(aufgabe.typ) && !hatAudio(aufgabe as MitHoeren);
  const nurWeiter = ohneAudio || nurWeiterBei === s.pos;

  return (
    <section aria-labelledby={`${id}-titel`} className="flex flex-col gap-5">
      <Fortschrittsleiste anteil={fortschritt(s)} beschriftung={texte.spieler.fortschritt} wertText={stand} />
      <p className="text-16 font-bold text-gruen-800">{a.wiederholung ? texte.spieler.nochEinmal : stand}</p>
      <form onSubmit={absenden} noValidate data-aufgabe={aufgabe.typ} className="flex flex-col gap-5">
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
              tastatur={texte.tastatur}
              weitere={texte}
              ueberspringe={ueberspringeAufgabe}
              nurUeberspringen={nurUeberspringen}
              optionen={optionen}
            />
          </Suspense>
        </Ladegrenze>
        {mitPruefen(aufgabe) && s.phase === 'frage' && !nurWeiter ? (
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
