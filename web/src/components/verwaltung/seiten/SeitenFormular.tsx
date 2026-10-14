'use client';

import { BookOpenText, CircleCheck, Clock, FileText, Save, Send } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Fragment, useActionState, useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { eingabe, Rahmen } from '@/components/verwaltung/Feld';
import { Klappe } from '@/components/verwaltung/Klappe';
import { Meldung } from '@/components/verwaltung/Meldung';
import { MedienWahlDialog, type MedienWahlHandle } from '@/components/verwaltung/medienwahl/MedienWahlDialog';
import { slugAusTitel } from '@/lib/cms/slugs';
import { religioeseVerweise, type Block } from '@/lib/validierung/bloecke';
import type { SeitenStatus } from '@/lib/validierung/seite';
import { cn } from '@/lib/utils';
import type { SeitenZustand } from '@/server/actions/seiten';
import { BausteinListe } from './BausteinListe';
import type { EditorOptionen } from './typen';

type Aktion = (vorher: SeitenZustand, fd: FormData) => Promise<SeitenZustand>;

/** Startwerte der einfachen Felder (Feldnamen wie `seitenFelder`). */
export type SeitenWerte = {
  id: string;
  titelDe: string;
  titelTr: string;
  titelEn: string;
  beschreibungDe: string;
  beschreibungTr: string;
  beschreibungEn: string;
  slugDe: string;
  slugTr: string;
  slugEn: string;
  organisation: string;
  status: SeitenStatus;
  veroeffentlichenAm: string;
};

const FELDER = Object.keys({
  id: 0,
  titelDe: 0,
  titelTr: 0,
  titelEn: 0,
  beschreibungDe: 0,
  beschreibungTr: 0,
  beschreibungEn: 0,
  slugDe: 0,
  slugTr: 0,
  slugEn: 0,
  organisation: 0,
  status: 0,
  veroeffentlichenAm: 0,
} satisfies Record<keyof SeitenWerte, 0>) as (keyof SeitenWerte)[];

function Abschnitt({ nr, titel, hinweis, kinder }: { nr: number; titel: string; hinweis?: string; kinder: ReactNode }) {
  return (
    <section aria-labelledby={`abschnitt-${nr}`} className="flex flex-col gap-4 rounded-lg border border-linie bg-weiss p-4 md:p-6">
      <div className="flex flex-col gap-1">
        <h2 id={`abschnitt-${nr}`} className="flex items-center gap-3 font-display text-24 font-semibold">
          <span
            aria-hidden
            className="flex size-9 shrink-0 items-center justify-center rounded-pill bg-gruen-700 font-text text-18 font-bold text-weiss"
          >
            {nr}
          </span>
          {titel}
        </h2>
        {hinweis ? <p className="max-w-einleitung text-16 text-tinte-2">{hinweis}</p> : null}
      </div>
      {kinder}
    </section>
  );
}

/** Adresse mit Umbruchstellen nur nach „/“ und „-“ (X-5): nie mitten in einem Wort. */
function mitUmbruchstellen(adresse: string): ReactNode {
  return adresse.split(/(?<=[/-])/).map((teil, i) => (
    <Fragment key={i}>
      {i > 0 ? <wbr /> : null}
      {teil}
    </Fragment>
  ));
}

/** Abstand zwischen fokussiertem Feld und Speicherleiste bzw. Fensterrand (px). */
const LEISTE_ABSTAND = 16;

/**
 * Speicherleiste (SE-6, SB-4): klebt ab Seitenbeginn am unteren Rand, einzeilig und höchstens 64 px hoch. Damit sie
 * kein fokussiertes Feld verdeckt (WCAG 2.4.11), hält `scroll-padding-bottom` = gemessene Leistenhöhe + 16 px die
 * Felder beim Fokuswechsel oberhalb der Leiste. Der Texteditor ist dafür zu groß: Der Browser holt dort nur die
 * Einfügemarke ins Bild. Deshalb rückt die Seite nach einem Tab-Schritt nach, bis das ganze Feld über der Leiste
 * steht (höchstens so weit, dass sein Anfang sichtbar bleibt). Liefert den Callback-Ref für die Leiste.
 */
function useSpeicherleiste() {
  const [leiste, setLeiste] = useState<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!leiste) return;
    const html = document.documentElement;
    const vorher = html.style.scrollPaddingBottom;
    const setze = () => {
      html.style.scrollPaddingBottom = `${Math.ceil(leiste.getBoundingClientRect().height) + LEISTE_ABSTAND}px`;
    };
    setze();
    const beobachter = new ResizeObserver(setze);
    beobachter.observe(leiste);

    const formular = leiste.closest('form');
    let perTab = false;
    const taste = (e: KeyboardEvent) => {
      if (e.key === 'Tab') perTab = true;
    };
    const fokus = (e: FocusEvent) => {
      if (!perTab) return;
      perTab = false;
      const ziel = e.target;
      if (!(ziel instanceof HTMLElement) || leiste.contains(ziel)) return;
      // Erst nach dem eigenen Scrollen des Browsers messen
      requestAnimationFrame(() => {
        const feld = ziel.getBoundingClientRect();
        const ueberstand = feld.bottom + LEISTE_ABSTAND - leiste.getBoundingClientRect().top;
        if (ueberstand > 0) window.scrollBy({ top: Math.min(ueberstand, Math.max(0, feld.top - LEISTE_ABSTAND)) });
      });
    };
    document.addEventListener('keydown', taste, true);
    formular?.addEventListener('focusin', fokus);
    return () => {
      beobachter.disconnect();
      html.style.scrollPaddingBottom = vorher;
      document.removeEventListener('keydown', taste, true);
      formular?.removeEventListener('focusin', fokus);
    };
  }, [leiste]);
  return setLeiste;
}

/** Pfadteil eines Fehlerschlüssels → Beschriftungsschlüssel unter `baustein.feld` (für die Fehlerliste). */
const FELD_NAMEN: Record<string, string> = {
  inhalt: 'text',
  text: 'text',
  titel: 'titel',
  alt: 'alt',
  unterschrift: 'unterschrift',
  knopf: 'knopf',
  ziel: 'ziel',
  frage: 'frage',
  antwort: 'antwort',
  mediumId: 'datei',
  beschreibung: 'beschreibung',
  sure: 'sure',
  von: 'vonVers',
  bis: 'bisVers',
  nummer: 'nummer',
  anzahl: 'anzahl',
  organisation: 'organisation',
  bilder: 'bilder',
  spalten: 'spaltenAnzahl',
  eintraege: 'frage',
};

/**
 * Editor einer freien Seite (ADR 0032): vier nummerierte Schritte – Titel, Bausteine, Adresse, Veröffentlichung –
 * damit Ehrenamtliche ohne Schulung zurechtkommen. Alle Felder sind gesteuert; die Bausteine gehen als JSON im
 * verborgenen Feld `bloecke` an die Action, die mit demselben Schema prüft (`pruefeSeite`).
 */
export function SeitenFormular({
  aktion,
  startwerte,
  startBloecke,
  modus,
  optionen,
  nurLesen = false,
}: {
  aktion: Aktion;
  startwerte: SeitenWerte;
  startBloecke: Block[];
  modus: 'neu' | 'bearbeiten';
  optionen: EditorOptionen;
  nurLesen?: boolean;
}) {
  const t = useTranslations('verwaltung.seiten');
  const tf = useTranslations('verwaltung.seiten.formular');
  const tb = useTranslations('verwaltung.seiten.baustein');
  const tv = useTranslations('verwaltung');
  const [zustand, absenden, laeuft] = useActionState(aktion, {});
  const [w, setW] = useState<SeitenWerte>(startwerte);
  const [bloecke, setBloecke] = useState<Block[]>(startBloecke);
  const meldungRef = useRef<HTMLDivElement>(null);
  const speicherleiste = useSpeicherleiste();
  const basis = useId();
  const id = useCallback((schluessel: string) => `${basis}-${schluessel.replace(/[^a-zA-Z0-9_-]/g, '-')}`, [basis]);
  const medienWahl = useRef<MedienWahlHandle>(null);
  const bildAuswahl = useCallback(() => medienWahl.current?.waehle() ?? Promise.resolve(null), []);
  const fehler = zustand.feldFehler;
  const f = (feld: string) => (fehler?.[feld] ? t(`fehler.${fehler[feld]}`) : undefined);

  useEffect(() => {
    if (zustand.fehler || zustand.gespeichert) meldungRef.current?.focus();
  }, [zustand]);

  const setze = (feld: keyof SeitenWerte) => (wert: string) => setW((alt) => ({ ...alt, [feld]: wert }));
  const pflicht = tv('pflichtfeld');
  const religioes = religioeseVerweise(bloecke).length > 0;
  const slugVorschlag = w.slugDe || slugAusTitel(w.titelDe || '');
  // Übersetzt ist eine Sprache, wenn Titel und (falls vorhanden) Kurzbeschreibung eine Fassung haben
  const grunddatenUebersetzt = (['Tr', 'En'] as const).filter(
    (s) => w[`titel${s}`].trim() && (!w.beschreibungDe.trim() || w[`beschreibung${s}`].trim()),
  ).length;

  const textFeld = (
    feld: keyof SeitenWerte,
    label: string,
    opt: { hinweis?: string; pflicht?: boolean; max?: number; lang?: string; platzhalter?: string } = {},
  ) => (
    <Rahmen
      id={id(feld)}
      label={label}
      hinweis={opt.hinweis}
      fehler={f(feld)}
      pflicht={opt.pflicht ? pflicht : undefined}
      kinder={(aria) => (
        <input
          {...aria}
          type="text"
          lang={opt.lang}
          value={w[feld]}
          maxLength={opt.max}
          placeholder={opt.platzhalter}
          onChange={(e) => setze(feld)(e.target.value)}
          className={eingabe}
        />
      )}
    />
  );

  const bereichFeld = (feld: keyof SeitenWerte, label: string, opt: { hinweis?: string; lang?: string } = {}) => (
    <Rahmen
      id={id(feld)}
      label={label}
      hinweis={opt.hinweis}
      fehler={f(feld)}
      kinder={(aria) => (
        <textarea
          {...aria}
          lang={opt.lang}
          rows={2}
          maxLength={300}
          value={w[feld]}
          onChange={(e) => setze(feld)(e.target.value)}
          // Wächst mit dem Inhalt (mindestens zwei Zeilen), damit nichts im Feld verborgen bleibt
          className={cn(eingabe, 'field-sizing-content min-h-[calc(2lh+1.25rem+0.125rem)] py-2.5')}
        />
      )}
    />
  );

  /** Fehlerliste: „Titel“, „Baustein 3 (Bild): Bildbeschreibung (Türkisch)“ … mit Sprung zum Feld. */
  const fehlerName = (k: string) => {
    const block = /^block:([^:]+):(.*)$/.exec(k);
    if (block) {
      const index = bloecke.findIndex((b) => b.id === block[1]);
      const b = bloecke[index];
      const teile = block[2].split('.');
      const sprache = ['de', 'tr', 'en'].includes(teile.at(-1) ?? '') ? (teile.at(-1) as 'de' | 'tr' | 'en') : null;
      const feld = [...teile].reverse().find((x) => FELD_NAMEN[x]);
      const feldName = feld ? tb(`feld.${FELD_NAMEN[feld]}`) : tb('feld.einstellung');
      const name = b ? tb('bausteinName', { nr: index + 1, typ: tb(`typ.${b.typ}.name`) }) : tb('baustein');
      return `${name}: ${feldName}${sprache && sprache !== 'de' ? ` (${tf(`sprache.${sprache}`)})` : ''}`;
    }
    const sprache = /(Tr|En)$/.exec(k)?.[1];
    const feld = k.replace(/(De|Tr|En)$/, '');
    const name = ['titel', 'beschreibung', 'slug', 'organisation', 'status', 'veroeffentlichenAm'].includes(feld)
      ? tf(`feldname.${feld}`)
      : tf('feldname.bloecke');
    return sprache ? `${name} (${tf(`sprache.${sprache.toLowerCase()}`)})` : name;
  };
  const fehlerListe = Object.keys(fehler ?? {});
  const blockFehler = (blockId: string, nurUebersetzung = false) =>
    fehlerListe.some((k) => k.startsWith(`block:${blockId}:`) && (!nurUebersetzung || /\.(tr|en)$/.test(k)));
  const statusOptionen: { wert: SeitenStatus; icon: typeof Save; titel: string; hinweis: string; aus?: boolean }[] = [
    { wert: 'entwurf', icon: FileText, titel: tf('statusEntwurf'), hinweis: tf('statusEntwurfHinweis') },
    { wert: 'zur_pruefung', icon: Send, titel: tf('statusPruefung'), hinweis: tf('statusPruefungHinweis') },
    {
      wert: 'veroeffentlicht',
      icon: CircleCheck,
      titel: tf('statusVeroeffentlicht'),
      hinweis: optionen.darfVeroeffentlichen ? tf('statusVeroeffentlichtHinweis') : tf('statusVeroeffentlichtGesperrt'),
      aus: !optionen.darfVeroeffentlichen,
    },
  ];

  return (
    <form action={absenden} className="flex flex-col gap-6" noValidate>
      <div ref={meldungRef} tabIndex={-1} className="outline-none">
        {zustand.fehler ? (
          <Meldung art="fehler">
            <p>{t(`fehler.${zustand.fehler}`)}</p>
            {fehlerListe.length ? (
              <ul className="mt-2 list-disc pl-5 font-normal">
                {fehlerListe.map((k) => (
                  <li key={k}>
                    <a href={`#${id(k)}`} className="text-fehler underline">
                      {fehlerName(k)}: {t(`fehler.${fehler?.[k]}`)}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </Meldung>
        ) : zustand.gespeichert ? (
          <Meldung art={zustand.hinweis === 'religioesePruefung' ? 'info' : 'erfolg'}>
            {zustand.hinweis ? t(`hinweis.${zustand.hinweis}`) : t('gespeichert')}
          </Meldung>
        ) : null}
      </div>
      <input type="hidden" name="id" value={w.id} />
      <input type="hidden" name="bloecke" value={JSON.stringify(bloecke)} />
      {FELDER.filter((k) => k !== 'id').map((k) => (
        <input key={k} type="hidden" name={k} value={w[k]} />
      ))}

      <fieldset disabled={nurLesen} className="flex min-w-0 flex-col gap-6">
        <Abschnitt
          nr={1}
          titel={tf('abschnittGrunddaten')}
          kinder={
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                {textFeld('titelDe', tf('titel'), {
                  pflicht: true,
                  max: 160,
                  hinweis: tf('titelHinweis'),
                  platzhalter: tf('titelPlatzhalter'),
                })}
              </div>
              <div className="md:col-span-2">
                {bereichFeld('beschreibungDe', tf('beschreibung'), { hinweis: tf('beschreibungHinweis') })}
              </div>
              <Rahmen
                id={id('organisation')}
                label={tf('organisation')}
                hinweis={tf('organisationHinweis')}
                fehler={f('organisation')}
                kinder={(aria) => (
                  <select {...aria} value={w.organisation} onChange={(e) => setze('organisation')(e.target.value)} className={eingabe}>
                    {optionen.organisationen.map((o) => (
                      <option key={o.wert} value={o.wert}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                )}
              />
              <Klappe
                titel={tf('abschnittUebersetzungen')}
                stand={tb('uebersetzungStand', { anzahl: grunddatenUebersetzt })}
                className="rounded-md border border-linie bg-papier px-3 py-1 sm:px-4 md:col-span-2"
                open={fehlerListe.some((k) => /^(titel|beschreibung)(Tr|En)$/.test(k)) || undefined}
              >
                <p className="text-16 text-tinte-2">{tf('uebersetzungenHinweis')}</p>
                <div className="mt-4 mb-3 grid gap-6 lg:grid-cols-2">
                  {(['Tr', 'En'] as const).map((s) => (
                    <fieldset key={s} className="flex min-w-0 flex-col gap-4">
                      <legend className="mb-2 font-bold">{tf(`sprache.${s.toLowerCase()}`)}</legend>
                      {textFeld(`titel${s}`, tf('feldSprache', { feld: tf('titel'), sprache: tf(`sprache.${s.toLowerCase()}`) }), {
                        max: 160,
                        lang: s.toLowerCase(),
                      })}
                      {bereichFeld(
                        `beschreibung${s}`,
                        tf('feldSprache', { feld: tf('beschreibung'), sprache: tf(`sprache.${s.toLowerCase()}`) }),
                        {
                          lang: s.toLowerCase(),
                        },
                      )}
                    </fieldset>
                  ))}
                </div>
              </Klappe>
            </div>
          }
        />

        <Abschnitt
          nr={2}
          titel={tf('abschnittBausteine')}
          hinweis={tf('bausteineHinweis')}
          kinder={
            <>
              {fehler?.bloecke ? (
                <p id={id('bloecke')} tabIndex={-1} className="font-bold text-fehler">
                  {f('bloecke')}
                </p>
              ) : null}
              <BausteinListe
                bloecke={bloecke}
                setzeBloecke={setBloecke}
                optionen={optionen}
                bildAuswahl={bildAuswahl}
                feldId={id}
                fehlerText={(k) => (fehler?.[k] ? t(`fehler.${fehler[k]}`) : undefined)}
                hatFehler={blockFehler}
                startZu={modus === 'bearbeiten'}
              />
            </>
          }
        />

        <Abschnitt
          nr={3}
          titel={tf('abschnittAdresse')}
          hinweis={tf('adresseHinweis')}
          kinder={
            <div className="grid gap-4 md:grid-cols-3">
              {(['De', 'Tr', 'En'] as const).map((s) => {
                const feld = `slug${s}` as const;
                const sprache = s.toLowerCase() as 'de' | 'tr' | 'en';
                const wirksam = s === 'De' ? slugVorschlag : w[feld] || slugVorschlag;
                const adresse = `${sprache === 'de' ? '' : `/${sprache}`}/${wirksam}`;
                return (
                  <div key={s} className="flex min-w-0 flex-col gap-1.5">
                    {textFeld(feld, tf('feldSprache', { feld: tf('slug'), sprache: tf(`sprache.${sprache}`) }), {
                      max: 80,
                      hinweis: s === 'De' ? tf('slugHinweis') : tf('slugUebersetzungHinweis'),
                      platzhalter: s === 'De' ? slugVorschlag : undefined,
                    })}
                    <p className="text-16 break-words text-tinte-2">
                      {tf('slugVorschau')} <span className="font-bold hyphens-none text-tinte">{mitUmbruchstellen(adresse)}</span>
                    </p>
                  </div>
                );
              })}
            </div>
          }
        />

        <Abschnitt
          nr={4}
          titel={tf('abschnittVeroeffentlichung')}
          kinder={
            <div className="flex flex-col gap-4">
              <fieldset
                id={id('status')}
                tabIndex={-1}
                className="flex flex-col gap-2 outline-none"
                aria-describedby={f('status') ? `${id('status')}-fehler` : undefined}
              >
                <legend className="mb-2 font-bold">{tf('status')}</legend>
                <div className="grid gap-3 md:grid-cols-3">
                  {statusOptionen.map((o) => {
                    const gewaehlt = w.status === o.wert;
                    const Icon = o.icon;
                    return (
                      <label
                        key={o.wert}
                        htmlFor={`${id('status')}-${o.wert}`}
                        className={cn(
                          'flex min-h-12 cursor-pointer items-start gap-3 rounded-md border p-4 transition-colors duration-(--dauer-rueckmeldung)',
                          gewaehlt ? 'border-gruen-700 bg-gruen-50 ring-1 ring-gruen-700' : 'border-rand bg-weiss hover:bg-gruen-50',
                          o.aus && 'cursor-not-allowed opacity-70 hover:bg-weiss',
                        )}
                      >
                        <input
                          id={`${id('status')}-${o.wert}`}
                          type="radio"
                          name="statusWahl"
                          value={o.wert}
                          checked={gewaehlt}
                          disabled={o.aus}
                          onChange={() => setze('status')(o.wert)}
                          className="mt-1 size-5 shrink-0 accent-gruen-700"
                        />
                        <Icon aria-hidden className="mt-0.5 size-5 shrink-0 text-gruen-700" />
                        <span className="flex flex-col gap-1">
                          <strong>{o.titel}</strong>
                          <span className="text-16 text-tinte-2">{o.hinweis}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
                {f('status') ? (
                  <p id={`${id('status')}-fehler`} className="font-bold text-fehler">
                    {f('status')}
                  </p>
                ) : null}
              </fieldset>
              {religioes && !optionen.darfReligioes ? (
                <Meldung art="info">
                  <span className="inline-flex items-start gap-2">
                    <BookOpenText aria-hidden className="mt-0.5 size-5 shrink-0" />
                    {tf('religioesHinweis')}
                  </span>
                </Meldung>
              ) : null}
              <div className="max-w-md">
                <Rahmen
                  id={id('veroeffentlichenAm')}
                  label={
                    <span className="inline-flex items-center gap-2">
                      <Clock aria-hidden className="size-5 text-gruen-700" />
                      {tf('veroeffentlichenAm')}
                    </span>
                  }
                  hinweis={tf('veroeffentlichenAmHinweis')}
                  fehler={f('veroeffentlichenAm')}
                  kinder={(aria) => (
                    <input
                      {...aria}
                      type="datetime-local"
                      value={w.veroeffentlichenAm}
                      onChange={(e) => setze('veroeffentlichenAm')(e.target.value)}
                      className={eingabe}
                    />
                  )}
                />
              </div>
            </div>
          }
        />
      </fieldset>

      {!nurLesen ? <MedienWahlDialog ref={medienWahl} bilder={optionen.bilder} /> : null}
      {/* Eine Zeile (SE-3, SE-6): Knopf und Ziel des Speicherns; auf dem Telefon als Plakette, ab 768 px als Satz */}
      {!nurLesen ? (
        <div
          ref={speicherleiste}
          className="sticky bottom-0 z-(--ebene-kopf) -mx-4 flex items-center gap-3 border-t border-linie bg-papier px-4 py-1.5 shadow-s2 md:mx-0 md:rounded-lg md:border"
        >
          <Button type="submit" disabled={laeuft} className="max-sm:px-5">
            <Save aria-hidden />
            {laeuft ? tf('speichert') : modus === 'neu' ? tf('erstellen') : tf('speichern')}
          </Button>
          <p className="min-w-0 text-16 text-tinte-2">
            <span className="max-md:sr-only">{tf(`speichernHinweis.${w.status}`)}</span>
            <span aria-hidden className="rounded-pill bg-sand px-3 py-1 font-bold whitespace-nowrap text-tinte-2 md:hidden">
              {t(`status.${w.status}`)}
            </span>
          </p>
        </div>
      ) : null}
    </form>
  );
}
