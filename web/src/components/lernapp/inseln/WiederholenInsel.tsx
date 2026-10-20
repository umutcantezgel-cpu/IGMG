'use client';

import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import type { Lektion } from '@/lib/lernapp/aufgaben/schema';
import { waehleKarten } from '@/lib/lernapp/engine/kartenwahl';
import type { EreignisEntwurf } from '@/lib/lernapp/ereignisse/typen';
import type { Ziffern } from '@/lib/lernapp/format';
import type { KursSlug, Oberflaeche } from '@/lib/lernapp/kurse';
import { haengeAn } from '@/lib/lernapp/lokal/ausgang';
import { type Profil, profilBereich, type Speicher } from '@/lib/lernapp/lokal/db';
import { ladePaket, ladeVerzeichnis } from '@/lib/lernapp/lokal/pakete';
import { beimOeffnen, nachHandlung } from '@/lib/lernapp/oberflaeche/abgleich';
import { einstellungsSpeicher } from '@/lib/lernapp/oberflaeche/einstellungen';
import { frischAbgeleitet, heute, meldeStand, vorhandenesProfil } from '@/lib/lernapp/oberflaeche/geraet';
import { baueWiederholung, einheitDerKarte } from '@/lib/lernapp/oberflaeche/wiederholung';
import type { Paket } from '@/lib/lernapp/paket/typen';
import type { SpielerTexte } from '../typen';
import { SpielerGrenze } from './UebenInsel';

const Spieler = lazy(() => import('../Spieler').then((m) => ({ default: m.Spieler })));

export type WiederholenTexte = { leer: string; laedt: string; nichtVerfuegbar: string };

type Zustand =
  | { art: 'laedt' }
  | { art: 'leer' }
  | { art: 'fehlt' }
  | { art: 'bereit'; sp: Speicher; profil: Profil; lektion: Lektion; ziffern: Ziffern; hoeren: boolean };

/**
 * Wiederholen (PLAN §3.1, §4; ADR 0038 Nr. 3): Kartenwahl aus dem lokalen Stand des Kurses (fällige zuerst, dann schwache;
 * `waehleKarten`), Aufgaben dazu aus den Einheitenpaketen (`baueWiederholung`), gespielt mit dem Spieler als Lektion der Art
 * `wiederholung` (XP: 1 je 2 Karten). Ohne Karten ein freundlicher Leerzustand, ohne Druck.
 */
export function WiederholenInsel({
  ui,
  kurs,
  texte,
  spielerTexte,
  lernpfad,
}: {
  ui: Oberflaeche;
  kurs: KursSlug;
  texte: WiederholenTexte;
  spielerTexte: SpielerTexte;
  lernpfad: { adresse: string; text: string };
}) {
  const [z, setZ] = useState<Zustand>({ art: 'laedt' });
  const kette = useRef<Promise<unknown>>(Promise.resolve());
  // „Zum Lernpfad“ erst, wenn Ereignisse und Ableitung gespeichert sind (sonst ginge ein sofortiger Wechsel verloren)
  const [gesichert, setGesichert] = useState(false);

  useEffect(() => {
    let aktiv = true;
    async function laden(): Promise<Zustand> {
      const { sp, profil } = await vorhandenesProfil();
      if (!profil) return { art: 'leer' };
      const p = await frischAbgeleitet(sp, profil);
      const karten = (await sp.alle('karten', profilBereich(p.id))).filter((k) => k.karte.startsWith(`${kurs}:`));
      const gewaehlt = waehleKarten(karten, { jetzt: new Date() });
      if (!gewaehlt.length) return { art: 'leer' };
      const v = await ladeVerzeichnis(kurs);
      const noetig = new Set(gewaehlt.map((k) => einheitDerKarte(k.karte)));
      const pakete: Paket[] = [];
      for (const e of v?.kurs === kurs ? v.einheiten : []) {
        if (!noetig.has(e.schluessel)) continue;
        const paket = await ladePaket(sp, kurs, e);
        if (paket) pakete.push(paket);
      }
      const lektion = baueWiederholung(kurs, gewaehlt, pakete);
      if (!lektion) return { art: 'fehlt' };
      const e = await einstellungsSpeicher(ui).laden();
      return { art: 'bereit', sp, profil: p, lektion, ziffern: e.ziffern, hoeren: e.hoeren };
    }
    void laden()
      .catch((): Zustand => ({ art: 'fehlt' }))
      .then((neu) => aktiv && setZ(neu));
    void beimOeffnen().catch(() => undefined);
    return () => {
      aktiv = false;
    };
  }, [kurs, ui]);

  const zurueck = (
    <a href={lernpfad.adresse} className="inline-flex min-h-11 items-center font-bold underline-offset-4 hover:underline">
      {lernpfad.text}
    </a>
  );
  const kasten = (text: string, mitZurueck: boolean) => (
    <div className="flex flex-col items-start gap-4 rounded-lg border border-linie bg-weiss p-5 md:p-8">
      <p className="text-18 text-tinte-2">{text}</p>
      {mitZurueck ? zurueck : null}
    </div>
  );
  if (z.art === 'laedt') return kasten(texte.laedt, false);
  if (z.art === 'leer') return kasten(texte.leer, true);
  if (z.art === 'fehlt') return kasten(texte.nichtVerfuegbar, true);

  const { sp, profil, lektion } = z;
  const melde = (e: EreignisEntwurf) => {
    kette.current = kette.current.then(() => haengeAn(sp, profil, e)).catch(() => undefined);
  };
  const fertig = async () => {
    await kette.current;
    // Ableitung mit FSRS erst jetzt laden (eigener Chunk, KERN 4.0 §9)
    const { leiteNeuAb } = await import('@/lib/lernapp/lokal/ableitung');
    await leiteNeuAb(sp, profil.id, heute());
    meldeStand();
    setGesichert(true);
    void nachHandlung().catch(() => undefined);
  };
  return (
    <SpielerGrenze ersatz={kasten(texte.nichtVerfuegbar, true)}>
      <Suspense fallback={<p className="text-18 text-tinte-2">{texte.laedt}</p>}>
        <Spieler
          lektion={lektion}
          texte={spielerTexte}
          sprache={ui}
          ziffern={z.ziffern}
          hoeren={z.hoeren}
          onEreignis={melde}
          onFertig={() => void fertig().catch(() => setGesichert(true))}
          zurueckHref={gesichert ? lernpfad.adresse : undefined}
        />
      </Suspense>
    </SpielerGrenze>
  );
}
