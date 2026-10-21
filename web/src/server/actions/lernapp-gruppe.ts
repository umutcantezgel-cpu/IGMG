'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { pfadFuer } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { funktionAn } from '@/lib/funktionen';
import { verlangeKontenAktion } from '@/lib/konto/zugang';
import {
  entferneZuweisung,
  KeinGruppenZugang,
  setzeFamilienBestenliste,
  setzeGruppenBestenliste,
  setzeWochenziel,
  UngueltigeZuweisung,
  weiseZu,
} from '@/lib/lernapp/gruppe/dienst';
import { istWochenziel } from '@/lib/lernapp/gruppe/regeln';
import { RICHTUNGEN } from '@/lib/lernapp/kurse';
import { ladeGruppenKontext, verlangeGruppenRecht, verlangeKontoRecht } from '@/lib/rechte/gemeinde';
import { KeinRecht } from '@/lib/rechte/pruefe';

/**
 * Formular-Aktionen der Lern-App in „Mein Bereich“ (L7-02; ADR 0043 Nr. 7/8; KERN 4.0 §5): Lehrkraft weist Einheiten oder
 * Lektionen zu, setzt das Gruppenziel und schaltet die Bestenliste der Gruppe; Eltern schalten die Bestenliste der Familie.
 * Ohne JavaScript nutzbar. Reihenfolge wie MUSTER §5: Konten, Schalter (`lernapp_gruppen`, für Bestenlisten zusätzlich
 * `lernapp_rangliste`), Konto mit zweitem Faktor und Kontoart, Eingabe (Zod), Gruppenrecht (`verlangeGruppenRecht`); der
 * Dienst prüft es erneut. Audit im Dienst, ohne Inhalte. Danach zurück auf die Seite mit Rückmeldung im Suchteil.
 */
const uuid = z.string().uuid();
const spracheSchema = z.enum(['de', 'tr', 'en']).catch('de');
const SCHLUESSEL = /^[a-z]{2}\.[a-z0-9]+(?:\.[a-z0-9]+){1,3}$/;

async function schalter(rangliste = false): Promise<void> {
  await verlangeKontenAktion();
  if (!(await funktionAn('lernplattform')) || !(await funktionAn('lernapp_gruppen'))) throw new KeinRecht();
  if (rangliste && !(await funktionAn('lernapp_rangliste'))) throw new KeinRecht();
}

function zurSeite(sprache: Locale, gruppe: string, ok: string, hash?: string): never {
  redirect(
    pfadFuer(
      { pathname: '/mein-bereich/unterricht/[gruppe]/lern-app', params: { gruppe }, query: { ok }, ...(hash ? { hash } : {}) },
      sprache,
    ),
  );
}

const zuweisenSchema = z.object({
  gruppe: uuid,
  kurs: z.enum(RICHTUNGEN),
  einheit: z.string().max(40).regex(SCHLUESSEL),
  lektion: z.union([z.literal(''), z.string().max(48).regex(SCHLUESSEL)]),
  faellig: z.union([z.literal(''), z.iso.date()]),
});

/** Einheit oder einzelne Lektion der Gruppe zuweisen (nur die Lehrkraft der Gruppe, nur ausgelieferte Einheiten). */
export async function lernappZuweisen(fd: FormData): Promise<void> {
  await schalter();
  const sprache = spracheSchema.parse(fd.get('sprache'));
  const p = zuweisenSchema.safeParse({
    gruppe: fd.get('gruppe'),
    kurs: fd.get('kurs'),
    einheit: fd.get('einheit'),
    lektion: fd.get('lektion') ?? '',
    faellig: fd.get('faellig') ?? '',
  });
  if (!p.success) throw new KeinRecht();
  await verlangeKontoRecht(['lehrkraft']);
  const { kontext } = await verlangeGruppenRecht('aufgabe.bearbeiten', p.data.gruppe);
  let ok = 'zugewiesen';
  try {
    await weiseZu(kontext, p.data.gruppe, {
      kurs: p.data.kurs,
      einheit: p.data.einheit,
      ...(p.data.lektion ? { lektion: p.data.lektion } : {}),
      faellig: p.data.faellig || null,
      // Kennung statt Inhalt: Thema und Lektion zeigt die Seite aus dem Kurspaket in der jeweiligen Sprache
      titel: [p.data.kurs, p.data.lektion || p.data.einheit].join(' · '),
    });
  } catch (e) {
    if (e instanceof KeinGruppenZugang) throw new KeinRecht();
    if (!(e instanceof UngueltigeZuweisung)) throw e;
    ok = e.grund === 'doppelt' ? 'doppelt' : e.grund === 'grenze' ? 'grenze' : 'ungueltig';
  }
  zurSeite(sprache, p.data.gruppe, ok, 'zuweisungen');
}

const entfernenSchema = z.object({ gruppe: uuid, aufgabe: uuid });

/** Zuweisung entfernen (samt Erledigt-Vermerken). */
export async function lernappZuweisungEntfernen(fd: FormData): Promise<void> {
  await schalter();
  const sprache = spracheSchema.parse(fd.get('sprache'));
  const p = entfernenSchema.safeParse({ gruppe: fd.get('gruppe'), aufgabe: fd.get('aufgabe') });
  if (!p.success) throw new KeinRecht();
  await verlangeKontoRecht(['lehrkraft']);
  const { kontext } = await verlangeGruppenRecht('aufgabe.bearbeiten', p.data.gruppe);
  let gruppe: string;
  try {
    // Der Dienst prüft das Recht an der Gruppe der Zuweisung selbst (nicht an der aus dem Formular)
    gruppe = await entferneZuweisung(kontext, p.data.aufgabe);
  } catch (e) {
    if (e instanceof KeinGruppenZugang) throw new KeinRecht();
    throw e;
  }
  zurSeite(sprache, gruppe, 'entfernt', 'zuweisungen');
}

const zielSchema = z.object({
  gruppe: uuid,
  ziel: z.union([z.literal(''), z.coerce.number().int().refine(istWochenziel)]),
});

/** Gruppenziel (Wochenziel in XP) setzen oder entfernen. */
export async function lernappGruppenzielSetzen(fd: FormData): Promise<void> {
  await schalter();
  const sprache = spracheSchema.parse(fd.get('sprache'));
  const p = zielSchema.safeParse({ gruppe: fd.get('gruppe'), ziel: fd.get('ziel') ?? '' });
  if (!p.success) throw new KeinRecht();
  await verlangeKontoRecht(['lehrkraft']);
  const { kontext } = await verlangeGruppenRecht('aufgabe.bearbeiten', p.data.gruppe);
  try {
    await setzeWochenziel(kontext, p.data.gruppe, p.data.ziel === '' ? null : p.data.ziel);
  } catch (e) {
    if (e instanceof KeinGruppenZugang) throw new KeinRecht();
    throw e;
  }
  zurSeite(sprache, p.data.gruppe, 'ziel', 'gruppenziel');
}

const schalterSchema = z.object({ gruppe: uuid, an: z.enum(['1', '0']) });

/** Bestenliste der Gruppe ein- oder ausschalten (nur mit `lernapp_rangliste`). */
export async function lernappGruppenBestenlisteSetzen(fd: FormData): Promise<void> {
  await schalter(true);
  const sprache = spracheSchema.parse(fd.get('sprache'));
  const p = schalterSchema.safeParse({ gruppe: fd.get('gruppe'), an: fd.get('an') });
  if (!p.success) throw new KeinRecht();
  await verlangeKontoRecht(['lehrkraft']);
  const { kontext } = await verlangeGruppenRecht('aufgabe.bearbeiten', p.data.gruppe);
  try {
    await setzeGruppenBestenliste(kontext, p.data.gruppe, p.data.an === '1');
  } catch (e) {
    if (e instanceof KeinGruppenZugang) throw new KeinRecht();
    throw e;
  }
  zurSeite(sprache, p.data.gruppe, 'bestenliste', 'bestenliste');
}

/** Bestenliste der Familie ein- oder ausschalten (Elternkonto mit eigenem Kind; nur mit `lernapp_rangliste`). */
export async function lernappFamilienBestenlisteSetzen(fd: FormData): Promise<void> {
  await schalter(true);
  const sprache = spracheSchema.parse(fd.get('sprache'));
  const an = z.enum(['1', '0']).safeParse(fd.get('an'));
  if (!an.success) throw new KeinRecht();
  const konto = await verlangeKontoRecht(['eltern']);
  try {
    await setzeFamilienBestenliste(await ladeGruppenKontext(konto.benutzerId), an.data === '1');
  } catch (e) {
    if (e instanceof KeinGruppenZugang) throw new KeinRecht();
    throw e;
  }
  redirect(pfadFuer({ pathname: '/mein-bereich/kinder', query: { familie: an.data === '1' ? 'an' : 'aus' }, hash: 'lern-app' }, sprache));
}
