import { spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

/**
 * Schlüsselabgleich der Lern-App-Texte (`web/scripts/sprachen-pruefen.mjs`, ADR 0037 Nr. 5, KERN 4.0 §7): de ⊆ tr und
 * de ⊆ ar, keine überzähligen Schlüssel, gleiche Platzhalter, Pluralkategorien je Sprache (ar darf mehr haben), Liste der
 * KI-Entwürfe nur mit vorhandenen Schlüsseln. Geprüft an einer Kopie von `messages/` mit absichtlichen Fehlern.
 */
const WEB = join(import.meta.dirname, '../../..');
const SKRIPT = join(WEB, 'scripts/sprachen-pruefen.mjs');
let ordner = '';

type Texte = Record<string, unknown>;

function kopie(): string {
  ordner = mkdtempSync(join(tmpdir(), 'sprachen-'));
  cpSync(join(WEB, 'messages'), ordner, { recursive: true });
  return ordner;
}

function aendere(sprache: 'de' | 'tr' | 'ar' | 'entwurf', f: (t: Texte) => void) {
  const datei = join(ordner, 'lernapp', `${sprache}.json`);
  const t = JSON.parse(readFileSync(datei, 'utf8')) as Texte;
  f(t);
  writeFileSync(datei, JSON.stringify(t, null, 2));
}

function pruefe() {
  const lauf = spawnSync(process.execPath, [SKRIPT], { env: { ...process.env, SPRACHEN_ORDNER: ordner }, encoding: 'utf8' });
  return { rc: lauf.status, text: `${lauf.stdout}${lauf.stderr}` };
}

afterEach(() => {
  if (ordner) rmSync(ordner, { recursive: true, force: true });
  ordner = '';
});

/** Ein neuer Abschnitt mit Plural in allen drei Sprachen (Texte in Umschrift bzw. Platzhaltern, keine arabische Schrift). */
function mitProbe(de: string, tr: string, ar: string) {
  aendere('de', (t) => (t.testprobe = { n: de }));
  aendere('tr', (t) => (t.testprobe = { n: tr }));
  aendere('ar', (t) => (t.testprobe = { n: ar }));
}

describe('sprachen-pruefen: Lern-App', () => {
  it('der Bestand ist grün und nennt die Lern-App', () => {
    kopie();
    const r = pruefe();
    expect(r.rc).toBe(0);
    expect(r.text).toMatch(/Lern-App \d+ Schlüssel in de, tr, ar/);
  });

  it('fehlender Schlüssel in ar oder tr, überzähliger Schlüssel und leerer Wert sind Befunde', () => {
    kopie();
    aendere('ar', (t) => delete (t.start as Texte).titel);
    aendere('tr', (t) => (t.extra = 'x'));
    aendere('de', (t) => ((t.nichtGefunden as Texte).text = ' '));
    const r = pruefe();
    expect(r.rc).toBe(1);
    expect(r.text).toContain('lernapp/ar: fehlt start.titel');
    expect(r.text).toContain('lernapp/tr: überzählig extra');
    expect(r.text).toContain('lernapp/de: leer nichtGefunden.text');
  });

  it('Platzhalter müssen gleich sein', () => {
    kopie();
    mitProbe('{name} lernt', '{isim} öğreniyor', '[ar: {name}]');
    const r = pruefe();
    expect(r.rc).toBe(1);
    expect(r.text).toContain('lernapp/tr: Platzhalter abweichend testprobe.n');
    expect(r.text).not.toContain('lernapp/ar: Platzhalter abweichend testprobe.n');
  });

  it('ar darf mehr Pluralkategorien haben; tr nur die eigenen; Kategorien aus de bleiben; other ist Pflicht', () => {
    kopie();
    mitProbe(
      '{n, plural, =0 {keine} one {# Karte} other {# Karten}}',
      '{n, plural, one {# kart} other {# kart}}',
      '{n, plural, zero {[0]} one {[1]} two {[2]} few {[#]} many {[#]} other {[#]}}',
    );
    expect(pruefe().rc).toBe(0);

    mitProbe(
      '{n, plural, one {# Karte} other {# Karten}}',
      '{n, plural, one {# kart} few {# kart} other {# kart}}',
      '{n, plural, other {[#]}}',
    );
    const r = pruefe();
    expect(r.rc).toBe(1);
    expect(r.text).toContain('lernapp/tr: Kategorie few ungültig testprobe.n (n)');
    expect(r.text).toContain('lernapp/ar: Kategorie one fehlt testprobe.n (n)');

    mitProbe('{n, plural, one {# Karte} other {# Karten}}', '{n, plural, one {# kart}}', '{n, plural, one {[1]} other {[#]}}');
    expect(pruefe().text).toContain('lernapp/tr: plural ohne other testprobe.n (n)');
  });

  it('entwurf.json nennt nur vorhandene Schlüssel', () => {
    kopie();
    aendere('entwurf', (t) => (t.ar = [...(t.ar as string[]), 'gibt.es.nicht']));
    const r = pruefe();
    expect(r.rc).toBe(1);
    expect(r.text).toContain('lernapp/entwurf.json: ar nennt unbekannten Schlüssel gibt.es.nicht');
  });
});
