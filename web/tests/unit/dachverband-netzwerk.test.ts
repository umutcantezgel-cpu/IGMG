import { describe, expect, it } from 'vitest';
import { ERLAUBTE_HOSTS, NETZWERK, NETZWERK_SCHLUESSEL, NETZWERK_STAND, netzwerkZiel, type NetzwerkZiel } from '@/lib/dachverband/netzwerk';
import texte from '../../messages/bereiche/dachverband.json';

/**
 * IGMG-Netzwerk (Plan Marktstart, Welle 1): nur https, Deutsch immer da, Hosts aus einer fest eingetragenen Positivliste
 * (eine Erweiterung bleibt eine bewusste Änderung dieses Tests), keine Abfrage außer beim Gebetskalender, Texte in allen
 * Sprachen. Nicht aufgenommen: tip.igmg.org, der YouTube-Kanal und App-Store-Links (Menschen-Punkt).
 */
const POSITIVLISTE = [
  'camiahaber.com',
  'eurohalal.eu',
  'perspektif.eu',
  'www.hasene.org',
  'www.igmg.org',
  'www.igmgcocuk.org',
  'www.igmgreisen.com',
  'www.sabahulkesi.com',
  'www.ukba.eu',
];
const SPRACHEN = ['de', 'tr', 'en'] as const;
const eintraege = Object.entries(NETZWERK) as [string, NetzwerkZiel][];
const adressen = eintraege.flatMap(([schluessel, z]) => Object.entries(z.url).map(([sprache, url]) => ({ schluessel, sprache, url })));

describe('IGMG-Netzwerk', () => {
  it('hat einen Stand als Kalendertag und alle erwarteten Ziele', () => {
    expect(NETZWERK_STAND).toBe('2026-10-27');
    expect(NETZWERK_SCHLUESSEL).toEqual(Object.keys(NETZWERK));
    expect(NETZWERK_SCHLUESSEL.length).toBe(38);
  });

  it('jede Adresse ist https mit Host aus der Positivliste; Deutsch ist immer da', () => {
    for (const [schluessel, z] of eintraege) expect(z.url.de, schluessel).toMatch(/^https:\/\//);
    for (const { schluessel, sprache, url } of adressen) {
      const u = new URL(url);
      expect(u.protocol, `${schluessel}.${sprache}`).toBe('https:');
      expect(POSITIVLISTE, `${schluessel}.${sprache}: ${u.hostname}`).toContain(u.hostname);
      expect(u.username + u.password + u.hash, `${schluessel}.${sprache}`).toBe('');
    }
    expect([...ERLAUBTE_HOSTS]).toEqual(POSITIVLISTE);
  });

  it('keine Abfrage-Parameter außer beim Gebetskalender (Wetzlar = 20238)', () => {
    for (const { schluessel, sprache, url } of adressen) {
      if (schluessel === 'gebetskalender') expect(new URL(url).search, sprache).toBe('?stadt=Wetzlar&id=20238');
      else expect(new URL(url).search, `${schluessel}.${sprache}`).toBe('');
    }
  });

  it('nicht aufgenommen: tip.igmg.org, YouTube und App-Stores', () => {
    for (const { url } of adressen) expect(url).not.toMatch(/tip\.igmg\.org|youtube|youtu\.be|apps\.apple|play\.google/);
  });

  it('Zielsprache passt zu den Adressen: eigene Fassung → eigene Sprache; Rückfall nur auf Deutsch oder Türkisch', () => {
    for (const [schluessel, z] of eintraege) {
      for (const s of SPRACHEN) {
        const ziel = z.zielSprache[s];
        if (s !== 'de' && z.url[s]) expect(ziel, `${schluessel}.${s}`).toBe(s);
        if (ziel !== s) expect(['de', 'tr'], `${schluessel}.${s}`).toContain(ziel);
      }
    }
  });

  it('netzwerkZiel: Adresse mit Rückfall auf Deutsch und Kennzeichen für den sichtbaren Sprachhinweis', () => {
    expect(netzwerkZiel('igmg', 'tr')).toEqual({ href: 'https://www.igmg.org/tr/', zielSprache: 'tr', rueckfall: false });
    expect(netzwerkZiel('reisen', 'en')).toEqual({ href: 'https://www.igmgreisen.com/de/', zielSprache: 'de', rueckfall: true });
    expect(netzwerkZiel('gebetskalender', 'tr').href).toBe('https://www.igmg.org/tr/gebetskalender?stadt=Wetzlar&id=20238');
    expect(netzwerkZiel('kontakt', 'de')).toEqual({ href: 'https://www.igmg.org/kontakt/', zielSprache: 'de', rueckfall: false });
    // Seiten nur auf Türkisch: auf Deutsch mit Hinweis, auf Türkisch ohne
    expect(netzwerkZiel('kinderclub', 'de')).toMatchObject({ zielSprache: 'tr', rueckfall: true });
    expect(netzwerkZiel('kinderclub', 'tr')).toMatchObject({ zielSprache: 'tr', rueckfall: false });
    // Download-Seite mit Material in allen drei Sprachen: nie ein Hinweis
    for (const s of SPRACHEN) expect(netzwerkZiel('ramazanYoldasim', s).rueckfall).toBe(false);
  });

  it('jedes Ziel hat Titel und Kurzbeschreibung in de, tr und en (messages/bereiche/dachverband.json)', () => {
    for (const s of SPRACHEN) {
      const ziele = texte[s].dachverband.ziele as Record<string, { titel: string; beschreibung: string }>;
      expect(Object.keys(ziele).sort(), s).toEqual([...NETZWERK_SCHLUESSEL].sort());
      for (const [schluessel, { titel, beschreibung }] of Object.entries(ziele)) {
        expect(titel.trim(), `${s}.${schluessel}.titel`).not.toBe('');
        expect(beschreibung.trim(), `${s}.${schluessel}.beschreibung`).not.toBe('');
        expect(titel.length, `${s}.${schluessel}.titel`).toBeLessThanOrEqual(60);
        expect(beschreibung.length, `${s}.${schluessel}.beschreibung`).toBeLessThanOrEqual(200);
      }
    }
  });
});
