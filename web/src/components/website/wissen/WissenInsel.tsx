'use client';

import { Check, FileText, Info, Play, Search, Users, X } from 'lucide-react';
import { type KeyboardEvent, type MouseEvent, type ReactNode, useEffect, useId, useRef, useState } from 'react';
import { klassen } from '@/lib/klassen';
import { ArtikelInhalt, ExpertenInhalt, VideoInhalt } from './WissenDialogInhalt';
import { ArtikelKarte, ExpertenKarte, VideoKarte } from './WissenKarten';
import {
  type Anzeige,
  type ArtikelAnzeige,
  type ExpertenAnzeige,
  REITER,
  type Reiter,
  type ThemaAnzeige,
  type VideoAnzeige,
  type WissenTexte,
} from './typen';

export type WissenInselProps = {
  /** BCP-47-Kennung der Sprache, für Groß- und Kleinschreibung beim Suchen (Türkisch: İ und ı). */
  sprache: string;
  texte: WissenTexte;
  themen: ThemaAnzeige[];
  artikel: ArtikelAnzeige[];
  videos: VideoAnzeige[];
  experten: ExpertenAnzeige[];
  /**
   * Marke „Entwurf“ (`EntwurfMarke`), vom Server fertig gerendert, für Themen mit `marke` (ADR 0047). So bleiben Markup und
   * Zeichen aus dem Client-Bundle (K-12, Welle 3 – JS-Grenze der Wissensseiten).
   */
  entwurfMarke?: ReactNode;
  /**
   * Zustandsgrafik „leer“ für „keine Treffer“, vom Server fertig gerendert: Die Grafik (Achtstern mit Lucide-Pfaden) bleibt so
   * aus dem Client-Bundle (K-12, Welle 3 – JS-Grenze der Wissensseiten).
   */
  leerGrafik?: ReactNode;
};

const REITER_ICON = { artikel: FileText, videos: Play, experten: Users } as const;

type Dialog = { art: 'artikel' | 'video' | 'experte'; schluessel: string };

/**
 * Islamisches Wissen (design/IslamicKnowledge.dc.html, Blatt S14): Suche, Themen-Filter und die Reiter Artikel,
 * Videos und Experten. Alle drei Felder stehen bereits im HTML; inaktive Reiter tragen nur `hidden` (Muster IGMGTabs).
 * Tastatur nach WAI-ARIA: Pfeiltasten, Pos1 und Ende. Dialoge sind native `<dialog>`-Elemente mit Fokusrückgabe.
 * Videos werden nie eingebettet; ohne Videoquelle steht nur ein Platzhalter (K-14, G-05).
 */
export function WissenInsel({ sprache, texte, themen, artikel, videos, experten, entwurfMarke, leerGrafik }: WissenInselProps) {
  const id = useId();
  const [suche, setSuche] = useState('');
  const [thema, setThema] = useState<string | null>(null);
  const [reiter, setReiter] = useState<Reiter>('artikel');
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const ausloeser = useRef<HTMLElement | null>(null);
  const reiterKnoepfe = useRef<Record<Reiter, HTMLButtonElement | null>>({ artikel: null, videos: null, experten: null });

  // Der native Dialog öffnet, sobald ein Eintrag gewählt ist, und schließt, sobald keiner mehr gewählt ist.
  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (dialog && !d.open) d.showModal();
    if (!dialog && d.open) d.close();
  }, [dialog]);

  const suchbegriff = suche.trim().toLocaleLowerCase(sprache);
  const passt = (titel: string, weiter = '') =>
    !suchbegriff || titel.toLocaleLowerCase(sprache).includes(suchbegriff) || weiter.toLocaleLowerCase(sprache).includes(suchbegriff);
  const themaAnzeige = (schluessel: string): Anzeige => themen.find((t) => t.schluessel === schluessel)?.label ?? { text: schluessel };
  const gewaehlt = thema ? themaAnzeige(thema) : null;
  // Suche und Thema wirken auf Artikel (Titel, Autor) und Videos (Titel); Experten bleiben unverändert (Blatt INTERAKTIONEN 1).
  const gefArtikel = artikel.filter((a) => (!thema || a.thema === thema) && passt(a.titel.text, a.autor.text));
  const gefVideos = videos.filter((v) => (!thema || v.thema === thema) && passt(v.titel.text));

  const artikelOffen = dialog?.art === 'artikel' ? artikel.find((a) => a.schluessel === dialog.schluessel) : undefined;
  const videoOffen = dialog?.art === 'video' ? videos.find((v) => v.schluessel === dialog.schluessel) : undefined;
  const expertOffen = dialog?.art === 'experte' ? experten.find((e) => e.schluessel === dialog.schluessel) : undefined;
  const aehnlich = artikelOffen
    ? gefArtikel.filter((a) => a.thema === artikelOffen.thema && a.schluessel !== artikelOffen.schluessel).slice(0, 2)
    : [];

  const reiterText: Record<Reiter, string> = {
    artikel: texte.reiterArtikel,
    videos: texte.reiterVideos,
    experten: texte.reiterExperten,
  };
  const titelId = `${id}-dialog-titel`;

  function oeffne(d: Dialog, ausloesend: HTMLElement) {
    ausloeser.current = ausloesend;
    setDialog(d);
  }

  function schliesse() {
    dialogRef.current?.close();
  }

  // Nach dem Schließen (Schaltfläche, Escape oder Klick auf den Hintergrund) den Fokus zum auslösenden Element setzen.
  // Ist es verborgen, geht der Fokus auf den aktuellen Reiter (WCAG 2.4.3).
  function nachSchliessen() {
    setDialog(null);
    const ziel = ausloeser.current;
    ausloeser.current = null;
    if (ziel && ziel.isConnected && !ziel.closest('[hidden]')) ziel.focus();
    else reiterKnoepfe.current[reiter]?.focus();
  }

  function hintergrundKlick(e: MouseEvent<HTMLDialogElement>) {
    if (e.target === e.currentTarget) schliesse();
  }

  function alleArtikel() {
    ausloeser.current = reiterKnoepfe.current.artikel;
    setReiter('artikel');
    schliesse();
  }

  function reiterTaste(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    const letzte = REITER.length - 1;
    let ziel: number;
    switch (e.key) {
      case 'ArrowRight':
        ziel = index >= letzte ? 0 : index + 1;
        break;
      case 'ArrowLeft':
        ziel = index <= 0 ? letzte : index - 1;
        break;
      case 'Home':
        ziel = 0;
        break;
      case 'End':
        ziel = letzte;
        break;
      default:
        return;
    }
    e.preventDefault();
    const neu = REITER[ziel];
    setReiter(neu);
    reiterKnoepfe.current[neu]?.focus();
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="relative max-w-180">
        <label htmlFor={`${id}-suche`} className="sr-only">
          {texte.suchLabel}
        </label>
        <Search aria-hidden className="pointer-events-none absolute top-4 left-4 size-6 text-tinte-2" />
        <input
          id={`${id}-suche`}
          type="search"
          value={suche}
          onChange={(e) => setSuche(e.target.value)}
          placeholder={texte.suchPlatzhalter}
          className="h-14 w-full rounded-lg border border-rand bg-weiss pr-4 pl-13 text-18 placeholder:text-tinte-3"
        />
      </div>

      <section aria-labelledby={`${id}-themen`} className="flex flex-col gap-4">
        <h2 id={`${id}-themen`} className="text-display-2">
          {texte.themenTitel}
        </h2>
        <div role="group" aria-labelledby={`${id}-themen`} className="grid raster-kacheln gap-3">
          {themen.map((th) => {
            const an = thema === th.schluessel;
            return (
              <button
                key={th.schluessel}
                type="button"
                aria-pressed={an}
                onClick={() => setThema(an ? null : th.schluessel)}
                className={klassen(
                  'flex min-h-16 druck cursor-pointer items-center justify-between gap-2 rounded-lg px-4 py-3 text-left text-18 font-bold text-tinte transition duration-(--dauer-rueckmeldung) hover:border-gruen-700 hover:bg-gruen-50 hover:shadow-s2',
                  an ? 'border-2 border-gruen-700 bg-gruen-50' : 'border border-linie bg-weiss',
                )}
              >
                <span className="flex flex-col items-start gap-1">
                  <span lang={th.label.lang}>{th.label.text}</span> {th.marke ? entwurfMarke : null}
                </span>
                {an ? <Check aria-hidden className="size-5 shrink-0 text-gruen-700" /> : null}
              </button>
            );
          })}
        </div>
        {gewaehlt ? (
          <div className="flex flex-wrap items-center gap-3">
            <span role="status" className="text-18">
              {texte.gefiltertNach} <strong lang={gewaehlt.lang}>{gewaehlt.text}</strong>
            </span>
            <button
              type="button"
              onClick={() => setThema(null)}
              className="inline-flex min-h-12 druck items-center gap-1.5 rounded-md border border-rand bg-weiss px-3.5 font-bold text-tinte transition duration-(--dauer-rueckmeldung) hover:bg-gruen-50"
            >
              <X aria-hidden className="size-4" />
              {texte.filterEntfernen}
            </button>
          </div>
        ) : null}
      </section>

      <div className="flex flex-col gap-6">
        <div
          role="tablist"
          aria-label={texte.reiterGruppe}
          className="flex max-w-full flex-wrap gap-1 self-start rounded-lg border border-linie bg-sand p-1"
        >
          {REITER.map((r, i) => {
            const ist = reiter === r;
            const Icon = REITER_ICON[r];
            return (
              <button
                key={r}
                ref={(el) => {
                  reiterKnoepfe.current[r] = el;
                }}
                type="button"
                role="tab"
                id={`${id}-reiter-${r}`}
                aria-selected={ist}
                aria-controls={`${id}-feld-${r}`}
                tabIndex={ist ? 0 : -1}
                onClick={() => setReiter(r)}
                onKeyDown={(e) => reiterTaste(e, i)}
                className={klassen(
                  'relative inline-flex min-h-12 druck items-center gap-2 rounded-md px-4.5 text-18 font-bold transition duration-(--dauer-rueckmeldung)',
                  ist ? 'bg-weiss text-gruen-800 shadow-s1' : 'text-tinte hover:text-gruen-800',
                )}
              >
                <Icon aria-hidden className="size-5" />
                {reiterText[r]}
                {ist ? <span aria-hidden className="absolute inset-x-3.5 bottom-1 h-0.75 rounded-xs bg-gruen-700" /> : null}
              </button>
            );
          })}
        </div>

        <div id={`${id}-feld-artikel`} role="tabpanel" aria-labelledby={`${id}-reiter-artikel`} hidden={reiter !== 'artikel'}>
          <div className="flex flex-col gap-4">
            <h3 className="text-24">{texte.artikelTitel}</h3>
            <div role="status">
              {gefArtikel.length === 0 ? (
                <div className="flex flex-col items-center gap-4 rounded-lg border border-linie bg-weiss px-6 py-12 text-center">
                  {leerGrafik}
                  <p className="max-w-text text-20 text-tinte-2">{texte.artikelLeer}</p>
                </div>
              ) : null}
            </div>
            <ul className="grid raster-karten gap-4">
              {gefArtikel.map((a) => (
                <li key={a.schluessel}>
                  <ArtikelKarte
                    artikel={a}
                    thema={themaAnzeige(a.thema)}
                    texte={texte}
                    onOeffnen={(ausloesend) => oeffne({ art: 'artikel', schluessel: a.schluessel }, ausloesend)}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div id={`${id}-feld-videos`} role="tabpanel" aria-labelledby={`${id}-reiter-videos`} hidden={reiter !== 'videos'}>
          <div className="flex flex-col gap-4">
            <div role="status">
              {gefVideos.length === 0 ? (
                <div className="flex flex-col items-center gap-4 rounded-lg border border-linie bg-weiss px-6 py-12 text-center">
                  {leerGrafik}
                  <p className="max-w-text text-20 text-tinte-2">{texte.videosLeer}</p>
                </div>
              ) : null}
            </div>
            <ul className="grid raster-karten gap-4">
              {gefVideos.map((v) => (
                <li key={v.schluessel}>
                  <VideoKarte
                    video={v}
                    texte={texte}
                    onOeffnen={(ausloesend) => oeffne({ art: 'video', schluessel: v.schluessel }, ausloesend)}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div id={`${id}-feld-experten`} role="tabpanel" aria-labelledby={`${id}-reiter-experten`} hidden={reiter !== 'experten'}>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-24">{texte.expertenTitel}</h3>
              <span className="inline-flex items-center gap-1.5 rounded-pill bg-warnung-toenung px-2.5 py-0.5 text-16 font-bold text-warnung">
                <Info aria-hidden className="size-4" />
                {texte.expertenBadge}
              </span>
            </div>
            <ul className="grid raster-kacheln gap-4">
              {experten.map((e) => (
                <li key={e.schluessel}>
                  <ExpertenKarte
                    experte={e}
                    texte={texte}
                    onOeffnen={(ausloesend) => oeffne({ art: 'experte', schluessel: e.schluessel }, ausloesend)}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <dialog
        ref={dialogRef}
        aria-labelledby={titelId}
        onClose={nachSchliessen}
        onClick={hintergrundKlick}
        className="m-auto max-h-full w-full max-w-188 overflow-y-auto bg-transparent p-4 text-tinte backdrop:bg-tinte/55"
      >
        {dialog ? (
          <div className="relative flex flex-col gap-4 rounded-lg bg-weiss p-5 md:p-8">
            <button
              type="button"
              aria-label={texte.schliessen}
              onClick={schliesse}
              className="absolute top-3 right-3 inline-flex size-12 druck items-center justify-center rounded-md border border-rand bg-weiss transition duration-(--dauer-rueckmeldung) hover:bg-gruen-50"
            >
              <X aria-hidden className="size-6" />
            </button>
            {artikelOffen ? (
              <ArtikelInhalt
                artikel={artikelOffen}
                thema={themaAnzeige(artikelOffen.thema)}
                titelId={titelId}
                aehnlich={aehnlich}
                texte={texte}
                onWechsel={(schluessel) => setDialog({ art: 'artikel', schluessel })}
              />
            ) : null}
            {videoOffen ? <VideoInhalt video={videoOffen} titelId={titelId} texte={texte} /> : null}
            {expertOffen ? <ExpertenInhalt experte={expertOffen} titelId={titelId} texte={texte} onAlleArtikel={alleArtikel} /> : null}
          </div>
        ) : null}
      </dialog>
    </div>
  );
}
