'use client';

import { ShieldCheck } from 'lucide-react';
import { useActionState, useEffect, useState } from 'react';
import { kontoZweiFaktorPruefen, type KontoZustand } from '@/server/actions/konto';
import { fehlerText, type AnmeldeFehler } from './AnmeldeFormulare';
import { LernFeld, LernMeldung } from './Felder';

export type ZweiFaktorTexte = {
  code: string;
  ersatzcode: string;
  ersatzVerwenden: string;
  appVerwenden: string;
  bestaetigen: string;
  laeuft: string;
  neuAnmelden: string;
  fehler: AnmeldeFehler;
};

/**
 * Zweiter Schritt der Anmeldung in der Lern-App: Code aus der App oder Ersatzcode (Umschalter, ein Feld). Nutzt die
 * Konto-Action; nach Erfolg geht es zurück in die Lern-App (`weiter`), bei abgelaufenem ersten Schritt zur Anmeldung.
 */
export function ZweiFaktorFormular({ weiter, neuAnmelden, texte }: { weiter: string; neuAnmelden: string; texte: ZweiFaktorTexte }) {
  const [ersatz, setErsatz] = useState(false);
  const [zustand, aktion, laeuft] = useActionState<KontoZustand, FormData>(kontoZweiFaktorPruefen, {});
  useEffect(() => {
    if (zustand.fehler || zustand.feldFehler) document.getElementById('zwei-faktor-code')?.focus();
  }, [zustand]);
  return (
    <form action={aktion} className="flex flex-col gap-5" noValidate>
      <input type="hidden" name="art" value={ersatz ? 'ersatzcode' : 'totp'} />
      <input type="hidden" name="weiter" value={weiter} />
      {zustand.fehler && zustand.fehler !== 'zweiFaktor.fehler' ? (
        <LernMeldung id="zwei-faktor-meldung" art="fehler">
          {fehlerText(texte.fehler, zustand.fehler)}{' '}
          {zustand.fehler === 'zweiFaktor.abgelaufen' ? <a href={neuAnmelden}>{texte.neuAnmelden}</a> : null}
        </LernMeldung>
      ) : null}
      <LernFeld
        key={ersatz ? 'ersatz' : 'app'}
        id="zwei-faktor-code"
        name="code"
        inputMode={ersatz ? 'text' : 'numeric'}
        autoComplete="one-time-code"
        autoCapitalize="none"
        dir="ltr"
        maxLength={ersatz ? 32 : 6}
        required
        label={ersatz ? texte.ersatzcode : texte.code}
        fehler={zustand.feldFehler?.code ? texte.fehler.code : undefined}
      />
      <button
        type="submit"
        disabled={laeuft}
        className="inline-flex min-h-12 w-full druck cursor-pointer items-center justify-center gap-2 rounded-md bg-gruen-700 px-6 text-18 font-bold text-weiss hover:bg-gruen-800 disabled:cursor-wait disabled:opacity-80"
      >
        <ShieldCheck aria-hidden className="size-5 shrink-0" />
        {laeuft ? texte.laeuft : texte.bestaetigen}
      </button>
      <button
        type="button"
        onClick={() => setErsatz((e) => !e)}
        className="inline-flex min-h-11 cursor-pointer items-center self-start font-bold text-gruen-700 underline underline-offset-4 hover:text-gruen-800"
      >
        {ersatz ? texte.appVerwenden : texte.ersatzVerwenden}
      </button>
    </form>
  );
}
