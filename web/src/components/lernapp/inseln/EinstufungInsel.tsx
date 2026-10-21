'use client';

import { lazy, type ReactNode, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { type EinstufungsErgebnis, einheitenFuer, einstufungsEreignis, kandidatenAus, stufenAus } from '@/lib/lernapp/engine/einstufung';
import { formatiere, type Ziffern } from '@/lib/lernapp/format';
import { type KursSlug, type Oberflaeche, richtung, type Sprache, type Stufe } from '@/lib/lernapp/kurse';
import { ladePaketKopf, ladeVerzeichnis } from '@/lib/lernapp/lokal/vorrat';
import { beimOeffnen, nachHandlung } from '@/lib/lernapp/oberflaeche/abgleich';
import { einstellungsSpeicher } from '@/lib/lernapp/oberflaeche/einstellungen';
import { geraet, heute, meldeStand, merkeWeiter } from '@/lib/lernapp/oberflaeche/geraet';
import { themaVon } from '@/lib/lernapp/oberflaeche/kursverzeichnis';
import type { Verzeichnis } from '@/lib/lernapp/paket/typen';
import type { EinstufungTexte, KandidatenQuelle } from '../Einstufung';
import { type SpielerTexte, STANDARD_OPTIONEN } from '../typen';
import { SpielerGrenze } from './UebenInsel';

/** Der Test als eigener Chunk (KERN 4.0 §9): erst nach „Test beginnen“. */
const ladeTest = () => import('../Einstufung');
const Einstufung = lazy(() => ladeTest().then((m) => ({ default: m.Einstufung })));
/** Volle Prüfung der Pakete (Zod) und der Ausgang der Ereignisse – erst, wenn der Test läuft bzw. endet. */
const ladePakete = () => import('@/lib/lernapp/lokal/pakete');
const ladeAusgang = () => import('@/lib/lernapp/lokal/ausgang');

type Zustand =
  | { art: 'laedt' }
  | { art: 'bald' }
  | { art: 'bereit'; v: Verzeichnis; ziffern: Ziffern; hoeren: boolean }
  | { art: 'laeuft'; v: Verzeichnis; ziffern: Ziffern; hoeren: boolean };

type Einstieg = { lektion: string | null; einheitNr: number; thema: { text: string; sprache: Sprache } | null };

/**
 * Einstufungstest (PLAN §3.1, ADR 0043 Nr. 6: rund 20 Aufgaben, adaptiv, lokal). Die statische Hülle zeigt den Hinweis
 * „ohne Zeitgrenze, ohne Wertung“; erst „Test beginnen“ lädt den Test, die Pakete der jeweils nötigen Stufe (Vorrat zuerst,
 * Zod-Prüfung) und die Übungs-Chunks. Am Ende entsteht das Ereignis `einstufung` (ADR 0038) – erst dann wird auf einem
 * neuen Gerät ein Profil angelegt –, „Weiter lernen“ zeigt auf die erste Lektion der vorgeschlagenen Einheit, und mit
 * gebundenem Konto wird abgeglichen. Für Wissen und Koran (eigene Stufen, noch ohne Pakete) gilt „wird vorbereitet“.
 */
export function EinstufungInsel({
  ui,
  kurs,
  adresse,
  texte,
  spielerTexte,
  stufenNamen,
  einheitText,
  lernpfad,
}: {
  ui: Oberflaeche;
  kurs: KursSlug;
  /** Adresse des Lernpfads dieses Kurses */
  adresse: string;
  texte: EinstufungTexte;
  spielerTexte: SpielerTexte;
  stufenNamen: Record<Stufe, string>;
  /** „Einheit {n, number}“ */
  einheitText: string;
  lernpfad: { adresse: string; text: string };
}) {
  const [z, setZ] = useState<Zustand>({ art: 'laedt' });
  const [einstieg, setEinstieg] = useState<Einstieg | null>(null);
  const [gesichert, setGesichert] = useState(false);
  const hoeren = useRef(true);

  useEffect(() => {
    let aktiv = true;
    Promise.all([ladeVerzeichnis(kurs), einstellungsSpeicher(ui).laden()])
      .then(([v, e]) => {
        if (!aktiv) return;
        hoeren.current = e.hoeren;
        setZ(v && v.kurs === kurs && v.einheiten.length ? { art: 'bereit', v, ziffern: e.ziffern, hoeren: e.hoeren } : { art: 'bald' });
      })
      .catch(() => aktiv && setZ({ art: 'bald' }));
    void beimOeffnen().catch(() => undefined);
    return () => {
      aktiv = false;
    };
  }, [kurs, ui]);

  const v = z.art === 'bereit' || z.art === 'laeuft' ? z.v : null;

  // Aufgaben einer Stufe: erste und letzte Einheit der Stufe, Pakete geprüft (Zod) aus dem Vorrat bzw. dem Netz
  const ladeKandidaten: KandidatenQuelle = useCallback(
    async (stufe) => {
      if (!v) return { kandidaten: [], lexikon: [] };
      const [{ ladePaket }, { sp }] = await Promise.all([ladePakete(), geraet(ui)]);
      const kandidaten = [];
      const lexikon: string[] = [];
      for (const e of einheitenFuer(v.einheiten, stufe)) {
        const p = await ladePaket(sp, kurs, e);
        if (!p) continue;
        kandidaten.push(...kandidatenAus(e, p.lektionen, { hoeren: hoeren.current }));
        lexikon.push(...p.lektionen.flatMap((l) => l.lexikon ?? []));
      }
      return { kandidaten, lexikon };
    },
    [v, kurs, ui],
  );

  // Ergebnis speichern: Ereignis `einstufung`, Ableitung, „Weiter lernen“ auf die vorgeschlagene Einheit, Abgleich
  const fertig = useCallback(
    async (e: EinstufungsErgebnis | null) => {
      if (!v || !e) {
        setGesichert(true);
        return;
      }
      const nr = v.einheiten.findIndex((x) => x.schluessel === e.einheit);
      const verweis = nr >= 0 ? v.einheiten[nr] : undefined;
      const [{ sp, profil }, { haengeAn }] = await Promise.all([geraet(ui), ladeAusgang()]);
      const ereignis = einstufungsEreignis(kurs, e);
      if (ereignis) await haengeAn(sp, profil, ereignis);
      const kopf = verweis ? await ladePaketKopf(sp, kurs, verweis).catch(() => null) : null;
      const erste = kopf?.lektionen[0];
      if (erste) await merkeWeiter(sp, profil.id, { kurs, lektion: erste.schluessel, ...(erste.titel ? { titel: erste.titel } : {}) });
      const { leiteNeuAb } = await import('@/lib/lernapp/lokal/ableitung');
      await leiteNeuAb(sp, profil.id, heute());
      setEinstieg({
        lektion: erste?.schluessel ?? null,
        einheitNr: nr + 1,
        thema: verweis ? themaVon(verweis, ui, v.ausgangssprache) : null,
      });
      meldeStand();
      setGesichert(true);
      void nachHandlung().catch(() => undefined);
    },
    [v, kurs, ui],
  );

  const zurueck = (
    <a href={lernpfad.adresse} className="inline-flex min-h-11 items-center font-bold underline-offset-4 hover:underline">
      {lernpfad.text}
    </a>
  );
  const kasten = (inhalt: ReactNode) => (
    <div className="flex flex-col items-start gap-4 rounded-lg border border-linie bg-weiss p-5 md:p-8">{inhalt}</div>
  );
  if (z.art === 'laedt') return kasten(<p className="text-18 text-tinte-2">{texte.laedt}</p>);
  if (z.art === 'bald')
    return kasten(
      <>
        <p className="text-18 text-tinte-2">{texte.bald}</p>
        {zurueck}
      </>,
    );
  if (z.art === 'bereit')
    return kasten(
      <>
        <p className="text-18">{texte.hinweis}</p>
        <button
          type="button"
          onClick={() => {
            void ladeTest().catch(() => undefined);
            setZ({ ...z, art: 'laeuft' });
          }}
          className="min-h-12 druck self-start rounded-pill bg-gruen-700 px-8 font-bold text-weiss hover:bg-gruen-800"
        >
          {texte.start}
        </button>
      </>,
    );

  const f = (vorlage: string, werte: Record<string, string | number>) => formatiere(vorlage, werte, ui, z.ziffern);
  const ergebnisAnsicht = (e: EinstufungsErgebnis | null) => (
    <>
      {e ? (
        <>
          <p className="text-20">{f(texte.ergebnisStufe, { stufe: stufenNamen[e.stufe] })}</p>
          {einstieg && einstieg.einheitNr > 0 ? (
            <p className="text-18">
              {f(einheitText, { n: einstieg.einheitNr })}
              {einstieg.thema ? (
                <>
                  {': '}
                  <bdi lang={einstieg.thema.sprache} dir={richtung(einstieg.thema.sprache)}>
                    {einstieg.thema.text}
                  </bdi>
                </>
              ) : null}
            </p>
          ) : null}
          <p className="text-18 text-tinte-2">{f(texte.ergebnisText, { richtig: e.richtig, gesamt: e.gesamt })}</p>
          {gesichert ? <p className="text-16 text-tinte-2">{texte.gespeichert}</p> : null}
        </>
      ) : (
        <p className="text-18 text-tinte-2">{texte.bald}</p>
      )}
      {gesichert ? (
        <div className="flex flex-wrap items-center gap-4">
          {einstieg?.lektion ? (
            <a
              href={`${adresse}/ueben?l=${encodeURIComponent(einstieg.lektion)}`}
              className="inline-flex min-h-12 druck items-center rounded-pill bg-gruen-700 px-8 font-bold text-weiss no-underline hover:bg-gruen-800 hover:text-weiss"
            >
              {texte.einsteigen}
            </a>
          ) : null}
          {zurueck}
        </div>
      ) : null}
    </>
  );

  return (
    <SpielerGrenze ersatz={kasten(<p className="text-18">{texte.nichtVerfuegbar}</p>)}>
      <Suspense fallback={<p className="text-18 text-tinte-2">{texte.laedt}</p>}>
        <Einstufung
          kurs={kurs}
          stufen={stufenAus(z.v.einheiten)}
          einheiten={z.v.einheiten}
          zielsprache={z.v.zielsprache}
          ladeKandidaten={ladeKandidaten}
          texte={texte}
          spielerTexte={spielerTexte}
          sprache={ui}
          ziffern={z.ziffern}
          optionen={{ ...STANDARD_OPTIONEN, hoeren: z.hoeren }}
          onFertig={(e) => void fertig(e).catch(() => setGesichert(true))}
          ergebnisAnsicht={ergebnisAnsicht}
        />
      </Suspense>
    </SpielerGrenze>
  );
}
