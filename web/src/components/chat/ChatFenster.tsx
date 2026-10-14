'use client';

import { ChevronDown, CirclePause, Clock, Flag, Lock, Phone } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';
import { Achtstern } from '@/components/website/Icons';
import type { AbrufErgebnis, ChatNachricht } from '@/lib/chat/dienst';
import type { SchreibGrund } from '@/lib/chat/regeln';
import { klassen } from '@/lib/klassen';
import {
  bestaetigeChatRegeln,
  entferneChatNachricht,
  meldeChatNachricht,
  pausiereKanal,
  schalteStumm,
  sendeChatNachricht,
} from '@/server/actions/chat';

/** Fertig übersetzte Texte (kein next-intl im Browser, MUSTER §4). */
export type ChatTexte = {
  titel: string;
  leer: string;
  laedt: string;
  eingabe: string;
  /** Platzhalter des gesperrten Feldes */
  eingabeGesperrt: string;
  /** Platzhalter des gesperrten Feldes, solange die Regeln nicht bestätigt sind (Grund „regelnFehlen“) */
  eingabeRegeln: string;
  /** „Schreiben geht wieder ab 08:00 Uhr.“ – fertig mit der Öffnungszeit der Gruppe (Grund „geschlossen“) */
  wiederAb: string;
  senden: string;
  zeichen: string;
  entfernt: string;
  lehrkraft: string;
  du: string;
  melden: string;
  /** „Melden: Nachricht von {name}“ – sichtbarer Text vorn (WCAG 2.5.3) */
  meldenAria: string;
  meldenTitel: string;
  meldenGrund: string;
  gruende: Record<'beleidigung' | 'bedrohung' | 'unangemessen' | 'spam' | 'sonstiges', string>;
  meldenFreitext: string;
  meldenSenden: string;
  abbrechen: string;
  gemeldet: string;
  /** Hilfehinweis ohne Nummer (GC-5); die Nummer folgt als Anruf-Link */
  hilfe: string;
  /** „116 111“, für Erwachsene das Elterntelefon „0800 111 0 550“ – das Ziel `tel:` entsteht aus den Ziffern */
  hilfeNummer: string;
  grund: Partial<Record<SchreibGrund | 'leer' | 'zuLang' | 'rate', string>>;
  fehler: string;
  regelnTitel: string;
  /** Je Regel das Stichwort (immer sichtbar) und die Erläuterung (einklappbar); zusammen ergeben sie den Wortlaut der Regel */
  regeln: { stichwort: string; text: string }[];
  regelnBestaetigen: string;
  moderation: { entfernen: string; stumm: string; pausieren: string; fortsetzen: string; begruendung: string };
};

type Zustand = { nachrichten: ChatNachricht[]; schreiben: SchreibGrund | null };

const MAX = 500;

const segmentierer = typeof Intl !== 'undefined' && 'Segmenter' in Intl ? new Intl.Segmenter('de', { granularity: 'grapheme' }) : null;
const zaehle = (t: string) => (segmentierer ? [...segmentierer.segment(t)].length : t.length);

/** Abruf-Takt (ADR 0027): 4 s nach Aktivität, dann 15 s, nach 5 Minuten Ruhe 30 s; verborgener Tab: Pause. */
function abstand(letzteAktivitaet: number): number {
  const ruhe = Date.now() - letzteAktivitaet;
  return ruhe < 60_000 ? 4_000 : ruhe < 300_000 ? 15_000 : 30_000;
}

/**
 * Moderierter Gruppen- bzw. Elternkanal (S-01…S-18): Abruf mit adaptivem Takt, optional Echtzeit-Signal (nur „es gibt
 * Neues“). Keine Lesebestätigungen, keine Online-Anzeige, Links nur als Text, Melden in zwei Schritten mit Hilfehinweis.
 * Gesperrt (Sichtabnahme GC-1): Hinweisband mit Symbol und Wiederöffnungszeit über dem sichtbar gesperrten Feld; auf dem
 * Telefon steht das Feld in voller Breite, „Senden“ darunter. „Melden“ (GC-2, GC-3) steht bei fremden Nachrichten immer
 * rechts oben als ruhiger Umrissknopf; der Kartentitel steht nur für Hilfsmittel da (die Seite trägt ihn schon als H1).
 */
export function ChatFenster({
  kanalId,
  texte,
  istLeitung,
  zeitformat,
  echtzeit = true,
}: {
  kanalId: string;
  texte: ChatTexte;
  istLeitung: boolean;
  zeitformat: string;
  /** Echtzeit-Signal versuchen (Schalter `echtzeit` und Konfiguration); sonst nur Abruf, ohne 404 im Protokoll. */
  echtzeit?: boolean;
}) {
  const [z, setZ] = useState<Zustand>({ nachrichten: [], schreiben: null });
  const [geladen, setGeladen] = useState(false);
  const [text, setText] = useState('');
  const [meldung, setMeldung] = useState<string | null>(null);
  const [sendet, setSendet] = useState(false);
  const [melden, setMelden] = useState<ChatNachricht | null>(null);
  const [neuAb, setNeuAb] = useState<number>(Number.MAX_SAFE_INTEGER);
  const letzteId = useRef<number | undefined>(undefined);
  /** Zeitpunkt der letzten Aktivität (eigene oder fremde Nachricht); 0 = noch keine, gesetzt beim ersten Abruf. */
  const aktivitaet = useRef(0);
  /** Verweis auf den jüngsten Abruf, damit der Zeitgeber sich selbst neu planen kann. */
  const naechsterAbruf = useRef<() => void>(() => undefined);
  const zeitgeber = useRef<number | undefined>(undefined);
  const liste = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const uhr = new Intl.DateTimeFormat(zeitformat, { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });

  const abrufen = useCallback(async () => {
    window.clearTimeout(zeitgeber.current);
    if (document.hidden) return;
    try {
      const nach = letzteId.current !== undefined ? `?nach=${letzteId.current}` : '';
      const antwort = await fetch(`/api/mein/chat/${kanalId}${nach}`, { cache: 'no-store' });
      if (antwort.status === 401 || antwort.status === 404) {
        setMeldung(texte.fehler);
        return;
      }
      if (antwort.ok) {
        const daten = (await antwort.json()) as AbrufErgebnis;
        const erstes = letzteId.current === undefined;
        if (daten.nachrichten.length) {
          letzteId.current = daten.nachrichten.at(-1)!.id;
          if (!erstes) aktivitaet.current = Date.now();
        }
        // Zwei Abrufe können sich überholen (Sichtbarkeit, Signal, Neustart des Effekts): nur unbekannte Nachrichten anhängen
        setZ((alt) => {
          const bekannt = new Set(alt.nachrichten.map((n) => n.id));
          return {
            nachrichten: erstes ? daten.nachrichten : [...alt.nachrichten, ...daten.nachrichten.filter((n) => !bekannt.has(n.id))],
            schreiben: daten.schreiben,
          };
        });
        if (erstes) {
          setNeuAb((letzteId.current ?? 0) + 1);
          setGeladen(true);
        }
      }
    } catch {
      // Netz weg: nächster Versuch im normalen Takt
    }
    if (!aktivitaet.current) aktivitaet.current = Date.now();
    zeitgeber.current = window.setTimeout(() => naechsterAbruf.current(), abstand(aktivitaet.current));
  }, [kanalId, texte.fehler]);

  useEffect(() => {
    naechsterAbruf.current = () => void abrufen();
  }, [abrufen]);

  useEffect(() => {
    // Abgleich mit einem externen System (Server-Abruf); der Zustand ändert sich erst nach der Antwort.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void abrufen();
    const sichtbar = () => {
      if (!document.hidden) void abrufen();
    };
    document.addEventListener('visibilitychange', sichtbar);
    return () => {
      document.removeEventListener('visibilitychange', sichtbar);
      window.clearTimeout(zeitgeber.current);
    };
  }, [abrufen]);

  // Echtzeit-Signal (K-A, ADR 0027): nur „Kanal hat Neues“ → sofort abrufen. Ohne Konfiguration 404 → nur Abruf.
  useEffect(() => {
    if (!echtzeit) return;
    let ws: WebSocket | null = null;
    let aus = false;
    (async () => {
      const antwort = await fetch(`/api/mein/echtzeit?kanal=${kanalId}`, { cache: 'no-store' }).catch(() => null);
      if (!antwort?.ok || aus) return;
      const t = (await antwort.json()) as { url: string; kanal: string; verbindung: string; abo: string };
      ws = new WebSocket(t.url);
      ws.onopen = () => {
        ws?.send(JSON.stringify({ id: 1, connect: { token: t.verbindung } }));
        ws?.send(JSON.stringify({ id: 2, subscribe: { channel: t.kanal, token: t.abo } }));
      };
      ws.onmessage = (e) => {
        for (const zeile of String(e.data).split('\n')) {
          if (zeile === '{}') ws?.send('{}');
          else if (zeile.includes('"push"')) void abrufen();
        }
      };
    })();
    return () => {
      aus = true;
      ws?.close();
    };
  }, [kanalId, abrufen, echtzeit]);

  useEffect(() => {
    const el = liste.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [z.nachrichten.length]);

  async function senden() {
    const inhalt = text.trim();
    if (!inhalt || sendet) return;
    setSendet(true);
    setMeldung(null);
    const r = await sendeChatNachricht(kanalId, inhalt).catch(() => null);
    setSendet(false);
    if (!r) return setMeldung(texte.fehler);
    if (!r.ok) return setMeldung(texte.grund[r.grund] ?? texte.fehler);
    setText('');
    aktivitaet.current = Date.now();
    void abrufen();
  }

  async function regelnOk() {
    await bestaetigeChatRegeln().catch(() => null);
    void abrufen();
  }

  async function moderiere(art: 'entfernen' | 'stumm', n: ChatNachricht) {
    const begruendung = window.prompt(texte.moderation.begruendung)?.trim();
    if (!begruendung || begruendung.length < 3) return;
    const r =
      art === 'entfernen'
        ? await entferneChatNachricht(n.id, begruendung).catch(() => null)
        : n.absender
          ? await schalteStumm(kanalId, n.absender, 30, begruendung).catch(() => null)
          : null;
    setMeldung(r && 'ok' in r ? null : texte.fehler);
    letzteId.current = undefined;
    void abrufen();
  }

  async function pause(an: boolean) {
    const begruendung = window.prompt(texte.moderation.begruendung)?.trim();
    if (!begruendung || begruendung.length < 3) return;
    await pausiereKanal(kanalId, an, begruendung).catch(() => null);
    void abrufen();
  }

  const gesperrt = z.schreiben !== 'ok';
  const zeichen = zaehle(text);

  return (
    <section aria-labelledby="chat-titel" className="flex min-h-0 flex-col rounded-lg border border-linie bg-weiss shadow-s1">
      {/* Titel nur für Hilfsmittel (Benennung des Abschnitts): sichtbar steht „Gruppenchat“ schon als H1 darüber */}
      <h2 id="chat-titel" className="sr-only">
        {texte.titel}
      </h2>
      {istLeitung ? (
        <header className="flex justify-end border-b border-linie px-4 py-3 md:px-6">
          <button
            type="button"
            onClick={() => void pause(z.schreiben !== 'pausiert')}
            className="min-h-12 rounded-md border-2 border-gruen-700 px-4 font-bold text-gruen-800 hover:bg-gruen-50"
          >
            {z.schreiben === 'pausiert' ? texte.moderation.fortsetzen : texte.moderation.pausieren}
          </button>
        </header>
      ) : null}

      {/* Verlauf: role="log" am scrollenden Rahmen, darin eine echte Liste (ein <ol role="log"> verliert die Listensemantik) */}
      <div
        ref={liste}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        className="relative max-h-(--hoehe-chat) min-h-64 overflow-y-auto px-4 py-4 md:px-6"
      >
        <ol className="flex flex-col gap-3">
          {!geladen ? <li className="text-tinte-2">{texte.laedt}</li> : null}
          {geladen && !z.nachrichten.length ? <li className="text-tinte-2">{texte.leer}</li> : null}
          {z.nachrichten.map((n) => (
            <li
              key={n.id}
              className={klassen(
                'flex max-w-text flex-col gap-1',
                n.eigen ? 'items-end self-end' : 'self-start',
                n.id >= neuAb && 'tritt-auf',
              )}
              style={{ '--dauer': 'var(--dauer-wechsel)' } as CSSProperties}
            >
              {n.eigen || n.text === null ? (
                <span className="flex flex-wrap items-center gap-x-2 text-16 text-tinte-2">
                  <span className="font-bold text-tinte">{n.eigen ? texte.du : n.name}</span>
                  {n.leitung ? <Plakette text={texte.lehrkraft} /> : null}
                  <time dateTime={n.zeit}>{uhr.format(new Date(n.zeit))}</time>
                </span>
              ) : (
                /* Kopf fremder Nachrichten (GC-3): links Name, Plakette und Zeit (dürfen umbrechen), rechts immer „Melden“
                   als ruhiger Umrissknopf (GC-2: keine Füllung, Schrift wie die Zeit). Die erste Zeile ist so hoch wie der
                   Knopf, damit Name und Knopf auf einer Linie stehen – auch wenn die Zeit in die zweite Zeile rückt. */
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3">
                  <span data-namenszeile className="flex min-w-0 flex-wrap items-center gap-x-2 text-16 text-tinte-2">
                    <span className="inline-flex min-h-11 items-center font-bold text-tinte">{n.name}</span>
                    {n.leitung ? <Plakette text={texte.lehrkraft} /> : null}
                    <time dateTime={n.zeit}>{uhr.format(new Date(n.zeit))}</time>
                  </span>
                  <button
                    type="button"
                    onClick={() => setMelden(n)}
                    aria-label={texte.meldenAria.replace('{name}', n.name)}
                    className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-rand px-3 text-16 whitespace-nowrap text-tinte-2 transition duration-(--dauer-rueckmeldung) hover:border-tinte-2 hover:text-tinte"
                  >
                    <Flag aria-hidden className="size-4 shrink-0" />
                    {texte.melden}
                  </button>
                </div>
              )}
              <p
                className={klassen(
                  'rounded-lg px-4 py-2.5 text-18 wrap-anywhere whitespace-pre-wrap',
                  n.text === null ? 'bg-sand text-tinte-2 italic' : n.eigen ? 'bg-gruen-700 text-weiss' : 'bg-papier text-tinte',
                )}
              >
                {n.text ?? texte.entfernt}
              </p>
              {istLeitung && !n.eigen && n.text !== null ? (
                <span className="flex gap-3">
                  <button type="button" onClick={() => void moderiere('entfernen', n)} className="min-h-11 text-16 font-bold text-fehler">
                    {texte.moderation.entfernen}
                  </button>
                  {n.absender ? (
                    <button type="button" onClick={() => void moderiere('stumm', n)} className="min-h-11 text-16 font-bold text-tinte-2">
                      {texte.moderation.stumm}
                    </button>
                  ) : null}
                </span>
              ) : null}
            </li>
          ))}
        </ol>
      </div>

      <div className="flex flex-col gap-2 border-t border-linie px-4 py-3 md:px-6">
        {z.schreiben === 'regelnFehlen' ? (
          <div className="flex flex-col gap-2 rounded-md bg-papier p-4 max-sm:-mx-4 max-sm:rounded-none">
            <h3 className="text-20">{texte.regelnTitel}</h3>
            <Regeln regeln={texte.regeln} />
            <Hilfe text={texte.hilfe} nummer={texte.hilfeNummer} className="max-w-text" />
            <button
              type="button"
              onClick={() => void regelnOk()}
              className="min-h-12 self-start rounded-md bg-gruen-700 px-5 font-bold text-weiss hover:bg-gruen-800"
            >
              {texte.regelnBestaetigen}
            </button>
          </div>
        ) : gesperrt && z.schreiben ? (
          <SperrBand grund={z.schreiben} text={texte.grund[z.schreiben] ?? ''} wiederAb={texte.wiederAb} />
        ) : null}
        <form
          className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 gap-y-1.5 sm:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            void senden();
          }}
        >
          <label className="col-span-2 flex min-w-0 flex-col sm:col-span-1">
            <span className="sr-only">{texte.eingabe}</span>
            <textarea
              value={text}
              onChange={(e) => setText(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void senden();
                }
              }}
              disabled={gesperrt}
              rows={2}
              placeholder={z.schreiben === 'regelnFehlen' ? texte.eingabeRegeln : gesperrt ? texte.eingabeGesperrt : texte.eingabe}
              aria-describedby={gesperrt ? undefined : 'chat-zeichen'}
              className="min-h-12 w-full resize-y rounded-md border-2 border-rand bg-weiss px-3 py-2 text-18 disabled:cursor-not-allowed disabled:resize-none disabled:border-dashed disabled:bg-sand disabled:text-tinte-2 disabled:placeholder:text-tinte-2"
            />
          </label>
          <button
            type="submit"
            disabled={gesperrt || sendet || !text.trim() || zeichen > MAX}
            className="col-start-2 row-start-2 min-h-12 cursor-pointer rounded-md bg-gruen-700 px-5 font-bold text-weiss hover:bg-gruen-800 disabled:cursor-not-allowed disabled:opacity-50 sm:row-start-1"
          >
            {texte.senden}
          </button>
          {gesperrt ? null : (
            <span
              id="chat-zeichen"
              className={klassen('col-start-1 row-start-2 text-16', zeichen > MAX ? 'font-bold text-fehler' : 'text-tinte-2')}
            >
              {texte.zeichen.replace('{anzahl}', String(zeichen)).replace('{max}', String(MAX))}
            </span>
          )}
        </form>
        <p role="status" className={klassen('min-h-6 text-16 font-bold', meldung === texte.gemeldet ? 'text-gruen-800' : 'text-fehler')}>
          {meldung}
        </p>
      </div>

      {melden ? (
        <MeldeDialog
          ref={dialog}
          texte={texte}
          onSchliessen={() => setMelden(null)}
          onSenden={async (grund, freitext) => {
            const r = await meldeChatNachricht({ nachrichtId: melden.id, grund, freitext }).catch(() => null);
            setMelden(null);
            setMeldung(r?.ok ? texte.gemeldet : texte.fehler);
          }}
        />
      ) : null}
    </section>
  );
}

function MeldeDialog({
  ref,
  texte,
  onSchliessen,
  onSenden,
}: {
  ref: RefObject<HTMLDialogElement | null>;
  texte: ChatTexte;
  onSchliessen: () => void;
  onSenden: (grund: keyof ChatTexte['gruende'], freitext: string | null) => Promise<void>;
}) {
  const [grund, setGrund] = useState<keyof ChatTexte['gruende']>('unangemessen');
  const [freitext, setFreitext] = useState('');
  useEffect(() => {
    ref.current?.showModal();
  }, [ref]);
  return (
    <dialog
      ref={ref}
      onClose={onSchliessen}
      aria-labelledby="melden-titel"
      className="m-auto max-w-dialog rounded-lg bg-papier p-6 shadow-s3 backdrop:bg-tinte/55"
    >
      <form
        method="dialog"
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          void onSenden(grund, freitext.trim() || null);
        }}
      >
        <h2 id="melden-titel" className="text-24">
          {texte.meldenTitel}
        </h2>
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 font-bold">{texte.meldenGrund}</legend>
          {(Object.keys(texte.gruende) as (keyof ChatTexte['gruende'])[]).map((g) => (
            <label key={g} className="flex min-h-11 items-center gap-3">
              <input
                type="radio"
                name="grund"
                value={g}
                checked={grund === g}
                onChange={() => setGrund(g)}
                className="size-5 accent-gruen-700"
              />
              {texte.gruende[g]}
            </label>
          ))}
        </fieldset>
        <label className="flex flex-col gap-1">
          <span className="font-bold">{texte.meldenFreitext}</span>
          <textarea
            value={freitext}
            onChange={(e) => setFreitext(e.currentTarget.value)}
            maxLength={1000}
            rows={3}
            className="rounded-md border-2 border-rand px-3 py-2"
          />
        </label>
        <Hilfe text={texte.hilfe} nummer={texte.hilfeNummer} />
        <div className="flex flex-wrap gap-3">
          <button type="submit" className="min-h-12 rounded-md bg-gruen-700 px-5 font-bold text-weiss hover:bg-gruen-800">
            {texte.meldenSenden}
          </button>
          <button
            type="button"
            onClick={() => ref.current?.close()}
            className="min-h-12 rounded-md border-2 border-gruen-700 px-5 font-bold text-gruen-800"
          >
            {texte.abbrechen}
          </button>
        </div>
      </form>
    </dialog>
  );
}

/**
 * Chat-Regeln kurz (GC-4): je Regel das Stichwort fett mit Achtstern als Aufzählungszeichen, die Erläuterung klappt auf
 * (`details`, ohne JavaScript). Der Wortlaut bleibt unverändert: Stichwort und Erläuterung ergeben zusammen die Regel
 * (lange erste Sätze sind am Satzglied geteilt, damit die Stichworte kurz bleiben – Regelblock bei 390 px um 600 px; die Zielgröße von 44 px je Regelzeile geht vor).
 */
function Regeln({ regeln }: { regeln: ChatTexte['regeln'] }) {
  return (
    <ul className="flex max-w-text flex-col text-16">
      {regeln.map((r) => (
        <li key={r.stichwort} data-regel>
          <details className="group">
            <summary className="flex min-h-11 cursor-pointer list-none items-start gap-2 py-2.5 font-bold text-tinte hover:text-gruen-800">
              <Achtstern size={16} className="mt-1 shrink-0 text-gruen-700" />
              <span className="min-w-0 flex-1">{r.stichwort}</span>
              <ChevronDown
                aria-hidden
                className="mt-0.5 size-5 shrink-0 text-gruen-700 transition-transform duration-(--dauer-wechsel) group-open:rotate-180 motion-reduce:transition-none"
              />
            </summary>
            <p className="ps-6 pb-2 text-tinte-2">{r.text}</p>
          </details>
        </li>
      ))}
    </ul>
  );
}

/**
 * Hilfehinweis (GC-5) über „Ich habe die Regeln gelesen“ und im Melde-Dialog: Text in Zweitfarbe, die Nummer fett in
 * Grundtextfarbe als Anruf-Link mit Telefonsymbol (Ziel mindestens 44 px hoch).
 */
function Hilfe({ text, nummer, className }: { text: string; nummer: string; className?: string }) {
  return (
    <p role="note" className={klassen('rounded-md border border-linie bg-weiss px-3 py-1 text-16 text-pretty text-tinte-2', className)}>
      {/* Fließtext mit dem Link am Ende: Die Nummer folgt dem Text in derselben Zeile, solange sie passt */}
      {text}{' '}
      <a
        href={`tel:${nummer.replace(/[^\d+]/g, '')}`}
        className="inline-flex min-h-11 items-center gap-2 align-middle text-18 font-bold whitespace-nowrap text-tinte underline decoration-1 underline-offset-4 hover:text-tinte hover:decoration-2"
      >
        <Phone aria-hidden className="size-5 shrink-0 text-gruen-700" />
        {nummer}
      </a>
    </p>
  );
}

/** Plakette „Lehrkraft“ im Nachrichtenkopf. */
function Plakette({ text }: { text: string }) {
  return <span className="rounded-pill bg-gruen-50 px-2 text-16 text-gruen-800">{text}</span>;
}

/** Hinweisband über dem gesperrten Eingabefeld (GC-1): Symbol, Grund und – bei „geschlossen“ – die Wiederöffnungszeit. */
function SperrBand({ grund, text, wiederAb }: { grund: SchreibGrund; text: string; wiederAb: string }) {
  // Uhr für Zeitfenster und Stummschaltung, Pause für Pausen, sonst Schloss
  const klasse = 'mt-0.5 size-5 shrink-0 text-info';
  return (
    <div role="status" className="flex items-start gap-3 rounded-md bg-info-toenung px-4 py-3">
      {grund === 'geschlossen' || grund === 'stumm' ? (
        <Clock aria-hidden className={klasse} />
      ) : grund === 'pausiert' || grund === 'notfallpause' ? (
        <CirclePause aria-hidden className={klasse} />
      ) : (
        <Lock aria-hidden className={klasse} />
      )}
      <p className="flex flex-col text-16">
        <span className="font-bold text-tinte">{text}</span>
        {grund === 'geschlossen' ? <span className="text-tinte-2">{wiederAb}</span> : null}
      </p>
    </div>
  );
}
