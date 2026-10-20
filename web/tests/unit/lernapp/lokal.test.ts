import 'fake-indexeddb/auto';
import { openDB } from 'idb';
import { describe, expect, it } from 'vitest';
import {
  haengeAlleAn,
  haengeAn,
  ausstehende,
  brauchtNeuableitung,
  ereignisse,
  markiereSynchron,
  uebernimm,
} from '@/lib/lernapp/lokal/ausgang';
import { leiteNeuAb } from '@/lib/lernapp/lokal/ableitung';
import {
  arbeitsspeicher,
  DB_NAME,
  DB_VERSION,
  MIGRATIONEN,
  oeffneSpeicher,
  SPEICHER,
  type Speicher,
  vergleicheSchluessel,
} from '@/lib/lernapp/lokal/db';
import { alsDatei, EXPORT_FORMAT, exportiere, importiere, liesExport } from '@/lib/lernapp/lokal/export';
import { aendereProfil, aktivesProfil, legeProfilAn, loescheProfil, neueUuid, profile, setzeAktiv } from '@/lib/lernapp/lokal/profile';
import type { EreignisEntwurf } from '@/lib/lernapp/ereignisse/typen';

/**
 * Lokale Datenhaltung (ADR 0038 Nr. 1, 2, 8; Fortschreibung S6): IndexedDB über idb (im Test fake-indexeddb) und der
 * Rückfall im Arbeitsspeicher verhalten sich gleich. Mehrere Profile je Gerät, Ausgang mit Nummer je Gerät, Export und
 * Import als JSON mit Zod-Prüfung.
 */
let nr = 0;
const neueDb = () => oeffneSpeicher({ name: `igmg-lernapp-test-${nr++}` });

const JETZT = new Date('2026-10-17T10:00:00.000Z');
const ZONE = 'Europe/Berlin';
const BEWERTUNG: EreignisEntwurf = { art: 'bewertung', daten: { karte: 'tr.a1.l0001', note: 'gut', kurs: 'tr-aus-de' } };
const LEKTION_FERTIG: EreignisEntwurf = {
  art: 'lektion',
  daten: { kurs: 'tr-aus-de', lektion: 'tr-aus-de.a1.e01.l01', art: 'lektion', richtig: 3, gesamt: 3 },
};
const XP: EreignisEntwurf = { art: 'xp', daten: { menge: 10, grund: 'lektion', bezug: 'tr-aus-de.a1.e01.l01' } };

describe('Datenbank öffnen', () => {
  it('IndexedDB `igmg-lernapp` Version 1 mit allen Speichern und Indizes aus ADR 0038', async () => {
    expect(DB_NAME).toBe('igmg-lernapp');
    expect(MIGRATIONEN).toHaveLength(DB_VERSION);
    const sp = await oeffneSpeicher({ name: 'igmg-lernapp-schema' });
    expect(sp).toMatchObject({ art: 'indexeddb', hinweis: null });
    sp.schliesse();
    const db = await openDB('igmg-lernapp-schema');
    expect(db.version).toBe(1);
    expect([...db.objectStoreNames].sort()).toEqual(Object.keys(SPEICHER).sort());
    const tx = db.transaction(['ereignisse', 'karten'], 'readonly');
    expect(tx.objectStore('ereignisse').keyPath).toEqual(['profil', 'geraet', 'seq']);
    expect([...tx.objectStore('ereignisse').indexNames].sort()).toEqual(['profil-am', 'profil-synchron']);
    expect([...tx.objectStore('karten').indexNames]).toEqual(['profil-faellig']);
    db.close();
  });

  it('ohne IndexedDB: Arbeitsspeicher mit Hinweis', async () => {
    const sp = await oeffneSpeicher({ fabrik: null });
    expect(sp).toMatchObject({ art: 'arbeitsspeicher', hinweis: 'keinIndexedDb' });
  });

  it('Fehler beim Öffnen (gesperrter Speicher): Arbeitsspeicher mit Hinweis „gesperrt“', async () => {
    const kaputt = {
      open: () => {
        throw new DOMException('gesperrt', 'SecurityError');
      },
    } as unknown as IDBFactory;
    const echt = globalThis.indexedDB;
    globalThis.indexedDB = kaputt;
    try {
      expect(await oeffneSpeicher({ name: 'x' })).toMatchObject({ art: 'arbeitsspeicher', hinweis: 'gesperrt' });
    } finally {
      globalThis.indexedDB = echt;
    }
  });

  it('Stand bleibt nach erneutem Öffnen erhalten', async () => {
    const name = 'igmg-lernapp-bleibt';
    const a = await oeffneSpeicher({ name });
    const p = await legeProfilAn(a, { name: '[Name]', oberflaeche: 'de' });
    await haengeAn(a, p, BEWERTUNG, { jetzt: JETZT, zeitzone: ZONE });
    a.schliesse();
    const b = await oeffneSpeicher({ name });
    expect((await aktivesProfil(b))?.id).toBe(p.id);
    expect(await ereignisse(b, p.id)).toHaveLength(1);
    b.schliesse();
  });

  it('Schlüsselordnung wie IndexedDB: Zahl < Text < Liste, Listen elementweise', () => {
    const k = [['a', []], ['a'], 'z', 3, ['a', 'b', 1], ['a', 'b'], ['a', 'b', 0], ['b']];
    const sortiert = [...k].sort(vergleicheSchluessel);
    expect(sortiert).toEqual([3, 'z', ['a'], ['a', 'b'], ['a', 'b', 0], ['a', 'b', 1], ['a', []], ['b']]);
    expect(sortiert.map((x) => indexedDB.cmp(x, sortiert[0]!))).toEqual([0, 1, 1, 1, 1, 1, 1, 1]);
    for (let i = 1; i < sortiert.length; i++) expect(indexedDB.cmp(sortiert[i - 1]!, sortiert[i]!)).toBe(-1);
  });
});

describe.each([
  ['IndexedDB', neueDb],
  ['Arbeitsspeicher', async () => arbeitsspeicher()],
] as [string, () => Promise<Speicher>][])('%s', (_name, oeffne) => {
  it('mehrere Profile je Gerät; aktives Profil; ändern; löschen entfernt alle Daten des Profils', async () => {
    const sp = await oeffne();
    expect(await aktivesProfil(sp)).toBeNull();
    const a = await legeProfilAn(
      sp,
      { name: '[Kind 1]', oberflaeche: 'tr', ausgangssprache: 'tr' },
      { jetzt: new Date('2026-10-01T10:00:00Z') },
    );
    const b = await legeProfilAn(sp, { name: '[Kind 2]', oberflaeche: 'ar' }, { jetzt: new Date('2026-10-02T10:00:00Z') });
    expect(a.geraet).not.toBe(b.geraet);
    expect((await profile(sp)).map((p) => p.name)).toEqual(['[Kind 1]', '[Kind 2]']);
    expect((await aktivesProfil(sp))?.id).toBe(b.id);
    await setzeAktiv(sp, a.id);
    expect((await aktivesProfil(sp))?.id).toBe(a.id);
    expect((await aendereProfil(sp, a.id, { name: '  [Kind 1a] ' })).name).toBe('[Kind 1a]');
    await expect(legeProfilAn(sp, { name: '   ', oberflaeche: 'de' })).rejects.toThrow();
    await haengeAlleAn(sp, a, [BEWERTUNG, LEKTION_FERTIG, XP], { jetzt: JETZT, zeitzone: ZONE });
    await haengeAn(sp, b, XP, { jetzt: JETZT, zeitzone: ZONE });
    await leiteNeuAb(sp, a.id, '2026-10-17');
    await loescheProfil(sp, a.id);
    expect(await ereignisse(sp, a.id)).toEqual([]);
    expect(await sp.alle('karten')).toEqual([]);
    expect(await sp.alle('lektionen')).toEqual([]);
    expect(await ereignisse(sp, b.id)).toHaveLength(1);
    expect((await aktivesProfil(sp))?.id).toBe(b.id);
  });

  it('Ausgang: Nummer je Gerät fortlaufend ab 0, Zeit und Lerntag in Ortszeit, geprüft', async () => {
    const sp = await oeffne();
    const p = await legeProfilAn(sp, { name: '[Name]', oberflaeche: 'de' });
    const spaet = new Date('2026-10-17T22:30:00.000Z'); // 00:30 in Berlin
    const [e0, e1] = await haengeAlleAn(sp, p, [BEWERTUNG, XP], { jetzt: spaet, zeitzone: ZONE });
    expect(e0).toMatchObject({ geraet: p.geraet, seq: 0, am: '2026-10-17T22:30:00.000Z', tag: '2026-10-18', art: 'bewertung' });
    expect(e1).toMatchObject({ seq: 1, art: 'xp' });
    await expect(haengeAn(sp, p, { art: 'xp', daten: { menge: 0, grund: 'lektion' } } as EreignisEntwurf)).rejects.toThrow();
    expect(await ereignisse(sp, p.id)).toHaveLength(2);
  });

  it('gleichzeitiges Anhängen vergibt jede Nummer einmal', async () => {
    const sp = await oeffne();
    const p = await legeProfilAn(sp, { name: '[Name]', oberflaeche: 'de' });
    const alle = await Promise.all(Array.from({ length: 20 }, () => haengeAn(sp, p, XP, { jetzt: JETZT })));
    expect(new Set(alle.map((e) => e.seq)).size).toBe(20);
    expect((await ereignisse(sp, p.id)).map((e) => e.seq).sort((x, y) => x - y)).toEqual(Array.from({ length: 20 }, (_, i) => i));
  });

  it('ausstehende, markieren, fremde übernehmen (idempotent)', async () => {
    const sp = await oeffne();
    const p = await legeProfilAn(sp, { name: '[Name]', oberflaeche: 'de' });
    const eigene = await haengeAlleAn(sp, p, [BEWERTUNG, LEKTION_FERTIG, XP], { jetzt: JETZT, zeitzone: ZONE });
    expect(await ausstehende(sp, p.id)).toHaveLength(3);
    expect(await ausstehende(sp, p.id, 2)).toHaveLength(2);
    await markiereSynchron(sp, p.id, eigene.slice(0, 2));
    expect((await ausstehende(sp, p.id)).map((e) => e.seq)).toEqual([2]);
    const fremd = { ...eigene[0]!, geraet: neueUuid(), seq: 7 };
    expect(await uebernimm(sp, p.id, [fremd, eigene[2], { kaputt: true }])).toEqual({ neu: 1, vorhanden: 1, ungueltig: 1 });
    expect(await uebernimm(sp, p.id, [fremd])).toEqual({ neu: 0, vorhanden: 1, ungueltig: 0 });
    expect(await ausstehende(sp, p.id)).toEqual([]);
    expect(await ereignisse(sp, p.id)).toHaveLength(4);
  });

  it('Neuableitung schreibt Karten, Lektionen, Tage und Einstellungen und vermerkt die Version', async () => {
    const sp = await oeffne();
    const p = await legeProfilAn(sp, { name: '[Name]', oberflaeche: 'de' });
    expect(brauchtNeuableitung(p)).toBe(true);
    await haengeAlleAn(sp, p, [BEWERTUNG, LEKTION_FERTIG, XP, { art: 'einstellung', daten: { schluessel: 'pausetage', wert: 1 } }], {
      jetzt: JETZT,
      zeitzone: ZONE,
    });
    const a = await leiteNeuAb(sp, p.id, '2026-10-17');
    expect(a.xpGesamt).toBe(10);
    expect(await sp.alle('karten')).toMatchObject([{ profil: p.id, karte: 'tr.a1.l0001', letzteNote: 'gut' }]);
    expect(await sp.alle('lektionen')).toMatchObject([{ profil: p.id, lektion: 'tr-aus-de.a1.e01.l01', besteQuote: 1 }]);
    expect(await sp.alle('tage')).toMatchObject([{ profil: p.id, tag: '2026-10-17', xp: 10, erreicht: true }]);
    expect(await sp.lies('einstellungen', [p.id, 'pausetage'])).toMatchObject({ wert: 1, geraet: p.geraet });
    expect(brauchtNeuableitung((await sp.lies('profile', p.id))!)).toBe(false);
    const faellig = await sp.alleIndex('karten', 'profil-faellig', [[p.id], [p.id, []]]);
    expect(faellig).toHaveLength(1);
  });

  it('Export und Import (Art. 20): neues Profil mit eigener Geräte-UUID, gleiche Ereignisse, idempotent', async () => {
    const sp = await oeffne();
    const p = await legeProfilAn(sp, { name: '[Name]', oberflaeche: 'tr', ausgangssprache: 'tr' });
    await aendereProfil(sp, p.id, { benutzerId: '[konto]' });
    await haengeAlleAn(sp, p, [BEWERTUNG, LEKTION_FERTIG, XP], { jetzt: JETZT, zeitzone: ZONE });
    const datei = await exportiere(sp, p.id, JETZT);
    expect(datei).toMatchObject({
      format: EXPORT_FORMAT,
      version: 1,
      profil: { name: '[Name]', oberflaeche: 'tr', ausgangssprache: 'tr' },
    });
    expect(JSON.stringify(datei)).not.toContain('[konto]');
    expect(datei.ereignisse).toHaveLength(3);
    const text = alsDatei(datei);
    expect(text).toMatchObject({ name: 'igmg-lernapp-2026-10-17.json', typ: 'application/json' });

    const ziel = await oeffne();
    const gelesen = liesExport(text.inhalt);
    if (!gelesen.ok) throw new Error(gelesen.fehler);
    const r = await importiere(ziel, gelesen.daten, { als: 'neu' }, { heute: '2026-10-17', jetzt: JETZT });
    expect(r).toMatchObject({ neu: 3, vorhanden: 0 });
    expect(r.profil.geraet).not.toBe(p.geraet);
    expect(r.profil.benutzerId).toBeUndefined();
    expect(await ereignisse(ziel, r.profil.id)).toEqual(datei.ereignisse);
    expect(r.ableitung.xpGesamt).toBe(10);
    expect(await importiere(ziel, gelesen.daten, { profil: r.profil.id }, { heute: '2026-10-17' })).toMatchObject({ neu: 0, vorhanden: 3 });
    const nachher = await haengeAn(ziel, r.profil, XP, { jetzt: JETZT });
    expect(nachher).toMatchObject({ geraet: r.profil.geraet, seq: 0 });
  });
});

describe('Export einlesen', () => {
  it('weist ungültige Dateien ab', () => {
    expect(liesExport('{')).toEqual({ ok: false, fehler: 'keinJson' });
    expect(liesExport('{"format":"anders"}')).toEqual({ ok: false, fehler: 'format' });
    expect(liesExport('x'.repeat(25_000_001))).toEqual({ ok: false, fehler: 'zuGross' });
    const gueltig = {
      format: EXPORT_FORMAT,
      version: 1,
      erstellt: '2026-10-17T10:00:00.000Z',
      profil: { name: '[Name]', oberflaeche: 'de', angelegt: '2026-10-01T10:00:00.000Z' },
      ereignisse: [],
    };
    expect(liesExport(JSON.stringify(gueltig)).ok).toBe(true);
    expect(liesExport(JSON.stringify({ ...gueltig, ereignisse: [{ art: 'xp' }] })).ok).toBe(false);
    expect(liesExport(JSON.stringify({ ...gueltig, profil: { ...gueltig.profil, benutzerId: 'x' } })).ok).toBe(false);
  });

  it('UUID-Ersatz ohne crypto.randomUUID ist eine gültige UUID v4', () => {
    const echt = crypto.randomUUID;
    Object.defineProperty(crypto, 'randomUUID', { value: undefined, configurable: true });
    try {
      expect(neueUuid()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    } finally {
      Object.defineProperty(crypto, 'randomUUID', { value: echt, configurable: true });
    }
  });
});
