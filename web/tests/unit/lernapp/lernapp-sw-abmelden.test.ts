import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Abmelde-Worker der Lern-App (S-L3 N-4, `_lernapp/GO-LIVE.md` Ausnahme N-4): Der Proxy liefert ihn bei
 * `FUNKTION_LERNAPP=aus` unter `/lern-app/sw.js` aus (`tests/unit/lernapp/proxy.test.ts`). Er wird sofort aktiv, hat
 * keinen `fetch`-Hörer, löscht die Vorräte `igmg-lernapp-*` außer den Modellen, lässt die Website-Vorräte stehen, meldet sich
 * ab und lädt offene Fenster neu. Nachbildung der Worker-Umgebung wie in `lernapp-sw.test.ts`.
 */
const QUELLE = readFileSync(join(import.meta.dirname, '../../../public/lern-app/sw-abmelden.js'), 'utf8');

type Hoerer = (e: Record<string, unknown>) => void;

function ladeWorker(vorraete: string[], fenster: string[]) {
  const hoerer = new Map<string, Hoerer>();
  const speicher = new Set(vorraete);
  const ablauf: string[] = [];
  const caches = {
    keys: async () => [...speicher],
    delete: async (name: string) => {
      ablauf.push(`delete ${name}`);
      return speicher.delete(name);
    },
  };
  let wartenUebersprungen = false;
  const self = {
    addEventListener: (art: string, f: Hoerer) => hoerer.set(art, f),
    skipWaiting: () => {
      wartenUebersprungen = true;
      return Promise.resolve();
    },
    registration: {
      unregister: async () => {
        ablauf.push('unregister');
        return true;
      },
    },
    clients: {
      matchAll: async (o: { type: string }) => {
        ablauf.push(`matchAll ${o.type}`);
        return fenster.map((url) => ({
          url,
          navigate: async (ziel: string) => {
            ablauf.push(`navigate ${ziel}`);
            if (ziel.endsWith('/kaputt')) throw new TypeError('nicht steuerbar');
            return null;
          },
        }));
      },
    },
  };
  new Function('self', 'caches', QUELLE)(self, caches);
  const warte = (art: string) => {
    let p: Promise<unknown> = Promise.resolve();
    hoerer.get(art)!({ waitUntil: (x: Promise<unknown>) => (p = x) });
    return p;
  };
  return { hoerer, speicher, ablauf, warte, uebersprungen: () => wartenUebersprungen };
}

describe('Abmelde-Worker der Lern-App (S-L3 N-4)', () => {
  it('sofort aktiv und ohne fetch-Hörer: nichts kommt mehr aus dem Vorrat', async () => {
    const w = ladeWorker([], []);
    expect([...w.hoerer.keys()].sort()).toEqual(['activate', 'install']);
    await w.warte('install');
    expect(w.uebersprungen()).toBe(true);
  });

  it('Aktivieren: Vorräte der Lern-App außer Modellen weg, Website bleibt; danach abmelden und offene Fenster neu laden', async () => {
    const w = ladeWorker(
      [
        'igmg-lernapp-schale-vabc123',
        'igmg-lernapp-schale-valt9',
        'igmg-lernapp-pakete',
        'igmg-lernapp-audio',
        'igmg-lernapp-modelle',
        'igmg-v1-seiten',
        'igmg-koran-v1',
      ],
      ['https://igmg.test/lern-app/de', 'https://igmg.test/lern-app/tr/kaputt'],
    );
    await w.warte('activate');
    expect([...w.speicher].sort()).toEqual(['igmg-koran-v1', 'igmg-lernapp-modelle', 'igmg-v1-seiten']);
    // Reihenfolge: erst aufräumen, dann abmelden, dann neu laden (ein Fenster, das sich nicht steuern lässt, bricht nichts ab)
    const index = (eintrag: string) => w.ablauf.indexOf(eintrag);
    expect(Math.max(...w.ablauf.filter((a) => a.startsWith('delete ')).map(index))).toBeLessThan(index('unregister'));
    expect(index('unregister')).toBeLessThan(index('matchAll window'));
    expect(w.ablauf.slice(index('matchAll window') + 1)).toEqual([
      'navigate https://igmg.test/lern-app/de',
      'navigate https://igmg.test/lern-app/tr/kaputt',
    ]);
  });

  it('enthält keine Adresse außer dem eigenen Ursprung und speichert nichts', () => {
    expect(QUELLE).not.toMatch(/https?:\/\//);
    expect(QUELLE).not.toMatch(/caches\.open|\.put\(|fetch\(/);
  });
});
