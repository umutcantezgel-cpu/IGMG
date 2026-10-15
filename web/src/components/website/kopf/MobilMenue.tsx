'use client';

import { Check, ChevronDown, ChevronUp, House, LogIn, Menu, X } from 'lucide-react';
import NextLink from 'next/link';
import { type CSSProperties, type KeyboardEvent, type ReactNode, useRef, useState } from 'react';
import type { Locale } from '@/i18n/routing';
import type { Bereich, Menue } from '../navigation';
import type { SprachEintrag } from './Sprachwahl';

type Texte = {
  menue: string;
  menueOeffnen: string;
  menueSchliessen: string;
  navigation: string;
  entdecken: string;
  spracheGruppe: string;
  mobilNavigation: string;
  startseite: string;
  gebetszeiten: string;
  suche: string;
  anmelden: string;
  aktuelleSeite: string;
};

/** Angemeldetes Konto (nur Konto-Seiten, X-1): Texte, Adresse und das Abmelden-Formular kommen fertig vom Server. */
type MobilKonto = {
  initiale: string;
  vorname: string;
  meinBereichHref: string;
  angemeldetAls: string;
  meinBereich: string;
  abmelden: ReactNode;
};

/**
 * Telefonmenü (unter 1240 px) nach design/Header.dc.html: Schublade von rechts als natives <dialog>.
 * Escape und inerter Seitenkörper kommen vom Browser (modaler Dialog); Tab und Umschalt+Tab laufen im Menü im Kreis
 * (F-18: ohne das verlässt der Fokus nach dem letzten Ziel das Dokument); Schließen gibt den Fokus an den Menü-Knopf
 * zurück. Öffnen (B-03 Schublade, K-07): die Fläche kommt 24 px von rechts, danach treten die vier Gruppen gestaffelt
 * auf; Aufklapper mit `tritt-auf`; Schließen ohne Animation. Bereiche sind Überschriften (h3) mit Aufklapp-Knopf.
 * Mit `konto` (Konto-Seiten) steht oben eine Kontokarte („Angemeldet als …“, Mein Bereich, Abmelden) statt „Anmelden“ unten.
 */
export function MobilMenue({
  menues,
  startHref,
  gebetszeitenHref,
  sucheHref,
  anmeldenHref,
  konto,
  aktiv,
  aktuell,
  sprache,
  sprachen,
  texte,
}: {
  menues: Menue[];
  startHref: string;
  gebetszeitenHref: string;
  /** Suche: unter 640 px nicht in der Kopfzeile (Platz), deshalb hier */
  sucheHref: string;
  /** Konto-Anmeldung (Funktion `konten` an) oder Verwaltungsanmeldung */
  anmeldenHref: string;
  konto?: MobilKonto;
  aktiv: Bereich;
  aktuell: string;
  sprache: Locale;
  sprachen: SprachEintrag[];
  texte: Texte;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [offen, setOffen] = useState<Record<string, boolean>>({ [aktiv]: true });
  const schliessen = () => dialog.current?.close();
  /**
   * Erst das gedrückte Bild des Knopfs zeichnen, dann öffnen (INP, Z-08): showModal() macht die übrige Seite inert und
   * berechnet dafür die Stile des ganzen Dokuments synchron neu (≈ 100 ms bei 4× gedrosselter CPU, Spur in
   * protokolle/C3-menue-inp.md). Das Menü steht ein Bild später; Modalität, Fokus und Escape bleiben beim Browser.
   */
  const oeffnen = () =>
    requestAnimationFrame(() =>
      setTimeout(() => {
        const d = dialog.current;
        if (d && !d.open) d.showModal();
      }, 0),
    );
  /** F-18: Fokus bleibt im Menü – vom letzten sichtbaren Ziel zurück zum ersten und umgekehrt. */
  const fokusImKreis = (e: KeyboardEvent<HTMLDialogElement>) => {
    if (e.key !== 'Tab' || !dialog.current) return;
    const ziele = [...dialog.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')].filter(
      (el) => el.getClientRects().length > 0,
    );
    const erstes = ziele[0];
    const letztes = ziele.at(-1);
    if (!erstes || !letztes) return;
    if (e.shiftKey && document.activeElement === erstes) {
      e.preventDefault();
      letztes.focus();
    } else if (!e.shiftKey && document.activeElement === letztes) {
      e.preventDefault();
      erstes.focus();
    }
  };
  const gruppe = (i: number) => ({ '--i': i }) as CSSProperties;
  const haken = (an: boolean) =>
    an ? (
      <span className="flex text-gruen-700">
        <Check aria-hidden className="size-5" />
        <span className="sr-only">{texte.aktuelleSeite}</span>
      </span>
    ) : null;
  const zeile = (an: boolean) =>
    `flex min-h-14 items-center justify-between gap-3 rounded-md px-3 text-18 font-bold no-underline transition duration-(--dauer-rueckmeldung) ${an ? 'bg-gruen-50 text-gruen-800' : 'text-tinte hover:bg-sand'}`;

  return (
    <div className="menu:hidden">
      <button
        type="button"
        aria-haspopup="dialog"
        aria-label={texte.menueOeffnen}
        onClick={oeffnen}
        className="inline-flex min-h-12 shrink-0 druck cursor-pointer items-center gap-2 rounded-md border border-rand bg-weiss px-3 text-18 font-bold text-tinte transition duration-(--dauer-rueckmeldung) hover:border-gruen-700 hover:bg-gruen-50"
      >
        {/* px-3 statt px-4: bei 320 px passen Logo, Name und Knopf sonst nicht in die Zeile (Querscrollen 9 px, Sichtabnahme E4) */}
        <Menu aria-hidden className="size-6" />
        <span aria-hidden>{texte.menue}</span>
      </button>
      <dialog
        ref={dialog}
        aria-labelledby="mobil-menue-titel"
        onKeyDown={fokusImKreis}
        onClick={(e) => {
          if (e.target === dialog.current) schliessen();
        }}
        className="schublade m-0 ml-auto h-dvh max-h-dvh w-full max-w-110 bg-weiss p-0 text-tinte shadow-s3 backdrop:bg-tinte/45"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-4 border-b border-linie px-6 py-3">
            <div className="flex flex-col gap-0.5">
              <h2 id="mobil-menue-titel" className="text-24 leading-tight text-gruen-800">
                {texte.navigation}
              </h2>
              <p className="text-16 text-tinte-2">{texte.entdecken}</p>
            </div>
            <button
              type="button"
              aria-label={texte.menueSchliessen}
              onClick={schliessen}
              className="flex size-12 shrink-0 druck cursor-pointer items-center justify-center rounded-md border border-rand bg-weiss transition duration-(--dauer-rueckmeldung) hover:bg-gruen-50"
            >
              <X aria-hidden className="size-6" />
            </button>
          </div>
          <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 pt-4 pb-8">
            {konto ? (
              <div className="schublade-gruppe flex flex-col rounded-lg border border-linie p-2" style={gruppe(0)}>
                <div className="flex items-center gap-3 border-b border-linie px-3 pt-2 pb-3">
                  <span
                    aria-hidden
                    className="flex size-12 shrink-0 items-center justify-center rounded-pill bg-gruen-700 font-display text-24 leading-none text-weiss"
                  >
                    {konto.initiale}
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="text-16 text-tinte-2">{konto.angemeldetAls}</span>
                    <span className="truncate text-20 font-bold text-tinte">{konto.vorname}</span>
                  </span>
                </div>
                <ul className="flex flex-col gap-1 pt-2">
                  <li>
                    <NextLink
                      href={konto.meinBereichHref}
                      prefetch={false}
                      onClick={schliessen}
                      className="flex min-h-12 items-center gap-3 rounded-md px-3 text-18 font-bold text-tinte no-underline transition duration-(--dauer-rueckmeldung) hover:bg-sand hover:text-tinte"
                    >
                      <House aria-hidden className="size-5 shrink-0" />
                      {konto.meinBereich}
                    </NextLink>
                  </li>
                  <li>{konto.abmelden}</li>
                </ul>
              </div>
            ) : null}
            <div role="group" aria-labelledby="mobil-sprache" className="schublade-gruppe flex flex-col gap-2" style={gruppe(0)}>
              <span id="mobil-sprache" className="text-16 font-bold text-gruen-800">
                {texte.spracheGruppe}
              </span>
              <div className="grid grid-cols-3 gap-2">
                {sprachen.map((s) => {
                  const an = s.code === sprache;
                  return (
                    <NextLink
                      key={s.code}
                      href={s.href}
                      prefetch={false}
                      lang={s.code}
                      hrefLang={s.code}
                      aria-current={an ? 'true' : undefined}
                      className={`flex min-h-14 druck flex-col items-center justify-center rounded-md border-2 px-1 py-1.5 text-16 leading-tight font-bold text-tinte no-underline transition duration-(--dauer-rueckmeldung) ${an ? 'border-gruen-700 bg-gruen-50 text-gruen-800' : 'border-rand bg-weiss hover:bg-gruen-50'}`}
                    >
                      <span>{s.kurz}</span>
                      <span className="font-normal">{s.name}</span>
                    </NextLink>
                  );
                })}
              </div>
            </div>
            <nav aria-label={texte.mobilNavigation} className="flex flex-col gap-4">
              <ul className="schublade-gruppe flex flex-col gap-1" style={gruppe(1)}>
                <li>
                  <NextLink
                    href={startHref}
                    onClick={schliessen}
                    aria-current={aktuell === 'startseite' ? 'page' : undefined}
                    className={zeile(aktuell === 'startseite')}
                  >
                    {texte.startseite}
                    {haken(aktuell === 'startseite')}
                  </NextLink>
                </li>
                <li>
                  <NextLink
                    href={gebetszeitenHref}
                    onClick={schliessen}
                    aria-current={aktuell === 'gebetszeiten' ? 'page' : undefined}
                    className={zeile(aktuell === 'gebetszeiten')}
                  >
                    {texte.gebetszeiten}
                    {haken(aktuell === 'gebetszeiten')}
                  </NextLink>
                </li>
                <li className="sm:hidden">
                  <NextLink
                    href={sucheHref}
                    prefetch={false}
                    onClick={schliessen}
                    aria-current={aktuell === 'suche' ? 'page' : undefined}
                    className={zeile(aktuell === 'suche')}
                  >
                    {texte.suche}
                    {haken(aktuell === 'suche')}
                  </NextLink>
                </li>
              </ul>
              <ul className="schublade-gruppe flex flex-col gap-1 border-t border-linie pt-4" style={gruppe(2)}>
                {menues.map((m) => {
                  const auf = Boolean(offen[m.schluessel]);
                  const hier = aktiv === m.schluessel;
                  return (
                    <li key={m.schluessel}>
                      <h3 className="font-text font-bold">
                        <button
                          type="button"
                          aria-expanded={auf}
                          aria-controls={`mobil-${m.schluessel}`}
                          onClick={() => setOffen((o) => ({ ...o, [m.schluessel]: !auf }))}
                          className={`flex min-h-14 w-full cursor-pointer items-center justify-between gap-3 rounded-md px-3 text-left text-18 font-bold transition duration-(--dauer-rueckmeldung) hover:bg-sand ${hier ? 'text-gruen-800' : 'text-tinte'}`}
                        >
                          <span>{m.label}</span>
                          {auf ? <ChevronUp aria-hidden className="size-5" /> : <ChevronDown aria-hidden className="size-5" />}
                        </button>
                      </h3>
                      <ul
                        id={`mobil-${m.schluessel}`}
                        hidden={!auf}
                        className="tritt-auf mt-1 mb-3 flex flex-col gap-0.5 rounded-lg bg-sand p-1.5"
                      >
                        {m.punkte.map((p) => {
                          const istAktuell = aktuell === p.schluessel;
                          return (
                            <li key={p.schluessel}>
                              <NextLink
                                href={p.href}
                                onClick={schliessen}
                                aria-current={istAktuell ? 'page' : undefined}
                                className={`flex min-h-12 items-center gap-3 rounded-md px-3 py-2 text-18 no-underline transition duration-(--dauer-rueckmeldung) ${istAktuell ? 'bg-weiss font-bold text-gruen-800 shadow-s1' : 'text-tinte hover:bg-weiss'}`}
                              >
                                {p.logoBild ? (
                                  // Attribute wie next/image, auf dem Server berechnet (Header.tsx): kein Bild-JavaScript
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img {...p.logoBild} alt="" className="size-8 shrink-0 rounded-sm border border-linie" />
                                ) : null}
                                <span className="flex-1">{p.label}</span>
                                {haken(istAktuell)}
                              </NextLink>
                            </li>
                          );
                        })}
                      </ul>
                    </li>
                  );
                })}
              </ul>
            </nav>
            {konto ? null : (
              <NextLink
                href={anmeldenHref}
                prefetch={false}
                style={gruppe(3)}
                className="schublade-gruppe inline-flex min-h-12 druck items-center justify-center gap-2 rounded-md border border-gruen-700 bg-weiss px-4 text-18 font-bold text-gruen-800 no-underline transition duration-(--dauer-rueckmeldung) hover:bg-gruen-50 hover:text-gruen-800"
              >
                <LogIn aria-hidden className="size-5" />
                {texte.anmelden}
              </NextLink>
            )}
          </div>
        </div>
      </dialog>
    </div>
  );
}
