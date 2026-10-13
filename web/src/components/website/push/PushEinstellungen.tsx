'use client';

import { useEffect, useState } from 'react';
import { klassen } from '@/lib/klassen';

export type PushThemaSchluessel = 'gebet' | 'ankuendigung' | 'chat' | 'unterricht';
export type PushTexte = {
  themenTitel: string;
  themen: Record<PushThemaSchluessel, string>;
  gebeteTitel: string;
  minutenTitel: string;
  minuten: string;
  minutenNull: string;
  einwilligung: string;
  speichern: string;
  aktualisieren: string;
  abschalten: string;
  aktiv: string;
  gespeichert: string;
  aus: string;
  verweigert: string;
  nichtUnterstuetzt: string;
  ios: string;
  fehler: string;
  mindestensEins: string;
  einwilligungFehlt: string;
  laedt: string;
};

type Auswahl = { themen: PushThemaSchluessel[]; gebete: string[]; minuten: number };
type Zustand = 'pruefen' | 'nicht' | 'ios' | 'bereit';

const AUSWAHL_SPEICHER = 'igmg-push-auswahl';
const MINUTEN = [0, 5, 10, 15, 20, 30, 45];
const STANDARD: Auswahl = { themen: ['gebet'], gebete: ['imsak', 'ogle', 'ikindi', 'aksam', 'yatsi'], minuten: 10 };

function schluesselBytes(base64url: string): Uint8Array<ArrayBuffer> {
  const b64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const roh = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4));
  const bytes = new Uint8Array(new ArrayBuffer(roh.length));
  for (let i = 0; i < roh.length; i++) bytes[i] = roh.charCodeAt(i);
  return bytes;
}

function fuelle(vorlage: string, werte: Record<string, string>) {
  return vorlage.replace(/\{(\w+)\}/g, (_, k: string) => werte[k] ?? '');
}

function gespeicherteAuswahl(): Auswahl {
  try {
    const roh = window.localStorage.getItem(AUSWAHL_SPEICHER);
    if (!roh) return STANDARD;
    const wert = JSON.parse(roh) as Partial<Auswahl>;
    return {
      themen: Array.isArray(wert.themen) ? wert.themen : STANDARD.themen,
      gebete: Array.isArray(wert.gebete) ? wert.gebete : STANDARD.gebete,
      minuten: typeof wert.minuten === 'number' ? wert.minuten : STANDARD.minuten,
    };
  } catch {
    return STANDARD;
  }
}

async function registrierung(): Promise<ServiceWorkerRegistration> {
  return (await navigator.serviceWorker.getRegistration('/')) ?? (await navigator.serviceWorker.register('/sw.js', { scope: '/' }));
}

/**
 * Einstellungen für Benachrichtigungen (ADR 0034, nur auf Wunsch): Themen, Gebete, Vorlauf, Einwilligung. Die Erlaubnis
 * des Browsers wird erst beim Klick auf „einschalten“ erfragt. Auswahl merkt sich der Browser; der Server speichert nur
 * das verschlüsselte Abo.
 */
export function PushEinstellungen({
  texte,
  oeffentlich,
  themen,
  gebete,
  sprache,
}: {
  texte: PushTexte;
  oeffentlich: string;
  themen: readonly PushThemaSchluessel[];
  gebete: Record<string, string>;
  sprache: 'de' | 'tr' | 'en';
}) {
  const [zustand, setZustand] = useState<Zustand>('pruefen');
  const [abo, setAbo] = useState<PushSubscription | null>(null);
  const [auswahl, setAuswahl] = useState<Auswahl>(STANDARD);
  const [einwilligung, setEinwilligung] = useState(false);
  const [meldung, setMeldung] = useState<{ text: string; fehler: boolean } | null>(null);
  const [beschaeftigt, setBeschaeftigt] = useState(false);

  useEffect(() => {
    let aktiv = true;
    const unterstuetzt = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(navigator as Navigator & { standalone?: boolean }).standalone;
    (async () => {
      if (!unterstuetzt) {
        if (aktiv) setZustand(ios ? 'ios' : 'nicht');
        return;
      }
      const reg = await registrierung().catch(() => null);
      const vorhanden = reg ? await reg.pushManager.getSubscription().catch(() => null) : null;
      if (!aktiv) return;
      setAbo(vorhanden);
      setAuswahl(gespeicherteAuswahl());
      setEinwilligung(Boolean(vorhanden));
      setZustand('bereit');
    })();
    return () => {
      aktiv = false;
    };
  }, []);

  function umschalten<T>(liste: T[], wert: T): T[] {
    return liste.includes(wert) ? liste.filter((x) => x !== wert) : [...liste, wert];
  }

  async function speichern() {
    setMeldung(null);
    const gewaehlt = auswahl.themen.filter((t) => themen.includes(t));
    if (!gewaehlt.length) return setMeldung({ text: texte.mindestensEins, fehler: true });
    if (!einwilligung) return setMeldung({ text: texte.einwilligungFehlt, fehler: true });
    setBeschaeftigt(true);
    try {
      const erlaubnis = await Notification.requestPermission();
      if (erlaubnis !== 'granted') {
        setMeldung({ text: texte.verweigert, fehler: true });
        return;
      }
      const reg = await registrierung();
      await navigator.serviceWorker.ready;
      const neu = abo ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: schluesselBytes(oeffentlich) }));
      const antwort = await fetch('/api/push/abo', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          abo: neu.toJSON(),
          themen: gewaehlt,
          gebete: auswahl.gebete,
          minutenVorher: auswahl.minuten,
          sprache,
          einwilligung: true,
        }),
      });
      if (!antwort.ok) throw new Error(String(antwort.status));
      const ergebnis = (await antwort.json()) as { neu?: boolean };
      try {
        window.localStorage.setItem(AUSWAHL_SPEICHER, JSON.stringify({ ...auswahl, themen: gewaehlt }));
      } catch {
        // Ohne Gerätespeicher gilt die Auswahl trotzdem (sie liegt auf dem Server)
      }
      setAbo(neu);
      setMeldung({ text: ergebnis.neu ? texte.aktiv : texte.gespeichert, fehler: false });
    } catch {
      setMeldung({ text: texte.fehler, fehler: true });
    } finally {
      setBeschaeftigt(false);
    }
  }

  async function abschalten() {
    if (!abo) return;
    setBeschaeftigt(true);
    setMeldung(null);
    try {
      await fetch('/api/push/abo', {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ endpoint: abo.endpoint }),
      });
      await abo.unsubscribe();
      setAbo(null);
      setEinwilligung(false);
      setMeldung({ text: texte.aus, fehler: false });
    } catch {
      setMeldung({ text: texte.fehler, fehler: true });
    } finally {
      setBeschaeftigt(false);
    }
  }

  if (zustand === 'pruefen') return <p className="min-h-12 text-tinte-2">{texte.laedt}</p>;
  if (zustand === 'nicht') return <p className="max-w-text text-tinte-2">{texte.nichtUnterstuetzt}</p>;
  if (zustand === 'ios') return <p className="max-w-text text-18 leading-einleitung">{texte.ios}</p>;

  const KASTEN =
    'flex min-h-12 cursor-pointer items-center gap-3 rounded-md border-2 border-linie bg-weiss px-3 has-checked:border-gruen-700 has-checked:bg-gruen-50';
  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        void speichern();
      }}
    >
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2 font-bold">{texte.themenTitel}</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {themen.map((t) => (
            <label key={t} className={KASTEN}>
              <input
                type="checkbox"
                className="size-5 accent-gruen-700"
                checked={auswahl.themen.includes(t)}
                onChange={() => setAuswahl((a) => ({ ...a, themen: umschalten(a.themen, t) }))}
              />
              <span>{texte.themen[t]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {auswahl.themen.includes('gebet') ? (
        <>
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-2 font-bold">{texte.gebeteTitel}</legend>
            <div className="flex flex-wrap gap-2">
              {Object.entries(gebete).map(([g, name]) => (
                <label key={g} className={KASTEN}>
                  <input
                    type="checkbox"
                    className="size-5 accent-gruen-700"
                    checked={auswahl.gebete.includes(g)}
                    onChange={() => setAuswahl((a) => ({ ...a, gebete: umschalten(a.gebete, g) }))}
                  />
                  <span>{name}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="flex max-w-text flex-col gap-2">
            <label htmlFor="push-minuten" className="font-bold">
              {texte.minutenTitel}
            </label>
            <select
              id="push-minuten"
              value={auswahl.minuten}
              onChange={(e) => setAuswahl((a) => ({ ...a, minuten: Number(e.target.value) }))}
              className="min-h-12 rounded-md border-2 border-rand bg-weiss px-3 text-18"
            >
              {MINUTEN.map((m) => (
                <option key={m} value={m}>
                  {m === 0 ? texte.minutenNull : fuelle(texte.minuten, { minuten: String(m) })}
                </option>
              ))}
            </select>
          </div>
        </>
      ) : null}

      <label className="flex max-w-text cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          className="mt-1 size-5 shrink-0 accent-gruen-700"
          checked={einwilligung}
          onChange={(e) => setEinwilligung(e.target.checked)}
        />
        <span className="text-16 leading-normal">{texte.einwilligung}</span>
      </label>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={beschaeftigt}
          className="inline-flex min-h-12 cursor-pointer items-center rounded-md bg-gruen-700 px-5 font-bold text-weiss transition duration-(--dauer-rueckmeldung) hover:bg-gruen-800 active:scale-98 disabled:cursor-wait disabled:opacity-60"
        >
          {abo ? texte.aktualisieren : texte.speichern}
        </button>
        {abo ? (
          <button
            type="button"
            onClick={() => void abschalten()}
            disabled={beschaeftigt}
            className="inline-flex min-h-12 cursor-pointer items-center rounded-md border-2 border-gruen-700 bg-weiss px-5 font-bold text-gruen-800 transition duration-(--dauer-rueckmeldung) hover:bg-gruen-50 active:scale-98 disabled:opacity-60"
          >
            {texte.abschalten}
          </button>
        ) : null}
      </div>
      <p role="status" className={klassen('min-h-6 max-w-text text-16', meldung?.fehler ? 'font-bold text-fehler' : 'text-gruen-800')}>
        {meldung?.text}
      </p>
    </form>
  );
}
