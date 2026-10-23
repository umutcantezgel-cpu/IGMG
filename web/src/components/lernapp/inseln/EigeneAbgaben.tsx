'use client';

import { PenLine, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { formatiere, intlSprache, type Ziffern } from '@/lib/lernapp/format';
import { type Oberflaeche, richtung } from '@/lib/lernapp/kurse';
import type { EigeneAbgabe, ListeAntwort, Stufen } from '@/lib/lernapp/schreiben/abgabe';
import type { SchreibabgabeTexte } from '../typen';

/** Adresse der Route (`schreiben/abgabe.ts`, SCHREIBEN_ADRESSE); hier als Text, damit Zod nicht in die Insel kommt. */
const ADRESSE = '/api/lernapp/schreiben';
const KRITERIEN = ['aufgabe', 'zusammenhang', 'wortschatz', 'grammatik'] as const;

type Lage = { art: 'laedt' } | { art: 'aus' } | { art: 'fehler' } | { art: 'daten'; abgaben: EigeneAbgabe[] };

/**
 * „Meine Schreibabgaben“ auf der Gruppenseite der Lern-App (L5-03; PLAN §4.3; ADR 0042 Nr. 11; KERN 4.0 §5): die eigenen
 * Texte an die Lehrkraft mit Selbsteinschätzung und – sobald zurückgegeben – der Rückmeldung (Kommentar, Prüfliste,
 * Einstufung ohne Note). Nur angezeigt, wenn die Gruppe mit Konto geladen ist; der Server liefert nur die eigenen,
 * nicht abgelaufenen Abgaben. Jede Abgabe lässt sich nach einer Rückfrage endgültig löschen (danach sieht sie auch die
 * Lehrkraft nicht mehr). Meldungen gehen in die Live-Region der Gruppe (`melde`).
 */
export function EigeneAbgaben({
  ui,
  texte,
  ziffern,
  melde,
}: {
  ui: Oberflaeche;
  texte: SchreibabgabeTexte;
  ziffern: Ziffern;
  melde: (text: string) => void;
}) {
  const [lage, setLage] = useState<Lage>({ art: 'laedt' });
  const [frage, setFrage] = useState<string | null>(null);
  const [loescht, setLoescht] = useState(false);
  const titel = useRef<HTMLHeadingElement>(null);
  const f = (vorlage: string, werte: Record<string, string | number> = {}) => formatiere(vorlage, werte, ui, ziffern);
  const datum = (iso: string) => new Intl.DateTimeFormat(intlSprache(ui, ziffern), { dateStyle: 'medium' }).format(new Date(iso));
  const nameLang = ui === 'tr' ? 'tr' : 'de';

  useEffect(() => {
    let aktiv = true;
    void (async () => {
      try {
        const r = await fetch(`${ADRESSE}?ui=${ui}`, { headers: { accept: 'application/json' }, cache: 'no-store' });
        if (!aktiv) return;
        // Schalter aus oder abgemeldet: Die Gruppe zeigt das schon; hier dann nichts
        if (r.status === 404 || r.status === 401) return setLage({ art: 'aus' });
        if (!r.ok) return setLage({ art: 'fehler' });
        const a = (await r.json()) as ListeAntwort;
        if (aktiv) setLage({ art: 'daten', abgaben: a.abgaben });
      } catch {
        if (aktiv) setLage({ art: 'fehler' });
      }
    })();
    return () => {
      aktiv = false;
    };
  }, [ui]);

  const loesche = async (id: string) => {
    if (lage.art !== 'daten') return;
    setLoescht(true);
    try {
      const r = await fetch(`${ADRESSE}?id=${encodeURIComponent(id)}`, { method: 'DELETE', headers: { accept: 'application/json' } });
      if (!r.ok && r.status !== 404) return melde(texte.liste.loeschenFehler);
      setLage({ art: 'daten', abgaben: lage.abgaben.filter((a) => a.id !== id) });
      setFrage(null);
      melde(texte.liste.geloescht);
      requestAnimationFrame(() => titel.current?.focus());
    } catch {
      melde(texte.liste.loeschenFehler);
    } finally {
      setLoescht(false);
    }
  };

  if (lage.art === 'aus') return null;

  const stufen = (s: Stufen) => (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
      {KRITERIEN.filter((k) => s[k] !== undefined).map((k) => (
        <div key={k} className="flex flex-wrap gap-x-2">
          <dt className="font-bold">{texte.kriterium[k]}</dt>
          <dd>{texte.stufe[`s${s[k] as 0 | 1 | 2 | 3}`]}</dd>
        </div>
      ))}
    </dl>
  );

  return (
    <section aria-labelledby="schreibabgaben" className="flex flex-col gap-4 rounded-lg border border-linie bg-weiss p-5">
      <h2 id="schreibabgaben" ref={titel} tabIndex={-1} className="flex items-center gap-2 text-24 outline-none">
        <PenLine aria-hidden className="size-6 shrink-0 text-gruen-700" />
        {texte.liste.titel}
      </h2>
      <p className="text-16 text-tinte-2">{texte.liste.einleitung}</p>
      {lage.art === 'laedt' ? <p className="text-16 text-tinte-2">{texte.liste.laedt}</p> : null}
      {lage.art === 'fehler' ? <p className="text-16">{texte.liste.fehler}</p> : null}
      {lage.art === 'daten' && !lage.abgaben.length ? <p className="text-16 text-tinte-2">{texte.liste.leer}</p> : null}
      {lage.art === 'daten' && lage.abgaben.length ? (
        <ul className="flex flex-col gap-4">
          {lage.abgaben.map((a) => {
            const r = a.rueckmeldung;
            return (
              <li key={a.id} className="flex flex-col gap-3 rounded-md bg-papier p-4">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <h3 className="text-18 font-bold">{f(texte.liste.gesendetAm, { datum: datum(a.eingereichtAm) })}</h3>
                  <span className={`rounded-pill px-3 py-1 text-16 font-bold ${r ? 'bg-gruen-50 text-gruen-800' : 'bg-sand text-tinte-2'}`}>
                    {r ? texte.liste.zurueck : texte.liste.offen}
                  </span>
                </div>
                {a.gruppe ? (
                  <p className="text-16 text-tinte-2">
                    {texte.liste.gruppe.split('{gruppe}').map((teil, i) =>
                      i === 0 ? (
                        teil
                      ) : (
                        <span key={i}>
                          <bdi lang={nameLang}>{a.gruppe}</bdi>
                          {teil}
                        </span>
                      ),
                    )}
                  </p>
                ) : null}
                <div className="flex flex-col gap-1">
                  <p className="text-16 font-bold">{texte.liste.aufgabe}</p>
                  {a.aufgabe ? (
                    <p
                      lang={a.aufgabe.sprache}
                      dir={richtung(a.aufgabe.sprache)}
                      className={a.aufgabe.sprache === 'ar' ? 'font-arabic' : undefined}
                    >
                      {a.aufgabe.text}
                    </p>
                  ) : (
                    <p className="text-16 text-tinte-2">{texte.liste.aufgabeFehlt}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-16 font-bold">{texte.liste.meinText}</p>
                  <p
                    lang={a.aufgabe?.sprache}
                    dir={a.aufgabe ? richtung(a.aufgabe.sprache) : 'auto'}
                    className={`rounded-md border border-linie bg-weiss p-3 whitespace-pre-wrap ${a.aufgabe?.sprache === 'ar' ? 'font-arabic' : ''}`}
                  >
                    {a.text}
                  </p>
                </div>
                {Object.keys(a.selbst).length ? (
                  <div className="flex flex-col gap-1">
                    <p className="text-16 font-bold">{texte.liste.selbst}</p>
                    {stufen(a.selbst)}
                  </div>
                ) : null}
                {r ? (
                  <div className="flex flex-col gap-3 rounded-md border-2 border-gruen-700 bg-weiss p-4">
                    <p className="text-18 font-bold">{texte.liste.rueckmeldung}</p>
                    {r.einstufung ? <p className="font-bold text-gruen-800">{texte.einstufung[r.einstufung]}</p> : null}
                    {r.kommentar ? (
                      <div className="flex flex-col gap-1">
                        <p className="text-16 font-bold">{texte.liste.kommentar}</p>
                        <p dir="auto" className="whitespace-pre-wrap">
                          {r.kommentar}
                        </p>
                      </div>
                    ) : null}
                    {Object.keys(r.pruefliste).length ? (
                      <div className="flex flex-col gap-1">
                        <p className="text-16 font-bold">{texte.liste.pruefliste}</p>
                        {stufen(r.pruefliste)}
                      </div>
                    ) : null}
                  </div>
                ) : null}
                {frage === a.id ? (
                  <div className="flex flex-col gap-3 rounded-md bg-sand p-3">
                    <p className="text-16">{texte.liste.loeschenFrage}</p>
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        disabled={loescht}
                        onClick={() => void loesche(a.id)}
                        className="inline-flex min-h-12 druck items-center gap-2 rounded-pill bg-fehler px-5 font-bold text-weiss disabled:bg-linie disabled:text-tinte-2"
                      >
                        <Trash2 aria-hidden className="size-5 shrink-0" />
                        {texte.liste.loeschenJa}
                      </button>
                      <button
                        type="button"
                        onClick={() => setFrage(null)}
                        className="inline-flex min-h-12 druck items-center rounded-pill border border-rand bg-weiss px-5 font-bold text-tinte hover:border-gruen-700"
                      >
                        {texte.liste.abbrechen}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setFrage(a.id)}
                    aria-label={f(texte.liste.loeschenAria, { datum: datum(a.eingereichtAm) })}
                    className="inline-flex min-h-12 druck items-center gap-2 self-start rounded-pill border border-rand bg-weiss px-5 font-bold text-tinte hover:border-gruen-700"
                  >
                    <Trash2 aria-hidden className="size-5 shrink-0" />
                    {texte.liste.loeschen}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}
