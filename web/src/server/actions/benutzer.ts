'use server';

import { and, eq, inArray, like } from 'drizzle-orm';
import { refresh } from 'next/cache';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { after } from 'next/server';
import { z } from 'zod';
import { protokolliere } from '@/lib/audit';
import { auth } from '@/lib/auth/server';
import { db, schema } from '@/lib/db';
import { datumLang, uhrzeit } from '@/lib/i18n/format';
import { sha256, verschluessele, zufallsToken } from '@/lib/krypto';
import { versendeOffeneMails } from '@/lib/mail/ausgang';
import { mitAdministrationsSchutz } from '@/lib/rechte/administration';
import { KeinRecht, verlangeRecht, type Angemeldet } from '@/lib/rechte/pruefe';
import { hatGruppenzugang } from '@/lib/konto/einladung';
import { religioesePruefendeGeaendert } from '@/lib/lernapp/veroeffentlichen';
import { entscheideBezugEnde, entscheideEinladung } from '@/lib/konto/eltern-freigabe';
import {
  ENTZUG_GESCHUETZT,
  entscheideAntrag,
  entziehVerwaltungsrollen,
  istEntzugGeschuetzt,
  istSchutzrolle,
  meldeSperreSchutzrolle,
  schutzrollenGestartet,
  schutzrollenRegel,
  SCHUTZROLLEN,
  vergibVerwaltungsrollen,
  type EntzugErgebnis,
} from '@/lib/rechte/schutzrollen';
import { basisUrl } from '@/lib/seo/metadaten';
import { clientAdresse } from '@/lib/sicherheit/ip';
import { alsZuweisungen, einladungSchema, passwortSchema, rollenSchema } from '@/lib/validierung/benutzer';
import { pruefeRate } from '@/lib/validierung/ratenbegrenzung';
import { emailBelegt, ladeBenutzer, zaehleAdministration } from '@/server/queries/verwaltung/benutzer';

/**
 * Verwaltung „Benutzer und Rollen“ und „Mein Konto“ (C12, K-06, G-07). Reihenfolge je Action: Recht mit 2FA →
 * Eingabe prüfen → Schutzregeln (nie das eigene Konto aussperren, nie die letzte Administration entfernen – vorab für
 * die Rückmeldung, verbindlich in der Transaktion über `mitAdministrationsSchutz`) → Speichern mit Audit (ohne
 * Personendaten in den Details). Konten entstehen nur per Einladung.
 */
export type BenutzerZustand = {
  fehler?: string;
  feldFehler?: Record<string, string>;
  werte?: Record<string, string | string[]>;
  /** Einladungslink – nur in dieser Antwort, gespeichert wird nur der Hash */
  link?: string;
  ersatzcodes?: string[];
  ok?: boolean;
  /** Schutzrollen, die erst nach Bestätigung durch eine zweite Person wirksam werden (S2/S3) */
  beantragt?: string[];
  /** Geschützte Rollen, deren Entzug erst nach Bestätigung durch eine zweite Person wirkt (N4) – bis dahin wirksam */
  entzugBeantragt?: string[];
};

function feldFehler(fehler: z.ZodError): Record<string, string> {
  const f: Record<string, string> = {};
  for (const i of fehler.issues) {
    const feld = String(i.path[0] ?? 'formular');
    f[feld] ??= i.message;
  }
  return f;
}

const listeAus = (fd: FormData, name: string) => fd.getAll(name).map(String);

/** Person einladen: Einladung mit gehashtem Token, Mail über den Mail-Ausgang, Link einmalig für die einladende Person. */
export async function einladen(_vorher: BenutzerZustand, fd: FormData): Promise<BenutzerZustand> {
  const a = await verlangeRecht('benutzer.einladen');
  const roh = {
    email: String(fd.get('email') ?? ''),
    name: String(fd.get('name') ?? ''),
    gueltigTage: fd.get('gueltigTage') ?? undefined,
    rollen: listeAus(fd, 'rollen'),
    organisationen: listeAus(fd, 'organisationen'),
  };
  const werte = {
    email: roh.email,
    name: roh.name,
    gueltigTage: String(roh.gueltigTage ?? ''),
    rollen: roh.rollen,
    organisationen: roh.organisationen,
  };
  const p = einladungSchema.safeParse(roh);
  if (!p.success) return { fehler: 'pruefen', feldFehler: feldFehler(p.error), werte };
  // Schutzrollen (leitung, kinderschutz, religioese_pruefung): nie mit Administration; wirksam erst nach Bestätigung (bei
  // der Annahme beantragt)
  const schutz = schutzrollenRegel([], alsZuweisungen(p.data), false);
  if (schutz) return { fehler: schutz, werte };
  const belegt = await emailBelegt(p.data.email);
  if (belegt) return { fehler: 'pruefen', feldFehler: { email: belegt === 'konto' ? 'emailKonto' : 'emailEingeladen' }, werte };
  const token = zufallsToken();
  const laeuftAb = new Date(Date.now() + p.data.gueltigTage * 24 * 3_600_000);
  const link = `${basisUrl()}/verwaltung/einladung/${token}`;
  const mail = verschluessele({
    an: p.data.email,
    daten: { name: p.data.name, link, gueltigBis: `${datumLang(laeuftAb, 'de')}, ${uhrzeit(laeuftAb, 'de')}` },
  });
  await db.transaction(async (tx) => {
    const [e] = await tx
      .insert(schema.einladung)
      .values({
        email: p.data.email,
        name: p.data.name,
        rollen: alsZuweisungen(p.data).map((z) => (z.organisation ? { rolle: z.rolle, organisation: z.organisation } : { rolle: z.rolle })),
        tokenHash: sha256(token),
        laeuftAb,
        erstelltVon: a.benutzerId,
      })
      .returning({ id: schema.einladung.id });
    await tx
      .insert(schema.mailAusgang)
      .values({ vorlage: 'einladung', sprache: 'de', datenVerschluesselt: mail.daten, schluesselId: mail.schluesselId });
    await protokolliere(
      {
        benutzerId: a.benutzerId,
        aktion: 'einladung.erstellt',
        zielTyp: 'einladung',
        zielId: e.id,
        details: { rollen: alsZuweisungen(p.data).length },
      },
      tx,
    );
  });
  after(() => versendeOffeneMails());
  refresh();
  return { ok: true, link };
}

export async function einladungWiderrufen(fd: FormData): Promise<void> {
  const a = await verlangeRecht('benutzer.einladen');
  const id = z.uuid().safeParse(fd.get('id'));
  if (!id.success) throw new KeinRecht();
  const [e] = await db
    .update(schema.einladung)
    .set({ widerrufenAm: new Date() })
    .where(eq(schema.einladung.id, id.data))
    .returning({ id: schema.einladung.id });
  if (e) await protokolliere({ benutzerId: a.benutzerId, aktion: 'einladung.widerrufen', zielTyp: 'einladung', zielId: e.id });
  redirect('/verwaltung/benutzer?meldung=widerrufen');
}

/** Ziel-Konto laden und Schutzregeln prüfen (Fehler als Schlüssel, nie das eigene Konto). */
async function zielKonto(fd: FormData, a: Angemeldet) {
  const id = String(fd.get('id') ?? '');
  const konto = await ladeBenutzer(id);
  if (!konto) throw new KeinRecht();
  return { konto, selbst: konto.id === a.benutzerId };
}
const istAdministration = (rollen: { rolle: string }[]) => rollen.some((r) => r.rolle === 'administration');
const hat = (rollen: { rolle: string }[], rolle: string) => rollen.some((r) => r.rolle === rolle);

/**
 * Rollen speichern. Schutzrollen `leitung`, `kinderschutz` und `religioese_pruefung` (S-11, ADR 0026; M-2 der
 * Sicherheitsprüfung S1, S2/S3; Stufe C N2): nie zusammen mit `administration`, nie an sich selbst, und neu vergeben erst
 * wirksam, wenn eine zweite Person mit Leitung oder Kinderschutz bestätigt (`src/lib/rechte/schutzrollen.ts`) – sonst gäbe
 * sich die Administration über „leitung“ den Weg zu Chat-Inhalten selbst frei bzw. erzeugte über zwei eigene Konten mit
 * „religioese_pruefung“ beide religiösen Freigaben allein. Ebenso der Entzug von Leitung, Kinderschutz und religiöser Prüfung bei
 * anderen Konten (N4): beantragt, bis zur Bestätigung weiter wirksam, Mail an die betroffene Person. Jede Vergabe und
 * jeder Entzug steht im Audit und geht als Hinweis an Leitung und Kinderschutz. Administration nie an ein Konto mit
 * Kontoart mit Gruppenzugang oder Gruppenleitung (S-L2 N-1, Gegenrichtung zu `gemeinde-konten.ts` und `gruppen.ts`).
 */
export async function rollenSpeichern(_vorher: BenutzerZustand, fd: FormData): Promise<BenutzerZustand> {
  const a = await verlangeRecht('benutzer.bearbeiten');
  const { konto, selbst } = await zielKonto(fd, a);
  const roh = { rollen: listeAus(fd, 'rollen'), organisationen: listeAus(fd, 'organisationen') };
  const p = rollenSchema.safeParse(roh);
  if (!p.success) return { fehler: 'pruefen', feldFehler: feldFehler(p.error), werte: roh };
  const neu = alsZuweisungen(p.data);
  const schutz = schutzrollenRegel(konto.rollen, neu, selbst);
  if (schutz) return { fehler: schutz, werte: roh };
  // NIE_PER_ADMINISTRATION in beiden Richtungen (S2/S3, S-L2 N-1): Wer Lehrkraft, Elternteil oder Schüler*in ist oder eine
  // Gruppe leitet, bekommt keine Administration – sonst läse das Konto Schreibabgaben, Gruppen- und Elternkanal
  if (istAdministration(neu) && !istAdministration(konto.rollen) && (await hatGruppenzugang(konto.id)))
    return { fehler: 'administrationGruppenzugang', werte: roh };
  if (istAdministration(konto.rollen) && !istAdministration(neu)) {
    if (selbst) return { fehler: 'eigeneAdministration', werte: roh };
    if ((await zaehleAdministration(konto.id)) === 0) return { fehler: 'letzteAdministration', werte: roh };
  }
  // N4: Geschützte Rollen, die wegfallen sollen. Bei anderen Konten bleibt die Schutzrolle bis zur Bestätigung des Entzugs
  // wirksam – dann darf das Konto nicht zugleich Administration bekommen (S-11)
  const entzug = ENTZUG_GESCHUETZT.filter((r) => hat(konto.rollen, r) && !hat(neu, r));
  if (
    !selbst &&
    istAdministration(neu) &&
    !istAdministration(konto.rollen) &&
    entzug.some((r) => istSchutzrolle(r)) &&
    (await schutzrollenGestartet())
  )
    return { fehler: 'entzugVorAdministration', werte: roh };
  let beantragt: string[] = [];
  let entzogen: EntzugErgebnis = { beantragt: [], entzogen: [] };
  const gespeichert = await mitAdministrationsSchutz(async (tx) => {
    entzogen = await entziehVerwaltungsrollen(tx, konto.id, entzug, a.benutzerId);
    // Bisher wirksame Rollen bleiben ohne neuen Antrag wirksam; neue Schutzrollen werden beantragt; Rollen mit offenem
    // Entzug bleiben bis zur Bestätigung wirksam
    const bleibt = [
      ...neu.filter((z) => !istSchutzrolle(z.rolle) || hat(konto.rollen, z.rolle)),
      ...entzogen.beantragt.map((rolle) => ({ rolle, organisation: null })),
    ];
    const neueSchutzrollen = neu.filter((z) => istSchutzrolle(z.rolle) && !hat(konto.rollen, z.rolle));
    await tx.delete(schema.rolleZuweisung).where(eq(schema.rolleZuweisung.benutzerId, konto.id));
    if (bleibt.length)
      await tx
        .insert(schema.rolleZuweisung)
        .values(
          bleibt.map((z) => ({ benutzerId: konto.id, rolle: z.rolle, organisation: z.organisation ?? null, erstelltVon: a.benutzerId })),
        );
    // Nicht mehr gewählte Schutzrollen: offene Vergabe-Anträge verfallen; wieder gewählte Rollen: offener Entzug verfällt
    const weg = SCHUTZROLLEN.filter((r) => !hat(neu, r));
    if (weg.length)
      await tx
        .delete(schema.rollenAntrag)
        .where(
          and(
            eq(schema.rollenAntrag.benutzerId, konto.id),
            eq(schema.rollenAntrag.art, 'vergabe'),
            inArray(schema.rollenAntrag.rolle, weg),
          ),
        );
    const wieder = ENTZUG_GESCHUETZT.filter((r) => hat(neu, r));
    if (wieder.length)
      await tx
        .delete(schema.rollenAntrag)
        .where(
          and(
            eq(schema.rollenAntrag.benutzerId, konto.id),
            eq(schema.rollenAntrag.art, 'entzug'),
            inArray(schema.rollenAntrag.rolle, wieder),
          ),
        );
    beantragt = await vergibVerwaltungsrollen(tx, konto.id, neueSchutzrollen, a.benutzerId);
    await protokolliere(
      {
        benutzerId: a.benutzerId,
        aktion: 'benutzer.rollen_geaendert',
        zielTyp: 'benutzer',
        zielId: konto.id,
        details: {
          vorher: konto.rollen.map((r) => (r.organisation ? `${r.rolle}:${r.organisation}` : r.rolle)).join(','),
          // Wirksame Rollen; beantragte Schutzrollen und beantragte Entzüge stehen getrennt (eigene Audit-Einträge)
          nachher: [
            ...neu.filter((r) => !beantragt.includes(r.rolle)),
            ...entzogen.beantragt.map((rolle) => ({ rolle, organisation: null })),
          ]
            .map((r) => (r.organisation ? `${r.rolle}:${r.organisation}` : r.rolle))
            .join(','),
          ...(beantragt.length ? { beantragt: beantragt.join(',') } : {}),
          ...(entzogen.beantragt.length ? { entzugBeantragt: entzogen.beantragt.join(',') } : {}),
        },
      },
      tx,
    );
  });
  if (!gespeichert) return { fehler: 'letzteAdministration', werte: roh };
  // Religiöse Prüfung neu wirksam oder sofort entzogen: religiös geprüfte Lern-App-Inhalte neu bauen (ein beantragter Entzug
  // wirkt erst mit der Bestätigung, `rollenAntragEntscheiden`)
  if ((!hat(konto.rollen, 'religioese_pruefung') && hat(neu, 'religioese_pruefung')) || entzogen.entzogen.includes('religioese_pruefung'))
    await religioesePruefendeGeaendert();
  after(() => versendeOffeneMails().catch(() => undefined));
  refresh();
  return {
    ok: true,
    ...(beantragt.length ? { beantragt } : {}),
    ...(entzogen.beantragt.length ? { entzugBeantragt: [...entzogen.beantragt] } : {}),
  };
}

/**
 * Vier-Augen-Antrag bestätigen oder ablehnen – nur eine zweite Person mit wirksamer Rolle Leitung oder Kinderschutz,
 * ohne Administration, weder die beantragende noch die betroffene Person (S2/S3, N4). Arten: `rolle` (Vergabe oder
 * Entzug einer Schutzrolle), `einladung` (Eltern-Einladung an eine Adresse außerhalb der Voranmeldung), `bezug`
 * (Eltern-Kind-Bezug beenden; `id` = Lernende, `konto` = Elternkonto). Formular in „Gemeinde im Blick“ und „Kinderschutz“.
 */
export async function rollenAntragEntscheiden(fd: FormData): Promise<void> {
  const a = await verlangeRecht('verwaltung.betreten');
  const p = z
    .object({
      art: z.enum(['rolle', 'einladung', 'bezug']).catch('rolle'),
      id: z.uuid(),
      konto: z.string().min(1).max(100).optional(),
      entscheidung: z.enum(['bestaetigen', 'ablehnen']),
      zurueck: z.enum(['/verwaltung/gemeinde-im-blick', '/verwaltung/kinderschutz']).catch('/verwaltung/gemeinde-im-blick'),
    })
    .safeParse({
      art: fd.get('art') ?? undefined,
      id: fd.get('id'),
      konto: fd.get('konto') ?? undefined,
      entscheidung: fd.get('entscheidung'),
      zurueck: fd.get('zurueck') ?? undefined,
    });
  if (!p.success) throw new KeinRecht();
  const bestaetigen = p.data.entscheidung === 'bestaetigen';
  let fehler: Awaited<ReturnType<typeof entscheideAntrag>>;
  let erfolg: string;
  if (p.data.art === 'einladung') {
    fehler = await entscheideEinladung(a, p.data.id, bestaetigen);
    erfolg = bestaetigen ? 'einladungBestaetigt' : 'einladungAbgelehnt';
  } else if (p.data.art === 'bezug') {
    if (!p.data.konto) throw new KeinRecht();
    fehler = await entscheideBezugEnde(a, p.data.id, p.data.konto, bestaetigen);
    erfolg = bestaetigen ? 'bezugBeendet' : 'bezugAbgelehnt';
  } else {
    const [antrag] = await db
      .select({ rolle: schema.rollenAntrag.rolle })
      .from(schema.rollenAntrag)
      .where(eq(schema.rollenAntrag.id, p.data.id));
    fehler = await entscheideAntrag(a, p.data.id, bestaetigen);
    erfolg = bestaetigen ? 'bestaetigt' : 'abgelehnt';
    // bestätigter Entzug der religiösen Prüfung: religiös geprüfte Lern-App-Inhalte neu bauen
    if (!fehler && bestaetigen && antrag?.rolle === 'religioese_pruefung') await religioesePruefendeGeaendert();
  }
  if (fehler === 'keinRecht') throw new KeinRecht();
  after(() => versendeOffeneMails().catch(() => undefined));
  redirect(`${p.data.zurueck}?rollenantrag=${fehler ?? erfolg}#rollenantraege`);
}

/** Konto sperren (C12): Sitzungen enden sofort, Anmeldung wird verweigert; nicht das eigene, nicht die letzte Administration. */
export async function kontoSperren(fd: FormData): Promise<void> {
  const a = await verlangeRecht('benutzer.bearbeiten');
  const { konto, selbst } = await zielKonto(fd, a);
  if (selbst) redirect(`/verwaltung/benutzer/${konto.id}?fehler=selbst`);
  if (istAdministration(konto.rollen) && (await zaehleAdministration(konto.id)) === 0)
    redirect(`/verwaltung/benutzer/${konto.id}?fehler=letzteAdministration`);
  const gesperrt = await mitAdministrationsSchutz(async (tx) => {
    await tx.update(schema.user).set({ gesperrtAm: new Date() }).where(eq(schema.user.id, konto.id));
    await tx.delete(schema.session).where(eq(schema.session.userId, konto.id));
    // Offene Passwort-Links verfallen mit der Sperre (Tor B/C N6) – sonst gälten sie nach dem Entsperren weiter
    await tx
      .delete(schema.verification)
      .where(and(like(schema.verification.identifier, 'reset-password:%'), eq(schema.verification.value, konto.id)));
    await protokolliere({ benutzerId: a.benutzerId, aktion: 'benutzer.gesperrt', zielTyp: 'benutzer', zielId: konto.id }, tx);
    // N4: Sperre eines Kontos mit Schutzrolle (Notweg) – die Person sowie Leitung und Kinderschutz erfahren davon
    await meldeSperreSchutzrolle(tx, konto.id, konto.rollen);
  });
  after(() => versendeOffeneMails().catch(() => undefined));
  if (!gesperrt) redirect(`/verwaltung/benutzer/${konto.id}?fehler=letzteAdministration`);
  redirect(`/verwaltung/benutzer/${konto.id}?meldung=gesperrt`);
}

export async function kontoEntsperren(fd: FormData): Promise<void> {
  const a = await verlangeRecht('benutzer.bearbeiten');
  const { konto } = await zielKonto(fd, a);
  await db.transaction(async (tx) => {
    await tx.update(schema.user).set({ gesperrtAm: null }).where(eq(schema.user.id, konto.id));
    await protokolliere({ benutzerId: a.benutzerId, aktion: 'benutzer.entsperrt', zielTyp: 'benutzer', zielId: konto.id }, tx);
  });
  redirect(`/verwaltung/benutzer/${konto.id}?meldung=entsperrt`);
}

/** Zwei-Faktor zurücksetzen (z. B. Gerät verloren): TOTP und Ersatzcodes weg, alle Sitzungen beendet → Neueinrichtung beim nächsten Anmelden. */
export async function zweiFaktorZuruecksetzen(fd: FormData): Promise<void> {
  const a = await verlangeRecht('benutzer.bearbeiten');
  const { konto, selbst } = await zielKonto(fd, a);
  if (selbst) redirect(`/verwaltung/benutzer/${konto.id}?fehler=selbst`);
  await db.transaction(async (tx) => {
    await tx.delete(schema.twoFactor).where(eq(schema.twoFactor.userId, konto.id));
    await tx.delete(schema.passkey).where(eq(schema.passkey.userId, konto.id));
    await tx.update(schema.user).set({ twoFactorEnabled: false }).where(eq(schema.user.id, konto.id));
    await tx.delete(schema.session).where(eq(schema.session.userId, konto.id));
    await protokolliere(
      { benutzerId: a.benutzerId, aktion: 'benutzer.zwei_faktor_zurueckgesetzt', zielTyp: 'benutzer', zielId: konto.id },
      tx,
    );
  });
  redirect(`/verwaltung/benutzer/${konto.id}?meldung=zweiFaktor`);
}

class SchutzrolleVorhanden extends Error {}

/**
 * Konto endgültig löschen (K-05, G-07): Konto, Sitzungen, Anmeldedaten, Zwei-Faktor, Passkeys und Rollen (Kaskade).
 * N4: Ein Konto mit Leitung, Kinderschutz oder religiöser Prüfung erst nach dem bestätigten Entzug dieser Rollen (sonst
 * wäre Löschen der Weg am Vier-Augen-Prinzip vorbei) – geprüft in der Transaktion.
 */
export async function kontoLoeschen(fd: FormData): Promise<void> {
  const a = await verlangeRecht('benutzer.bearbeiten');
  const { konto, selbst } = await zielKonto(fd, a);
  if (selbst) redirect(`/verwaltung/benutzer/${konto.id}?fehler=selbst`);
  if (istAdministration(konto.rollen) && (await zaehleAdministration(konto.id)) === 0)
    redirect(`/verwaltung/benutzer/${konto.id}?fehler=letzteAdministration`);
  let geloescht = false;
  try {
    geloescht = await mitAdministrationsSchutz(async (tx) => {
      const rollen = await tx
        .select({ rolle: schema.rolleZuweisung.rolle })
        .from(schema.rolleZuweisung)
        .where(eq(schema.rolleZuweisung.benutzerId, konto.id));
      if (rollen.some((r) => istEntzugGeschuetzt(r.rolle)) && (await schutzrollenGestartet(tx))) throw new SchutzrolleVorhanden();
      await tx.delete(schema.user).where(eq(schema.user.id, konto.id));
      await protokolliere({ benutzerId: a.benutzerId, aktion: 'benutzer.geloescht', zielTyp: 'benutzer', zielId: konto.id }, tx);
    });
  } catch (e) {
    if (e instanceof SchutzrolleVorhanden) redirect(`/verwaltung/benutzer/${konto.id}?fehler=schutzrolle`);
    throw e;
  }
  if (!geloescht) redirect(`/verwaltung/benutzer/${konto.id}?fehler=letzteAdministration`);
  // Konto mit religiöser Prüfung gelöscht (vor dem Start der Schutzrollen möglich): seine Freigaben zählen nicht mehr
  if (hat(konto.rollen, 'religioese_pruefung')) await religioesePruefendeGeaendert();
  redirect('/verwaltung/benutzer?meldung=geloescht');
}

/** Mein Konto: Passwort ändern (aktuelles Passwort nötig, andere Sitzungen enden). */
export async function passwortAendern(_vorher: BenutzerZustand, fd: FormData): Promise<BenutzerZustand> {
  const a = await verlangeRecht('verwaltung.betreten');
  const p = passwortSchema.safeParse({
    aktuell: fd.get('aktuell') ?? '',
    neu: fd.get('neu') ?? '',
    wiederholung: fd.get('wiederholung') ?? '',
  });
  if (!p.success) return { fehler: 'pruefen', feldFehler: feldFehler(p.error) };
  const h = await headers();
  if (!(await pruefeRate('verwaltung-passwort', `${clientAdresse(h)}:${a.benutzerId}`, { max: 5, fensterSekunden: 600 })).erlaubt)
    return { fehler: 'zuViele' };
  try {
    await auth.api.changePassword({
      body: { currentPassword: p.data.aktuell, newPassword: p.data.neu, revokeOtherSessions: true },
      headers: h,
    });
  } catch {
    return { fehler: 'pruefen', feldFehler: { aktuell: 'passwortFalsch' } };
  }
  await protokolliere({ benutzerId: a.benutzerId, aktion: 'konto.passwort_geaendert' });
  // Better Auth ersetzt dabei die Sitzung (neues Cookie in dieser Antwort): Ein Neurendern mit dem alten Cookie würde zur
  // Anmeldung führen – daher ausdrücklich zur Kontoseite weiterleiten (Meldung über den Suchparameter)
  redirect('/verwaltung/konto?passwort=geaendert');
}

/** Mein Konto: neue Ersatzcodes (alte werden ungültig); nur einmal angezeigt. */
export async function ersatzcodesErzeugen(_vorher: BenutzerZustand, fd: FormData): Promise<BenutzerZustand> {
  const a = await verlangeRecht('verwaltung.betreten');
  const passwort = z.string().min(1).max(128).safeParse(fd.get('passwort'));
  if (!passwort.success) return { fehler: 'pruefen', feldFehler: { passwort: 'pflicht' } };
  const h = await headers();
  if (!(await pruefeRate('verwaltung-ersatzcodes', `${clientAdresse(h)}:${a.benutzerId}`, { max: 5, fensterSekunden: 600 })).erlaubt)
    return { fehler: 'zuViele' };
  try {
    const r = await auth.api.generateBackupCodes({ body: { password: passwort.data }, headers: h });
    await protokolliere({ benutzerId: a.benutzerId, aktion: 'konto.ersatzcodes_erzeugt' });
    return { ok: true, ersatzcodes: r.backupCodes };
  } catch {
    return { fehler: 'pruefen', feldFehler: { passwort: 'passwortFalsch' } };
  }
}
