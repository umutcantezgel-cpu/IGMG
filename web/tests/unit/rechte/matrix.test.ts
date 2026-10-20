import { describe, expect, it } from 'vitest';
import { AKTIONEN, MATRIX, NIE_PER_ADMINISTRATION, ROLLEN, darf, darfSprachePruefen, organisationsFilter } from '@/lib/rechte/matrix';

describe('Rechte-Matrix (K-06, ADR 0003)', () => {
  it('Administration darf jede Aktion außer Chat-Inhalten (ADR 0026, S-11)', () => {
    for (const a of AKTIONEN) expect(darf([{ rolle: 'administration' }], a)).toBe(!NIE_PER_ADMINISTRATION.has(a));
  });

  it('Chat-Meldungen und Moderationsprotokoll nur mit der Rolle Kinderschutz', () => {
    const erlaubt = ROLLEN.filter((r) => MATRIX[r].has('meldung.chat.lesen'));
    expect(erlaubt).toEqual(['kinderschutz']);
    for (const a of NIE_PER_ADMINISTRATION) if (!a.startsWith('lernapp.')) expect(darf([{ rolle: 'kinderschutz' }], a)).toBe(true);
    expect(darf([{ rolle: 'administration' }, { rolle: 'bildung' }], 'moderationsprotokoll.lesen')).toBe(false);
  });

  it('Leitung liest nur und ändert nichts', () => {
    for (const a of MATRIX.leitung)
      expect(a.endsWith('.lesen') || ['verwaltung.betreten', 'postfach.nutzen', 'ticket.anlegen'].includes(a)).toBe(true);
  });

  it('religiöse Freigabe nur Administration und religiöse Prüfung', () => {
    const erlaubt = ROLLEN.filter((r) => MATRIX[r].has('religioes.freigeben'));
    expect(erlaubt.sort()).toEqual(['administration', 'religioese_pruefung']);
  });

  it('Gruppen und Lernende verwaltet nur Bildung (und Administration)', () => {
    const erlaubt = ROLLEN.filter((r) => MATRIX[r].has('lernende.bearbeiten'));
    expect(erlaubt.sort()).toEqual(['administration', 'bildung']);
  });

  it('ohne Rolle ist nichts erlaubt', () => {
    for (const a of AKTIONEN) expect(darf([], a)).toBe(false);
  });

  it('jede Rolle darf die Verwaltung betreten', () => {
    for (const r of ROLLEN) expect(MATRIX[r].has('verwaltung.betreten')).toBe(true);
  });

  it('Mitgliederverwaltung sieht nur Mitgliedsanträge, keine Voranmeldungen oder Kontaktanfragen', () => {
    const r = [{ rolle: 'mitgliederverwaltung' as const }];
    expect(darf(r, 'eingang.mitgliedsantrag.lesen')).toBe(true);
    expect(darf(r, 'eingang.voranmeldung.lesen')).toBe(false);
    expect(darf(r, 'eingang.kontakt.lesen')).toBe(false);
    expect(darf(r, 'benutzer.einladen')).toBe(false);
  });

  it('Bildung verwaltet Kurse und Voranmeldungen, aber keine Veranstaltungen', () => {
    const r = [{ rolle: 'bildung' as const }];
    expect(darf(r, 'kurs.bearbeiten')).toBe(true);
    expect(darf(r, 'eingang.voranmeldung.lesen')).toBe(true);
    expect(darf(r, 'veranstaltung.bearbeiten', { organisation: null })).toBe(false);
  });

  it('Organisationsredaktion bearbeitet nur Inhalte der eigenen Organisation', () => {
    const r = [{ rolle: 'organisationsredaktion' as const, organisation: 'gt' as const }];
    expect(darf(r, 'veranstaltung.bearbeiten', { organisation: 'gt' })).toBe(true);
    expect(darf(r, 'veranstaltung.bearbeiten', { organisation: 'kt' })).toBe(false);
    expect(darf(r, 'veranstaltung.bearbeiten', { organisation: null })).toBe(false);
    expect(darf(r, 'veranstaltung.bearbeiten')).toBe(false);
    expect(darf(r, 'veranstaltung.lesen')).toBe(true);
    expect(darf(r, 'seiteninhalt.bearbeiten')).toBe(false);
    expect(darf(r, 'eingang.voranmeldung.lesen')).toBe(false);
  });

  it('mehrere Rollen addieren sich', () => {
    const r = [{ rolle: 'bildung' as const }, { rolle: 'organisationsredaktion' as const, organisation: 'kt' as const }];
    expect(darf(r, 'kurs.bearbeiten')).toBe(true);
    expect(darf(r, 'nachricht.bearbeiten', { organisation: 'kt' })).toBe(true);
    expect(darf(r, 'nachricht.bearbeiten', { organisation: 'at' })).toBe(false);
  });

  it('Organisationsfilter: Redaktion ohne Einschränkung, Organisationsredaktion auf eigene', () => {
    expect(organisationsFilter([{ rolle: 'redaktion' }], 'veranstaltung.bearbeiten')).toBeNull();
    expect(organisationsFilter([{ rolle: 'organisationsredaktion', organisation: 'kgt' }], 'veranstaltung.bearbeiten')).toEqual(['kgt']);
    expect(organisationsFilter([{ rolle: 'bildung' }], 'veranstaltung.bearbeiten')).toEqual([]);
  });

  it('nur Administration lädt Benutzer ein und liest das Audit-Log', () => {
    for (const r of ROLLEN) {
      const erwartet = r === 'administration';
      const zuweisung = { rolle: r, organisation: r === 'organisationsredaktion' ? ('at' as const) : null };
      expect(darf([zuweisung], 'benutzer.einladen')).toBe(erwartet);
      expect(darf([zuweisung], 'audit.lesen')).toBe(erwartet);
    }
  });
});

describe('Rechte der Lern-App (PLAN §3.9, ADR 0040 Nr. 5, ADR 0041)', () => {
  const LERNAPP = AKTIONEN.filter((a) => a.startsWith('lernapp.'));
  const wer = (a: (typeof AKTIONEN)[number]) => ROLLEN.filter((r) => MATRIX[r].has(a)).sort();

  it('sieben Aktionen', () => {
    expect([...LERNAPP].sort()).toEqual(
      [
        'lernapp.audio.bearbeiten',
        'lernapp.bearbeiten',
        'lernapp.lesen',
        'lernapp.religioes.pruefen',
        'lernapp.sprache.pruefen',
        'lernapp.statistik.lesen',
        'lernapp.veroeffentlichen',
      ].sort(),
    );
  });

  it('religiöse Prüfung nur mit der Rolle religioese_pruefung – nie über die Administration', () => {
    expect(NIE_PER_ADMINISTRATION.has('lernapp.religioes.pruefen')).toBe(true);
    expect(wer('lernapp.religioes.pruefen')).toEqual(['religioese_pruefung']);
    expect(darf([{ rolle: 'administration' }], 'lernapp.religioes.pruefen')).toBe(false);
    expect(darf([{ rolle: 'administration' }, { rolle: 'bildung' }, { rolle: 'sprachpruefung' }], 'lernapp.religioes.pruefen')).toBe(false);
  });

  it('Zuordnung: Bildung pflegt, Sprachprüfung prüft Sprache, Leitung liest Statistik', () => {
    expect(wer('lernapp.bearbeiten')).toEqual(['administration', 'bildung']);
    expect(wer('lernapp.veroeffentlichen')).toEqual(['administration', 'bildung']);
    expect(wer('lernapp.audio.bearbeiten')).toEqual(['administration', 'bildung']);
    expect(wer('lernapp.sprache.pruefen')).toEqual(['administration', 'sprachpruefung']);
    expect(wer('lernapp.statistik.lesen')).toEqual(['administration', 'bildung', 'leitung']);
    expect(wer('lernapp.lesen')).toEqual(['administration', 'bildung', 'leitung', 'religioese_pruefung', 'sprachpruefung']);
  });

  it('Sprachprüfung hat nur Grundrechte und die beiden Lern-App-Rechte', () => {
    const erwartet = [
      'verwaltung.betreten',
      'uebersicht.lesen',
      'postfach.nutzen',
      'ticket.lesen',
      'ticket.anlegen',
      'styleguide.lesen',
      'medium.lesen',
      'lernapp.lesen',
      'lernapp.sprache.pruefen',
    ];
    expect([...MATRIX.sprachpruefung].sort()).toEqual(erwartet.sort());
  });

  it('religiöse Prüfung und Sprachprüfung bearbeiten und veröffentlichen nicht (Prüfende bearbeiten nicht selbst)', () => {
    for (const rolle of ['religioese_pruefung', 'sprachpruefung'] as const) {
      expect(darf([{ rolle }], 'lernapp.bearbeiten')).toBe(false);
      expect(darf([{ rolle }], 'lernapp.veroeffentlichen')).toBe(false);
      expect(darf([{ rolle }], 'lernapp.audio.bearbeiten')).toBe(false);
    }
  });

  it('darfSprachePruefen: nur mit Recht und nur in den eigenen Sprachen – auch für die Administration', () => {
    const sp = [{ rolle: 'sprachpruefung' as const }];
    expect(darfSprachePruefen(sp, ['tr'], 'tr')).toBe(true);
    expect(darfSprachePruefen(sp, ['tr'], 'ar')).toBe(false);
    expect(darfSprachePruefen(sp, [], 'de')).toBe(false);
    expect(darfSprachePruefen(sp, ['de', 'tr', 'ar'], 'ar')).toBe(true);
    expect(darfSprachePruefen([{ rolle: 'administration' }], [], 'de')).toBe(false);
    expect(darfSprachePruefen([{ rolle: 'administration' }], ['de'], 'de')).toBe(true);
    expect(darfSprachePruefen([{ rolle: 'bildung' }], ['de'], 'de')).toBe(false);
    expect(darfSprachePruefen([{ rolle: 'religioese_pruefung' }], ['ar'], 'ar')).toBe(false);
    expect(darfSprachePruefen([], ['de'], 'de')).toBe(false);
  });
});
