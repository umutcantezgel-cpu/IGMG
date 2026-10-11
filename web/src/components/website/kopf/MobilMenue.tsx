'use client';

import { Check, ChevronDown, ChevronUp, LogIn, Menu, X } from 'lucide-react';
import Image from 'next/image';
import NextLink from 'next/link';
import { useRef, useState } from 'react';
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
  anmelden: string;
  aktuelleSeite: string;
};

/**
 * Telefonmenü (unter 1240 px) nach design/Header.dc.html: Schublade von rechts als natives <dialog>
 * (Fokusfalle und Escape durch den Browser, kein zusätzliches Skriptpaket).
 */
export function MobilMenue({
  menues,
  startHref,
  gebetszeitenHref,
  aktiv,
  aktuell,
  sprache,
  sprachen,
  texte,
}: {
  menues: Menue[];
  startHref: string;
  gebetszeitenHref: string;
  aktiv: Bereich;
  aktuell: string;
  sprache: Locale;
  sprachen: SprachEintrag[];
  texte: Texte;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [offen, setOffen] = useState<Record<string, boolean>>({ [aktiv]: true });
  const schliessen = () => dialog.current?.close();
  const haken = (an: boolean) =>
    an ? (
      <span className="flex text-gruen-700">
        <Check aria-hidden className="size-5" />
        <span className="sr-only">{texte.aktuelleSeite}</span>
      </span>
    ) : null;

  return (
    <div className="menu:hidden">
      <button
        type="button"
        aria-haspopup="dialog"
        aria-label={texte.menueOeffnen}
        onClick={() => dialog.current?.showModal()}
        className="inline-flex min-h-12 shrink-0 cursor-pointer items-center gap-2 rounded-md border border-rand bg-weiss px-4 text-18 font-bold text-tinte hover:border-gruen-700 hover:bg-gruen-50"
      >
        <Menu aria-hidden className="size-6" />
        <span aria-hidden>{texte.menue}</span>
      </button>
      <dialog
        ref={dialog}
        aria-labelledby="mobil-menue-titel"
        onClick={(e) => {
          if (e.target === dialog.current) schliessen();
        }}
        className="m-0 ml-auto h-dvh max-h-dvh w-full max-w-[440px] bg-weiss p-0 text-tinte shadow-s3 backdrop:bg-tinte/45"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-start justify-between gap-4 border-b border-linie py-3 pr-4 pl-6">
            <div className="flex flex-col gap-0.5 pt-2">
              <h2 id="mobil-menue-titel" className="text-24 leading-tight text-gruen-800">
                {texte.navigation}
              </h2>
              <p className="text-16 text-tinte-2">{texte.entdecken}</p>
            </div>
            <button
              type="button"
              aria-label={texte.menueSchliessen}
              onClick={schliessen}
              className="flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-md border border-rand bg-weiss hover:bg-gruen-50"
            >
              <X aria-hidden className="size-6" />
            </button>
          </div>
          <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 pt-4 pb-8">
            <div role="group" aria-labelledby="mobil-sprache" className="flex flex-col gap-2">
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
                      className={`flex min-h-14 flex-col items-center justify-center rounded-md px-1 py-1.5 text-16 leading-tight font-bold text-tinte no-underline hover:text-tinte ${an ? 'border-2 border-gruen-700 bg-gruen-50' : 'border border-rand bg-weiss'}`}
                    >
                      <span>{s.kurz}</span>
                      <span className="font-normal">{s.name}</span>
                    </NextLink>
                  );
                })}
              </div>
            </div>
            <nav aria-label={texte.mobilNavigation}>
              <ul className="flex flex-col border-t border-linie">
                <li className="border-b border-linie">
                  <NextLink
                    href={startHref}
                    onClick={schliessen}
                    aria-current={aktuell === 'startseite' ? 'page' : undefined}
                    className="flex min-h-14 items-center justify-between px-1 text-18 font-bold text-tinte no-underline hover:text-gruen-800"
                  >
                    {texte.startseite}
                    {haken(aktuell === 'startseite')}
                  </NextLink>
                </li>
                <li className="border-b border-linie">
                  <NextLink
                    href={gebetszeitenHref}
                    onClick={schliessen}
                    aria-current={aktuell === 'gebetszeiten' ? 'page' : undefined}
                    className="flex min-h-14 items-center justify-between px-1 text-18 font-bold text-tinte no-underline hover:text-gruen-800"
                  >
                    {texte.gebetszeiten}
                    {haken(aktuell === 'gebetszeiten')}
                  </NextLink>
                </li>
                {menues.map((m) => {
                  const auf = Boolean(offen[m.schluessel]);
                  return (
                    <li key={m.schluessel} className="border-b border-linie">
                      <button
                        type="button"
                        aria-expanded={auf}
                        aria-controls={`mobil-${m.schluessel}`}
                        onClick={() => setOffen((o) => ({ ...o, [m.schluessel]: !auf }))}
                        className="flex min-h-14 w-full cursor-pointer items-center justify-between px-1 text-left text-18 font-bold text-tinte"
                      >
                        <span>{m.label}</span>
                        {auf ? <ChevronUp aria-hidden className="size-5" /> : <ChevronDown aria-hidden className="size-5" />}
                      </button>
                      <ul id={`mobil-${m.schluessel}`} hidden={!auf} className="flex flex-col gap-0.5 pb-3 pl-2">
                        {m.punkte.map((p) => (
                          <li key={p.schluessel}>
                            <NextLink
                              href={p.href}
                              onClick={schliessen}
                              aria-current={aktuell === p.schluessel ? 'page' : undefined}
                              className="flex min-h-12 items-center gap-3 rounded-md px-3 py-2 text-18 text-tinte no-underline hover:bg-gruen-50 hover:text-tinte"
                            >
                              {p.logo ? (
                                <Image
                                  src={p.logo}
                                  alt=""
                                  width={32}
                                  height={32}
                                  className="size-8 shrink-0 rounded-sm border border-linie"
                                />
                              ) : null}
                              <span className="flex-1">{p.label}</span>
                              {haken(aktuell === p.schluessel)}
                            </NextLink>
                          </li>
                        ))}
                      </ul>
                    </li>
                  );
                })}
              </ul>
            </nav>
            <NextLink
              href="/verwaltung/anmelden"
              prefetch={false}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-gruen-700 bg-weiss px-4 text-18 font-bold text-gruen-800 no-underline hover:bg-gruen-50 hover:text-gruen-800"
            >
              <LogIn aria-hidden className="size-5" />
              {texte.anmelden}
            </NextLink>
          </div>
        </div>
      </dialog>
    </div>
  );
}
