'use client';

import { Bookmark, ChevronRight, X } from 'lucide-react';
import { useEffect, useEffectEvent, useId, useLayoutEffect, useRef, useState } from 'react';
import type { WortDaten } from '@/server/queries/quran';
import { ladeWoerter } from './daten';
import { adresse, fuelle, type LeserTexte } from './leser-typen';
import type { WortZiel } from './QuranLeser';

/** Farbfeld einer Tajwid-Familie: vier geschützte Leerzeichen, die Familienklasse zeichnet Farbe und Muster. */
const FARBFELD = '\u00a0'.repeat(4);

/** Regeln, deren Segmente das Wort berühren, in der Reihenfolge ihres ersten Auftretens. */
export function regelnImWort(daten: WortDaten, vers: number, pos: number): string[] {
  const v = daten.verse[vers];
  const w = v?.w[pos - 1];
  if (!v || !w) return [];
  const [, versatz, laenge] = w;
  const regeln: string[] = [];
  for (const [start, ende, regel] of v.tj) {
    if (start < versatz + laenge && ende > versatz && !regeln.includes(regel)) regeln.push(regel);
  }
  return regeln;
}

/** Abstand der Karte zum Fensterrand und zur Lesespalte (px). */
const RAND = 16;
/** Höhe der klebenden Werkzeugleiste über dem Text, die ein Wort beim Heranholen nicht verdecken soll (px). */
const LEISTE = 80;

/**
 * Karte am Wort platzieren; Ursprung der Skalierung ist das Wort (B-14).
 * - Telefon: Blatt unten (per CSS). Beim Öffnen holt die Seite das Wort über das Blatt (Sichtabnahme W-3).
 * - Breit mit freiem Rand neben der Lesespalte: Die Karte dockt rechts neben der Spalte an, mit Pfeil auf Höhe des
 *   Worts, und verdeckt keinen Text (W-4).
 * - Sonst am Wort: darunter oder darüber; passt beides nicht, rückt die Seite das Wort nach oben.
 */
function platziere(karte: HTMLElement, wort: HTMLElement, oeffnen = false) {
  if (window.matchMedia('(max-width: 47.99rem)').matches) {
    karte.style.removeProperty('top');
    karte.style.removeProperty('left');
    delete karte.dataset.andock;
    if (oeffnen) {
      // Wort zwischen Werkzeugleiste und Blatt holen (wie scrollIntoView „nearest“ mit Blatthöhe als scroll-margin-bottom;
      // Chromium wertet den Rand bei „nearest“ nicht aus). Absolutes Ziel: stimmt auch während eines laufenden Scrollens.
      const r = wort.getBoundingClientRect();
      const frei = window.innerHeight - karte.offsetHeight - RAND;
      const delta = r.bottom > frei ? r.bottom - frei : r.top < LEISTE ? r.top - LEISTE : 0;
      if (delta) {
        const ruhig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: window.scrollY + delta, behavior: ruhig ? 'instant' : 'smooth' });
      }
    }
    return;
  }
  const rand = RAND;
  const h = karte.offsetHeight;
  const b = karte.offsetWidth;
  const spalte = wort.closest('article')?.getBoundingClientRect();
  if (spalte && window.innerWidth - spalte.right - 2 * rand >= b) {
    const r = wort.getBoundingClientRect();
    const mitte = r.top + r.height / 2;
    const oben = Math.min(Math.max(mitte - 48, rand), window.innerHeight - h - rand);
    const pfeil = Math.min(Math.max(mitte - oben, 24), h - 24);
    karte.dataset.andock = 'rechts';
    karte.style.left = `${spalte.right + rand}px`;
    karte.style.top = `${oben}px`;
    karte.style.setProperty('--pfeil', `${pfeil}px`);
    karte.style.setProperty('--ursprung', `0 ${pfeil}px`);
    return;
  }
  delete karte.dataset.andock;
  let r = wort.getBoundingClientRect();
  const passtUnten = r.bottom + 8 + h <= window.innerHeight - rand;
  const passtOben = r.top - 8 - h >= rand;
  if (oeffnen && !passtUnten && !passtOben) {
    window.scrollBy({ top: r.top - 96, behavior: 'instant' });
    r = wort.getBoundingClientRect();
  }
  const unten = r.bottom + 8 + h <= window.innerHeight - rand || r.top - 8 - h < rand;
  const links = Math.min(Math.max(r.left + r.width / 2 - b / 2, rand), window.innerWidth - b - rand);
  const oben = unten ? r.bottom + 8 : r.top - 8 - h;
  karte.style.left = `${links}px`;
  karte.style.top = `${oben}px`;
  karte.style.setProperty('--ursprung', `${r.left + r.width / 2 - links}px ${unten ? 0 : h}px`);
}

/**
 * Wortkarte (O-Q01, B-14): natives Popover am Wort. Zeigt das Wort groß, die Stelle, wie oft die Wortform im Quran
 * steht, die geprüfte Bedeutung in der Seitensprache (sonst den ehrlichen Hinweis) und die Tajwid-Regeln des Worts;
 * eine Regel öffnet die Seitenleiste. Daten aus der statischen JSON-Route der Sure (lazy, einmal je Sure).
 */
export default function Wortkarte({
  ziel,
  texte,
  sprache,
  pfadWoerter,
  onSchliessen,
  onRegel,
  onLesezeichen,
}: {
  ziel: WortZiel;
  texte: LeserTexte;
  sprache: string;
  pfadWoerter: string;
  onSchliessen: () => void;
  onRegel: (schluessel: string) => void;
  onLesezeichen: () => void;
}) {
  const karte = useRef<HTMLDivElement>(null);
  const [daten, setDaten] = useState<WortDaten | 'fehler' | null>(null);
  const titelId = useId();
  const w = texte.wortkarte;

  useEffect(() => {
    let aktiv = true;
    ladeWoerter(adresse(pfadWoerter, { s: ziel.sure })).then(
      (d) => aktiv && setDaten(d),
      () => aktiv && setDaten('fehler'),
    );
    return () => {
      aktiv = false;
    };
  }, [pfadWoerter, ziel.sure]);

  const geschlossen = useEffectEvent(() => onSchliessen());
  useLayoutEffect(() => {
    const el = karte.current;
    if (!el) return;
    el.showPopover();
    platziere(el, ziel.el, true);
    el.focus();
    const zu = (e: Event) => {
      if ((e as ToggleEvent).newState === 'closed' && !el.matches(':popover-open')) geschlossen();
    };
    const neu = () => platziere(el, ziel.el);
    el.addEventListener('toggle', zu);
    window.addEventListener('scroll', neu, { passive: true });
    window.addEventListener('resize', neu);
    return () => {
      el.removeEventListener('toggle', zu);
      window.removeEventListener('scroll', neu);
      window.removeEventListener('resize', neu);
      if (el.matches(':popover-open')) el.hidePopover();
    };
  }, [ziel]);

  // Nach dem Laden ändert sich die Höhe: neu platzieren
  useLayoutEffect(() => {
    if (karte.current && daten) platziere(karte.current, ziel.el, true);
  }, [daten, ziel]);

  const form = daten && daten !== 'fehler' ? daten.verse[ziel.vers]?.w[ziel.pos - 1]?.[0] : undefined;
  const vorkommen = daten && daten !== 'fehler' && form !== undefined ? (daten.formen[form] ?? 0) : 0;
  const ort = daten && daten !== 'fehler' ? daten.orte[`${ziel.vers}:${ziel.pos}`]?.[sprache] : undefined;
  const bedeutung = daten && daten !== 'fehler' && form !== undefined ? daten.bedeutungen[form]?.[sprache] : undefined;
  const regeln =
    daten && daten !== 'fehler'
      ? regelnImWort(daten, ziel.vers, ziel.pos).flatMap((s) => daten.regeln.filter((r) => r.schluessel === s))
      : [];
  const kleinerKnopf =
    'inline-flex min-h-12 items-center gap-2 rounded-pill border border-rand bg-weiss px-4 text-16 font-bold transition duration-(--dauer-rueckmeldung) hover:border-gruen-700 hover:bg-gruen-50 active:scale-98';

  return (
    <div ref={karte} popover="auto" role="dialog" aria-labelledby={titelId} tabIndex={-1} className="wortkarte outline-none">
      <div className="wortkarte-inhalt">
        <span aria-hidden className="blatt-griff" />
        <div className="flex items-start justify-between gap-3">
          <h2 id={titelId} className="pt-2 font-text text-16 font-bold text-tinte-2">
            {fuelle(w.titel, { pos: ziel.pos, vers: ziel.vers })}
          </h2>
          <button
            type="button"
            aria-label={w.schliessen}
            onClick={() => karte.current?.hidePopover()}
            className="-mt-2 -mr-2 inline-flex size-12 shrink-0 items-center justify-center rounded-pill text-tinte-2 hover:bg-sand"
          >
            <X aria-hidden className="size-5" />
          </button>
        </div>
        {/* Das Wort mit seinen Tajwid-Abschnitten: dasselbe HTML wie im Vers (aus der eigenen Seite) */}
        <p lang="ar" dir="rtl" className="wortkarte-wort" dangerouslySetInnerHTML={{ __html: ziel.el.innerHTML }} />
        <p className="text-center text-16 text-tinte-2">{fuelle(w.stelle, { sure: ziel.sure, vers: ziel.vers, pos: ziel.pos })}</p>

        <div className="mt-4 flex flex-col gap-4 border-t border-linie pt-4">
          {daten === null ? (
            <p role="status" className="text-16 text-tinte-2">
              {w.laden}
            </p>
          ) : daten === 'fehler' ? (
            <p role="alert" className="text-16 text-fehler">
              {w.fehler}
            </p>
          ) : (
            <>
              {vorkommen > 0 ? (
                <p className="text-16">{vorkommen === 1 ? w.vorkommenEinmal : fuelle(w.vorkommen, { anzahl: vorkommen })}</p>
              ) : null}
              <section className="flex flex-col gap-1">
                <h3 className="font-text text-16 font-bold">{w.bedeutung}</h3>
                {ort || bedeutung ? (
                  <>
                    <p className="text-18">{ort ?? bedeutung?.b}</p>
                    {bedeutung?.wurzel ? (
                      <p className="text-16 text-tinte-2">
                        {w.wurzel}:{' '}
                        <span lang="ar" dir="rtl" className="font-quran">
                          {bedeutung.wurzel}
                        </span>
                      </p>
                    ) : null}
                  </>
                ) : (
                  <p className="text-16 text-tinte-2">{w.keineBedeutung}</p>
                )}
              </section>
              <section className="flex flex-col gap-2">
                <h3 className="font-text text-16 font-bold">{w.regeln}</h3>
                {regeln.length ? (
                  <ul className="flex flex-wrap gap-2">
                    {regeln.map((r) => {
                      const name = r.name[sprache as 'de'] ?? r.name.de;
                      return (
                        <li key={r.schluessel}>
                          {/* Text in Akzentgrün ohne Unterstreichung, die Familie als Farbfeld davor (Sichtabnahme W-1) */}
                          <button
                            type="button"
                            onClick={() => onRegel(r.schluessel)}
                            aria-label={fuelle(w.regelOeffnen, { name })}
                            className={`${kleinerKnopf} pr-3 text-gruen-800`}
                          >
                            <span aria-hidden className={`tj tj-${r.familie} tj-probe`}>
                              {FARBFELD}
                            </span>
                            <span lang={r.name[sprache as 'de'] ? undefined : 'de'}>{name}</span>
                            <ChevronRight aria-hidden className="size-5" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-16 text-tinte-2">{w.keineRegeln}</p>
                )}
              </section>
            </>
          )}
          <button type="button" onClick={onLesezeichen} className={`${kleinerKnopf} self-start text-tinte`}>
            <Bookmark aria-hidden className="size-5 text-gruen-700" />
            {fuelle(texte.leser.lesezeichen, { nr: ziel.vers })}
          </button>
        </div>
      </div>
    </div>
  );
}
