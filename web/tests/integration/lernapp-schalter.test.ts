import { isValidElement, type ReactNode } from 'react';
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';
import { ServiceWorkerAnmeldung } from '@/components/lernapp/ServiceWorkerAnmeldung';
import { verwaltungsUmgebung } from './hilfen/verwaltung';

/**
 * Schalter `lernapp` aus heißt 404 (ADR 0035, Gegenprüfung L1): Das Wurzel-Layout meldet dann keinen Service Worker an und
 * verlinkt kein Manifest; die Manifest-Route antwortet 404. Eingeschaltet bleibt alles wie gehabt.
 */
vi.mock('next/root-params', () => ({ ui: async () => 'de', locale: async () => undefined }));
vi.mock('next/font/local', () => ({ default: () => ({ variable: 'schrift-variable', className: 'schrift-klasse' }) }));

const { client } = await verwaltungsUmgebung();
const layout = await import('@/app/lern-app/[ui]/layout');
const manifest = await import('@/app/lern-app/[ui]/manifest.webmanifest/route');
afterAll(() => client.close());
afterEach(() => {
  delete process.env.FUNKTION_LERNAPP;
});

/** Kommt die Komponente irgendwo im Baum vor? */
function enthaelt(knoten: ReactNode, komponente: unknown): boolean {
  if (Array.isArray(knoten)) return knoten.some((k) => enthaelt(k, komponente));
  if (!isValidElement(knoten)) return false;
  if (knoten.type === komponente) return true;
  return enthaelt((knoten.props as { children?: ReactNode }).children, komponente);
}

const manifestAntwort = () =>
  manifest.GET(new Request('https://example.test/lern-app/de/manifest.webmanifest'), { params: Promise.resolve({ ui: 'de' }) } as never);

describe('Schalter lernapp im Wurzel-Layout und im Manifest', () => {
  it('an: Service Worker angemeldet, Manifest verlinkt und ausgeliefert', async () => {
    process.env.FUNKTION_LERNAPP = 'an';
    const baum = await layout.default({ children: null, params: Promise.resolve({ ui: 'de' }) } as never);
    expect(enthaelt(baum, ServiceWorkerAnmeldung)).toBe(true);
    expect((await layout.generateMetadata()).manifest).toBe('/lern-app/de/manifest.webmanifest');
    const r = await manifestAntwort();
    expect(r.status).toBe(200);
    expect(await r.json()).toMatchObject({ id: '/lern-app/', scope: '/lern-app/', lang: 'de' });
  });

  it('aus: kein Service Worker, kein Manifest-Link, Manifest 404 ohne Vorhalten', async () => {
    process.env.FUNKTION_LERNAPP = 'aus';
    const baum = await layout.default({ children: null, params: Promise.resolve({ ui: 'de' }) } as never);
    expect(enthaelt(baum, ServiceWorkerAnmeldung)).toBe(false);
    expect((await layout.generateMetadata()).manifest).toBeUndefined();
    const r = await manifestAntwort();
    expect(r.status).toBe(404);
    expect(r.headers.get('cache-control')).toBe('no-store');
  });
});
