import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createChallenge, verifySolution } from 'altcha-lib';
import { deriveKey as deriveKeyNode } from 'altcha-lib/algorithms/pbkdf2';
import type { ReactElement } from 'react';
import { prerenderToNodeStream } from 'react-dom/static';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ar from '../../../messages/lernapp/ar.json';
import de from '../../../messages/lernapp/de.json';
import entwurf from '../../../messages/lernapp/entwurf.json';
import tr from '../../../messages/lernapp/tr.json';
import { Rueckmeldung } from '@/components/lernapp/Rueckmeldung';
import { MELDUNG_KATEGORIEN, MeldungSchema } from '@/lib/lernapp/meldung';
import { alsErgebnis, ergebnisVon, loeseAltcha, MeldeFehler, sendeMeldung } from '@/lib/lernapp/oberflaeche/melden';

/**
 * „Fehler melden“ im Spieler (L3-06b, ADR 0041 Nr. 9, KERN 4.0 §5/§6): Der Browser löst die ALTCHA-Aufgabe so, dass der
 * Server sie annimmt; gesendet werden nur Kurs, Aufgabe, Kategorie und ALTCHA; der Dialog lädt erst nach dem Klick (eigener
 * Chunk mit altcha-lib, nicht im Spieler); Texte in de/tr/ar, tr/ar als KI-Entwurf vermerkt.
 */
const SRC = join(import.meta.dirname, '../../../src');
const GEHEIM = 'g'.repeat(40);

afterEach(() => vi.unstubAllGlobals());

async function vorrendern(ui: ReactElement): Promise<string> {
  const { prelude } = await prerenderToNodeStream(ui);
  let html = '';
  for await (const teil of prelude) html += String(teil);
  return html;
}

describe('ALTCHA im Browser und Senden', () => {
  it('die Lösung des Browsers (crypto.subtle) besteht die Prüfung des Servers', async () => {
    // kleine Aufgabe (Kosten und Zähler klein), sonst wie die Route /api/altcha
    const challenge = await createChallenge({
      algorithm: 'PBKDF2/SHA-256',
      cost: 10,
      counter: 7,
      deriveKey: deriveKeyNode,
      hmacSignatureSecret: GEHEIM,
    });
    const abrufe: string[] = [];
    vi.stubGlobal('fetch', async (adresse: string) => {
      abrufe.push(adresse);
      return Response.json(challenge);
    });
    const feld = await loeseAltcha();
    expect(abrufe).toEqual(['/api/altcha']);
    const { challenge: c, solution } = JSON.parse(Buffer.from(feld, 'base64').toString('utf8'));
    const ergebnis = await verifySolution({ challenge: c, solution, deriveKey: deriveKeyNode, hmacSignatureSecret: GEHEIM });
    expect(ergebnis.verified).toBe(true);
    // ohne ALTCHA-Geheimnis (Beispielmodus) antwortet die Route 503: „nicht möglich“
    vi.stubGlobal('fetch', async () => new Response(null, { status: 503 }));
    await expect(loeseAltcha()).rejects.toEqual(new MeldeFehler('nicht_moeglich'));
  });

  it('sendet nur Kurs, Aufgabe, Kategorie und ALTCHA (nie eine Antwort) und wertet den Status aus', async () => {
    const gesendet: { adresse: string; init: RequestInit }[] = [];
    vi.stubGlobal('fetch', async (adresse: string, init: RequestInit) => {
      gesendet.push({ adresse, init });
      return new Response(null, { status: 201 });
    });
    const m = { kurs: 'tr-aus-de' as const, aufgabe: 'tr.a1.e01.l01.a01', kategorie: 'fehler_uebersetzung' as const, altcha: 'x' };
    expect(await sendeMeldung(m)).toBe('ok');
    expect(gesendet[0]!.adresse).toBe('/api/lernapp/meldung');
    expect(gesendet[0]!.init.method).toBe('POST');
    const koerper = JSON.parse(String(gesendet[0]!.init.body));
    expect(Object.keys(koerper).sort()).toEqual(['altcha', 'aufgabe', 'kategorie', 'kurs']);
    expect(MeldungSchema.safeParse(koerper).success).toBe(true);
    expect([201, 429, 404, 503, 400, 403].map(ergebnisVon)).toEqual([
      'ok',
      'zu_viele',
      'nicht_moeglich',
      'nicht_moeglich',
      'fehler',
      'fehler',
    ]);
    // ohne Netz: fetch wirft TypeError → ehrlicher Hinweis, nichts gepuffert
    vi.stubGlobal('fetch', async () => {
      throw new TypeError('Failed to fetch');
    });
    expect(await sendeMeldung(m)).toBe('ohne_netz');
    expect(alsErgebnis(new Error('x'))).toBe('fehler');
  });
});

describe('Spieler: Knopf im Rückmeldeblatt, Dialog erst nach dem Klick', () => {
  const props = {
    auswertung: { urteil: 'richtig' as const, hinweise: [], loesung: 'Wasser', karten: [] },
    texte: de.spieler as never,
    loesungSprache: 'de' as const,
    wirdWiederholt: false,
    meldung: '',
    onWeiter: () => undefined,
    weiterRef: { current: null },
  };

  it('Knopf „Fehler melden“ nur mit `melden`; der Hinweis ohne Netz steht in der einen Live-Region', async () => {
    const ohne = await vorrendern(<Rueckmeldung {...props} />);
    expect(ohne).not.toContain(de.melden.knopf);
    const mit = await vorrendern(<Rueckmeldung {...props} melden={{ knopf: de.melden.knopf, onMelden: () => undefined, hinweis: '' }} />);
    expect(mit).toContain(`>${de.melden.knopf}</button>`);
    expect(mit.indexOf(de.melden.knopf)).toBeLessThan(mit.indexOf(de.spieler.weiter));
    const hinweis = await vorrendern(
      <Rueckmeldung {...props} melden={{ knopf: de.melden.knopf, onMelden: () => undefined, hinweis: de.melden.ohneNetz }} />,
    );
    expect(hinweis).toMatch(new RegExp(`<p role="status" class="sr-only">${de.melden.ohneNetz}</p>`));
    expect([...hinweis.matchAll(/role="status"/g)]).toHaveLength(1);
  });

  it('Dialog und altcha-lib nur per import() nach dem Klick; der Spieler-Chunk bleibt ohne sie', () => {
    const spieler = readFileSync(join(SRC, 'components/lernapp/Spieler.tsx'), 'utf8');
    expect(spieler).toContain("await import('./MeldenDialog')");
    expect(spieler).not.toMatch(/^import (?!type )[^;]*MeldenDialog/m);
    expect(spieler).not.toContain('altcha');
    const dialog = readFileSync(join(SRC, 'components/lernapp/MeldenDialog.tsx'), 'utf8');
    expect(dialog).toContain("from '@/lib/lernapp/oberflaeche/melden'");
    // kein weiteres Modul der Lern-App lädt das Melde-Modul (bliebe sonst im Spieler-Graph)
    const nutzer = [
      'components/lernapp/Spieler.tsx',
      'components/lernapp/Rueckmeldung.tsx',
      'components/lernapp/inseln/UebenInsel.tsx',
    ].filter((d) => readFileSync(join(SRC, d), 'utf8').includes('oberflaeche/melden'));
    expect(nutzer).toEqual([]);
  });
});

describe('Texte des Melde-Dialogs', () => {
  it('de, tr und ar mit denselben Schlüsseln; Kategorien wie MeldungSchema; tr und ar als KI-Entwurf vermerkt', () => {
    for (const t of [de, tr, ar]) expect(Object.keys(t.melden.kategorien).sort()).toEqual([...MELDUNG_KATEGORIEN].sort());
    const schluessel = (o: object, pre = 'melden'): string[] =>
      Object.entries(o).flatMap(([k, v]) => (v && typeof v === 'object' ? schluessel(v, `${pre}.${k}`) : [`${pre}.${k}`]));
    const alle = schluessel(de.melden);
    expect(schluessel(tr.melden)).toEqual(alle);
    expect(schluessel(ar.melden)).toEqual(alle);
    for (const k of alle) {
      expect(entwurf.tr, k).toContain(k);
      expect(entwurf.ar, k).toContain(k);
    }
  });
});
