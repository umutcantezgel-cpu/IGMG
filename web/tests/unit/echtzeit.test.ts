import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { echtzeitAusUmgebung, echtzeitTokens, echtzeitUrsprung, jwtHs256 } from '@/lib/echtzeit/centrifugo';
import { cspVerwaltung } from '@/lib/sicherheit/header';

const ENV = {
  ECHTZEIT_URL: 'wss://echtzeit.example.org/connection/websocket',
  ECHTZEIT_GEHEIMNIS: 'x'.repeat(40),
  ECHTZEIT_API_URL: 'https://echtzeit.example.org/api/',
  ECHTZEIT_API_SCHLUESSEL: 'y'.repeat(40),
};

describe('Echtzeit-Signal (ADR 0027)', () => {
  it('nur vollständig und sicher konfiguriert', () => {
    expect(echtzeitAusUmgebung({})).toBeNull();
    expect(echtzeitAusUmgebung({ ...ENV, ECHTZEIT_URL: 'ws://unsicher.example.org' })).toBeNull();
    expect(echtzeitAusUmgebung({ ...ENV, ECHTZEIT_GEHEIMNIS: 'kurz' })).toBeNull();
    expect(echtzeitAusUmgebung(ENV)?.apiUrl).toBe('https://echtzeit.example.org/api');
    expect(echtzeitUrsprung(ENV)).toBe('wss://echtzeit.example.org');
  });

  it('JWT HS256 prüfbar, Abo-Token an Kanal und Person gebunden, 10 Minuten', () => {
    const k = echtzeitAusUmgebung(ENV)!;
    const t = echtzeitTokens(k, 'person-1', 'kanal-9', 1_800_000_000);
    const [kopf, rumpf, sig] = t.abo.split('.');
    expect(createHmac('sha256', ENV.ECHTZEIT_GEHEIMNIS).update(`${kopf}.${rumpf}`).digest('base64url')).toBe(sig);
    expect(JSON.parse(Buffer.from(rumpf, 'base64url').toString())).toEqual({
      sub: 'person-1',
      channel: 'chat:kanal-9',
      exp: 1_800_000_600,
    });
    expect(jwtHs256({ a: 1 }, 'g').split('.')).toHaveLength(3);
  });

  it('CSP: zusätzliche Verbindung nur, wenn übergeben', () => {
    expect(cspVerwaltung('n')).toContain("connect-src 'self'");
    expect(cspVerwaltung('n', ['wss://echtzeit.example.org'])).toContain("connect-src 'self' wss://echtzeit.example.org");
  });
});
