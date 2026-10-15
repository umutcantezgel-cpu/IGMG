import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { schema } from '@/lib/db';
import { verschluessele } from '@/lib/krypto';
import { GRUPPEN_AKTIONEN } from '@/lib/rechte/gruppen';
import { KONTOARTEN, soll, ZIELE, type Kontoart, type ZielArt } from '../hilfen/gruppen-soll';
import { kontoUmgebung } from './hilfen/konto';

/**
 * Wahrheitstafel der Gruppenrechte über den ganzen Weg der Actions: `verlangeGruppenRecht` (Sitzung, zweiter Faktor,
 * Gruppenkontext aus der Datenbank, `darfInGruppe`) gegen die Soll-Tafel nach ADR 0026 (`tests/hilfen/gruppen-soll.ts`).
 * Kontoarten: Lehrkraft, Aufsicht, Schüler, Eltern, fremdes Gemeinde-Konto und zusätzlich Administration (Verwaltung hat
 * keine Gruppenrechte). Gruppen: eigene (aktiv), fremde (aktiv) und eine eigene, aber archivierte Gruppe (S2/S3: dort
 * nichts mehr). Testdaten fiktiv (G-04).
 */
const { client, db } = await kontoUmgebung();
const { auth } = await import('@/lib/auth/server');
const { verlangeGruppenRecht } = await import('@/lib/rechte/gemeinde');
afterAll(() => client.close());

const api = auth.api as unknown as Record<string, unknown>;
type Konto = { id: string; name: string; email: string; twoFactorEnabled: boolean };
type Art = Kontoart | 'administration';

function als(k: Konto) {
  api.getSession = async () => ({ user: { ...k, gesperrtAm: null }, session: { id: `s-${k.id}`, createdAt: new Date(), userId: k.id } });
}

async function konto(name: string, gemeinde: (typeof schema.gemeindeRolleEnum.enumValues)[number][], zweiFaktor = false, kind = false) {
  const id = randomUUID();
  const k: Konto = { id, name, email: `${id.slice(0, 8)}@${kind ? 'konto.invalid' : 'example.test'}`, twoFactorEnabled: zweiFaktor };
  await db.insert(schema.user).values({ ...k, emailVerified: true });
  await db.insert(schema.kontoProfil).values({ benutzerId: id, anzeigename: name, istKind: kind });
  if (gemeinde.length) await db.insert(schema.gemeindeRolle).values(gemeinde.map((rolle) => ({ benutzerId: id, rolle })));
  return k;
}

async function lernende(name: string, benutzerId: string | null): Promise<string> {
  const v = verschluessele({ name });
  const [z] = await db
    .insert(schema.lernende)
    .values({ benutzerId, datenVerschluesselt: v.daten, schluesselId: v.schluesselId, anzeigename: name, sechzehnAm: '2032-01-01' })
    .returning({ id: schema.lernende.id });
  return z.id;
}

const g = {} as Record<'eigen' | 'fremd' | 'archiv', string>;
const konten = {} as Record<Art, Konto>;
const l = {} as Record<'ich' | 'kind' | 'fremdesKind', string>;

beforeAll(async () => {
  for (const [schluessel, status] of [
    ['eigen', 'aktiv'],
    ['fremd', 'aktiv'],
    ['archiv', 'archiviert'],
  ] as const) {
    const [z] = await db
      .insert(schema.gruppe)
      .values({ name: { de: `Gruppe ${schluessel}` }, status })
      .returning({ id: schema.gruppe.id });
    g[schluessel] = z.id;
  }
  konten.lehrkraft = await konto('Hoca Tafel', ['lehrkraft'], true);
  konten.aufsicht = await konto('Aufsicht Tafel', ['lehrkraft'], true);
  konten.schueler = await konto('Schueler Tafel', ['schueler'], false, true);
  konten.eltern = await konto('Eltern Tafel', ['gemeinde', 'eltern']);
  konten.fremd = await konto('Fremd Tafel', ['gemeinde']);
  konten.administration = await konto('Admin Tafel', [], true);
  await db.insert(schema.rolleZuweisung).values({ benutzerId: konten.administration.id, rolle: 'administration' });
  const andere = await konto('Hoca Fremd', ['lehrkraft'], true);

  l.ich = await lernende('Schueler Tafel', konten.schueler.id);
  l.kind = await lernende('Kind Tafel', null);
  l.fremdesKind = await lernende('Fremdes Kind', null);
  await db.insert(schema.elternKind).values({ elternId: konten.eltern.id, lernendeId: l.kind, bestaetigtAm: new Date() });
  for (const gruppe of [g.eigen, g.archiv]) {
    await db.insert(schema.gruppenLeitung).values([
      { gruppeId: gruppe, benutzerId: konten.lehrkraft.id, rolle: 'lehrkraft' },
      { gruppeId: gruppe, benutzerId: konten.aufsicht.id, rolle: 'aufsicht' },
    ]);
    await db.insert(schema.gruppenMitglied).values([
      { gruppeId: gruppe, lernendeId: l.ich },
      { gruppeId: gruppe, lernendeId: l.kind },
      { gruppeId: gruppe, lernendeId: l.fremdesKind },
    ]);
  }
  await db.insert(schema.gruppenLeitung).values({ gruppeId: g.fremd, benutzerId: andere.id, rolle: 'lehrkraft' });
  await db.insert(schema.gruppenMitglied).values({ gruppeId: g.fremd, lernendeId: l.fremdesKind });
});

function zielFuer(art: Art, z: ZielArt): { lernendeId?: string } {
  if (z === 'ohne') return {};
  if (z === 'fremd') return { lernendeId: l.fremdesKind };
  return { lernendeId: art === 'eltern' ? l.kind : l.ich };
}

async function darf(art: Art, aktion: (typeof GRUPPEN_AKTIONEN)[number], gruppe: string, z: ZielArt): Promise<boolean> {
  als(konten[art]);
  try {
    await verlangeGruppenRecht(aktion, gruppe, zielFuer(art, z));
    return true;
  } catch (e) {
    if (e instanceof Error && e.message === 'KEIN_RECHT') return false;
    throw e;
  }
}

describe('verlangeGruppenRecht: Wahrheitstafel gegen ADR 0026 (Datenbank)', () => {
  it('6 Kontoarten × 14 Aktionen × 3 Gruppen × 3 Ziele: keine Abweichung', async () => {
    const arten: Art[] = [...KONTOARTEN, 'administration'];
    const abweichungen: string[] = [];
    let faelle = 0;
    for (const art of arten)
      for (const aktion of GRUPPEN_AKTIONEN)
        for (const [name, gruppe] of Object.entries(g))
          for (const z of ZIELE) {
            faelle++;
            const ist = await darf(art, aktion, gruppe, z);
            // Archivierte Gruppe: nichts (S2/S3); Administration: keine Gruppenrechte
            const erwartet = art !== 'administration' && name === 'eigen' && soll(art, aktion, true, z);
            if (ist !== erwartet) abweichungen.push(`${art} ${aktion} Gruppe ${name}, Ziel ${z}: ${ist}`);
          }
    expect(faelle).toBe(756);
    expect(abweichungen).toEqual([]);
  });

  it('Lehrkraft und Aufsicht ohne zweiten Faktor: keine Gruppenrechte', async () => {
    for (const art of ['lehrkraft', 'aufsicht'] as const) {
      const ohne = { ...konten[art], twoFactorEnabled: false };
      als(ohne);
      await expect(verlangeGruppenRecht('gruppe.sehen', g.eigen)).rejects.toThrow('KEIN_RECHT');
    }
  });
});
