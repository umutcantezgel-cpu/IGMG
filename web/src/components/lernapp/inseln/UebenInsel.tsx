'use client';

import { useSearchParams } from 'next/navigation';
import { Component, lazy, type ReactNode, startTransition, Suspense, useEffect, useRef, useState } from 'react';
import type { Lektion } from '@/lib/lernapp/aufgaben/schema';
import type { EreignisEntwurf } from '@/lib/lernapp/ereignisse/typen';
import type { Ziffern } from '@/lib/lernapp/format';
import { istRichtung, type KursSlug, type Oberflaeche } from '@/lib/lernapp/kurse';
import type { Profil, Speicher } from '@/lib/lernapp/lokal/db';
import { ladeVerzeichnis, paketKopfImVorrat } from '@/lib/lernapp/lokal/vorrat';
import { beimOeffnen, nachHandlung } from '@/lib/lernapp/oberflaeche/abgleich';
import { einstellungsSpeicher } from '@/lib/lernapp/oberflaeche/einstellungen';
import { geraet, heute, meldeStand, merkeWeiter } from '@/lib/lernapp/oberflaeche/geraet';
import { einheitDerLektion, naechsteEinheit, naechsteLektion } from '@/lib/lernapp/oberflaeche/kursverzeichnis';
import type { AbschlussAnzeige } from '../AbschlussInhalt';
import type { MeldenTexte, SchreibabgabeTexte, SpielerOptionen, SpielerTexte } from '../typen';
import { allesGeschrieben, type EreignisKette, melde, neueKette, useAusgangVorladen } from './ausgang';

/** Spieler als eigener Chunk (KERN 4.0 §9: erst in der Lektion); Übungstypen lädt er selbst per `import()`. */
const ladeSpieler = () => import('../Spieler');
const Spieler = lazy(() => ladeSpieler().then((m) => ({ default: m.Spieler })));
/**
 * Was erst die Lektion braucht – volle Prüfung des Pakets (Zod) – als eigener Chunk, beim Öffnen parallel zu Gerät,
 * Einstellungen und Kursverzeichnis geladen: Die Seite selbst bleibt klein (LCP, TBT). Der Ausgang der Ereignisse kommt
 * erst mit der ersten Handlung (`./ausgang.ts`).
 */
const ladeLektionsteile = () => import('@/lib/lernapp/lokal/pakete');

export type UebenTexte = { laedt: string; ohneLektion: string; nichtVerfuegbar: string };

/**
 * Nach einer Lektion bzw. Wiederholung: Ableitung neu (FSRS erst jetzt, eigener Chunk, KERN 4.0 §9) und – parallel
 * geladen – die Anzeige von Tagesziel, Serie und neuen Abzeichen (eigener Chunk). Fehlt die Anzeige (ohne Netz und ohne
 * Vorrat), bleibt der Abschluss des Spielers ohne sie; die Ableitung ist trotzdem gespeichert.
 */
export async function nachDerLektion(sp: Speicher, profil: string): Promise<AbschlussAnzeige | null> {
  const anzeige = import('../AbschlussInhalt').then(
    (m) => m.AbschlussInhalt,
    () => null,
  );
  const { leiteAbNachLektion } = await import('@/lib/lernapp/lokal/ableitung');
  const stand = await leiteAbNachLektion(sp, profil, heute());
  const Anzeige = await anzeige;
  return Anzeige ? { stand, Anzeige } : null;
}

/** Fängt einen fehlgeschlagenen Abruf des Spieler-Chunks (ohne Netz und ohne Vorrat). */
export class SpielerGrenze extends Component<{ ersatz: ReactNode; children: ReactNode }, { fehler: boolean }> {
  state = { fehler: false };
  static getDerivedStateFromError() {
    return { fehler: true };
  }
  render() {
    return this.state.fehler ? this.props.ersatz : this.props.children;
  }
}

type Bereit = {
  art: 'bereit';
  sp: Speicher;
  profil: Profil;
  lektion: Lektion;
  /** nächste Lektion nach dem Abschluss („Weiter lernen“), sonst `null` */
  folge: () => Promise<Pick<Lektion, 'schluessel' | 'titel'> | null>;
  ziffern: Ziffern;
  /** Einstellungen „Hörübungen aus“ und „Sprechübungen aus“ (KERN 4.0 §8) */
  optionen: Omit<SpielerOptionen, 'spracherkennung'>;
};
type Zustand = { art: 'laedt' } | { art: 'ohne' } | { art: 'fehlt' } | Bereit;

/**
 * Üben (PLAN §3.1, ADR 0038/0039): liest die Lektion aus `?l=` (statische Hülle, `useSearchParams` unter Suspense), sucht ihre
 * Einheit im Kursverzeichnis und lädt das Einheitenpaket (Vorrat zuerst, sonst Netz mit Prüfung des Hashs). Der Spieler meldet
 * Ereignisse; sie landen der Reihe nach im Ausgang (`haengeAn`). Am Ende: Ableitung neu (mit Tagesziel, Serie und neuen
 * Abzeichen für den Abschlussbildschirm, L7-01), „Weiter lernen“ auf die nächste Lektion, Abgleich nur mit gebundenem Konto. Die nächste Einheit wird automatisch gespeichert (ADR 0039 Nr. 12).
 * Koran-Arabisch (L6-05) lädt aus seinem eigenen Verzeichnis je Sprache der Bedeutungen (`ladeKoranLektion`): nur
 * vollständig freigegebene Lektionen `koran_wort`, ohne Audio.
 */
export function UebenInsel({
  ui,
  kurs,
  texte,
  spielerTexte,
  lernpfad,
  spracherkennung = false,
  melden,
  schreibabgabe,
}: {
  ui: Oberflaeche;
  kurs: KursSlug;
  texte: UebenTexte;
  spielerTexte: SpielerTexte;
  lernpfad: { adresse: string; text: string };
  /** Schalter `lernapp_sprechen` (Spracherkennung im Browser) */
  spracherkennung?: boolean;
  /** Texte von „Fehler melden“, nur mit Schalter `lernapp_meldungen` (sonst kein Knopf) */
  melden?: MeldenTexte;
  /** Texte der Schreibabgabe an die Lehrkraft, nur mit Schalter `lernapp_gruppen` (sonst kein Angebot; L5-03) */
  schreibabgabe?: SchreibabgabeTexte;
}) {
  const l = useSearchParams().get('l');
  const [z, setZ] = useState<Zustand>({ art: 'laedt' });
  const kette = useRef<EreignisKette>(neueKette());
  // „Zum Lernpfad“ erst, wenn Ereignisse und Ableitung gespeichert sind (sonst ginge ein sofortiger Wechsel verloren)
  const [gesichert, setGesichert] = useState(false);
  // Tagesziel, Serie und neue Abzeichen für den Abschlussbildschirm (aus der Ableitung nach der Lektion)
  const [abschluss, setAbschluss] = useState<AbschlussAnzeige | null>(null);

  useEffect(() => {
    let aktiv = true;
    async function laden(): Promise<Zustand> {
      if (!l) return { art: 'ohne' };
      void ladeSpieler().catch(() => undefined);
      if (kurs === 'koran') {
        // Koran-Arabisch (L6-05): eigenes Verzeichnis je Sprache der Bedeutungen (in der arabischen Oberfläche gibt es den Kurs nicht)
        if (ui === 'ar') return { art: 'fehlt' };
        const [{ sp, profil }, e, { ladeKoranLektion }] = await Promise.all([
          geraet(ui),
          einstellungsSpeicher(ui).laden(),
          ladeLektionsteile(),
        ]);
        const k = await ladeKoranLektion(ui, l);
        if (!k) return { art: 'fehlt' };
        await merkeWeiter(sp, profil.id, { kurs, lektion: k.lektion.schluessel });
        return {
          art: 'bereit',
          sp,
          profil,
          lektion: k.lektion,
          folge: async () => (k.naechste ? { schluessel: k.naechste } : null),
          ziffern: e.ziffern,
          optionen: { hoeren: e.hoeren, sprechen: e.sprechen },
        };
      }
      const [{ sp, profil }, e, v, { ladePaket }] = await Promise.all([
        geraet(ui),
        einstellungsSpeicher(ui).laden(),
        ladeVerzeichnis(kurs),
        ladeLektionsteile(),
      ]);
      const einheit = v && v.kurs === kurs ? v.einheiten.find((x) => x.schluessel === einheitDerLektion(v, l)) : undefined;
      const paket = v && einheit ? await ladePaket(sp, kurs, einheit) : null;
      const lektion = paket?.lektionen.find((x) => x.schluessel === l);
      if (!v || !einheit || !paket || !lektion) return { art: 'fehlt' };
      await merkeWeiter(sp, profil.id, { kurs, lektion: lektion.schluessel, ...(lektion.titel ? { titel: lektion.titel } : {}) });
      // die nächste Einheit automatisch speichern (nicht abwarten)
      const naechste = naechsteEinheit(v, einheit.schluessel);
      if (naechste) void ladePaket(sp, kurs, naechste).catch(() => null);
      return {
        art: 'bereit',
        sp,
        profil,
        lektion,
        folge: async () => {
          const folgeEinheit = naechsteEinheit(v, paket.einheit.schluessel);
          const folgePaket = folgeEinheit ? await paketKopfImVorrat(kurs, folgeEinheit) : null;
          return naechsteLektion(paket, lektion.schluessel, folgePaket);
        },
        ziffern: e.ziffern,
        optionen: { hoeren: e.hoeren, sprechen: e.sprechen },
      };
    }
    void laden()
      .catch((): Zustand => ({ art: 'fehlt' }))
      // Spieler und erste Aufgabe in Zeitscheiben zeichnen (Übergang): kein langer Block auf dem Hauptfaden (TBT, KERN 4.0 §9)
      .then((neu) => aktiv && startTransition(() => setZ(neu)));
    void beimOeffnen().catch(() => undefined);
    return () => {
      aktiv = false;
    };
  }, [l, kurs, ui]);
  useAusgangVorladen(z.art === 'bereit');

  const zurueck = (
    <a href={lernpfad.adresse} className="inline-flex min-h-11 items-center font-bold underline-offset-4 hover:underline">
      {lernpfad.text}
    </a>
  );
  if (z.art !== 'bereit') {
    const text = z.art === 'laedt' ? texte.laedt : z.art === 'ohne' ? texte.ohneLektion : texte.nichtVerfuegbar;
    return (
      <div className="flex flex-col items-start gap-4 rounded-lg border border-linie bg-weiss p-5 md:p-8">
        <p className="text-18">{text}</p>
        {z.art === 'laedt' ? null : zurueck}
      </div>
    );
  }

  const { sp, profil, lektion, folge } = z;
  const meldeEreignis = (e: EreignisEntwurf) => melde(kette.current, sp, profil, e);
  const fertig = async () => {
    await allesGeschrieben(kette.current, sp, profil);
    const ende = await nachDerLektion(sp, profil.id);
    const weiter = await folge();
    await merkeWeiter(
      sp,
      profil.id,
      weiter ? { kurs, lektion: weiter.schluessel, ...(weiter.titel ? { titel: weiter.titel } : {}) } : null,
    );
    meldeStand();
    setAbschluss(ende);
    setGesichert(true);
    void nachHandlung().catch(() => undefined);
  };

  return (
    <SpielerGrenze
      ersatz={
        <div className="flex flex-col items-start gap-4 rounded-lg border border-linie bg-weiss p-5 md:p-8">
          <p className="text-18">{texte.nichtVerfuegbar}</p>
          {zurueck}
        </div>
      }
    >
      <Suspense fallback={<p className="text-18 text-tinte-2">{texte.laedt}</p>}>
        <Spieler
          key={lektion.schluessel}
          lektion={lektion}
          texte={spielerTexte}
          sprache={ui}
          ziffern={z.ziffern}
          onEreignis={meldeEreignis}
          onFertig={() => void fertig().catch(() => setGesichert(true))}
          zurueckHref={gesichert ? lernpfad.adresse : undefined}
          optionen={{ ...z.optionen, spracherkennung }}
          melden={melden ? { kurs, texte: melden } : undefined}
          abgabe={schreibabgabe && istRichtung(kurs) ? { kurs, texte: schreibabgabe } : undefined}
          abschluss={abschluss}
        />
      </Suspense>
    </SpielerGrenze>
  );
}
