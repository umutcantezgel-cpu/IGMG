'use server';

import { and, eq, isNull } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import texte from '../../../messages/bereiche/mein-bereich.json';
import { protokolliere } from '@/lib/audit';
import { db, schema } from '@/lib/db';
import { hatZugang, verlangeKontenAktion } from '@/lib/konto/zugang';
import { eigeneLernappEinwilligung, lernappMitKontoAn, lernappTextVersion, zeilenDerPerson } from '@/lib/lernapp/einwilligung';
import { blendeAus } from '@/lib/lernapp/gruppe/dienst';
import { folgenDesWiderrufs } from '@/lib/lernapp/schreiben/folgen';
import { verlangeKontoRecht, type Konto } from '@/lib/rechte/gemeinde';
import { KeinRecht } from '@/lib/rechte/pruefe';
import { pruefeRate, type Grenze } from '@/lib/validierung/ratenbegrenzung';
import { pfadFuer } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';

/**
 * Eigene Einwilligung `lernapp` in „Mein Bereich › Konto“ (S-L3 N-2; Entwurf `einwilligung-lernapp.md` EL1/EL3; Art. 7
 * Abs. 3 DSGVO). Reihenfolge wie MUSTER §5: Konten-Schalter, Konto (`verlangeKontoRecht`, Kontoart oder Verwaltungsrolle),
 * Bremse, Eingabe, Lage – erst dann wird geschrieben.
 * - Erteilen nur mit einem Schalter mit Personendaten der Lern-App (`lernapp_sync` oder `lernapp_gruppen`) und nur ab 16
 *   (bzw. ohne Lerndatensatz als Erwachsenenkonto); unter 16 entscheiden die Eltern (`kinder.ts`).
 * - Widerrufen auch ohne Schalter. Ab 16 nimmt der Widerruf auch eine noch laufende Einwilligung der Eltern zurück (die
 *   Person entscheidet selbst, wie bei Gruppenchat und Push). Danach die Folgen (`folgenDesWiderrufs`): Schreibabgaben,
 *   Lernstand auf dem Server, Zustimmung zur Bestenliste.
 * - Die Zustimmung zur Bestenliste (EL4) lässt sich hier jederzeit zurücknehmen – unabhängig von Alter und Schaltern.
 */
const spracheSchema = z.enum(['de', 'tr', 'en']).catch('de');
const eingabe = z.object({ aktion: z.enum(['erteilen', 'widerrufen']), haken: z.literal('ja').optional() });
const GRENZE: Grenze = { max: 10, fensterSekunden: 900 };

async function konto(): Promise<Konto> {
  await verlangeKontenAktion();
  const k = await verlangeKontoRecht();
  if (!hatZugang(k)) throw new KeinRecht();
  return k;
}

const zurueck = (sprache: Locale, lernapp: string): never =>
  redirect(pfadFuer({ pathname: '/mein-bereich/konto', query: { lernapp }, hash: 'lern-app' }, sprache));

/** Angezeigter Wortlaut (Text und Haken) – seine SHA-256 ist die Version. */
function wortlaut(art: 'erwachsen' | 'ab16', sprache: Locale): string {
  const l = texte[sprache].meinBereich.konto.lernapp;
  return `${l.einwilligung[art]}\n${l.haken}`;
}

export async function lernappEinwilligungAendern(fd: FormData): Promise<void> {
  const sprache = spracheSchema.parse(fd.get('sprache')) as Locale;
  const k = await konto();
  if (!(await pruefeRate('mein-lernapp', k.benutzerId, GRENZE)).erlaubt) zurueck(sprache, 'zuViele');
  const p = eingabe.safeParse({ aktion: fd.get('aktion'), haken: fd.get('haken') ?? undefined });
  if (!p.success) throw new KeinRecht();
  const stand = await eigeneLernappEinwilligung(k.benutzerId, k.istKind);
  // Unter 16 (bzw. Kinderkonto ohne Lerndatensatz) entscheiden die Eltern – erteilen wie widerrufen
  if (stand.lage === 'eltern') zurueck(sprache, 'eltern');
  const kE = schema.kontoEinwilligung;

  if (p.data.aktion === 'erteilen') {
    if (!(await lernappMitKontoAn())) throw new KeinRecht();
    if (!p.data.haken) zurueck(sprache, 'haken');
    await db.transaction(async (tx) => {
      const [aktiv] = await tx
        .select({ id: kE.id })
        .from(kE)
        .where(and(zeilenDerPerson(k.benutzerId, stand.lernendeId), eq(kE.erteiltVon, k.benutzerId), isNull(kE.widerrufenAm)));
      if (aktiv) return;
      await tx.insert(kE).values({
        benutzerId: k.benutzerId,
        lernendeId: stand.lernendeId,
        art: 'lernapp',
        textVersion: lernappTextVersion(stand.textArt, wortlaut(stand.textArt, sprache)),
        sprache,
        erteiltVon: k.benutzerId,
      });
      await protokolliere(
        {
          benutzerId: k.benutzerId,
          aktion: 'konto.einwilligung_erteilt',
          zielTyp: 'konto',
          zielId: k.benutzerId,
          details: { art: 'lernapp', selbst: true },
        },
        tx,
      );
    });
    zurueck(sprache, 'erteilt');
  }

  await db.transaction(async (tx) => {
    const zeilen = await tx
      .update(kE)
      .set({ widerrufenAm: new Date() })
      .where(and(zeilenDerPerson(k.benutzerId, stand.lernendeId), isNull(kE.widerrufenAm)))
      .returning({ id: kE.id });
    if (zeilen.length)
      await protokolliere(
        {
          benutzerId: k.benutzerId,
          aktion: 'konto.einwilligung_widerrufen',
          zielTyp: 'konto',
          zielId: k.benutzerId,
          details: { art: 'lernapp', selbst: true },
        },
        tx,
      );
  });
  // Folgen nach dem gespeicherten Widerruf (auch ohne Zeile: ein früher gescheiterter Lauf wird so nachgeholt)
  await folgenDesWiderrufs('lernapp', { benutzerId: k.benutzerId }, k.benutzerId);
  zurueck(sprache, 'widerrufen');
}

/** Zustimmung zur Bestenliste zurücknehmen (EL4) – sofort, ohne Verlauf, auch ohne Schalter. */
export async function lernappBestenlisteZuruecknehmen(fd: FormData): Promise<void> {
  const sprache = spracheSchema.parse(fd.get('sprache')) as Locale;
  const k = await konto();
  await blendeAus(k.benutzerId);
  zurueck(sprache, 'ausgeblendet');
}
