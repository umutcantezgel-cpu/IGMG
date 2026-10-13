import { randomUUID } from 'node:crypto';
import { vi } from 'vitest';
import { schema } from '@/lib/db';
import type { RollenZuweisung } from '@/lib/rechte/matrix';
import { testDatenbank } from './db';

/**
 * Prüfumgebung für Server Actions der Verwaltung (T3): frische PGlite-Datenbank, simulierte Sitzung mit
 * wählbaren Rollen und Ersatz für die Next.js-Laufzeit (Cache, Header, after, redirect).
 * Verwendung: zuerst `await verwaltungsUmgebung()`, danach die Action per `await import(...)` laden.
 */
export const aufrufe = {
  updateTag: [] as string[],
  revalidateTag: [] as string[],
  refresh: 0,
  nachher: [] as (() => unknown)[],
};

let sitzung: {
  user: { id: string; name: string; email: string; twoFactorEnabled: boolean };
  session: { id: string; createdAt: Date };
} | null = null;

vi.mock('next/cache', () => ({
  updateTag: (t: string) => aufrufe.updateTag.push(t),
  revalidateTag: (t: string) => aufrufe.revalidateTag.push(t),
  refresh: () => {
    aufrufe.refresh++;
  },
  cacheTag: () => undefined,
  cacheLife: () => undefined,
}));
vi.mock('next/server', () => ({
  after: (f: () => unknown) => aufrufe.nachher.push(f),
  connection: async () => undefined,
}));
// Formular-Actions prüfen den Next-Action-Header (Absenden mit JavaScript, zurueckOhneSkript)
vi.mock('next/headers', () => ({
  headers: async () => new Headers({ 'next-action': 'test' }),
  cookies: async () => ({ get: () => undefined }),
}));
vi.mock('next/navigation', () => ({
  redirect: (ziel: string) => {
    throw Object.assign(new Error(`NEXT_REDIRECT:${ziel}`), { ziel });
  },
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND');
  },
}));
vi.mock('@/lib/auth/server', () => ({ auth: { api: { getSession: async () => sitzung } } }));

/** Frische Datenbank anlegen und als App-Datenbank einsetzen (`@/lib/db` nutzt sie über globalThis). */
export async function verwaltungsUmgebung() {
  const { client, db } = await testDatenbank();
  (globalThis as unknown as { __igmgDb?: unknown }).__igmgDb = db;
  return { client, db };
}

/**
 * Meldet eine Testperson mit diesen Rollen an (G-04: fiktive Daten). `zweiFaktor: false` simuliert eine Sitzung
 * ohne eingerichteten zweiten Faktor. `null` = abgemeldet.
 */
export async function angemeldetAls(rollen: RollenZuweisung[] | null, zweiFaktor = true): Promise<string | null> {
  aufrufe.updateTag.length = 0;
  aufrufe.revalidateTag.length = 0;
  aufrufe.refresh = 0;
  aufrufe.nachher.length = 0;
  if (rollen === null) {
    sitzung = null;
    return null;
  }
  const db = (globalThis as unknown as { __igmgDb: typeof import('@/lib/db').db }).__igmgDb;
  const id = randomUUID();
  await db.insert(schema.user).values({
    id,
    name: 'Testperson Eins',
    email: `testperson.${id.slice(0, 8)}@example.test`,
    emailVerified: true,
    twoFactorEnabled: zweiFaktor,
  });
  if (rollen.length)
    await db
      .insert(schema.rolleZuweisung)
      .values(rollen.map((r) => ({ benutzerId: id, rolle: r.rolle, organisation: r.organisation ?? null })));
  sitzung = {
    user: { id, name: 'Testperson Eins', email: `testperson.${id.slice(0, 8)}@example.test`, twoFactorEnabled: zweiFaktor },
    // Wie Better Auth: Sitzung mit Anmeldezeitpunkt (absolute Grenzen je Kontoart, ADR Kontoarten)
    session: { id: `sitzung-${id}`, createdAt: new Date() },
  };
  return id;
}

/** Formulardaten aus einem Objekt (Listen als Mehrfachfelder). */
export function formular(werte: Record<string, string | string[]>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(werte)) for (const x of Array.isArray(v) ? v : [v]) fd.append(k, x);
  return fd;
}
