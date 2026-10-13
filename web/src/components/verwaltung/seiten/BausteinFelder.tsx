'use client';

import type { JSONContent } from '@tiptap/core';
import { ArrowDown, ArrowUp, ImagePlus, Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import type { BildAuswahl } from '@/components/verwaltung/richtext/typen';
import { ORGANISATION_KUERZEL } from '@/lib/rechte/matrix';
import type { Block, BlockVon, MehrsprachigText } from '@/lib/validierung/bloecke';
import { HADITH_SAMMLUNGEN, VERSE_MAX } from '@/lib/validierung/bloecke';
import { AuswahlFeld, BereichFeld, SchalterFeld, TextFeld, ZahlFeld } from './felder';
import { BausteinText } from './BausteinText';
import type { EditorOptionen, Sprache } from './typen';

/**
 * Felder eines Bausteins in einer Sprache (Seiten-Editor, ADR 0032). Deutsch zeigt alle Einstellungen; Türkisch und
 * Englisch nur die Texte (im Abschnitt „Übersetzungen“ des Bausteins). Änderungen gehen als Funktion an den Editor,
 * der den Baustein über seine ID ersetzt – so bleibt die Zuordnung auch nach dem Verschieben richtig.
 */
export type FeldHilfen = {
  /** Element-ID eines Felds (für Sprungverweise aus der Fehlerliste). */
  fid: (pfad: string) => string;
  /** Übersetzter Fehlertext eines Felds oder undefined. */
  fehler: (pfad: string) => string | undefined;
};

type Props = FeldHilfen & {
  block: Block;
  sprache: Sprache;
  aendern: (neu: (b: Block) => Block) => void;
  optionen: EditorOptionen;
  bildAuswahl: BildAuswahl;
};

/** Hat der Baustein Texte, die übersetzt werden können? */
export function hatUebersetzbareTexte(b: Block): boolean {
  return !['trenner', 'vers', 'hadith'].includes(b.typ);
}

const KLEIN_KNOPF = 'size-12';

/** Zeile mit „Nach oben“, „Nach unten“, „Entfernen“ für Listen innerhalb eines Bausteins (Galerie, Fragen, Spalten). */
function ListenKnoepfe({
  index,
  anzahl,
  name,
  verschieben,
  entfernen,
  minimum,
}: {
  index: number;
  anzahl: number;
  name: string;
  verschieben: (von: number, nach: number) => void;
  entfernen: (i: number) => void;
  minimum: number;
}) {
  const t = useTranslations('verwaltung.seiten.baustein');
  return (
    <div className="flex gap-2">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className={KLEIN_KNOPF}
        disabled={index === 0}
        onClick={() => verschieben(index, index - 1)}
        aria-label={t('eintragNachOben', { name })}
      >
        <ArrowUp aria-hidden />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className={KLEIN_KNOPF}
        disabled={index === anzahl - 1}
        onClick={() => verschieben(index, index + 1)}
        aria-label={t('eintragNachUnten', { name })}
      >
        <ArrowDown aria-hidden />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-12 hover:border-fehler hover:bg-fehler-toenung hover:text-fehler"
        disabled={anzahl <= minimum}
        onClick={() => entfernen(index)}
        aria-label={t('eintragEntfernen', { name })}
      >
        <Trash2 aria-hidden />
      </Button>
    </div>
  );
}

function verschiebe<T>(liste: readonly T[], von: number, nach: number): T[] {
  const neu = [...liste];
  const [x] = neu.splice(von, 1);
  neu.splice(nach, 0, x);
  return neu;
}

/** Text einer Sprache setzen: leere Übersetzungen fallen weg. */
function mitText(w: MehrsprachigText, sprache: Sprache, wert: string): MehrsprachigText {
  if (sprache === 'de') return { ...w, de: wert };
  const neu = { ...w, [sprache]: wert };
  if (!wert) delete neu[sprache];
  return neu;
}

const textVon = (w: MehrsprachigText, sprache: Sprache) => (sprache === 'de' ? w.de : (w[sprache] ?? ''));

export function BausteinFelder({ block, sprache, aendern, optionen, bildAuswahl, fid, fehler }: Props) {
  const t = useTranslations('verwaltung.seiten.baustein');
  const tf = useTranslations('verwaltung.seiten.formular');
  const tv = useTranslations('verwaltung');
  const de = sprache === 'de';
  const pflicht = de ? tv('pflichtfeld') : undefined;
  const sp = (label: string) => (de ? label : tf('feldSprache', { feld: label, sprache: tf(`sprache.${sprache}`) }));
  const lang = de ? undefined : sprache;

  /** Mehrsprachiges Textfeld an Pfad `feld` (z. B. „titel“ oder „eintraege.0.frage“). */
  const mtext = (
    feld: string,
    wert: MehrsprachigText,
    setze: (w: MehrsprachigText) => void,
    label: string,
    opt: { pflicht?: boolean; hinweis?: string; max?: number; bereich?: boolean; zeilen?: number } = {},
  ): ReactNode => {
    const pfad = `${feld}.${sprache}`;
    const gemeinsam = {
      id: fid(pfad),
      label: sp(label),
      fehler: fehler(pfad),
      pflicht: opt.pflicht ? pflicht : undefined,
      hinweis: de ? opt.hinweis : undefined,
      lang,
      wert: textVon(wert, sprache),
      aendern: (v: string) => setze(mitText(wert, sprache, v)),
      max: opt.max,
    };
    return opt.bereich ? <BereichFeld {...gemeinsam} zeilen={opt.zeilen} /> : <TextFeld {...gemeinsam} />;
  };

  const optionalerTitel = (b: { titel: MehrsprachigText }) =>
    mtext('titel', b.titel, (w) => aendern((x) => ({ ...x, titel: w }) as Block), t('feld.titelOptional'), { max: 160 });

  switch (block.typ) {
    case 'text': {
      const doc = block.inhalt[sprache];
      return (
        <BausteinText
          id={fid(`inhalt.${sprache}`)}
          label={sp(t('feld.text'))}
          hinweis={de ? t('feld.textHinweis') : undefined}
          fehler={fehler(`inhalt.${sprache}`)}
          startwert={(doc as JSONContent | null) ?? null}
          bildAuswahl={bildAuswahl}
          aendern={(neu) =>
            aendern((x) => (x.typ === 'text' ? { ...x, inhalt: { ...x.inhalt, [sprache]: neu as never } } : x))
          }
        />
      );
    }
    case 'bild': {
      const bild = optionen.bilder.find((b) => b.id === block.mediumId);
      return (
        <div className="flex flex-col gap-4">
          {de ? (
            <BildWahlFeld
              id={fid('mediumId')}
              fehler={fehler('mediumId')}
              bild={bild}
              gesetzt={Boolean(block.mediumId)}
              waehlen={async () => {
                const wahl = await bildAuswahl();
                if (!wahl) return;
                const alt = optionen.bilder.find((b) => b.id === wahl.mediumId)?.alt ?? '';
                aendern((x) => (x.typ === 'bild' ? { ...x, mediumId: wahl.mediumId, alt: x.alt.de ? x.alt : { ...x.alt, de: alt } } : x));
              }}
            />
          ) : null}
          {mtext('alt', block.alt, (w) => aendern((x) => ({ ...x, alt: w }) as Block), t('feld.alt'), {
            pflicht: true,
            hinweis: t('feld.altHinweis'),
            max: 300,
          })}
          {mtext('unterschrift', block.unterschrift, (w) => aendern((x) => ({ ...x, unterschrift: w }) as Block), t('feld.unterschrift'), {
            max: 300,
          })}
          {de ? (
            <AuswahlFeld
              id={fid('breite')}
              label={t('feld.breite')}
              wert={block.breite}
              aendern={(v) => aendern((x) => (x.typ === 'bild' ? { ...x, breite: v === 'breit' ? 'breit' : 'text' } : x))}
              optionen={[
                { wert: 'text', label: t('feld.breiteText') },
                { wert: 'breit', label: t('feld.breiteBreit') },
              ]}
            />
          ) : null}
        </div>
      );
    }
    case 'galerie': {
      const anzahl = block.bilder.length;
      const setzeBilder = (f: (liste: BlockVon<'galerie'>['bilder']) => BlockVon<'galerie'>['bilder']) =>
        aendern((x) => (x.typ === 'galerie' ? { ...x, bilder: f(x.bilder) } : x));
      return (
        <div className="flex flex-col gap-4">
          {optionalerTitel(block)}
          {fehler('bilder') ? (
            <p id={fid('bilder')} tabIndex={-1} className="font-bold text-fehler">
              {fehler('bilder')}
            </p>
          ) : null}
          <ol className="flex flex-col gap-4">
            {block.bilder.map((g, i) => {
              const bild = optionen.bilder.find((b) => b.id === g.mediumId);
              const name = t('galerieBild', { nr: i + 1 });
              return (
                <li key={`${g.mediumId}-${i}`} className="flex flex-col gap-3 rounded-md border border-linie bg-papier p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="font-bold">{name}</span>
                    {de ? (
                      <ListenKnoepfe
                        index={i}
                        anzahl={anzahl}
                        name={name}
                        minimum={0}
                        verschieben={(von, nach) => setzeBilder((l) => verschiebe(l, von, nach))}
                        entfernen={(x) => setzeBilder((l) => l.filter((_, k) => k !== x))}
                      />
                    ) : null}
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                    {de ? <Vorschaubild bild={bild} id={fid(`bilder.${i}.mediumId`)} fehler={fehler(`bilder.${i}.mediumId`)} /> : null}
                    <div className="min-w-0 flex-1">
                      {mtext(
                        `bilder.${i}.alt`,
                        g.alt,
                        (w) => setzeBilder((l) => l.map((x, k) => (k === i ? { ...x, alt: w } : x))),
                        t('feld.alt'),
                        { pflicht: true, max: 300 },
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
          {de ? (
            <Button
              type="button"
              variant="secondary"
              className="self-start"
              disabled={anzahl >= 24}
              onClick={async () => {
                const wahl = await bildAuswahl();
                if (!wahl) return;
                const alt = optionen.bilder.find((b) => b.id === wahl.mediumId)?.alt ?? '';
                setzeBilder((l) => [...l, { mediumId: wahl.mediumId, alt: { de: alt } }]);
              }}
            >
              <ImagePlus aria-hidden />
              {t('galerieHinzufuegen')}
            </Button>
          ) : null}
        </div>
      );
    }
    case 'aufruf':
      return (
        <div className="flex flex-col gap-4">
          {mtext('titel', block.titel, (w) => aendern((x) => ({ ...x, titel: w }) as Block), t('feld.titel'), { pflicht: true, max: 160 })}
          {mtext('text', block.text, (w) => aendern((x) => ({ ...x, text: w }) as Block), t('feld.textKurz'), {
            bereich: true,
            zeilen: 3,
            max: 600,
          })}
          {mtext('knopf', block.knopf, (w) => aendern((x) => ({ ...x, knopf: w }) as Block), t('feld.knopf'), {
            pflicht: true,
            hinweis: t('feld.knopfHinweis'),
            max: 60,
          })}
          {de ? (
            <AuswahlFeld
              id={fid('ziel')}
              label={t('feld.ziel')}
              hinweis={t('feld.zielHinweis')}
              fehler={fehler('ziel')}
              pflicht={pflicht}
              wert={block.ziel}
              aendern={(v) => aendern((x) => (x.typ === 'aufruf' ? { ...x, ziel: v } : x))}
              gruppen={[
                { label: t('zielSeiten'), optionen: optionen.ziele.seiten },
                { label: t('zielBereiche'), optionen: optionen.ziele.bereiche },
              ]}
            />
          ) : null}
        </div>
      );
    case 'faq': {
      const anzahl = block.eintraege.length;
      const setze = (f: (liste: BlockVon<'faq'>['eintraege']) => BlockVon<'faq'>['eintraege']) =>
        aendern((x) => (x.typ === 'faq' ? { ...x, eintraege: f(x.eintraege) } : x));
      return (
        <div className="flex flex-col gap-4">
          {optionalerTitel(block)}
          <ol className="flex flex-col gap-4">
            {block.eintraege.map((e, i) => {
              const name = t('frageNr', { nr: i + 1 });
              return (
                <li key={i} className="flex flex-col gap-3 rounded-md border border-linie bg-papier p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="font-bold">{name}</span>
                    {de ? (
                      <ListenKnoepfe
                        index={i}
                        anzahl={anzahl}
                        name={name}
                        minimum={1}
                        verschieben={(von, nach) => setze((l) => verschiebe(l, von, nach))}
                        entfernen={(x) => setze((l) => l.filter((_, k) => k !== x))}
                      />
                    ) : null}
                  </div>
                  {mtext(`eintraege.${i}.frage`, e.frage, (w) => setze((l) => l.map((x, k) => (k === i ? { ...x, frage: w } : x))), t('feld.frage'), {
                    pflicht: true,
                    max: 300,
                  })}
                  {mtext(
                    `eintraege.${i}.antwort`,
                    e.antwort,
                    (w) => setze((l) => l.map((x, k) => (k === i ? { ...x, antwort: w } : x))),
                    t('feld.antwort'),
                    { pflicht: true, bereich: true, zeilen: 4, max: 3000, hinweis: t('feld.absatzHinweis') },
                  )}
                </li>
              );
            })}
          </ol>
          {de ? (
            <Button
              type="button"
              variant="secondary"
              className="self-start"
              disabled={anzahl >= 40}
              onClick={() => setze((l) => [...l, { frage: { de: '' }, antwort: { de: '' } }])}
            >
              <Plus aria-hidden />
              {t('frageHinzufuegen')}
            </Button>
          ) : null}
        </div>
      );
    }
    case 'trenner':
      return de ? <p className="text-16 text-tinte-2">{t('trennerHinweis')}</p> : null;
    case 'spalten': {
      const setze = (f: (liste: BlockVon<'spalten'>['spalten']) => BlockVon<'spalten'>['spalten']) =>
        aendern((x) => (x.typ === 'spalten' ? { ...x, spalten: f(x.spalten) } : x));
      return (
        <div className="flex flex-col gap-4">
          {optionalerTitel(block)}
          {de ? (
            <AuswahlFeld
              id={fid('spalten')}
              label={t('feld.spaltenAnzahl')}
              fehler={fehler('spalten')}
              wert={String(block.spalten.length)}
              aendern={(v) =>
                setze((l) => (v === '3' ? [...l.slice(0, 3), ...(l.length < 3 ? [{ titel: { de: '' }, text: { de: '' } }] : [])] : l.slice(0, 2)))
              }
              optionen={[
                { wert: '2', label: t('feld.zweiSpalten') },
                { wert: '3', label: t('feld.dreiSpalten') },
              ]}
            />
          ) : null}
          <div className="grid gap-4 lg:grid-cols-2">
            {block.spalten.map((s, i) => (
              <fieldset key={i} className="flex min-w-0 flex-col gap-3 rounded-md border border-linie bg-papier p-4">
                <legend className="font-bold">{t('spalteNr', { nr: i + 1 })}</legend>
                {mtext(`spalten.${i}.titel`, s.titel, (w) => setze((l) => l.map((x, k) => (k === i ? { ...x, titel: w } : x))), t('feld.titelOptional'), {
                  max: 120,
                })}
                {mtext(`spalten.${i}.text`, s.text, (w) => setze((l) => l.map((x, k) => (k === i ? { ...x, text: w } : x))), t('feld.text'), {
                  pflicht: true,
                  bereich: true,
                  zeilen: 6,
                  max: 3000,
                  hinweis: t('feld.absatzHinweis'),
                })}
              </fieldset>
            ))}
          </div>
        </div>
      );
    }
    case 'termine':
    case 'nachrichten':
      return (
        <div className="flex flex-col gap-4">
          {de ? <p className="text-16 text-tinte-2">{t('autoHinweis')}</p> : null}
          {optionalerTitel(block)}
          {de ? (
            <div className="grid gap-4 md:grid-cols-2">
              <AuswahlFeld
                id={fid('anzahl')}
                label={t('feld.anzahl')}
                fehler={fehler('anzahl')}
                wert={String(block.anzahl)}
                aendern={(v) => aendern((x) => (x.typ === 'termine' || x.typ === 'nachrichten' ? { ...x, anzahl: Number(v) } : x))}
                optionen={[1, 2, 3, 4, 6, 9, 12].map((n) => ({ wert: String(n), label: String(n) }))}
              />
              {block.typ === 'termine' ? (
                <AuswahlFeld
                  id={fid('organisation')}
                  label={t('feld.organisation')}
                  fehler={fehler('organisation')}
                  wert={block.organisation}
                  aendern={(v) =>
                    aendern((x) =>
                      x.typ === 'termine' ? { ...x, organisation: (ORGANISATION_KUERZEL as readonly string[]).includes(v) ? (v as typeof x.organisation) : '' } : x,
                    )
                  }
                  optionen={[{ wert: '', label: t('feld.alleOrganisationen') }, ...optionen.organisationen.filter((o) => o.wert)]}
                />
              ) : null}
            </div>
          ) : null}
        </div>
      );
    case 'kontakt':
    case 'gebetszeiten':
      return (
        <div className="flex flex-col gap-4">
          {de ? <p className="text-16 text-tinte-2">{t(block.typ === 'kontakt' ? 'kontaktHinweis' : 'gebetszeitenHinweis')}</p> : null}
          {optionalerTitel(block)}
        </div>
      );
    case 'download':
      return (
        <div className="flex flex-col gap-4">
          {de ? (
            optionen.dateien.length ? (
              <AuswahlFeld
                id={fid('mediumId')}
                label={t('feld.datei')}
                hinweis={t('feld.dateiHinweis')}
                fehler={fehler('mediumId')}
                pflicht={pflicht}
                wert={block.mediumId}
                aendern={(v) => aendern((x) => (x.typ === 'download' ? { ...x, mediumId: v } : x))}
                optionen={[{ wert: '', label: t('feld.dateiWaehlen') }, ...optionen.dateien.map((d) => ({ wert: d.id, label: d.name }))]}
              />
            ) : (
              <p id={fid('mediumId')} tabIndex={-1} className="rounded-md border border-info bg-info-toenung px-4 py-3 text-16 text-info">
                {t('feld.keineDateien')}
              </p>
            )
          ) : null}
          {mtext('titel', block.titel, (w) => aendern((x) => ({ ...x, titel: w }) as Block), t('feld.linktext'), { pflicht: true, max: 160 })}
          {mtext('beschreibung', block.beschreibung, (w) => aendern((x) => ({ ...x, beschreibung: w }) as Block), t('feld.beschreibung'), {
            max: 400,
          })}
        </div>
      );
    case 'vers': {
      if (!de) return null;
      const sure = optionen.suren.find((s) => s.nr === block.sure);
      return (
        <div className="flex flex-col gap-4">
          <p className="rounded-md border border-info bg-info-toenung px-4 py-3 text-16 text-info">{t('versHinweis')}</p>
          {optionen.suren.length ? (
            <AuswahlFeld
              id={fid('sure')}
              label={t('feld.sure')}
              fehler={fehler('sure')}
              pflicht={pflicht}
              wert={String(block.sure)}
              aendern={(v) => aendern((x) => (x.typ === 'vers' ? { ...x, sure: Number(v), von: 1, bis: 1 } : x))}
              optionen={optionen.suren.map((s) => ({ wert: String(s.nr), label: t('sureOption', { nr: s.nr, name: s.name, anzahl: s.verseAnzahl }) }))}
            />
          ) : (
            <ZahlFeld
              id={fid('sure')}
              label={t('feld.sure')}
              fehler={fehler('sure')}
              pflicht={pflicht}
              min={1}
              max={114}
              wert={block.sure}
              aendern={(v) => aendern((x) => (x.typ === 'vers' ? { ...x, sure: v } : x))}
            />
          )}
          <div className="grid gap-4 md:grid-cols-2">
            <ZahlFeld
              id={fid('von')}
              label={t('feld.vonVers')}
              fehler={fehler('von')}
              pflicht={pflicht}
              min={1}
              max={sure?.verseAnzahl ?? 286}
              wert={block.von}
              aendern={(v) => aendern((x) => (x.typ === 'vers' ? { ...x, von: v, bis: Number.isFinite(v) && v > x.bis ? v : x.bis } : x))}
            />
            <ZahlFeld
              id={fid('bis')}
              label={t('feld.bisVers')}
              hinweis={t('feld.bisVersHinweis', { max: VERSE_MAX })}
              fehler={fehler('bis')}
              pflicht={pflicht}
              min={1}
              max={sure?.verseAnzahl ?? 286}
              wert={block.bis}
              aendern={(v) => aendern((x) => (x.typ === 'vers' ? { ...x, bis: v } : x))}
            />
          </div>
          <SchalterFeld
            id={fid('uebersetzung')}
            label={t('feld.uebersetzungZeigen')}
            hinweis={t('feld.uebersetzungZeigenHinweis')}
            wert={block.uebersetzung}
            aendern={(v) => aendern((x) => (x.typ === 'vers' ? { ...x, uebersetzung: v } : x))}
          />
        </div>
      );
    }
    case 'hadith':
      if (!de) return null;
      return (
        <div className="flex flex-col gap-4">
          <p className="rounded-md border border-info bg-info-toenung px-4 py-3 text-16 text-info">{t('hadithHinweis')}</p>
          <div className="grid gap-4 md:grid-cols-2">
            <AuswahlFeld
              id={fid('sammlung')}
              label={t('feld.sammlung')}
              fehler={fehler('sammlung')}
              wert={block.sammlung}
              aendern={() => undefined}
              optionen={HADITH_SAMMLUNGEN.map((s) => ({ wert: s, label: t(`sammlung.${s}`) }))}
            />
            <TextFeld
              id={fid('nummer')}
              label={t('feld.nummer')}
              hinweis={t('feld.nummerHinweis')}
              fehler={fehler('nummer')}
              pflicht={pflicht}
              wert={block.nummer}
              max={8}
              aendern={(v) => aendern((x) => (x.typ === 'hadith' ? { ...x, nummer: v.trim() } : x))}
            />
          </div>
        </div>
      );
  }
}

/** Bildfeld eines Bausteins: Vorschau mit Alt-Text aus der Mediathek und Knopf „Bild wählen“. */
function BildWahlFeld({
  id,
  fehler,
  bild,
  gesetzt,
  waehlen,
}: {
  id: string;
  fehler?: string;
  bild: EditorOptionen['bilder'][number] | undefined;
  gesetzt: boolean;
  waehlen: () => Promise<void>;
}) {
  const t = useTranslations('verwaltung.medienwahl');
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
      <Vorschaubild bild={bild} unbekannt={gesetzt && !bild} />
      <div className="flex flex-col gap-1.5">
        <Button
          id={id}
          type="button"
          variant="secondary"
          className="self-start"
          aria-invalid={fehler ? true : undefined}
          aria-describedby={fehler ? `${id}-fehler` : undefined}
          onClick={() => {
            void waehlen();
          }}
        >
          <ImagePlus aria-hidden />
          {gesetzt ? t('bildAendern') : t('bildWaehlen')}
        </Button>
        {fehler ? (
          <p id={`${id}-fehler`} className="font-bold text-fehler">
            {fehler}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function Vorschaubild({
  bild,
  unbekannt = false,
  id,
  fehler,
}: {
  bild: EditorOptionen['bilder'][number] | undefined;
  unbekannt?: boolean;
  id?: string;
  fehler?: string;
}) {
  const t = useTranslations('verwaltung.medienwahl');
  return (
    <div className="flex flex-col gap-1">
      <div
        id={id}
        tabIndex={id ? -1 : undefined}
        className="flex h-32 w-full shrink-0 items-center justify-center overflow-hidden rounded-md border border-linie bg-sand p-2 outline-none sm:w-48"
      >
        {bild ? (
          // Verwaltung: einfache Vorschau ohne Bildoptimierung (wie BildFeld)
          // eslint-disable-next-line @next/next/no-img-element
          <img src={bild.url} alt={bild.alt} width={bild.breite} height={bild.hoehe} loading="lazy" className="max-h-full max-w-full object-contain" />
        ) : (
          <p className="text-center text-16 text-tinte-2">{unbekannt ? t('unbekannt') : t('keinBild')}</p>
        )}
      </div>
      {fehler ? <p className="font-bold text-fehler">{fehler}</p> : null}
    </div>
  );
}
