'use client';

import type { JSONContent } from '@tiptap/core';
import { X } from 'lucide-react';
import { Fragment, useEffect, useEffectEvent, useId, useRef, useState, type ReactNode } from 'react';
import { abschnitte } from '@/lib/quran/tajwid';
import type { WortDaten } from '@/server/queries/quran';
import { ladeWoerter } from './daten';
import { adresse, fuelle, type LeserTexte } from './leser-typen';
import type { WortZiel } from './QuranLeser';

/** Nur eigene Pfade und https-Links (Linkregel ADR 0006). */
const erlaubt = (href: unknown): href is string => typeof href === 'string' && (/^\/(?!\/)/.test(href) || href.startsWith('https://'));

/**
 * Freigegebene Erklärung (Tiptap-JSON) als React-Elemente: Absätze, Überschriften, Listen, Zitat, Umbruch, fett,
 * kursiv und erlaubte Links. Kein HTML aus den Daten (ADR 0006); Unbekanntes entfällt.
 */
function knoten(n: JSONContent, k: number): ReactNode {
  const kinder = n.content?.map(knoten);
  switch (n.type) {
    case 'doc':
      return <Fragment key={k}>{kinder}</Fragment>;
    case 'paragraph':
      return <p key={k}>{kinder}</p>;
    case 'heading':
      return <h4 key={k}>{kinder}</h4>;
    case 'bulletList':
      return <ul key={k}>{kinder}</ul>;
    case 'orderedList':
      return <ol key={k}>{kinder}</ol>;
    case 'listItem':
      return <li key={k}>{kinder}</li>;
    case 'blockquote':
      return <blockquote key={k}>{kinder}</blockquote>;
    case 'hardBreak':
      return <br key={k} />;
    case 'text': {
      let el: ReactNode = n.text ?? '';
      for (const m of n.marks ?? []) {
        if (m.type === 'bold') el = <strong>{el}</strong>;
        else if (m.type === 'italic') el = <em>{el}</em>;
        else if (m.type === 'link' && erlaubt(m.attrs?.href)) el = <a href={m.attrs.href}>{el}</a>;
      }
      return <Fragment key={k}>{el}</Fragment>;
    }
    default:
      return null;
  }
}

/** Codepunkt-Bereich [von, bis) im Wort als DOM-Range über seine Textknoten (Tajwid-Abschnitte sind <b>). */
function bereichImWort(wort: HTMLElement, von: number, bis: number): Range | null {
  const gang = document.createTreeWalker(wort, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  let zaehler = 0;
  let start = false;
  for (let k = gang.nextNode(); k; k = gang.nextNode()) {
    const zeichen = Array.from(k.textContent ?? '');
    let einheiten = 0;
    for (const z of zeichen) {
      if (!start && zaehler === von) {
        range.setStart(k, einheiten);
        start = true;
      }
      if (start && zaehler === bis) {
        range.setEnd(k, einheiten);
        return range;
      }
      zaehler++;
      einheiten += z.length;
    }
    if (start && zaehler === bis) {
      range.setEnd(k, einheiten);
      return range;
    }
  }
  return start ? range : null;
}

/**
 * Regel-Seitenleiste (O-Q01, B-15): Schublade von rechts, auf dem Telefon Blatt von unten (natives <dialog>).
 * Regelname, Familie mit Farbe und Muster, freigegebene Erklärung oder Platzhalter, das Beispiel im Wort markiert –
 * zusätzlich im Vers über die CSS Custom Highlight API (Rückfall: Klasse am Wort) –, Hörbeispiel nur mit Freigabe.
 */
export default function TajwidLeiste({
  schluessel,
  wort,
  texte,
  sprache,
  pfadWoerter,
  pfadTajwid,
  onSchliessen,
}: {
  schluessel: string;
  wort: WortZiel;
  texte: LeserTexte;
  sprache: string;
  pfadWoerter: string;
  pfadTajwid: string;
  onSchliessen: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [daten, setDaten] = useState<WortDaten | null>(null);
  const titelId = useId();
  const l = texte.tajwidLeiste;

  useEffect(() => {
    let aktiv = true;
    ladeWoerter(adresse(pfadWoerter, { s: wort.sure })).then(
      (d) => aktiv && setDaten(d),
      () => undefined,
    );
    return () => {
      aktiv = false;
    };
  }, [pfadWoerter, wort.sure]);

  const geschlossen = useEffectEvent(() => onSchliessen());
  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    d.showModal();
    // Ein verspätetes „close“ (Effekt neu gestartet, Dialog wieder offen) zählt nicht
    const zu = () => {
      if (!d.open) geschlossen();
    };
    d.addEventListener('close', zu);
    return () => {
      d.removeEventListener('close', zu);
      if (d.open) d.close();
    };
  }, []);

  // Segmente der Regel im Wort (Codepunkte ab Wortanfang)
  const segmenteVon = (d: WortDaten | null) => {
    const w = d?.verse[wort.vers]?.w[wort.pos - 1];
    const versatz = w?.[1] ?? 0;
    const laenge = w?.[2] ?? 0;
    const segmente = (d?.verse[wort.vers]?.tj ?? []).filter(([s, e, r]) => r === schluessel && s < versatz + laenge && e > versatz);
    return { versatz, laenge, segmente };
  };
  const { versatz, segmente } = segmenteVon(daten);

  // Beispiel im Vers markieren (Highlight API, sonst Klasse) und beim Schließen lösen
  useEffect(() => {
    const w = daten?.verse[wort.vers]?.w[wort.pos - 1];
    if (!w) return;
    const [, von, laenge] = w;
    const teile = (daten.verse[wort.vers]?.tj ?? []).filter(([s, e, r]) => r === schluessel && s < von + laenge && e > von);
    if (!teile.length) return;
    const hl = typeof CSS !== 'undefined' && 'highlights' in CSS ? CSS.highlights : null;
    if (!hl) {
      wort.el.classList.add('regel-markiert');
      return () => wort.el.classList.remove('regel-markiert');
    }
    const ranges = teile.flatMap(([s, e]) => {
      const r = bereichImWort(wort.el, Math.max(s - von, 0), Math.min(e - von, laenge));
      return r ? [r] : [];
    });
    hl.set('quran-regel', new Highlight(...ranges));
    return () => {
      hl.delete('quran-regel');
    };
  }, [daten, schluessel, wort]);

  const regel = daten?.regeln.find((r) => r.schluessel === schluessel);
  const name = regel ? (regel.name[sprache as 'de'] ?? regel.name.de) : '';
  const kurz = regel?.kurz ? (regel.kurz[sprache as 'de'] ?? regel.kurz.de) : null;
  const erklaerung = regel?.erklaerung ? (regel.erklaerung[sprache as 'de'] ?? regel.erklaerung.de) : null;
  const beispiel = abschnitte(wort.el.textContent ?? '', segmente, versatz);

  return (
    <dialog ref={dialog} aria-labelledby={titelId} className="regel-leiste">
      <div className="flex h-full flex-col gap-6 overflow-y-auto p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-16 font-bold text-gruen-800">{l.kennung}</span>
            <h2 id={titelId} lang={regel && !regel.name[sprache as 'de'] ? 'de' : undefined} className="text-30">
              {name || '…'}
            </h2>
          </div>
          <button
            type="button"
            aria-label={l.schliessen}
            onClick={() => dialog.current?.close()}
            className="-mt-1 -mr-2 inline-flex size-12 shrink-0 items-center justify-center rounded-pill text-tinte-2 hover:bg-sand"
          >
            <X aria-hidden className="size-5" />
          </button>
        </div>

        {regel ? (
          <p className="flex flex-wrap items-baseline gap-x-2 text-16">
            <span className="font-bold">{l.familie}:</span>
            <span className={`tj tj-${regel.familie} muster-probe`}>{texte.familien[regel.familie]}</span>
            <span className="text-tinte-2">({texte.muster[regel.familie]})</span>
          </p>
        ) : null}

        <section className="flex flex-col gap-2">
          <h3 className="font-text text-16 font-bold">{fuelle(l.beispiel, { sure: wort.sure, vers: wort.vers })}</h3>
          <p
            lang="ar"
            dir="rtl"
            className="beispiel-wort rounded-lg border border-linie bg-weiss px-4 text-center font-quran text-arabisch-1"
          >
            {beispiel.map((a, i) =>
              a.regeln.includes(schluessel) && regel ? (
                <b key={i} className={`tj tj-${regel.familie} regel-markiert`}>
                  {a.text}
                </b>
              ) : (
                <Fragment key={i}>{a.text}</Fragment>
              ),
            )}
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h3 className="font-text text-16 font-bold">{l.erklaerung}</h3>
          {kurz || erklaerung ? (
            <div className="fliesstext text-18">
              {kurz ? <p className="font-bold">{kurz}</p> : null}
              {erklaerung ? knoten(erklaerung, 0) : null}
            </div>
          ) : (
            <p className="text-18 text-tinte-2">{l.platzhalter}</p>
          )}
        </section>

        {regel?.hoerbeispiel ? (
          <section className="flex flex-col gap-2">
            <h3 className="font-text text-16 font-bold">{l.hoerbeispiel}</h3>
            <audio controls preload="none" src={regel.hoerbeispiel} className="w-full" />
          </section>
        ) : null}

        <a href={`${pfadTajwid}#regel-${schluessel}`} className="mt-auto self-start text-16 font-bold">
          {l.alleRegeln}
        </a>
      </div>
    </dialog>
  );
}
