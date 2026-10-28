import { BookOpen, Clock, Play, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { KARTE, STREIFEN, THEMA_TAG, UMRISS, VOLL } from './stil';
import type { Anzeige, ArtikelAnzeige, ExpertenAnzeige, VideoAnzeige, WissenTexte } from './typen';

/**
 * Karten der drei Reiter (Design: Artikel, Videos, Experten). Ohne eigenen Zustand; die Insel öffnet den Dialog
 * über `onOeffnen` und gibt das auslösende Element mit, damit der Fokus nach dem Schließen zurückkehrt.
 */

export function ArtikelKarte({
  artikel: a,
  thema,
  texte,
  onOeffnen,
}: {
  artikel: ArtikelAnzeige;
  thema: Anzeige;
  texte: WissenTexte;
  onOeffnen: (ausloesend: HTMLElement) => void;
}) {
  return (
    <article className={KARTE}>
      <div className="flex items-center justify-between gap-2 text-16">
        <span lang={thema.lang} className={THEMA_TAG}>
          {thema.text}
        </span>
        <span className="text-tinte-2">{a.lesezeit}</span>
      </div>
      <h4 lang={a.titel.lang} className="text-24">
        {a.titel.text}
      </h4>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-16 text-tinte-2">
        <span className="inline-flex items-center gap-1.5">
          <User aria-hidden className="size-4" />
          <span lang={a.autor.lang}>{a.autor.text}</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock aria-hidden className="size-4" />
          {a.datum}
        </span>
      </div>
      <button
        type="button"
        aria-label={`${texte.weiterlesen}: ${a.titel.text}`}
        onClick={(e) => onOeffnen(e.currentTarget)}
        className={UMRISS}
      >
        <BookOpen aria-hidden className="size-5" />
        {texte.weiterlesen}
      </button>
    </article>
  );
}

export function VideoKarte({
  video: v,
  texte,
  onOeffnen,
}: {
  video: VideoAnzeige;
  texte: WissenTexte;
  onOeffnen: (ausloesend: HTMLElement) => void;
}) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-linie bg-weiss shadow-s1 transition duration-(--dauer-rueckmeldung) hover:border-gruen-700 hover:shadow-s2">
      <div role="img" aria-label={v.vorschau} className={cn('flex h-40 items-center justify-center border-b border-linie', STREIFEN)}>
        <span aria-hidden className="flex size-14 items-center justify-center rounded-pill border border-rand bg-weiss text-gruen-700">
          <Play className="size-6" />
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2.5 px-6 pt-5 pb-6">
        <h4 lang={v.titel.lang} className="text-24">
          {v.titel.text}
        </h4>
        {v.dauer ? (
          <span className="inline-flex items-center gap-1.5 text-16 text-tinte-2">
            <Clock aria-hidden className="size-4" />
            {v.dauer}
          </span>
        ) : null}
        <p className="text-16 text-tinte-2">{texte.videoHinweis}</p>
        <button
          type="button"
          aria-label={`${texte.videoAnsehen}: ${v.titel.text}`}
          onClick={(e) => onOeffnen(e.currentTarget)}
          className={cn(VOLL, 'mt-auto')}
        >
          <Play aria-hidden className="size-5" />
          {texte.videoAnsehen}
        </button>
      </div>
    </article>
  );
}

export function ExpertenKarte({
  experte: e,
  texte,
  onOeffnen,
}: {
  experte: ExpertenAnzeige;
  texte: WissenTexte;
  onOeffnen: (ausloesend: HTMLElement) => void;
}) {
  return (
    <article className={KARTE}>
      <span aria-hidden className="flex size-14 items-center justify-center rounded-pill bg-gruen-50 text-gruen-800">
        <User className="size-7" />
      </span>
      <div className="flex flex-col">
        <h4 lang={e.name.lang} className="text-24">
          {e.name.text}
        </h4>
        <p lang={e.fachgebiet.lang} className="font-bold text-gruen-800">
          {e.fachgebiet.text}
        </p>
        <p lang={e.institution.lang} className="text-16 text-tinte-2">
          {e.institution.text}
        </p>
      </div>
      <div className="flex items-baseline gap-2">
        <strong lang={e.anzahlArtikel.lang} className="text-30">
          {e.anzahlArtikel.text}
        </strong>
        <span className="text-tinte-2">{texte.zahlArtikel}</span>
      </div>
      <button
        type="button"
        aria-label={`${texte.mehrErfahren}: ${e.name.text}`}
        onClick={(ev) => onOeffnen(ev.currentTarget)}
        className={UMRISS}
      >
        <User aria-hidden className="size-5" />
        {texte.mehrErfahren}
      </button>
    </article>
  );
}
