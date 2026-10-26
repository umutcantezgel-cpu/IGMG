'use client';

import { CircleCheck, Download, RefreshCw, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { formatiere, intlSprache, ziffernVon, type Ziffern } from '@/lib/lernapp/format';
import type { KursSlug, Oberflaeche } from '@/lib/lernapp/kurse';
import type { PaketEintrag } from '@/lib/lernapp/lokal/db';
import { offlineBedarf, speichereOffline } from '@/lib/lernapp/lokal/vorrat';
import { meldeStand, speicher } from '@/lib/lernapp/oberflaeche/geraet';
import type { VerzeichnisEinheit } from '@/lib/lernapp/paket/typen';

export type OfflineTexte = {
  offline: string;
  offlineText: string;
  offlineLaeuft: string;
  offlineFortschritt: string;
  offlineFertig: string;
  offlineFehler: string;
  offlineNichtMoeglich: string;
  /** Seiten des Kurses werden für den neuen Bau geholt (Stufe C N9a, G-1) */
  offlineAktualisieren: string;
  /** Seiten des Kurses fehlen im Vorrat dieses Baus (ohne Verbindung nachzuholen gescheitert) */
  offlineUnvollstaendig: string;
  offlineErneut: string;
};

/** Texte von „Stufe offline speichern“ (ADR 0039 Nr. 12, PLAN §3.5). */
export type StufeOfflineTexte = OfflineTexte & {
  stufeOffline: string;
  stufeOfflineText: string;
  stufeOfflineRest: string;
  stufeOfflineLaeuft: string;
  stufeOfflineFortschritt: string;
  stufeOfflineFertig: string;
  stufeOfflineAbbrechen: string;
  stufeOfflineAbgebrochen: string;
};

/**
 * Stand der Kursseiten im Kursvorrat dieses Baus (Stufe C N9a, Befund G-1): `vollstaendig` – gespeicherte Einheiten starten ohne
 * Netz; `aktualisiert` – nach einem Bauwechsel werden sie gerade geholt; `unvollstaendig` – das Holen ist gescheitert (ohne
 * Verbindung), „Erneut speichern“ holt nach.
 */
export type SeitenZustand = 'vollstaendig' | 'aktualisiert' | 'unvollstaendig';

const UMFANG = 2 * Math.PI * 20;

/** B-27: Ring nach echten Bytes (Muster `website/quran/OfflineSpeichern.tsx`); reduziert ohne Übergang. */
export function Ring({ anteil, beschriftung }: { anteil: number; beschriftung: string }) {
  return (
    <svg
      role="progressbar"
      aria-label={beschriftung}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(anteil * 100)}
      viewBox="0 0 48 48"
      className="size-12 shrink-0 -rotate-90"
    >
      <circle cx="24" cy="24" r="20" fill="none" strokeWidth="4" className="stroke-linie" />
      <circle
        cx="24"
        cy="24"
        r="20"
        fill="none"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={UMFANG}
        strokeDashoffset={UMFANG * (1 - anteil)}
        className="stroke-gruen-700 transition-strich duration-(--dauer-rueckmeldung) motion-reduce:transition-none"
      />
    </svg>
  );
}

/**
 * Megabyte mit höchstens einer Nachkommastelle (mindestens 0,1) in der Schreibweise der Oberfläche – wie
 * `Intl.NumberFormat(…, { maximumFractionDigits: 1 })`, unter 1000 MB aber ohne Intl (Stufe C N8: das erste Intl-Objekt
 * einer Seite kostet ≈ 20 ms, jede Station zeigt ihre Größe). Komma de/tr „,“, ar östlich U+066B (arabisches Dezimalkomma), westlich „.“.
 */
export function megabyte(bytes: number, ui: Oberflaeche, ziffern: Ziffern): string {
  const zehntel = Math.round(Math.max(0.1, bytes / 1e6) * 10);
  const loc = intlSprache(ui, ziffern);
  if (zehntel >= 1e4) return new Intl.NumberFormat(loc, { maximumFractionDigits: 1 }).format(zehntel / 10);
  const komma = ui !== 'ar' ? ',' : ziffern === 'westlich' ? '.' : '\u066B';
  return ziffernVon(zehntel % 10 ? `${Math.floor(zehntel / 10)}${komma}${zehntel % 10}` : String(zehntel / 10), loc);
}

/** Größe einer Einheit samt Tönen (Ring nach Bytes, ADR 0039 Fortschreibung Nr. 8). */
export const einheitBytes = (e: Pick<VerzeichnisEinheit, 'bytes' | 'audio'>): number => e.bytes + e.audio.reduce((s, a) => s + a.bytes, 0);

/** Bewusst offline gespeichert: Eintrag im Speicher `pakete` mit `offline` und dem Hash des Verzeichnisses. */
export const istOfflineGespeichert = (e: Pick<VerzeichnisEinheit, 'schluessel' | 'hash'>, offline: ReadonlyMap<string, PaketEintrag>) => {
  const x = offline.get(e.schluessel);
  return Boolean(x?.offline && x.hash === e.hash);
};

const KNOPF =
  'inline-flex min-h-12 druck items-center gap-2 rounded-pill border border-rand bg-weiss px-4 text-16 font-bold text-tinte hover:border-gruen-700';

/**
 * Fokus nicht verlieren (WCAG 2.4.3): Während des Speichern verschwindet der Knopf; danach kommt der Fokus auf den Rahmen
 * zurück, wenn er vorher in diesem Teil lag.
 */
function useFokusRahmen(laeuft: boolean) {
  const rahmen = useRef<HTMLDivElement>(null);
  const zurueck = useRef(false);
  useEffect(() => {
    if (laeuft || !zurueck.current) return;
    zurueck.current = false;
    rahmen.current?.focus();
  }, [laeuft]);
  const merke = () => {
    zurueck.current = Boolean(rahmen.current?.contains(document.activeElement));
  };
  return { rahmen, merke };
}

/**
 * „Einheit offline speichern“ (ADR 0039 Nr. 12, ADR 0038 Nr. 9): Paket und Töne in den Vorrat, als bewusst gespeichert
 * markiert; erst hier bittet die App um dauerhaften Speicher (`navigator.storage.persist()`). Danach die Seiten des Kurses
 * samt Programmteilen für den Start ohne Netz (`seitenVorhalten`, Kursvorrat des Service Workers). „Offline gespeichert“
 * steht erst, wenn auch die Seiten im Vorrat dieses Baus vollständig sind (Stufe C N9a, G-1); sonst „wird aktualisiert“ bzw.
 * „Erneut speichern“. Fortschritt als Ring nach Bytes, Ergebnis in einer Live-Region.
 */
export function OfflineEinheit({
  ui,
  ziffern,
  kurs,
  einheit,
  gespeichert,
  seiten,
  seitenVorhalten,
  onGespeichert,
  texte,
}: {
  ui: Oberflaeche;
  ziffern: Ziffern;
  kurs: KursSlug;
  einheit: VerzeichnisEinheit;
  /** schon bewusst offline gespeichert (Speicher `pakete`, gleicher Hash) */
  gespeichert: boolean;
  /** Stand der Kursseiten (für alle Einheiten des Kurses gemeinsam) */
  seiten: SeitenZustand;
  /** Seiten des Kurses in den Kursvorrat holen; `true`, wenn alles da ist */
  seitenVorhalten: () => Promise<boolean>;
  /**
   * Nach dem Speichern: die Seite aktualisiert nur, was sich geändert hat (Lernpfad: diese Station, Stufe C N8). Ohne ihn
   * meldet die Einheit `STAND_GEAENDERT` an alle Inseln der Seite.
   */
  onGespeichert?: () => Promise<void>;
  texte: OfflineTexte;
}) {
  const [laeuft, setLaeuft] = useState<{ geladen: number; gesamt: number } | null>(null);
  const [meldung, setMeldung] = useState('');
  // hier gespeichert, bevor der Lernpfad den Speicher neu gelesen hat
  const [hier, setHier] = useState(false);
  const { rahmen, merke } = useFokusRahmen(Boolean(laeuft));
  const moeglich = typeof caches !== 'undefined';
  const mb = (bytes: number) => megabyte(bytes, ui, ziffern);
  const f = (vorlage: string, bytes: number) => formatiere(vorlage, { mb: mb(bytes) }, ui, ziffern);
  const gesamt = einheitBytes(einheit);
  const fertig = gespeichert || hier;

  async function speichern() {
    merke();
    setMeldung('');
    setLaeuft({ geladen: 0, gesamt });
    try {
      const sp = await speicher();
      const e = await speichereOffline(sp, kurs, [einheit], { fortschritt: (geladen, alle) => setLaeuft({ geladen, gesamt: alle }) });
      if (e.fehlgeschlagen.length) setMeldung(texte.offlineFehler);
      else {
        setHier(true);
        setMeldung((await seitenVorhalten()) ? f(texte.offlineFertig, e.bytes) : texte.offlineUnvollstaendig);
      }
      if (onGespeichert) void onGespeichert().catch(() => undefined);
      else meldeStand();
    } catch {
      setMeldung(texte.offlineFehler);
    } finally {
      setLaeuft(null);
    }
  }

  if (!moeglich) return <p className="text-16 text-tinte-2">{texte.offlineNichtMoeglich}</p>;
  return (
    <div ref={rahmen} tabIndex={-1} className="flex flex-col gap-2">
      {laeuft ? (
        <div className="flex flex-wrap items-center gap-3">
          <Ring anteil={laeuft.gesamt ? Math.min(1, laeuft.geladen / laeuft.gesamt) : 0} beschriftung={texte.offlineFortschritt} />
          <span className="tabular-nums">{f(texte.offlineLaeuft, laeuft.geladen)}</span>
        </div>
      ) : fertig && seiten === 'vollstaendig' ? (
        <p className="flex items-center gap-2 text-16 font-bold text-gruen-800">
          <CircleCheck aria-hidden className="size-6 shrink-0" />
          {f(texte.offlineFertig, gesamt)}
        </p>
      ) : fertig && seiten === 'aktualisiert' ? (
        <p className="flex items-center gap-2 text-16 text-tinte-2">
          <RefreshCw aria-hidden className="size-5 shrink-0 text-gruen-700" />
          {texte.offlineAktualisieren}
        </p>
      ) : (
        <div className="flex flex-col items-start gap-2">
          <p className="text-16 text-tinte-2">{fertig ? texte.offlineUnvollstaendig : f(texte.offlineText, gesamt)}</p>
          <button type="button" onClick={() => void speichern()} className={KNOPF}>
            <Download aria-hidden className="size-5" />
            {fertig ? texte.offlineErneut : texte.offline}
          </button>
        </div>
      )}
      <p role="status" className="sr-only">
        {meldung}
      </p>
      {meldung && !fertig ? <p className="text-16 text-tinte-2">{meldung}</p> : null}
    </div>
  );
}

/**
 * „Stufe offline speichern“ (ADR 0039 Nr. 12, PLAN §3.5, ABNAHME Z-L04): alle Einheiten einer Stufe samt Tönen, die noch nicht
 * gespeichert sind – der Speicherbedarf steht vorher da (jedes Bündel einmal, `offlineBedarf`). Ring nach echten Bytes (B-27),
 * abbrechbar (Gespeichertes bleibt), dauerhafter Speicher erst hier (`speichereOffline`), danach die Seiten des Kurses.
 * In Häppchen wie „Einheit offline speichern“ (Stufe C N8, INP): `speichereOffline` gibt vor jedem Paket und Bündel nach.
 * Ergebnis in einer Live-Region; der Fokus springt beim Start auf „abbrechen“ und danach auf den Rahmen der Stufe.
 */
export function OfflineStufe({
  ui,
  ziffern,
  kurs,
  stufe,
  einheiten,
  offline,
  seiten,
  seitenVorhalten,
  seitenPruefen,
  onGespeichert,
  texte,
}: {
  ui: Oberflaeche;
  ziffern: Ziffern;
  kurs: KursSlug;
  /** Name der Stufe in der Oberflächensprache („A1“, „Grundstufe“) */
  stufe: string;
  einheiten: readonly VerzeichnisEinheit[];
  offline: ReadonlyMap<string, PaketEintrag>;
  seiten: SeitenZustand;
  seitenVorhalten: () => Promise<boolean>;
  /** nach einem Abbruch: Stand der Kursseiten ohne Netz neu lesen (gespeicherte Einheiten brauchen sie) */
  seitenPruefen: () => Promise<void>;
  /** nach dem Speichern: Speicher `pakete` (und Köpfe der Stationen) neu lesen */
  onGespeichert: () => Promise<void>;
  texte: StufeOfflineTexte;
}) {
  const [laeuft, setLaeuft] = useState<{ geladen: number; gesamt: number } | null>(null);
  const [meldung, setMeldung] = useState('');
  const abbruch = useRef<AbortController | null>(null);
  const abbrechenKnopf = useRef<HTMLButtonElement>(null);
  const { rahmen, merke } = useFokusRahmen(Boolean(laeuft));
  const gestartet = useRef(false);
  useEffect(() => () => abbruch.current?.abort(), []);
  useEffect(() => {
    if (!laeuft || !gestartet.current) return;
    gestartet.current = false;
    abbrechenKnopf.current?.focus();
  }, [laeuft]);

  if (typeof caches === 'undefined' || !einheiten.length) return null;
  const mb = (bytes: number) => megabyte(bytes, ui, ziffern);
  const f = (vorlage: string, werte: Record<string, string | number>) => formatiere(vorlage, werte, ui, ziffern);
  const fehlend = einheiten.filter((e) => !istOfflineGespeichert(e, offline));
  const alle = offlineBedarf(einheiten);

  async function speichern() {
    const ziel = fehlend.length ? fehlend : einheiten;
    const steuerung = new AbortController();
    abbruch.current = steuerung;
    gestartet.current = true;
    merke();
    setMeldung('');
    setLaeuft({ geladen: 0, gesamt: offlineBedarf(ziel) });
    try {
      const sp = await speicher();
      const e = await speichereOffline(sp, kurs, ziel, {
        signal: steuerung.signal,
        fortschritt: (geladen, gesamt) => setLaeuft({ geladen, gesamt }),
      });
      if (e.abgebrochen) {
        setMeldung(texte.stufeOfflineAbgebrochen);
        await seitenPruefen();
      } else if (e.fehlgeschlagen.length) {
        if (e.einheiten) await seitenVorhalten();
        setMeldung(texte.offlineFehler);
      } else setMeldung((await seitenVorhalten()) ? f(texte.stufeOfflineFertig, { stufe, mb: mb(alle) }) : texte.offlineUnvollstaendig);
      await onGespeichert();
    } catch {
      setMeldung(texte.offlineFehler);
    } finally {
      abbruch.current = null;
      setLaeuft(null);
    }
  }

  return (
    <div ref={rahmen} tabIndex={-1} data-stufe-offline className="flex flex-col gap-2">
      {laeuft ? (
        <div className="flex flex-wrap items-center gap-3">
          <Ring
            anteil={laeuft.gesamt ? Math.min(1, laeuft.geladen / laeuft.gesamt) : 0}
            beschriftung={f(texte.stufeOfflineFortschritt, { stufe })}
          />
          <span className="tabular-nums">{f(texte.stufeOfflineLaeuft, { mb: mb(laeuft.geladen), gesamt: mb(laeuft.gesamt) })}</span>
          <button ref={abbrechenKnopf} type="button" onClick={() => abbruch.current?.abort()} className={KNOPF}>
            <X aria-hidden className="size-5" />
            {texte.stufeOfflineAbbrechen}
          </button>
        </div>
      ) : !fehlend.length && seiten === 'vollstaendig' ? (
        <p className="flex items-center gap-2 text-16 font-bold text-gruen-800">
          <CircleCheck aria-hidden className="size-6 shrink-0" />
          {f(texte.stufeOfflineFertig, { stufe, mb: mb(alle) })}
        </p>
      ) : !fehlend.length && seiten === 'aktualisiert' ? (
        <p className="flex items-center gap-2 text-16 text-tinte-2">
          <RefreshCw aria-hidden className="size-5 shrink-0 text-gruen-700" />
          {texte.offlineAktualisieren}
        </p>
      ) : (
        <div className="flex flex-col items-start gap-2">
          <p className="text-16 text-tinte-2">
            {!fehlend.length
              ? texte.offlineUnvollstaendig
              : fehlend.length === einheiten.length
                ? f(texte.stufeOfflineText, { anzahl: einheiten.length, mb: mb(alle) })
                : f(texte.stufeOfflineRest, { anzahl: fehlend.length, mb: mb(offlineBedarf(fehlend)) })}
          </p>
          <button type="button" onClick={() => void speichern()} className={KNOPF}>
            <Download aria-hidden className="size-5" />
            {f(texte.stufeOffline, { stufe })}
          </button>
        </div>
      )}
      <p role="status" className="sr-only">
        {meldung}
      </p>
    </div>
  );
}
