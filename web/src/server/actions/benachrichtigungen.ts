'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { pfadFuer } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { funktionAn } from '@/lib/funktionen';
import { hatZugang, verlangeKontenAktion } from '@/lib/konto/zugang';
import { waehleThemen } from '@/lib/push/rueckfall';
import { speichereZusammenfassungsWahl, waehlbareThemen } from '@/lib/push/zusammenfassung';
import { zusammenfassungsLage } from '@/lib/push/zusammenfassung-mail';
import { verlangeKontoRecht } from '@/lib/rechte/gemeinde';
import { KeinRecht } from '@/lib/rechte/pruefe';

/**
 * Mein Bereich › Benachrichtigungen: Zusammenfassung per E-Mail bestellen, Themen ändern oder abbestellen (ADR 0034 Nr. 6,
 * F-38). Reihenfolge: Schalter `konten` und `push`, Konto mit Rolle und – wo Pflicht – zweitem Faktor
 * (`verlangeKontoRecht`), nie Kinderkonten; bestätigte, zustellbare Adresse; nur Themen, die das Konto wählen kann.
 * Formular ohne JavaScript; die Antwort ist eine Weiterleitung mit Meldung an den Abschnitt.
 */
const spracheSchema = z.enum(['de', 'tr', 'en']).catch('de');

export async function speichereZusammenfassung(fd: FormData): Promise<void> {
  const sprache = spracheSchema.parse(fd.get('sprache')) as Locale;
  await verlangeKontenAktion();
  if (!(await funktionAn('push'))) throw new KeinRecht();
  const k = await verlangeKontoRecht();
  if (!hatZugang(k) || k.istKind) throw new KeinRecht();
  const ziel = (meldung: string) =>
    pfadFuer({ pathname: '/mein-bereich/benachrichtigungen', query: { zusammenfassung: meldung }, hash: 'zusammenfassung' }, sprache);
  const lage = await zusammenfassungsLage(k.benutzerId);
  if (!lage.moeglich) {
    if (lage.grund === 'kind' || lage.grund === 'aus') throw new KeinRecht();
    redirect(ziel(lage.grund));
  }
  const themen = waehleThemen(fd.getAll('thema'), await waehlbareThemen(k.benutzerId));
  redirect(ziel(await speichereZusammenfassungsWahl(k.benutzerId, themen)));
}
