'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { pfadFuer } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { funktionAn } from '@/lib/funktionen';
import { verlangeKontenAktion } from '@/lib/konto/zugang';
import { gibZurueck, KeinZugang } from '@/lib/lernapp/schreiben/dienst';
import { istEinstufung, KOMMENTAR_MAX_ZEICHEN, lesePruefliste, rueckmeldungLeer } from '@/lib/lernapp/schreiben/regeln';
import { KRITERIEN } from '@/lib/lernapp/aufgaben/auswertung/schreiben';
import { verlangeGruppenRecht, verlangeKontoRecht } from '@/lib/rechte/gemeinde';
import { KeinRecht } from '@/lib/rechte/pruefe';

/**
 * Korrekturweg in „Mein Bereich“ (L5-03; PLAN §3.1 Konto-Seite; ADR 0042 Nr. 11; KERN 4.0 §5): Die Lehrkraft gibt eine
 * Schreibabgabe mit Rückmeldung zurück (Kommentar verschlüsselt, Prüfliste und Einstufung ohne Note). Ohne JavaScript
 * nutzbar. Reihenfolge wie MUSTER §5 und `lernapp-gruppe.ts`: Konten, Schalter (`lernplattform`, `lernapp_gruppen`), Konto
 * mit zweitem Faktor und Kontoart Lehrkraft, Eingabe (Zod), Gruppenrecht (`aufgabe.bearbeiten`); der Dienst prüft Recht,
 * Mitgliedschaft und Einwilligung erneut. Audit im Dienst, nur mit Kennungen. Danach zurück auf die Seite mit Rückmeldung.
 */
const uuid = z.uuid();
const spracheSchema = z.enum(['de', 'tr', 'en']).catch('de');

function zurSeite(sprache: Locale, gruppe: string, ok: string, query: Record<string, string> = {}, hash = 'abgaben'): never {
  redirect(
    pfadFuer({ pathname: '/mein-bereich/unterricht/[gruppe]/lern-app', params: { gruppe }, query: { ok, ...query }, hash }, sprache),
  );
}

const rueckgabeSchema = z.object({
  gruppe: uuid,
  abgabe: uuid,
  kommentar: z.string().max(KOMMENTAR_MAX_ZEICHEN),
  einstufung: z.string().max(20),
});

/** Rückmeldung zu einer Schreibabgabe speichern und an die lernende Person zurückgeben (auch erneut: ändert sie). */
export async function lernappAbgabeZurueckgeben(fd: FormData): Promise<void> {
  await verlangeKontenAktion();
  if (!(await funktionAn('lernplattform')) || !(await funktionAn('lernapp_gruppen'))) throw new KeinRecht();
  await verlangeKontoRecht(['lehrkraft']);
  const sprache = spracheSchema.parse(fd.get('sprache'));
  const p = rueckgabeSchema.safeParse({
    gruppe: fd.get('gruppe'),
    abgabe: fd.get('abgabe'),
    kommentar: fd.get('kommentar') ?? '',
    einstufung: fd.get('einstufung') ?? '',
  });
  const pruefliste = lesePruefliste(Object.fromEntries(KRITERIEN.map((k) => [k, fd.get(`pruefliste.${k}`) ?? ''])));
  if (!p.success || !pruefliste || (p.data.einstufung !== '' && !istEinstufung(p.data.einstufung))) throw new KeinRecht();
  const { kontext } = await verlangeGruppenRecht('aufgabe.bearbeiten', p.data.gruppe);
  const rueckmeldung = {
    kommentar: p.data.kommentar.trim() || null,
    pruefliste,
    einstufung: istEinstufung(p.data.einstufung) ? p.data.einstufung : null,
  };
  if (rueckmeldungLeer(rueckmeldung)) zurSeite(sprache, p.data.gruppe, 'abgabeLeer', { abgabe: p.data.abgabe }, 'korrektur');
  try {
    await gibZurueck(kontext, p.data.gruppe, p.data.abgabe, rueckmeldung);
  } catch (e) {
    // Austritt, Widerruf oder Ablauf seit dem Öffnen: nicht mehr sichtbar (wie „gibt es nicht“)
    if (e instanceof KeinZugang) zurSeite(sprache, p.data.gruppe, 'abgabeWeg');
    throw e;
  }
  zurSeite(sprache, p.data.gruppe, 'zurueckgegeben');
}
