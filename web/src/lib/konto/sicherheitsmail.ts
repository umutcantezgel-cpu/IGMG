import 'server-only';
import { eq } from 'drizzle-orm';
import { pfadFuer } from '@/i18n/navigation';
import { db, schema } from '@/lib/db';
import { datumLang, uhrzeit } from '@/lib/i18n/format';
import { verschluessele } from '@/lib/krypto';
import { istUnzustellbar } from '@/lib/mail/adresse';
import { planeKontoMail } from '@/lib/mail/ausgang';
import { SICHERHEITS_VORLAGEN, type MailSprache, type SicherheitsArt } from '@/lib/mail/konto-vorlagen';
import { basisUrl } from '@/lib/seo/metadaten';

/**
 * Sicherheitshinweis per Mail an die Kontoadresse, wenn ein neuer Passkey hinterlegt oder die Zwei-Faktor-Anmeldung
 * neu eingerichtet wurde (AUFTRAG 3.11, Paket O-K05 Punkt 4): nur Art und Zeitpunkt, nie Geheimnisse (kein TOTP-
 * Schlüssel, keine Ersatzcodes, keine Passkey-Kennung), mit dem Hinweis „Waren Sie das nicht? …“. Konten mit
 * Verwaltungsrolle bekommen die deutsche Verwaltungsmail, Gemeinde-Konten die Mail in ihrer Sprache. Nie an
 * `.invalid`-Adressen (Kinder- und Beispielkonten). Geplant im Mail-Ausgang; den Versand stößt der Aufrufer an.
 * Rückgabe: true, wenn eine Mail geplant wurde.
 */
export async function meldeSicherheitsaenderung(benutzerId: string, art: SicherheitsArt, jetzt = new Date()): Promise<boolean> {
  const [konto] = await db
    .select({ email: schema.user.email, sprache: schema.kontoProfil.sprache })
    .from(schema.user)
    .leftJoin(schema.kontoProfil, eq(schema.kontoProfil.benutzerId, schema.user.id))
    .where(eq(schema.user.id, benutzerId))
    .limit(1);
  if (!konto || istUnzustellbar(konto.email)) return false;
  const [verwaltung] = await db
    .select({ id: schema.rolleZuweisung.id })
    .from(schema.rolleZuweisung)
    .where(eq(schema.rolleZuweisung.benutzerId, benutzerId))
    .limit(1);
  if (verwaltung || !konto.sprache) {
    const paket = verschluessele({
      an: konto.email,
      daten: { zeitpunkt: `${datumLang(jetzt, 'de')}, ${uhrzeit(jetzt, 'de')}`, link: `${basisUrl()}/verwaltung/konto` },
    });
    await db
      .insert(schema.mailAusgang)
      .values({ vorlage: SICHERHEITS_VORLAGEN[art], sprache: 'de', datenVerschluesselt: paket.daten, schluesselId: paket.schluesselId });
    return true;
  }
  const sprache: MailSprache = konto.sprache === 'tr' || konto.sprache === 'en' ? konto.sprache : 'de';
  return planeKontoMail({
    an: konto.email,
    vorlage: art === 'passkey' ? 'konto-passkey' : 'konto-zwei-faktor',
    sprache,
    daten: {
      zeitpunkt: `${datumLang(jetzt, sprache)}, ${uhrzeit(jetzt, sprache)}`,
      link: `${basisUrl()}${pfadFuer('/mein-bereich/konto', sprache)}`,
    },
  });
}
