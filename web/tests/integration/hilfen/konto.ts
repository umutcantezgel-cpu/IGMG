import { vi } from 'vitest';
import { testDatenbank } from './db';

/**
 * Prüfumgebung für die Gemeinde-Konten (ADR 0026) mit ECHTEM Better Auth (Passwort-Hash, Benutzername-Plugin,
 * Sitzungen in der Datenbank) auf einer frischen PGlite-Datenbank. Ersetzt nur die Next.js-Laufzeit (Header, after,
 * redirect, notFound, Cache). Better Auth setzt Cookies hier nicht (kein Request-Kontext von Next.js): Erfolgreiche
 * Anmeldungen zeigen sich als Sitzung in der Datenbank; für Seiten und Actions mit Sitzung setzt `alsSitzung()` die
 * Antwort von `auth.api.getSession`.
 * Verwendung: zuerst `await kontoUmgebung()`, danach Actions per `await import(...)` laden.
 */
export const nachher: (() => unknown)[] = [];

vi.mock('next/cache', () => ({
  updateTag: () => undefined,
  revalidateTag: () => undefined,
  refresh: () => undefined,
  cacheTag: () => undefined,
  cacheLife: () => undefined,
}));
vi.mock('next/server', () => ({
  after: (f: () => unknown) => nachher.push(f),
  connection: async () => undefined,
}));
vi.mock('next/headers', () => ({
  headers: async () => new Headers({ 'next-action': 'test', 'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) Chrome/140.0 Safari/537.36' }),
  cookies: async () => ({ get: () => undefined, set: () => undefined, delete: () => undefined }),
}));
vi.mock('next/navigation', () => ({
  redirect: (ziel: string) => {
    throw Object.assign(new Error(`NEXT_REDIRECT:${ziel}`), { ziel });
  },
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND');
  },
}));

export async function kontoUmgebung() {
  const { client, db } = await testDatenbank();
  (globalThis as unknown as { __igmgDb?: unknown }).__igmgDb = db;
  return { client, db };
}

/** Formulardaten aus einem Objekt. */
export function formular(werte: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(werte)) fd.append(k, v);
  return fd;
}

/** Ziel einer `redirect()`-Ausnahme (oder null, wenn etwas anderes geworfen wurde). */
export async function umleitung(aufruf: Promise<unknown>): Promise<string | null> {
  try {
    await aufruf;
  } catch (e) {
    return (e as { ziel?: string }).ziel ?? null;
  }
  return null;
}

/** Alle nach der Antwort geplanten Arbeiten ausführen (after()). */
export async function nachDerAntwort(): Promise<void> {
  const arbeiten = nachher.splice(0);
  for (const f of arbeiten) await f();
}
