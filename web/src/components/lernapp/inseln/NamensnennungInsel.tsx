'use client';

import { useEffect, useState } from 'react';
import { formatiere } from '@/lib/lernapp/format';
import { KURS_SLUGS, richtung, STUFEN, type KursSlug, type Oberflaeche, type RichtungId } from '@/lib/lernapp/kurse';
import { paketeImVorrat, type PaketKopf } from '@/lib/lernapp/lokal/vorrat';
import { type EinheitNennungen, nennungenAus } from '@/lib/lernapp/namensnennung';
import { themaVon } from '@/lib/lernapp/oberflaeche/kursverzeichnis';

export type NamensnennungTexte = { laedt: string; leer: string; anzahl: string; eigene: string; nurEigene: string };

type Einheit = { kurs: KursSlug; paket: PaketKopf; nennungen: EinheitNennungen };
type Zustand = { art: 'laedt' } | { art: 'bereit'; einheiten: Einheit[] };

const ordnung = (a: Einheit, b: Einheit) =>
  KURS_SLUGS.indexOf(a.kurs) - KURS_SLUGS.indexOf(b.kurs) ||
  STUFEN.indexOf(a.paket.einheit.stufe) - STUFEN.indexOf(b.paket.einheit.stufe) ||
  a.paket.einheit.reihenfolge - b.paket.einheit.reihenfolge;

/** Sätze und Einträge einer Einheit mit ihrer Namensnennung (Text mit `lang`/`dir`, Namensnennung deutsch wie im Paket). */
export function EinheitNamensnennung({
  ui,
  nennungen,
  texte,
}: {
  ui: Oberflaeche;
  nennungen: EinheitNennungen;
  texte: NamensnennungTexte;
}) {
  return (
    <div className="flex flex-col gap-3 px-5 pb-5">
      {nennungen.fremd.length ? (
        <ul className="flex flex-col">
          {nennungen.fremd.map((n) => (
            <li key={n.schluessel} className="flex flex-col gap-1 border-t border-linie py-3">
              <p lang={n.sprache} dir={richtung(n.sprache)} className="text-start text-18">
                {n.text}
              </p>
              <p lang="de" dir="ltr" className="text-start text-16 wrap-anywhere text-tinte-2">
                {n.nennung}
              </p>
              {n.adresse ? (
                <p dir="ltr" className="text-start text-16 break-all text-tinte-2">
                  {n.adresse}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
      <p className="text-16 text-tinte-2">
        {nennungen.fremd.length ? formatiere(texte.eigene, { n: nennungen.eigene }, ui) : texte.nurEigene}
      </p>
    </div>
  );
}

/** Eine Einheit als aufklappbarer Abschnitt; die Liste entsteht erst beim Aufklappen (viele Einheiten, wenig DOM). */
function EinheitAbschnitt({ ui, e, kurs, texte }: { ui: Oberflaeche; e: Einheit; kurs: string; texte: NamensnennungTexte }) {
  const [offen, setOffen] = useState(false);
  const thema = themaVon(e.paket.einheit, ui, e.paket.ausgangssprache);
  return (
    <details className="rounded-lg border border-linie bg-weiss" onToggle={(x) => setOffen(x.currentTarget.open)}>
      <summary className="flex min-h-12 cursor-pointer flex-col justify-center gap-1 px-5 py-3">
        <span className="font-bold">
          {kurs}
          {thema ? (
            <>
              {' · '}
              <span lang={thema.sprache} dir={richtung(thema.sprache)}>
                {thema.text}
              </span>
            </>
          ) : null}
        </span>
        <span className="text-16 text-tinte-2">
          {e.nennungen.fremd.length ? formatiere(texte.anzahl, { n: e.nennungen.fremd.length }, ui) : texte.nurEigene}
        </span>
      </summary>
      {offen ? <EinheitNamensnennung ui={ui} nennungen={e.nennungen} texte={texte} /> : null}
    </details>
  );
}

/**
 * Namensnennung je Satz und Eintrag (ADR 0039 Nr. 9, ADR 0045 Nr. 4, KERN 4.0 §1 „Quellenangaben auch offline“): liest die
 * Einheitenpakete im Vorrat des Geräts (ohne Netz; jede gespielte oder gespeicherte Einheit liegt dort) und zeigt je Einheit
 * die übernommenen Sätze und Einträge mit Urheber und Adresse aus dem Paket. Wissen und Koran-Arabisch haben kein Paket im
 * Format der Sprachkurse und erscheinen hier nicht; ihre Belege stehen je Aussage im Kurs.
 */
export function NamensnennungInsel({
  ui,
  texte,
  kurse,
}: {
  ui: Oberflaeche;
  texte: NamensnennungTexte;
  /** Titel je Richtung in der Oberflächensprache (vom Server) */
  kurse: Record<RichtungId, string>;
}) {
  const [z, setZ] = useState<Zustand>({ art: 'laedt' });
  useEffect(() => {
    let aktiv = true;
    void paketeImVorrat()
      .then((liste) => liste.map((x) => ({ ...x, nennungen: nennungenAus(x.paket.eintraege) })).sort(ordnung))
      .catch((): Einheit[] => [])
      .then((einheiten) => aktiv && setZ({ art: 'bereit', einheiten }));
    return () => {
      aktiv = false;
    };
  }, []);

  if (z.art === 'laedt') return <p className="text-18 text-tinte-2">{texte.laedt}</p>;
  if (!z.einheiten.length) return <p className="max-w-einleitung text-18 text-tinte-2">{texte.leer}</p>;
  return (
    <ul className="flex flex-col gap-3">
      {z.einheiten.map((e) => (
        <li key={`${e.kurs}/${e.paket.einheit.schluessel}`}>
          <EinheitAbschnitt ui={ui} e={e} kurs={kurse[e.paket.kurs]} texte={texte} />
        </li>
      ))}
    </ul>
  );
}
