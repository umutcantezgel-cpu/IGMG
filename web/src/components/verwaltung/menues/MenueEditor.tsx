'use client';

import { ArrowDown, ArrowRight, ArrowUp, ChevronDown, ChevronUp, Plus, Save, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useActionState, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Meldung } from '@/components/verwaltung/Meldung';
import { fokussiereSichtbar, useLeistenAbstand } from '@/components/verwaltung/speicherleiste';
import { AuswahlFeld, TextFeld } from '@/components/verwaltung/seiten/felder';
import type { ZielGruppen } from '@/components/verwaltung/seiten/typen';
import { neueBlockId, type MehrsprachigText } from '@/lib/validierung/bloecke';
import type { MenueZustand } from '@/server/actions/menues';

type Aktion = (vorher: MenueZustand, fd: FormData) => Promise<MenueZustand>;
/** `uid` nur im Editor (stabile Schlüssel beim Verschieben); das Schema der Action streift es ab. */
export type MenuePunktWerte = { titel: MehrsprachigText; beschreibung: MehrsprachigText; ziel: string; uid?: string };
export type MenueGruppeWerte = { titel: MehrsprachigText; kinder: MenuePunktWerte[] };

type Sprache = 'de' | 'tr' | 'en';

function verschiebe<T>(liste: readonly T[], von: number, nach: number): T[] {
  const neu = [...liste];
  const [x] = neu.splice(von, 1);
  neu.splice(nach, 0, x);
  return neu;
}

function mitText(w: MehrsprachigText, sprache: Sprache, wert: string): MehrsprachigText {
  if (sprache === 'de') return { ...w, de: wert };
  const neu = { ...w, [sprache]: wert };
  if (!wert) delete neu[sprache];
  return neu;
}

const leererPunkt = (): MenuePunktWerte => ({ titel: { de: '' }, beschreibung: { de: '' }, ziel: '/', uid: neueBlockId() });
/** Startwerte: feste Schlüssel aus der Position (gleich auf Server und Browser, keine Abweichung beim Hydrieren). */
const mitUid = (p: MenuePunktWerte, k: number, g = 0): MenuePunktWerte => ({ ...p, uid: p.uid ?? `s${g}x${k}` });

/**
 * Menü-Editor (ADR 0032): Kopfmenü mit Gruppen und Einträgen, Fußmenü als Liste. Reihenfolge mit „Nach oben“ und
 * „Nach unten“ (Tastatur), Fokus bleibt am verschobenen Knopf und über der klebenden Speicherleiste im Bild
 * (`speicherleiste.ts`, WCAG 2.4.11), eine Live-Region sagt die neue Position an.
 * Die Einträge gehen als JSON an die Action, die mit demselben Schema prüft (`pruefeMenue`).
 */
export function MenueEditor({
  aktion,
  schluessel,
  start,
  ziele,
}: {
  aktion: Aktion;
  schluessel: 'kopf' | 'fuss';
  start: MenueGruppeWerte[] | MenuePunktWerte[];
  ziele: ZielGruppen;
}) {
  const t = useTranslations('verwaltung.menues');
  const tv = useTranslations('verwaltung');
  const [zustand, absenden, laeuft] = useActionState(aktion, {});
  const [gruppen, setGruppen] = useState<MenueGruppeWerte[]>(() =>
    schluessel === 'kopf'
      ? (start as MenueGruppeWerte[]).map((g, i) => ({ ...g, kinder: g.kinder.map((p, k) => mitUid(p, k, i)) }))
      : [{ titel: { de: '' }, kinder: (start as MenuePunktWerte[]).map((p, k) => mitUid(p, k)) }],
  );
  const [ansage, setAnsage] = useState('');
  // Aufgeklappte Einträge (uid); neue Einträge und Einträge mit Fehlern sind offen
  const [offen, setOffen] = useState<ReadonlySet<string>>(new Set());
  const umschalten = (uid: string) =>
    setOffen((alt) => {
      const neu = new Set(alt);
      if (neu.has(uid)) neu.delete(uid);
      else neu.add(uid);
      return neu;
    });
  const alleZiele = [...ziele.seiten, ...ziele.bereiche];
  // Fokusziel nach dem nächsten Zeichnen (Element-ID); in Ereignissen gesetzt, im Effekt gelesen
  const fokusZiel = useRef<string | null>(null);
  const meldungRef = useRef<HTMLDivElement>(null);
  const leisteRef = useRef<HTMLDivElement>(null);
  const basis = useId();
  const kopf = schluessel === 'kopf';
  const fehler = zustand.feldFehler ?? {};

  useEffect(() => {
    if (zustand.fehler || zustand.gespeichert) meldungRef.current?.focus();
  }, [zustand]);
  // Klebende Speicherleiste (WCAG 2.4.11): `scroll-padding-bottom` hält fokussierte Elemente über der Leiste
  useLeistenAbstand(leisteRef);
  // Nach dem Verschieben: Fokus am Knopf (am Rand auf dem Gegenknopf) und Knopf ganz ins Bild, über der Leiste
  useEffect(() => {
    const ziel = fokusZiel.current;
    if (!ziel) return;
    fokusZiel.current = null;
    const el = document.getElementById(ziel) as HTMLButtonElement | null;
    fokussiereSichtbar(
      el && !el.disabled
        ? el
        : document.getElementById(ziel.endsWith('-oben') ? ziel.replace(/-oben$/, '-unten') : ziel.replace(/-unten$/, '-oben')),
    );
  }, [gruppen]);

  /** Element-ID eines Reihenknopfs („g:1:oben“, „p:0:2:unten“). */
  const kid = (k: string) => `${basis}-${k.replace(/:/g, '-')}`;
  const setFokus = (k: string) => {
    fokusZiel.current = kid(k);
  };
  /** Fehlerpfad im gespeicherten Format: Kopf „g.kinder.k.feld“, Fuß „k.feld“. */
  const pfad = (g: number, k: number | null, feld: string) =>
    kopf ? (k === null ? `${g}.${feld}` : `${g}.kinder.${k}.${feld}`) : `${k}.${feld}`;
  const fe = (p: string) => (fehler[p] ? t(`fehler.${fehler[p]}`) : undefined);
  const fid = (p: string) => `${basis}-${p.replace(/\./g, '-')}`;
  const daten = kopf ? gruppen : (gruppen[0]?.kinder ?? []);
  const setzePunkte = (g: number, f: (l: MenuePunktWerte[]) => MenuePunktWerte[]) =>
    setGruppen((alt) => alt.map((x, i) => (i === g ? { ...x, kinder: f(x.kinder) } : x)));

  const sp = (feld: string, s: Sprache) => (s === 'de' ? feld : t('feldSprache', { feld, sprache: t(`sprache.${s}`) }));

  const reihenKnoepfe = (
    schl: string,
    name: string,
    index: number,
    anzahl: number,
    bewegen: (von: number, nach: number) => void,
    entfernen: () => void,
  ) => (
    <div className="flex gap-2">
      <Button
        id={kid(`${schl}:oben`)}
        type="button"
        variant="outline"
        size="icon"
        disabled={index === 0}
        aria-label={t('nachOben', { name })}
        onClick={() => {
          bewegen(index, index - 1);
          setAnsage(t('verschoben', { name, nr: index }));
          setFokus(`${schl.replace(/:\d+$/, '')}:${index - 1}:oben`);
        }}
      >
        <ArrowUp aria-hidden />
      </Button>
      <Button
        id={kid(`${schl}:unten`)}
        type="button"
        variant="outline"
        size="icon"
        disabled={index === anzahl - 1}
        aria-label={t('nachUnten', { name })}
        onClick={() => {
          bewegen(index, index + 1);
          setAnsage(t('verschoben', { name, nr: index + 2 }));
          setFokus(`${schl.replace(/:\d+$/, '')}:${index + 1}:unten`);
        }}
      >
        <ArrowDown aria-hidden />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="hover:border-fehler hover:bg-fehler-toenung hover:text-fehler"
        aria-label={t('entfernen', { name })}
        onClick={() => {
          entfernen();
          setAnsage(t('entferntAnsage', { name }));
        }}
      >
        <Trash2 aria-hidden />
      </Button>
    </div>
  );

  const textFelder = (
    p: (s: Sprache) => string,
    w: MehrsprachigText,
    setze: (w: MehrsprachigText) => void,
    label: string,
    s: Sprache,
    opt: { pflicht?: boolean; hinweis?: string; max: number },
  ) => (
    <TextFeld
      id={fid(p(s))}
      label={sp(label, s)}
      hinweis={s === 'de' ? opt.hinweis : undefined}
      fehler={fe(p(s))}
      pflicht={opt.pflicht && s === 'de' ? tv('pflichtfeld') : undefined}
      lang={s === 'de' ? undefined : s}
      max={opt.max}
      wert={s === 'de' ? w.de : (w[s] ?? '')}
      aendern={(v) => setze(mitText(w, s, v))}
    />
  );

  const uebersetzungen = (inhalt: (s: Sprache) => ReactNode, offen: boolean) => (
    <details className="rounded-md border border-linie bg-papier px-4 py-3" open={offen || undefined}>
      <summary className="flex min-h-12 cursor-pointer items-center font-bold">{t('uebersetzungen')}</summary>
      <p className="mt-1 text-16 text-tinte-2">{t('uebersetzungenHinweis')}</p>
      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        {(['tr', 'en'] as const).map((s) => (
          <fieldset key={s} className="flex min-w-0 flex-col gap-4">
            <legend className="mb-2 font-bold">{t(`sprache.${s}`)}</legend>
            {inhalt(s)}
          </fieldset>
        ))}
      </div>
    </details>
  );

  const punkte = (g: number, liste: MenuePunktWerte[]) => (
    <ol className="flex flex-col gap-3">
      {liste.map((p, k) => {
        const name = t('eintragName', { nr: k + 1, titel: p.titel.de || t('ohneName') });
        const schl = `p:${g}:${k}`;
        const setze = (f: (x: MenuePunktWerte) => MenuePunktWerte) => setzePunkte(g, (l) => l.map((x, i) => (i === k ? f(x) : x)));
        const fehlerHier = Object.keys(fehler).some((x) => x.startsWith(pfad(g, k, '')) && /\.(tr|en)$/.test(x));
        const uid = p.uid ?? `${g}-${k}`;
        const mitFehler = Object.keys(fehler).some((x) => x.startsWith(pfad(g, k, '')));
        const aufgeklappt = offen.has(uid) || mitFehler;
        const koerper = `${basis}-eintrag-${uid}`;
        const ziel = alleZiele.find((z) => z.wert === p.ziel)?.label ?? p.ziel;
        return (
          <li key={uid} className="flex flex-col gap-4 rounded-md border border-linie bg-papier p-3 md:p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 flex-1 basis-60 flex-col">
                <h3 className="font-text text-18 font-bold tracking-normal">{name}</h3>
                <p className="flex items-center gap-1.5 text-16 text-tinte-2">
                  <ArrowRight aria-hidden className="size-4 shrink-0 text-gruen-700" />
                  <span className="truncate">{ziel}</span>
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="min-h-12"
                aria-expanded={aufgeklappt}
                aria-controls={koerper}
                aria-label={t(aufgeklappt ? 'zuklappenName' : 'bearbeitenName', { name })}
                onClick={() => umschalten(uid)}
              >
                {aufgeklappt ? <ChevronUp aria-hidden /> : <ChevronDown aria-hidden />}
                {aufgeklappt ? t('zuklappen') : t('bearbeiten')}
              </Button>
              {reihenKnoepfe(
                schl,
                name,
                k,
                liste.length,
                (von, nach) => setzePunkte(g, (l) => verschiebe(l, von, nach)),
                () => setzePunkte(g, (l) => l.filter((_, i) => i !== k)),
              )}
            </div>
            {aufgeklappt ? (
              <div id={koerper} className="flex flex-col gap-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {textFelder(
                    (s) => pfad(g, k, `titel.${s}`),
                    p.titel,
                    (w) => setze((x) => ({ ...x, titel: w })),
                    t('titelFeld'),
                    'de',
                    { pflicht: true, max: 60 },
                  )}
                  <AuswahlFeld
                    id={fid(pfad(g, k, 'ziel'))}
                    label={t('zielFeld')}
                    fehler={fe(pfad(g, k, 'ziel'))}
                    pflicht={tv('pflichtfeld')}
                    wert={p.ziel}
                    aendern={(v) => setze((x) => ({ ...x, ziel: v }))}
                    gruppen={[
                      { label: t('zielSeiten'), optionen: ziele.seiten },
                      { label: t('zielBereiche'), optionen: ziele.bereiche },
                    ]}
                  />
                  {kopf ? (
                    <div className="md:col-span-2">
                      {textFelder(
                        (s) => pfad(g, k, `beschreibung.${s}`),
                        p.beschreibung,
                        (w) => setze((x) => ({ ...x, beschreibung: w })),
                        t('beschreibungFeld'),
                        'de',
                        {
                          max: 160,
                          hinweis: t('beschreibungHinweis'),
                        },
                      )}
                    </div>
                  ) : null}
                </div>
                {uebersetzungen(
                  (s) => (
                    <>
                      {textFelder(
                        (x) => pfad(g, k, `titel.${x}`),
                        p.titel,
                        (w) => setze((x) => ({ ...x, titel: w })),
                        t('titelFeld'),
                        s,
                        { max: 60 },
                      )}
                      {kopf
                        ? textFelder(
                            (x) => pfad(g, k, `beschreibung.${x}`),
                            p.beschreibung,
                            (w) => setze((x) => ({ ...x, beschreibung: w })),
                            t('beschreibungFeld'),
                            s,
                            {
                              max: 160,
                            },
                          )
                        : null}
                    </>
                  ),
                  fehlerHier,
                )}
              </div>
            ) : null}
          </li>
        );
      })}
    </ol>
  );

  const eintragHinzufuegen = (g: number) => (
    <Button
      type="button"
      variant="secondary"
      className="self-start"
      disabled={(gruppen[g]?.kinder.length ?? 0) >= 12}
      onClick={() => {
        const neu = leererPunkt();
        setzePunkte(g, (l) => [...l, neu]);
        setOffen((alt) => new Set(alt).add(neu.uid!));
        setAnsage(t('hinzugefuegt', { name: t('eintrag', { nr: (gruppen[g]?.kinder.length ?? 0) + 1 }) }));
      }}
    >
      <Plus aria-hidden />
      {t('eintragHinzufuegen')}
    </Button>
  );

  const fehlerListe = Object.keys(fehler);
  return (
    <form action={absenden} className="flex flex-col gap-6" noValidate>
      <p role="status" aria-live="polite" className="sr-only">
        {ansage}
      </p>
      <div ref={meldungRef} tabIndex={-1} className="outline-none">
        {zustand.fehler ? (
          <Meldung art="fehler">
            <p>{t(`fehler.${zustand.fehler}`)}</p>
            {fehlerListe.length ? (
              <ul className="mt-2 list-disc pl-5 font-normal">
                {fehlerListe.map((k) => (
                  <li key={k}>
                    <a href={`#${fid(k)}`} className="text-fehler underline">
                      {t(`fehler.${fehler[k]}`)}
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
      <input type="hidden" name="schluessel" value={schluessel} />
      <input type="hidden" name="eintraege" value={JSON.stringify(daten)} />

      {kopf ? (
        <ol className="flex flex-col gap-5">
          {gruppen.map((g, i) => {
            const name = t('gruppeName', { nr: i + 1, titel: g.titel.de || t('ohneName') });
            const setzeTitel = (w: MehrsprachigText) => setGruppen((alt) => alt.map((x, k) => (k === i ? { ...x, titel: w } : x)));
            return (
              <li key={i} className="flex flex-col gap-4 rounded-lg border border-linie bg-weiss p-4 shadow-s1 md:p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 id={fid(`${i}`)} tabIndex={-1} className="font-display text-24 font-semibold outline-none">
                    {name}
                  </h2>
                  {reihenKnoepfe(
                    `g:${i}`,
                    name,
                    i,
                    gruppen.length,
                    (von, nach) => setGruppen((alt) => verschiebe(alt, von, nach)),
                    () => setGruppen((alt) => alt.filter((_, k) => k !== i)),
                  )}
                </div>
                <div className="max-w-md">
                  {textFelder((s) => `${i}.titel.${s}`, g.titel, setzeTitel, t('gruppeTitel'), 'de', { pflicht: true, max: 40 })}
                </div>
                {uebersetzungen(
                  (s) => textFelder((x) => `${i}.titel.${x}`, g.titel, setzeTitel, t('gruppeTitel'), s, { max: 40 }),
                  fehlerListe.some((x) => x === `${i}.titel.tr` || x === `${i}.titel.en`),
                )}
                {fe(`${i}.kinder`) ? <p className="font-bold text-fehler">{fe(`${i}.kinder`)}</p> : null}
                {punkte(i, g.kinder)}
                {eintragHinzufuegen(i)}
              </li>
            );
          })}
        </ol>
      ) : (
        <div className="flex flex-col gap-4">
          {punkte(0, gruppen[0]?.kinder ?? [])}
          {eintragHinzufuegen(0)}
        </div>
      )}
      {kopf ? (
        <Button
          type="button"
          variant="secondary"
          size="lg"
          className="self-start"
          disabled={gruppen.length >= 6}
          onClick={() => {
            const neu = leererPunkt();
            setGruppen((alt) => [...alt, { titel: { de: '' }, kinder: [neu] }]);
            setOffen((alt) => new Set(alt).add(neu.uid!));
            setAnsage(t('hinzugefuegt', { name: t('gruppe', { nr: gruppen.length + 1 }) }));
          }}
        >
          <Plus aria-hidden />
          {t('gruppeHinzufuegen')}
        </Button>
      ) : null}
      <div
        ref={leisteRef}
        className="sticky bottom-0 z-(--ebene-kopf) -mx-4 flex flex-wrap items-center gap-3 border-t border-linie bg-papier px-4 py-3 shadow-s2 md:mx-0 md:rounded-lg md:border"
      >
        <Button type="submit" size="lg" disabled={laeuft}>
          <Save aria-hidden />
          {laeuft ? t('speichert') : t('speichern')}
        </Button>
        <p className="text-16 text-tinte-2 max-md:hidden">{t('entwurfHinweis')}</p>
      </div>
    </form>
  );
}
