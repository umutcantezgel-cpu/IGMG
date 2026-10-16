import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { schema } from '@/lib/db';
import { berlinerDatum } from '@/lib/gebetszeiten/naechstes';
import { entschluessele, verschluessele } from '@/lib/krypto';
import { tagPlus } from '@/lib/lernen/termine';
import { formular, kontoUmgebung, nachher, umleitung } from './hilfen/konto';

/**
 * Rückfall für Benachrichtigungen (ADR 0034 Nr. 6, F-38) gegen PGlite mit echtem Better Auth:
 * - Auswahl je Thema speichern, ändern, abbestellen (nur erlaubte Themen, nie Gebet; nie Kinderkonten, nur bestätigte und
 *   zustellbare Adressen).
 * - Planung im täglichen Cron: nur bei Neuem, höchstens einmal je Berliner Tag (idempotent), nur was die Person sehen darf.
 * - Gerenderte Mail nennt nur Bereich und Anzahl: keine Namen, keine Gruppennamen, keine Titel, keine Inhalte.
 * - Schalter `push` (und `chat`, `lernplattform`) aus → nichts; Empfänger wird erst beim Versand ermittelt.
 * - Abruf `/api/mein/neues` für den Hinweis in Mein Bereich (erster Abruf nur Stand, offener Kanal zählt nicht; ein
 *   fremder Kanal in `ohne` liefert weder Zählung noch Token).
 * Der Mail-Transport ist eine Attrappe. Testdaten fiktiv (G-04).
 */
const versendet: { an: string; betreff: string; html: string; text: string }[] = [];
vi.mock('@/lib/mail/transport', () => ({
  versende: async (m: { an: string; betreff: string; html: string; text: string }) => {
    versendet.push(m);
  },
}));

const { client, db } = await kontoUmgebung();
const { auth } = await import('@/lib/auth/server');
const { speichereZusammenfassung } = await import('@/server/actions/benachrichtigungen');
const { planeZusammenfassungen, bestellteThemen, waehlbareThemen } = await import('@/lib/push/zusammenfassung');
const { zusammenfassungsLage, baueZusammenfassungsMail } = await import('@/lib/push/zusammenfassung-mail');
const { zaehleNeues } = await import('@/lib/push/neues');
const { versendeOffeneMails } = await import('@/lib/mail/ausgang');
const lehrkraftAktionen = await import('@/server/actions/lehrkraft');
const chat = await import('@/lib/chat/dienst');
const neuesRoute = await import('@/app/api/mein/neues/route');
afterAll(() => client.close());

const api = auth.api as unknown as Record<string, unknown>;
const echteSitzung = api.getSession;
const PASSWORT = 'Ein-langes-Testpasswort-2026';
const heute = berlinerDatum(new Date());
const STUNDE = 60 * 60 * 1000;
const TAG = 24 * STUNDE;

type Rolle = (typeof schema.gemeindeRolleEnum.enumValues)[number];
type Person = { id: string; name: string; email: string; twoFactorEnabled: boolean };

async function person(
  name: string,
  rollen: Rolle[],
  o: { kind?: boolean; domain?: string; bestaetigt?: boolean; zweiFaktor?: boolean } = {},
): Promise<Person> {
  const email = `${randomUUID().slice(0, 8)}@${o.domain ?? 'example.test'}`;
  const r = await auth.api.signUpEmail({ body: { email, password: PASSWORT, name } });
  const zweiFaktor = o.zweiFaktor ?? rollen.includes('lehrkraft');
  await db
    .update(schema.user)
    .set({ emailVerified: o.bestaetigt ?? true, twoFactorEnabled: zweiFaktor })
    .where(eq(schema.user.id, r.user.id));
  await db.insert(schema.kontoProfil).values({ benutzerId: r.user.id, anzeigename: name, istKind: o.kind ?? false });
  if (rollen.length) await db.insert(schema.gemeindeRolle).values(rollen.map((rolle) => ({ benutzerId: r.user.id, rolle })));
  return { id: r.user.id, name, email, twoFactorEnabled: zweiFaktor };
}

function als(p: Person) {
  api.getSession = async () => ({
    user: { ...p, gesperrtAm: null },
    session: { id: `s-${p.id}`, createdAt: new Date(), userId: p.id },
  });
}

function auswahl(...themen: string[]): FormData {
  const fd = formular({ sprache: 'de' });
  for (const t of themen) fd.append('thema', t);
  return fd;
}

async function nachricht(kanalId: string, absender: string, text: string, erstelltAm = new Date()) {
  const v = verschluessele(text);
  await db
    .insert(schema.chatNachricht)
    .values({ kanalId, absenderId: absender, textVerschluesselt: v.daten, schluesselId: v.schluesselId, erstelltAm });
}

const ZIEL = '/mein-bereich/benachrichtigungen?zusammenfassung=';
const GEHEIM = 'Geheimer Inhalt der Elternnachricht';
const p = {} as Record<'lehrkraft' | 'aufsicht' | 'eltern' | 'gemeinde' | 'kind' | 'beispiel' | 'unbestaetigt' | 'redaktion', Person>;
let gruppeA: string;
let kanal: { gruppe: string; eltern: string };
let termin: string;

beforeAll(async () => {
  [{ id: gruppeA }] = await db
    .insert(schema.gruppe)
    .values({ name: { de: 'Gruppe Sonnenblume' }, wochentage: [6], chatModus: 'offen', chatVon: '00:00', chatBis: '23:59' })
    .returning({ id: schema.gruppe.id });
  p.lehrkraft = await person('Hoca Zehra', ['lehrkraft']);
  p.aufsicht = await person('Aufsicht Yusuf', ['lehrkraft']);
  p.eltern = await person('Mutter Ayse', ['gemeinde', 'eltern']);
  p.gemeinde = await person('Gemeinde Ali', ['gemeinde']);
  p.kind = await person('Kind Emre', ['schueler'], { kind: true, domain: 'konto.invalid' });
  p.beispiel = await person('Beispiel Konto', ['gemeinde'], { domain: 'beispiel.invalid' });
  p.unbestaetigt = await person('Neu Konto', ['gemeinde'], { bestaetigt: false });
  p.redaktion = await person('Redaktion Test', [], { zweiFaktor: true });
  await db.insert(schema.rolleZuweisung).values({ benutzerId: p.redaktion.id, rolle: 'redaktion' });
  await db.insert(schema.gruppenLeitung).values([
    { gruppeId: gruppeA, benutzerId: p.lehrkraft.id, rolle: 'lehrkraft' },
    { gruppeId: gruppeA, benutzerId: p.aufsicht.id, rolle: 'aufsicht' },
  ]);
  const v = verschluessele({ name: 'Kind Emre' });
  const [l] = await db
    .insert(schema.lernende)
    .values({
      benutzerId: p.kind.id,
      datenVerschluesselt: v.daten,
      schluesselId: v.schluesselId,
      anzeigename: 'Emre K.',
      sechzehnAm: tagPlus(heute, 3 * 365),
    })
    .returning({ id: schema.lernende.id });
  await db.insert(schema.gruppenMitglied).values({ gruppeId: gruppeA, lernendeId: l.id, seit: tagPlus(heute, -30) });
  await db.insert(schema.elternKind).values({ elternId: p.eltern.id, lernendeId: l.id, bestaetigtAm: new Date() });
  kanal = await chat.kanaeleDerGruppe(gruppeA);
  [{ id: termin }] = await db
    .insert(schema.unterrichtstermin)
    .values({ gruppeId: gruppeA, datum: tagPlus(heute, 2), beginn: '10:00' })
    .returning({ id: schema.unterrichtstermin.id });
});

beforeEach(async () => {
  versendet.length = 0;
  await db.delete(schema.mailAusgang);
});
afterEach(() => {
  api.getSession = echteSitzung;
  nachher.length = 0;
  for (const f of ['PUSH', 'CHAT', 'LERNPLATTFORM']) delete process.env[`FUNKTION_${f}`];
});

describe('Auswahl in Mein Bereich › Benachrichtigungen', () => {
  it('speichert nur erlaubte Themen (nie Gebet), ändert und bestellt ab – mit Audit ohne Inhalte', async () => {
    expect(await waehlbareThemen(p.eltern.id)).toEqual(['ankuendigung', 'chat', 'unterricht']);
    als(p.eltern);
    expect(await umleitung(speichereZusammenfassung(auswahl('unterricht', 'gebet', 'chat', 'chat')))).toBe(
      `${ZIEL}gespeichert#zusammenfassung`,
    );
    expect(await bestellteThemen(p.eltern.id)).toEqual(['chat', 'unterricht']);
    const [zeile] = await db.select().from(schema.mailZusammenfassung).where(eq(schema.mailZusammenfassung.benutzerId, p.eltern.id));
    expect(zeile.letzterVersand).toBeNull();
    // Themenwechsel behält den Zählbeginn
    await umleitung(speichereZusammenfassung(auswahl('ankuendigung', 'chat')));
    const [danach] = await db.select().from(schema.mailZusammenfassung).where(eq(schema.mailZusammenfassung.benutzerId, p.eltern.id));
    expect(danach.themen).toEqual(['ankuendigung', 'chat']);
    expect(danach.seit.getTime()).toBe(zeile.seit.getTime());
    // Abbestellen: keine Häkchen → Zeile weg
    expect(await umleitung(speichereZusammenfassung(auswahl()))).toBe(`${ZIEL}aus#zusammenfassung`);
    expect(await bestellteThemen(p.eltern.id)).toEqual([]);
    const audit = await db.select().from(schema.auditEintrag).where(eq(schema.auditEintrag.aktion, 'konto.zusammenfassung_geaendert'));
    expect(audit.map((a) => a.details)).toEqual([{ themen: 'chat,unterricht' }, { themen: 'ankuendigung,chat' }, { themen: '' }]);
  });

  it('ohne Gruppe nur „Ankündigung“: Chat und Unterricht werden verworfen', async () => {
    expect(await waehlbareThemen(p.gemeinde.id)).toEqual(['ankuendigung']);
    als(p.gemeinde);
    await umleitung(speichereZusammenfassung(auswahl('chat', 'unterricht', 'ankuendigung')));
    expect(await bestellteThemen(p.gemeinde.id)).toEqual(['ankuendigung']);
    await umleitung(speichereZusammenfassung(auswahl()));
  });

  it('Kinderkonto: kein Zugriff; `.invalid` und unbestätigte Adressen: Hinweis statt Speichern', async () => {
    als(p.kind);
    await expect(speichereZusammenfassung(auswahl('chat'))).rejects.toThrow();
    expect(await zusammenfassungsLage(p.kind.id)).toEqual({ moeglich: false, grund: 'kind' });
    for (const wer of [p.beispiel, p.unbestaetigt]) {
      als(wer);
      expect(await umleitung(speichereZusammenfassung(auswahl('ankuendigung')))).toBe(`${ZIEL}adresse#zusammenfassung`);
      expect(await bestellteThemen(wer.id)).toEqual([]);
    }
  });

  it('Schalter `push` aus → kein Speichern', async () => {
    process.env.FUNKTION_PUSH = 'aus';
    als(p.eltern);
    await expect(speichereZusammenfassung(auswahl('chat'))).rejects.toThrow();
    expect(await bestellteThemen(p.eltern.id)).toEqual([]);
  });
});

describe('Zählung nach Leserechten', () => {
  it('Chat: Gruppen mit Nachrichten anderer; eigene, entfernte und ältere zählen nicht', async () => {
    const seit = new Date(Date.now() - STUNDE);
    await nachricht(kanal.eltern, p.eltern.id, 'Eigene Nachricht');
    await nachricht(kanal.eltern, p.lehrkraft.id, 'Alt', new Date(Date.now() - 2 * STUNDE));
    expect((await zaehleNeues(p.eltern.id, seit, ['chat'])).chat).toBe(0);
    await nachricht(kanal.eltern, p.lehrkraft.id, GEHEIM);
    await nachricht(kanal.gruppe, p.lehrkraft.id, 'Nur für die Kindergruppe');
    // Eltern lesen nur den Elternkanal; zwei Kanäle derselben Gruppe sind eine Gruppe
    expect(await zaehleNeues(p.eltern.id, seit, ['chat', 'unterricht', 'ankuendigung'])).toEqual({
      chat: 1,
      unterricht: 0,
      ankuendigung: 0,
    });
    // Offener Kanal (Chat-Seite) zählt nicht
    expect((await zaehleNeues(p.eltern.id, seit, ['chat'], { ohneKanal: kanal.eltern })).chat).toBe(0);
    // Wer nicht zur Gruppe gehört, sieht nichts
    expect((await zaehleNeues(p.gemeinde.id, seit, ['chat'])).chat).toBe(0);
    // Schalter `chat` aus → Chat zählt nicht
    process.env.FUNKTION_CHAT = 'aus';
    expect((await zaehleNeues(p.eltern.id, seit, ['chat'])).chat).toBe(0);
  });

  it('Unterricht: Ausfall eines Termins (Audit) und neue Aufgaben anderer; Schalter `lernplattform` aus → 0', async () => {
    const seit = new Date(Date.now() - 1000);
    als(p.lehrkraft);
    await lehrkraftAktionen.terminAusfallSetzen(formular({ terminId: termin, ausgefallen: '1' }));
    const [audit] = await db.select().from(schema.auditEintrag).where(eq(schema.auditEintrag.aktion, 'unterricht.termin_geaendert'));
    expect(audit).toMatchObject({ zielTyp: 'gruppe', zielId: gruppeA, details: { termin, ausgefallen: true } });
    expect((await zaehleNeues(p.eltern.id, seit, ['unterricht'])).unterricht).toBe(1);
    // Die Lehrkraft selbst hat es ausgelöst – für sie ist es nicht neu
    expect((await zaehleNeues(p.lehrkraft.id, seit, ['unterricht'])).unterricht).toBe(0);
    expect((await zaehleNeues(p.aufsicht.id, seit, ['unterricht'])).unterricht).toBe(1);
    process.env.FUNKTION_LERNPLATTFORM = 'aus';
    expect((await zaehleNeues(p.eltern.id, seit, ['unterricht'])).unterricht).toBe(0);
  });

  it('Ankündigung: nur sichtbare, seit dem Zählbeginn veröffentlichte, mit Recht zur Benachrichtigung', async () => {
    const seit = new Date(Date.now() - 1000);
    const basis = { titel: { de: 'Titel der Ankündigung' }, inhalt: { de: 'Text' }, status: 'veroeffentlicht' as const };
    await db.insert(schema.ankuendigung).values([
      { ...basis, aktualisiertVon: p.redaktion.id },
      { ...basis, aktualisiertVon: p.redaktion.id, sichtbarAb: new Date(Date.now() + TAG) },
      { ...basis, aktualisiertVon: p.redaktion.id, status: 'entwurf' },
      { ...basis, aktualisiertVon: p.redaktion.id, erstelltAm: new Date(Date.now() - 2 * TAG) },
    ]);
    expect((await zaehleNeues(p.gemeinde.id, seit, ['ankuendigung'])).ankuendigung).toBe(1);
    // Ohne Recht `push.ankuendigung` (z. B. Organisationsredaktion) keine Benachrichtigung – auch nicht per Mail
    await db.delete(schema.rolleZuweisung).where(eq(schema.rolleZuweisung.benutzerId, p.redaktion.id));
    expect((await zaehleNeues(p.gemeinde.id, seit, ['ankuendigung'])).ankuendigung).toBe(0);
    await db.insert(schema.rolleZuweisung).values({ benutzerId: p.redaktion.id, rolle: 'redaktion' });
    await db.delete(schema.ankuendigung);
  });

  it('Ankündigung: Beginn = erste Veröffentlichung laut Audit (sonst Anlage) bzw. späteres „sichtbar ab“', async () => {
    const jetzt = Date.now();
    const seit = new Date(jetzt - STUNDE);
    const alt = new Date(jetzt - 2 * TAG);
    const vor = (ms: number) => new Date(jetzt - ms);
    const basis = { titel: { de: 'Titel der Ankündigung' }, inhalt: { de: 'Text' }, status: 'veroeffentlicht' as const };
    const zeilen = await db
      .insert(schema.ankuendigung)
      .values([
        // 0: alt angelegt, erst nach dem Zählbeginn veröffentlicht → zählt
        { ...basis, aktualisiertVon: p.redaktion.id, erstelltAm: alt },
        // 1: früh veröffentlicht, später erneut gespeichert und veröffentlicht → zählt nicht (erste Veröffentlichung zählt)
        { ...basis, aktualisiertVon: p.redaktion.id, erstelltAm: alt },
        // 2: alt, „sichtbar ab“ nach dem Zählbeginn und schon erreicht → zählt
        { ...basis, aktualisiertVon: p.redaktion.id, erstelltAm: alt, sichtbarAb: vor(30 * 60 * 1000) },
        // 3: alt, „sichtbar ab“ vor dem Zählbeginn → zählt nicht
        { ...basis, aktualisiertVon: p.redaktion.id, erstelltAm: alt, sichtbarAb: vor(3 * STUNDE) },
        // 4: eben angelegt, laut Audit aber längst veröffentlicht → zählt nicht (Audit geht der Anlage vor)
        { ...basis, aktualisiertVon: p.redaktion.id },
        // 5: nach dem Zählbeginn veröffentlicht, aber schon abgelaufen → zählt nicht
        { ...basis, aktualisiertVon: p.redaktion.id, erstelltAm: alt, laeuftAb: vor(60 * 1000) },
        // 6: eben angelegt, ohne Audit → zählt (Anlage)
        { ...basis, aktualisiertVon: p.redaktion.id },
      ])
      .returning({ id: schema.ankuendigung.id });
    const veroeffentlicht = (i: number, zeitpunkt: Date) => ({
      aktion: 'inhalt.veroeffentlicht',
      zielTyp: 'ankuendigung',
      zielId: zeilen[i].id,
      benutzerId: p.redaktion.id,
      zeitpunkt,
    });
    await db
      .insert(schema.auditEintrag)
      .values([
        veroeffentlicht(0, vor(10 * 60 * 1000)),
        veroeffentlicht(1, alt),
        veroeffentlicht(1, vor(5 * 60 * 1000)),
        veroeffentlicht(4, alt),
        veroeffentlicht(5, vor(10 * 60 * 1000)),
      ]);
    expect((await zaehleNeues(p.gemeinde.id, seit, ['ankuendigung'], { jetzt: new Date(jetzt) })).ankuendigung).toBe(3);
    await db.delete(schema.ankuendigung);
  });
});

describe('Tägliche Planung und Versand', () => {
  it('nur bei Neuem, höchstens einmal je Tag (idempotent); Mail nennt nur Bereich und Anzahl', async () => {
    const start = new Date(Date.now() - STUNDE);
    await db.delete(schema.mailZusammenfassung);
    await db.delete(schema.chatNachricht);
    // Der Ausfall aus dem Unterrichts-Test ist hier nicht gewählt – trotzdem weg, damit nur der Chat zählt
    await db.delete(schema.auditEintrag).where(eq(schema.auditEintrag.aktion, 'unterricht.termin_geaendert'));
    await db.insert(schema.mailZusammenfassung).values({ benutzerId: p.eltern.id, themen: ['chat', 'unterricht'], seit: start });

    // Nichts Neues → nichts geplant
    expect(await planeZusammenfassungen()).toEqual({ geprueft: 1, geplant: 0 });
    expect(await db.select().from(schema.mailAusgang)).toHaveLength(0);

    // Zwei neue Nachrichten im Elternkanal → genau eine Zusammenfassung
    await nachricht(kanal.eltern, p.lehrkraft.id, GEHEIM);
    await nachricht(kanal.eltern, p.aufsicht.id, `${GEHEIM} (2)`);
    const jetzt = new Date();
    expect(await planeZusammenfassungen(jetzt)).toEqual({ geprueft: 1, geplant: 1 });
    const [geplant] = await db.select().from(schema.mailAusgang);
    expect(geplant).toMatchObject({ vorlage: 'konto-zusammenfassung', sprache: 'de', gesendetAm: null });
    const inhalt = entschluessele<{ an: string; daten: Record<string, string> }>(geplant.datenVerschluesselt, geplant.schluesselId);
    expect(inhalt).toEqual({ an: `zusammenfassung:${p.eltern.id}`, daten: { ankuendigung: '0', chat: '1', unterricht: '0' } });

    // Zweiter Lauf am selben Tag, auch mit weiterem Neuen → nichts
    await nachricht(kanal.eltern, p.lehrkraft.id, 'Noch eine');
    expect(await planeZusammenfassungen(new Date(jetzt.getTime() + 1000))).toEqual({ geprueft: 1, geplant: 0 });
    expect(await db.select().from(schema.mailAusgang)).toHaveLength(1);

    // Versand: an die Kontoadresse, ohne Namen, Gruppennamen und Inhalte
    expect(await versendeOffeneMails()).toEqual({ gesendet: 1, fehler: 0 });
    expect(versendet).toHaveLength(1);
    const mail = versendet[0];
    expect(mail.an).toBe(p.eltern.email);
    expect(mail.betreff).toBe('Neues in Mein Bereich');
    for (const teil of [mail.html, mail.text]) {
      expect(teil).toContain('In einer Ihrer Gruppen gibt es neue Nachrichten.');
      expect(teil).toContain('/mein-bereich/benachrichtigungen#zusammenfassung');
      for (const verboten of [GEHEIM, 'Geheimer', 'Sonnenblume', 'Zehra', 'Yusuf', 'Ayse', 'Emre', 'Titel der Ankündigung'])
        expect(teil).not.toContain(verboten);
    }

    // Am nächsten Tag: das seit dem letzten Versand Neue (eine Nachricht) → wieder genau eine
    const morgen = new Date(jetzt.getTime() + TAG);
    expect(await planeZusammenfassungen(morgen)).toEqual({ geprueft: 1, geplant: 1 });
    expect(await planeZusammenfassungen(new Date(morgen.getTime() + STUNDE))).toEqual({ geprueft: 1, geplant: 0 });
    // Übermorgen ohne Neues → nichts
    expect(await planeZusammenfassungen(new Date(jetzt.getTime() + 2 * TAG))).toEqual({ geprueft: 1, geplant: 0 });
  });

  it('Mehrzahl: „In 2 Ihrer Gruppen …“ – je Sprache, ohne Namen', async () => {
    const de = await baueZusammenfassungsMail('de', { chat: '2', unterricht: '1', ankuendigung: '3' });
    expect(de.text).toContain('In 2 Ihrer Gruppen gibt es neue Nachrichten.');
    expect(de.text).toContain('Aus einer Ihrer Gruppen gibt es Neues zum Unterricht.');
    expect(de.text).toContain('Die Moschee hat 3 neue Ankündigungen veröffentlicht.');
    const tr = await baueZusammenfassungsMail('tr', { chat: '2', unterricht: '0', ankuendigung: '0' });
    expect(tr.html).toContain('lang="tr"');
    expect(tr.text).toContain('/tr/hesabim');
    // Unsinnige Werte fallen weg
    const leer = await baueZusammenfassungsMail('de', { chat: '-1', unterricht: 'x', ankuendigung: '1.5' });
    expect(leer.text).not.toContain('Gruppen');
  });

  it('Kinderkonto, `.invalid`, unbestätigt: auch mit Zeile und Neuem keine Mail', async () => {
    await db.delete(schema.mailZusammenfassung);
    const seit = new Date(Date.now() - STUNDE);
    await db.insert(schema.mailZusammenfassung).values([
      { benutzerId: p.kind.id, themen: ['chat', 'ankuendigung'], seit },
      { benutzerId: p.beispiel.id, themen: ['ankuendigung'], seit },
      { benutzerId: p.unbestaetigt.id, themen: ['ankuendigung'], seit },
    ]);
    await nachricht(kanal.gruppe, p.lehrkraft.id, GEHEIM);
    await db.insert(schema.ankuendigung).values({
      titel: { de: 'Titel der Ankündigung' },
      inhalt: { de: 'Text' },
      status: 'veroeffentlicht',
      aktualisiertVon: p.redaktion.id,
    });
    expect(await planeZusammenfassungen()).toEqual({ geprueft: 3, geplant: 0 });
    // Selbst eine (von Hand) geplante Zeile an ein Kinderkonto geht nicht hinaus
    const paket = verschluessele({ an: `zusammenfassung:${p.kind.id}`, daten: { chat: '1' } });
    await db
      .insert(schema.mailAusgang)
      .values({ vorlage: 'konto-zusammenfassung', sprache: 'de', datenVerschluesselt: paket.daten, schluesselId: paket.schluesselId });
    await versendeOffeneMails();
    expect(versendet).toHaveLength(0);
    await db.delete(schema.ankuendigung);
  });

  it('Schalter `push` aus: nichts geplant; zwischen Planung und Versand ausgeschaltet oder abbestellt: nichts versendet', async () => {
    await db.delete(schema.mailZusammenfassung);
    await db.insert(schema.mailZusammenfassung).values({ benutzerId: p.eltern.id, themen: ['chat'], seit: new Date(Date.now() - STUNDE) });
    await nachricht(kanal.eltern, p.lehrkraft.id, GEHEIM);
    process.env.FUNKTION_PUSH = 'aus';
    expect(await planeZusammenfassungen()).toEqual({ geprueft: 1, geplant: 0 });
    delete process.env.FUNKTION_PUSH;
    expect(await planeZusammenfassungen()).toEqual({ geprueft: 1, geplant: 1 });
    process.env.FUNKTION_PUSH = 'aus';
    await versendeOffeneMails();
    expect(versendet).toHaveLength(0);
    delete process.env.FUNKTION_PUSH;
    // Abbestellt zwischen Planung und Versand
    await db.update(schema.mailAusgang).set({ gesendetAm: null, versuche: 0, naechsterVersuch: new Date(0) });
    await db.delete(schema.mailZusammenfassung);
    await versendeOffeneMails();
    expect(versendet).toHaveLength(0);
  });

  it('Cron-Route plant und versendet in einem Lauf', async () => {
    const vorher = process.env.CRON_SECRET;
    process.env.CRON_SECRET = 'cron-geheimnis-fuer-den-test-0123456789';
    try {
      await db.delete(schema.mailZusammenfassung);
      await db
        .insert(schema.mailZusammenfassung)
        .values({ benutzerId: p.eltern.id, themen: ['chat'], seit: new Date(Date.now() - STUNDE) });
      await nachricht(kanal.eltern, p.lehrkraft.id, GEHEIM);
      const route = await import('@/app/api/wartung/mail-ausgang/route');
      const antwort = await route.GET(
        new Request('https://example.test/api/wartung/mail-ausgang', { headers: { authorization: `Bearer ${process.env.CRON_SECRET}` } }),
      );
      expect(await antwort.json()).toMatchObject({ zusammenfassungen: 1, gesendet: 1, fehler: 0 });
      expect(versendet.map((m) => m.an)).toEqual([p.eltern.email]);
    } finally {
      if (vorher === undefined) delete process.env.CRON_SECRET;
      else process.env.CRON_SECRET = vorher;
    }
  });
});

describe('Abruf für den Hinweis in Mein Bereich (/api/mein/neues)', () => {
  const abruf = (q = '') => neuesRoute.GET(new Request(`https://example.test/api/mein/neues${q}`));

  it('ohne Sitzung 401; erster Abruf nur der Stand; danach Anzahl je Bereich ohne Inhalte', async () => {
    expect((await abruf()).status).toBe(401);
    als(p.eltern);
    const erst = await abruf();
    expect(erst.headers.get('cache-control')).toBe('no-store');
    const stand = (await erst.json()) as { stand: number; neu: unknown; echtzeit: unknown };
    expect(stand).toEqual({ stand: expect.any(Number), neu: null, echtzeit: null });
    await nachricht(kanal.eltern, p.lehrkraft.id, GEHEIM, new Date(stand.stand + 1));
    const danach = await abruf(`?seit=${stand.stand}&signal=1`);
    const text = await danach.text();
    expect(JSON.parse(text)).toEqual({ stand: expect.any(Number), neu: { ankuendigung: 0, chat: 1, unterricht: 0 }, echtzeit: null });
    expect(text).not.toContain('Geheim');
    // Offener Kanal zählt nicht
    expect((await (await abruf(`?seit=${stand.stand}&ohne=${kanal.eltern}`)).json()).neu.chat).toBe(0);
  });

  it('Echtzeit-Signal: Tokens der lesbaren Kanäle, ohne den offenen Kanal (dessen Nachrichten zählen nicht)', async () => {
    const umgebung: Record<string, string> = {
      FUNKTION_ECHTZEIT: 'an',
      ECHTZEIT_URL: 'wss://echtzeit.example.test/connection/websocket',
      ECHTZEIT_GEHEIMNIS: 'echtzeit-geheimnis-fuer-den-test-0123456789',
      ECHTZEIT_API_URL: 'https://echtzeit.example.test/api',
      ECHTZEIT_API_SCHLUESSEL: 'echtzeit-schluessel-test',
    };
    const vorher = Object.fromEntries(Object.keys(umgebung).map((k) => [k, process.env[k]]));
    Object.assign(process.env, umgebung);
    try {
      als(p.eltern);
      const kanaele = async (q: string) =>
        ((await (await abruf(q)).json()) as { echtzeit: { abos: { kanal: string }[] } | null }).echtzeit?.abos.map((a) => a.kanal) ?? [];
      expect(await kanaele('?signal=1')).toContain(`chat:${kanal.eltern}`);
      expect(await kanaele(`?signal=1&ohne=${kanal.eltern}`)).not.toContain(`chat:${kanal.eltern}`);
    } finally {
      for (const [k, w] of Object.entries(vorher)) {
        if (w === undefined) delete process.env[k];
        else process.env[k] = w;
      }
    }
  });

  it('Fremder Kanal in `ohne` (Kanal einer Gruppe, zu der das Konto nicht gehört): weder Zählung noch Token', async () => {
    const umgebung: Record<string, string> = {
      FUNKTION_ECHTZEIT: 'an',
      ECHTZEIT_URL: 'wss://echtzeit.example.test/connection/websocket',
      ECHTZEIT_GEHEIMNIS: 'echtzeit-geheimnis-fuer-den-test-0123456789',
      ECHTZEIT_API_URL: 'https://echtzeit.example.test/api',
      ECHTZEIT_API_SCHLUESSEL: 'echtzeit-schluessel-test',
    };
    const vorher = Object.fromEntries(Object.keys(umgebung).map((k) => [k, process.env[k]]));
    Object.assign(process.env, umgebung);
    try {
      // Neues in beiden Kanälen der Gruppe – lesen dürfen es nur Eltern bzw. Kind, nicht das Gemeindekonto
      const seit = Date.now();
      await nachricht(kanal.eltern, p.lehrkraft.id, GEHEIM, new Date(seit + 1));
      await nachricht(kanal.gruppe, p.lehrkraft.id, 'Nur für die Kindergruppe', new Date(seit + 1));
      als(p.gemeinde);
      for (const fremd of [kanal.eltern, kanal.gruppe]) {
        const antwort = await abruf(`?seit=${seit}&ohne=${fremd}&signal=1`);
        expect(antwort.status).toBe(200);
        const text = await antwort.text();
        expect(JSON.parse(text)).toEqual({ stand: expect.any(Number), neu: { ankuendigung: 0, chat: 0, unterricht: 0 }, echtzeit: null });
        expect(text).not.toContain(fremd);
        expect(text).not.toContain('Geheim');
      }
      // Gegenprobe: Eltern mit dem fremden Kinderkanal in `ohne` – ihr eigener Kanal zählt weiter, ein Token nur für ihn
      als(p.eltern);
      const eltern = (await (await abruf(`?seit=${seit}&ohne=${kanal.gruppe}&signal=1`)).json()) as {
        neu: { chat: number };
        echtzeit: { abos: { kanal: string }[] } | null;
      };
      expect(eltern.neu.chat).toBe(1);
      expect(eltern.echtzeit?.abos.map((a) => a.kanal)).toEqual([`chat:${kanal.eltern}`]);
    } finally {
      for (const [k, w] of Object.entries(vorher)) {
        if (w === undefined) delete process.env[k];
        else process.env[k] = w;
      }
    }
  });
});
