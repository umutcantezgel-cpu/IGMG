import { describe, expect, it } from 'vitest';
import { PFAD_BERECHTIGUNGEN, grundHeader, istKontoPfad, permissionsPolicy } from '@/lib/sicherheit/header';

describe('Berechtigungen je Pfad (ADR Mein Ort, ADR Audio)', () => {
  it('Grundregel sperrt Kamera, Mikrofon und Standort', () => {
    const wert = grundHeader().find((h) => h.key === 'Permissions-Policy')?.value ?? '';
    expect(wert).toContain('camera=()');
    expect(wert).toContain('microphone=()');
    expect(wert).toContain('geolocation=()');
  });

  it('Standort nur auf den Gebetszeiten-Seiten, Mikrofon/Kamera nur in der Verwaltung', () => {
    for (const { source, erlaubt } of PFAD_BERECHTIGUNGEN) {
      if (erlaubt.includes('geolocation')) expect(source).toMatch(/gebetszeiten|namaz-vakitleri|prayer-times/);
      if (erlaubt.includes('microphone') || erlaubt.includes('camera')) expect(source).toMatch(/verwaltung/);
    }
    expect(permissionsPolicy(['geolocation'])).toContain('geolocation=(self)');
    expect(permissionsPolicy(['geolocation'])).toContain('microphone=()');
  });

  it('erkennt Konto-Seiten in allen Sprachen, aber keine öffentlichen Seiten', () => {
    for (const p of ['/anmelden', '/mein-bereich/kinder', '/tr/hesabim', '/en/my-account/teaching', '/konto/bestaetigen', '/tr/giris'])
      expect(istKontoPfad(p)).toBe(true);
    for (const p of ['/', '/kontakt', '/gebetszeiten', '/en/accounting', '/kontoauszug', '/quran/2']) expect(istKontoPfad(p)).toBe(false);
  });
});
