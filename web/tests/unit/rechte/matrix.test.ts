import { describe, expect, it } from 'vitest';
import { AKTIONEN, MATRIX, NIE_PER_ADMINISTRATION, ROLLEN, darf, organisationsFilter } from '@/lib/rechte/matrix';

describe('Rechte-Matrix (K-06, ADR 0003)', () => {
  it('Administration darf jede Aktion außer Chat-Inhalten (ADR 0026, S-11)', () => {
    for (const a of AKTIONEN) expect(darf([{ rolle: 'administration' }], a)).toBe(!NIE_PER_ADMINISTRATION.has(a));
  });

  it('Chat-Meldungen und Moderationsprotokoll nur mit der Rolle Kinderschutz', () => {
    const erlaubt = ROLLEN.filter((r) => MATRIX[r].has('meldung.chat.lesen'));
    expect(erlaubt).toEqual(['kinderschutz']);
    for (const a of NIE_PER_ADMINISTRATION) expect(darf([{ rolle: 'kinderschutz' }], a)).toBe(true);
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
