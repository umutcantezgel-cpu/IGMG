'use client';

import type { JSONContent } from '@tiptap/core';
import { Save, Send } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useActionState, useEffect, useId, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { eingabe, Rahmen } from '@/components/verwaltung/Feld';
import { Meldung } from '@/components/verwaltung/Meldung';
import { RichTextEditor } from '@/components/verwaltung/RichTextEditor';
import { THEMEN } from '@/lib/validierung/formulare/newsletter';
import type { AusgabeZustand } from '@/server/actions/newsletter';

type Aktion = (vorher: AusgabeZustand, fd: FormData) => Promise<AusgabeZustand>;
type Texte = { De: JSONContent | null; Tr: JSONContent | null; En: JSONContent | null };
const SPRACHEN = ['Tr', 'En'] as const;

function dokument(roh: string | string[] | undefined, gespeichert: JSONContent | null): JSONContent | null {
  if (typeof roh !== 'string') return gespeichert;
  try {
    return roh ? (JSON.parse(roh) as JSONContent) : null;
  } catch {
    return gespeichert;
  }
}

/**
 * Formular „Newsletter-Ausgabe“ (AUFTRAG 3.10): Betreff und Inhalt (Tiptap des Bestands) in Deutsch, Übersetzungen,
 * Themen. Speichert nur Entwürfe; der Versand ist ein eigener Schritt (`VersandFormular`).
 */
export function AusgabeFormular({
  aktion,
  startwerte,
  texte,
  modus,
}: {
  aktion: Aktion;
  startwerte: Record<string, string | string[]>;
  texte: Texte;
  modus: 'neu' | 'bearbeiten';
}) {
  const t = useTranslations('verwaltung.newsletter');
  const tv = useTranslations('verwaltung');
  const [zustand, absenden, laeuft] = useActionState(aktion, {});
  const w = zustand.werte ?? startwerte;
  const f = (feld: string) => (zustand.feldFehler?.[feld] ? t(`fehler.${zustand.feldFehler[feld]}`) : undefined);
  const basis = useId();
  const id = (feld: string) => `${basis}-${feld}`;
  const meldung = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (zustand.fehler || zustand.gespeichert) meldung.current?.focus();
  }, [zustand]);
  const fehlerListe = Object.keys(zustand.feldFehler ?? {});
  const name = (k: string) => {
    const b = k.replace(/(De|Tr|En)$/, '');
    const s = k.slice(b.length);
    const n = t(`formular.${b}`);
    return s && s !== 'De' ? t('formular.feldSprache', { feld: n, sprache: t(`formular.sprache.${s}`) }) : n;
  };
  const gewaehlt = new Set(Array.isArray(w.themen) ? w.themen : []);
  const betreff = (feld: string, pflicht = false) => (
    <Rahmen
      id={id(feld)}
      label={name(feld)}
      fehler={f(feld)}
      pflicht={pflicht ? tv('pflichtfeld') : undefined}
      kinder={(aria) => (
        <input
          {...aria}
          name={feld}
          defaultValue={typeof w[feld] === 'string' ? (w[feld] as string) : ''}
          maxLength={150}
          className={eingabe}
        />
      )}
    />
  );
  const editor = (feld: 'inhaltDe' | 'inhaltTr' | 'inhaltEn', hinweis?: string) => (
    <div id={id(feld)}>
      <RichTextEditor
        name={feld}
        startwert={dokument(zustand.werte?.[feld], texte[feld.slice(-2) as keyof Texte])}
        label={name(feld)}
        hinweis={hinweis}
        fehler={f(feld)}
      />
    </div>
  );

  return (
    <form action={absenden} className="flex flex-col gap-6" noValidate>
      <div ref={meldung} tabIndex={-1} className="outline-none">
        {zustand.fehler ? (
          <Meldung art="fehler">
            <p>{t(`fehler.${zustand.fehler}`)}</p>
            {fehlerListe.length ? (
              <ul className="mt-2 list-disc pl-5 font-normal">
                {fehlerListe.map((k) => (
                  <li key={k}>
                    <a href={`#${id(k)}`} className="text-fehler underline">
                      {name(k)}: {f(k)}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </Meldung>
        ) : zustand.gespeichert ? (
          <Meldung art="erfolg">{t('gespeichert')}</Meldung>
        ) : null}
      </div>
      {typeof startwerte.id === 'string' ? <input type="hidden" name="id" value={startwerte.id} /> : null}
      <fieldset className="flex flex-col gap-4 rounded-lg border border-linie bg-weiss p-5 md:p-6">
        <legend className="float-left mb-2 w-full font-display text-24 font-semibold">{t('formular.abschnittInhalt')}</legend>
        <div className="clear-both flex flex-col gap-4">
          {betreff('betreffDe', true)}
          {editor('inhaltDe', t('formular.inhaltHinweis'))}
        </div>
      </fieldset>
      <fieldset className="flex flex-col gap-3 rounded-lg border border-linie bg-weiss p-5 md:p-6" aria-describedby={id('themen-hinweis')}>
        <legend className="float-left mb-2 w-full font-display text-24 font-semibold">{t('formular.abschnittThemen')}</legend>
        <p id={id('themen-hinweis')} className="clear-both text-16 text-tinte-2">
          {t('formular.themenHinweis')}
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {THEMEN.map((thema) => (
            <label
              key={thema}
              className="flex min-h-12 cursor-pointer items-center gap-3 rounded-md border border-rand px-3.5 has-checked:border-2 has-checked:border-gruen-700 has-checked:bg-gruen-50"
            >
              <input
                type="checkbox"
                name="themen"
                value={thema}
                defaultChecked={gewaehlt.has(thema)}
                className="size-5.5 accent-gruen-700"
              />
              <span className="font-bold">{t(`themen.${thema}`)}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <details
        className="rounded-lg border border-linie bg-weiss p-5 md:p-6"
        open={fehlerListe.some((k) => /(Tr|En)$/.test(k)) || Boolean(texte.Tr || texte.En)}
      >
        <summary className="cursor-pointer font-display text-24 font-semibold">{t('formular.abschnittUebersetzung')}</summary>
        <p className="mt-2 text-16 text-tinte-2">{t('formular.uebersetzungHinweis')}</p>
        <div className="mt-4 grid gap-8">
          {SPRACHEN.map((s) => (
            <fieldset key={s} className="flex flex-col gap-4">
              <legend className="mb-2 font-bold">{t(`formular.sprache.${s}`)}</legend>
              {betreff(`betreff${s}`)}
              {editor(`inhalt${s}`)}
            </fieldset>
          ))}
        </div>
      </details>
      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={laeuft}>
          <Save aria-hidden />
          {modus === 'neu' ? t('formular.anlegen') : t('formular.speichern')}
        </Button>
      </div>
    </form>
  );
}

/** Versand mit ausdrücklicher Bestätigung (Haken), danach nur noch die Meldung. */
export function VersandFormular({ aktion, id: ausgabeId, empfaenger }: { aktion: Aktion; id: string; empfaenger: number }) {
  const t = useTranslations('verwaltung.newsletter');
  const [zustand, absenden, laeuft] = useActionState(aktion, {});
  const basis = useId();
  const meldung = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (zustand.fehler || zustand.versendet !== undefined) meldung.current?.focus();
  }, [zustand]);
  if (zustand.versendet !== undefined)
    return (
      <div ref={meldung} tabIndex={-1} className="outline-none">
        <Meldung art="erfolg">{t('versand.erfolg', { anzahl: zustand.versendet })}</Meldung>
      </div>
    );
  return (
    <form action={absenden} className="flex flex-col gap-4">
      <div ref={meldung} tabIndex={-1} className="outline-none">
        {zustand.fehler ? <Meldung art="fehler">{t(`fehler.${zustand.fehler}`)}</Meldung> : null}
      </div>
      <input type="hidden" name="id" value={ausgabeId} />
      <p>{t('versand.text', { anzahl: empfaenger })}</p>
      <label htmlFor={`${basis}-bestaetigt`} className="flex min-h-12 cursor-pointer items-center gap-3">
        <input
          id={`${basis}-bestaetigt`}
          type="checkbox"
          name="bestaetigt"
          value="ja"
          aria-invalid={zustand.feldFehler?.bestaetigt ? true : undefined}
          className="size-5.5 accent-gruen-700"
        />
        <span className="font-bold">{t('versand.bestaetigt')}</span>
      </label>
      <div>
        <Button type="submit" disabled={laeuft}>
          <Send aria-hidden />
          {t('versand.senden')}
        </Button>
      </div>
    </form>
  );
}
