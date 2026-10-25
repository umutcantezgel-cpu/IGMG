import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { schema } from '@/lib/db';
import { darf, type RollenZuweisung } from '@/lib/rechte/matrix';
import { kontoUmgebung, nachher, umleitung } from './hilfen/konto';

/**
 * Stufe C N2 (Z-L02, Befund der Gegenprüfung `C-religion-gegen.md` §1 Nr. 2) gegen PGlite mit echtem Better Auth: Die Rolle
 * „religiöse Prüfung“ ist Schutzrolle. Die Administration gibt sie sich weder selbst noch einem Zweitkonto wirksam – nie
 * zusammen mit Administration, nie an sich selbst, Vergabe nur per Antrag und Bestätigung durch eine zweite Person (Leitung
 * oder Kinderschutz, ohne Administration) –, auch nicht über eine Einladung. Testdaten fiktiv (G-04).
 */
const { client, db } = await kontoUmgebung();
const { auth } = await import('@/lib/auth/server');
const benutzer = await import('@/server/actions/benutzer');
const anmeldung = await import('@/server/actions/anmeldung');
const schutzrollen = await import('@/lib/rechte/schutzrollen');
afterAll(() => client.close());

const api = auth.api as unknown as Record<string, unknown>;
const echteSitzung = api.getSession;
afterEach(() => {
  api.getSession = echteSitzung;
  nachher.length = 0;
});

const PASSWORT = 'Ein-langes-Testpasswort-2026';
type Person = { id: string; name: string; email: string; twoFactorEnabled: boolean };

async function person(name: string, verwaltung: RollenZuweisung[] = []): Promise<Person> {
  const email = `${randomUUID().slice(0, 8)}@example.test`;
  const r = await auth.api.signUpEmail({ body: { email, password: PASSWORT, name } });
  const zweiFaktor = verwaltung.length > 0;
  await db.update(schema.user).set({ emailVerified: true, twoFactorEnabled: zweiFaktor }).where(eq(schema.user.id, r.user.id));
  await db.insert(schema.kontoProfil).values({ benutzerId: r.user.id, anzeigename: name, istKind: false });
  if (verwaltung.length)
    await db.insert(schema.rolleZuweisung).values(verwaltung.map((z) => ({ benutzerId: r.user.id, rolle: z.rolle, organisation: null })));
  return { id: r.user.id, name, email, twoFactorEnabled: zweiFaktor };
}

function formular(werte: Record<string, string | string[]>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(werte)) for (const x of Array.isArray(v) ? v : [v]) fd.append(k, x);
  return fd;
}

function als(p: Person) {
  api.getSession = async () => ({ user: { ...p, gesperrtAm: null }, session: { id: `s-${p.id}`, createdAt: new Date(), userId: p.id } });
}

const rollenVon = async (id: string) =>
  (await db.select({ rolle: schema.rolleZuweisung.rolle }).from(schema.rolleZuweisung).where(eq(schema.rolleZuweisung.benutzerId, id)))
    .map((z) => z.rolle)
    .sort();
const antraegeVon = (id: string) => db.select().from(schema.rollenAntrag).where(eq(schema.rollenAntrag.benutzerId, id));

let admin: Person;
let leitung: Person;
beforeAll(async () => {
  admin = await person('Testperson Administration', [{ rolle: 'administration' }]);
  leitung = await person('Testperson Vorstand', [{ rolle: 'leitung' }]);
});

describe('Rolle religiöse Prüfung: Vier-Augen-Prinzip bei der Vergabe', () => {
  it('reine Regel: nie zusammen mit Administration, nie an sich selbst', () => {
    const rp = [{ rolle: 'religioese_pruefung' }];
    expect(schutzrollen.schutzrollenRegel([], [...rp, { rolle: 'administration' }], false)).toBe('religioesePruefungAdministration');
    expect(schutzrollen.schutzrollenRegel([], rp, true)).toBe('religioesePruefungSelbst');
    expect(schutzrollen.schutzrollenRegel(rp, rp, true)).toBeNull();
    expect(schutzrollen.schutzrollenRegel([], rp, false)).toBeNull();
    expect(schutzrollen.istSchutzrolle('religioese_pruefung')).toBe(true);
  });

  it('Administration gibt sich die Rolle selbst → abgewiesen, nichts beantragt', async () => {
    als(admin);
    expect(await benutzer.rollenSpeichern({}, formular({ id: admin.id, rollen: ['administration', 'religioese_pruefung'] }))).toMatchObject(
      {
        fehler: 'religioesePruefungAdministration',
      },
    );
    expect(await rollenVon(admin.id)).toEqual(['administration']);
    expect(await antraegeVon(admin.id)).toHaveLength(0);
    // ein Konto mit beiden Rollen gibt es auch für andere nicht
    const zweit = await person('Zweitkonto Beide');
    expect(await benutzer.rollenSpeichern({}, formular({ id: zweit.id, rollen: ['administration', 'religioese_pruefung'] }))).toMatchObject(
      {
        fehler: 'religioesePruefungAdministration',
      },
    );
    expect(await rollenVon(zweit.id)).toEqual([]);
  });

  it('Administration gibt sie einem Zweitkonto → nur beantragt; wirksam erst nach Bestätigung durch die Leitung', async () => {
    const zweit = await person('Zweitkonto Pruefung');
    als(admin);
    expect(await benutzer.rollenSpeichern({}, formular({ id: zweit.id, rollen: ['religioese_pruefung'] }))).toEqual({
      ok: true,
      beantragt: ['religioese_pruefung'],
    });
    expect(await rollenVon(zweit.id)).toEqual([]);
    expect(darf([], 'lernapp.religioes.pruefen')).toBe(false);
    const [antrag] = await antraegeVon(zweit.id);
    expect(antrag).toMatchObject({ rolle: 'religioese_pruefung', art: 'vergabe', beantragtVon: admin.id });
    // weder die Administration noch die betroffene Person entscheiden
    expect(await schutzrollen.entscheideAntrag({ benutzerId: admin.id, rollen: [{ rolle: 'administration' }] }, antrag!.id, true)).toBe(
      'keinRecht',
    );
    expect(await schutzrollen.entscheideAntrag({ benutzerId: zweit.id, rollen: [{ rolle: 'leitung' }] }, antrag!.id, true)).toBe(
      'keinRecht',
    );
    // die Leitung bestätigt über die Action
    als(leitung);
    expect(
      await umleitung(
        benutzer.rollenAntragEntscheiden(
          formular({ id: antrag!.id, entscheidung: 'bestaetigen', zurueck: '/verwaltung/gemeinde-im-blick' }),
        ),
      ),
    ).toContain('rollenantrag=bestaetigt');
    expect(await rollenVon(zweit.id)).toEqual(['religioese_pruefung']);
    expect(darf([{ rolle: 'religioese_pruefung' }], 'lernapp.religioes.pruefen')).toBe(true);
  });

  it('auch ohne Leitung im Bestand keine Start-Ausnahme: die Rolle wartet auf eine zweite Person', async () => {
    const neu = await person('Ohne Leitung');
    als(admin);
    await db.delete(schema.einstellung).where(eq(schema.einstellung.schluessel, schutzrollen.START_MERKER));
    await db.delete(schema.rolleZuweisung).where(eq(schema.rolleZuweisung.rolle, 'leitung'));
    expect(await schutzrollen.schutzrollenGestartet()).toBe(false);
    expect(await benutzer.rollenSpeichern({}, formular({ id: neu.id, rollen: ['religioese_pruefung'] }))).toEqual({
      ok: true,
      beantragt: ['religioese_pruefung'],
    });
    expect(await rollenVon(neu.id)).toEqual([]);
    // der Start-Merker bleibt unberührt (nur die erste Leitung beendet den Start)
    expect(await schutzrollen.schutzrollenGestartet()).toBe(false);
    await db.insert(schema.rolleZuweisung).values({ benutzerId: leitung.id, rolle: 'leitung' });
  });

  it('per Einladung an eine Zweitadresse: nach der Annahme nicht wirksam, nur beantragt', async () => {
    const email = `${randomUUID().slice(0, 8)}@example.test`;
    als(admin);
    expect(
      await benutzer.einladen(
        {},
        formular({ email, name: 'Zweitadresse', gueltigTage: '7', rollen: ['religioese_pruefung', 'administration'] }),
      ),
    ).toMatchObject({ fehler: 'religioesePruefungAdministration' });
    const e = await benutzer.einladen({}, formular({ email, name: 'Zweitadresse', gueltigTage: '7', rollen: ['religioese_pruefung'] }));
    expect(e.ok).toBe(true);
    api.getSession = echteSitzung;
    const token = e.link!.split('/').at(-1)!;
    await umleitung(anmeldung.einladungAnnehmen({}, formular({ token, passwort: PASSWORT, wiederholung: PASSWORT })));
    const [neu] = await db.select().from(schema.user).where(eq(schema.user.email, email));
    expect(await rollenVon(neu!.id)).toEqual([]);
    expect(await antraegeVon(neu!.id)).toEqual([
      expect.objectContaining({ rolle: 'religioese_pruefung', art: 'vergabe', beantragtVon: admin.id }),
    ]);
  });

  it('Antrag bestätigen scheitert, wenn das Konto inzwischen Administration hat', async () => {
    const ziel = await person('Kandidat Spaeter Admin');
    als(admin);
    await benutzer.rollenSpeichern({}, formular({ id: ziel.id, rollen: ['religioese_pruefung'] }));
    const [antrag] = await antraegeVon(ziel.id);
    await db.insert(schema.rolleZuweisung).values({ benutzerId: ziel.id, rolle: 'administration' });
    expect(await schutzrollen.entscheideAntrag({ benutzerId: leitung.id, rollen: [{ rolle: 'leitung' }] }, antrag!.id, true)).toBe(
      'administration',
    );
    expect(await rollenVon(ziel.id)).toEqual(['administration']);
  });
});
