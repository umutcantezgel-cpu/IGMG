// Beispielkonten für die Vorführung von „Mein Bereich“ (ADR 0026) – nur außerhalb der Produktion.
// Wird von scripts/bau-datenbank.mjs NICHT aufgerufen (Entscheidung des Orchestrators).
//
// Aufruf: pnpm exec tsx --conditions=react-server --env-file-if-exists=.env scripts/beispielkonten.ts [--praefix x] [--neu] [--json]
//   --praefix x  eigene Adressen/Benutzernamen (z. B. für E2E-Läufe): gemeinde.x@beispiel.invalid, kind.x
//   --neu        vorhandene Beispielkonten dieses Präfixes vorher löschen
//   --json       Zugangsdaten als JSON (für Tests), sonst als Tabelle
// Passwörter: BEISPIEL_PASSWORT aus der Umgebung (für alle gleich) oder je Konto zufällig – nur auf der Konsole,
// nie in Dateien. Adressen unter `.invalid` (RFC 2606): Der Mail-Ausgang weist sie ab, es geht keine Mail hinaus.
//
// Lernplattform (Paket O-L02-UI/H-L06/H-L07): eine Beispielgruppe mit zwei Erwachsenen in der Leitung (Lehrkraft und
// Aufsicht, S-02), drei Lernenden (Geschwister des Elternkontos mit Kinderzugang; Yunus ist seit zehn Tagen 16 und steht im
// Übergang nach DSFA D-11), Einwilligungen, Terminen
// (Serie am Wochenende plus ein Vorführtermin heute), Anwesenheiten, Fortschritt, einer Abmeldung für heute, Nachrichten im
// Gruppen- und Elternkanal und einer offenen Meldung. Nur Platzhalter- bzw. offensichtliche Beispielnamen.
import { randomBytes } from 'node:crypto';
import { parseArgs } from 'node:util';
import { and, eq, inArray, lt, or, sql } from 'drizzle-orm';
import kinderTexte from '../messages/bereiche/kinder.json';
import konto from '../messages/bereiche/konto.json';
import { auth } from '../src/lib/auth/server';
import { kanaeleDerGruppe, meldeNachricht } from '../src/lib/chat/dienst';
import { holeDb, schema } from '../src/lib/db';
import { berlinerDatum } from '../src/lib/gebetszeiten/naechstes';
import { KONTO_EINWILLIGUNG_VERSION, textVersion } from '../src/lib/konto/einwilligung';
import { legeKinderkontoAn } from '../src/lib/konto/kinderkonto';
import { anzeigenameAus } from '../src/lib/konto/regeln';
import { verschluessele } from '../src/lib/krypto';
import { erzeugeTermine } from '../src/lib/lernen/dienst';
import { tagPlus } from '../src/lib/lernen/termine';
import { betriebsart } from '../src/lib/umgebung';

type Rolle = (typeof schema.gemeindeRolleEnum.enumValues)[number];
type KindArt = 'lernplattform' | 'kinderkonto' | 'gruppenchat' | 'push_kind';

const { values } = parseArgs({
  options: {
    praefix: { type: 'string', default: '' },
    neu: { type: 'boolean', default: false },
    json: { type: 'boolean', default: false },
  },
});

function fehler(text: string): never {
  console.error(text);
  process.exit(1);
}

if (betriebsart(process.env) === 'produktion') fehler('Beispielkonten gibt es nur außerhalb der Produktion (SITE_MODE/NODE_ENV).');
const praefix = (values.praefix ?? '').toLowerCase();
if (praefix && !/^[a-z0-9]{1,12}$/.test(praefix)) fehler('--praefix: 1–12 Zeichen a–z, 0–9.');

const adresse = (art: string) => (praefix ? `${art}.${praefix}@beispiel.invalid` : `${art}@beispiel.invalid`);
const benutzername = praefix ? `kind.${praefix}` : 'kind.beispiel';
const benutzername2 = praefix ? `kind2.${praefix}` : 'kind2.beispiel';
const benutzername3 = praefix ? `kind3.${praefix}` : 'kind3.beispiel';
const kennung = praefix ? ` (${praefix})` : '';
const NAMEN = { emre: `Emre B.${kennung}`, zeynep: `Zeynep B.${kennung}`, yunus: `Yunus B.${kennung}` };
const GRUPPE = {
  de: `[Beispielgruppe] Elifbe am Wochenende${kennung}`,
  tr: `[Örnek grup] Hafta sonu Elifba${kennung}`,
  en: `[Sample group] Weekend Elifba${kennung}`,
};
const passwort = () => process.env.BEISPIEL_PASSWORT || randomBytes(18).toString('base64url');
const einwilligung = textVersion(KONTO_EINWILLIGUNG_VERSION, konto.de.konto.einwilligung.text);

const db = holeDb();
const heute = berlinerDatum(new Date());
const jahr = Number(heute.slice(0, 4));

async function loesche() {
  const alt = await db
    .select({ id: schema.user.id })
    .from(schema.user)
    .where(
      or(
        inArray(schema.user.email, [adresse('gemeinde'), adresse('eltern'), adresse('lehrkraft'), adresse('aufsicht')]),
        inArray(schema.user.username, [benutzername, benutzername2, benutzername3]),
      ),
    );
  if (alt.length)
    await db.delete(schema.user).where(
      inArray(
        schema.user.id,
        alt.map((u) => u.id),
      ),
    );
  // Lernende und Beispielgruppe dieses Präfixes (Termine, Kanäle, Nachrichten hängen per Kaskade daran)
  await db.delete(schema.lernende).where(inArray(schema.lernende.anzeigename, Object.values(NAMEN)));
  await db.delete(schema.gruppe).where(sql`${schema.gruppe.name}->>'de' = ${GRUPPE.de}`);
}

async function erwachsen(art: string, name: string, rollen: Rolle[]) {
  const email = adresse(art);
  const [vorhanden] = await db.select({ id: schema.user.id }).from(schema.user).where(eq(schema.user.email, email)).limit(1);
  if (vorhanden) return { email, id: vorhanden.id, passwort: null as string | null };
  const pw = passwort();
  const r = await auth.api.signUpEmail({ body: { email, password: pw, name } });
  const id = r.user.id;
  await db.update(schema.user).set({ emailVerified: true }).where(eq(schema.user.id, id));
  await db.insert(schema.kontoProfil).values({ benutzerId: id, anzeigename: anzeigenameAus(name), sprache: 'de' });
  await db.insert(schema.gemeindeRolle).values(rollen.map((rolle) => ({ benutzerId: id, rolle, erstelltVon: 'beispielkonten' })));
  await db.insert(schema.kontoEinwilligung).values({ benutzerId: id, art: 'konto', textVersion: einwilligung, erteiltVon: id });
  return { email, id, passwort: pw };
}

/**
 * Lerndatensatz (Personendaten verschlüsselt, fiktiv); vorhandene bleiben. Das fiktive Geburtsdatum ist ein gültiger
 * Kalendertag genau 16 Jahre vor `sechzehnAm` (wie `sechzehnAus` bei der Aufnahme) – ein Platzhaltertext ließ die
 * Detailansicht in der Verwaltung abstürzen (Stufe-C-Nachprüfung 2).
 */
async function lernende(anzeigename: string, vorname: string, sechzehnAm: string): Promise<{ id: string; neu: boolean }> {
  const [vorhanden] = await db.select({ id: schema.lernende.id }).from(schema.lernende).where(eq(schema.lernende.anzeigename, anzeigename));
  if (vorhanden) return { id: vorhanden.id, neu: false };
  const geburtsdatum = `${Number(sechzehnAm.slice(0, 4)) - 16}${sechzehnAm.slice(4)}`;
  const paket = verschluessele({ vorname, nachname: 'Beispiel', geburtsdatum });
  const [z] = await db
    .insert(schema.lernende)
    .values({
      datenVerschluesselt: paket.daten,
      schluesselId: paket.schluesselId,
      anzeigename,
      sechzehnAm,
      aufgenommenVon: 'beispielkonten',
    })
    .returning({ id: schema.lernende.id });
  return { id: z.id, neu: true };
}

/** Einwilligungen eines Elternteils für ein Kind mit dem Wortlaut der Elternseite (Textversion = SHA-256). */
async function einwilligen(lernendeId: string, elternId: string, arten: KindArt[]) {
  const d = kinderTexte.de.kinder.detail;
  await db.insert(schema.kontoEinwilligung).values(
    arten.map((art) => ({
      lernendeId,
      art,
      textVersion: textVersion(KONTO_EINWILLIGUNG_VERSION, `${d.einwilligung[art].text}\n${d.einvernehmen}`),
      einvernehmenBestaetigt: true,
      erteiltVon: elternId,
    })),
  );
}

async function kinderzugang(name: string, lernendeId: string, elternId: string) {
  const [vorhanden] = await db.select({ id: schema.user.id }).from(schema.user).where(eq(schema.user.username, name)).limit(1);
  if (vorhanden) return { benutzername: name, passwort: null as string | null, id: vorhanden.id };
  const pw = passwort();
  const r = await legeKinderkontoAn({ benutzername: name, passwort: pw, elternBenutzerId: elternId, lernendeId });
  if (!r.ok) fehler(`Kinderzugang nicht angelegt: ${r.fehler}`);
  return { benutzername: name, passwort: pw as string | null, id: r.benutzerId };
}

async function nachricht(kanalId: string, absenderId: string, text: string): Promise<number> {
  const v = verschluessele(text);
  const [z] = await db
    .insert(schema.chatNachricht)
    .values({ kanalId, absenderId, textVerschluesselt: v.daten, schluesselId: v.schluesselId })
    .returning({ id: schema.chatNachricht.id });
  return z.id;
}

/** Beispielgruppe mit Leitung, Mitgliedern, Terminen, Anwesenheit, Fortschritt und Chat – nur beim ersten Anlegen. */
async function beispielgruppe(o: {
  lehrkraft: string;
  aufsicht: string;
  eltern: string;
  emre: { lernendeId: string; benutzerId: string };
  zeynep: { lernendeId: string; benutzerId: string };
  yunus: string;
}): Promise<string> {
  const [vorhanden] = await db
    .select({ id: schema.gruppe.id })
    .from(schema.gruppe)
    .where(sql`${schema.gruppe.name}->>'de' = ${GRUPPE.de}`);
  if (vorhanden) return vorhanden.id;
  const [g] = await db
    .insert(schema.gruppe)
    .values({
      name: GRUPPE,
      kursart: 'elifbe',
      schuljahr: `${jahr}/${jahr + 1}`,
      beginn: tagPlus(heute, -35),
      ort: '[Unterrichtsraum – Beispiel]',
      wochentage: [6, 0],
      uhrzeitVon: '10:00',
      uhrzeitBis: '12:00',
      chatModus: 'offen',
      chatMindestalter: 10,
      chatVon: '08:00',
      chatBis: '20:00',
      erstelltVon: 'beispielkonten',
    })
    .returning({ id: schema.gruppe.id });
  await db.insert(schema.gruppenLeitung).values([
    { gruppeId: g.id, benutzerId: o.lehrkraft, rolle: 'lehrkraft' },
    { gruppeId: g.id, benutzerId: o.aufsicht, rolle: 'aufsicht' },
  ]);
  await db
    .insert(schema.gruppenMitglied)
    .values(
      [o.emre.lernendeId, o.zeynep.lernendeId, o.yunus].map((lernendeId) => ({ gruppeId: g.id, lernendeId, seit: tagPlus(heute, -35) })),
    );

  // Termine: Serie am Wochenende (drei Wochen zurück, drei voraus) und ein Vorführtermin heute
  await erzeugeTermine(g.id, tagPlus(heute, -21), tagPlus(heute, 21));
  await db.insert(schema.unterrichtstermin).values({ gruppeId: g.id, datum: heute, beginn: '16:00', ende: '17:30' }).onConflictDoNothing();

  // Anwesenheit der vergangenen Termine
  const vergangen = await db
    .select({ id: schema.unterrichtstermin.id })
    .from(schema.unterrichtstermin)
    .where(and(eq(schema.unterrichtstermin.gruppeId, g.id), lt(schema.unterrichtstermin.datum, heute)));
  const muster = [
    ['anwesend', 'anwesend', 'anwesend'],
    ['anwesend', 'entschuldigt', 'verspaetet'],
    ['verspaetet', 'anwesend', 'anwesend'],
    ['anwesend', 'anwesend', 'fehlt'],
  ] as const;
  const kinder = [o.emre.lernendeId, o.zeynep.lernendeId, o.yunus];
  if (vergangen.length)
    await db
      .insert(schema.anwesenheit)
      .values(
        vergangen.flatMap((t, i) =>
          kinder.map((lernendeId, j) => ({ terminId: t.id, lernendeId, status: muster[i % muster.length][j], erfasstVon: o.lehrkraft })),
        ),
      );
  // Abmeldung der Eltern für heute (belegt die Anwesenheit mit „entschuldigt“ vor)
  await db.insert(schema.fehlmeldung).values({ lernendeId: o.zeynep.lernendeId, datum: heute, grund: 'krank', erstelltVon: o.eltern });

  // Fortschritt (Elifbe) und ein Hifz-Eintrag
  const stufen = await db
    .select({ id: schema.lehrplanStufe.id, reihenfolge: schema.lehrplanStufe.reihenfolge })
    .from(schema.lehrplanStufe)
    .where(eq(schema.lehrplanStufe.kursart, 'elifbe'));
  const stufe = (nr: number) => stufen.find((s) => s.reihenfolge === nr)?.id;
  const stand: [string, number, 'begonnen' | 'sicher' | 'abgeschlossen'][] = [
    [o.emre.lernendeId, 1, 'abgeschlossen'],
    [o.emre.lernendeId, 2, 'abgeschlossen'],
    [o.emre.lernendeId, 3, 'sicher'],
    [o.zeynep.lernendeId, 1, 'abgeschlossen'],
    [o.zeynep.lernendeId, 2, 'begonnen'],
    [o.yunus, 1, 'abgeschlossen'],
    [o.yunus, 2, 'abgeschlossen'],
    [o.yunus, 3, 'abgeschlossen'],
    [o.yunus, 4, 'abgeschlossen'],
    [o.yunus, 5, 'begonnen'],
  ];
  const werte = stand.flatMap(([lernendeId, nr, status]) => {
    const stufeId = stufe(nr);
    return stufeId ? [{ lernendeId, stufeId, status, datum: tagPlus(heute, -7 + nr), lehrkraftId: o.lehrkraft }] : [];
  });
  if (werte.length) await db.insert(schema.lernfortschritt).values(werte).onConflictDoNothing();
  const [sure] = await db.select({ nr: schema.quranSure.nr }).from(schema.quranSure).where(eq(schema.quranSure.nr, 1));
  if (sure)
    await db
      .insert(schema.hifzEintrag)
      .values({ lernendeId: o.yunus, sure: 1, vonVers: 1, bisVers: 7, bewertung: 4, datum: tagPlus(heute, -7), lehrkraftId: o.lehrkraft });

  // Chat: Gruppen- und Elternkanal mit Beispielnachrichten und einer offenen Meldung (Vorführung der Moderation)
  const kanal = await kanaeleDerGruppe(g.id);
  await nachricht(
    kanal.gruppe,
    o.lehrkraft,
    'Willkommen im Gruppenchat! Hier sprechen wir über Termine und Fragen zum Unterricht. [Beispiel]',
  );
  await nachricht(kanal.gruppe, o.emre.benutzerId, 'Danke! Bis Samstag. [Beispiel]');
  const gemeldet = await nachricht(kanal.gruppe, o.zeynep.benutzerId, '[Beispielnachricht für die Vorführung der Moderation]');
  await nachricht(kanal.eltern, o.lehrkraft, 'Liebe Eltern, bitte geben Sie Ihrem Kind am Samstag das Heft mit. [Beispiel]');
  await nachricht(kanal.eltern, o.eltern, 'Danke für den Hinweis! [Beispiel]');
  // Gruppenkontext des meldenden Kindes (wie `ladeGruppenKontext`, ohne Next.js-Laufzeit im Skript)
  const kontextEmre = {
    benutzerId: o.emre.benutzerId,
    leitung: new Map<string, 'lehrkraft' | 'aufsicht'>(),
    eigeneLernendeId: o.emre.lernendeId,
    eigeneGruppen: new Set([g.id]),
    kinder: new Map<string, Set<string>>(),
  };
  await meldeNachricht(kontextEmre, gemeldet, 'unangemessen', null);
  return g.id;
}

async function main() {
  if (values.neu) await loesche();
  const gemeinde = await erwachsen('gemeinde', 'Amira Beispiel', ['gemeinde']);
  const eltern = await erwachsen('eltern', 'Yusuf Beispiel', ['gemeinde', 'eltern']);
  const lehrkraft = await erwachsen('lehrkraft', 'Selin Beispiel', ['gemeinde', 'lehrkraft']);
  // Zweite erwachsene Person in der Gruppenleitung (S-02: Kanäle nur mit mindestens zwei Erwachsenen)
  const aufsicht = await erwachsen('aufsicht', 'Hatice Beispiel', ['gemeinde', 'lehrkraft']);

  // Kinder des Elternkontos: Lerndatensatz + Eltern-Bezug + Einwilligungen → Kinderzugang
  const emre = await lernende(NAMEN.emre, 'Emre', `${jahr + 4}-03-14`);
  const zeynep = await lernende(NAMEN.zeynep, 'Zeynep', `${jahr + 6}-06-02`);
  // Yunus ist seit zehn Tagen 16: Übergang (D-11) – die Einwilligung der Eltern gilt noch 20 Tage, dann zählt seine eigene
  const yunus = await lernende(NAMEN.yunus, 'Yunus', tagPlus(heute, -10));
  if (emre.neu) {
    await db.insert(schema.elternKind).values({ elternId: eltern.id, lernendeId: emre.id, bestaetigtAm: new Date() });
    await einwilligen(emre.id, eltern.id, ['lernplattform', 'kinderkonto', 'gruppenchat']);
  }
  if (zeynep.neu) {
    await db.insert(schema.elternKind).values({ elternId: eltern.id, lernendeId: zeynep.id, bestaetigtAm: new Date() });
    await einwilligen(zeynep.id, eltern.id, ['lernplattform', 'kinderkonto', 'gruppenchat']);
  }
  const kind = await kinderzugang(benutzername, emre.id, eltern.id);
  if (yunus.neu) {
    await db.insert(schema.elternKind).values({ elternId: eltern.id, lernendeId: yunus.id, bestaetigtAm: new Date() });
    await einwilligen(yunus.id, eltern.id, ['lernplattform', 'kinderkonto', 'gruppenchat']);
  }
  const kind2 = await kinderzugang(benutzername2, zeynep.id, eltern.id);
  const kind3 = await kinderzugang(benutzername3, yunus.id, eltern.id);

  const gruppeId = await beispielgruppe({
    lehrkraft: lehrkraft.id,
    aufsicht: aufsicht.id,
    eltern: eltern.id,
    emre: { lernendeId: emre.id, benutzerId: kind.id },
    zeynep: { lernendeId: zeynep.id, benutzerId: kind2.id },
    yunus: yunus.id,
  });

  const ergebnis = {
    gemeinde: { email: gemeinde.email, passwort: gemeinde.passwort },
    eltern: { email: eltern.email, passwort: eltern.passwort },
    lehrkraft: { email: lehrkraft.email, passwort: lehrkraft.passwort },
    aufsicht: { email: aufsicht.email, passwort: aufsicht.passwort },
    kind: { benutzername: kind.benutzername, passwort: kind.passwort },
    kind2: { benutzername: kind2.benutzername, passwort: kind2.passwort },
    kind3: { benutzername: kind3.benutzername, passwort: kind3.passwort },
    lernplattform: {
      gruppeId,
      gruppe: GRUPPE.de,
      kinder: {
        emre: { id: emre.id, name: NAMEN.emre },
        zeynep: { id: zeynep.id, name: NAMEN.zeynep },
        yunus: { id: yunus.id, name: NAMEN.yunus },
      },
    },
  };
  if (values.json) {
    console.log(JSON.stringify(ergebnis));
    return;
  }
  console.log('Beispielkonten (Passwort nur bei neu angelegten Konten; vorhandene bleiben unverändert):');
  for (const [art, z] of Object.entries(ergebnis)) {
    if (!('passwort' in z)) continue;
    const name = 'email' in z ? z.email : z.benutzername;
    console.log(`  ${art.padEnd(10)} ${name.padEnd(36)} ${z.passwort ?? '(vorhanden, Passwort unverändert)'}`);
  }
  console.log(`Beispielgruppe: ${GRUPPE.de} (${gruppeId})`);
  console.log('Lehrkraft und Aufsicht: beim ersten Anmelden ist die Einrichtung des zweiten Faktors Pflicht.');
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  });
