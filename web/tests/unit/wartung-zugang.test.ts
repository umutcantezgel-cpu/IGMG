import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cronErlaubt, wartungErlaubt } from '@/lib/wartung/zugang';

/**
 * Zugang zu Wartungsrouten (V-06, ADR 0017): Cron (CRON_SECRET, GET) und Handaufruf (WARTUNG_TOKEN, POST) sind getrennt,
 * beide Geheimnisse brauchen mindestens 32 Zeichen, und der Vergleich läuft in konstanter Zeit.
 */
const LANG = 'a'.repeat(32);
const KURZ = 'b'.repeat(31);
const anfrage = (auth?: string) => new Request('https://example.test/api/wartung/x', auth ? { headers: { authorization: auth } } : {});

const vorher = { cron: process.env.CRON_SECRET, wartung: process.env.WARTUNG_TOKEN };
beforeEach(() => {
  delete process.env.CRON_SECRET;
  delete process.env.WARTUNG_TOKEN;
});
afterEach(() => {
  if (vorher.cron === undefined) delete process.env.CRON_SECRET;
  else process.env.CRON_SECRET = vorher.cron;
  if (vorher.wartung === undefined) delete process.env.WARTUNG_TOKEN;
  else process.env.WARTUNG_TOKEN = vorher.wartung;
});

describe('cronErlaubt (Vercel Cron, CRON_SECRET)', () => {
  it('ist gesperrt ohne CRON_SECRET, auch mit beliebigem Bearer', () => {
    expect(cronErlaubt(anfrage(`Bearer ${LANG}`))).toBe(false);
  });

  it('ist gesperrt bei zu kurzem Geheimnis, auch wenn der Bearer genau passt (31 Zeichen)', () => {
    process.env.CRON_SECRET = KURZ;
    expect(cronErlaubt(anfrage(`Bearer ${KURZ}`))).toBe(false);
  });

  it('lässt mit richtigem Bearer (mind. 32 Zeichen) durch und sperrt bei falschem, fehlendem oder ohne Präfix', () => {
    process.env.CRON_SECRET = LANG;
    expect(cronErlaubt(anfrage(`Bearer ${LANG}`))).toBe(true);
    expect(cronErlaubt(anfrage(`Bearer ${'c'.repeat(32)}`))).toBe(false);
    expect(cronErlaubt(anfrage())).toBe(false);
    expect(cronErlaubt(anfrage(LANG))).toBe(false);
    expect(cronErlaubt(anfrage(`Bearer ${LANG}x`))).toBe(false);
  });

  it('nimmt das WARTUNG_TOKEN nicht an', () => {
    process.env.CRON_SECRET = LANG;
    process.env.WARTUNG_TOKEN = 'd'.repeat(32);
    expect(cronErlaubt(anfrage(`Bearer ${'d'.repeat(32)}`))).toBe(false);
  });
});

describe('wartungErlaubt bleibt unverändert (WARTUNG_TOKEN)', () => {
  it('lässt mit WARTUNG_TOKEN durch und nimmt das CRON_SECRET nicht an', () => {
    process.env.WARTUNG_TOKEN = LANG;
    process.env.CRON_SECRET = 'e'.repeat(32);
    expect(wartungErlaubt(anfrage(`Bearer ${LANG}`))).toBe(true);
    expect(wartungErlaubt(anfrage(`Bearer ${'e'.repeat(32)}`))).toBe(false);
  });

  it('ist bei zu kurzem WARTUNG_TOKEN gesperrt', () => {
    process.env.WARTUNG_TOKEN = KURZ;
    expect(wartungErlaubt(anfrage(`Bearer ${KURZ}`))).toBe(false);
  });
});
