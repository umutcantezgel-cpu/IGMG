import { afterEach, describe, expect, it, vi } from 'vitest';
import { clientAdresse, OHNE_PROXY } from '@/lib/sicherheit/ip';

/**
 * Tor B/C H1 (E-041): Adress-Header sind vom Client fälschbar. Ausgewertet werden sie nur hinter einem vertrauten
 * Proxy (`PROXY_VERTRAUEN=1`); dann zählt `X-Real-IP` bzw. der letzte – vom Proxy angehängte – XFF-Eintrag.
 */
const h = (werte: Record<string, string>) => new Headers(werte);
afterEach(() => vi.unstubAllEnvs());

describe('clientAdresse', () => {
  it('ohne vertrauten Proxy: gemeinsamer Schlüssel, Header werden ignoriert', () => {
    vi.stubEnv('PROXY_VERTRAUEN', '');
    expect(clientAdresse(h({ 'x-forwarded-for': '203.0.113.7', 'x-real-ip': '203.0.113.8' }))).toBe(OHNE_PROXY);
    vi.stubEnv('PROXY_VERTRAUEN', 'true');
    expect(clientAdresse(h({ 'x-forwarded-for': '203.0.113.7' }))).toBe(OHNE_PROXY);
  });

  it('mit vertrautem Proxy: X-Real-IP vor X-Forwarded-For', () => {
    vi.stubEnv('PROXY_VERTRAUEN', '1');
    expect(clientAdresse(h({ 'x-real-ip': ' 198.51.100.4 ', 'x-forwarded-for': '203.0.113.7' }))).toBe('198.51.100.4');
  });

  it('mit vertrautem Proxy: letzter XFF-Eintrag – vorangestellte gefälschte Werte zählen nicht', () => {
    vi.stubEnv('PROXY_VERTRAUEN', '1');
    expect(clientAdresse(h({ 'x-forwarded-for': '1.2.3.4, 5.6.7.8,  198.51.100.9 ' }))).toBe('198.51.100.9');
    expect(clientAdresse(h({ 'x-forwarded-for': '198.51.100.9,' }))).toBe('198.51.100.9');
  });

  it('mit vertrautem Proxy ohne Header: gemeinsamer Schlüssel', () => {
    vi.stubEnv('PROXY_VERTRAUEN', '1');
    expect(clientAdresse(h({}))).toBe(OHNE_PROXY);
    expect(clientAdresse(h({ 'x-forwarded-for': ' , ' }))).toBe(OHNE_PROXY);
  });
});
