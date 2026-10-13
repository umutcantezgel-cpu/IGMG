import { ArrowRight, ChevronDown } from 'lucide-react';
import NextLink from 'next/link';
import { RichText } from '@/components/website/RichText';
import { Trenner } from '@/components/website/Zustandsgrafik';
import type { Sprache } from '@/lib/i18n/inhalt';
import type { BildKarte } from '@/lib/medien/bild';
import type { BlockVon } from '@/lib/validierung/bloecke';
import { cn } from '@/lib/utils';
import { Absaetze, BlockKopf, BlockRahmen, tx } from './hilfen';

/** Baustein „Text“: Rich-Text in der Lesespalte (ADR 0006); fehlt die Sprache, Deutsch mit lang="de". */
export function TextBlockAnsicht({ b, sprache, bilder }: { b: BlockVon<'text'>; sprache: Sprache; bilder: BildKarte }) {
  const eigen = sprache === 'de' ? b.inhalt.de : b.inhalt[sprache];
  const doc = eigen ?? b.inhalt.de;
  if (!doc) return null;
  return (
    <BlockRahmen>
      <RichText
        doc={doc}
        lang={!eigen && sprache !== 'de' ? 'de' : undefined}
        className="text-18 text-pretty"
        bilder={bilder}
        sprache={sprache}
      />
    </BlockRahmen>
  );
}

/**
 * Baustein „Hinweis mit Knopf“: helle grüne Fläche mit Band oben wie der Aufruf auf „Über uns“ (H-F01). Der Knopf
 * führt zu einer internen Seite; ist das Ziel (noch) nicht öffentlich, steht nur der Text.
 */
export function AufrufAnsicht({ b, sprache, href }: { b: BlockVon<'aufruf'>; sprache: Sprache; href: string | null }) {
  const titel = tx(b.titel, sprache);
  const text = tx(b.text, sprache);
  const knopf = tx(b.knopf, sprache);
  const id = `b-${b.id}`;
  return (
    <BlockRahmen breit beschriftung={id}>
      <div className="overflow-hidden rounded-lg bg-gruen-50">
        <div aria-hidden className="h-1.5 bg-gruen-700" />
        <div className="flex flex-wrap items-center justify-between gap-6 p-6 md:p-12">
          <div className="flex min-w-0 flex-1 basis-105 flex-col gap-2">
            <h2 id={id} lang={titel.lang} className="text-display-2 text-balance">
              {titel.text}
            </h2>
            {text.text ? <Absaetze text={text.text} lang={text.lang} className="max-w-text text-18 text-tinte-2" /> : null}
          </div>
          {href ? (
            <NextLink
              href={href}
              lang={knopf.lang}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-gruen-700 px-6 font-bold text-weiss no-underline transition duration-(--dauer-rueckmeldung) hover:bg-gruen-800 hover:text-weiss active:scale-98 motion-reduce:active:scale-100 sm:w-auto"
            >
              {knopf.text}
              <ArrowRight aria-hidden className="size-5" />
            </NextLink>
          ) : null}
        </div>
      </div>
    </BlockRahmen>
  );
}

/** Baustein „Fragen und Antworten“: native Aufklapper (ohne JavaScript), ruhig gerahmt. */
export function FaqAnsicht({ b, sprache }: { b: BlockVon<'faq'>; sprache: Sprache }) {
  const titel = tx(b.titel, sprache);
  const id = `b-${b.id}`;
  return (
    <BlockRahmen beschriftung={titel.text ? id : undefined}>
      {titel.text ? <BlockKopf id={id} titel={titel.text} lang={titel.lang} /> : null}
      <div className="divide-y divide-linie overflow-hidden rounded-lg border border-linie bg-weiss">
        {b.eintraege.map((e, i) => {
          const frage = tx(e.frage, sprache);
          const antwort = tx(e.antwort, sprache);
          return (
            <details key={i} className="group">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-3 text-18 font-bold transition-colors duration-(--dauer-rueckmeldung) hover:bg-gruen-50">
                <span lang={frage.lang}>{frage.text}</span>
                <ChevronDown
                  aria-hidden
                  className="size-5 shrink-0 text-gruen-700 transition-transform duration-(--dauer-wechsel) group-open:rotate-180 motion-reduce:transition-none"
                />
              </summary>
              <Absaetze text={antwort.text} lang={antwort.lang} className="max-w-text px-5 pb-5 text-18 text-tinte-2" />
            </details>
          );
        })}
      </div>
    </BlockRahmen>
  );
}

/** Baustein „Spalten“: zwei oder drei Textkarten nebeneinander (Telefon untereinander). */
export function SpaltenAnsicht({ b, sprache }: { b: BlockVon<'spalten'>; sprache: Sprache }) {
  const titel = tx(b.titel, sprache);
  const id = `b-${b.id}`;
  const Stufe = titel.text ? 'h3' : 'h2';
  return (
    <BlockRahmen breit beschriftung={titel.text ? id : undefined}>
      {titel.text ? <BlockKopf id={id} titel={titel.text} lang={titel.lang} /> : null}
      <div className={cn('grid gap-6 md:grid-cols-2', b.spalten.length === 3 && 'lg:grid-cols-3')}>
        {b.spalten.map((s, i) => {
          const st = tx(s.titel, sprache);
          const text = tx(s.text, sprache);
          return (
            <div key={i} className="flex min-w-0 flex-col gap-3 rounded-lg border border-linie bg-weiss p-6 shadow-s1">
              {st.text ? (
                <Stufe lang={st.lang} className="font-text text-20 leading-tight font-bold tracking-normal">
                  {st.text}
                </Stufe>
              ) : null}
              <Absaetze text={text.text} lang={text.lang} className="text-18 text-tinte-2" />
            </div>
          );
        })}
      </div>
    </BlockRahmen>
  );
}

/** Baustein „Trennlinie“: Linie – Achtstern – Linie (K-008). */
export function TrennerAnsicht() {
  return (
    <div className="mx-auto w-full max-w-(--container-inhalt) px-4 md:px-8">
      <Trenner />
    </div>
  );
}
