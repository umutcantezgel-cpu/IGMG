'use client';

import { RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { formatiere, intlSprache } from '@/lib/lernapp/format';
import type { Oberflaeche } from '@/lib/lernapp/kurse';
import type { Profil } from '@/lib/lernapp/lokal/db';
import type { SyncErgebnis, SyncGrund } from '@/lib/lernapp/lokal/sync';
import { einstellungsSpeicher } from '@/lib/lernapp/oberflaeche/einstellungen';
import { geraet, meldeStand, vorhandenesProfil } from '@/lib/lernapp/oberflaeche/geraet';

export type KontoTexte = {
  titel: string;
  text: string;
  verbinden: string;
  anmeldenText: string;
  anmelden: string;
  verbunden: string;
  zuletzt: string;
  jetzt: string;
  laeuft: string;
  fertig: string;
  frage: string;
  frageText: string;
  ja: string;
  nein: string;
  anderesKonto: string;
  neuesProfil: string;
  grund: Record<
    'aus' | 'netz' | 'antwort' | 'anmeldung' | 'einwilligung' | 'eltern' | 'bremse' | 'nichtGebunden' | 'konto' | 'grenze',
    string
  >;
};

/** Text zu einem Grund, warum kein Abgleich stattfand (Codes aus `lokal/sync.ts`). */
export function grundText(grund: SyncGrund | 'sitzung', t: KontoTexte['grund']): string {
  switch (grund) {
    case 'aus':
    case 'sitzung':
      return t.aus;
    case 'netz':
      return t.netz;
    case 'anmeldung':
      return t.anmeldung;
    case 'einwilligung':
      return t.einwilligung;
    case 'eltern':
      return t.eltern;
    case 'bremse':
      return t.bremse;
    case 'nichtGebunden':
      return t.nichtGebunden;
    case 'konto':
      return t.konto;
    case 'grenze':
      return t.grenze;
    default:
      return t.antwort;
  }
}

type Lage =
  | { art: 'frei' }
  | { art: 'anmelden' }
  | { art: 'frage'; konto: string }
  | { art: 'anderesKonto'; konto: string }
  | { art: 'verbunden'; zuletzt: string | null };

/** Rückkehr von der Anmeldung: `?konto=verbinden` setzt den Ablauf fort (ausdrücklicher Wunsch der Person). */
const RUECKKEHR = 'verbinden';

/**
 * Konto und Abgleich in den Einstellungen (ADR 0038 Nr. 5–7, KERN 4.0 §6): nur sichtbar, wenn der Schalter `lernapp_sync`
 * an ist. Ohne Konto entsteht keine Anfrage: Erst „Mit meinem Konto verbinden“ fragt `/api/lernapp/sitzung`. Danach je nach
 * Lage: anmelden (im Scope der Lern-App, mit Rückkehr hierher), Einwilligung fehlt, Übernahme-Frage beim ersten Verbinden
 * mit lokalem Fortschritt, oder sofort abgleichen. Ergebnisse stehen in einer Live-Region.
 */
export function KontoInsel({ ui, texte }: { ui: Oberflaeche; texte: KontoTexte }) {
  const [lage, setLage] = useState<Lage>({ art: 'frei' });
  const [meldung, setMeldung] = useState('');
  const [laeuft, setLaeuft] = useState(false);
  const [ziffern, setZiffern] = useState<'oestlich' | 'westlich'>('oestlich');
  const zuletztText = (iso: string) =>
    formatiere(
      texte.zuletzt,
      { zeit: new Intl.DateTimeFormat(intlSprache(ui, ziffern), { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso)) },
      ui,
      ziffern,
    );

  const gleicheAb = useCallback(
    async (profil: Profil) => {
      const { sp } = await vorhandenesProfil();
      const { synchronisiere, ladeSitzung } = await import('@/lib/lernapp/lokal/sync');
      const e: SyncErgebnis = await synchronisiere(sp, profil);
      setMeldung(e.ok ? texte.fertig : grundText(e.grund, texte.grund));
      if (e.ok) meldeStand();
      // Die Sitzung gehört zu einem anderen Konto als das Profil (S-L1 M-1): Bindungsfrage statt Abgleich
      if (!e.ok && e.grund === 'konto') {
        const s = await ladeSitzung();
        if (s?.angemeldet) return setLage({ art: 'anderesKonto', konto: s.konto });
      }
      setLage({ art: 'verbunden', zuletzt: (await sp.lies('sync', profil.id))?.zuletzt ?? null });
    },
    [texte],
  );

  const verbinden = useCallback(async () => {
    setLaeuft(true);
    setMeldung(texte.laeuft);
    try {
      const { ladeSitzung, bindungFuer, beantworteUebernahme } = await import('@/lib/lernapp/lokal/sync');
      const s = await ladeSitzung();
      if (!s) return setMeldung(texte.grund.aus);
      if (!s.angemeldet) {
        setMeldung('');
        return setLage({ art: 'anmelden' });
      }
      if (s.einwilligung !== 'erteilt') return setMeldung(grundText(s.einwilligung === 'eltern' ? 'eltern' : 'einwilligung', texte.grund));
      const { sp, profil } = await geraet(ui);
      const b = await bindungFuer(sp, profil, s.konto);
      if (b === 'frage') {
        setMeldung('');
        return setLage({ art: 'frage', konto: s.konto });
      }
      if (b === 'anderesKonto') {
        setMeldung('');
        return setLage({ art: 'anderesKonto', konto: s.konto });
      }
      await gleicheAb(b === 'binden' ? await beantworteUebernahme(sp, profil, s.konto, true) : profil);
    } catch {
      setMeldung(texte.grund.antwort);
    } finally {
      setLaeuft(false);
    }
  }, [gleicheAb, texte, ui]);

  const antworte = async (konto: string, uebernehmen: boolean) => {
    setLaeuft(true);
    setMeldung(texte.laeuft);
    try {
      const { beantworteUebernahme } = await import('@/lib/lernapp/lokal/sync');
      const { sp, profil } = await geraet(ui);
      await gleicheAb(await beantworteUebernahme(sp, profil, konto, uebernehmen));
    } catch {
      setMeldung(texte.grund.antwort);
    } finally {
      setLaeuft(false);
    }
  };

  useEffect(() => {
    let aktiv = true;
    void einstellungsSpeicher(ui)
      .laden()
      .then((e) => aktiv && setZiffern(e.ziffern));
    void (async () => {
      const { sp, profil } = await vorhandenesProfil();
      if (!aktiv) return;
      if (profil?.benutzerId) setLage({ art: 'verbunden', zuletzt: (await sp.lies('sync', profil.id))?.zuletzt ?? null });
      const such = new URLSearchParams(window.location.search);
      if (such.get('konto') === RUECKKEHR) {
        window.history.replaceState(null, '', window.location.pathname);
        void verbinden();
      }
    })();
    return () => {
      aktiv = false;
    };
  }, [ui, verbinden]);

  const knopf = 'inline-flex min-h-12 druck items-center gap-2 rounded-pill px-5 font-bold disabled:bg-linie disabled:text-tinte-2';
  const haupt = `${knopf} bg-gruen-700 text-weiss hover:bg-gruen-800`;
  const neben = `${knopf} border border-rand bg-weiss text-tinte hover:border-gruen-700`;
  const anmeldeAdresse = `/lern-app/${ui}/anmelden?weiter=${encodeURIComponent(`/lern-app/${ui}/einstellungen?konto=${RUECKKEHR}`)}`;

  return (
    <section aria-labelledby="konto" className="flex flex-col gap-3 rounded-lg border border-linie bg-weiss p-5">
      <h2 id="konto" className="text-24">
        {texte.titel}
      </h2>
      {lage.art === 'verbunden' ? (
        <>
          <p className="text-16">{texte.verbunden}</p>
          {lage.zuletzt ? <p className="text-16 text-tinte-2">{zuletztText(lage.zuletzt)}</p> : null}
          <button
            type="button"
            disabled={laeuft}
            onClick={() => void vorhandenesProfil().then(({ profil }) => profil && gleicheAb(profil))}
            className={`${neben} self-start`}
          >
            <RefreshCw aria-hidden className="size-5" />
            {texte.jetzt}
          </button>
        </>
      ) : lage.art === 'frage' ? (
        <div className="flex flex-col gap-3">
          <p className="font-bold">{texte.frage}</p>
          <p className="text-16 text-tinte-2">{texte.frageText}</p>
          <div className="flex flex-wrap gap-3">
            <button type="button" disabled={laeuft} onClick={() => void antworte(lage.konto, true)} className={haupt}>
              {texte.ja}
            </button>
            <button type="button" disabled={laeuft} onClick={() => void antworte(lage.konto, false)} className={neben}>
              {texte.nein}
            </button>
          </div>
        </div>
      ) : lage.art === 'anderesKonto' ? (
        <div className="flex flex-col items-start gap-3">
          <p className="text-16">{texte.anderesKonto}</p>
          <button type="button" disabled={laeuft} onClick={() => void antworte(lage.konto, false)} className={neben}>
            {texte.neuesProfil}
          </button>
        </div>
      ) : lage.art === 'anmelden' ? (
        <div className="flex flex-col items-start gap-3">
          <p className="text-16">{texte.anmeldenText}</p>
          <a href={anmeldeAdresse} className={`${haupt} no-underline hover:text-weiss`}>
            {texte.anmelden}
          </a>
        </div>
      ) : (
        <div className="flex flex-col items-start gap-3">
          <p className="text-16 text-tinte-2">{texte.text}</p>
          <button type="button" disabled={laeuft} onClick={() => void verbinden()} className={haupt}>
            {texte.verbinden}
          </button>
        </div>
      )}
      <p role="status" className="min-h-6 text-16 font-bold text-gruen-800">
        {meldung}
      </p>
    </section>
  );
}
