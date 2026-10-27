import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('@/server/queries/einstellungen', () => ({ ladeEinstellung: async () => ({}) }));

const { entscheide, entscheideWirksam, FUNKTIONEN, MIT_PERSONENDATEN, VORAUSSETZUNGEN } = await import('@/lib/funktionen');
const { IN_PRODUKTION_AN, fehlendeVoraussetzungen } = await import('@/lib/funktionen-regeln');
const { funktionenEinstellung } = await import('@/lib/validierung/einstellungen');

const prod = { SITE_MODE: 'produktion', NODE_ENV: 'production' };

describe('Funktionsschalter (ADR 0035)', () => {
  it('Produktion: ohne Angaben ist alles aus – außer den freigegebenen Funktionen ohne Personendaten', () => {
    for (const f of FUNKTIONEN) expect(entscheide(f, prod, null)).toBe(IN_PRODUKTION_AN.includes(f));
    expect(IN_PRODUKTION_AN).toEqual([
      'hadith_gesamt',
      'lernapp',
      'lernapp_ungeprueft',
      'lernapp_wissen_vorschau',
      'lernapp_sprechen',
      'lernapp_meldungen',
    ]);
  });

  it('Funktionen mit Personendaten sind in der Produktion nie standardmäßig an', () => {
    for (const f of MIT_PERSONENDATEN) expect(IN_PRODUKTION_AN).not.toContain(f);
  });

  it('auch freigegebene Funktionen lassen sich per Umgebung oder Einstellung abschalten', () => {
    expect(entscheide('hadith_gesamt', { ...prod, FUNKTION_HADITH_GESAMT: 'aus' }, null)).toBe(false);
    expect(entscheide('hadith_gesamt', prod, { hadith_gesamt: false })).toBe(false);
  });

  it('Entwicklung und Vorschau: Standard an (Vorführung)', () => {
    expect(entscheide('chat', { NODE_ENV: 'development' }, null)).toBe(true);
  });

  it('Umgebung schlägt Einstellung, Einstellung schlägt Standard', () => {
    expect(entscheide('chat', prod, { chat: true })).toBe(true);
    expect(entscheide('chat', { ...prod, FUNKTION_CHAT: 'aus' }, { chat: true })).toBe(false);
    expect(entscheide('push', { ...prod, FUNKTION_PUSH: 'an' }, { push: false })).toBe(true);
  });
});

describe('Schalter der Lern-App (KERN 4.0 §6)', () => {
  const LERNAPP = [
    'lernapp',
    'lernapp_ungeprueft',
    'lernapp_wissen_vorschau',
    'lernapp_sprechen',
    'lernapp_meldungen',
    'lernapp_sync',
    'lernapp_gruppen',
    'lernapp_rangliste',
    'lernapp_statistik',
    'push_lernapp',
  ] as const;

  it('alle zehn Schalter sind bekannt und in der Einstellung erlaubt', () => {
    for (const f of LERNAPP) {
      expect(FUNKTIONEN).toContain(f);
      expect(funktionenEinstellung.safeParse({ [f]: true }).success).toBe(true);
    }
  });

  it('Produktion: Lern-App an (Nutzer 21.10.2026); Hinweis-Modus und Meldungen an, wirken aber nur mit lernapp', () => {
    expect(entscheide('lernapp', prod, null)).toBe(true);
    expect(entscheide('lernapp_ungeprueft', prod, null)).toBe(true);
    expect(entscheide('lernapp_meldungen', prod, null)).toBe(true);
    expect(entscheideWirksam('lernapp_ungeprueft', prod, null)).toBe(true);
    expect(entscheideWirksam('lernapp_ungeprueft', { ...prod, FUNKTION_LERNAPP: 'aus' }, null)).toBe(false);
    expect(entscheideWirksam('lernapp_meldungen', prod, { lernapp: true })).toBe(true);
    // Vorschau des Wissenskurses (Nutzer 27.10.2026, L3-E22): an, wirkt nur mit lernapp, per Umgebung abschaltbar
    expect(entscheideWirksam('lernapp_wissen_vorschau', prod, null)).toBe(true);
    expect(entscheideWirksam('lernapp_wissen_vorschau', { ...prod, FUNKTION_LERNAPP: 'aus' }, null)).toBe(false);
    expect(entscheideWirksam('lernapp_wissen_vorschau', { ...prod, FUNKTION_LERNAPP_WISSEN_VORSCHAU: 'aus' }, null)).toBe(false);
    expect(entscheideWirksam('lernapp_wissen_vorschau', prod, { lernapp_wissen_vorschau: false })).toBe(false);
    // Spracherkennung (Nutzer 27.10.2026, L3-E23): an, wirkt nur mit lernapp, per Umgebung oder Einstellung abschaltbar;
    // den Schutz der Modelldateien (S-L3 N-4) setzt der Betreiber als Ratenregel der Firewall (LM-40)
    expect(entscheideWirksam('lernapp_sprechen', prod, null)).toBe(true);
    expect(entscheideWirksam('lernapp_sprechen', { ...prod, FUNKTION_LERNAPP: 'aus' }, null)).toBe(false);
    expect(entscheideWirksam('lernapp_sprechen', { ...prod, FUNKTION_LERNAPP_SPRECHEN: 'aus' }, null)).toBe(false);
    expect(entscheideWirksam('lernapp_sprechen', prod, { lernapp_sprechen: false })).toBe(false);
    // Funktionen mit Personendaten bleiben aus
    for (const f of ['lernapp_sync', 'lernapp_gruppen', 'lernapp_rangliste', 'lernapp_statistik', 'push_lernapp'] as const)
      expect(entscheideWirksam(f, { ...prod, FUNKTION_LERNAPP: 'an' }, null)).toBe(false);
  });

  it('Personendaten: Abgleich, Gruppen, Bestenliste, Statistik und Erinnerung', () => {
    for (const f of ['lernapp_sync', 'lernapp_gruppen', 'lernapp_rangliste', 'lernapp_statistik', 'push_lernapp'] as const)
      expect(MIT_PERSONENDATEN).toContain(f);
    for (const f of ['lernapp', 'lernapp_ungeprueft', 'lernapp_wissen_vorschau', 'lernapp_sprechen', 'lernapp_meldungen'] as const)
      expect(MIT_PERSONENDATEN).not.toContain(f);
  });

  it('Sperren: Abgleich braucht Konten, Gruppen Lernplattform und Konten (S-L2 H-2), Bestenliste die Gruppen, Erinnerung Push', () => {
    expect(VORAUSSETZUNGEN.lernapp_sync).toEqual(['lernapp', 'konten']);
    expect(VORAUSSETZUNGEN.lernapp_gruppen).toEqual(['lernapp', 'lernplattform', 'konten']);
    expect(VORAUSSETZUNGEN.lernapp_rangliste).toEqual(['lernapp', 'lernapp_gruppen']);
    expect(VORAUSSETZUNGEN.push_lernapp).toEqual(['lernapp', 'push']);
    for (const f of LERNAPP.filter((x) => x !== 'lernapp')) expect(VORAUSSETZUNGEN[f]).toContain('lernapp');
    const alle = { lernapp: true, lernapp_sync: true, lernapp_gruppen: true, lernapp_rangliste: true, push_lernapp: true };
    expect(entscheideWirksam('lernapp_sync', prod, { ...alle, konten: false })).toBe(false);
    expect(entscheideWirksam('lernapp_sync', prod, { ...alle, konten: true })).toBe(true);
    expect(entscheideWirksam('lernapp_gruppen', prod, { ...alle, lernplattform: true, konten: true })).toBe(true);
    // Ohne Konten keine Schreib- und Gruppenrouten, auch mit bestehenden Sitzungen (S-L2 H-2)
    expect(entscheideWirksam('lernapp_gruppen', prod, { ...alle, lernplattform: true, konten: false })).toBe(false);
    expect(fehlendeVoraussetzungen('lernapp_gruppen', prod, { ...alle, lernplattform: true, konten: false })).toEqual(['konten']);
    // Bestenliste: rekursiv – ohne Lernplattform wirken weder Gruppen noch Bestenliste
    expect(entscheideWirksam('lernapp_rangliste', prod, { ...alle, lernplattform: false })).toBe(false);
    expect(fehlendeVoraussetzungen('lernapp_rangliste', prod, { ...alle, lernplattform: false })).toEqual(['lernapp_gruppen']);
    expect(entscheideWirksam('lernapp_rangliste', prod, { ...alle, lernplattform: true, konten: true })).toBe(true);
    expect(entscheideWirksam('push_lernapp', prod, { ...alle, push: false })).toBe(false);
    expect(fehlendeVoraussetzungen('lernapp_sync', prod, { lernapp_sync: false })).toEqual([]);
  });

  it('Schalter ohne Voraussetzungen wirken wie bisher', () => {
    for (const f of FUNKTIONEN.filter((x) => !VORAUSSETZUNGEN[x])) {
      expect(entscheideWirksam(f, prod, null)).toBe(entscheide(f, prod, null));
      expect(entscheideWirksam(f, { NODE_ENV: 'development' }, null)).toBe(true);
    }
  });
});
