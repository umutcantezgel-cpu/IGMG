import 'server-only';
import { and, desc, eq, inArray, isNull, or } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { entschluessele } from '@/lib/krypto';
import { geraetAus, type Geraet } from '@/lib/konto/geraet';
import { istKinderAdresse } from '@/lib/konto/regeln';
import { lernappFuerExport } from '@/lib/lernapp/export';
import { abgabenFuerExport } from '@/lib/lernapp/schreiben/dienst';

/**
 * Daten für „Mein Bereich“ (ADR 0026). Ohne Cache (Seiten sind dynamisch, `no-store`). Aufrufer prüfen vorher das
 * Konto (`verlangeMeinBereich`/`verlangeKontoSeite`) und übergeben nur die eigene Konto-ID.
 */
export type SitzungEintrag = { id: string; seit: string; zuletzt: string; geraet: Geraet; aktuell: boolean };
export type PasskeyEintrag = { id: string; name: string | null; erstellt: string | null; geraetTyp: string; gesichert: boolean };

export type KontoDetails = {
  name: string;
  email: string | null;
  benutzername: string | null;
  zweiFaktor: boolean;
  angelegt: string;
  anzeigename: string;
  sprache: string;
  istKind: boolean;
  loeschenAb: string | null;
  sitzungen: SitzungEintrag[];
  passkeys: PasskeyEintrag[];
};

export async function ladeKontoDetails(benutzerId: string, aktuelleSitzung: string | null): Promise<KontoDetails | null> {
  const [u] = await db
    .select({
      name: schema.user.name,
      email: schema.user.email,
      username: schema.user.username,
      zweiFaktor: schema.user.twoFactorEnabled,
      angelegt: schema.user.createdAt,
    })
    .from(schema.user)
    .where(eq(schema.user.id, benutzerId))
    .limit(1);
  if (!u) return null;
  const [[profil], sitzungen, passkeys] = await Promise.all([
    db.select().from(schema.kontoProfil).where(eq(schema.kontoProfil.benutzerId, benutzerId)).limit(1),
    db
      .select({ id: schema.session.id, seit: schema.session.createdAt, zuletzt: schema.session.updatedAt, ua: schema.session.userAgent })
      .from(schema.session)
      .where(eq(schema.session.userId, benutzerId))
      .orderBy(desc(schema.session.updatedAt)),
    db
      .select({
        id: schema.passkey.id,
        name: schema.passkey.name,
        erstellt: schema.passkey.createdAt,
        geraetTyp: schema.passkey.deviceType,
        gesichert: schema.passkey.backedUp,
      })
      .from(schema.passkey)
      .where(eq(schema.passkey.userId, benutzerId)),
  ]);
  return {
    name: u.name,
    email: istKinderAdresse(u.email) ? null : u.email,
    benutzername: u.username,
    zweiFaktor: Boolean(u.zweiFaktor),
    angelegt: u.angelegt.toISOString(),
    anzeigename: profil?.anzeigename ?? u.name,
    sprache: profil?.sprache ?? 'de',
    istKind: profil?.istKind ?? false,
    loeschenAb: profil?.loeschenAb?.toISOString() ?? null,
    sitzungen: sitzungen.map((s) => ({
      id: s.id,
      seit: s.seit.toISOString(),
      zuletzt: s.zuletzt.toISOString(),
      geraet: geraetAus(s.ua),
      aktuell: s.id === aktuelleSitzung,
    })),
    passkeys: passkeys.map((p) => ({
      id: p.id,
      name: p.name,
      erstellt: p.erstellt?.toISOString() ?? null,
      geraetTyp: p.geraetTyp,
      gesichert: p.gesichert,
    })),
  };
}

/** Versuch, verschlüsselte Personendaten zu lesen (Schlüssel rotiert oder fehlt → Hinweis statt Abbruch). */
function lesbar(daten: Buffer, schluesselId: number): unknown {
  try {
    return entschluessele(daten, schluesselId);
  } catch {
    return '[nicht entschlüsselbar – bitte an die Gemeinde wenden]';
  }
}

/**
 * Datenexport (Art. 15 und 20 DSGVO): alle Daten, die zum Konto gespeichert sind, maschinenlesbar. Ohne
 * Passwort-Hash, ohne TOTP-Geheimnis, ohne Sitzungs-Token und ohne öffentliche Passkey-Schlüssel (Sicherheitsdaten,
 * die der Person nichts sagen und bei Verlust der Datei schaden würden). Weitere Bereiche (Lernplattform, Chat)
 * ergänzen ihre Daten hier, sobald sie gebaut sind. Lern-App (L5-03): eigene Schreibabgaben mit Text, Selbsteinschätzung
 * und Rückmeldung der Lehrkraft (entschlüsselt; ohne Kennung der korrigierenden Lehrkraft); dazu (S-L3 N-2) Lernprofil,
 * Ereignisse, Kartenstand, Lerntage, Zustimmung zur Bestenliste und Familien-Bestenliste (`lernapp/export.ts`).
 */
export async function exportiereKontodaten(benutzerId: string): Promise<Record<string, unknown>> {
  const [u] = await db
    .select({
      id: schema.user.id,
      name: schema.user.name,
      email: schema.user.email,
      emailVerified: schema.user.emailVerified,
      username: schema.user.username,
      zweiFaktor: schema.user.twoFactorEnabled,
      angelegt: schema.user.createdAt,
      geaendert: schema.user.updatedAt,
    })
    .from(schema.user)
    .where(eq(schema.user.id, benutzerId))
    .limit(1);
  if (!u) return {};
  const [
    profil,
    gemeinde,
    verwaltung,
    einwilligungen,
    sitzungen,
    passkeys,
    eigeneLernende,
    kinder,
    protokoll,
    antraege,
    zusammenfassung,
    schreibabgaben,
    lernapp,
  ] = await Promise.all([
    db.select().from(schema.kontoProfil).where(eq(schema.kontoProfil.benutzerId, benutzerId)),
    db
      .select({ rolle: schema.gemeindeRolle.rolle, seit: schema.gemeindeRolle.erstelltAm })
      .from(schema.gemeindeRolle)
      .where(eq(schema.gemeindeRolle.benutzerId, benutzerId)),
    db
      .select({
        rolle: schema.rolleZuweisung.rolle,
        organisation: schema.rolleZuweisung.organisation,
        seit: schema.rolleZuweisung.erstelltAm,
      })
      .from(schema.rolleZuweisung)
      .where(eq(schema.rolleZuweisung.benutzerId, benutzerId)),
    db
      .select({
        art: schema.kontoEinwilligung.art,
        textVersion: schema.kontoEinwilligung.textVersion,
        sprache: schema.kontoEinwilligung.sprache,
        erteiltAm: schema.kontoEinwilligung.erteiltAm,
        widerrufenAm: schema.kontoEinwilligung.widerrufenAm,
        fuerLernende: schema.kontoEinwilligung.lernendeId,
      })
      .from(schema.kontoEinwilligung)
      .where(or(eq(schema.kontoEinwilligung.benutzerId, benutzerId), eq(schema.kontoEinwilligung.erteiltVon, benutzerId))),
    db
      .select({
        seit: schema.session.createdAt,
        zuletzt: schema.session.updatedAt,
        ablauf: schema.session.expiresAt,
        ua: schema.session.userAgent,
      })
      .from(schema.session)
      .where(eq(schema.session.userId, benutzerId)),
    db
      .select({ name: schema.passkey.name, erstellt: schema.passkey.createdAt, geraetTyp: schema.passkey.deviceType })
      .from(schema.passkey)
      .where(eq(schema.passkey.userId, benutzerId)),
    db.select().from(schema.lernende).where(eq(schema.lernende.benutzerId, benutzerId)),
    db
      .select({
        lernende: schema.lernende,
        sorgeberechtigt: schema.elternKind.sorgeberechtigt,
        bestaetigtAm: schema.elternKind.bestaetigtAm,
      })
      .from(schema.elternKind)
      .innerJoin(schema.lernende, eq(schema.lernende.id, schema.elternKind.lernendeId))
      .where(eq(schema.elternKind.elternId, benutzerId)),
    db
      .select({ zeitpunkt: schema.auditEintrag.zeitpunkt, aktion: schema.auditEintrag.aktion })
      .from(schema.auditEintrag)
      .where(eq(schema.auditEintrag.benutzerId, benutzerId))
      .orderBy(desc(schema.auditEintrag.zeitpunkt))
      .limit(1000),
    db
      .select({
        nummer: schema.ticket.nummer,
        titel: schema.ticket.titel,
        status: schema.ticket.status,
        erstellt: schema.ticket.erstelltAm,
      })
      .from(schema.ticket)
      .where(and(eq(schema.ticket.erstelltVon, benutzerId), inArray(schema.ticket.kategorie, ['loeschantrag']))),
    // Mail-Zusammenfassung (F-38): gewählte Themen, Zählbeginn, letzter Versand
    db
      .select({
        themen: schema.mailZusammenfassung.themen,
        seit: schema.mailZusammenfassung.seit,
        letzterVersand: schema.mailZusammenfassung.letzterVersand,
        bestelltAm: schema.mailZusammenfassung.erstelltAm,
      })
      .from(schema.mailZusammenfassung)
      .where(eq(schema.mailZusammenfassung.benutzerId, benutzerId)),
    abgabenFuerExport(benutzerId),
    lernappFuerExport(benutzerId),
  ]);
  const lernendeExport = (l: typeof schema.lernende.$inferSelect) => ({
    anzeigename: l.anzeigename,
    status: l.status,
    aufgenommenAm: l.aufgenommenAm,
    sechzehnAm: l.sechzehnAm,
    angaben: lesbar(l.datenVerschluesselt, l.schluesselId),
  });
  return {
    erstellt: new Date().toISOString(),
    hinweis: 'Datenexport nach Art. 15 und 20 DSGVO – IGMG Wetzlar',
    konto: {
      id: u.id,
      name: u.name,
      email: istKinderAdresse(u.email) ? null : u.email,
      emailBestaetigt: u.emailVerified,
      benutzername: u.username,
      zweiFaktorAktiv: Boolean(u.zweiFaktor),
      angelegt: u.angelegt,
      geaendert: u.geaendert,
    },
    profil: profil[0]
      ? { anzeigename: profil[0].anzeigename, sprache: profil[0].sprache, istKind: profil[0].istKind, loeschenAb: profil[0].loeschenAb }
      : null,
    kontoarten: gemeinde,
    verwaltungsrollen: verwaltung,
    einwilligungen,
    sitzungen: sitzungen.map((s) => ({ seit: s.seit, zuletzt: s.zuletzt, ablauf: s.ablauf, geraet: geraetAus(s.ua) })),
    passkeys,
    lernende: eigeneLernende.map(lernendeExport),
    kinder: kinder.map((k) => ({ ...lernendeExport(k.lernende), sorgeberechtigt: k.sorgeberechtigt, bestaetigtAm: k.bestaetigtAm })),
    protokoll,
    antraege,
    zusammenfassungPerMail: zusammenfassung[0] ?? null,
    lernapp: { ...lernapp, schreibabgaben },
  };
}

/** Offener Löschantrag? (Profil-Frist gesetzt.) */
export async function ladeLoeschantrag(benutzerId: string): Promise<{ seit: string | null; loeschenAb: string } | null> {
  const [p] = await db
    .select({ loeschenAb: schema.kontoProfil.loeschenAb })
    .from(schema.kontoProfil)
    .where(and(eq(schema.kontoProfil.benutzerId, benutzerId)))
    .limit(1);
  if (!p?.loeschenAb) return null;
  const [t] = await db
    .select({ erstellt: schema.ticket.erstelltAm })
    .from(schema.ticket)
    .where(and(eq(schema.ticket.erstelltVon, benutzerId), eq(schema.ticket.kategorie, 'loeschantrag'), isNull(schema.ticket.geschlossenAm)))
    .orderBy(desc(schema.ticket.erstelltAm))
    .limit(1);
  return { seit: t?.erstellt.toISOString() ?? null, loeschenAb: p.loeschenAb.toISOString() };
}
