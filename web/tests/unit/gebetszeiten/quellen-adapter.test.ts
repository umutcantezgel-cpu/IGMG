import { createHash } from 'node:crypto';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { dateiQuelle, jahresdateiEnde, jahresdateiTage, leseJahresdatei } from '@/lib/gebetszeiten/quellen/datei';
import { abrufAdressen, feedQuelle, zugangErlaubt } from '@/lib/gebetszeiten/quellen/igmg-feed';
import { QuellenFehler, type Abruf } from '@/lib/gebetszeiten/quellen/typen';
import { igmgZugangGueltig } from '@/lib/umgebung';

/**
 * Adapter des IGMG-Abgleichs (ADR 0048): offizieller Feed nur über GEBETSZEITEN_IGMG_URL (Schlüssel nur als Header,
 * keine Cookies, Wiederholung nur bei vorübergehenden Fehlern, 1 MB, JSON/CSV) und Jahresdatei mit Prüfsumme aus
 * QUELLE.md. Alles mit eingesetztem Abruf – kein Netz.
 */
const URL_VORLAGE = 'https://kalender.example.test/gebetszeiten/{stadt}/{jahr}/{monat}';
const CSV = 'Tarih;İmsak;Güneş;Öğle;İkindi;Akşam;Yatsı\n01.11.2026;06:20;07:58;13:16;15:52;18:23;19:56';

type Aufruf = { adresse: string; init: RequestInit };
function fake(antworten: (() => Response | Promise<Response>)[]): { abruf: Abruf; aufrufe: Aufruf[] } {
  const aufrufe: Aufruf[] = [];
  let i = 0;
  return {
    aufrufe,
    abruf: async (adresse, init) => {
      aufrufe.push({ adresse, init });
      const naechste = antworten[Math.min(i++, antworten.length - 1)];
      return naechste();
    },
  };
}
const ok =
  (text = CSV, typ = 'text/csv; charset=utf-8') =>
  () =>
    new Response(text, { status: 200, headers: { 'content-type': typ } });
const ohneWarten = async () => undefined;
const quelle = (abruf: Abruf, env: Record<string, string> = {}) =>
  feedQuelle({ env: { GEBETSZEITEN_IGMG_URL: URL_VORLAGE, NODE_ENV: 'production', ...env }, abruf, warte: ohneWarten });
const auftrag = { von: '2026-11-01', bis: '2026-11-01', stadtId: '20238' };

describe('Offizieller Feed', () => {
  it('ohne GEBETSZEITEN_IGMG_URL nicht bereit; Abruf meldet „nicht_eingerichtet“ ohne Anfrage', async () => {
    const f = fake([ok()]);
    const q = feedQuelle({ env: {}, abruf: f.abruf, warte: ohneWarten });
    expect(q.bereit()).toBe(false);
    await expect(q.hole(auftrag)).rejects.toMatchObject({ code: 'nicht_eingerichtet' });
    expect(f.aufrufe).toHaveLength(0);
  });

  it('liest CSV, setzt Platzhalter, schickt den Schlüssel nur als Header, ohne Cookies und ohne Weiterleitung', async () => {
    const f = fake([ok()]);
    const l = await quelle(f.abruf, { GEBETSZEITEN_IGMG_SCHLUESSEL: 'geheim-schluessel-123' }).hole(auftrag);
    expect(l.tage).toEqual([
      { datum: '2026-11-01', imsak: '06:20', gunes: '07:58', ogle: '13:16', ikindi: '15:52', aksam: '18:23', yatsi: '19:56' },
    ]);
    expect(l.sha256).toBe(createHash('sha256').update(CSV).digest('hex'));
    const [a] = f.aufrufe;
    expect(a.adresse).toBe('https://kalender.example.test/gebetszeiten/20238/2026/11');
    expect(a.adresse).not.toContain('geheim');
    expect(a.init).toMatchObject({ method: 'GET', redirect: 'error', cache: 'no-store', credentials: 'omit' });
    const kopf = a.init.headers as Record<string, string>;
    expect(kopf.authorization).toBe('Bearer geheim-schluessel-123');
    expect(kopf['user-agent']).toMatch(/^IGMG-Wetzlar-Website\/1\.0 \(\+/);
    expect(Object.keys(kopf).map((k) => k.toLowerCase())).not.toContain('cookie');
  });

  it('wiederholt 5xx und 429 bis zu dreimal, nicht aber 4xx', async () => {
    const fehler500 = () => new Response('kaputt', { status: 500 });
    const zweiMal = fake([fehler500, () => new Response('', { status: 429 }), ok()]);
    await expect(quelle(zweiMal.abruf).hole(auftrag)).resolves.toMatchObject({ tage: [expect.anything()] });
    expect(zweiMal.aufrufe).toHaveLength(3);

    const immer = fake([fehler500]);
    await expect(quelle(immer.abruf).hole(auftrag)).rejects.toMatchObject({ code: 'status', status: 500 });
    expect(immer.aufrufe).toHaveLength(3);

    const verboten = fake([() => new Response('', { status: 403 })]);
    await expect(quelle(verboten.abruf).hole(auftrag)).rejects.toMatchObject({ code: 'status', status: 403 });
    expect(verboten.aufrufe).toHaveLength(1);
  });

  it('Netzfehler werden wiederholt und als „netz“ gemeldet', async () => {
    const f = fake([
      () => {
        throw new TypeError('fetch failed');
      },
    ]);
    await expect(quelle(f.abruf).hole(auftrag)).rejects.toMatchObject({ code: 'netz' });
    expect(f.aufrufe).toHaveLength(3);
  });

  it('lehnt Antworten über 1 MB, falsche Inhaltstypen und unbekannte Formate ab', async () => {
    const gross = 'x'.repeat(1024 * 1024 + 10);
    await expect(quelle(fake([ok(gross)]).abruf).hole(auftrag)).rejects.toMatchObject({ code: 'zu_gross' });
    await expect(quelle(fake([ok('<html></html>', 'text/html')]).abruf).hole(auftrag)).rejects.toMatchObject({ code: 'inhaltstyp' });
    await expect(quelle(fake([ok('{"x":1}', 'application/json')]).abruf).hole(auftrag)).rejects.toBeInstanceOf(QuellenFehler);
  });

  it('ein Abruf je Monat mit {monat}, je Jahr mit {jahr}, sonst einer', () => {
    expect(abrufAdressen('https://x.test/{stadt}/{jahr}/{monat}', '20238', '2026-11-30', '2027-01-15')).toEqual([
      'https://x.test/20238/2026/11',
      'https://x.test/20238/2026/12',
      'https://x.test/20238/2027/01',
    ]);
    expect(abrufAdressen('https://x.test/{stadt}?jahr={jahr}', '20238', '2026-11-30', '2027-01-15')).toEqual([
      'https://x.test/20238?jahr=2026',
      'https://x.test/20238?jahr=2027',
    ]);
    expect(abrufAdressen('https://x.test/wetzlar.json', '20238', '2026-11-30', '2027-01-15')).toEqual(['https://x.test/wetzlar.json']);
  });

  it('nur https ohne Zugangsdaten; http nur für localhost außerhalb der Produktion (Testfeed)', () => {
    expect(igmgZugangGueltig(URL_VORLAGE)).toBe(true);
    expect(igmgZugangGueltig('http://kalender.example.test/x')).toBe(false);
    expect(igmgZugangGueltig('https://nutzer:pass@kalender.example.test/x')).toBe(false);
    expect(igmgZugangGueltig('https://kalender.example.test/{unbekannt}')).toBe(false);
    expect(zugangErlaubt('http://localhost:4010/feed/{monat}', { NODE_ENV: 'development' })).toBe(true);
    expect(zugangErlaubt('http://localhost:4010/feed/{monat}', { NODE_ENV: 'production' })).toBe(false);
    expect(zugangErlaubt('http://kalender.example.test/x', { NODE_ENV: 'development' })).toBe(false);
  });
});

describe('Jahresdatei', () => {
  function ordnerMit(csv: string, sha?: string): string {
    const ordner = mkdtempSync(join(tmpdir(), 'igmg-gebetskalender-'));
    writeFileSync(join(ordner, '20238-2026.csv'), csv);
    const summe = sha ?? createHash('sha256').update(csv).digest('hex');
    writeFileSync(
      join(ordner, 'QUELLE.md'),
      `# Quelle\n\nAbrufdatum: 2026-10-28\n\n| Datei | SHA-256 |\n|---|---|\n| \`20238-2026.csv\` | \`${summe}\` |\n`,
    );
    return ordner;
  }

  it('liest die Datei mit passender Prüfsumme; Tage und Stand für die Lader', () => {
    const ordner = ordnerMit(CSV);
    expect(leseJahresdatei('20238', 2026, ordner)).toMatchObject({ stand: '2026-10-28', tage: [{ datum: '2026-11-01' }] });
    const t = jahresdateiTage('20238', '2026-10-01', '2026-12-31', ordner);
    expect([...t.tage.keys()]).toEqual(['2026-11-01']);
    expect(t.stand).toBe('2026-10-28');
    expect(jahresdateiEnde('20238', 2026, ordner)).toBe('2026-11-01');
    expect(dateiQuelle({ stadtId: '20238', ordner, jetzt: () => new Date('2026-10-28T12:00:00Z') }).bereit()).toBe(true);
  });

  it('falsche Prüfsumme: Fehler beim Abgleich, leer für die Lader', async () => {
    const ordner = ordnerMit(CSV, 'a'.repeat(64));
    expect(() => leseJahresdatei('20238', 2026, ordner)).toThrow(QuellenFehler);
    expect(jahresdateiTage('20238', '2026-10-01', '2026-12-31', ordner).tage.size).toBe(0);
    await expect(
      dateiQuelle({ stadtId: '20238', ordner }).hole({ ...auftrag, von: '2026-10-01', bis: '2026-12-31' }),
    ).rejects.toMatchObject({
      code: 'pruefsumme',
    });
  });

  it('ohne Datei: nicht bereit, keine Tage', () => {
    const leer = mkdtempSync(join(tmpdir(), 'igmg-gebetskalender-leer-'));
    expect(leseJahresdatei('20238', 2026, leer)).toBeNull();
    expect(dateiQuelle({ stadtId: '20238', ordner: leer }).bereit()).toBe(false);
  });
});
