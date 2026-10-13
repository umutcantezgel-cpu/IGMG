import 'server-only';
import { and, eq, isNull, lt, or, sql } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { berlinerDatum, zeitpunkt } from '@/lib/gebetszeiten/naechstes';
import { einwilligungGilt, einwilligungsLage } from '@/lib/konto/sechzehn';
import { GEBETE, type Gebet } from '@/lib/gebetszeiten/typen';
import { entschluessele, hmac, sha256, verschluessele } from '@/lib/krypto';
import { erinnerungFaellig, type PushAboEingabe } from '@/lib/validierung/push';
import { ladeGebetszeitenFenster } from '@/server/queries/gebetszeiten';
import { sendePush, type PushNutzlast, type PushZiel } from './senden';
import type { VapidSchluessel } from './vapid';

/**
 * Push-Abos speichern und den Takt ausführen (ADR 0034). Der Endpunkt ist verschlüsselt (AES-256-GCM) und nur über
 * einen HMAC eindeutig; kein Abo enthält Namen oder Inhalte. Inaktive Abos (12 Monate ohne Erfolg) und Abos mit
 * dauerhaften Fehlern werden gelöscht.
 */
const FEHLER_GRENZE = 5;

function endpointHmac(endpoint: string): string {
  return hmac(`push|${endpoint}`, 'RATE_GEHEIMNIS');
}

/** Version des Einwilligungstexts (SHA-256 über den angezeigten Wortlaut). */
export function einwilligungsVersion(text: string): string {
  return `push-${sha256(text).slice(0, 16)}`;
}

export async function speichereAbo(
  e: PushAboEingabe,
  benutzerId: string | null,
  einwilligungText: string,
): Promise<{ neu: boolean; id: string }> {
  const { daten, schluesselId } = verschluessele(e.abo.endpoint);
  const kennung = endpointHmac(e.abo.endpoint);
  const werte = {
    benutzerId,
    endpointVerschluesselt: daten,
    schluesselId,
    p256dh: e.abo.keys.p256dh,
    auth: e.abo.keys.auth,
    sprache: e.sprache,
    themen: [...new Set(e.themen)],
    gebete: [...new Set(e.gebete)],
    minutenVorher: e.minutenVorher,
    einwilligungVersion: einwilligungsVersion(einwilligungText),
    fehlerZaehler: 0,
  };
  const [vorher] = await db.select({ id: schema.pushAbo.id }).from(schema.pushAbo).where(eq(schema.pushAbo.endpointHmac, kennung));
  const [zeile] = await db
    .insert(schema.pushAbo)
    .values({ ...werte, endpointHmac: kennung })
    .onConflictDoUpdate({ target: schema.pushAbo.endpointHmac, set: werte })
    .returning({ id: schema.pushAbo.id });
  return { neu: !vorher, id: zeile.id };
}

export async function entferneAbo(endpoint: string): Promise<boolean> {
  const geloescht = await db
    .delete(schema.pushAbo)
    .where(eq(schema.pushAbo.endpointHmac, endpointHmac(endpoint)))
    .returning({ id: schema.pushAbo.id });
  return geloescht.length > 0;
}

type AboZeile = typeof schema.pushAbo.$inferSelect;

function zielAus(abo: AboZeile): PushZiel {
  return { endpoint: entschluessele<string>(abo.endpointVerschluesselt, abo.schluesselId), p256dh: abo.p256dh, auth: abo.auth };
}

/** Sendet an ein Abo und pflegt Erfolg/Fehler; dauerhafte Fehler (404/410, ≥ 5 Fehlschläge) löschen das Abo. */
export async function sendeAnAbo(abo: AboZeile, nutzlast: PushNutzlast, vapid: VapidSchluessel, thema?: string): Promise<boolean> {
  const ergebnis = await sendePush(zielAus(abo), { ...nutzlast, sprache: abo.sprache }, vapid, {
    thema,
    ttlSek: nutzlast.art === 'gebet' ? 15 * 60 : 6 * 60 * 60,
  });
  if (ergebnis.ok) {
    await db
      .update(schema.pushAbo)
      .set({ letzterErfolg: sql`now()`, fehlerZaehler: 0 })
      .where(eq(schema.pushAbo.id, abo.id));
    return true;
  }
  if (ergebnis.entfernen || abo.fehlerZaehler + 1 >= FEHLER_GRENZE) await db.delete(schema.pushAbo).where(eq(schema.pushAbo.id, abo.id));
  else
    await db
      .update(schema.pushAbo)
      .set({ fehlerZaehler: abo.fehlerZaehler + 1 })
      .where(eq(schema.pushAbo.id, abo.id));
  return false;
}

/** Einmal-Schlüssel: true, wenn dieser Versand noch nicht stattfand (und ab jetzt als erledigt gilt). */
async function einmal(schluessel: string): Promise<boolean> {
  const zeilen = await db
    .insert(schema.pushVersand)
    .values({ schluessel })
    .onConflictDoNothing()
    .returning({ schluessel: schema.pushVersand.schluessel });
  return zeilen.length > 0;
}

/** Inaktive Abos (12 Monate ohne Erfolg) und alte Einmal-Schlüssel entfernen – im Takt und im täglichen Löschlauf. */
export async function raeumePushAuf(): Promise<number> {
  const alt = await db
    .delete(schema.pushAbo)
    .where(
      or(
        lt(schema.pushAbo.letzterErfolg, sql`now() - interval '12 months'`),
        and(isNull(schema.pushAbo.letzterErfolg), lt(schema.pushAbo.erstelltAm, sql`now() - interval '12 months'`)),
      ),
    )
    .returning({ id: schema.pushAbo.id });
  await db.delete(schema.pushVersand).where(lt(schema.pushVersand.gesendetAm, sql`now() - interval '3 days'`));
  return alt.length;
}

/** Kinder (< 16) bekommen Push nur mit Einwilligung der Eltern „Push für das Kind“ (ADR 0026, D-07). */
export async function kindDarfPush(benutzerId: string, jetzt = new Date()): Promise<boolean> {
  const z = await db
    .select({ erteiltVon: schema.kontoEinwilligung.erteiltVon, sechzehnAm: schema.lernende.sechzehnAm })
    .from(schema.kontoEinwilligung)
    .innerJoin(schema.lernende, eq(schema.lernende.id, schema.kontoEinwilligung.lernendeId))
    .where(
      and(
        eq(schema.lernende.benutzerId, benutzerId),
        eq(schema.kontoEinwilligung.art, 'push_kind'),
        isNull(schema.kontoEinwilligung.widerrufenAm),
      ),
    );
  // D-11: nach dem 16. Geburtstag und 30 Tagen Übergang zählt nur die eigene Einwilligung
  return einwilligungGilt(einwilligungsLage(z[0]?.sechzehnAm ?? null, berlinerDatum(jetzt)), z, benutzerId);
}

export type TaktErgebnis = { gebetsErinnerungen: number; fehlgeschlagen: number; geloeschteAbos: number };

/**
 * Minutentakt (vom lokalen Server oder Vercel Pro, MN-18): fällige Gebetserinnerungen für die Moschee-Zeiten Wetzlar.
 * Idempotent über `push_versand` – ein zweiter Lauf in derselben Minute sendet nichts doppelt.
 */
export async function fuehreTaktAus(vapid: VapidSchluessel, jetzt = new Date()): Promise<TaktErgebnis> {
  const fenster = await ladeGebetszeitenFenster();
  const jetztMs = jetzt.getTime();
  const abos = await db
    .select()
    .from(schema.pushAbo)
    .where(sql`'gebet' = any(${schema.pushAbo.themen})`);
  let gesendet = 0;
  let fehlgeschlagen = 0;
  // Heute und morgen (Erinnerung vor Imsak kurz nach Mitternacht)
  const tage = fenster.tage.filter((t) => {
    const ms = zeitpunkt(t.datum, '12:00').getTime();
    return Math.abs(ms - jetztMs) < 36 * 60 * 60 * 1000;
  });
  for (const abo of abos) {
    for (const tag of tage) {
      for (const gebet of abo.gebete.filter((g): g is Gebet => (GEBETE as readonly string[]).includes(g))) {
        const ms = zeitpunkt(tag.datum, tag[gebet]).getTime();
        if (!erinnerungFaellig(ms, abo.minutenVorher, jetztMs)) continue;
        if (!(await einmal(`gebet|${abo.id}|${tag.datum}|${gebet}`))) continue;
        const ok = await sendeAnAbo(abo, { art: 'gebet', gebet, zeit: tag[gebet], minuten: abo.minutenVorher }, vapid, `gebet-${gebet}`);
        if (ok) gesendet++;
        else fehlgeschlagen++;
      }
    }
  }
  const geloescht = await raeumePushAuf();
  return { gebetsErinnerungen: gesendet, fehlgeschlagen, geloeschteAbos: geloescht };
}
