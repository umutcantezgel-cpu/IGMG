'use client';

import {
  ArrowDown,
  ArrowUp,
  BookOpenText,
  CalendarRange,
  ChevronDown,
  ChevronsDownUp,
  ChevronsUpDown,
  Clock,
  Columns3,
  Contact,
  Download,
  Image as Bild,
  Images,
  Megaphone,
  MessageCircleQuestion,
  Newspaper,
  Plus,
  Quote,
  SeparatorHorizontal,
  Trash2,
  Type,
  Undo2,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useId, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import type { BildAuswahl } from '@/components/verwaltung/richtext/typen';
import { Klappe } from '@/components/verwaltung/Klappe';
import { BLOCK_TYPEN, neuerBlock, uebersetzungsstand, type Block, type BlockTyp } from '@/lib/validierung/bloecke';
import { cn } from '@/lib/utils';
import { BausteinFelder, hatUebersetzbareTexte } from './BausteinFelder';
import type { EditorOptionen } from './typen';

/**
 * Bausteinliste des Seiten-Editors (ADR 0032): Hinzufügen über eine Auswahl großer Kacheln, Aufklappen über den Kopf,
 * Verschieben mit den Knöpfen ↑ ↓ (Tastatur, kein Ziehen nötig), Entfernen mit „Rückgängig“. Nach jeder Aktion bleibt der
 * Fokus an einer sinnvollen Stelle und eine Live-Region sagt, was passiert ist (K-11).
 */
export const BLOCK_ICON: Record<BlockTyp, LucideIcon> = {
  text: Type,
  bild: Bild,
  galerie: Images,
  aufruf: Megaphone,
  faq: MessageCircleQuestion,
  trenner: SeparatorHorizontal,
  spalten: Columns3,
  termine: CalendarRange,
  nachrichten: Newspaper,
  kontakt: Contact,
  download: Download,
  gebetszeiten: Clock,
  vers: BookOpenText,
  hadith: Quote,
};

/** Reiner Text eines Tiptap-Dokuments (für die einzeilige Vorschau), höchstens `max` Zeichen. */
function textAus(knoten: unknown, max = 160): string {
  const teile: string[] = [];
  let laenge = 0;
  const besuche = (k: unknown) => {
    if (laenge >= max || !k || typeof k !== 'object') return;
    const { text, content } = k as { text?: unknown; content?: unknown };
    if (typeof text === 'string') {
      teile.push(text);
      laenge += text.length;
    }
    if (Array.isArray(content)) {
      for (const c of content) {
        besuche(c);
        // Absätze und Listenpunkte durch Leerzeichen trennen
        if (teile.length && !teile[teile.length - 1].endsWith(' ')) teile.push(' ');
      }
    }
  };
  besuche(knoten);
  return teile.join('').replace(/\s+/g, ' ').trim().slice(0, max);
}

/** Einzeilige Vorschau eines Bausteins für den Kopf der Karte (Titel, Anfang des Textes oder die Stelle). */
function zusammenfassung(b: Block): string {
  switch (b.typ) {
    case 'text':
      return textAus(b.inhalt.de);
    case 'aufruf':
      return b.titel.de;
    case 'bild':
      return b.unterschrift.de || b.alt.de;
    case 'download':
      return b.titel.de;
    case 'vers':
      return `${b.sure}:${b.von}${b.bis !== b.von ? `–${b.bis}` : ''}`;
    case 'hadith':
      return b.nummer;
    case 'faq':
      return (
        b.titel.de ||
        b.eintraege
          .map((e) => e.frage.de)
          .filter(Boolean)
          .join(' · ')
      );
    case 'spalten':
      return (
        b.titel.de ||
        b.spalten
          .map((x) => x.titel.de)
          .filter(Boolean)
          .join(' · ')
      );
    case 'galerie':
    case 'termine':
    case 'nachrichten':
    case 'kontakt':
    case 'gebetszeiten':
      return b.titel.de;
    default:
      return '';
  }
}

/**
 * Wie viele der beiden Übersetzungen (Türkisch, Englisch) sind für den Baustein vollständig? Ohne deutschen Text gibt
 * es noch nichts zu übersetzen: dann 0 (`uebersetzungsstand` meldet für „keine Texte“ 100 %, ein deutscher Probetitel
 * ohne Übersetzung macht diesen Fall erkennbar).
 */
function fertigeUebersetzungen(b: Block): number {
  const nurBaustein = uebersetzungsstand({ de: '' }, null, [b]);
  const mitProbe = uebersetzungsstand({ de: '-' }, null, [b]);
  if (nurBaustein.tr === 100 && mitProbe.tr === 0) return 0;
  return (['tr', 'en'] as const).filter((s) => nurBaustein[s] === 100).length;
}

/** Symbolknöpfe im Kopf eines Bausteins (Name über aria-label, Tooltip über title): 48 px, ab 1024 px 44 px (K-11). */
const KNOPF = 'size-12 min-h-12 lg:size-11 lg:min-h-11';

type Fokus = { id: string; ziel: 'oben' | 'unten' | 'kopf' } | { id: 'rueckgaengig'; ziel: 'knopf' } | null;

export function BausteinListe({
  bloecke,
  setzeBloecke,
  optionen,
  bildAuswahl,
  feldId,
  fehlerText,
  hatFehler,
  startZu = false,
}: {
  bloecke: Block[];
  setzeBloecke: (f: (alt: Block[]) => Block[]) => void;
  optionen: EditorOptionen;
  bildAuswahl: BildAuswahl;
  /** Element-ID eines Bausteinfelds („block:<id>:<pfad>“). */
  feldId: (schluessel: string) => string;
  /** Übersetzter Fehlertext zu „block:<id>:<pfad>“. */
  fehlerText: (schluessel: string) => string | undefined;
  /** Hat der Baustein (ID) Fehler? Optional nur in Türkisch/Englisch. */
  hatFehler: (id: string, nurUebersetzung?: boolean) => boolean;
  /** Bestehende Seiten öffnen mit zugeklappten Bausteinen (SB-1); neu hinzugefügte stehen offen. */
  startZu?: boolean;
}) {
  const t = useTranslations('verwaltung.seiten.baustein');
  const basis = useId();
  const [auswahlOffen, setAuswahlOffen] = useState(false);
  const [zu, setZu] = useState<ReadonlySet<string>>(() => new Set(startZu ? bloecke.map((b) => b.id) : []));
  const [ansage, setAnsage] = useState('');
  const [entfernt, setEntfernt] = useState<{ block: Block; index: number } | null>(null);
  // Fokusziel nach dem nächsten Zeichnen (Element-ID); in Ereignissen gesetzt, im Effekt gelesen
  const fokusZiel = useRef<string | null>(null);
  const [uebersetzungen, setUebersetzungen] = useState<ReadonlySet<string>>(new Set());
  const uebersetzungZeigen = (id: string) => uebersetzungen.has(id) || hatFehler(id, true);
  const hinzufuegenRef = useRef<HTMLButtonElement>(null);
  const anzahl = bloecke.length;
  /** Element-ID eines Knopfs oder Kopfs („oben“, „unten“, „kopf“) bzw. des Rückgängig-Knopfs. */
  const eid = (blockId: string, ziel: string) => `${basis}-${blockId}-${ziel}`;
  const setFokus = (f: Fokus) => {
    fokusZiel.current = f ? (f.id === 'rueckgaengig' ? eid('rueckgaengig', 'knopf') : eid(f.id, f.ziel)) : null;
  };

  // Fokus nach dem Neuzeichnen setzen (das Element existiert erst dann an der neuen Stelle). Ist der Knopf jetzt
  // gesperrt (oben/unten am Rand), bekommt der Kopf des Bausteins den Fokus.
  useEffect(() => {
    const ziel = fokusZiel.current;
    if (!ziel) return;
    fokusZiel.current = null;
    const el = document.getElementById(ziel) as HTMLButtonElement | null;
    if (el && !el.disabled) el.focus();
    else document.getElementById(ziel.replace(/-(oben|unten)$/, '-kopf'))?.focus();
  }, [bloecke, entfernt]);

  const name = (b: Block, i: number) => t('bausteinName', { nr: i + 1, typ: t(`typ.${b.typ}.name`) });

  function verschieben(i: number, richtung: -1 | 1) {
    const ziel = i + richtung;
    if (ziel < 0 || ziel >= anzahl) return;
    const b = bloecke[i];
    setzeBloecke((alt) => {
      const neu = [...alt];
      [neu[i], neu[ziel]] = [neu[ziel], neu[i]];
      return neu;
    });
    setAnsage(t('verschoben', { typ: t(`typ.${b.typ}.name`), nr: ziel + 1, anzahl }));
    setFokus({ id: b.id, ziel: richtung === -1 ? 'oben' : 'unten' });
  }

  function entfernen(i: number) {
    const b = bloecke[i];
    setzeBloecke((alt) => alt.filter((x) => x.id !== b.id));
    setEntfernt({ block: b, index: i });
    setAnsage(t('entferntAnsage', { typ: t(`typ.${b.typ}.name`) }));
    setFokus({ id: 'rueckgaengig', ziel: 'knopf' });
  }

  function rueckgaengig() {
    if (!entfernt) return;
    const { block, index } = entfernt;
    setzeBloecke((alt) => [...alt.slice(0, index), block, ...alt.slice(index)]);
    setEntfernt(null);
    setAnsage(t('zurueckAnsage', { typ: t(`typ.${block.typ}.name`) }));
    setFokus({ id: block.id, ziel: 'kopf' });
  }

  function hinzufuegen(typ: BlockTyp) {
    const b = neuerBlock(typ);
    setzeBloecke((alt) => [...alt, b]);
    setAuswahlOffen(false);
    setEntfernt(null);
    setAnsage(t('hinzugefuegt', { typ: t(`typ.${typ}.name`), nr: anzahl + 1 }));
    setFokus({ id: b.id, ziel: 'kopf' });
  }

  const alleZu = anzahl > 0 && bloecke.every((b) => zu.has(b.id));
  function alleUmschalten() {
    setZu(alleZu ? new Set() : new Set(bloecke.map((b) => b.id)));
    setAnsage(t(alleZu ? 'alleAufgeklappt' : 'alleZugeklappt'));
  }

  function umschalten(id: string) {
    setZu((alt) => {
      const neu = new Set(alt);
      if (neu.has(id)) neu.delete(id);
      else neu.add(id);
      return neu;
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <p role="status" aria-live="polite" className="sr-only">
        {ansage}
      </p>
      {anzahl > 1 ? (
        <Button type="button" variant="ghost" size="sm" className="min-h-12 self-end px-3" aria-expanded={!alleZu} onClick={alleUmschalten}>
          {alleZu ? <ChevronsUpDown aria-hidden /> : <ChevronsDownUp aria-hidden />}
          {t(alleZu ? 'alleAufklappen' : 'alleZuklappen')}
        </Button>
      ) : null}
      {anzahl === 0 ? (
        <p className="rounded-lg border border-dashed border-rand bg-papier px-5 py-8 text-center text-18 text-tinte-2">{t('keine')}</p>
      ) : (
        <ol className="flex flex-col gap-4">
          {bloecke.map((b, i) => {
            const Icon = BLOCK_ICON[b.typ];
            const fehler = hatFehler(b.id);
            // Ein Baustein mit Fehlern bleibt offen, damit die Sprungverweise der Fehlerliste ihr Ziel finden
            const offen = !zu.has(b.id) || fehler;
            const kurz = zusammenfassung(b);
            const fid = (pfad: string) => feldId(`block:${b.id}:${pfad}`);
            const fe = (pfad: string) => fehlerText(`block:${b.id}:${pfad}`);
            const koerperId = `${basis}-${b.id}-koerper`;
            return (
              <li
                key={b.id}
                className={cn('rounded-lg border bg-weiss shadow-s1', fehler ? 'border-2 border-fehler' : 'border-linie')}
                aria-labelledby={eid(b.id, 'kopf')}
              >
                {/* Kopf (SE-5, SB-3, SB-6): Der Titel selbst klappt auf und zu (Akkordeon, Chevron rechts); daneben nur
                    noch ↑ ↓ als Symbolpaar und abgesetzt der Papierkorb – ruhig wie die Pfeile, Erdrot erst bei Zeiger
                    oder Tastaturfokus. Auf dem Telefon stehen die drei Knöpfe in eigener Zeile rechts unter dem Titel. */}
                <div className={cn('flex flex-wrap items-center gap-x-3 gap-y-1 px-2 py-2 md:px-3', offen && 'border-b border-linie')}>
                  <h3 className="flex min-w-0 flex-1 basis-60 font-text text-18 leading-tight font-bold tracking-normal">
                    <button
                      id={eid(b.id, 'kopf')}
                      type="button"
                      aria-expanded={offen}
                      aria-controls={koerperId}
                      onClick={() => umschalten(b.id)}
                      className="flex min-h-14 w-full min-w-0 cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 text-left transition-colors duration-(--dauer-rueckmeldung) hover:bg-gruen-50 motion-reduce:transition-none"
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-gruen-50 text-gruen-800">
                        <Icon aria-hidden className="size-5" />
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span>
                          <span className="text-tinte-2">{t('nummer', { nr: i + 1 })} · </span>
                          {t(`typ.${b.typ}.name`)}
                        </span>
                        {kurz ? <span className="truncate text-16 font-normal text-tinte-2">{kurz}</span> : null}
                      </span>
                      {fehler ? (
                        <span className="shrink-0 rounded-pill bg-fehler-toenung px-3 py-0.5 text-16 font-bold text-fehler">
                          {t('fehlerMarke')}
                        </span>
                      ) : null}
                      <ChevronDown
                        aria-hidden
                        className={cn(
                          'size-6 shrink-0 text-gruen-700 transition-transform duration-(--dauer-wechsel) motion-reduce:transition-none',
                          offen && 'rotate-180',
                        )}
                      />
                    </button>
                  </h3>
                  <div className="ml-auto flex shrink-0 items-center gap-1">
                    <Button
                      id={eid(b.id, 'oben')}
                      type="button"
                      variant="outline"
                      size="icon"
                      className={KNOPF}
                      disabled={i === 0}
                      onClick={() => verschieben(i, -1)}
                      title={t('nachOben')}
                      aria-label={t('nachObenName', { name: name(b, i) })}
                    >
                      <ArrowUp aria-hidden />
                    </Button>
                    <Button
                      id={eid(b.id, 'unten')}
                      type="button"
                      variant="outline"
                      size="icon"
                      className={KNOPF}
                      disabled={i === anzahl - 1}
                      onClick={() => verschieben(i, 1)}
                      title={t('nachUnten')}
                      aria-label={t('nachUntenName', { name: name(b, i) })}
                    >
                      <ArrowDown aria-hidden />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className={cn(
                        KNOPF,
                        'ml-4 border-rand text-tinte-2 hover:border-fehler hover:bg-fehler-toenung hover:text-fehler focus-visible:border-fehler focus-visible:bg-fehler-toenung focus-visible:text-fehler',
                      )}
                      onClick={() => entfernen(i)}
                      title={t('entfernen')}
                      aria-label={t('entfernenName', { name: name(b, i) })}
                    >
                      <Trash2 aria-hidden />
                    </Button>
                  </div>
                </div>
                <div id={koerperId} hidden={!offen} className="flex flex-col gap-4 p-3 sm:p-4 md:p-5">
                  <BausteinFelder
                    block={b}
                    sprache="de"
                    aendern={aendernFuer(b.id, setzeBloecke)}
                    optionen={optionen}
                    bildAuswahl={bildAuswahl}
                    fid={fid}
                    fehler={fe}
                  />
                  {hatUebersetzbareTexte(b) ? (
                    <Klappe
                      titel={t('uebersetzungen')}
                      stand={t('uebersetzungStand', { anzahl: fertigeUebersetzungen(b) })}
                      className="rounded-md border border-linie bg-papier px-3 py-1 sm:px-4"
                      open={uebersetzungZeigen(b.id)}
                      onToggle={(e) => {
                        const auf = e.currentTarget.open;
                        setUebersetzungen((alt) => {
                          const neu = new Set(alt);
                          if (auf) neu.add(b.id);
                          else neu.delete(b.id);
                          return neu;
                        });
                      }}
                    >
                      <p className="text-16 text-tinte-2">{t('uebersetzungenHinweis')}</p>
                      {/* Erst beim Öffnen zeichnen: spart zwei Texteditoren je Baustein */}
                      {uebersetzungZeigen(b.id) ? (
                        <div className="mt-4 mb-3 grid gap-6 lg:grid-cols-2">
                          {(['tr', 'en'] as const).map((s) => (
                            <fieldset key={s} className="flex min-w-0 flex-col gap-4">
                              <legend className="mb-2 font-bold">{t(`sprache.${s}`)}</legend>
                              <BausteinFelder
                                block={b}
                                sprache={s}
                                aendern={aendernFuer(b.id, setzeBloecke)}
                                optionen={optionen}
                                bildAuswahl={bildAuswahl}
                                fid={fid}
                                fehler={fe}
                              />
                            </fieldset>
                          ))}
                        </div>
                      ) : null}
                    </Klappe>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {entfernt ? (
        <div className="flex flex-wrap items-center gap-3 rounded-md border border-info bg-info-toenung px-4 py-2 text-info">
          <span className="font-bold">{t('entfernt', { typ: t(`typ.${entfernt.block.typ}.name`) })}</span>
          <Button id={eid('rueckgaengig', 'knopf')} type="button" variant="outline" size="sm" className="min-h-12" onClick={rueckgaengig}>
            <Undo2 aria-hidden />
            {t('rueckgaengig')}
          </Button>
        </div>
      ) : null}

      <div className="flex flex-col gap-3">
        <Button
          ref={hinzufuegenRef}
          type="button"
          variant="secondary"
          size="lg"
          className="self-start"
          aria-expanded={auswahlOffen}
          aria-controls={`${basis}-auswahl`}
          onClick={() => setAuswahlOffen((o) => !o)}
        >
          {auswahlOffen ? <X aria-hidden /> : <Plus aria-hidden />}
          {auswahlOffen ? t('auswahlSchliessen') : t('hinzufuegen')}
        </Button>
        <div
          id={`${basis}-auswahl`}
          hidden={!auswahlOffen}
          role="group"
          aria-label={t('auswahlTitel')}
          className="tritt-auf rounded-lg border border-linie bg-weiss p-4 shadow-s2 md:p-5"
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setAuswahlOffen(false);
              hinzufuegenRef.current?.focus();
            }
          }}
        >
          <p className="mb-3 font-display text-24 font-semibold">{t('auswahlTitel')}</p>
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {BLOCK_TYPEN.map((typ) => {
              const Icon = BLOCK_ICON[typ];
              return (
                <li key={typ}>
                  <button
                    type="button"
                    onClick={() => hinzufuegen(typ)}
                    className="flex h-full min-h-20 w-full cursor-pointer items-start gap-3 rounded-md border border-rand bg-weiss p-3 text-left transition duration-(--dauer-rueckmeldung) hover:border-gruen-700 hover:bg-gruen-50 active:scale-98 motion-reduce:active:scale-100"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-gruen-50 text-gruen-800">
                      <Icon aria-hidden className="size-5" />
                    </span>
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className="font-bold">{t(`typ.${typ}.name`)}</span>
                      <span className="text-16 leading-snug text-tinte-2">{t(`typ.${typ}.beschreibung`)}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

/** Änderungsfunktion für einen Baustein über seine ID (stabil gegenüber Verschieben). */
function aendernFuer(id: string, setzeBloecke: (f: (alt: Block[]) => Block[]) => void) {
  return (neu: (b: Block) => Block) => setzeBloecke((alt) => alt.map((x) => (x.id === id ? neu(x) : x)));
}
