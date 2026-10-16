import type { JSONContent } from '@tiptap/core';
import { z } from 'zod';
import type { Mehrsprachig, MehrsprachigRich } from '@/lib/db/schema/typen';
import { bereinige } from '@/lib/i18n/inhalt';
import { klartext as klartextAusDokument } from '@/lib/inhalt/tiptap';
import { richtextFeld } from './richtext';

/**
 * Formular „Wissensthema“ (F-40, Verwaltung › Islamisches Wissen, ADR 0030): Adresse (nur beim Anlegen), Titel
 * (Deutsch Pflicht), Kurztext und Einführung (Rich-Text) je Sprache, Sichtbarkeit. Ein Schema für Formular und Action;
 * Fehler sind Schlüssel unter `verwaltung.wissen.fehler`. Die Plattform schreibt keine religiösen Inhalte – sie
 * speichert, was Menschen eingeben, und macht es erst nach der religiösen Prüfung öffentlich.
 */
export const WISSEN_FELDER = [
  'id',
  'slug',
  'titelDe',
  'titelTr',
  'titelEn',
  'kurztextDe',
  'kurztextTr',
  'kurztextEn',
  'inhaltDe',
  'inhaltTr',
  'inhaltEn',
  'sichtbar',
  'einreichen',
] as const;

/** Vermerk im Freigabe-Verlauf für den Bestand vor der Freigabepflicht (Migration 0015, Seed „wissen“). */
export const BESTAND_VERMERK = 'Bestand vor der Freigabepflicht (F-40), ohne Einzelprüfung übernommen';

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const text = (max: number) => z.string().trim().max(max, 'zuLang').default('');
const richtext = z.preprocess((v) => v ?? '', richtextFeld);

export const wissenSchema = z
  .object({
    id: z.union([z.literal(''), z.uuid('ungueltig')]).default(''),
    slug: z.string().trim().max(80, 'zuLang').default(''),
    titelDe: z.string('pflicht').trim().min(1, 'pflicht').max(80, 'zuLang'),
    titelTr: text(80),
    titelEn: text(80),
    kurztextDe: text(300),
    kurztextTr: text(300),
    kurztextEn: text(300),
    inhaltDe: richtext,
    inhaltTr: richtext,
    inhaltEn: richtext,
    sichtbar: z.preprocess((v) => v === 'on' || v === 'ja' || v === true, z.boolean()),
    einreichen: z.preprocess((v) => v === 'ja', z.boolean()),
  })
  .superRefine((e, ctx) => {
    const fehler = (pfad: string, message: string) => ctx.addIssue({ code: 'custom', path: [pfad], message });
    // Neue Themen brauchen eine Adresse; danach bleibt sie fest (öffentliche Links)
    if (!e.id && !SLUG.test(e.slug)) fehler('slug', e.slug ? 'slug' : 'pflicht');
    // Übersetzungen brauchen die deutsche Fassung (Rückfallsprache, ADR 0002)
    if ((e.kurztextTr || e.kurztextEn) && !e.kurztextDe) fehler('kurztextDe', 'pflicht');
    if ((e.inhaltTr || e.inhaltEn) && !e.inhaltDe) fehler('inhaltDe', 'pflicht');
  });
export type WissenEingabe = z.infer<typeof wissenSchema>;

/** Inhalt eines Themas, wie er in der Tabelle steht – Grundlage für Revision und den Vergleich „inhaltlich geändert?“. */
export type WissenInhaltDaten = { titel: Mehrsprachig; kurztext: Mehrsprachig | null; inhalt: MehrsprachigRich | null };

export function wissenDatensatz(e: WissenEingabe): WissenInhaltDaten & { klartext: Mehrsprachig } {
  const titel = bereinige({ de: e.titelDe, tr: e.titelTr, en: e.titelEn });
  const kurztext = e.kurztextDe ? bereinige({ de: e.kurztextDe, tr: e.kurztextTr, en: e.kurztextEn }) : null;
  const inhalt: MehrsprachigRich | null = e.inhaltDe
    ? {
        de: e.inhaltDe as JSONContent,
        ...(e.inhaltTr ? { tr: e.inhaltTr as JSONContent } : {}),
        ...(e.inhaltEn ? { en: e.inhaltEn as JSONContent } : {}),
      }
    : null;
  return { titel, kurztext, inhalt, klartext: wissenKlartext({ titel, kurztext, inhalt }) };
}

/** Suchspalte `klartext` (ADR 0013): Titel, Kurztext und Einführung je Sprache. */
export function wissenKlartext(d: WissenInhaltDaten): Mehrsprachig {
  const sprache = (s: 'de' | 'tr' | 'en') =>
    [d.titel[s], d.kurztext?.[s], klartextAusDokument(d.inhalt?.[s] ?? null)].filter(Boolean).join('\n');
  const tr = sprache('tr');
  const en = sprache('en');
  return { de: sprache('de'), ...(tr ? { tr } : {}), ...(en ? { en } : {}) };
}

export type Uebersetzungsstand = { gesamt: number; tr: number; en: number };

/**
 * Übersetzungsstand je Sprache (Plan §3.7): wie viele der deutschen Texte (Titel, Kurztext, Einführung) eine türkische
 * bzw. englische Fassung haben. `gesamt` = Zahl der deutschen Texte (mindestens der Titel).
 */
export function wissenUebersetzungsstand(d: WissenInhaltDaten): Uebersetzungsstand {
  const z: Uebersetzungsstand = { gesamt: 0, tr: 0, en: 0 };
  const zaehle = (de: unknown, tr: unknown, en: unknown) => {
    if (!de) return;
    z.gesamt++;
    if (tr) z.tr++;
    if (en) z.en++;
  };
  zaehle(d.titel.de, d.titel.tr, d.titel.en);
  zaehle(d.kurztext?.de, d.kurztext?.tr, d.kurztext?.en);
  zaehle(d.inhalt?.de, d.inhalt?.tr, d.inhalt?.en);
  return z;
}

/** Anteil in ganzen Prozent (ohne Texte: 100). */
export function anteil(teil: number, gesamt: number): number {
  return gesamt <= 0 ? 100 : Math.round((teil / gesamt) * 100);
}
