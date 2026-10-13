'use client';

import { Minus, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { Button } from '@/components/ui/button';
import {
  formatZeit,
  MIN_VERS_MS,
  SCHRITT_GROSS_MS,
  SCHRITT_MS,
  spalten,
  verschiebeGrenze,
  zeitRaster,
  zeitVorlesen,
} from '@/lib/audio/werkstatt';
import type { Analyse } from './werkstatt-audio';

const ZOOM = [1, 2, 4, 8, 16, 32, 64] as const;

/**
 * Wellenform der Sure-Datei (Canvas, nur der sichtbare Ausschnitt) mit Versgrenzen als Schieberegler: Ziehen mit Maus
 * oder Finger, Tastatur ±50 ms (Umschalt/Bild ±500 ms). Zoom über Knöpfe, seitlich scrollen mit Pfeiltasten im
 * Bereich, Abspielposition über einen eigenen Regler. Farben aus den Tokens (CSS-Variablen am Element).
 */
export function Wellenform({
  analyse,
  punkte,
  onPunkte,
  positionMs,
  onSuche,
  aktiverVers,
  folgen,
}: {
  analyse: Analyse;
  punkte: number[] | null;
  onPunkte?: (punkte: number[]) => void;
  positionMs: number;
  onSuche: (ms: number) => void;
  aktiverVers: number | null;
  folgen: boolean;
}) {
  const t = useTranslations('verwaltung.rezitationen.werkstatt.wellenform');
  const dauer = Math.max(1, analyse.dauerMs);
  const leinwand = useRef<HTMLCanvasElement>(null);
  const bereich = useRef<HTMLDivElement>(null);
  const flaeche = useRef<HTMLDivElement>(null);
  const zieht = useRef<number | null>(null);
  const [zoom, setZoom] = useState<(typeof ZOOM)[number]>(1);
  const [ausschnitt, setAusschnitt] = useState({ von: 0, bis: dauer, breite: 0 });
  const mitte = useRef(dauer / 2);

  const messe = useCallback(() => {
    const b = bereich.current;
    if (!b || !b.scrollWidth) return;
    const von = (b.scrollLeft / b.scrollWidth) * dauer;
    const bis = ((b.scrollLeft + b.clientWidth) / b.scrollWidth) * dauer;
    mitte.current = (von + bis) / 2;
    setAusschnitt((alt) =>
      alt.von === von && alt.bis === bis && alt.breite === b.clientWidth ? alt : { von, bis, breite: b.clientWidth },
    );
  }, [dauer]);

  // Zoom um die Mitte des Ausschnitts
  useLayoutEffect(() => {
    const b = bereich.current;
    if (!b) return;
    b.scrollLeft = (mitte.current / dauer) * b.scrollWidth - b.clientWidth / 2;
    messe();
  }, [zoom, dauer, messe]);

  useEffect(() => {
    const b = bereich.current;
    if (!b) return;
    let bild = 0;
    const beiScroll = () => {
      cancelAnimationFrame(bild);
      bild = requestAnimationFrame(messe);
    };
    b.addEventListener('scroll', beiScroll, { passive: true });
    const beobachter = new ResizeObserver(beiScroll);
    beobachter.observe(b);
    return () => {
      cancelAnimationFrame(bild);
      b.removeEventListener('scroll', beiScroll);
      beobachter.disconnect();
    };
  }, [messe]);

  // Beim Abspielen mitlaufen, wenn die Position den Ausschnitt verlässt
  useEffect(() => {
    const b = bereich.current;
    if (!folgen || !b || zoom === 1) return;
    if (positionMs < ausschnitt.von || positionMs > ausschnitt.bis)
      b.scrollLeft = (positionMs / dauer) * b.scrollWidth - b.clientWidth * 0.1;
  }, [folgen, positionMs, ausschnitt, dauer, zoom]);

  // Zeichnen: Versbänder, Mittellinie, Spitzen
  const skala = useMemo(() => {
    let m = 0;
    for (let i = 0; i < analyse.spitzen.max.length; i++) m = Math.max(m, analyse.spitzen.max[i], -analyse.spitzen.min[i]);
    return m > 0 ? 0.92 / m : 1;
  }, [analyse]);
  useEffect(() => {
    const c = leinwand.current;
    const g = c?.getContext('2d');
    if (!c || !g || !ausschnitt.breite) return;
    const dpr = window.devicePixelRatio || 1;
    const breite = ausschnitt.breite;
    const hoehe = c.clientHeight;
    c.width = Math.round(breite * dpr);
    c.height = Math.round(hoehe * dpr);
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const farbe = (name: string) => getComputedStyle(c).getPropertyValue(name).trim();
    const { von, bis } = ausschnitt;
    const x = (ms: number) => ((ms - von) / (bis - von)) * breite;
    g.clearRect(0, 0, breite, hoehe);
    if (punkte) {
      for (let i = 0; i < punkte.length - 1; i++) {
        const a = x(punkte[i]);
        const b = x(punkte[i + 1]);
        if (b < 0 || a > breite) continue;
        g.fillStyle = farbe(i + 1 === aktiverVers ? '--color-gruen-100' : i % 2 ? '--color-papier' : '--color-sand');
        g.fillRect(a, 0, b - a, hoehe);
      }
    }
    const mitteY = hoehe / 2;
    g.fillStyle = farbe('--color-linie');
    g.fillRect(0, mitteY, breite, 1);
    const sp = spalten(analyse.spitzen, von, bis, Math.floor(breite));
    g.fillStyle = farbe('--color-gruen-800');
    for (let s = 0; s < sp.max.length; s++) {
      const oben = mitteY - sp.max[s] * skala * mitteY;
      const unten = mitteY - sp.min[s] * skala * mitteY;
      g.fillRect(s, oben, 1, Math.max(1, unten - oben));
    }
  }, [analyse, ausschnitt, punkte, aktiverVers, skala]);

  const msAus = (clientX: number) => {
    const f = flaeche.current?.getBoundingClientRect();
    if (!f || !f.width) return 0;
    return Math.min(dauer, Math.max(0, ((clientX - f.left) / f.width) * dauer));
  };

  const verschiebe = (index: number, ziel: number) => {
    if (!punkte || !onPunkte) return;
    onPunkte(verschiebeGrenze(punkte, index, ziel, { maxMs: dauer, abstandMs: MIN_VERS_MS }));
  };

  const taste = (index: number) => (e: KeyboardEvent<HTMLDivElement>) => {
    if (!punkte) return;
    const schritt = e.shiftKey || e.key === 'PageUp' || e.key === 'PageDown' ? SCHRITT_GROSS_MS : SCHRITT_MS;
    const richtung =
      e.key === 'ArrowLeft' || e.key === 'ArrowDown' || e.key === 'PageDown'
        ? -1
        : e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'PageUp'
          ? 1
          : 0;
    if (!richtung) return;
    e.preventDefault();
    verschiebe(index, punkte[index] + richtung * schritt);
  };

  const greife = (index: number) => (e: PointerEvent<HTMLDivElement>) => {
    if (!onPunkte) return;
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.focus();
    zieht.current = index;
  };
  const ziehe = (e: PointerEvent<HTMLDivElement>) => {
    if (zieht.current === null) return;
    verschiebe(zieht.current, msAus(e.clientX));
  };
  const lasse = () => {
    zieht.current = null;
  };

  const name = (i: number, n: number) => (i === 0 ? t('anfang') : i === n ? t('ende', { nr: n }) : t('grenze', { vor: i, nach: i + 1 }));
  const raster = zeitRaster(ausschnitt.von, ausschnitt.bis, Math.max(1, ausschnitt.breite));
  const prozent = (ms: number) => `${(ms / dauer) * 100}%`;
  const imAusschnitt = (ms: number) => `${((ms - ausschnitt.von) / Math.max(1, ausschnitt.bis - ausschnitt.von)) * 100}%`;
  const stufe = ZOOM.indexOf(zoom);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="icon" onClick={() => setZoom(ZOOM[Math.max(0, stufe - 1)])} disabled={stufe === 0}>
          <Minus aria-hidden />
          <span className="sr-only">{t('kleiner')}</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setZoom(ZOOM[Math.min(ZOOM.length - 1, stufe + 1)])}
          disabled={stufe === ZOOM.length - 1}
        >
          <Plus aria-hidden />
          <span className="sr-only">{t('groesser')}</span>
        </Button>
        <span className="text-16 text-tinte-2 tabular-nums" aria-live="polite">
          {t('zoom', { faktor: zoom })}
        </span>
      </div>
      <div className="relative h-48 overflow-hidden rounded-md border border-rand bg-weiss">
        <canvas ref={leinwand} aria-hidden className="pointer-events-none absolute inset-0 size-full" />
        <div
          ref={bereich}
          role="region"
          aria-label={t('bereich')}
          tabIndex={0}
          className="absolute inset-0 overflow-x-auto overflow-y-hidden"
        >
          <div
            ref={flaeche}
            className="relative h-full cursor-text"
            style={{ width: `${zoom * 100}%` }}
            onPointerDown={(e) => {
              if (e.target === e.currentTarget) onSuche(msAus(e.clientX));
            }}
          >
            {punkte?.slice(0, -1).map((p, i) => (
              <span
                key={`v${i + 1}`}
                aria-hidden
                className="pointer-events-none absolute top-1 -translate-x-1/2 rounded-sm bg-weiss px-1 text-16 font-bold text-gruen-800"
                style={{ left: prozent((p + punkte[i + 1]) / 2) }}
              >
                {i + 1}
              </span>
            ))}
            <div aria-hidden className="pointer-events-none absolute inset-y-0 w-0.5 bg-tinte" style={{ left: prozent(positionMs) }} />
            {punkte?.map((p, i) => (
              <div
                key={`g${i}`}
                role="slider"
                tabIndex={onPunkte ? 0 : -1}
                aria-label={name(i, punkte.length - 1)}
                aria-valuemin={i === 0 ? 0 : punkte[i - 1]}
                aria-valuemax={i === punkte.length - 1 ? dauer : punkte[i + 1]}
                aria-valuenow={p}
                aria-valuetext={zeitVorlesen(p)}
                aria-readonly={onPunkte ? undefined : true}
                onKeyDown={taste(i)}
                onPointerDown={greife(i)}
                onPointerMove={ziehe}
                onPointerUp={lasse}
                onPointerCancel={lasse}
                className="group absolute inset-y-0 flex w-12 -translate-x-1/2 cursor-ew-resize touch-none justify-center rounded-sm focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-gruen-950"
                style={{ left: prozent(p) }}
              >
                <span aria-hidden className="h-full w-0.5 bg-gruen-950" />
                <span
                  aria-hidden
                  className="absolute bottom-1 size-6 rounded-sm border-2 border-weiss bg-gruen-950 group-hover:bg-gruen-800 group-focus-visible:bg-gruen-700"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div aria-hidden className="relative h-6 overflow-hidden text-16 text-tinte-2 tabular-nums">
        {raster.striche.map((ms) => (
          <span key={ms} className="absolute top-0 -translate-x-1/2 border-l border-linie ps-1" style={{ left: imAusschnitt(ms) }}>
            {formatZeit(ms, raster.schrittMs < 1000 ? 1 : 0)}
          </span>
        ))}
      </div>
      <label className="flex flex-col gap-1.5 font-bold">
        <span>
          {t('position')}: <span className="font-normal tabular-nums">{formatZeit(positionMs)}</span>
        </span>
        <input
          type="range"
          min={0}
          max={dauer}
          step={SCHRITT_MS}
          value={Math.min(dauer, Math.round(positionMs))}
          aria-valuetext={zeitVorlesen(positionMs)}
          onChange={(e) => onSuche(Number(e.target.value))}
          className="min-h-12 w-full accent-gruen-700"
        />
      </label>
    </div>
  );
}
