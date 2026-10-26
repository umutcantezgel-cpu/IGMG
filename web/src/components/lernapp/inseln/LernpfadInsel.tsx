'use client';

import { Check, ChevronDown, Lightbulb } from 'lucide-react';
import { type CSSProperties, startTransition, useEffect, useRef, useState } from 'react';
import { abgeschlosseneStufen } from '@/lib/lernapp/ereignisse/stufen';
import { formatiere, intlSprache, zahl, type Ziffern } from '@/lib/lernapp/format';
import { richtung, type KursSlug, type Oberflaeche, type Sprache, type Stufe } from '@/lib/lernapp/kurse';
import { profilBereich, type PaketEintrag } from '@/lib/lernapp/lokal/db';
import { ladePaketKopf, ladeVerzeichnis, type PaketKopf, paketKopfImVorrat, raeumeAuf, speichereOffline } from '@/lib/lernapp/lokal/vorrat';
import { beimOeffnen } from '@/lib/lernapp/oberflaeche/abgleich';
import { einstellungsSpeicher } from '@/lib/lernapp/oberflaeche/einstellungen';
import { STAND_GEAENDERT, speicher, vorhandenesProfil } from '@/lib/lernapp/oberflaeche/geraet';
import {
  type Abschnitt,
  abschnitte,
  aktuelleUndNaechste,
  aufgeklappteStufe,
  type Station,
  themaVon,
} from '@/lib/lernapp/oberflaeche/kursverzeichnis';
import type { Verzeichnis, VerzeichnisEinheit } from '@/lib/lernapp/paket/typen';
import type de from '../../../../messages/lernapp/de.json';
import { LektionsArtMarke } from '../LektionsArtMarke';
import { istOfflineGespeichert, OfflineEinheit, OfflineStufe, type SeitenZustand, type StufeOfflineTexte } from '../OfflineEinheit';
import { bereiteOfflineVor, seitenStand } from '../offline';
import { LernStern } from '../Zeichen';

export type LernpfadTexte = StufeOfflineTexte & {
  leer: string;
  laedt: string;
  stufe: Record<Stufe, string>;
  einheit: string;
  fortschritt: string;
  lektion: string;
  geschafft: string;
  aktuell: string;
  lektionenZeigen: string;
  /** Knopf einer zugeklappten Stufe: Stufe, Zahl ihrer Einheiten und Handlung („A1: 14 Einheiten zeigen“) */
  stufeZeigen: string;
  nichtGeladen: string;
  tipps: string;
  ungeprueft: string;
  /** Wissenskurs: „Nach hanefitischer Lehre; geprüft von zwei Gelehrten der Gemeinde am {datum}“ (ohne Namen, LM-20) */
  pruefvermerk: string;
  fuerKinder: string;
  /** Wissenskurs: Lektion mit einer Aussage zu einem strittigen Thema (ADR 0040 Nr. 4) */
  strittig: string;
  /** Wissenskurs: aufklappbarer Inhalt der Lektion „Inhalt der Lektion ({anzahl} Aussagen)“ */
  inhalt: string;
  /** Wissenskurs: Beschriftung der Quellenzeile je Aussage */
  quelle: string;
  /** Wissenskurs: Kennzeichnung einer Aussage zu einem strittigen Thema */
  strittigesThema: string;
};

/** Texte zu abgeschlossenen Stufen und Lektionsarten (Namensraum `ansichten.stufen`, L4-03). */
export type StufenTexte = (typeof de)['ansichten']['stufen'];

type Zustand =
  | { art: 'laedt' }
  | { art: 'leer' }
  | {
      art: 'bereit';
      v: Verzeichnis;
      abschnitte: Abschnitt[];
      offline: Map<string, PaketEintrag>;
      /** in diesem Kurs abgeschlossene Stufen (alle Prüfsteine der Stufe geschafft, `stufen.ts`) */
      fertig: ReadonlySet<string>;
      /** geschaffte Lektionen (Speicher `lektionen`), für das Neuberechnen ohne erneutes Laden */
      erledigt: ReadonlySet<string>;
    };

/**
 * Paketköpfe aus dem Vorrat (ohne Netz) für die Einheiten der genannten Stufen, die noch keinen Kopf haben. Ein Kopf heißt:
 * Paket lesen, SHA-256 prüfen und das ganze JSON parsen – deshalb nur für Stufen, die Stationen zeigen (Stufe C N8).
 */
async function koepfeAusDemVorrat(
  kurs: KursSlug,
  v: Verzeichnis,
  stufen: ReadonlySet<Stufe | null>,
  pakete: Map<string, PaketKopf>,
): Promise<void> {
  await Promise.all(
    v.einheiten
      .filter((e) => stufen.has(e.stufe) && pakete.get(e.schluessel)?.einheit.schluessel !== e.schluessel)
      .map(async (e) => {
        const p = await paketKopfImVorrat(kurs, e);
        if (p) pakete.set(e.schluessel, p);
      }),
  );
}

/**
 * Seiten des Kurses samt Programmteilen in den Kursvorrat dieses Baus holen (nur was fehlt, Stufe C N9a, G-1); fehlten sie,
 * währenddessen „wird aktualisiert“ (ein vollständiger Stand flackert nicht). `true`, wenn alles da ist – ohne Service Worker
 * (Entwicklung) wie bisher.
 */
export async function holeSeiten(
  ui: Oberflaeche,
  kurs: KursSlug,
  setSeiten: (s: SeitenZustand | ((alt: SeitenZustand) => SeitenZustand)) => void,
): Promise<boolean> {
  setSeiten((alt) => (alt === 'unvollstaendig' ? 'aktualisiert' : alt));
  const stand = await bereiteOfflineVor(ui, kurs);
  const ok = stand === 'vollstaendig' || stand === 'ohne';
  setSeiten(ok ? 'vollstaendig' : 'unvollstaendig');
  return ok;
}

/**
 * Lernpfad eines Kurses (PLAN §3.1, B-24, ADR 0039 Nr. 12): Abschnitte (Stufen) → Einheiten als Stationen an der Linie →
 * Lektionen. Daten aus dem Kursverzeichnis (Netz zuerst, ohne Netz der Vorrat) und den Paketen auf dem Gerät; geschaffte
 * Lektionen aus der lokalen Datenbank. Die aktuelle und die nächste Einheit werden automatisch gespeichert; jede Einheit und
 * jede Stufe lässt sich bewusst offline speichern (Ring nach Bytes, B-27). Liegt etwas offline gespeichert, prüft der Lernpfad,
 * ob die Seiten des Kurses im Vorrat dieses Baus vollständig sind, und lässt sie sonst neu holen (Stufe C N9a, G-1). Links sind
 * einfache `<a>` (eigenes Dokument je Übung).
 * Eine Stufe, deren Prüfsteine in diesem Kurs alle geschafft sind, trägt „Stufe abgeschlossen“ (ADR 0043 Nr. 5, kein
 * Zertifikat); Geschichten und Prüfsteine sind in der Liste der Lektionen als solche benannt (L4-03). Offen steht nur die Stufe
 * der aktuellen Einheit; die übrigen klappen auf (`<details>`) und rendern ihre Stationen erst dann, und jede Karte zeichnet
 * sich erst in Sichtweite (Stufe C N8, KERN 4.0 §9: TBT, INP).
 */
export function LernpfadInsel({
  ui,
  kurs,
  adresse,
  texte,
  stufenTexte,
}: {
  ui: Oberflaeche;
  kurs: KursSlug;
  /** Adresse des Lernpfads (`/lern-app/<ui>/<kurs>`) */
  adresse: string;
  texte: LernpfadTexte;
  stufenTexte: StufenTexte;
}) {
  const [z, setZ] = useState<Zustand>({ art: 'laedt' });
  const [ziffern, setZiffern] = useState<Ziffern>('oestlich');
  const [fehlt, setFehlt] = useState<ReadonlySet<string>>(new Set());
  // von Hand aufgeklappte Stufen (die Stufe der aktuellen Einheit ist immer offen)
  const [offen, setOffen] = useState<ReadonlySet<Stufe>>(new Set());
  const offenJetzt = useRef<ReadonlySet<Stufe>>(offen);
  const pakete = useRef(new Map<string, PaketKopf>());
  // Stand der Kursseiten im Kursvorrat dieses Baus (gemeinsam für alle gespeicherten Einheiten des Kurses)
  const [seiten, setSeiten] = useState<SeitenZustand>('vollstaendig');

  useEffect(() => {
    let aktiv = true;
    async function laden() {
      const v = await ladeVerzeichnis(kurs);
      if (!v || v.kurs !== kurs || !v.einheiten.length) {
        if (aktiv) setZ({ art: 'leer' });
        return;
      }
      const sp = await speicher();
      // Alte Fassungen verlassen Vorrat und Speicher; offline gespeicherte Einheiten kommen in der neuen Fassung wieder
      const neuLaden = await raeumeAuf(sp, v).catch((): VerzeichnisEinheit[] => []);
      if (neuLaden.length)
        void speichereOffline(sp, kurs, neuLaden, { nachladen: true })
          .then(() => aktiv && window.dispatchEvent(new Event(STAND_GEAENDERT)))
          .catch(() => undefined);
      const { profil } = await vorhandenesProfil();
      const geschafft = profil ? await sp.alle('lektionen', profilBereich(profil.id)) : [];
      const erledigt = new Set(geschafft.map((l) => l.lektion));
      const fertig = new Set<string>(abgeschlosseneStufen(geschafft).get(kurs) ?? []);
      // Pakete auf dem Gerät (ohne Netz) für die Stufen mit Stationen, dann die aktuelle und die nächste Einheit
      // automatisch (ADR 0039 Nr. 12). Verschiebt ein gelesener Kopf die aktuelle Stufe (selten), kommt auch deren Stufe dazu.
      const sichtbar = () => new Set([aufgeklappteStufe(abschnitte(v, erledigt, pakete.current)), ...offenJetzt.current]);
      await koepfeAusDemVorrat(kurs, v, sichtbar(), pakete.current);
      for (const e of aktuelleUndNaechste(v, erledigt))
        if (!pakete.current.has(e.schluessel)) {
          const p = await ladePaketKopf(sp, kurs, e);
          if (p) pakete.current.set(e.schluessel, p);
        }
      await koepfeAusDemVorrat(kurs, v, sichtbar(), pakete.current);
      const offline = new Map((await sp.alle('pakete', [[kurs], [kurs, []]])).map((e) => [e.einheit, e]));
      // Seiten des Kurses im Kursvorrat dieses Baus (Stufe C N9a, G-1): nach einem Bauwechsel fehlen sie, bis der Worker sie neu
      // geholt hat – nur fragen, wenn hier etwas offline gespeichert ist (ohne Netz, kurz)
      const gespeichert = v.einheiten.some((e) => istOfflineGespeichert(e, offline));
      const fehlen = gespeichert && (await seitenStand(ui, kurs)) === 'fehlt';
      // als Übergang: React zeichnet die Stationen in Zeitscheiben statt in einem langen Block (Stufe C N8, TBT)
      if (!aktiv) return;
      startTransition(() => {
        setSeiten(fehlen ? 'aktualisiert' : 'vollstaendig');
        setZ({ art: 'bereit', v, abschnitte: abschnitte(v, erledigt, pakete.current), offline, fertig, erledigt });
      });
      if (fehlen) void holeSeiten(ui, kurs, setSeiten);
    }
    const neu = () => void laden().catch(() => aktiv && setZ((alt) => (alt.art === 'laedt' ? { art: 'leer' } : alt)));
    neu();
    void einstellungsSpeicher(ui)
      .laden()
      .then((e) => aktiv && setZiffern(e.ziffern));
    void beimOeffnen().catch(() => undefined);
    window.addEventListener(STAND_GEAENDERT, neu);
    return () => {
      aktiv = false;
      window.removeEventListener(STAND_GEAENDERT, neu);
    };
  }, [kurs, ui]);

  if (z.art === 'laedt') return <p className="text-18 text-tinte-2">{texte.laedt}</p>;
  if (z.art === 'leer') return <p className="text-18 text-tinte-2">{texte.leer}</p>;

  const v = z.v;
  const liste = z.abschnitte;
  // Stationen neu berechnen, ohne Verzeichnis und Speicher neu zu laden (nur der Lernpfad liest die Paketköpfe)
  const aktualisiere = (offline?: Map<string, PaketEintrag>) =>
    startTransition(() =>
      setZ((alt) =>
        alt.art === 'bereit'
          ? { ...alt, abschnitte: abschnitte(alt.v, alt.erledigt, pakete.current), ...(offline ? { offline } : {}) }
          : alt,
      ),
    );

  async function zeigeLektionen(s: Station) {
    const sp = await speicher();
    const p = await ladePaketKopf(sp, kurs, s.einheit);
    if (p) {
      pakete.current.set(s.einheit.schluessel, p);
      aktualisiere();
    } else setFehlt((alt) => new Set([...alt, s.einheit.schluessel]));
  }

  // Stufe von Hand aufgeklappt: erst dann ihre Stationen und die Paketköpfe ihrer Einheiten aus dem Vorrat. Als Übergang
  // (Stufe C N9a, INP „Stufe aufklappen“): Das geöffnete `<details>` zeichnet sich zuerst, die Stationen folgen in Zeitscheiben
  async function zeigeStufe(stufe: Stufe) {
    if (offenJetzt.current.has(stufe)) return;
    const neu = new Set([...offenJetzt.current, stufe]);
    offenJetzt.current = neu;
    startTransition(() => setOffen(neu));
    await koepfeAusDemVorrat(kurs, v, new Set([stufe]), pakete.current);
    aktualisiere();
  }

  // Einheit offline gespeichert: nur ihr Kopf und der Speicher `pakete` neu, nicht der ganze Lernpfad (Stufe C N8, INP)
  async function gespeichert(e: VerzeichnisEinheit) {
    const p = await paketKopfImVorrat(kurs, e);
    if (p) pakete.current.set(e.schluessel, p);
    const sp = await speicher();
    aktualisiere(new Map((await sp.alle('pakete', [[kurs], [kurs, []]])).map((x) => [x.einheit, x])));
  }

  // Stufe offline gespeichert: Köpfe ihrer Einheiten nur, wenn die Stufe Stationen zeigt; dazu der Speicher `pakete`
  async function stufeGespeichert(stufe: Stufe) {
    const zeigt = new Set([aufgeklappteStufe(liste), ...offenJetzt.current]);
    if (zeigt.has(stufe)) await koepfeAusDemVorrat(kurs, v, new Set([stufe]), pakete.current);
    const sp = await speicher();
    aktualisiere(new Map((await sp.alle('pakete', [[kurs], [kurs, []]])).map((x) => [x.einheit, x])));
  }

  // nach einem Abbruch: fehlen die Seiten im Kursvorrat dieses Baus, sagt es die Station („Erneut speichern“)
  async function seitenPruefen() {
    if ((await seitenStand(ui, kurs)) === 'fehlt') setSeiten('unvollstaendig');
  }

  const kontext: StationsKontext = {
    ui,
    ziffern,
    kurs,
    adresse,
    texte,
    stufenTexte,
    // Titel der Lektionen in der Sprache der Inhalte (Sprachkurse: Ausgangssprache; Wissenskurs: Deutsch)
    titelSprache: z.v.ausgangssprache ?? z.v.zielsprache,
    ausgang: z.v.ausgangssprache,
    offline: z.offline,
    fehlt,
    zeigeLektionen: (s) => void zeigeLektionen(s),
    gespeichert: (e) => gespeichert(e).catch(() => undefined),
    seiten,
    seitenVorhalten: () => holeSeiten(ui, kurs, setSeiten).catch(() => false),
    seitenPruefen: () => seitenPruefen().catch(() => undefined),
    stufeGespeichert: (stufe) => stufeGespeichert(stufe).catch(() => undefined),
  };

  return (
    <LernpfadStufen
      abschnitte={z.abschnitte}
      fertig={z.fertig}
      offen={offen}
      onAufklappen={(stufe) => void zeigeStufe(stufe).catch(() => undefined)}
      k={kontext}
    />
  );
}

/**
 * Die Stufen des Lernpfads (Stufe C N8): Überschrift und „Stufe abgeschlossen“ je Stufe; Stationen nur für die Stufe der
 * aktuellen Einheit (`aufgeklappteStufe`) und für von Hand aufgeklappte Stufen (`offen`), die übrigen als `<details>` mit der
 * Zahl ihrer Einheiten.
 */
export function LernpfadStufen({
  abschnitte: liste,
  fertig,
  offen,
  onAufklappen,
  k,
}: {
  abschnitte: readonly Abschnitt[];
  /** in diesem Kurs abgeschlossene Stufen */
  fertig: ReadonlySet<string>;
  offen: ReadonlySet<Stufe>;
  onAufklappen: (stufe: Stufe) => void;
  k: StationsKontext;
}) {
  const { texte, stufenTexte, ui, ziffern } = k;
  const aktuelleStufe = aufgeklappteStufe(liste);
  return (
    <div className="flex flex-col gap-8">
      {liste.map((a) => (
        <section key={a.stufe} aria-labelledby={`stufe-${a.stufe}`} className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <h3 id={`stufe-${a.stufe}`} className="text-30">
              {texte.stufe[a.stufe]}
            </h3>
            {fertig.has(a.stufe) ? (
              <p
                data-stufe-abgeschlossen={a.stufe}
                className="inline-flex items-center gap-2 rounded-pill bg-gruen-50 px-3 py-1 text-16 font-bold text-gruen-800"
              >
                <LernStern className="size-5 shrink-0 text-gruen-700" />
                {stufenTexte.abgeschlossen}
              </p>
            ) : null}
          </div>
          <OfflineStufe
            ui={ui}
            ziffern={ziffern}
            kurs={k.kurs}
            stufe={texte.stufe[a.stufe]}
            einheiten={a.stationen.map((s) => s.einheit)}
            offline={k.offline}
            seiten={k.seiten}
            seitenVorhalten={k.seitenVorhalten}
            seitenPruefen={k.seitenPruefen}
            onGespeichert={() => k.stufeGespeichert(a.stufe)}
            texte={texte}
          />
          {a.stufe === aktuelleStufe ? (
            <Stationen abschnitt={a} k={k} />
          ) : (
            <details
              data-stufe-zu={a.stufe}
              className="group"
              onToggle={(e) => {
                if (e.currentTarget.open) onAufklappen(a.stufe);
              }}
            >
              <summary className="inline-flex min-h-11 cursor-pointer items-center gap-2 font-bold">
                <ChevronDown
                  aria-hidden
                  className="size-5 shrink-0 text-gruen-700 group-open:rotate-180 motion-safe:transition-transform"
                />
                {formatiere(texte.stufeZeigen, { stufe: texte.stufe[a.stufe], anzahl: a.stationen.length }, ui, ziffern)}
              </summary>
              {offen.has(a.stufe) ? (
                <div className="pt-4">
                  <Stationen abschnitt={a} k={k} />
                </div>
              ) : null}
            </details>
          )}
        </section>
      ))}
    </div>
  );
}

/** Was jede Station braucht (gleich für alle Stationen eines Lernpfads). */
export type StationsKontext = {
  ui: Oberflaeche;
  ziffern: Ziffern;
  kurs: KursSlug;
  adresse: string;
  texte: LernpfadTexte;
  stufenTexte: StufenTexte;
  titelSprache: Sprache;
  /** Ausgangssprache der Richtung (Thema der Einheit, falls es in der Oberflächensprache fehlt); Wissenskurs `null` */
  ausgang: Sprache | null;
  /** bewusst offline gespeicherte Einheiten (Speicher `pakete`) */
  offline: ReadonlyMap<string, PaketEintrag>;
  /** Einheiten, deren Lektionen ohne Verbindung nicht zu laden waren */
  fehlt: ReadonlySet<string>;
  zeigeLektionen: (s: Station) => void;
  /** nach „Einheit offline speichern“: Station und Speicher `pakete` neu lesen */
  gespeichert: (e: VerzeichnisEinheit) => Promise<void>;
  /** Stand der Kursseiten im Kursvorrat dieses Baus (Stufe C N9a, G-1) */
  seiten: SeitenZustand;
  /** Seiten des Kurses holen (nach dem Speichern, „Erneut speichern“); `true`, wenn alles da ist */
  seitenVorhalten: () => Promise<boolean>;
  /** Stand der Kursseiten ohne Netz neu lesen (nach einem Abbruch) */
  seitenPruefen: () => Promise<void>;
  /** nach „Stufe offline speichern“: Speicher `pakete` und, falls sichtbar, die Stationen der Stufe neu lesen */
  stufeGespeichert: (stufe: Stufe) => Promise<void>;
};

/** Stationen je Takt beim Aufbau einer Stufe (`Stationen`). */
export const STATIONEN_JE_TAKT = 4;

/** Wie viele Stationen nach einem weiteren Takt stehen (von `gezeigt` aus, höchstens alle `n`). */
export const naechsterTakt = (gezeigt: number, n: number): number => Math.min(n, gezeigt + STATIONEN_JE_TAKT);
/** Ruhe nach dem Aufbau der ersten Stationen, nach der die übrigen ohne Eingabe folgen (ms). */
export const RUHE_MS = 1500;
/**
 * Eingaben, nach denen die übrigen Stationen folgen: Klick bzw. Tippen und Taste (losgelassen). Bildlauf und Rad nicht (Stufe C
 * N9a, Spur der Messbau-Stufe): Wer zu einem Knopf blättert, tippt ihn Augenblicke später an – die Häppchen liefen dann genau
 * in dieses Tippen hinein (Übernahme und Stil eines Häppchens ≈ 120 ms bei CPU ×6). Blättern holt die Stationen nach der
 * Ruhezeit; der Browser hält die Ansicht dabei an ihrem Platz (Scroll Anchoring).
 */
const EINGABEN = ['click', 'keyup'] as const;

let weitereStationen: Promise<void> | null = null;

/**
 * Wann die übrigen Stationen folgen dürfen (Stufe C N9a, Gegenprüfung N8 Nr. 5a): erst nach der ersten Eingabe auf der Seite
 * (`EINGABEN`) oder nach `RUHE_MS` – und dann erst nach dem nächsten Bild. So trifft die erste Eingabe (etwa „offline
 * speichern“ direkt nach dem Öffnen) nie auf Rendern, Übernahme und Layout weiterer Häppchen (INP). Einmal je Seite; danach
 * (z. B. beim Aufklappen einer Stufe) folgen die Takte sofort.
 */
export function nachEingabeOderRuhe(): Promise<void> {
  if (!weitereStationen)
    weitereStationen = new Promise<void>((weiter) => {
      const los = () => {
        clearTimeout(zeit);
        for (const art of EINGABEN) window.removeEventListener(art, los, true);
        requestAnimationFrame(() => setTimeout(weiter, 0));
      };
      const zeit = setTimeout(los, RUHE_MS);
      for (const art of EINGABEN) window.addEventListener(art, los, { capture: true, passive: true });
    });
  return weitereStationen;
}

/**
 * Stationen einer Stufe an der Linie (B-24): Die Linie zeichnet sich je Stufe von Station zu Station (`--i` Station in der
 * Stufe, `--n` Abschnitte der Stufe), auch beim späteren Aufklappen ohne Wartezeit.
 */
function Stationen({ abschnitt, k }: { abschnitt: Abschnitt; k: StationsKontext }) {
  const n = abschnitt.stationen.length;
  // In Häppchen (Stufe C N8): zuerst die ersten Stationen, dann je Takt weitere – Rendern, Stil und Layout einer ganzen Stufe
  // (bis 16 Einheiten) liefen sonst in einem langen Block auf dem Hauptfaden (TBT, INP); die Takte erst nach der ersten Eingabe
  // oder nach einer Ruhezeit (N9a, `nachEingabeOderRuhe`)
  const [gezeigt, setGezeigt] = useState(() => naechsterTakt(0, n));
  useEffect(() => {
    if (gezeigt >= n) return;
    let aktiv = true;
    let takt: ReturnType<typeof setTimeout> | undefined;
    void nachEingabeOderRuhe().then(() => {
      if (aktiv) takt = setTimeout(() => startTransition(() => setGezeigt((g) => naechsterTakt(g, n))), 0);
    });
    return () => {
      aktiv = false;
      clearTimeout(takt);
    };
  }, [gezeigt, n]);
  return (
    <ol className="relative flex flex-col" style={{ '--n': Math.max(1, n - 1) } as CSSProperties}>
      {abschnitt.stationen.slice(0, gezeigt).map((s, i) => (
        <StationEintrag key={s.einheit.schluessel} s={s} i={i} letzte={i === n - 1} k={k} />
      ))}
    </ol>
  );
}

/**
 * Eine Station: Nummer am Weg, Karte mit Thema, Fortschritt, Lektionen (falls das Paket auf dem Gerät liegt, sonst
 * „Lektionen zeigen“), Grammatik-Tipps und „Einheit offline speichern“. Die Karte zeichnet sich erst in Sichtweite
 * (`zeichnen-bei-sicht`).
 */
function StationEintrag({ s, i, letzte, k }: { s: Station; i: number; letzte: boolean; k: StationsKontext }) {
  const { ui, ziffern, texte, stufenTexte, titelSprache, adresse } = k;
  const f = (vorlage: string, werte: Record<string, number>) => formatiere(vorlage, werte, ui, ziffern);
  const thema = themaVon(s.einheit, ui, k.ausgang);
  const kennung = f(texte.einheit, { n: s.nummer });
  // Prüfvermerk: Tag der Freigabe (UTC, wie im Paket) in der Oberflächensprache
  const datum = (iso: string) =>
    new Intl.DateTimeFormat(intlSprache(ui, ziffern), { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
      new Date(`${iso}T00:00:00Z`),
    );
  return (
    <li className="flex gap-4 md:gap-5" style={{ '--i': i } as CSSProperties}>
      <div aria-hidden className="flex shrink-0 flex-col items-center pt-2">
        <span className="lernweg-station relative flex size-14 items-center justify-center text-gruen-700">
          <LernStern viewBox="3.5 3.5 17 17" className="absolute inset-0 size-full" />
          <span className="relative text-18 font-bold text-weiss">{zahl(s.nummer, ui, ziffern)}</span>
        </span>
        {letzte ? null : (
          <span className="lernweg-abschnitt -mb-2 min-h-6 w-0.5 flex-1 bg-gruen-700" style={{ '--i': i } as CSSProperties} />
        )}
      </div>
      <div className="min-w-0 flex-1 pb-6">
        <section
          aria-labelledby={`einheit-${s.nummer}`}
          className={`flex flex-col gap-3 rounded-lg border bg-weiss p-5 shadow-s1 zeichnen-bei-sicht ${s.aktuell ? 'border-gruen-700' : 'border-linie'}`}
          style={{ '--lektionen': s.lektionen?.length ?? 0 } as CSSProperties}
        >
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-16 font-bold text-gruen-800">
            <span>{kennung}</span>
            {s.aktuell ? <span className="rounded-pill bg-gruen-50 px-3 py-0.5">{texte.aktuell}</span> : null}
          </p>
          <h4 id={`einheit-${s.nummer}`} className="text-24 leading-ueberschrift">
            {thema ? (
              <span lang={thema.sprache} dir={richtung(thema.sprache)}>
                {thema.text}
              </span>
            ) : (
              kennung
            )}
          </h4>
          <p className="text-16 text-tinte-2">{f(texte.fortschritt, { erledigt: s.erledigt, gesamt: s.einheit.lektionen })}</p>
          {s.einheit.hinweis ? <p className="text-16 text-tinte-2">{texte.ungeprueft}</p> : null}
          {s.lektionen ? (
            <ul className="flex flex-col gap-1">
              {s.lektionen.map((l, n) => (
                <li key={l.schluessel}>
                  <a
                    href={`${adresse}/ueben?l=${encodeURIComponent(l.schluessel)}`}
                    className="inline-flex min-h-11 items-center gap-2 font-bold underline-offset-4 hover:underline"
                  >
                    {l.erledigt ? (
                      <Check aria-hidden className="size-5 shrink-0 text-gruen-700" />
                    ) : (
                      <LernStern linie className="size-5 shrink-0 text-gruen-700" />
                    )}
                    {l.titel ? (
                      <span lang={titelSprache} dir={richtung(titelSprache)}>
                        {l.titel}
                      </span>
                    ) : (
                      f(texte.lektion, { n: n + 1 })
                    )}
                    <LektionsArtMarke art={l.art} texte={stufenTexte.art} />
                    {l.erledigt ? <span className="sr-only">({texte.geschafft})</span> : null}
                  </a>
                  {l.vermerk ? (
                    // Wissenskurs: Prüfvermerk ohne Namen und Kennzeichnung je Lektion (KERN 4.0 §2.3, PLAN §6.7 Nr. 7)
                    <p data-pruefvermerk={l.schluessel} className="ps-7 text-16 text-tinte-2">
                      {formatiere(texte.pruefvermerk, { datum: datum(l.vermerk.geprueftAm) }, ui, ziffern)}
                      {l.vermerk.kinderGeeignet ? <> · {texte.fuerKinder}</> : null}
                      {l.vermerk.strittig ? <> · {texte.strittig}</> : null}
                    </p>
                  ) : null}
                  {l.vermerk?.aussagen.length ? (
                    // Wissenskurs: alle Aussagen der Lektion mit Quellenzeile, auch die ohne Quizfrage (KERN 4.0 §2.3)
                    <details data-lektionsinhalt={l.schluessel} className="ps-7 text-16">
                      <summary className="inline-flex min-h-11 cursor-pointer items-center gap-2 font-bold">
                        <ChevronDown aria-hidden className="size-5 shrink-0" />
                        {formatiere(texte.inhalt, { anzahl: l.vermerk.aussagen.length }, ui, ziffern)}
                      </summary>
                      <ul className="flex flex-col gap-3 pb-2">
                        {l.vermerk.aussagen.map((x) => (
                          <li key={x.schluessel} className="flex flex-col gap-1">
                            <p lang="de" dir="ltr" className="text-18">
                              {x.text}
                            </p>
                            <p className="text-tinte-2">
                              {texte.quelle}:{' '}
                              <bdi lang="de" dir="ltr">
                                {x.quelle}
                              </bdi>
                            </p>
                            {x.strittig ? <p className="font-bold">{texte.strittigesThema}</p> : null}
                          </li>
                        ))}
                      </ul>
                    </details>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-start gap-1">
              <button
                type="button"
                onClick={() => k.zeigeLektionen(s)}
                className="inline-flex min-h-11 items-center gap-2 font-bold underline-offset-4 hover:underline"
              >
                <ChevronDown aria-hidden className="size-5" />
                {texte.lektionenZeigen}
              </button>
              {k.fehlt.has(s.einheit.schluessel) ? (
                <p role="status" className="text-16 text-tinte-2">
                  {texte.nichtGeladen}
                </p>
              ) : null}
            </div>
          )}
          {s.tipps ? (
            <a
              href={`${adresse}/tipps?e=${encodeURIComponent(s.einheit.schluessel)}`}
              className="inline-flex min-h-11 items-center gap-2 self-start font-bold underline-offset-4 hover:underline"
            >
              <Lightbulb aria-hidden className="size-5 text-gruen-700" />
              {texte.tipps}
            </a>
          ) : null}
          <OfflineEinheit
            ui={ui}
            ziffern={ziffern}
            kurs={k.kurs}
            einheit={s.einheit}
            gespeichert={istOfflineGespeichert(s.einheit, k.offline)}
            seiten={k.seiten}
            seitenVorhalten={k.seitenVorhalten}
            onGespeichert={() => k.gespeichert(s.einheit)}
            texte={texte}
          />
        </section>
      </div>
    </li>
  );
}
