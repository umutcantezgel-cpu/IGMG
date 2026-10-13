import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { schema } from '@/lib/db';
import { verwaltungsUmgebung } from './hilfen/verwaltung';

/** Gemeinsame Hatim (B-19): eindeutige Übernahme je Cüz, Grenze je Person, Abschluss nach 30 gelesenen Cüz. */
const { client, db } = await verwaltungsUmgebung();
const hatim = await import('@/lib/hatim/dienst');
afterAll(() => client.close());

const personen: string[] = [];
let id: string;

beforeAll(async () => {
  for (let i = 0; i < 12; i++) {
    const p = randomUUID();
    await db.insert(schema.user).values({ id: p, name: `Person ${i}`, email: `${p.slice(0, 8)}@example.test`, emailVerified: true });
    personen.push(p);
  }
  id = await hatim.legeHatimAn({ titel: { de: 'Hatim zum Ramadan' }, beginn: '2026-10-13' }, personen[0]);
});

describe('Hatim', () => {
  it('Entwurf ist nicht öffentlich und nimmt keine Übernahmen an', async () => {
    expect(await hatim.ladeHatim(id)).toBeNull();
    expect(await hatim.uebernehmeCuz(id, 1, personen[1])).toBe('geschlossen');
    await db.update(schema.hatim).set({ oeffentlich: 'veroeffentlicht' }).where(eq(schema.hatim.id, id));
    expect((await hatim.ladeHatim(id))?.teile).toHaveLength(30);
  });

  it('gleichzeitige Übernahme desselben Cüz: genau einer gewinnt', async () => {
    const ergebnisse = await Promise.all(personen.slice(1, 6).map((p) => hatim.uebernehmeCuz(id, 5, p)));
    expect(ergebnisse.filter((e) => e === 'ok')).toHaveLength(1);
    expect(ergebnisse.filter((e) => e === 'vergeben')).toHaveLength(4);
  });

  it('höchstens drei offene Cüz je Person', async () => {
    const p = personen[7];
    expect(await hatim.uebernehmeCuz(id, 10, p)).toBe('ok');
    expect(await hatim.uebernehmeCuz(id, 11, p)).toBe('ok');
    expect(await hatim.uebernehmeCuz(id, 12, p)).toBe('ok');
    expect(await hatim.uebernehmeCuz(id, 13, p)).toBe('grenze');
    expect(await hatim.gebeZurueck(id, 12, p)).toBe(true);
    expect(await hatim.gebeZurueck(id, 12, personen[8])).toBe(false);
  });

  it('öffentlich nur Zahlen, keine Namen; nach 30 gelesenen Cüz abgeschlossen', async () => {
    const h = (await hatim.ladeHatim(id))!;
    expect(JSON.stringify(h)).not.toContain('Person');
    expect(h.vergeben).toBe(3);
    for (let cuz = 1; cuz <= 30; cuz++) {
      const [t] = await db.select().from(schema.hatimTeil).where(eq(schema.hatimTeil.cuz, cuz));
      const p = t.benutzerId ?? personen[(cuz % 10) + 1];
      if (!t.benutzerId) {
        await db.update(schema.hatimTeil).set({ benutzerId: p }).where(eq(schema.hatimTeil.cuz, cuz));
      }
      expect(await hatim.markiereGelesen(id, cuz, p)).toBe(true);
    }
    const fertig = (await hatim.ladeHatim(id))!;
    expect(fertig.gelesen).toBe(30);
    expect(fertig.status).toBe('abgeschlossen');
  });
});
