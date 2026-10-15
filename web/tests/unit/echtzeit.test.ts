import { createHmac } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { echtzeitAusUmgebung, echtzeitTokens, echtzeitUrsprung, jwtHs256, kanalName } from '@/lib/echtzeit/centrifugo';
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

/**
 * Server-Kit (ADR 0027, ADR 0036, Z-20): Centrifugo kennt den Namensraum der App-Kanäle (`chat:<id>`), sonst weist er jedes
 * Abo mit „unknown channel“ ab und das Signal wirkt nie. Abonnieren nur mit Abo-Token der App, kein Veröffentlichen,
 * keine Anwesenheit und kein Verlauf durch Browser (S-14, S-16). Laufzeitprüfung gegen einen echten Centrifugo:
 * `betrieb/lokal/echtzeit/pruefen.mjs`.
 */
describe('Echtzeit-Kit: centrifugo.json passt zur App (Z-20)', () => {
  type Optionen = Record<string, unknown>;
  const konfig = JSON.parse(readFileSync(join(resolve(__dirname, '../../..'), 'betrieb/lokal/echtzeit/centrifugo.json'), 'utf8')) as {
    client?: Optionen & { subscription_token?: Optionen; insecure?: boolean };
    channel: { namespace_boundary?: string; without_namespace?: Optionen; namespaces?: (Optionen & { name: string })[] };
  };
  const [praefix] = kanalName('kanal-9').split(':');
  const raum = konfig.channel.namespaces?.find((n) => n.name === praefix);

  it('Namensraum der App-Kanäle ist eingetragen (Trenner „:“ wie in kanalName)', () => {
    expect(praefix).toBe('chat');
    expect(konfig.channel.namespace_boundary ?? ':').toBe(':');
    expect(raum).toBeDefined();
  });

  it('nur Abonnieren mit Abo-Token; Browser veröffentlichen nicht, sehen weder Anwesenheit noch Verlauf', () => {
    const erlaubnisse = Object.entries(raum!).filter(([k]) => k.startsWith('allow_'));
    expect(erlaubnisse.map(([k]) => k).sort()).toEqual(
      [
        'allow_history_for_anonymous',
        'allow_history_for_client',
        'allow_history_for_subscriber',
        'allow_presence_for_anonymous',
        'allow_presence_for_client',
        'allow_presence_for_subscriber',
        'allow_publish_for_anonymous',
        'allow_publish_for_client',
        'allow_publish_for_subscriber',
        'allow_subscribe_for_anonymous',
        'allow_subscribe_for_client',
        'allow_user_limited_channels',
      ].sort(),
    );
    expect(erlaubnisse.every(([, w]) => w === false)).toBe(true);
    expect(raum).toMatchObject({ presence: false, join_leave: false, force_push_join_leave: false, history_size: 0 });
    // Keine Proxys, kein unsicherer Modus; Abo-Tokens mit demselben HMAC-Schlüssel wie die Verbindung (ein Geheimnis in der App)
    expect(Object.keys(raum!).filter((k) => k.includes('proxy'))).toEqual([]);
    expect(konfig.client?.insecure ?? false).toBe(false);
    expect(konfig.client?.subscription_token?.enabled ?? false).toBe(false);
    expect(konfig.channel.without_namespace).toMatchObject({ allow_subscribe_for_client: false, allow_publish_for_client: false });
  });
});
