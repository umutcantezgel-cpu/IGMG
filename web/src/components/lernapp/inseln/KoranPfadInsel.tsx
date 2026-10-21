'use client';

import { BookOpen, Volume2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { formatiere, type Ziffern } from '@/lib/lernapp/format';
import type { Oberflaeche, Stufe } from '@/lib/lernapp/kurse';
import { type BedeutungsSprache, type KoranPaket, type KoranVerzeichnis, type KoranVerzeichnisEinheit, type KoranWortZeit } from '@/lib/lernapp/koran/typen';
import { ladeKoranPaket, ladeKoranVerzeichnis } from '@/lib/lernapp/lokal/koran';
import { einstellungsSpeicher } from '@/lib/lernapp/oberflaeche/einstellungen';

export type KoranPfadTexte = {
  laedt: string;
  leer: string;
  einheit: string;
  wortformen: string;
  bedeutungen: string;
  zeigen: string;
  laedtEinheit: string;
  nichtGeladen: string;
  liste: string;
  stelle: string;
  bedeutungFolgt: string;
  anhoeren: string;
  lektionen: string;
  lektion: string;
  uebungenFolgen: string;
  quellen: string;
};

type Zustand = { art: 'laedt' } | { art: 'leer' } | { art: 'bereit'; v: KoranVerzeichnis };

/**
 * Koran-Arabisch-Pfad (L6-05, PLAN §5.3, ADR 0040 Nr. 5): Stufen → Einheiten; je Einheit die Wortformen in der Koranschrift
 * (aus den gepinnten Koran-Daten, `lang="ar"`, `dir="rtl"`) mit Stelle und Bedeutung – die Bedeutung nur mit zwei Freigaben,
 * sonst „Bedeutung folgt“. Übungen (`koran_wort`) gibt es erst, wenn alle Bedeutungen einer Lektion freigegeben sind. Hören nur
 * aus geprüften Wortzeiten aktiver Rezitationen, nie eine Computerstimme (KERN 4.0 §4). Links sind einfache `<a>`.
 */
export function KoranPfadInsel({
  ui,
  sprache,
  adresse,
  stufen,
  texte,
}: {
  ui: Oberflaeche;
  sprache: BedeutungsSprache;
  /** Adresse des Kurses (`/lern-app/<ui>/koran`) */
  adresse: string;
  stufen: Record<Stufe, string>;
  texte: KoranPfadTexte;
}) {
  const [z, setZ] = useState<Zustand>({ art: 'laedt' });
  const [ziffern, setZiffern] = useState<Ziffern>('oestlich');

  useEffect(() => {
    let aktiv = true;
    void ladeKoranVerzeichnis(sprache).then((v) => aktiv && setZ(v && v.einheiten.length ? { art: 'bereit', v } : { art: 'leer' }));
    void einstellungsSpeicher(ui)
      .laden()
      .then((e) => aktiv && setZiffern(e.ziffern))
      .catch(() => undefined);
    return () => {
      aktiv = false;
    };
  }, [sprache, ui]);

  if (z.art === 'laedt') return <p className="text-18 text-tinte-2">{texte.laedt}</p>;
  if (z.art === 'leer') return <p className="text-18 text-tinte-2">{texte.leer}</p>;

  const f = (vorlage: string, werte: Record<string, number | string>) => formatiere(vorlage, werte, ui, ziffern);
  const abschnitte = [...new Set(z.v.einheiten.map((e) => e.stufe))].map((stufe) => ({
    stufe,
    einheiten: z.v.einheiten.filter((e) => e.stufe === stufe),
  }));

  return (
    <div className="flex flex-col gap-8">
      {abschnitte.map((a) => (
        <section key={a.stufe} aria-labelledby={`koran-${a.stufe}`} className="flex flex-col gap-4">
          <h3 id={`koran-${a.stufe}`} className="text-30">
            {stufen[a.stufe]}
          </h3>
          <ol className="flex flex-col gap-3">
            {a.einheiten.map((e) => (
              <li key={e.schluessel}>
                <KoranEinheit e={e} sprache={sprache} adresse={adresse} texte={texte} f={f} />
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}

type Format = (vorlage: string, werte: Record<string, number | string>) => string;

function KoranEinheit({
  e,
  sprache,
  adresse,
  texte,
  f,
}: {
  e: KoranVerzeichnisEinheit;
  sprache: BedeutungsSprache;
  adresse: string;
  texte: KoranPfadTexte;
  f: Format;
}) {
  const [paket, setPaket] = useState<'zu' | 'laedt' | 'fehlt' | KoranPaket>('zu');
  const thema = e.thema[sprache] ?? e.thema.de ?? e.schluessel;

  function oeffnen(offen: boolean) {
    if (!offen || paket !== 'zu') return;
    setPaket('laedt');
    void ladeKoranPaket(sprache, e).then((p) => setPaket(p ?? 'fehlt'));
  }

  return (
    <details
      className="rounded-lg border border-linie bg-weiss open:border-gruen-700"
      onToggle={(ev) => oeffnen(ev.currentTarget.open)}
      data-einheit={e.schluessel}
    >
      <summary className="flex min-h-11 cursor-pointer flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3 focus-visible:outline-2 focus-visible:outline-gruen-950">
        <span className="text-20 font-bold">
          {f(texte.einheit, { n: e.reihenfolge })}: {thema}
        </span>
        <span className="text-16 text-tinte-2">
          {f(texte.wortformen, { n: e.woerter })} · {f(texte.bedeutungen, { n: e.bedeutungen, gesamt: e.woerter })}
        </span>
      </summary>
      <div className="flex flex-col gap-4 border-t border-linie px-5 py-4">
        {paket === 'zu' || paket === 'laedt' ? (
          <p className="text-16 text-tinte-2">{texte.laedtEinheit}</p>
        ) : paket === 'fehlt' ? (
          <p className="text-16 text-tinte-2">{texte.nichtGeladen}</p>
        ) : (
          <>
            <h4 className="text-18 font-bold">{texte.liste}</h4>
            <ol className="flex flex-col divide-y divide-linie">
              {paket.woerter.map((w) => (
                <li key={w.stelle} className="flex flex-wrap items-center gap-x-6 gap-y-2 py-3" data-stelle={w.stelle}>
                  {w.text ? (
                    <span lang="ar" dir="rtl" className="min-w-24 font-quran text-arabisch-2">
                      {w.text}
                    </span>
                  ) : null}
                  <span className="text-16 text-tinte-2">{f(texte.stelle, { stelle: w.stelle })}</span>
                  <span className={w.bedeutung ? 'text-18' : 'text-18 text-tinte-2 italic'} data-bedeutung={w.bedeutung ? 'ja' : 'folgt'}>
                    {w.bedeutung ?? texte.bedeutungFolgt}
                  </span>
                  {w.zeit && w.text ? <Anhoeren zeit={w.zeit} text={texte.anhoeren} /> : null}
                </li>
              ))}
            </ol>
            <h4 className="text-18 font-bold">{texte.lektionen}</h4>
            {paket.lektionen.length ? (
              <ul className="flex flex-wrap gap-3">
                {paket.lektionen.map((l, i) => (
                  <li key={l.schluessel}>
                    <a
                      href={`${adresse}/ueben?l=${encodeURIComponent(l.schluessel)}`}
                      className="inline-flex min-h-11 items-center gap-2 rounded-md border border-gruen-700 px-4 font-bold text-gruen-800 no-underline hover:bg-gruen-50"
                    >
                      <BookOpen aria-hidden className="size-5" />
                      {f(texte.lektion, { n: i + 1 })}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-16 text-tinte-2">{texte.uebungenFolgen}</p>
            )}
            <p className="text-16 text-tinte-2">
              {texte.quellen} {paket.quellen.join(' · ')}
            </p>
          </>
        )}
      </div>
    </details>
  );
}

/** Wort aus einer geprüften Rezitation abspielen (Ausschnitt nach Wortzeiten); nie eine Computerstimme. */
function Anhoeren({ zeit, text }: { zeit: KoranWortZeit; text: string }) {
  const laeuft = useRef<HTMLAudioElement | null>(null);
  function spiele() {
    laeuft.current?.pause();
    const a = new Audio(zeit.adresse);
    laeuft.current = a;
    const ende = () => {
      if (a.currentTime * 1000 >= zeit.endeMs) {
        a.pause();
        a.removeEventListener('timeupdate', ende);
      }
    };
    a.addEventListener(
      'loadedmetadata',
      () => {
        a.currentTime = zeit.startMs / 1000;
        a.addEventListener('timeupdate', ende);
        void a.play().catch(() => undefined);
      },
      { once: true },
    );
    a.load();
  }
  return (
    <button
      type="button"
      onClick={spiele}
      className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-md px-3 text-gruen-800 hover:bg-gruen-50 focus-visible:outline-2 focus-visible:outline-gruen-950"
    >
      <Volume2 aria-hidden className="size-5" />
      <span className="sr-only">{text}</span>
    </button>
  );
}
