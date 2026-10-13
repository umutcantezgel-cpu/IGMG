'use client';

import type { JSONContent } from '@tiptap/core';
import { Save } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useActionState, useEffect, useId, useRef, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { eingabe, Rahmen } from '@/components/verwaltung/Feld';
import { Meldung } from '@/components/verwaltung/Meldung';
import { RichTextEditor } from '@/components/verwaltung/RichTextEditor';
import { BESONDERE_ARTEN } from '@/lib/validierung/besonderer-tag';
import type { TagZustand } from '@/server/actions/besondere-tage';

type Aktion = (vorher: TagZustand, fd: FormData) => Promise<TagZustand>;
type Texte = { De: JSONContent | null; Tr: JSONContent | null; En: JSONContent | null };
const SPRACHEN = ['Tr', 'En'] as const;

function Abschnitt({ titel, kinder }: { titel: string; kinder: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-4 rounded-lg border border-linie bg-weiss p-5 md:p-6">
      <legend className="float-left mb-2 w-full font-display text-24 font-semibold">{titel}</legend>
      <div className="clear-both grid gap-4 md:grid-cols-2">{kinder}</div>
    </fieldset>
  );
}

/** JSON-Text aus dem Formular (nach einem Fehler) oder das gespeicherte Dokument als Startwert des Editors. */
function dokument(roh: string | undefined, gespeichert: JSONContent | null): JSONContent | null {
  if (roh === undefined) return gespeichert;
  try {
    return roh ? (JSON.parse(roh) as JSONContent) : null;
  } catch {
    return gespeichert;
  }
}

/**
 * Formular „Besonderer Tag“ (AUFTRAG 3.10, ADR 0030): Art und Datum, Titel, Beschreibung (Tiptap des Bestands),
 * Übersetzungen, religiöse Freigabe. Den Haken „bestätigt“ sieht nur, wer `religioes.freigeben` hat; der Server
 * prüft es erneut.
 */
export function BesondererTagFormular({
  aktion,
  startwerte,
  texte,
  modus,
  darfFreigeben,
}: {
  aktion: Aktion;
  startwerte: Record<string, string>;
  texte: Texte;
  modus: 'neu' | 'bearbeiten';
  darfFreigeben: boolean;
}) {
  const t = useTranslations('verwaltung.besondereTage');
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

  const text = (feld: string, opt: { pflicht?: boolean; hinweis?: string; typ?: string; max?: number } = {}) => (
    <Rahmen
      id={id(feld)}
      label={name(feld)}
      hinweis={opt.hinweis}
      fehler={f(feld)}
      pflicht={opt.pflicht ? tv('pflichtfeld') : undefined}
      kinder={(aria) => (
        <input
          {...aria}
          name={feld}
          type={opt.typ ?? 'text'}
          defaultValue={w[feld] ?? ''}
          required={opt.pflicht}
          maxLength={opt.max}
          className={eingabe}
        />
      )}
    />
  );
  const editor = (feld: 'beschreibungDe' | 'beschreibungTr' | 'beschreibungEn', hinweis?: string) => (
    <div className="md:col-span-2" id={id(feld)}>
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
      {startwerte.id ? <input type="hidden" name="id" value={startwerte.id} /> : null}
      <Abschnitt
        titel={t('formular.abschnittTag')}
        kinder={
          <>
            <Rahmen
              id={id('art')}
              label={t('formular.art')}
              fehler={f('art')}
              kinder={(aria) => (
                <select {...aria} name="art" defaultValue={w.art ?? 'sonstiges'} className={eingabe}>
                  {BESONDERE_ARTEN.map((a) => (
                    <option key={a} value={a}>
                      {t(`art.${a}`)}
                    </option>
                  ))}
                </select>
              )}
            />
            {text('datum', { pflicht: true, typ: 'date', hinweis: t('formular.datumHinweis') })}
          </>
        }
      />
      <Abschnitt
        titel={t('formular.abschnittText')}
        kinder={
          <>
            <div className="md:col-span-2">{text('titelDe', { pflicht: true, max: 120 })}</div>
            {editor('beschreibungDe', t('formular.beschreibungHinweis'))}
          </>
        }
      />
      <details
        className="rounded-lg border border-linie bg-weiss p-5 md:p-6"
        open={fehlerListe.some((k) => /(Tr|En)$/.test(k)) || Boolean(texte.Tr || texte.En)}
      >
        <summary className="cursor-pointer font-display text-24 font-semibold">{t('formular.abschnittUebersetzung')}</summary>
        <div className="mt-4 grid gap-6">
          {SPRACHEN.map((s) => (
            <fieldset key={s} className="grid gap-4 md:grid-cols-2">
              <legend className="mb-2 font-bold">{t(`formular.sprache.${s}`)}</legend>
              <div className="md:col-span-2">{text(`titel${s}`, { max: 120 })}</div>
              {editor(`beschreibung${s}`)}
            </fieldset>
          ))}
        </div>
      </details>
      <fieldset className="flex flex-col gap-3 rounded-lg border border-linie bg-weiss p-5 md:p-6">
        <legend className="float-left mb-2 w-full font-display text-24 font-semibold">{t('formular.abschnittFreigabe')}</legend>
        {darfFreigeben ? (
          <div className="clear-both flex items-start gap-3">
            <input
              id={id('bestaetigen')}
              type="checkbox"
              name="bestaetigen"
              value="ja"
              defaultChecked={w.bestaetigen === 'ja'}
              aria-describedby={id('bestaetigen-hinweis')}
              className="mt-3 size-5.5 shrink-0 accent-gruen-700"
            />
            <div className="flex flex-col">
              <label htmlFor={id('bestaetigen')} className="flex min-h-12 cursor-pointer items-center font-bold">
                {t('formular.bestaetigen')}
              </label>
              <p id={id('bestaetigen-hinweis')} className="text-16 text-tinte-2">
                {t('formular.bestaetigenHinweis')}
              </p>
            </div>
          </div>
        ) : (
          <p className="clear-both text-16 text-tinte-2">{t('formular.ohneFreigaberecht')}</p>
        )}
      </fieldset>
      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={laeuft}>
          <Save aria-hidden />
          {modus === 'neu' ? t('formular.anlegen') : t('formular.speichern')}
        </Button>
      </div>
    </form>
  );
}
