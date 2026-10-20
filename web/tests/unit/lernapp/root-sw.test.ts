import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Root-Service-Worker der Website und Lern-App (ADR 0037 Nr. 8, Fortschreibung S1 Nr. 6; PLAN Befund 4): Beim Aktivieren
 * bleiben alle Vorräte `igmg-lernapp-*` erhalten, und Anfragen unter `/lern-app` beantwortet er nie (keine Offline-Seite
 * der Website im Bereich der Lern-App). Der Worker läuft hier in einer kleinen Nachbildung der Worker-Umgebung.
 */
const QUELLE = readFileSync(join(import.meta.dirname, '../../../public/sw.js'), 'utf8');

type Hoerer = (e: Record<string, unknown>) => void;

function ladeWorker(vorraete: string[]) {
  const hoerer = new Map<string, Hoerer>();
  const geloescht: string[] = [];
  const self = {
    location: { origin: 'https://igmg.test' },
    addEventListener: (art: string, f: Hoerer) => hoerer.set(art, f),
    skipWaiting: () => Promise.resolve(),
    clients: { claim: () => Promise.resolve(), matchAll: () => Promise.resolve([]) },
    registration: { showNotification: () => Promise.resolve() },
  };
  const caches = {
    keys: () => Promise.resolve([...vorraete]),
    delete: (name: string) => {
      geloescht.push(name);
      return Promise.resolve(true);
    },
    open: () => Promise.resolve({ addAll: () => Promise.resolve(), put: () => Promise.resolve(), match: () => Promise.resolve(undefined) }),
    match: () => Promise.resolve(undefined),
  };
  const holen = () => Promise.resolve(new Response('netz'));
  new Function('self', 'caches', 'fetch', 'URL', 'Response', QUELLE)(self, caches, holen, URL, Response);
  return { hoerer, geloescht };
}

describe('Root-Service-Worker neben der Lern-App', () => {
  it('Aktivieren behält igmg-lernapp-*, den Koran-Vorrat und die eigene Version; Fremdes wird gelöscht', async () => {
    const { hoerer, geloescht } = ladeWorker([
      'igmg-v1-seiten',
      'igmg-v1-dateien',
      'igmg-koran-v1',
      'igmg-lernapp-schale-v1',
      'igmg-lernapp-pakete',
      'igmg-lernapp-audio',
      'igmg-lernapp-modelle',
      'igmg-v0-seiten',
      'fremd',
    ]);
    let warten: Promise<unknown> = Promise.resolve();
    hoerer.get('activate')!({ waitUntil: (p: Promise<unknown>) => (warten = p) });
    await warten;
    expect(geloescht.sort()).toEqual(['fremd', 'igmg-v0-seiten']);
  });

  it('Anfragen unter /lern-app beantwortet er nie, auch nicht die Navigation; die Website schon', () => {
    const { hoerer } = ladeWorker([]);
    const fetchen = hoerer.get('fetch')!;
    const ereignis = (pfad: string, mode = 'navigate') => {
      let beantwortet = false;
      fetchen({
        request: { method: 'GET', url: `https://igmg.test${pfad}`, mode, headers: new Headers() },
        respondWith: () => {
          beantwortet = true;
        },
      });
      return beantwortet;
    };
    for (const pfad of ['/lern-app', '/lern-app/de', '/lern-app/ar/tr-aus-ar/ueben', '/lern-app/sw.js', '/lern-app/audio/tr/x.lpa'])
      expect(ereignis(pfad), pfad).toBe(false);
    expect(ereignis('/')).toBe(true);
    expect(ereignis('/gebetszeiten')).toBe(true);
    expect(ereignis('/lern-appx')).toBe(true);
  });
});
