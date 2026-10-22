'use client';

import { Check, ChevronDown, Lightbulb } from 'lucide-react';
import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { abgeschlosseneStufen } from '@/lib/lernapp/ereignisse/stufen';
import { formatiere, zahl, type Ziffern } from '@/lib/lernapp/format';
import { richtung, type KursSlug, type Oberflaeche, type Stufe } from '@/lib/lernapp/kurse';
import { profilBereich, type PaketEintrag } from '@/lib/lernapp/lokal/db';
import { ladePaketKopf, ladeVerzeichnis, type PaketKopf, paketKopfImVorrat, raeumeAuf, speichereOffline } from '@/lib/lernapp/lokal/vorrat';
import { beimOeffnen } from '@/lib/lernapp/oberflaeche/abgleich';
import { einstellungsSpeicher } from '@/lib/lernapp/oberflaeche/einstellungen';
import { STAND_GEAENDERT, speicher, vorhandenesProfil } from '@/lib/lernapp/oberflaeche/geraet';
import { type Abschnitt, abschnitte, aktuelleUndNaechste, type Station, themaVon } from '@/lib/lernapp/oberflaeche/kursverzeichnis';
import type { Verzeichnis, VerzeichnisEinheit } from '@/lib/lernapp/paket/typen';
import type de from '../../../../messages/lernapp/de.json';
import { LektionsArtMarke } from '../LektionsArtMarke';
import { OfflineEinheit, type OfflineTexte } from '../OfflineEinheit';
import { LernStern } from '../Zeichen';

export type LernpfadTexte = OfflineTexte & {
  leer: string;
  laedt: string;
  stufe: Record<Stufe, string>;
  einheit: string;
  fortschritt: string;
  lektion: string;
  geschafft: string;
  aktuell: string;
  lektionenZeigen: string;
  nichtGeladen: string;
  tipps: string;
  ungeprueft: string;
};

/** Texte zu abgeschlossenen Stufen und Lektionsarten (Namensraum `ansichten.stufen`, L4-03). */
export type StufenTexte = (typeof de)['ansichten']['stufen'];

type Zustand =
  | { art: 'laedt' }
  | { art: 'leer' }
  | {
      art: 'bereit';
      v: Verzeichnis;
      abschnitte: Abschnitt[];
      offline: Map<string, PaketEintrag>;
      /** in diesem Kurs abgeschlossene Stufen (alle Prüfsteine der Stufe geschafft, `stufen.ts`) */
      fertig: ReadonlySet<string>;
    };

/**
 * Lernpfad eines Kurses (PLAN §3.1, B-24, ADR 0039 Nr. 12): Abschnitte (Stufen) → Einheiten als Stationen an der Linie →
 * Lektionen. Daten aus dem Kursverzeichnis (Netz zuerst, ohne Netz der Vorrat) und den Paketen auf dem Gerät; geschaffte
 * Lektionen aus der lokalen Datenbank. Die aktuelle und die nächste Einheit werden automatisch gespeichert; jede Einheit
 * lässt sich bewusst offline speichern (Ring nach Bytes, B-27). Links sind einfache `<a>` (eigenes Dokument je Übung).
 * Eine Stufe, deren Prüfsteine in diesem Kurs alle geschafft sind, trägt „Stufe abgeschlossen“ (ADR 0043 Nr. 5, kein
 * Zertifikat); Geschichten und Prüfsteine sind in der Liste der Lektionen als solche benannt (L4-03).
 */
export function LernpfadInsel({
  ui,
  kurs,
  adresse,
  texte,
  stufenTexte,
}: {
  ui: Oberflaeche;
  kurs: KursSlug;
  /** Adresse des Lernpfads (`/lern-app/<ui>/<kurs>`) */
  adresse: string;
  texte: LernpfadTexte;
  stufenTexte: StufenTexte;
}) {
  const [z, setZ] = useState<Zustand>({ art: 'laedt' });
  const [ziffern, setZiffern] = useState<Ziffern>('oestlich');
  const [fehlt, setFehlt] = useState<ReadonlySet<string>>(new Set());
  const pakete = useRef(new Map<string, PaketKopf>());

  useEffect(() => {
    let aktiv = true;
    async function laden() {
      const v = await ladeVerzeichnis(kurs);
      if (!v || v.kurs !== kurs || !v.einheiten.length) {
        if (aktiv) setZ({ art: 'leer' });
        return;
      }
      const sp = await speicher();
      // Alte Fassungen verlassen Vorrat und Speicher; offline gespeicherte Einheiten kommen in der neuen Fassung wieder
      const neuLaden = await raeumeAuf(sp, v).catch((): VerzeichnisEinheit[] => []);
      if (neuLaden.length)
        void speichereOffline(sp, kurs, neuLaden, { nachladen: true })
          .then(() => aktiv && window.dispatchEvent(new Event(STAND_GEAENDERT)))
          .catch(() => undefined);
      const { profil } = await vorhandenesProfil();
      const geschafft = profil ? await sp.alle('lektionen', profilBereich(profil.id)) : [];
      const erledigt = new Set(geschafft.map((l) => l.lektion));
      const fertig = new Set<string>(abgeschlosseneStufen(geschafft).get(kurs) ?? []);
      // Pakete auf dem Gerät (ohne Netz), dann die aktuelle und die nächste Einheit automatisch (ADR 0039 Nr. 12)
      await Promise.all(
        v.einheiten.map(async (e) => {
          if (pakete.current.get(e.schluessel)?.einheit.schluessel === e.schluessel) return;
          const p = await paketKopfImVorrat(kurs, e);
          if (p) pakete.current.set(e.schluessel, p);
        }),
      );
      for (const e of aktuelleUndNaechste(v, erledigt))
        if (!pakete.current.has(e.schluessel)) {
          const p = await ladePaketKopf(sp, kurs, e);
          if (p) pakete.current.set(e.schluessel, p);
        }
      const offline = new Map((await sp.alle('pakete', [[kurs], [kurs, []]])).map((e) => [e.einheit, e]));
      if (aktiv) setZ({ art: 'bereit', v, abschnitte: abschnitte(v, erledigt, pakete.current), offline, fertig });
    }
    const neu = () => void laden().catch(() => aktiv && setZ((alt) => (alt.art === 'laedt' ? { art: 'leer' } : alt)));
    neu();
    void einstellungsSpeicher(ui)
      .laden()
      .then((e) => aktiv && setZiffern(e.ziffern));
    void beimOeffnen().catch(() => undefined);
    window.addEventListener(STAND_GEAENDERT, neu);
    return () => {
      aktiv = false;
      window.removeEventListener(STAND_GEAENDERT, neu);
    };
  }, [kurs, ui]);

  if (z.art === 'laedt') return <p className="text-18 text-tinte-2">{texte.laedt}</p>;
  if (z.art === 'leer') return <p className="text-18 text-tinte-2">{texte.leer}</p>;

  const f = (vorlage: string, werte: Record<string, number>) => formatiere(vorlage, werte, ui, ziffern);
  const gesamt = z.abschnitte.reduce((n, a) => n + a.stationen.length, 0);

  async function zeigeLektionen(s: Station) {
    const sp = await speicher();
    const p = await ladePaketKopf(sp, kurs, s.einheit);
    if (p) {
      pakete.current.set(s.einheit.schluessel, p);
      window.dispatchEvent(new Event(STAND_GEAENDERT));
    } else setFehlt((alt) => new Set([...alt, s.einheit.schluessel]));
  }

  return (
    <div className="flex flex-col gap-8">
      {z.abschnitte.map((a) => (
        <section key={a.stufe} aria-labelledby={`stufe-${a.stufe}`} className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <h3 id={`stufe-${a.stufe}`} className="text-30">
              {texte.stufe[a.stufe]}
            </h3>
            {z.fertig.has(a.stufe) ? (
              <p
                data-stufe-abgeschlossen={a.stufe}
                className="inline-flex items-center gap-2 rounded-pill bg-gruen-50 px-3 py-1 text-16 font-bold text-gruen-800"
              >
                <LernStern className="size-5 shrink-0 text-gruen-700" />
                {stufenTexte.abgeschlossen}
              </p>
            ) : null}
          </div>
          <ol className="relative flex flex-col" style={{ '--n': Math.max(1, gesamt - 1) } as CSSProperties}>
            {a.stationen.map((s, i) => {
              const thema = themaVon(s.einheit, ui, z.v.ausgangssprache);
              const eintrag = z.offline.get(s.einheit.schluessel);
              const kennung = f(texte.einheit, { n: s.nummer });
              return (
                <li key={s.einheit.schluessel} className="flex gap-4 md:gap-5" style={{ '--i': s.nummer - 1 } as CSSProperties}>
                  <div aria-hidden className="flex shrink-0 flex-col items-center pt-2">
                    <span className="lernweg-station relative flex size-14 items-center justify-center text-gruen-700">
                      <LernStern viewBox="3.5 3.5 17 17" className="absolute inset-0 size-full" />
                      <span className="relative text-18 font-bold text-weiss">{zahl(s.nummer, ui, ziffern)}</span>
                    </span>
                    {i < a.stationen.length - 1 ? (
                      <span
                        className="lernweg-abschnitt -mb-2 min-h-6 w-0.5 flex-1 bg-gruen-700"
                        style={{ '--i': s.nummer - 1 } as CSSProperties}
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1 pb-6">
                    <section
                      aria-labelledby={`einheit-${s.nummer}`}
                      className={`flex flex-col gap-3 rounded-lg border bg-weiss p-5 shadow-s1 ${s.aktuell ? 'border-gruen-700' : 'border-linie'}`}
                    >
                      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-16 font-bold text-gruen-800">
                        <span>{kennung}</span>
                        {s.aktuell ? <span className="rounded-pill bg-gruen-50 px-3 py-0.5">{texte.aktuell}</span> : null}
                      </p>
                      <h4 id={`einheit-${s.nummer}`} className="text-24 leading-ueberschrift">
                        {thema ? (
                          <span lang={thema.sprache} dir={richtung(thema.sprache)}>
                            {thema.text}
                          </span>
                        ) : (
                          kennung
                        )}
                      </h4>
                      <p className="text-16 text-tinte-2">{f(texte.fortschritt, { erledigt: s.erledigt, gesamt: s.einheit.lektionen })}</p>
                      {s.einheit.hinweis ? <p className="text-16 text-tinte-2">{texte.ungeprueft}</p> : null}
                      {s.lektionen ? (
                        <ul className="flex flex-col gap-1">
                          {s.lektionen.map((l, n) => (
                            <li key={l.schluessel}>
                              <a
                                href={`${adresse}/ueben?l=${encodeURIComponent(l.schluessel)}`}
                                className="inline-flex min-h-11 items-center gap-2 font-bold underline-offset-4 hover:underline"
                              >
                                {l.erledigt ? (
                                  <Check aria-hidden className="size-5 shrink-0 text-gruen-700" />
                                ) : (
                                  <LernStern linie className="size-5 shrink-0 text-gruen-700" />
                                )}
                                {l.titel ? (
                                  <span
                                    lang={z.v.ausgangssprache ?? undefined}
                                    dir={z.v.ausgangssprache ? richtung(z.v.ausgangssprache) : undefined}
                                  >
                                    {l.titel}
                                  </span>
                                ) : (
                                  f(texte.lektion, { n: n + 1 })
                                )}
                                <LektionsArtMarke art={l.art} texte={stufenTexte.art} />
                                {l.erledigt ? <span className="sr-only">({texte.geschafft})</span> : null}
                              </a>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="flex flex-col items-start gap-1">
                          <button
                            type="button"
                            onClick={() => void zeigeLektionen(s)}
                            className="inline-flex min-h-11 items-center gap-2 font-bold underline-offset-4 hover:underline"
                          >
                            <ChevronDown aria-hidden className="size-5" />
                            {texte.lektionenZeigen}
                          </button>
                          {fehlt.has(s.einheit.schluessel) ? (
                            <p role="status" className="text-16 text-tinte-2">
                              {texte.nichtGeladen}
                            </p>
                          ) : null}
                        </div>
                      )}
                      {s.tipps ? (
                        <a
                          href={`${adresse}/tipps?e=${encodeURIComponent(s.einheit.schluessel)}`}
                          className="inline-flex min-h-11 items-center gap-2 self-start font-bold underline-offset-4 hover:underline"
                        >
                          <Lightbulb aria-hidden className="size-5 text-gruen-700" />
                          {texte.tipps}
                        </a>
                      ) : null}
                      <OfflineEinheit
                        ui={ui}
                        ziffern={ziffern}
                        kurs={kurs}
                        einheit={s.einheit}
                        gespeichert={Boolean(eintrag?.offline && eintrag.hash === s.einheit.hash)}
                        texte={texte}
                      />
                    </section>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
