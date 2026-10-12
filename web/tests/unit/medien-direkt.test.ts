import { afterEach, describe, expect, it, vi } from 'vitest';
import { DIREKT_MAX_BYTES, istEingangsSchluessel, neuerEingangsSchluessel } from '@/lib/medien/direkt';
import { MAX_BYTES } from '@/lib/medien/verarbeiten';

/** Direkt-Upload großer PDF-Dateien (ADR 0020, V-05): Eingangsschlüssel, Größengrenze und CSP der Verwaltung. */
describe('Eingangsschlüssel', () => {
  it('nimmt nur eingang/<uuid>.pdf an', () => {
    expect(istEingangsSchluessel(neuerEingangsSchluessel())).toBe(true);
    expect(istEingangsSchluessel('eingang/3f2b1c0a-1d2e-4f5a-8b9c-0d1e2f3a4b5c.pdf')).toBe(true);
    for (const falsch of [
      'eingang/3F2B1C0A-1D2E-4F5A-8B9C-0D1E2F3A4B5C.pdf',
      'eingang/../geheim.pdf',
      'medien/3f2b1c0a-1d2e-4f5a-8b9c-0d1e2f3a4b5c.pdf',
      'eingang/3f2b1c0a-1d2e-4f5a-8b9c-0d1e2f3a4b5c.jpg',
      'eingang/3f2b1c0a-1d2e-4f5a-8b9c-0d1e2f3a4b5c.pdf/x',
      '',
      null,
      42,
    ])
      expect(istEingangsSchluessel(falsch)).toBe(false);
  });

  it('Größengrenze gleich der Pipeline (10 MB)', () => {
    expect(DIREKT_MAX_BYTES).toBe(MAX_BYTES);
  });
});

describe('CSP der Verwaltung', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('erlaubt die Blob-Schnittstelle nur mit SPEICHER=blob und nur in der Verwaltung', async () => {
    const { cspOeffentlich, cspVerwaltung } = await import('@/lib/sicherheit/header');
    vi.stubEnv('SPEICHER', 'blob');
    expect(cspVerwaltung('n')).toContain("connect-src 'self' https://vercel.com");
    expect(cspOeffentlich()).toContain("connect-src 'self';");
    vi.stubEnv('SPEICHER', 's3');
    expect(cspVerwaltung('n')).toContain("connect-src 'self';");
  });
});
