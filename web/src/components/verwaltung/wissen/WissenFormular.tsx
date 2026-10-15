'use client';

import type { JSONContent } from '@tiptap/core';
import { Save, Send } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useActionState, useEffect, useId, useRef, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { eingabe, Rahmen } from '@/components/verwaltung/Feld';
import { Meldung } from '@/components/verwaltung/Meldung';
import { RichTextEditor } from '@/components/verwaltung/RichTextEditor';
import type { WissenZustand } from '@/server/actions/wissen';

type Aktion = (vorher: WissenZustand, fd: FormData) => Promise<WissenZustand>;
type Texte = { De: JSONContent | null; Tr: JSONContent | null; En: JSONContent | null };
type Freigabe = 'entwurf' | 'zur_pruefung' | 'geprueft';
const SPRACHEN = ['Tr', 'En'] as const;

function Abschnitt({ titel, kinder }: { titel: string; kinder: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-4 rounded-lg border border-linie bg-weiss p-5 md:p-6">
      <legend className="float-left mb-2 w-full font-display text-24 font-semibold">{titel}</legend>
      <div className="clear-both grid gap-4">{kinder}</div>
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
 * Formular „Wissensthema“ (F-40, ADR 0030): Adresse (nur beim Anlegen), Titel, Kurztext und Einführung (Tiptap des
 * Bestands), Übersetzungen, Sichtbarkeit. Zwei Knöpfe: „Speichern“ und „Speichern und zur Prüfung geben“ (Feld
 * `einreichen`). Freigeben gibt es hier nicht – das geschieht unter „Freigaben“ durch eine zweite Person.
 */
export function WissenFormular({
  aktion,
  startwerte,
  texte,
  freigabe,
}: {
  aktion: Aktion;
  startwerte: Record<string, string>;
  texte: Texte;
  /** Stand vor dem Bearbeiten; null = neues Thema. */
  freigabe: Freigabe | null;
}) {
  const t = useTranslations('verwaltung.wissen');
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
  const stand = zustand.freigabe ?? freigabe;
  const neu = freigabe === null;
  const name = (k: string) => {
    const b = k.replace(/(De|Tr|En)$/, '');
    const s = k.slice(b.length);
    const n = t(`formular.${b}`);
    return s && s !== 'De' ? t('formular.feldSprache', { feld: n, sprache: t(`formular.sprache.${s}`) }) : n;
  };

  const text = (feld: string, opt: { pflicht?: boolean; hinweis?: string; max: number; mehrzeilig?: boolean; lang?: string }) => (
    <Rahmen
      id={id(feld)}
      label={name(feld)}
      hinweis={opt.hinweis}
      fehler={f(feld)}
      pflicht={opt.pflicht ? tv('pflichtfeld') : undefined}
      kinder={(aria) =>
        opt.mehrzeilig ? (
          <textarea
            {...aria}
            name={feld}
            lang={opt.lang}
            defaultValue={w[feld] ?? ''}
            maxLength={opt.max}
            rows={3}
            className={`${eingabe} py-2.5`}
          />
        ) : (
          <input
            {...aria}
            name={feld}
            lang={opt.lang}
            type="text"
            defaultValue={w[feld] ?? ''}
            required={opt.pflicht}
            maxLength={opt.max}
            className={eingabe}
          />
        )
      }
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
        ) : zustand.gespeichert && zustand.freigabe ? (
          <Meldung art="erfolg">{t(`gespeichert.${zustand.freigabe}`)}</Meldung>
        ) : null}
      </div>
      {startwerte.id ? <input type="hidden" name="id" value={startwerte.id} /> : null}
      {neu ? (
        <Abschnitt
          titel={t('formular.abschnittAdresse')}
          kinder={text('slug', { pflicht: true, max: 80, hinweis: t('formular.slugHinweis') })}
        />
      ) : null}
      <Abschnitt
        titel={t('formular.abschnittText')}
        kinder={
          <>
            {text('titelDe', { pflicht: true, max: 80 })}
            {text('kurztextDe', { max: 300, mehrzeilig: true, hinweis: t('formular.kurztextHinweis') })}
            {editor('inhaltDe', t('formular.inhaltHinweis'))}
          </>
        }
      />
      <details
        className="rounded-lg border border-linie bg-weiss p-5 md:p-6"
        open={fehlerListe.some((k) => /(Tr|En)$/.test(k)) || Boolean(texte.Tr || texte.En || w.titelTr || w.titelEn)}
      >
        <summary className="flex min-h-12 cursor-pointer items-center font-display text-24 font-semibold">
          {t('formular.abschnittUebersetzung')}
        </summary>
        <p className="mt-1 text-16 text-tinte-2">{t('formular.uebersetzungHinweis')}</p>
        <div className="mt-4 grid gap-8">
          {SPRACHEN.map((s) => (
            <fieldset key={s} className="grid gap-4">
              <legend className="mb-2 font-bold">{t(`formular.sprache.${s}`)}</legend>
              {text(`titel${s}`, { max: 80, lang: s.toLowerCase() })}
              {text(`kurztext${s}`, { max: 300, mehrzeilig: true, lang: s.toLowerCase() })}
              {editor(`inhalt${s}`)}
            </fieldset>
          ))}
        </div>
      </details>
      <fieldset className="flex flex-col gap-3 rounded-lg border border-linie bg-weiss p-5 md:p-6">
        <legend className="float-left mb-2 w-full font-display text-24 font-semibold">{t('formular.abschnittSichtbarkeit')}</legend>
        <div className="clear-both flex items-start gap-3">
          <input
            id={id('sichtbar')}
            type="checkbox"
            name="sichtbar"
            value="ja"
            defaultChecked={w.sichtbar === 'ja'}
            aria-describedby={id('sichtbar-hinweis')}
            className="mt-3 size-5.5 shrink-0 accent-gruen-700"
          />
          <div className="flex flex-col">
            <label htmlFor={id('sichtbar')} className="flex min-h-12 cursor-pointer items-center font-bold">
              {t('formular.sichtbar')}
            </label>
            <p id={id('sichtbar-hinweis')} className="text-16 text-tinte-2">
              {t('formular.sichtbarHinweis')}
            </p>
          </div>
        </div>
      </fieldset>
      <div className="flex flex-col gap-3 rounded-lg border border-linie bg-papier p-5">
        <p className="max-w-einleitung text-16 text-tinte-2">
          {stand === 'geprueft'
            ? t('formular.hinweisGeprueft')
            : stand === 'zur_pruefung'
              ? t('formular.hinweisPruefung')
              : t('formular.hinweisEntwurf')}
        </p>
        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={laeuft} variant={stand === null || stand === 'entwurf' ? 'secondary' : 'default'}>
            <Save aria-hidden />
            {neu ? t('formular.anlegen') : t('formular.speichern')}
          </Button>
          {stand === null || stand === 'entwurf' ? (
            <Button type="submit" name="einreichen" value="ja" disabled={laeuft}>
              <Send aria-hidden />
              {t('formular.einreichen')}
            </Button>
          ) : null}
        </div>
      </div>
    </form>
  );
}
