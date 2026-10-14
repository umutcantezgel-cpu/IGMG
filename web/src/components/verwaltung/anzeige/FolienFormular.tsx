'use client';

import { BookOpen, Image as BildSymbol, ScrollText, Send, Save, Type, type LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useActionState, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { eingabe, Rahmen } from '@/components/verwaltung/Feld';
import { Klappe } from '@/components/verwaltung/Klappe';
import { Meldung } from '@/components/verwaltung/Meldung';
import { BildFeld } from '@/components/verwaltung/medienwahl/BildFeld';
import { FOLIEN_ARTEN, istReligioes, type FolienArt } from '@/lib/anzeige/folien';
import { cn } from '@/lib/utils';
import type { AnzeigeZustand } from '@/server/actions/anzeige';
import type { BildWahl } from '@/server/queries/verwaltung/medien';

type Aktion = (vorher: AnzeigeZustand, fd: FormData) => Promise<AnzeigeZustand>;
type Werte = Record<string, string | string[]>;
const SPRACHEN = ['Tr', 'En'] as const;
const WOCHENTAGE = ['1', '2', '3', '4', '5', '6', '0'] as const;
const SYMBOL: Record<FolienArt, LucideIcon> = { text: Type, bild: BildSymbol, vers: BookOpen, hadith: ScrollText };

function Abschnitt({ titel, kinder }: { titel: string; kinder: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-4 rounded-lg border border-linie bg-weiss p-5 md:p-6">
      <legend className="float-left mb-2 w-full font-display text-24 font-semibold">{titel}</legend>
      <div className="clear-both grid gap-4 md:grid-cols-2">{kinder}</div>
    </fieldset>
  );
}

/**
 * Formular „Folie“ (Verwaltung › Anzeige, AUFTRAG 3.10): Art als Karten (Text, Bild, Koranvers, Hadith), Felder je Art,
 * Zeitplan mit von/bis und Wochentagen. Vers und Hadith nur als Verweis (Stelle bzw. Nummer). Ungesteuerte Felder mit
 * Startwerten bzw. den zurückgegebenen Werten; gesteuert ist nur die Art. Fokus nach dem Absenden auf der Rückmeldung.
 */
export function FolienFormular({
  aktion,
  startwerte,
  modus,
  bilder,
}: {
  aktion: Aktion;
  startwerte: Werte;
  modus: 'neu' | 'bearbeiten';
  bilder: BildWahl[];
}) {
  const t = useTranslations('verwaltung.anzeige');
  const tv = useTranslations('verwaltung');
  const [zustand, absenden, laeuft] = useActionState(aktion, {});
  const w: Werte = zustand.werte ?? startwerte;
  const [art, setArt] = useState<FolienArt>(((FOLIEN_ARTEN as readonly string[]).includes(String(w.art)) ? w.art : 'text') as FolienArt);
  const wert = (feld: string) => (typeof w[feld] === 'string' ? (w[feld] as string) : '');
  const tage = Array.isArray(w.wochentage) ? w.wochentage : [];
  const f = (feld: string) => (zustand.feldFehler?.[feld] ? t(`fehler.${zustand.feldFehler[feld]}`) : undefined);
  const basis = useId();
  const id = (feld: string) => `${basis}-${feld}`;
  const meldung = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (zustand.fehler || zustand.gespeichert) meldung.current?.focus();
  }, [zustand]);
  const fehlerListe = Object.keys(zustand.feldFehler ?? {});
  const religioes = istReligioes(art);
  const titelLabel = art === 'bild' ? t('formular.bildtitel') : t('formular.titel');
  const beschriftung = (k: string) => {
    const stamm = k.replace(/(De|Tr|En)$/, '');
    if (stamm === 'titel') return titelLabel;
    if (k === 'bildId') return t('art.bild');
    return t(`formular.${stamm}`);
  };

  const textFeld = (
    name: string,
    label: string,
    opt: { pflicht?: boolean; hinweis?: string; max?: number; breit?: boolean; typ?: string } = {},
  ) => (
    <div className={opt.breit ? 'md:col-span-2' : undefined}>
      <Rahmen
        id={id(name)}
        label={label}
        hinweis={opt.hinweis}
        fehler={f(name)}
        pflicht={opt.pflicht ? tv('pflichtfeld') : undefined}
        kinder={(aria) => (
          <input
            {...aria}
            name={name}
            type={opt.typ ?? 'text'}
            defaultValue={wert(name)}
            required={opt.pflicht}
            maxLength={opt.max}
            className={eingabe}
          />
        )}
      />
    </div>
  );
  const textBereich = (name: string, label: string, hinweis?: string) => (
    <div className="md:col-span-2">
      <Rahmen
        id={id(name)}
        label={label}
        hinweis={hinweis}
        fehler={f(name)}
        kinder={(aria) => (
          <textarea
            {...aria}
            name={name}
            rows={4}
            maxLength={400}
            defaultValue={wert(name)}
            // Wächst mit dem Text (mindestens vier Zeilen), damit nichts im Feld verborgen bleibt
            className={cn(eingabe, 'field-sizing-content min-h-[calc(4lh+1.5rem+0.125rem)] py-3 leading-normal')}
          />
        )}
      />
    </div>
  );
  const mitSprache = (feld: string, s: 'Tr' | 'En') => t('formular.feldSprache', { feld, sprache: t(`formular.sprache.${s}`) });

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
                      {beschriftung(k)}: {f(k)}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </Meldung>
        ) : zustand.gespeichert ? (
          <Meldung art="erfolg">
            {zustand.freigabe && religioes ? t('gespeichertStatus', { status: t(`freigabe.${zustand.freigabe}`) }) : t('gespeichert')}
          </Meldung>
        ) : null}
      </div>
      {typeof startwerte.id === 'string' ? <input type="hidden" name="id" value={startwerte.id} /> : null}

      <fieldset className="flex flex-col gap-4 rounded-lg border border-linie bg-weiss p-5 md:p-6">
        <legend className="float-left mb-2 w-full font-display text-24 font-semibold">{t('formular.abschnittArt')}</legend>
        {/* Art-Karten (VA-1): oben ausgerichtet, feste Kopfzeile (Auswahl, Symbol, Titel), Beschreibung 12 px darunter */}
        <div className="clear-both grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {FOLIEN_ARTEN.map((a) => {
            const Symbol = SYMBOL[a];
            return (
              <label
                key={a}
                className="flex min-h-12 cursor-pointer flex-col gap-3 rounded-md border-2 border-linie bg-weiss p-4 has-checked:border-gruen-700 has-checked:bg-gruen-50"
              >
                <span className="flex min-h-6 items-center gap-3">
                  <input
                    type="radio"
                    name="art"
                    value={a}
                    checked={art === a}
                    onChange={() => setArt(a)}
                    className="size-5 shrink-0 accent-gruen-700"
                  />
                  <Symbol aria-hidden className="size-5 shrink-0 text-gruen-700" />
                  <span className="font-bold">{t(`art.${a}`)}</span>
                </span>
                <span className="pl-8 text-16 text-tinte-2">{t(`artText.${a}`)}</span>
              </label>
            );
          })}
        </div>
        {religioes ? <Meldung art="info">{t('formular.religioesHinweis')}</Meldung> : null}
      </fieldset>

      <Abschnitt
        titel={t('formular.abschnittInhalt')}
        kinder={
          art === 'vers' ? (
            textFeld('stelle', t('formular.stelle'), { pflicht: true, hinweis: t('formular.stelleHinweis'), max: 20 })
          ) : art === 'hadith' ? (
            textFeld('nummer', t('formular.nummer'), { pflicht: true, hinweis: t('formular.nummerHinweis'), max: 12 })
          ) : (
            <>
              {art === 'bild' ? (
                <div className="md:col-span-2">
                  <BildFeld id={id('bildId')} bilder={bilder} startwert={wert('bildId')} fehler={f('bildId')} />
                </div>
              ) : null}
              {textFeld('titelDe', titelLabel, {
                pflicht: art === 'text',
                hinweis: art === 'bild' ? t('formular.bildtitelHinweis') : t('formular.titelHinweis'),
                max: 80,
                breit: true,
              })}
              {art === 'text' ? textBereich('textDe', t('formular.text'), t('formular.textHinweis')) : null}
            </>
          )
        }
      />

      {art === 'text' || art === 'bild' ? (
        <Klappe
          titel={t('formular.abschnittUebersetzung')}
          stand={t('formular.uebersetzungStand')}
          kopfKlasse="font-display text-24 font-semibold"
          className="rounded-lg border border-linie bg-weiss p-5 md:p-6"
          open={fehlerListe.some((k) => /(Tr|En)$/.test(k)) || undefined}
        >
          <div className="mt-4 grid gap-6 lg:grid-cols-2">
            {SPRACHEN.map((s) => (
              <fieldset key={s} className="flex flex-col gap-4">
                <legend className="mb-2 font-bold">{t(`formular.sprache.${s}`)}</legend>
                {textFeld(`titel${s}`, mitSprache(titelLabel, s), { max: 80 })}
                {art === 'text' ? textBereich(`text${s}`, mitSprache(t('formular.text'), s)) : null}
              </fieldset>
            ))}
          </div>
        </Klappe>
      ) : null}

      <Abschnitt
        titel={t('formular.abschnittZeit')}
        kinder={
          <>
            {textFeld('von', t('formular.von'), { typ: 'datetime-local', hinweis: t('formular.zeitHinweis') })}
            {textFeld('bis', t('formular.bis'), { typ: 'datetime-local', hinweis: t('formular.zeitHinweis') })}
            <fieldset id={id('wochentage')} className="flex flex-col gap-2 md:col-span-2" aria-describedby={`${id('wochentage')}-hinweis`}>
              <legend className="mb-1 font-bold">{t('formular.wochentage')}</legend>
              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                {WOCHENTAGE.map((tag) => (
                  <label
                    key={tag}
                    className="flex min-h-12 cursor-pointer items-center gap-2 rounded-md border-2 border-linie bg-weiss px-3 has-checked:border-gruen-700 has-checked:bg-gruen-50"
                  >
                    <input
                      type="checkbox"
                      name="wochentage"
                      value={tag}
                      defaultChecked={tage.includes(tag)}
                      className="size-5 accent-gruen-700"
                    />
                    <span>{t(`wochentagLang.${tag}`)}</span>
                  </label>
                ))}
              </div>
              <p id={`${id('wochentage')}-hinweis`} className="text-16 text-tinte-2">
                {t('formular.wochentageHinweis')}
              </p>
            </fieldset>
          </>
        }
      />

      <div className="flex flex-wrap gap-3">
        <Button type="submit" name="einreichen" value="0" disabled={laeuft}>
          <Save aria-hidden />
          {laeuft ? t('formular.laeuft') : modus === 'neu' ? t('formular.anlegen') : t('formular.speichern')}
        </Button>
        {religioes ? (
          <Button type="submit" name="einreichen" value="1" variant="secondary" disabled={laeuft}>
            <Send aria-hidden />
            {modus === 'neu' ? t('formular.anlegenEinreichen') : t('formular.einreichen')}
          </Button>
        ) : null}
      </div>
    </form>
  );
}
