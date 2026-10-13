import { randomUUID } from 'node:crypto';
import { and, eq } from 'drizzle-orm';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { schema } from '@/lib/db';
import type { RollenZuweisung } from '@/lib/rechte/matrix';
import type { Angemeldet } from '@/lib/rechte/pruefe';
import { aufrufe, formular, verwaltungsUmgebung } from './hilfen/verwaltung';

/**
 * Internes Postfach der Verwaltung (C09, V09): Teilnahme (serverseitig), Empfängerauswahl, Prüfung der Eingaben,
 * Gelesen-Markierung, Zähler der Seitenleiste und Audit ohne Text. Die Testhilfe legt je Aufruf eine neue Person an;
 * hier bleiben feste Testpersonen bestehen, und `alsPerson` wechselt die Sitzung über die gemockte Anmeldung.
 * G-04: nur fiktive Namen, E-Mail-Adressen nur unter @example.test.
 */
const { client, db } = await verwaltungsUmgebung();
// Nach der Testumgebung laden: Erst dann greift die Anmelde-Attrappe der Testhilfe (sonst bekäme diese Datei das echte Modul).
const { auth } = await import('@/lib/auth/server');
const { neueUnterhaltung, antworten, markiereGelesen } = await import('@/server/actions/postfach');
const { ladeUnterhaltungen, ladeUnterhaltung, ladeEmpfaenger, zaehleUngelesene, istTeilnehmer } =
  await import('@/server/queries/verwaltung/postfach');
afterAll(() => client.close());

type Person = { id: string; name: string; email: string };
type Werte = Record<string, string | string[]>;

/** Gemockte Sitzung: die Testhilfe liefert `auth.api.getSession` als Funktion; hier ersetzen wir sie je Person. */
const sitzungsApi = auth.api as unknown as { getSession: () => Promise<unknown> };

async function legePerson(name: string, rollen: RollenZuweisung[], zweiFaktor = true): Promise<Person> {
  const id = randomUUID();
  const email = `testperson.${id.slice(0, 8)}@example.test`;
  await db.insert(schema.user).values({ id, name, email, emailVerified: true, twoFactorEnabled: zweiFaktor });
  if (rollen.length)
    await db
      .insert(schema.rolleZuweisung)
      .values(rollen.map((r) => ({ benutzerId: id, rolle: r.rolle, organisation: r.organisation ?? null })));
  return { id, name, email };
}

function alsPerson(person: Person | null, zweiFaktor = true): void {
  sitzungsApi.getSession = async () =>
    person
      ? {
          user: { id: person.id, name: person.name, email: person.email, twoFactorEnabled: zweiFaktor },
          session: { id: `sitzung-${person.id}`, createdAt: new Date() },
        }
      : null;
}

/** Angemeldet-Objekt für Abfragen, die nur die Person-ID brauchen (Rechte prüft die Action selbst). */
function angemeldet(person: Person): Angemeldet {
  return { benutzerId: person.id, name: person.name, email: person.email, rollen: [], zweiFaktorErfuellt: true };
}

const anna = await legePerson('Testperson Eins', [{ rolle: 'redaktion' }]);
const bernd = await legePerson('Testperson Zwei', [{ rolle: 'bildung' }]);
const clara = await legePerson('Testperson Drei', [{ rolle: 'organisationsredaktion', organisation: 'gt' }]);
const dora = await legePerson('Testperson Vier', [{ rolle: 'mitgliederverwaltung' }], false);
const emil = await legePerson('Testperson Fünf', []);

/** Gültige Eingabe für eine neue Unterhaltung; `zusatz` überschreibt einzelne Felder. */
function gueltig(zusatz: Werte = {}): Werte {
  return { betreff: 'Testbetreff Eins', text: 'Erste Testnachricht.', empfaenger: [bernd.id], ...zusatz };
}

/** Legt eine Unterhaltung an und liefert ihre ID aus der Weiterleitung. */
async function neu(werte: Werte): Promise<string> {
  const ergebnis: unknown = await neueUnterhaltung({}, formular(werte)).catch((e: unknown) => e);
  const ziel = (ergebnis as { ziel?: string } | null)?.ziel ?? '';
  const treffer = /^\/verwaltung\/postfach\/([0-9a-f-]{36})\?gesendet=1$/.exec(ziel);
  expect(treffer, `Anlegen ohne Weiterleitung: ${ziel || JSON.stringify(ergebnis)}`).not.toBeNull();
  return treffer![1];
}

/** Zahl der ungelesenen Nachrichten für eine Person (Zähler der Seitenleiste). */
async function ungelesenFuer(person: Person): Promise<number> {
  return zaehleUngelesene(angemeldet(person));
}

async function anzahlNachrichten(unterhaltungId: string): Promise<number> {
  return (await db.select().from(schema.postfachNachricht).where(eq(schema.postfachNachricht.unterhaltungId, unterhaltungId))).length;
}

async function anzahlUnterhaltungen(): Promise<number> {
  return (await db.select().from(schema.unterhaltung)).length;
}

async function teilnahme(unterhaltungId: string, benutzerId: string) {
  const [zeile] = await db
    .select()
    .from(schema.unterhaltungTeilnehmer)
    .where(and(eq(schema.unterhaltungTeilnehmer.unterhaltungId, unterhaltungId), eq(schema.unterhaltungTeilnehmer.benutzerId, benutzerId)))
    .limit(1);
  return zeile;
}

async function auditZu(unterhaltungId: string) {
  return db.select().from(schema.auditEintrag).where(eq(schema.auditEintrag.zielId, unterhaltungId)).orderBy(schema.auditEintrag.id);
}

beforeAll(() => {
  alsPerson(anna);
});

beforeEach(() => {
  aufrufe.refresh = 0;
  aufrufe.updateTag.length = 0;
  aufrufe.revalidateTag.length = 0;
  aufrufe.nachher.length = 0;
});

describe('Verwaltung › Postfach › Rechte und Sitzung (C09)', () => {
  it('ohne Anmeldung: nichts wird angelegt, beantwortet oder markiert', async () => {
    alsPerson(anna);
    const id = await neu(gueltig({ betreff: 'Rechte ohne Anmeldung' }));
    alsPerson(null);
    const unterhaltungenVorher = await anzahlUnterhaltungen();
    const nachrichtenVorher = await anzahlNachrichten(id);
    expect(await neueUnterhaltung({}, formular(gueltig()))).toEqual({ fehler: 'keinRecht' });
    expect(await antworten({}, formular({ unterhaltungId: id, text: 'Ohne Anmeldung' }))).toEqual({ fehler: 'keinRecht' });
    await markiereGelesen(id);
    expect(await anzahlUnterhaltungen()).toBe(unterhaltungenVorher);
    expect(await anzahlNachrichten(id)).toBe(nachrichtenVorher);
    expect(aufrufe.refresh).toBe(0);
    alsPerson(anna);
  });

  it('angemeldet ohne zweiten Faktor: keinRecht, auch mit Verwaltungszugang', async () => {
    alsPerson(anna, false);
    const vorher = await anzahlUnterhaltungen();
    expect(await neueUnterhaltung({}, formular(gueltig()))).toEqual({ fehler: 'keinRecht' });
    expect(await anzahlUnterhaltungen()).toBe(vorher);
    alsPerson(anna);
  });

  it('angemeldet ohne Rolle: keinRecht und keine Unterhaltungen in der Liste', async () => {
    alsPerson(emil);
    const vorher = await anzahlUnterhaltungen();
    expect(await neueUnterhaltung({}, formular(gueltig()))).toEqual({ fehler: 'keinRecht' });
    expect(await anzahlUnterhaltungen()).toBe(vorher);
    expect(await ladeUnterhaltungen(emil.id)).toEqual([]);
    alsPerson(anna);
  });

  it('jede Rolle mit Verwaltungszugang darf das Postfach nutzen (Organisationsredaktion und Bildung)', async () => {
    alsPerson(clara);
    const vonClara = await neu(gueltig({ betreff: 'Organisationsredaktion schreibt', empfaenger: [anna.id] }));
    expect(await ladeUnterhaltung(vonClara, clara.id)).not.toBeNull();
    alsPerson(bernd);
    const vonBernd = await neu(gueltig({ betreff: 'Bildung schreibt', empfaenger: [anna.id] }));
    expect(await ladeUnterhaltung(vonBernd, bernd.id)).not.toBeNull();
    alsPerson(anna);
  });
});

describe('Verwaltung › Postfach › Empfängerauswahl', () => {
  it('zur Auswahl stehen Konten mit Verwaltungszugang und zweitem Faktor, nicht die eigene Person', async () => {
    const empfaenger = await ladeEmpfaenger(anna.id);
    const ids = empfaenger.map((e) => e.id);
    expect(ids).toContain(bernd.id);
    expect(ids).toContain(clara.id);
    expect(ids).not.toContain(anna.id);
    expect(ids).not.toContain(dora.id);
    expect(ids).not.toContain(emil.id);
    const mitGt = empfaenger.find((e) => e.id === clara.id);
    expect(mitGt?.rollen).toEqual([{ rolle: 'organisationsredaktion', organisation: 'gt' }]);
  });
});

describe('Verwaltung › Postfach › Neue Unterhaltung: Prüfung', () => {
  it('leerer Betreff liefert pflicht und legt nichts an', async () => {
    const vorher = await anzahlUnterhaltungen();
    expect(await neueUnterhaltung({}, formular(gueltig({ betreff: '   ' })))).toMatchObject({
      fehler: 'pruefen',
      feldFehler: { betreff: 'pflicht' },
      werte: { betreff: '   ' },
    });
    expect(await anzahlUnterhaltungen()).toBe(vorher);
  });

  it('Betreff mit 151 Zeichen liefert zuLang', async () => {
    expect(await neueUnterhaltung({}, formular(gueltig({ betreff: 'b'.repeat(151) })))).toMatchObject({
      fehler: 'pruefen',
      feldFehler: { betreff: 'zuLang' },
    });
  });

  it('ohne Empfänger liefert empfaengerFehlt', async () => {
    expect(await neueUnterhaltung({}, formular(gueltig({ empfaenger: [] })))).toMatchObject({
      fehler: 'pruefen',
      feldFehler: { empfaenger: 'empfaengerFehlt' },
    });
  });

  it('die eigene Person als Empfänger wird abgelehnt', async () => {
    const vorher = await anzahlUnterhaltungen();
    expect(await neueUnterhaltung({}, formular(gueltig({ empfaenger: [anna.id] })))).toMatchObject({
      fehler: 'pruefen',
      feldFehler: { empfaenger: 'empfaengerUngueltig' },
    });
    expect(await anzahlUnterhaltungen()).toBe(vorher);
  });

  it('Konten ohne Verwaltungszugang oder ohne zweiten Faktor werden abgelehnt', async () => {
    expect(await neueUnterhaltung({}, formular(gueltig({ empfaenger: [bernd.id, emil.id] })))).toMatchObject({
      fehler: 'pruefen',
      feldFehler: { empfaenger: 'empfaengerUngueltig' },
    });
    expect(await neueUnterhaltung({}, formular(gueltig({ empfaenger: [dora.id] })))).toMatchObject({
      fehler: 'pruefen',
      feldFehler: { empfaenger: 'empfaengerUngueltig' },
    });
  });

  it('Text aus Leerzeichen liefert pflicht', async () => {
    expect(await neueUnterhaltung({}, formular(gueltig({ text: ' \n  ' })))).toMatchObject({
      fehler: 'pruefen',
      feldFehler: { text: 'pflicht' },
    });
  });

  it('Text mit 5001 Zeichen liefert zuLang, genau 5000 Zeichen werden angelegt', async () => {
    expect(await neueUnterhaltung({}, formular(gueltig({ text: 'x'.repeat(5001) })))).toMatchObject({
      fehler: 'pruefen',
      feldFehler: { text: 'zuLang' },
    });
    const id = await neu(gueltig({ betreff: 'Genau 5000 Zeichen', text: 'x'.repeat(5000) }));
    expect((await ladeUnterhaltung(id, anna.id))?.nachrichten[0]?.text).toHaveLength(5000);
  });

  it('Steuerzeichen im Text liefern steuerzeichen', async () => {
    expect(await neueUnterhaltung({}, formular(gueltig({ text: 'a\u0007b' })))).toMatchObject({
      fehler: 'pruefen',
      feldFehler: { text: 'steuerzeichen' },
    });
  });

  it('mehr als 50 Empfänger liefern zuLang', async () => {
    expect(await neueUnterhaltung({}, formular(gueltig({ empfaenger: Array(51).fill(bernd.id) as string[] })))).toMatchObject({
      fehler: 'pruefen',
      feldFehler: { empfaenger: 'zuLang' },
    });
  });
});

describe('Verwaltung › Postfach › Neue Unterhaltung: Anlegen', () => {
  it('legt Unterhaltung, Teilnahmen und Nachricht an; der Absender hat gelesen, der Empfänger noch nicht', async () => {
    const id = await neu(gueltig({ betreff: 'Anlegen Eins', text: 'Hallo\r\nzweite Zeile  ' }));
    expect((await teilnahme(id, anna.id))?.gelesenBis).toBeInstanceOf(Date);
    expect((await teilnahme(id, bernd.id))?.gelesenBis).toBeNull();
    const [nachricht] = await db.select().from(schema.postfachNachricht).where(eq(schema.postfachNachricht.unterhaltungId, id));
    expect(nachricht?.text).toBe('Hallo\nzweite Zeile');
    expect(nachricht?.absenderId).toBe(anna.id);
  });

  it('Auditeintrag nennt die Anzahl der Empfänger, nicht Betreff oder Text', async () => {
    const id = await neu(gueltig({ betreff: 'Audit Betreff geheim', text: 'Audit Text geheim' }));
    const eintraege = await auditZu(id);
    expect(eintraege.map((e) => e.aktion)).toEqual(['postfach.gesendet']);
    expect(eintraege[0]).toMatchObject({ benutzerId: anna.id, zielTyp: 'unterhaltung', zielId: id, details: { anzahlEmpfaenger: 1 } });
    const text = JSON.stringify(eintraege);
    expect(text).not.toContain('Audit Betreff geheim');
    expect(text).not.toContain('Audit Text geheim');
  });

  it('doppelte Empfänger zählen einmal', async () => {
    const id = await neu(gueltig({ betreff: 'Doppelt', empfaenger: [bernd.id, bernd.id, clara.id] }));
    expect((await auditZu(id))[0]?.details).toMatchObject({ anzahlEmpfaenger: 2 });
    expect(await anzahlNachrichten(id)).toBe(1);
  });

  it('Text bleibt Klartext: HTML wird unverändert gespeichert', async () => {
    const text = '<b>fett</b> & "Zitat" <script>x</script>';
    const id = await neu(gueltig({ betreff: 'Klartext', text }));
    expect((await ladeUnterhaltung(id, anna.id))?.nachrichten[0]?.text).toBe(text);
  });
});

describe('Verwaltung › Postfach › Ungelesen, Zähler und Gelesen-Markierung', () => {
  it('eine neue Nachricht ist für den Empfänger ungelesen, für den Absender nicht', async () => {
    alsPerson(anna);
    const berndVorher = await ungelesenFuer(bernd);
    const annaVorher = await ungelesenFuer(anna);
    const id = await neu(gueltig({ betreff: 'Zähler Eins', text: 'Hinweis für B' }));
    expect(await ungelesenFuer(bernd)).toBe(berndVorher + 1);
    expect(await ungelesenFuer(anna)).toBe(annaVorher);
    alsPerson(bernd);
    expect((await ladeUnterhaltungen(bernd.id)).find((z) => z.id === id)?.ungelesen).toBe(1);
    alsPerson(anna);
  });

  it('Öffnen markiert als gelesen: Zähler sinkt, Seite wird neu geladen, eine zweite Markierung ändert nichts', async () => {
    alsPerson(anna);
    const id = await neu(gueltig({ betreff: 'Gelesen Eins', text: 'Bitte lesen' }));
    const vorher = await ungelesenFuer(bernd);
    alsPerson(bernd);
    await markiereGelesen(id);
    expect(aufrufe.refresh).toBe(1);
    expect(await ungelesenFuer(bernd)).toBe(vorher - 1);
    expect((await ladeUnterhaltung(id, bernd.id))?.ungelesen).toBe(0);
    await markiereGelesen(id);
    expect(aufrufe.refresh).toBe(1);
    alsPerson(anna);
  });

  it('Markieren ohne ungelesene Nachrichten schreibt nichts und lädt nicht neu', async () => {
    alsPerson(anna);
    const id = await neu(gueltig({ betreff: 'Eigene Nachricht', text: 'Nur von mir' }));
    const vorher = await teilnahme(id, anna.id);
    await markiereGelesen(id);
    expect(aufrufe.refresh).toBe(0);
    expect((await teilnahme(id, anna.id))?.gelesenBis).toEqual(vorher?.gelesenBis);
  });
});

describe('Verwaltung › Postfach › Antworten', () => {
  it('die Gegenseite antwortet: Absender sieht die Antwort ungelesen, Unterhaltung rückt nach oben', async () => {
    alsPerson(anna);
    const id = await neu(gueltig({ betreff: 'Antwort Eins', text: 'Frage an B' }));
    alsPerson(bernd);
    const ergebnis = await antworten({}, formular({ unterhaltungId: id, text: 'Antwort von B' }));
    expect(ergebnis).toEqual({ gesendet: expect.any(Number) });
    expect(aufrufe.refresh).toBe(1);
    expect((await ladeUnterhaltung(id, anna.id))?.ungelesen).toBe(1);
    expect((await ladeUnterhaltung(id, bernd.id))?.ungelesen).toBe(0);
    alsPerson(anna);
    expect((await ladeUnterhaltungen(anna.id))[0]?.id).toBe(id);
    expect((await auditZu(id)).at(-1)).toMatchObject({ benutzerId: bernd.id, aktion: 'postfach.gesendet', details: { antwort: true } });
  });

  it('eine leere Antwort liefert pruefen und legt keine Nachricht an', async () => {
    alsPerson(anna);
    const id = await neu(gueltig({ betreff: 'Leere Antwort', text: 'Ausgangsnachricht' }));
    alsPerson(bernd);
    const vorher = await anzahlNachrichten(id);
    expect(await antworten({}, formular({ unterhaltungId: id, text: '  ' }))).toMatchObject({
      fehler: 'pruefen',
      feldFehler: { text: 'pflicht' },
    });
    expect(await anzahlNachrichten(id)).toBe(vorher);
    alsPerson(anna);
  });

  it('eine Antwort mit 5001 Zeichen liefert zuLang', async () => {
    alsPerson(anna);
    const id = await neu(gueltig({ betreff: 'Zu lange Antwort', text: 'Kurz' }));
    alsPerson(bernd);
    expect(await antworten({}, formular({ unterhaltungId: id, text: 'y'.repeat(5001) }))).toMatchObject({
      fehler: 'pruefen',
      feldFehler: { text: 'zuLang' },
    });
    alsPerson(anna);
  });
});

describe('Verwaltung › Postfach › Nur Teilnehmende', () => {
  it('eine fremde Person sieht die Unterhaltung nicht, kann nicht antworten und nicht markieren', async () => {
    alsPerson(anna);
    const id = await neu(gueltig({ betreff: 'Nur Teilnehmer', text: 'Vertraulich' }));
    const bVorher = (await ladeUnterhaltung(id, bernd.id))?.ungelesen;
    const nachrichtenVorher = await anzahlNachrichten(id);
    alsPerson(clara);
    expect(await ladeUnterhaltung(id, clara.id)).toBeNull();
    expect((await ladeUnterhaltungen(clara.id)).map((z) => z.id)).not.toContain(id);
    expect(await antworten({}, formular({ unterhaltungId: id, text: 'Ich bin nicht dabei' }))).toEqual({ fehler: 'nichtGefunden' });
    expect(await anzahlNachrichten(id)).toBe(nachrichtenVorher);
    await markiereGelesen(id);
    expect(aufrufe.refresh).toBe(0);
    expect(await istTeilnehmer(id, clara.id)).toBe(false);
    alsPerson(bernd);
    expect((await ladeUnterhaltung(id, bernd.id))?.ungelesen).toBe(bVorher);
    alsPerson(anna);
  });

  it('eine ungültige ID ist nicht gefunden', async () => {
    alsPerson(anna);
    expect(await ladeUnterhaltung('kein-uuid', anna.id)).toBeNull();
    expect(await antworten({}, formular({ unterhaltungId: 'kein-uuid', text: 'Test' }))).toEqual({ fehler: 'nichtGefunden' });
  });
});

describe('Verwaltung › Postfach › Audit ohne Personendaten im Text', () => {
  it('alle Postfach-Auditeinträge tragen nur Zähler oder das Kennzeichen antwort', async () => {
    const eintraege = await db.select().from(schema.auditEintrag).where(eq(schema.auditEintrag.aktion, 'postfach.gesendet'));
    expect(eintraege.length).toBeGreaterThan(0);
    for (const e of eintraege) {
      expect(e.benutzerId).not.toBeNull();
      expect(e.zielTyp).toBe('unterhaltung');
      const details = (e.details ?? {}) as Record<string, unknown>;
      expect(Object.keys(details).every((k) => k === 'anzahlEmpfaenger' || k === 'antwort')).toBe(true);
      expect(Object.values(details).every((wert) => typeof wert !== 'string')).toBe(true);
    }
  });
});
