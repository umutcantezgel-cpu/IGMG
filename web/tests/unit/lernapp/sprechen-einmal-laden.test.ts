import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { describe, expect, it } from 'vitest';
import { MODELL, MODELL_DATEIEN, MODELLE_BASIS, modellBasisAbsolut } from '@/lib/lernapp/sprechen/modell';

/**
 * L8-02 (Netzprotokoll der Sprechübung, `_lernapp/werkzeuge/leistung/whisper-netz.mjs`): Nach dem Klick auf „Sprachprüfung
 * laden“ holte der Service Worker Encoder, Decoder und Tokenizer zweimal aus dem Netz. Ursache: Mit Fortschrittsmeldung fragt
 * transformers.js 4.3 vorab die Größe jeder Modelldatei ab (`get_file_metadata`) und holt sie bei einem relativen Modellpfad
 * dafür vollständig per GET, ohne den Körper zu lesen. Mit absolutem `env.localModelPath` entfällt diese Vorabfrage.
 * Geprüft am ausgelieferten Browser-Bau von transformers.js (derselbe Code wie im Worker), `env.fetch` als Attrappe.
 */
const TRANSFORMERS = pathToFileURL(join(process.cwd(), 'node_modules/@huggingface/transformers/dist/transformers.web.js')).href;

describe('Sprechübung: jede Modelldatei genau einmal laden', () => {
  it('modellBasisAbsolut setzt den Modellordner vor den eigenen Ursprung', () => {
    expect(modellBasisAbsolut('http://localhost:3224')).toBe(`http://localhost:3224${MODELLE_BASIS}`);
    expect(modellBasisAbsolut('https://beispiel.invalid/')).toBe(`https://beispiel.invalid${MODELLE_BASIS}`);
  });

  it('der Worker übergibt transformers.js den absoluten Modellordner', () => {
    const quelle = readFileSync(join(process.cwd(), 'src/components/lernapp/sprechen/whisper.worker.ts'), 'utf8');
    expect(quelle).toMatch(/env\.localModelPath = modellBasisAbsolut\(bereich\.location\.origin\);/);
    expect(quelle).not.toMatch(/env\.localModelPath = MODELLE_BASIS/);
  });

  it('transformers.js fragt bei absolutem Modellordner keine Datei vorab ab (bei relativem schon)', async () => {
    const { env, ModelRegistry } = (await import(TRANSFORMERS)) as {
      env: Record<string, unknown>;
      ModelRegistry: { get_file_metadata: (modell: string, datei: string) => Promise<{ exists: boolean }> };
    };
    const vorher = { ...env };
    const abrufe: string[] = [];
    Object.assign(env, {
      allowRemoteModels: false,
      allowLocalModels: true,
      useFS: false,
      useFSCache: false,
      useBrowserCache: false,
      fetch: async (adresse: string | URL) => {
        abrufe.push(String(adresse));
        return new Response('x', { status: 200, headers: { 'content-length': '1' } });
      },
    });
    try {
      env.localModelPath = modellBasisAbsolut('http://localhost:3224');
      for (const { pfad } of MODELL_DATEIEN) await ModelRegistry.get_file_metadata(MODELL.name, pfad);
      expect(abrufe).toEqual([]);

      // Gegenprobe (Ursache): relativer Modellordner → vollständiger GET je Datei nur für die Größe
      env.localModelPath = MODELLE_BASIS;
      const datei = `${MODELL_DATEIEN[0]?.pfad}?gegenprobe`;
      await ModelRegistry.get_file_metadata(MODELL.name, datei);
      expect(abrufe).toEqual([`${MODELLE_BASIS}${MODELL.name}/${datei}`]);
    } finally {
      Object.assign(env, vorher);
    }
  });
});
