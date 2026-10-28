import { describe, expect, it } from 'vitest';
import {
  PFAD_BERECHTIGUNGEN,
  RAHMEN_QUELLEN,
  cspLernApp,
  cspOeffentlich,
  cspVerwaltung,
  grundHeader,
  istKontoPfad,
  istLernappVerwaltung,
  lernAppHeaderRegeln,
  permissionsPolicy,
} from '@/lib/sicherheit/header';
import { unstable_getResponseFromNextConfig } from 'next/experimental/testing/server';
import nextConfig from '../../next.config';

/** Kopfzeilen aus next.config.ts für einen Pfad, ausgewertet von Next selbst (Reihenfolge, Muster, Überschreiben). */
async function kopfzeilenFuer(pfad: string): Promise<Record<string, string>> {
  const antwort = await unstable_getResponseFromNextConfig({ url: `https://igmg.test${pfad}`, nextConfig });
  return Object.fromEntries([...antwort.headers.entries()].map(([k, v]) => [k.toLowerCase(), v]));
}

describe('Berechtigungen je Pfad (ADR 0028, ADR 0029)', () => {
  it('Grundregel sperrt Kamera, Mikrofon und Standort', () => {
    const wert = grundHeader().find((h) => h.key === 'Permissions-Policy')?.value ?? '';
    expect(wert).toContain('camera=()');
    expect(wert).toContain('microphone=()');
    expect(wert).toContain('geolocation=()');
  });

  it('Standort nur auf den Gebetszeiten-Seiten, Mikrofon nur in der Rezitations-Werkstatt, im Audio-Studio und auf Übungsseiten der Lern-App', () => {
    for (const { source, erlaubt } of PFAD_BERECHTIGUNGEN) {
      if (erlaubt.includes('geolocation')) expect(source).toMatch(/gebetszeiten|namaz-vakitleri|prayer-times/);
      if (erlaubt.includes('microphone'))
        expect(source).toMatch(
          /^(\/de)?\/verwaltung\/(rezitationen|lernapp\/audio)\/:pfad\*$|^\/lern-app\/:ui\/:kurs\/(ueben|wiederholen)$/,
        );
      expect(erlaubt).not.toContain('camera');
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

describe('Rahmen nur für Einbettungen nach Klick (Plan Marktstart, ADR 0012, K-14)', () => {
  const FRAME_SRC = "frame-src 'self' https://www.openstreetmap.org https://www.youtube-nocookie.com";
  const teil = (csp: string, name: string) => csp.split('; ').find((t) => t.startsWith(`${name} `)) ?? '';

  it('frame-src genau eigener Ursprung, OpenStreetMap und youtube-nocookie – in jeder CSP; frame-ancestors bleibt none', () => {
    expect(RAHMEN_QUELLEN).toEqual(["'self'", 'https://www.openstreetmap.org', 'https://www.youtube-nocookie.com']);
    for (const csp of [cspOeffentlich(), cspLernApp(), cspVerwaltung('n')]) {
      expect(teil(csp, 'frame-src')).toBe(FRAME_SRC);
      expect(teil(csp, 'frame-ancestors')).toBe("frame-ancestors 'none'");
      expect(teil(csp, 'default-src')).toBe("default-src 'self'");
    }
  });

  it('öffentliche Seiten senden frame-src über next.config.ts (auch nach einem Seitenwechsel gilt dieselbe CSP)', async () => {
    for (const pfad of ['/', '/kontakt', '/tr/iletisim', '/en/contact']) {
      const k = await kopfzeilenFuer(pfad);
      expect(teil(k['content-security-policy'] ?? '', 'frame-src'), pfad).toBe(FRAME_SRC);
    }
  });
});

describe('Kopfzeilen der Lern-App (ADR 0042 Nr. 9, Fortschreibung S2/S5; KERN 4.0 §6)', () => {
  it('CSP der Lern-App: öffentliche CSP plus wasm-unsafe-eval, worker-src self ohne blob:, media-src self blob:', () => {
    const csp = cspLernApp();
    const teil = (name: string) => csp.split('; ').find((t) => t.startsWith(`${name} `)) ?? '';
    expect(teil('script-src')).toContain("'wasm-unsafe-eval'");
    expect(teil('script-src')).not.toContain('blob:');
    expect(teil('worker-src')).toBe("worker-src 'self'");
    expect(teil('media-src')).toBe("media-src 'self' blob:");
    expect(teil('connect-src')).toBe("connect-src 'self'");
    expect(teil('frame-ancestors')).toBe("frame-ancestors 'none'");
    expect(cspOeffentlich()).not.toContain('wasm-unsafe-eval');
    expect(cspOeffentlich()).toContain("media-src 'self';");
  });

  it('Verwaltung: media-src blob: nur unter /verwaltung/lernapp (Clips, Probe, Vorschau – L3-06), Skripte unverändert', () => {
    for (const p of ['/verwaltung/lernapp', '/verwaltung/lernapp/audio', '/de/verwaltung/lernapp/kurse/tr'])
      expect(istLernappVerwaltung(p)).toBe(true);
    for (const p of ['/verwaltung', '/verwaltung/lernapp-x', '/verwaltung/rezitationen', '/lern-app/de', '/tr/verwaltung/lernapp'])
      expect(istLernappVerwaltung(p)).toBe(false);
    const teil = (csp: string, name: string) => csp.split('; ').find((t) => t.startsWith(`${name} `)) ?? '';
    expect(teil(cspVerwaltung('n'), 'media-src')).toBe("media-src 'self'");
    const lernapp = cspVerwaltung('n', [], { medienBlob: true });
    expect(teil(lernapp, 'media-src')).toBe("media-src 'self' blob:");
    expect(teil(lernapp, 'script-src')).toBe(teil(cspVerwaltung('n'), 'script-src'));
  });

  it('ganz /lern-app: COOP same-origin, COEP require-corp, eigene CSP – Website unverändert', async () => {
    for (const pfad of ['/lern-app/de', '/lern-app/ar/tr-aus-ar/ueben', '/lern-app/tr/einstellungen', '/lern-app/sw.js']) {
      const k = await kopfzeilenFuer(pfad);
      expect(k['cross-origin-embedder-policy'], pfad).toBe('require-corp');
      expect(k['cross-origin-opener-policy'], pfad).toBe('same-origin');
      expect(k['content-security-policy'], pfad).toBe(cspLernApp());
    }
    for (const pfad of ['/', '/quran/1', '/de/quran/1', '/tr/kuran/1', '/gebetszeiten', '/lern-appx', '/lernen']) {
      const k = await kopfzeilenFuer(pfad);
      expect(k['cross-origin-embedder-policy'], pfad).toBeUndefined();
      expect(k['content-security-policy'], pfad).toBe(cspOeffentlich());
      expect(k['permissions-policy'], pfad).not.toContain('microphone=(self)');
    }
  });

  it('Anmeldung im Scope: keine statische CSP (Nonce-CSP im Proxy), COEP bleibt', async () => {
    for (const pfad of ['/lern-app/de/anmelden', '/lern-app/ar/anmelden', '/lern-app/tr/anmelden/zwei-faktor']) {
      const k = await kopfzeilenFuer(pfad);
      expect(k['content-security-policy'], pfad).toBeUndefined();
      expect(k['cross-origin-embedder-policy'], pfad).toBe('require-corp');
    }
    // nur die genaue Anmeldeadresse ist ausgenommen
    expect((await kopfzeilenFuer('/lern-app/de/anmelden-hilfe'))['content-security-policy']).toBe(cspLernApp());
  });

  it('Randpfade mit Punkt (erreichen den Proxy nicht) antworten nie ohne CSP (S-L1 N-2)', async () => {
    // unter der Anmeldung: CSP der Lern-App statt gar keiner
    for (const pfad of ['/lern-app/de/anmelden/x.y', '/lern-app/tr/anmelden.json', '/lern-app/ar/anmelden/zwei-faktor/a.b'])
      expect((await kopfzeilenFuer(pfad))['content-security-policy'], pfad).toBe(cspLernApp());
    // Links der Website mit Sprachpräfix: öffentliche CSP, wenn der Proxy sie nicht weiterleitet
    for (const pfad of ['/de/lern-app/x.y', '/tr/lern-app/de/a.b', '/en/lern-app.json', '/de/lern-app'])
      expect((await kopfzeilenFuer(pfad))['content-security-policy'], pfad).toBe(cspOeffentlich());
    // Verwaltung und Konto-Seiten bleiben ausgenommen (Nonce-CSP im Proxy), mit und ohne Sprachpräfix
    for (const pfad of ['/verwaltung', '/de/verwaltung/x', '/anmelden', '/tr/giris'])
      expect((await kopfzeilenFuer(pfad))['content-security-policy'], pfad).toBeUndefined();
  });

  it('Mikrofon nur auf …/ueben und …/wiederholen sowie im Audio-Studio der Verwaltung', async () => {
    const mit = [
      '/lern-app/de/tr-aus-de/ueben',
      '/lern-app/ar/de-aus-ar/wiederholen',
      '/verwaltung/lernapp/audio',
      '/verwaltung/lernapp/audio/neu',
    ];
    const ohne = [
      '/lern-app/de',
      '/lern-app/de/tr-aus-de',
      '/lern-app/de/tr-aus-de/einstufung',
      '/lern-app/de/tr-aus-de/ueben/x',
      '/verwaltung/lernapp',
    ];
    for (const pfad of mit) expect((await kopfzeilenFuer(pfad))['permissions-policy'], pfad).toContain('microphone=(self)');
    for (const pfad of ohne) expect((await kopfzeilenFuer(pfad))['permissions-policy'], pfad).toContain('microphone=()');
    expect((await kopfzeilenFuer('/lern-app/de/tr-aus-de/ueben'))['permissions-policy']).toContain('camera=()');
  });

  it('Modelle unveränderlich mit nosniff; Service Worker immer neu geprüft', async () => {
    const modell = await kopfzeilenFuer('/lern-app/modelle/whisper-base-64da572/encoder_model_quantized.onnx');
    expect(modell['cache-control']).toBe('public, max-age=31536000, immutable');
    expect(modell['x-content-type-options']).toBe('nosniff');
    expect(modell['cross-origin-embedder-policy']).toBe('require-corp');
    expect((await kopfzeilenFuer('/lern-app/sw.js'))['cache-control']).toBe('no-cache');
    expect((await kopfzeilenFuer('/lern-app/sw.js'))['service-worker-allowed']).toBeUndefined();
    // Abmelde-Worker (S-L3 N-4): ebenso nie aus dem HTTP-Vorrat
    expect((await kopfzeilenFuer('/lern-app/sw-abmelden.js'))['cache-control']).toBe('no-cache');
    expect(lernAppHeaderRegeln().every((r) => r.source.startsWith('/lern-app/'))).toBe(true);
  });
});
