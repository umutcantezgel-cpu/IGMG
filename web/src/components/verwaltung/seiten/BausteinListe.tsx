'use client';

import {
  ArrowDown,
  ArrowUp,
  BookOpenText,
  CalendarRange,
  ChevronDown,
  ChevronUp,
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
import { BLOCK_TYPEN, neuerBlock, type Block, type BlockTyp } from '@/lib/validierung/bloecke';
import { cn } from '@/lib/utils';
import { BausteinFelder, hatUebersetzbareTexte } from './BausteinFelder';
import type { EditorOptionen } from './typen';

/**
 * Bausteinliste des Seiten-Editors (ADR 0032): Hinzufügen über eine Auswahl großer Kacheln, Verschieben mit den Knöpfen
 * „Nach oben“/„Nach unten“ (Tastatur, kein Ziehen nötig), Entfernen mit „Rückgängig“. Nach jeder Aktion bleibt der
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

/** Kurze Zusammenfassung eines Bausteins für den Kopf der Karte (z. B. der Titel). */
function zusammenfassung(b: Block): string {
  switch (b.typ) {
    case 'aufruf':
      return b.titel.de;
    case 'bild':
      return b.alt.de;
    case 'download':
      return b.titel.de;
    case 'vers':
      return `${b.sure}:${b.von}${b.bis !== b.von ? `–${b.bis}` : ''}`;
    case 'hadith':
      return b.nummer;
    case 'galerie':
    case 'faq':
    case 'spalten':
    case 'termine':
    case 'nachrichten':
    case 'kontakt':
    case 'gebetszeiten':
      return b.titel.de;
    default:
      return '';
  }
}

type Fokus = { id: string; ziel: 'oben' | 'unten' | 'kopf' } | { id: 'rueckgaengig'; ziel: 'knopf' } | null;

export function BausteinListe({
  bloecke,
  setzeBloecke,
  optionen,
  bildAuswahl,
  feldId,
  fehlerText,
  hatFehler,
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
}) {
  const t = useTranslations('verwaltung.seiten.baustein');
  const basis = useId();
  const [auswahlOffen, setAuswahlOffen] = useState(false);
  const [zu, setZu] = useState<ReadonlySet<string>>(new Set());
  const [ansage, setAnsage] = useState('');
  const [entfernt, setEntfernt] = useState<{ block: Block; index: number } | null>(null);
  const [fokus, setFokus] = useState<Fokus>(null);
  const [uebersetzungen, setUebersetzungen] = useState<ReadonlySet<string>>(new Set());
  const uebersetzungZeigen = (id: string) => uebersetzungen.has(id) || hatFehler(id, true);
  const knoepfe = useRef(new Map<string, HTMLElement>());
  const hinzufuegenRef = useRef<HTMLButtonElement>(null);
  const anzahl = bloecke.length;

  const ref = (schluessel: string) => (el: HTMLElement | null) => {
    if (el) knoepfe.current.set(schluessel, el);
    else knoepfe.current.delete(schluessel);
  };

  // Fokus nach dem Neuzeichnen setzen (das Element existiert erst dann an der neuen Stelle)
  useEffect(() => {
    if (!fokus) return;
    const el =
      fokus.id === 'rueckgaengig'
        ? knoepfe.current.get('rueckgaengig')
        : (knoepfe.current.get(`${fokus.id}:${fokus.ziel}`) as HTMLButtonElement | undefined);
    if (el && !(el as HTMLButtonElement).disabled) el.focus();
    else if (fokus.id !== 'rueckgaengig') knoepfe.current.get(`${fokus.id}:kopf`)?.focus();
    setFokus(null);
  }, [fokus, bloecke]);

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
                aria-labelledby={`${basis}-${b.id}-kopf`}
              >
                <div className="flex flex-wrap items-center gap-3 border-b border-linie px-4 py-3 md:px-5">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-gruen-50 text-gruen-800">
                    <Icon aria-hidden className="size-5" />
                  </span>
                  <h3
                    id={`${basis}-${b.id}-kopf`}
                    ref={ref(`${b.id}:kopf`)}
                    tabIndex={-1}
                    className="flex min-w-0 flex-1 flex-col font-text text-18 leading-tight font-bold tracking-normal outline-none"
                  >
                    <span>
                      <span className="text-tinte-2">{t('nummer', { nr: i + 1 })} · </span>
                      {t(`typ.${b.typ}.name`)}
                    </span>
                    {kurz ? <span className="truncate text-16 font-normal text-tinte-2">{kurz}</span> : null}
                  </h3>
                  {fehler ? <span className="rounded-pill bg-fehler-toenung px-3 py-0.5 text-16 font-bold text-fehler">{t('fehlerMarke')}</span> : null}
                  <div className="flex gap-2">
                    <Button
                      ref={ref(`${b.id}:oben`)}
                      type="button"
                      variant="outline"
                      size="icon"
                      disabled={i === 0}
                      onClick={() => verschieben(i, -1)}
                      aria-label={t('nachObenName', { name: name(b, i) })}
                      title={t('nachOben')}
                    >
                      <ArrowUp aria-hidden />
                    </Button>
                    <Button
                      ref={ref(`${b.id}:unten`)}
                      type="button"
                      variant="outline"
                      size="icon"
                      disabled={i === anzahl - 1}
                      onClick={() => verschieben(i, 1)}
                      aria-label={t('nachUntenName', { name: name(b, i) })}
                      title={t('nachUnten')}
                    >
                      <ArrowDown aria-hidden />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      aria-expanded={offen}
                      aria-controls={koerperId}
                      onClick={() => umschalten(b.id)}
                      aria-label={t(offen ? 'zuklappenName' : 'aufklappenName', { name: name(b, i) })}
                      title={t(offen ? 'zuklappen' : 'aufklappen')}
                    >
                      {offen ? <ChevronUp aria-hidden /> : <ChevronDown aria-hidden />}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="hover:border-fehler hover:bg-fehler-toenung hover:text-fehler"
                      onClick={() => entfernen(i)}
                      aria-label={t('entfernenName', { name: name(b, i) })}
                      title={t('entfernen')}
                    >
                      <Trash2 aria-hidden />
                    </Button>
                  </div>
                </div>
                <div id={koerperId} hidden={!offen} className="flex flex-col gap-4 p-4 md:p-5">
                  <BausteinFelder block={b} sprache="de" aendern={aendernFuer(b.id, setzeBloecke)} optionen={optionen} bildAuswahl={bildAuswahl} fid={fid} fehler={fe} />
                  {hatUebersetzbareTexte(b) ? (
                    <details
                      className="rounded-md border border-linie bg-papier px-4 py-3"
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
                      <summary className="flex min-h-12 cursor-pointer items-center font-bold">{t('uebersetzungen')}</summary>
                      <p className="mt-1 text-16 text-tinte-2">{t('uebersetzungenHinweis')}</p>
                      {/* Erst beim Öffnen zeichnen: spart zwei Texteditoren je Baustein */}
                      {uebersetzungZeigen(b.id) ? (
                      <div className="mt-4 grid gap-6 lg:grid-cols-2">
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
                    </details>
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
          <Button ref={ref('rueckgaengig')} type="button" variant="outline" size="sm" onClick={rueckgaengig}>
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
