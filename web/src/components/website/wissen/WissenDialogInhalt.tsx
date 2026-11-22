import { Clock, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { STREIFEN, THEMA_TAG, VOLL } from './stil';
import type { Anzeige, ArtikelAnzeige, ExpertenAnzeige, VideoAnzeige, WissenTexte } from './typen';

/**
 * Inhalte des nativen Dialogs (design/IslamicKnowledge.dc.html, Z95–129). Der Rahmen mit Schaltfläche „Schließen“
 * steht in der Insel; hier nur die drei Fassungen. Videos bleiben ohne Einbettung (K-14): Es steht ein reiner Link „Auf
 * YouTube ansehen“ (keine Anfrage beim Aufruf), fertig vom Server (`VideoLink`). Angaben, die noch Platzhalter der
 * Gemeinde sind, kommen leer bzw. als `null` an und entfallen samt ihrer Zeile.
 */

export function ArtikelInhalt({
  artikel: x,
  thema,
  titelId,
  aehnlich,
  texte,
  onWechsel,
}: {
  artikel: ArtikelAnzeige;
  thema: Anzeige;
  titelId: string;
  aehnlich: ArtikelAnzeige[];
  texte: WissenTexte;
  onWechsel: (schluessel: string) => void;
}) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-3 pr-14 text-16">
        <span lang={thema.lang} className={THEMA_TAG}>
          {thema.text}
        </span>
        <span className="text-tinte-2">{x.lesezeit}</span>
      </div>
      <h2 id={titelId} lang={x.titel.lang} className="pr-14 text-30">
        {x.titel.text}
      </h2>
      <p className="text-16 text-tinte-2">
        {x.autor ? <span lang={x.autor.lang}>{x.autor.text}</span> : null}
        {x.autor && x.datum ? ' · ' : null}
        {x.datum}
      </p>
      <p lang={x.text?.lang} className="max-w-text text-pretty">
        {x.text ? x.text.text : texte.artikelBeispiel}
      </p>
      {/* Ohne ähnliche Artikel (Themenseite mit einem Artikel) entfällt der Abschnitt samt Überschrift */}
      {aehnlich.length ? (
        <>
          <h3 className="mt-2 font-text text-18 font-bold">{texte.dialogAehnlich}</h3>
          <ul className="grid gap-3 md:grid-cols-2">
            {aehnlich.map((s) => (
              <li key={s.schluessel}>
                <button
                  type="button"
                  aria-label={`${texte.weiterlesen}: ${s.titel.text}`}
                  onClick={() => onWechsel(s.schluessel)}
                  className="flex w-full druck flex-col gap-1 rounded-lg border border-linie p-3 text-left transition duration-(--dauer-rueckmeldung) hover:border-gruen-700 hover:bg-gruen-50"
                >
                  <span lang={s.titel.lang} className="font-bold">
                    {s.titel.text}
                  </span>
                  <span className="text-16 text-tinte-2">
                    {s.autor ? <span lang={s.autor.lang}>{s.autor.text}</span> : null}
                    {s.autor ? ' · ' : null}
                    {s.lesezeit}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </>
  );
}

export function VideoInhalt({ video: v, titelId, texte }: { video: VideoAnzeige; titelId: string; texte: WissenTexte }) {
  return (
    <>
      <h2 id={titelId} lang={v.titel.lang} className="pr-14 text-30">
        {v.titel.text}
      </h2>
      {v.dauer ? (
        <span className="inline-flex items-center gap-1.5 text-16 text-tinte-2">
          <Clock aria-hidden className="size-4" />
          {v.dauer}
        </span>
      ) : null}
      <div
        className={cn(
          'flex aspect-video flex-col items-center justify-center gap-2 rounded-lg border border-linie p-4 text-center',
          STREIFEN,
        )}
      >
        <Play aria-hidden className="size-8 text-gruen-700" />
        <span className="font-bold">{v.titel.text}</span>
        {v.link}
      </div>
      {v.beschreibung.text ? (
        <>
          <h3 className="font-text text-18 font-bold">{texte.dialogBeschreibung}</h3>
          <p lang={v.beschreibung.lang} className="max-w-text text-pretty">
            {v.beschreibung.text}
          </p>
        </>
      ) : null}
    </>
  );
}

export function ExpertenInhalt({
  experte: e,
  titelId,
  texte,
  onAlleArtikel,
}: {
  experte: ExpertenAnzeige;
  titelId: string;
  texte: WissenTexte;
  onAlleArtikel: () => void;
}) {
  return (
    <>
      <h2 id={titelId} lang={e.name.lang} className="pr-14 text-30">
        {e.name.text}
      </h2>
      {e.fachgebiet.text ? (
        <p lang={e.fachgebiet.lang} className="font-bold text-gruen-800">
          {e.fachgebiet.text}
        </p>
      ) : null}
      {e.institution.text ? (
        <p lang={e.institution.lang} className="text-tinte-2">
          {e.institution.text}
        </p>
      ) : null}
      {e.bio.text ? (
        <>
          <h3 className="mt-2 font-text text-18 font-bold">{texte.dialogUeber}</h3>
          <p lang={e.bio.lang} className="max-w-text text-pretty">
            {e.bio.text}
          </p>
        </>
      ) : null}
      {e.anzahlArtikel.text ? (
        <div className="flex items-baseline gap-2">
          <strong lang={e.anzahlArtikel.lang} className="text-30">
            {e.anzahlArtikel.text}
          </strong>
          <span className="text-tinte-2">{texte.zahlArtikel}</span>
        </div>
      ) : null}
      <button type="button" onClick={onAlleArtikel} className={VOLL}>
        {texte.dialogArtikelAnzeigen}
      </button>
    </>
  );
}
