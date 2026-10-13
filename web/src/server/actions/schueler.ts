'use server';

import { and, eq, isNull } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import texte from '../../../messages/bereiche/kinder.json';
import { protokolliere } from '@/lib/audit';
import { db, schema } from '@/lib/db';
import { funktionAn } from '@/lib/funktionen';
import { berlinerDatum } from '@/lib/gebetszeiten/naechstes';
import { KONTO_EINWILLIGUNG_VERSION, textVersion } from '@/lib/konto/einwilligung';
import { einwilligungsLage } from '@/lib/konto/sechzehn';
import { verlangeKontenAktion } from '@/lib/konto/zugang';
import { ladeGruppenKontext, verlangeKontoRecht } from '@/lib/rechte/gemeinde';
import { KeinRecht } from '@/lib/rechte/pruefe';
import { pfadFuer } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';

/**
 * Eigene Einwilligung ab 16 (DSFA D-11): Schülerinnen und Schüler ab dem 16. Geburtstag erteilen und widerrufen die
 * Einwilligung für Gruppenchat und Push selbst (Textversion mit SHA-256 des angezeigten Wortlauts, wie bei den Eltern).
 * Vor 16 entscheiden die Eltern – dann lehnt die Aktion ab. Der Widerruf wirkt sofort und nimmt auch eine noch
 * laufende Einwilligung der Eltern zurück (die Person entscheidet selbst); bei Push enden die eigenen Abos.
 */
const schemaEingabe = z.object({
  art: z.enum(['gruppenchat', 'push_kind']),
  aktion: z.enum(['erteilen', 'widerrufen']),
});
const spracheSchema = z.enum(['de', 'tr', 'en']).catch('de');

export async function eigeneEinwilligungAendern(fd: FormData): Promise<void> {
  const sprache = spracheSchema.parse(fd.get('sprache')) as Locale;
  await verlangeKontenAktion();
  if (!(await funktionAn('lernplattform'))) throw new KeinRecht();
  const konto = await verlangeKontoRecht(['schueler']);
  const kontext = await ladeGruppenKontext(konto.benutzerId);
  const p = schemaEingabe.safeParse({ art: fd.get('art'), aktion: fd.get('aktion') });
  if (!p.success || !kontext.eigeneLernendeId) throw new KeinRecht();
  const lernendeId = kontext.eigeneLernendeId;
  const { art, aktion } = p.data;
  const [l] = await db.select({ sechzehnAm: schema.lernende.sechzehnAm }).from(schema.lernende).where(eq(schema.lernende.id, lernendeId));
  if (einwilligungsLage(l?.sechzehnAm ?? null, berlinerDatum(new Date())) === 'eltern') throw new KeinRecht();

  await db.transaction(async (tx) => {
    if (aktion === 'erteilen') {
      const [eigen] = await tx
        .select({ id: schema.kontoEinwilligung.id })
        .from(schema.kontoEinwilligung)
        .where(
          and(
            eq(schema.kontoEinwilligung.lernendeId, lernendeId),
            eq(schema.kontoEinwilligung.art, art),
            eq(schema.kontoEinwilligung.erteiltVon, konto.benutzerId),
            isNull(schema.kontoEinwilligung.widerrufenAm),
          ),
        );
      if (eigen) return;
      await tx.insert(schema.kontoEinwilligung).values({
        benutzerId: konto.benutzerId,
        lernendeId,
        art,
        textVersion: textVersion(KONTO_EINWILLIGUNG_VERSION, texte[sprache].lernweg.einwilligungen.art[art].text),
        sprache,
        erteiltVon: konto.benutzerId,
      });
      await protokolliere(
        {
          benutzerId: konto.benutzerId,
          aktion: 'konto.einwilligung_erteilt',
          zielTyp: 'lernende',
          zielId: lernendeId,
          details: { art, selbst: true },
        },
        tx,
      );
      return;
    }
    const widerrufen = await tx
      .update(schema.kontoEinwilligung)
      .set({ widerrufenAm: new Date() })
      .where(
        and(
          eq(schema.kontoEinwilligung.lernendeId, lernendeId),
          eq(schema.kontoEinwilligung.art, art),
          isNull(schema.kontoEinwilligung.widerrufenAm),
        ),
      )
      .returning({ id: schema.kontoEinwilligung.id });
    if (!widerrufen.length) return;
    if (art === 'push_kind') await tx.delete(schema.pushAbo).where(eq(schema.pushAbo.benutzerId, konto.benutzerId));
    await protokolliere(
      {
        benutzerId: konto.benutzerId,
        aktion: 'konto.einwilligung_widerrufen',
        zielTyp: 'lernende',
        zielId: lernendeId,
        details: { art, selbst: true },
      },
      tx,
    );
  });
  redirect(
    pfadFuer(
      { pathname: '/mein-bereich', query: { einwilligung: aktion === 'erteilen' ? 'erteilt' : 'widerrufen' }, hash: 'einwilligungen' },
      sprache,
    ),
  );
}
