'use client';

import { ArrowRight, Bookmark } from 'lucide-react';
import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import { Stern8 } from '@/components/website/Icons';
import { fuelle, SPEICHER, type Stelle } from './leser-typen';

/** Beide Stellen als ein stabiler Text (Weiterlesen, Lesezeichen); ohne Speicher leer. */
function liesBeide(): string {
  try {
    return `${window.localStorage.getItem(SPEICHER.weiterlesen) ?? ''}\n${window.localStorage.getItem(SPEICHER.lesezeichen) ?? ''}`;
  } catch {
    return '\n';
  }
}

function abonniere(neu: () => void) {
  window.addEventListener('storage', neu);
  return () => window.removeEventListener('storage', neu);
}

type Texte = {
  titel: string;
  stelle: string;
  stelleCuz: string;
  link: string;
  lesezeichenTitel: string;
  lesezeichenLink: string;
  leer: string;
  geraet: string;
};

/**
 * „Weiterlesen“ der Übersicht (O-Q01): letzte Lesestelle und Lesezeichen aus dem Gerät (localStorage). Vom Server
 * kommt die leere Karte; im Browser erscheinen die gespeicherten Stellen. Adressen als Muster vom Server (`__s__`,
 * `__n__`), Surennamen als Liste (Umschrift aus der Quelle).
 */
export function Weiterlesen({ texte, namen, pfadSure, pfadCuz }: { texte: Texte; namen: string[]; pfadSure: string; pfadCuz: string }) {
  // Gespeicherte Stellen als Text (Server und Hydrierung: keine), danach aus dem Gerät
  const roh = useSyncExternalStore(abonniere, liesBeide, () => null);
  const stelle = (text: string | undefined): Stelle | null => {
    try {
      const s = text ? (JSON.parse(text) as Stelle) : null;
      return s && s.sure >= 1 && s.sure <= namen.length && s.vers >= 1 ? s : null;
    } catch {
      return null;
    }
  };
  const [weiterRoh, zeichenRoh] = roh?.split('\n') ?? [];
  const stellen = roh === null ? null : { weiter: stelle(weiterRoh), zeichen: stelle(zeichenRoh) };

  const ziel = (s: Stelle) =>
    s.cuz ? `${pfadCuz.replace('__n__', String(s.cuz))}#v${s.sure}-${s.vers}` : `${pfadSure.replace('__s__', String(s.sure))}#v${s.vers}`;
  const zeile = (s: Stelle) =>
    s.cuz ? fuelle(texte.stelleCuz, { cuz: s.cuz, sure: s.sure, vers: s.vers }) : fuelle(texte.stelle, { sure: s.sure, vers: s.vers });
  const knopf =
    'inline-flex min-h-12 items-center gap-2 self-start rounded-pill bg-gruen-700 px-5 font-bold text-weiss no-underline transition duration-(--dauer-rueckmeldung) hover:bg-gruen-800 hover:text-weiss active:scale-98';

  return (
    <section aria-labelledby="weiterlesen-titel" className="flex min-h-56 flex-col gap-4 rounded-lg border border-linie bg-weiss p-6 shadow-s1">
      <h2 id="weiterlesen-titel" className="flex items-center gap-2 text-24">
        <Stern8 className="text-gruen-700" />
        {texte.titel}
      </h2>
      {stellen?.weiter ? (
        <div className="flex flex-col gap-3">
          <p className="flex flex-col">
            <span className="text-20 font-bold">{namen[stellen.weiter.sure - 1]}</span>
            <span className="text-16 text-tinte-2">{zeile(stellen.weiter)}</span>
          </p>
          <Link href={ziel(stellen.weiter)} prefetch={false} className={knopf}>
            {texte.link}
            <ArrowRight aria-hidden className="size-5" />
          </Link>
        </div>
      ) : (
        <p className="text-18 text-tinte-2">{texte.leer}</p>
      )}
      {stellen?.zeichen ? (
        <p className="flex flex-wrap items-center gap-x-2 border-t border-linie pt-3 text-16">
          <Bookmark aria-hidden className="size-5 text-gruen-700" />
          <span className="font-bold">{texte.lesezeichenTitel}:</span>
          <Link href={ziel(stellen.zeichen)} prefetch={false} className="font-bold">
            {`${namen[stellen.zeichen.sure - 1]} · ${zeile(stellen.zeichen)}`}
          </Link>
        </p>
      ) : null}
      <p className="mt-auto text-16 text-tinte-3">{texte.geraet}</p>
    </section>
  );
}
