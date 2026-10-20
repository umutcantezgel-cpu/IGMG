'use client';

import { Download, Upload } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { formatiere, type Ziffern } from '@/lib/lernapp/format';
import type { Oberflaeche } from '@/lib/lernapp/kurse';
import { einstellungsSpeicher } from '@/lib/lernapp/oberflaeche/einstellungen';
import { geraet, heute, meldeStand, speicher, vorhandenesProfil } from '@/lib/lernapp/oberflaeche/geraet';

export type DatenTexte = {
  sichern: string;
  sichernText: string;
  einlesen: string;
  einlesenText: string;
  gesichert: string;
  nichtsZuSichern: string;
  eingelesen: string;
  fehlerGross: string;
  fehlerFormat: string;
  nurSitzung: string;
  nichtGespeichert: string;
};

/**
 * Lernstand als Datei sichern und einlesen (KERN 4.0 §6, ADR 0038 Nr. 8, Art. 20 DSGVO; Löschkonzept L-37): Export des
 * aktiven Profils (Profil und Ereignisprotokoll, keine Konto-Kennung) und Import mit strikter Prüfung, idempotent in das
 * aktive Profil zusammengeführt. Läuft nur im Browser, nichts verlässt das Gerät; die Bibliothek (`lokal/export.ts`, mit
 * Zod) lädt erst beim Klick. Ohne IndexedDB (privates Fenster, gesperrter Speicher) sagt die Insel, dass nach dem Schließen
 * nichts bleibt. Meldungen in einer Live-Region.
 */
export function DatenInsel({ ui, texte }: { ui: Oberflaeche; texte: DatenTexte }) {
  const [nurSitzung, setNurSitzung] = useState(false);
  const [meldung, setMeldung] = useState('');
  const [laeuft, setLaeuft] = useState(false);
  const [ziffern, setZiffern] = useState<Ziffern>('oestlich');
  const datei = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let aktiv = true;
    void speicher().then((sp) => aktiv && setNurSitzung(sp.hinweis !== null));
    void einstellungsSpeicher(ui)
      .laden()
      .then((e) => aktiv && setZiffern(e.ziffern));
    return () => {
      aktiv = false;
    };
  }, [ui]);

  const sichern = async () => {
    setLaeuft(true);
    try {
      const { sp, profil } = await vorhandenesProfil();
      if (!profil) return setMeldung(texte.nichtsZuSichern);
      const { exportiere, alsDatei } = await import('@/lib/lernapp/lokal/export');
      const d = alsDatei(await exportiere(sp, profil.id));
      const adresse = URL.createObjectURL(new Blob([d.inhalt], { type: d.typ }));
      const a = document.createElement('a');
      a.href = adresse;
      a.download = d.name;
      document.body.append(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(adresse), 30_000);
      setMeldung(texte.gesichert);
    } catch {
      setMeldung(texte.nichtGespeichert);
    } finally {
      setLaeuft(false);
    }
  };

  const einlesen = async (f: File) => {
    setLaeuft(true);
    try {
      const { EXPORT_HOECHSTENS, importiere, liesExport } = await import('@/lib/lernapp/lokal/export');
      // UTF-8: höchstens 4 Bytes je Zeichen – größere Dateien gar nicht erst lesen
      if (f.size > EXPORT_HOECHSTENS * 4) return setMeldung(texte.fehlerGross);
      const r = liesExport(await f.text());
      if (!r.ok) return setMeldung(r.fehler === 'zuGross' ? texte.fehlerGross : texte.fehlerFormat);
      const { sp, profil } = await geraet(ui);
      const e = await importiere(sp, r.daten, { profil: profil.id }, { heute: heute() });
      meldeStand();
      setMeldung(formatiere(texte.eingelesen, { n: e.neu }, ui, ziffern));
      if (profil.benutzerId) void import('@/lib/lernapp/oberflaeche/abgleich').then((a) => a.nachHandlung());
    } catch {
      setMeldung(texte.nichtGespeichert);
    } finally {
      setLaeuft(false);
      if (datei.current) datei.current.value = '';
    }
  };

  const knopf =
    'inline-flex min-h-12 druck items-center gap-2 rounded-pill border border-rand bg-weiss px-5 font-bold text-tinte hover:border-gruen-700 disabled:bg-linie disabled:text-tinte-2';

  return (
    <div className="flex flex-col gap-4">
      {nurSitzung ? (
        <p data-testid="nur-sitzung" className="rounded-md border border-rand bg-sand p-4 text-16 font-bold">
          {texte.nurSitzung}
        </p>
      ) : null}
      <div className="flex flex-col items-start gap-2">
        <p className="text-16 text-tinte-2">{texte.sichernText}</p>
        <button type="button" disabled={laeuft} onClick={() => void sichern()} className={knopf}>
          <Download aria-hidden className="size-5" />
          {texte.sichern}
        </button>
      </div>
      <div className="flex flex-col items-start gap-2">
        <p className="text-16 text-tinte-2">{texte.einlesenText}</p>
        <button type="button" disabled={laeuft} onClick={() => datei.current?.click()} className={knopf}>
          <Upload aria-hidden className="size-5" />
          {texte.einlesen}
        </button>
        <input
          ref={datei}
          type="file"
          accept="application/json,.json"
          hidden
          tabIndex={-1}
          onChange={(ev) => {
            const f = ev.currentTarget.files?.[0];
            if (f) void einlesen(f);
          }}
        />
      </div>
      <p role="status" className="min-h-6 text-16 font-bold text-gruen-800">
        {meldung}
      </p>
    </div>
  );
}
