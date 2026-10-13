'use server';

import { eq } from 'drizzle-orm';
import { refresh } from 'next/cache';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { protokolliere } from '@/lib/audit';
import { inhaltGeaendert } from '@/lib/cache/aktualisieren';
import { TAG } from '@/lib/cache/tags';
import { db, schema } from '@/lib/db';
import { darf, verlangeRecht, type Angemeldet } from '@/lib/rechte/pruefe';
import { BESONDERER_TAG_FELDER, besondererTagDatensatz, besondererTagSchema } from '@/lib/validierung/besonderer-tag';
import { offeneVorschlaege } from '@/server/queries/verwaltung/besondere-tage';

/**
 * Verwaltung „Besondere Tage“ (AUFTRAG 3.10, MN-15, ADR 0030). Recht `kalender.bearbeiten` (Redaktion, religiöse
 * Prüfung); „bestätigt“ (Quelle „bestaetigt“, Freigabe „geprueft“, öffentlich ohne „vorläufig“) nur mit
 * `religioes.freigeben`. Jede andere Änderung setzt auf „zur Prüfung“ und Quelle „berechnet“ zurück. Öffentlich
 * erscheinen nur geprüfte Einträge (sonst der berechnete Vorschlag als „vorläufig“).
 */
export type TagZustand = { fehler?: string; feldFehler?: Record<string, string>; werte?: Record<string, string>; gespeichert?: number };

const b = schema.besondererTag;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Berechnete Vorschläge eines Jahres übernehmen (Quelle „berechnet“, zur Prüfung). Idempotent: Vorhandenes bleibt. */
export async function uebernehmeVorschlaege(fd: FormData): Promise<void> {
  const a = await verlangeRecht('kalender.bearbeiten');
  const jahr = Number(fd.get('jahr'));
  if (!Number.isInteger(jahr) || jahr < 2000 || jahr > 2100) return;
  const offen = await offeneVorschlaege(jahr);
  if (offen.length) {
    // Titel in allen drei Sprachen aus den Sprachdateien (Namen der Tage, kein religiöser Text)
    const [de, tr, en] = await Promise.all(
      (['de', 'tr', 'en'] as const).map((locale) => getTranslations({ locale, namespace: 'kalender' })),
    );
    await db.transaction(async (tx) => {
      await tx.insert(b).values(
        offen.map((v) => ({
          art: v.art,
          datum: v.datum,
          titel: { de: de(`tage.${v.schluessel}`), tr: tr(`tage.${v.schluessel}`), en: en(`tage.${v.schluessel}`) },
          quelle: 'berechnet' as const,
          freigabe: 'zur_pruefung' as const,
          verfasstVon: a.benutzerId,
        })),
      );
      await protokolliere(
        { benutzerId: a.benutzerId, aktion: 'inhalt.angelegt', zielTyp: 'besonderer_tag', details: { jahr, anzahl: offen.length } },
        tx,
      );
    });
  }
  refresh();
}

function roh(fd: FormData): Record<string, string> {
  return Object.fromEntries(BESONDERER_TAG_FELDER.map((f) => [f, String(fd.get(f) ?? '')]));
}

/** Anlegen (ohne `id`) oder ändern; „bestätigt“ nur mit Freigaberecht, sonst zurück auf „zur Prüfung“. */
export async function speichereBesonderenTag(_vorher: TagZustand, fd: FormData): Promise<TagZustand> {
  let a: Angemeldet;
  try {
    a = await verlangeRecht('kalender.bearbeiten');
  } catch {
    return { fehler: 'keinRecht' };
  }
  const id = String(fd.get('id') ?? '');
  const werte = roh(fd);
  if (id && !UUID.test(id)) return { fehler: 'nichtGefunden', werte };
  const p = besondererTagSchema.safeParse(werte);
  if (!p.success) {
    const feldFehler: Record<string, string> = {};
    for (const f of p.error.issues) {
      const feld = String(f.path[0] ?? 'formular');
      feldFehler[feld] ??= /^[a-zA-Z]+$/.test(f.message) && f.message.length < 30 ? f.message : 'ungueltig';
    }
    return { fehler: 'pruefen', feldFehler, werte };
  }
  const bestaetigen = p.data.bestaetigen === 'ja';
  if (bestaetigen && !darf(a.rollen, 'religioes.freigeben')) return { fehler: 'keinFreigaberecht', werte };
  const daten = besondererTagDatensatz(p.data);
  const freigabe = bestaetigen
    ? { quelle: 'bestaetigt' as const, freigabe: 'geprueft' as const, geprueftVon: a.benutzerId, geprueftAm: new Date() }
    : { quelle: 'berechnet' as const, freigabe: 'zur_pruefung' as const, geprueftVon: null, geprueftAm: null, verfasstVon: a.benutzerId };
  const neuId = await db.transaction(async (tx) => {
    let zielId = id;
    if (id) {
      const r = await tx
        .update(b)
        .set({ ...daten, ...freigabe })
        .where(eq(b.id, id))
        .returning({ id: b.id });
      if (!r.length) return null;
      await protokolliere({ benutzerId: a.benutzerId, aktion: 'inhalt.geaendert', zielTyp: 'besonderer_tag', zielId: id }, tx);
    } else {
      const [neu] = await tx
        .insert(b)
        .values({ ...daten, ...freigabe, verfasstVon: a.benutzerId })
        .returning({ id: b.id });
      zielId = neu.id;
      await protokolliere({ benutzerId: a.benutzerId, aktion: 'inhalt.angelegt', zielTyp: 'besonderer_tag', zielId }, tx);
    }
    if (bestaetigen)
      await protokolliere({ benutzerId: a.benutzerId, aktion: 'besonderer_tag.bestaetigt', zielTyp: 'besonderer_tag', zielId }, tx);
    return zielId;
  });
  if (!neuId) return { fehler: 'nichtGefunden', werte };
  inhaltGeaendert(TAG.kalender);
  if (!id) redirect(`/verwaltung/besondere-tage/${neuId}?angelegt=1`);
  return { gespeichert: Date.now() };
}

/** Ohne Änderung bestätigen (Freigabe durch die religiöse Prüfung, ADR 0030). */
export async function bestaetigeBesonderenTag(fd: FormData): Promise<void> {
  const a = await verlangeRecht('religioes.freigeben');
  const id = String(fd.get('id') ?? '');
  if (!UUID.test(id)) return;
  await db.transaction(async (tx) => {
    const r = await tx
      .update(b)
      .set({ quelle: 'bestaetigt', freigabe: 'geprueft', geprueftVon: a.benutzerId, geprueftAm: new Date() })
      .where(eq(b.id, id))
      .returning({ id: b.id });
    if (r.length)
      await protokolliere({ benutzerId: a.benutzerId, aktion: 'besonderer_tag.bestaetigt', zielTyp: 'besonderer_tag', zielId: id }, tx);
  });
  inhaltGeaendert(TAG.kalender);
  refresh();
}

/** Eintrag entfernen (öffentlich gilt danach wieder der berechnete Vorschlag, falls es einen gibt). */
export async function entferneBesonderenTag(fd: FormData): Promise<void> {
  const a = await verlangeRecht('kalender.bearbeiten');
  const id = String(fd.get('id') ?? '');
  if (!UUID.test(id)) return;
  const [geloescht] = await db.transaction(async (tx) => {
    const r = await tx.delete(b).where(eq(b.id, id)).returning({ datum: b.datum });
    if (r.length) await protokolliere({ benutzerId: a.benutzerId, aktion: 'inhalt.geloescht', zielTyp: 'besonderer_tag', zielId: id }, tx);
    return r;
  });
  inhaltGeaendert(TAG.kalender);
  redirect(`/verwaltung/besondere-tage?jahr=${geloescht ? geloescht.datum.slice(0, 4) : ''}`);
}
