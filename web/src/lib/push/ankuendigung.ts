import 'server-only';
import { and, eq, gt, inArray, isNotNull, isNull, lte, or, sql } from 'drizzle-orm';
import { revalidateTag } from 'next/cache';
import { pfadFuer } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { TAG } from '@/lib/cache/tags';
import { db, schema } from '@/lib/db';
import { funktionAn } from '@/lib/funktionen';
import { darf } from '@/lib/rechte/matrix';
import { kindDarfPush, sendeAnAbo } from './abo';
import { gueltigePushVersionen } from './einwilligung';
import { vapidAusUmgebung, type VapidSchluessel } from './vapid';

/**
 * Push zum Thema „Ankündigung“ (ADR 0034 Nr. 3, Z-01): Sobald eine veröffentlichte Ankündigung sichtbar ist, erhält jedes
 * Abo mit diesem Thema genau eine Benachrichtigung. Die Nutzlast trägt nur Art und Pfad (`/nachrichten` in der Sprache des
 * Abos); Titel und Text setzt der Service Worker aus `/api/push/texte/<sprache>` – kein Inhalt, kein Name (S-16).
 *
 * - Auslöser: das Veröffentlichen in der Verwaltung (`after()`), bei späterem Beginn der Minutentakt (Nachholfenster 2 h).
 * - Recht: Wer die Ankündigung zuletzt gespeichert hat, braucht `push.ankuendigung` (Redaktion, Administration); eine
 *   Organisationsredaktion veröffentlicht ohne Benachrichtigung.
 * - Nur mit Schalter `push` und VAPID-Schlüssel; Kinder nur mit Einwilligung „Push für das Kind“ (D-07, D-11); nur Abos mit
 *   Einwilligung zum aktuellen Wortlaut (D-17).
 * - Idempotent über `push_versand` (Einmal-Schlüssel je Abo und Ankündigung). Die Schlüssel verfallen nach drei Tagen
 *   (`raeumePushAuf`); wer eine Ankündigung später erneut veröffentlicht, löst dann wieder eine Benachrichtigung aus.
 */
const NACHHOLEN_MS = 2 * 60 * 60 * 1000;
const THEMA = 'ankuendigung';

type Ankuendigung = typeof schema.ankuendigung.$inferSelect;

/** Öffentlich sichtbar zum Zeitpunkt `jetzt` (gleiche Regel wie `sichtbareAnkuendigungen`). */
export function ankuendigungSichtbar(
  a: Pick<Ankuendigung, 'status' | 'imPapierkorbSeit' | 'sichtbarAb' | 'laeuftAb'>,
  jetzt: Date,
): boolean {
  return (
    a.status === 'veroeffentlicht' &&
    a.imPapierkorbSeit === null &&
    (a.sichtbarAb === null || a.sichtbarAb.getTime() <= jetzt.getTime()) &&
    (a.laeuftAb === null || a.laeuftAb.getTime() > jetzt.getTime())
  );
}

/** Ziel der Benachrichtigung: die Nachrichtenseite in der Sprache des Abos (Ankündigungen stehen oberhalb der Nachrichten). */
export function ankuendigungsPfad(sprache: string): string {
  const s = (routing.locales as readonly string[]).includes(sprache) ? (sprache as Locale) : routing.defaultLocale;
  return pfadFuer('/nachrichten', s);
}

/** Darf die Person, die zuletzt gespeichert hat, eine Benachrichtigung auslösen? Gesperrte Konten nie. */
async function darfBenachrichtigen(benutzerId: string | null): Promise<boolean> {
  if (!benutzerId) return false;
  const [person] = await db.select({ gesperrtAm: schema.user.gesperrtAm }).from(schema.user).where(eq(schema.user.id, benutzerId)).limit(1);
  if (!person || person.gesperrtAm) return false;
  const rollen = await db
    .select({ rolle: schema.rolleZuweisung.rolle, organisation: schema.rolleZuweisung.organisation })
    .from(schema.rolleZuweisung)
    .where(eq(schema.rolleZuweisung.benutzerId, benutzerId));
  return darf(rollen, 'push.ankuendigung');
}

async function versende(a: Ankuendigung, vapid: VapidSchluessel, jetzt: Date): Promise<number> {
  if (!ankuendigungSichtbar(a, jetzt) || !(await darfBenachrichtigen(a.aktualisiertVon))) return 0;
  const abos = await db
    .select()
    .from(schema.pushAbo)
    .where(and(sql`${THEMA} = any(${schema.pushAbo.themen})`, inArray(schema.pushAbo.einwilligungVersion, gueltigePushVersionen())));
  if (!abos.length) return 0;
  // Lernende (Kinderkonten und Jugendliche) nur mit gültiger Einwilligung „Push für das Kind“ – wie bei Gruppen-Push
  const konten = [...new Set(abos.map((x) => x.benutzerId).filter((id): id is string => id !== null))];
  const lernend = new Set(
    konten.length
      ? (
          await db
            .select({ id: schema.lernende.benutzerId })
            .from(schema.lernende)
            .where(and(isNotNull(schema.lernende.benutzerId), inArray(schema.lernende.benutzerId, konten)))
        ).map((z) => z.id)
      : [],
  );
  const freigabe = new Map<string, boolean>();
  let gesendet = 0;
  for (const abo of abos) {
    const wer = abo.benutzerId;
    if (wer && lernend.has(wer)) {
      if (!freigabe.has(wer)) freigabe.set(wer, await kindDarfPush(wer, jetzt));
      if (!freigabe.get(wer)) continue;
    }
    const neu = await db
      .insert(schema.pushVersand)
      .values({ schluessel: `${THEMA}|${abo.id}|${a.id}` })
      .onConflictDoNothing()
      .returning({ schluessel: schema.pushVersand.schluessel });
    if (!neu.length) continue;
    // Ein fehlerhaftes Abo darf den Versand an die übrigen nicht abbrechen (M-4 der Sicherheitsprüfung S1)
    if (await sendeAnAbo(abo, { art: THEMA, pfad: ankuendigungsPfad(abo.sprache) }, vapid, THEMA).catch(() => false)) gesendet++;
  }
  return gesendet;
}

/**
 * Nach dem Veröffentlichen (Verwaltung, `after()`): sendet, wenn die Ankündigung jetzt sichtbar ist. Liefert die Zahl der
 * erfolgreich zugestellten Benachrichtigungen; Fehler bleiben folgenlos (die Antwort an die Redaktion ist schon gesendet).
 */
export async function sendeAnkuendigungsPush(ankuendigungId: string, jetzt = new Date()): Promise<number> {
  const vapid = vapidAusUmgebung();
  if (!vapid || !(await funktionAn('push'))) return 0;
  const [a] = await db.select().from(schema.ankuendigung).where(eq(schema.ankuendigung.id, ankuendigungId)).limit(1);
  return a ? versende(a, vapid, jetzt) : 0;
}

/**
 * Minutentakt: Ankündigungen mit späterem Beginn, deren Sichtbarkeit in den letzten zwei Stunden begonnen hat. Ein Takt,
 * der kurz aussetzt, holt nach; Doppelversand verhindert der Einmal-Schlüssel. Den Schalter `push` prüft der Aufrufer.
 *
 * Vor dem Versand verfällt der Cache-Tag `ankuendigungen` sofort (`expire: 0`, keine veralteten Daten): Der Block auf
 * `/nachrichten` hält sonst den Stand vor dem Beginn bis zu einer Stunde (`cacheLife('hours')`), und wer die Mitteilung
 * antippt, sähe die Ankündigung nicht. Das geschieht in jedem Takt des Nachholfensters, nicht nur im ersten: Ein
 * Seitenaufbau, der den Stand vor dem Beginn gelesen hat und erst danach fertig wird, hält sich so höchstens eine
 * Minute (wie der Nachlauf in `inhaltGeaendert`, FEHLERSTATISTIK F-002). Nur aus einem Route Handler aufrufen
 * (`revalidateTag`; `updateTag` gibt es nur in Server Actions).
 */
export async function sendeFaelligeAnkuendigungen(vapid: VapidSchluessel, jetzt = new Date()): Promise<number> {
  const a = schema.ankuendigung;
  const faellig = await db
    .select()
    .from(a)
    .where(
      and(
        eq(a.status, 'veroeffentlicht'),
        isNull(a.imPapierkorbSeit),
        gt(a.sichtbarAb, new Date(jetzt.getTime() - NACHHOLEN_MS)),
        lte(a.sichtbarAb, jetzt),
        or(isNull(a.laeuftAb), gt(a.laeuftAb, jetzt)),
      ),
    );
  if (!faellig.length) return 0;
  revalidateTag(TAG.ankuendigungen, { expire: 0 });
  let gesendet = 0;
  for (const z of faellig) gesendet += await versende(z, vapid, jetzt);
  return gesendet;
}
