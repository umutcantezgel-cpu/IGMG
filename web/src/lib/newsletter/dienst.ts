import 'server-only';
import { and, eq, isNotNull, isNull, lt, sql } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { gleich, hmac, sha256, verschluessele, zufallsToken } from '@/lib/krypto';

/**
 * Newsletter mit Double-Opt-in (AUFTRAG 3.10, K-B): Die Adresse liegt verschlüsselt, eindeutig nur über einen HMAC.
 * Anmeldung → Bestätigungslink (48 h); erst danach gibt es Post. Abmelden jederzeit über den Link in jeder Mail.
 * Nicht bestätigte Anmeldungen verfallen nach 48 h (Löschlauf). Antworten verraten nie, ob eine Adresse bekannt ist.
 */
export const NEWSLETTER_THEMEN = ['allgemein', 'veranstaltungen', 'bildung', 'ramadan'] as const;
export type NewsletterThema = (typeof NEWSLETTER_THEMEN)[number];

const kennung = (email: string) => hmac(`newsletter|${email.trim().toLowerCase()}`, 'RATE_GEHEIMNIS');

export function einwilligungVersionNewsletter(text: string): string {
  return `newsletter-${sha256(text).slice(0, 16)}`;
}

/**
 * Anmeldung: legt die Anmeldung an oder erneuert das Token einer unbestätigten. Bereits bestätigte Adressen bekommen
 * keinen neuen Link (aber dieselbe Antwort). Liefert das Token für die Bestätigungsmail oder null.
 */
export async function meldeAn(
  email: string,
  sprache: 'de' | 'tr' | 'en',
  themen: NewsletterThema[],
  einwilligungText: string,
): Promise<string | null> {
  const adresse = email.trim().toLowerCase();
  const hash = kennung(adresse);
  const [vorhanden] = await db.select().from(schema.newsletterAbo).where(eq(schema.newsletterAbo.emailHmac, hash));
  if (vorhanden?.bestaetigtAm && !vorhanden.abgemeldetAm) return null;
  const token = zufallsToken(32);
  const v = verschluessele(adresse);
  const werte = {
    emailVerschluesselt: v.daten,
    schluesselId: v.schluesselId,
    sprache,
    themen: themen.length ? [...new Set(themen)] : ['allgemein'],
    tokenHash: sha256(token),
    einwilligungVersion: einwilligungVersionNewsletter(einwilligungText),
    bestaetigtAm: null,
    abgemeldetAm: null,
    erstelltAm: new Date(),
  };
  await db
    .insert(schema.newsletterAbo)
    .values({ ...werte, emailHmac: hash })
    .onConflictDoUpdate({ target: schema.newsletterAbo.emailHmac, set: werte });
  return token;
}

/** Bestätigung über den Link (48 h gültig). */
export async function bestaetige(token: string): Promise<boolean> {
  if (!/^[A-Za-z0-9_-]{20,100}$/.test(token)) return false;
  const r = await db
    .update(schema.newsletterAbo)
    .set({ bestaetigtAm: new Date() })
    .where(
      and(
        eq(schema.newsletterAbo.tokenHash, sha256(token)),
        isNull(schema.newsletterAbo.bestaetigtAm),
        isNull(schema.newsletterAbo.abgemeldetAm),
        sql`${schema.newsletterAbo.erstelltAm} > now() - interval '48 hours'`,
      ),
    )
    .returning({ id: schema.newsletterAbo.id });
  return r.length > 0;
}

/**
 * Abmelde-Token für jede Newsletter-Ausgabe: an die Anmeldung gebunden (HMAC über ihre ID), ohne ein weiteres Token
 * in der Datenbank. Form „a“ + 32 Hex-Zeichen der ID + 32 Hex-Zeichen Signatur – passt zum Muster von `meldeAb`.
 */
export function abmeldeToken(aboId: string): string {
  const roh = aboId.replace(/-/g, '').toLowerCase();
  return `a${roh}${hmac(`newsletter-abmelden|${roh}`, 'RATE_GEHEIMNIS').slice(0, 32)}`;
}

const ABMELDE_TOKEN = /^a([0-9a-f]{32})([0-9a-f]{32})$/;

/**
 * Abmeldung über das Token aus jeder Mail (bleibt gültig): das Token der Anmeldung oder das signierte Abmelde-Token
 * einer Ausgabe. Löscht die Adresse sofort (Datensparsamkeit).
 */
export async function meldeAb(token: string): Promise<boolean> {
  if (!/^[A-Za-z0-9_-]{20,100}$/.test(token)) return false;
  const signiert = ABMELDE_TOKEN.exec(token);
  if (signiert && gleich(token, abmeldeToken(signiert[1]))) {
    const h = signiert[1];
    const id = `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
    const r = await db.delete(schema.newsletterAbo).where(eq(schema.newsletterAbo.id, id)).returning({ id: schema.newsletterAbo.id });
    return r.length > 0;
  }
  const r = await db
    .delete(schema.newsletterAbo)
    .where(eq(schema.newsletterAbo.tokenHash, sha256(token)))
    .returning({ id: schema.newsletterAbo.id });
  return r.length > 0;
}

/** Unbestätigte Anmeldungen nach 48 h entfernen (Wartungslauf). */
export async function raeumeNewsletterAuf(): Promise<number> {
  const r = await db
    .delete(schema.newsletterAbo)
    .where(and(isNull(schema.newsletterAbo.bestaetigtAm), lt(schema.newsletterAbo.erstelltAm, sql`now() - interval '48 hours'`)))
    .returning({ id: schema.newsletterAbo.id });
  return r.length;
}

/** Zahl der bestätigten Empfänger je Thema (Verwaltung, ohne Adressen). */
export async function empfaengerZahl(thema?: NewsletterThema): Promise<number> {
  const [z] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(schema.newsletterAbo)
    .where(
      and(
        isNotNull(schema.newsletterAbo.bestaetigtAm),
        isNull(schema.newsletterAbo.abgemeldetAm),
        thema ? sql`${thema} = any(${schema.newsletterAbo.themen})` : undefined,
      ),
    );
  return z.n;
}
