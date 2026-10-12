import { afterEach, describe, expect, it, vi } from 'vitest';
import { pruefeSpeicher } from '@/lib/startklar/speicher-probe';

/** Erreichbarkeitsprobe (V-11): Das Zeitlimit bricht die Anfrage samt Wiederholungen des SDK ab (Befund Review V-05/V-11). */
describe('Speicherprobe mit Zeitlimit', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('Blob-Schnittstelle unerreichbar: Ergebnis nach dem Zeitlimit, nicht erst nach allen Wiederholungen', async () => {
    vi.stubEnv('VERCEL_BLOB_API_URL', 'http://127.0.0.1:9');
    const start = Date.now();
    const probe = await pruefeSpeicher({ SPEICHER: 'blob', BLOB_READ_WRITE_TOKEN: 'vercel_blob_rw_teststore_nurzumpruefen' });
    expect(probe).toMatchObject({ art: 'blob', erreichbar: false });
    expect(Date.now() - start).toBeLessThan(6_000);
    expect(probe.meldung).not.toContain('nurzumpruefen');
  }, 10_000);
});
