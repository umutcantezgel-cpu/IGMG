'use server';

import { and, eq, isNotNull, isNull, like } from 'drizzle-orm';
import { refresh } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { protokolliere } from '@/lib/audit';
import { inhaltGeaendert } from '@/lib/cache/aktualisieren';
import { TAG } from '@/lib/cache/tags';
import { db, schema } from '@/lib/db';
import { MedienFehler, erzeugeVarianten, verarbeiteDatei } from '@/lib/medien/verarbeiten';
import { variantenSchluessel } from '@/lib/medien/varianten';
import { KeinRecht, verlangeRecht } from '@/lib/rechte/pruefe';
import { loescheMitVarianten, speicher } from '@/lib/storage';
import { ladeMedium, verwendungVon } from '@/server/queries/verwaltung/medien';

/**
 * Verwaltung „Medien“ (C11, ADR 0007, K-05, K-10). Hochladen nur mit `medium.hochladen`, Papierkorb und Löschen nur mit
 * `medium.loeschen`. Alt-Text (Deutsch) ist Pflicht; genutzte Medien lassen sich weder in den Papierkorb legen noch löschen.
 */
export type MedienZustand = {
  fehler?: string;
  feldFehler?: Record<string, string>;
  ok?: boolean;
  id?: string;
  werte?: Record<string, string>;
};

const m = schema.medium;
const textFelder = z.object({
  altDe: z.string('pflicht').trim().min(3, 'altKurz').max(250, 'zuLang'),
  altTr: z.string().trim().max(250, 'zuLang').default(''),
  altEn: z.string().trim().max(250, 'zuLang').default(''),
  bildrechte: z.string().trim().max(200, 'zuLang').default(''),
});
const texte = (fd: FormData) => ({
  altDe: String(fd.get('altDe') ?? ''),
  altTr: String(fd.get('altTr') ?? ''),
  altEn: String(fd.get('altEn') ?? ''),
  bildrechte: String(fd.get('bildrechte') ?? ''),
});
function feldFehler(e: z.ZodError): Record<string, string> {
  const f: Record<string, string> = {};
  for (const i of e.issues) f[String(i.path[0] ?? 'formular')] ??= i.message;
  return f;
}
const alt = (d: z.infer<typeof textFelder>) => ({ de: d.altDe, ...(d.altTr ? { tr: d.altTr } : {}), ...(d.altEn ? { en: d.altEn } : {}) });

/** Öffentliche Inhalte, die Medien zeigen, sofort neu erzeugen (Alt-Text oder Sichtbarkeit geändert). */
const oeffentlichNeu = () => inhaltGeaendert(TAG.medien, TAG.nachrichten, TAG.veranstaltungen, TAG.kurse);

export async function hochladen(_vorher: MedienZustand, fd: FormData): Promise<MedienZustand> {
  const a = await verlangeRecht('medium.hochladen');
  const werte = texte(fd);
  const p = textFelder.safeParse(werte);
  const datei = fd.get('datei');
  if (!(datei instanceof File) || datei.size === 0)
    return { fehler: 'pruefen', feldFehler: { datei: 'dateiFehlt', ...(p.success ? {} : feldFehler(p.error)) }, werte };
  if (!p.success) return { fehler: 'pruefen', feldFehler: feldFehler(p.error), werte };
  let v;
  try {
    v = await verarbeiteDatei(Buffer.from(await datei.arrayBuffer()), datei.name);
  } catch (e) {
    return { fehler: 'pruefen', feldFehler: { datei: e instanceof MedienFehler ? `datei_${e.grund}` : 'datei_defekt' }, werte };
  }
  // Gleicher Inhalt schon vorhanden (auch unter anderem Namen) → vorhandenen Eintrag nutzen (Hash vorn im Schlüssel)
  const [vorhanden] = await db
    .select({ id: m.id, imPapierkorbSeit: m.imPapierkorbSeit })
    .from(m)
    .where(like(m.schluessel, `${v.hash}/%`))
    .limit(1);
  // Dublette im Papierkorb: nicht still dorthin leiten, sondern sagen, wo sie liegt (Tor B/C SP-C2 H2)
  if (vorhanden?.imPapierkorbSeit) return { fehler: 'pruefen', feldFehler: { datei: 'datei_imPapierkorb' }, werte };
  if (vorhanden) redirect(`/verwaltung/medien/${vorhanden.id}?meldung=hochgeladen`);
  await speicher().schreibe(v.schluessel, v.daten, v.typ);
  // Bildvarianten (ADR 0020): WebP in festen Breiten unterhalb der Originalbreite, neben dem Original
  try {
    for (const variante of await erzeugeVarianten(v)) {
      await speicher().schreibe(variantenSchluessel(v.schluessel, variante.breite), variante.daten, 'image/webp');
    }
  } catch (e) {
    await loescheMitVarianten(v.schluessel).catch(() => undefined);
    throw e;
  }
  // Scheitert der Eintrag, die eben geschriebenen Dateien wieder entfernen – keine verwaiste Datei (SP-C2 H4)
  const [neu] = await db
    .transaction(async (tx) => {
      const zeilen = await tx
        .insert(m)
        .values({
          schluessel: v.schluessel,
          typ: v.typ,
          groesse: v.daten.length,
          breite: v.breite,
          hoehe: v.hoehe,
          alt: alt(p.data),
          bildrechte: p.data.bildrechte || null,
          dateiname: datei.name.slice(0, 200),
          erstelltVon: a.benutzerId,
        })
        .returning({ id: m.id });
      await protokolliere(
        {
          benutzerId: a.benutzerId,
          aktion: 'medium.hochgeladen',
          zielTyp: 'medium',
          zielId: zeilen[0].id,
          details: { typ: v.typ, groesse: v.daten.length },
        },
        tx,
      );
      return zeilen;
    })
    .catch(async (e: unknown) => {
      await loescheMitVarianten(v.schluessel).catch(() => undefined);
      throw e;
    });
  inhaltGeaendert(TAG.medien);
  // Weiterleitung aus der Action, nicht aus einem Effekt: Next.js hält die Liste versteckt im DOM, ein Effekt mit
  // router.push liefe beim Zurückkehren erneut (Befund E2E C11)
  redirect(`/verwaltung/medien/${neu.id}?meldung=hochgeladen`);
}

export async function aendern(_vorher: MedienZustand, fd: FormData): Promise<MedienZustand> {
  const a = await verlangeRecht('medium.hochladen');
  const medium = await ladeMedium(String(fd.get('id') ?? ''));
  if (!medium) throw new KeinRecht();
  const werte = texte(fd);
  // Im Papierkorb nur wiederherstellen oder löschen, nicht ändern – wie bei Inhalten (SP-C2 H3)
  if (medium.imPapierkorbSeit) return { fehler: 'imPapierkorb', werte };
  const p = textFelder.safeParse(werte);
  if (!p.success) return { fehler: 'pruefen', feldFehler: feldFehler(p.error), werte };
  await db.transaction(async (tx) => {
    await tx
      .update(m)
      .set({ alt: alt(p.data), bildrechte: p.data.bildrechte || null })
      .where(eq(m.id, medium.id));
    await protokolliere({ benutzerId: a.benutzerId, aktion: 'inhalt.geaendert', zielTyp: 'medium', zielId: medium.id }, tx);
  });
  oeffentlichNeu();
  refresh();
  return { ok: true, id: medium.id };
}

export async function inPapierkorb(fd: FormData): Promise<void> {
  const a = await verlangeRecht('medium.loeschen');
  const medium = await ladeMedium(String(fd.get('id') ?? ''));
  if (!medium) throw new KeinRecht();
  if ((await verwendungVon(medium.id)).length) redirect(`/verwaltung/medien/${medium.id}?fehler=verwendet`);
  await db.transaction(async (tx) => {
    await tx
      .update(m)
      .set({ imPapierkorbSeit: new Date() })
      .where(and(eq(m.id, medium.id), isNull(m.imPapierkorbSeit)));
    await protokolliere({ benutzerId: a.benutzerId, aktion: 'inhalt.papierkorb', zielTyp: 'medium', zielId: medium.id }, tx);
  });
  oeffentlichNeu();
  redirect('/verwaltung/medien?meldung=papierkorb');
}

export async function wiederherstellen(fd: FormData): Promise<void> {
  const a = await verlangeRecht('medium.loeschen');
  const medium = await ladeMedium(String(fd.get('id') ?? ''));
  if (!medium) throw new KeinRecht();
  await db.transaction(async (tx) => {
    await tx
      .update(m)
      .set({ imPapierkorbSeit: null })
      .where(and(eq(m.id, medium.id), isNotNull(m.imPapierkorbSeit)));
    await protokolliere({ benutzerId: a.benutzerId, aktion: 'inhalt.wiederhergestellt', zielTyp: 'medium', zielId: medium.id }, tx);
  });
  oeffentlichNeu();
  redirect('/verwaltung/medien?ansicht=papierkorb&meldung=wiederhergestellt');
}

/** Endgültig löschen (K-05): nur aus dem Papierkorb und nur ungenutzt – Datei und Eintrag. */
export async function endgueltigLoeschen(fd: FormData): Promise<void> {
  const a = await verlangeRecht('medium.loeschen');
  const medium = await ladeMedium(String(fd.get('id') ?? ''));
  if (!medium || !medium.imPapierkorbSeit) throw new KeinRecht();
  if ((await verwendungVon(medium.id)).length) redirect(`/verwaltung/medien/${medium.id}?fehler=verwendet`);
  await db.transaction(async (tx) => {
    await tx.delete(m).where(and(eq(m.id, medium.id), isNotNull(m.imPapierkorbSeit)));
    await protokolliere(
      { benutzerId: a.benutzerId, aktion: 'medium.geloescht', zielTyp: 'medium', zielId: medium.id, details: { typ: medium.typ } },
      tx,
    );
  });
  await loescheMitVarianten(medium.schluessel);
  redirect('/verwaltung/medien?ansicht=papierkorb&meldung=geloescht');
}
