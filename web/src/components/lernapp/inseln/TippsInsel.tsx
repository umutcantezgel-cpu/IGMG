'use client';

import { useSearchParams } from 'next/navigation';
import { Fragment, type ReactNode, useEffect, useState } from 'react';
import { richtung, type KursSlug } from '@/lib/lernapp/kurse';
import { ladePaket, ladeVerzeichnis } from '@/lib/lernapp/lokal/pakete';
import { speicher } from '@/lib/lernapp/oberflaeche/geraet';
import type { Paket } from '@/lib/lernapp/paket/typen';

export type TippsTexte = { ohneEinheit: string; leer: string; laedt: string; nichtVerfuegbar: string };

/** Knoten eines Tiptap-Dokuments (ADR 0006), so weit Tipps ihn nutzen. */
type Knoten = { type?: string; text?: string; attrs?: { level?: number }; marks?: { type?: string }[]; content?: Knoten[] };

/** Kleiner Leser für Tipps im Tiptap-Format: Absatz, Überschrift, Listen, Fett, Kursiv, Zeilenumbruch. Unbekanntes als Text. */
function zeige(k: Knoten, schluessel: string): ReactNode {
  const kinder = (k.content ?? []).map((c, i) => zeige(c, `${schluessel}.${i}`));
  switch (k.type) {
    case 'text': {
      let t: ReactNode = k.text ?? '';
      for (const m of k.marks ?? []) t = m.type === 'bold' ? <strong>{t}</strong> : m.type === 'italic' ? <em>{t}</em> : t;
      return <Fragment key={schluessel}>{t}</Fragment>;
    }
    case 'paragraph':
      return (
        <p key={schluessel} className="text-18">
          {kinder}
        </p>
      );
    case 'heading':
      return (
        <h3 key={schluessel} className="text-24">
          {kinder}
        </h3>
      );
    case 'bulletList':
      return (
        <ul key={schluessel} className="flex list-disc flex-col gap-1 ps-6 text-18">
          {kinder}
        </ul>
      );
    case 'orderedList':
      return (
        <ol key={schluessel} className="flex list-decimal flex-col gap-1 ps-6 text-18">
          {kinder}
        </ol>
      );
    case 'listItem':
      return <li key={schluessel}>{kinder}</li>;
    case 'hardBreak':
      return <br key={schluessel} />;
    default:
      return <Fragment key={schluessel}>{kinder}</Fragment>;
  }
}

type Zustand = { art: 'laedt' } | { art: 'ohne' } | { art: 'fehlt' } | { art: 'bereit'; paket: Paket };

/**
 * Grammatik-Tipps einer Einheit (PLAN §3.1, `…/tipps?e=<einheit>`): aus dem Einheitenpaket (Vorrat zuerst), in der
 * Ausgangssprache der Richtung (`lang`/`dir`). Statische Hülle, Wert erst im Browser (Suspense).
 */
export function TippsInsel({ kurs, texte, lernpfad }: { kurs: KursSlug; texte: TippsTexte; lernpfad: { adresse: string; text: string } }) {
  const e = useSearchParams().get('e');
  const [z, setZ] = useState<Zustand>({ art: 'laedt' });
  useEffect(() => {
    let aktiv = true;
    async function laden(): Promise<Zustand> {
      if (!e) return { art: 'ohne' };
      const v = await ladeVerzeichnis(kurs);
      const einheit = v?.kurs === kurs ? v.einheiten.find((x) => x.schluessel === e) : undefined;
      const paket = einheit ? await ladePaket(await speicher(), kurs, einheit) : null;
      return paket ? { art: 'bereit', paket } : { art: 'fehlt' };
    }
    void laden()
      .catch((): Zustand => ({ art: 'fehlt' }))
      .then((neu) => aktiv && setZ(neu));
    return () => {
      aktiv = false;
    };
  }, [e, kurs]);

  const zurueck = (
    <a href={lernpfad.adresse} className="inline-flex min-h-11 items-center font-bold underline-offset-4 hover:underline">
      {lernpfad.text}
    </a>
  );
  if (z.art !== 'bereit' || !z.paket.tipps.length) {
    const text =
      z.art === 'laedt' ? texte.laedt : z.art === 'ohne' ? texte.ohneEinheit : z.art === 'fehlt' ? texte.nichtVerfuegbar : texte.leer;
    return (
      <div className="flex flex-col items-start gap-4 rounded-lg border border-linie bg-weiss p-5 md:p-8">
        <p className="text-18">{text}</p>
        {z.art === 'laedt' ? null : zurueck}
      </div>
    );
  }
  const sprache = z.paket.ausgangssprache;
  return (
    <div className="flex flex-col gap-5">
      {z.paket.tipps.map((t) => (
        <article
          key={t.schluessel}
          lang={sprache}
          dir={richtung(sprache)}
          className="flex flex-col gap-3 rounded-lg border border-linie bg-weiss p-5 md:p-8"
        >
          {t.titel ? <h2 className="text-30">{t.titel}</h2> : null}
          {zeige(t.inhalt as Knoten, t.schluessel)}
        </article>
      ))}
      {zurueck}
    </div>
  );
}
