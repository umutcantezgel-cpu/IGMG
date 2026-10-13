'use client';

import { Pause, Play, SkipBack, SkipForward, X } from 'lucide-react';
import { useEffect, useEffectEvent, useId, useRef, useState } from 'react';
import type { ZeitenDaten } from '@/server/queries/quran';
import { ladeZeitenJson } from './daten';
import { adresse, fuelle, type LeserRezitation, type LeserTexte } from './leser-typen';

type Stelle = { sure: number; vers: number; li: HTMLElement };
const WIEDERHOLUNG = [1, 3, 5, 0] as const; // 0 = endlos
const TEMPO = [0.75, 1, 1.25] as const;

/** Verse des Lesers in Lesereihenfolge (Sure oder Cüz über Surengrenzen). */
function stellenIn(c: HTMLElement): Stelle[] {
  return [...c.querySelectorAll<HTMLElement>('ol[data-sure] > li[data-v]')].map((li) => ({
    sure: Number(li.closest<HTMLElement>('[data-sure]')?.dataset.sure),
    vers: Number(li.dataset.v),
    li,
  }));
}

/** Wort hervorheben (B-13): CSS Custom Highlight API, sonst Klasse am Wort. */
function markiereWort(el: HTMLElement | null) {
  const hl = typeof CSS !== 'undefined' && 'highlights' in CSS ? CSS.highlights : null;
  for (const alt of document.querySelectorAll('.wort-aktiv')) alt.classList.remove('wort-aktiv');
  if (!el) {
    hl?.delete('quran-wort');
    return;
  }
  if (hl) {
    const r = document.createRange();
    r.selectNodeContents(el);
    hl.set('quran-wort', new Highlight(r));
  } else el.classList.add('wort-aktiv');
}

/**
 * Player des Koran-Lesers (O-Q01, ADR 0029): spielt jede aktive Rezitation – eine Datei je Sure mit Verszeiten oder
 * eine Datei je Vers. Vers wiederholen (1, 3, 5, endlos), Tempo, Rezitation wählen, „Mitlesen folgen“ (Scrollen nur
 * mit Schalter und nie gegen den Nutzer), Media Session, nächster Vers vorab geladen. Vers getönt, Wort über die CSS
 * Custom Highlight API (B-13). Beginnt beim ersten sichtbaren Vers. Nur im Browser (lazy nach „Abspielen“).
 */
export default function Player({
  rezitationen,
  texte,
  pfadZeiten,
  behaelter,
  onSchliessen,
}: {
  rezitationen: LeserRezitation[];
  texte: LeserTexte;
  pfadZeiten: string;
  behaelter: HTMLElement;
  onSchliessen: () => void;
}) {
  const p = texte.player;
  const audio = useRef<HTMLAudioElement>(null);
  const vorab = useRef<HTMLAudioElement | null>(null);
  const zeiten = useRef(new Map<string, ZeitenDaten | null>());
  const nutzerScroll = useRef(0);
  const zaehler = useRef(1);
  const ende = useRef<number | null>(null);
  const [stellen] = useState(() => stellenIn(behaelter));
  const [index, setIndex] = useState(() =>
    Math.max(
      stellen.findIndex((s) => s.li.getBoundingClientRect().bottom > 120),
      0,
    ),
  );
  const [laeuft, setLaeuft] = useState(false);
  const [rezitation, setRezitation] = useState(rezitationen[0]?.id ?? '');
  const [wiederholung, setWiederholung] = useState<number>(1);
  const [tempo, setTempo] = useState(1);
  const [folgen, setFolgen] = useState(false);
  const [meldung, setMeldung] = useState('');
  const id = useId();
  const aktuell = rezitationen.find((r) => r.id === rezitation) ?? rezitationen[0];

  const zeitenFuer = async (sure: number, rez: string): Promise<ZeitenDaten | null> => {
    const k = `${rez}:${sure}`;
    if (!zeiten.current.has(k)) {
      try {
        zeiten.current.set(k, await ladeZeitenJson(adresse(pfadZeiten, { s: sure, r: rez })));
      } catch {
        zeiten.current.set(k, null);
      }
    }
    return zeiten.current.get(k) ?? null;
  };

  /** Datei und Zeitfenster eines Verses. */
  const quelle = async (s: Stelle, rez: string) => {
    const z = await zeitenFuer(s.sure, rez);
    if (!z) return null;
    const eigen = z.audio.find((a) => a.vers === s.vers);
    const datei = eigen ?? z.audio.find((a) => a.vers === 0);
    if (!datei) return null;
    const fenster = eigen ? null : z.verse.find((v) => v[0] === s.vers);
    return { pfad: datei.pfad, start: fenster ? fenster[1] / 1000 : 0, ende: fenster ? fenster[2] / 1000 : null };
  };

  const spiele = async (i: number, rez = rezitation) => {
    const a = audio.current;
    const s = stellen[i];
    if (!a || !s) return;
    const q = await quelle(s, rez);
    if (!q) {
      setMeldung(p.keineAufnahme);
      return;
    }
    setMeldung('');
    for (const st of stellen) st.li.removeAttribute('data-aktiv');
    s.li.setAttribute('data-aktiv', '');
    if (!a.src.endsWith(q.pfad)) a.src = q.pfad;
    a.currentTime = q.start;
    a.playbackRate = tempo;
    ende.current = q.ende;
    try {
      await a.play();
    } catch {
      setMeldung(p.fehler);
      return;
    }
    if (folgen && Date.now() - nutzerScroll.current > 2500) {
      const ruhig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      s.li.scrollIntoView({ block: 'center', behavior: ruhig ? 'auto' : 'smooth' });
    }
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: fuelle(p.stelle, { sure: s.sure, vers: s.vers }),
        artist: aktuell?.rezitator ?? '',
        album: aktuell?.name ?? '',
      });
    }
    // Nächsten Vers vorab laden (Dateien je Vers)
    const naechste = stellen[i + 1];
    if (naechste) {
      void quelle(naechste, rez).then((n) => {
        if (n && n.pfad !== q.pfad) {
          vorab.current ??= new Audio();
          vorab.current.preload = 'auto';
          vorab.current.src = n.pfad;
        }
      });
    }
  };

  const springe = (i: number) => {
    if (i < 0 || i >= stellen.length) return;
    zaehler.current = 1;
    setIndex(i);
    void spiele(i);
  };

  // Ende eines Verses: wiederholen oder weiter
  const versEnde = useEffectEvent(() => {
    if (wiederholung === 0 || zaehler.current < wiederholung) {
      zaehler.current++;
      void spiele(index);
    } else if (index + 1 < stellen.length) springe(index + 1);
    else markiereWort(null);
  });

  // Takt: Versende bei Dateien je Sure, Wort im Takt hervorheben
  const takt = useEffectEvent(() => {
    const a = audio.current;
    const s = stellen[index];
    if (!a || !s) return;
    if (ende.current !== null && a.currentTime >= ende.current) {
      a.pause();
      versEnde();
      return;
    }
    const ms = a.currentTime * 1000;
    const w = zeiten.current.get(`${rezitation}:${s.sure}`)?.woerter.find((x) => x[0] === s.vers && x[2] <= ms && ms < x[3]);
    markiereWort(w ? s.li.querySelector<HTMLElement>(`.vers-ar [data-w="${w[1]}"]`) : null);
  });

  const starte = useEffectEvent(() => void spiele(index));
  const tasten = useEffectEvent((richtung: -1 | 1) => springe(index + richtung));

  useEffect(() => {
    const a = audio.current;
    if (!a) return;
    const an = () => setLaeuft(true);
    const aus = () => setLaeuft(false);
    const fertig = () => versEnde();
    const zeit = () => takt();
    a.addEventListener('play', an);
    a.addEventListener('pause', aus);
    a.addEventListener('ended', fertig);
    a.addEventListener('timeupdate', zeit);
    const merke = () => {
      nutzerScroll.current = Date.now();
    };
    window.addEventListener('wheel', merke, { passive: true });
    window.addEventListener('touchmove', merke, { passive: true });
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => void a.play());
      navigator.mediaSession.setActionHandler('pause', () => a.pause());
      navigator.mediaSession.setActionHandler('previoustrack', () => tasten(-1));
      navigator.mediaSession.setActionHandler('nexttrack', () => tasten(1));
    }
    return () => {
      a.removeEventListener('play', an);
      a.removeEventListener('pause', aus);
      a.removeEventListener('ended', fertig);
      a.removeEventListener('timeupdate', zeit);
      window.removeEventListener('wheel', merke);
      window.removeEventListener('touchmove', merke);
      a.pause();
      markiereWort(null);
      for (const s of stellen) s.li.removeAttribute('data-aktiv');
      if ('mediaSession' in navigator) {
        for (const art of ['play', 'pause', 'previoustrack', 'nexttrack'] as const) navigator.mediaSession.setActionHandler(art, null);
      }
    };
  }, [stellen]);

  // Beim Öffnen spielen (der Klick auf „Abspielen“ hat den Player geladen)
  useEffect(() => {
    queueMicrotask(() => starte());
  }, []);

  useEffect(() => {
    if (audio.current) audio.current.playbackRate = tempo;
  }, [tempo]);

  const s = stellen[index];
  const knopf = 'inline-flex size-12 items-center justify-center rounded-pill text-tinte hover:bg-sand';
  const feld = 'min-h-12 rounded-md border border-rand bg-weiss px-2 text-16';

  return (
    <section aria-label={p.titel} className="player">
      <audio ref={audio} preload="auto" />
      <div className="mx-auto flex max-w-(--container-lesen) flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 md:px-8">
        <div className="flex items-center gap-1">
          <button type="button" aria-label={p.vorher} onClick={() => springe(index - 1)} className={knopf}>
            <SkipBack aria-hidden className="size-5" />
          </button>
          <button
            type="button"
            aria-label={laeuft ? p.pause : p.abspielen}
            onClick={() => (laeuft ? audio.current?.pause() : void spiele(index))}
            className="inline-flex size-12 items-center justify-center rounded-pill bg-gruen-700 text-weiss hover:bg-gruen-800"
          >
            {laeuft ? <Pause aria-hidden className="size-5" /> : <Play aria-hidden className="size-5" />}
          </button>
          <button type="button" aria-label={p.weiter} onClick={() => springe(index + 1)} className={knopf}>
            <SkipForward aria-hidden className="size-5" />
          </button>
        </div>
        <p className="min-w-0 flex-1 text-16">
          <span className="font-bold">{s ? fuelle(p.stelle, { sure: s.sure, vers: s.vers }) : p.laden}</span>
          {aktuell ? <span className="block truncate text-tinte-2">{fuelle(p.quelle, { rezitator: aktuell.rezitator, lizenz: aktuell.lizenz })}</span> : null}
        </p>
        <label className="flex items-center gap-2 text-16">
          <span>{p.wiederholen}</span>
          <select value={wiederholung} onChange={(e) => setWiederholung(Number(e.target.value))} className={feld}>
            {WIEDERHOLUNG.map((n) => (
              <option key={n} value={n}>
                {n === 0 ? p.endlos : fuelle(p.mal, { anzahl: n })}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-16">
          <span>{p.tempo}</span>
          <select value={tempo} onChange={(e) => setTempo(Number(e.target.value))} className={feld}>
            {TEMPO.map((n) => (
              <option key={n} value={n}>
                {`${n.toLocaleString()}×`}
              </option>
            ))}
          </select>
        </label>
        {rezitationen.length > 1 ? (
          <label className="flex items-center gap-2 text-16">
            <span>{p.rezitation}</span>
            <select
              value={rezitation}
              onChange={(e) => {
                setRezitation(e.target.value);
                void spiele(index, e.target.value);
              }}
              className={feld}
            >
              {rezitationen.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <label htmlFor={`${id}-folgen`} className="flex min-h-12 cursor-pointer items-center gap-2 text-16">
          <input id={`${id}-folgen`} type="checkbox" checked={folgen} onChange={(e) => setFolgen(e.target.checked)} className="size-5 accent-gruen-700" />
          {p.folgen}
        </label>
        <button type="button" aria-label={p.schliessen} onClick={onSchliessen} className={knopf}>
          <X aria-hidden className="size-5" />
        </button>
        <p role="status" className="basis-full text-16 text-tinte-2 empty:hidden">
          {meldung}
        </p>
      </div>
    </section>
  );
}
