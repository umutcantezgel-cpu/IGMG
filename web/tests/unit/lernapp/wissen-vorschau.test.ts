import { describe, expect, it } from 'vitest';
import {
  type FreigabeBaustein,
  type Pruefung,
  type ReligioeserBaustein,
  wissensAufgabeVorschauSichtbar,
  wissenSichtbar,
  wissenVorschauSichtbar,
} from '@/lib/lernapp/freigabe';
import { baueVerzeichnis } from '@/lib/lernapp/paket/bauen';
import { sha256Hex } from '@/lib/lernapp/paket/hash';
import { PaketSchema, VerzeichnisSchema } from '@/lib/lernapp/paket/typen';
import { baueWissensEinheit, type WissensEinheitEingabe, type WissensLektionRoh, wissensLektionImPaket } from '@/lib/lernapp/paket/wissen';

/**
 * Vorschau ungeprüfter Wissensinhalte (Schalter `lernapp_wissen_vorschau`, `_lernapp/ENTSCHEIDUNGEN.md` L3-E22): aus → nichts
 * ohne zwei Freigaben, Paket byte-gleich wie vor dem Schalter; an → Lektionen ohne Freigaben als gekennzeichneter Entwurf
 * (`entwurf: true` statt Prüfvermerk, Paket und Verzeichnis `vorschau: true`, anderer Hash). Auch in der Vorschau nie:
 * zurückgezogen, Einwand einer Person mit der Rolle, fehlender Beleg, KI-Herkunft bei Arten nur für Menschen. Zwei Freigaben →
 * Prüfvermerk, kein Entwurf. Nur Platzhalter (KI-Regel 2).
 */

const HASH = 'a'.repeat(64);
const QUELLE = '[Werk] ([Autor]), [Kitab], [Ausgabe], Bd. 1, S. 2';
const ZWEI = ['2026-10-20T10:00:00Z', '2026-10-21T10:00:00Z'];

const baustein = (art: string, belege = art === 'aussage' ? 1 : 0): ReligioeserBaustein => ({
  inhaltHash: HASH,
  verfasser: ['ki:lauf-test'],
  belege: Array.from({ length: belege }, (_, i) => ({ id: `beleg-${i}`, inhaltHash: HASH })),
  belegPflicht: art === 'aussage',
  art,
});
const urteil = (person: string, b: ReligioeserBaustein, am: string, u: Pruefung['urteil'] = 'ok'): Pruefung => ({
  pruefendeId: person,
  pruefendeRollen: ['religioese_pruefung'],
  art: 'religioes',
  urteil: u,
  inhaltHash: b.inhaltHash,
  belegeGeprueft: b.belege.map((x) => ({ belegId: x.id, inhaltHash: x.inhaltHash })),
  am: new Date(am),
});
/** Baustein mit `n` Freigaben (je eine andere Person). */
const mit = (art: string, n: number, b = baustein(art)): FreigabeBaustein => ({
  status: 'entwurf',
  baustein: b,
  pruefungen: ZWEI.slice(0, n).map((t, i) => urteil(`pruefer-${i + 1}`, b, t)),
});

const WF = { behauptung: '[Behauptung]', richtig: true, begruendung: '[Begründung]' };
function lektion(n: number, schluessel = 'islam.grund.e01.l01', anders: Partial<WissensLektionRoh> = {}): WissensLektionRoh {
  const aussage = { schluessel: `${schluessel}.a01`, text: '[Aussage]', quelle: QUELLE, strittig: false, freigabe: mit('aussage', n) };
  return {
    schluessel,
    art: 'lektion',
    titel: '[Lektion]',
    kinderGeeignet: true,
    freigabe: mit('lektion', n),
    aussagen: [aussage],
    aufgaben: [{ schluessel: `${schluessel}.q01`, typ: 'wahr_falsch', daten: WF, aussage, freigabe: mit('aufgabe', n) }],
    ...anders,
  };
}
const einheit = (
  lektionen: WissensLektionRoh[],
  status: WissensEinheitEingabe['einheit']['status'] = 'entwurf',
): WissensEinheitEingabe => ({
  einheit: { schluessel: 'islam.grund.e01', stufe: 'grund', reihenfolge: 1, thema: { de: '[Thema]' }, symbol: null, status },
  lektionen,
});

describe('Regel der Vorschau (freigabe.ts)', () => {
  it('ohne Freigaben sichtbar; zurückgezogen, Einwand, fehlender Beleg oder KI-Herkunft (nur Menschen) nie', () => {
    const b = baustein('aussage');
    expect(wissenSichtbar('entwurf', b, [])).toBe(false);
    expect(wissenVorschauSichtbar('entwurf', b, [])).toBe(true);
    expect(wissenVorschauSichtbar('gesperrt', b, [])).toBe(false);
    expect(wissenVorschauSichtbar('entwurf', b, [urteil('p1', b, ZWEI[0]!, 'abgelehnt')])).toBe(false);
    expect(wissenVorschauSichtbar('entwurf', b, [urteil('p1', b, ZWEI[0]!, 'aenderungsvorschlag')])).toBe(false);
    // ein Einwand zu einem alten Hash sperrt nicht (neuer Stand)
    expect(wissenVorschauSichtbar('entwurf', b, [{ ...urteil('p1', b, ZWEI[0]!, 'abgelehnt'), inhaltHash: 'b'.repeat(64) }])).toBe(true);
    expect(wissenVorschauSichtbar('entwurf', baustein('aussage', 0), [])).toBe(false);
    expect(wissenVorschauSichtbar('entwurf', baustein('koran_bedeutung'), [])).toBe(false);
  });

  it('Quizfrage: sie selbst und mindestens eine Aussage', () => {
    expect(wissensAufgabeVorschauSichtbar(mit('aufgabe', 0), [mit('aussage', 0)])).toBe(true);
    expect(wissensAufgabeVorschauSichtbar(mit('aufgabe', 0), [])).toBe(false);
    expect(wissensAufgabeVorschauSichtbar(mit('aufgabe', 0), [{ ...mit('aussage', 0), status: 'gesperrt' }])).toBe(false);
  });
});

describe('Paketbau mit und ohne Vorschau', () => {
  it('aus: ohne zwei Freigaben keine Lektion; mit Freigaben byte-gleich wie ohne Angabe', () => {
    expect(baueWissensEinheit(einheit([lektion(0)]))).toBeNull();
    expect(baueWissensEinheit(einheit([lektion(0)]), { vorschau: false })).toBeNull();
    expect(wissensLektionImPaket(lektion(1))).toBeNull();
    const geprueft = baueWissensEinheit(einheit([lektion(2)]))!;
    expect(baueWissensEinheit(einheit([lektion(2)]), { vorschau: false })!.json).toBe(geprueft.json);
    expect(geprueft.paket).not.toHaveProperty('vorschau');
    expect(geprueft.json).not.toContain('entwurf');
  });

  it('an: Lektion ohne Freigaben als Entwurf (statt Prüfvermerk), Paket vorschau, anderer Hash = SHA-256 der Bytes', () => {
    const r = baueWissensEinheit(einheit([lektion(0)]), { vorschau: true })!;
    expect(r).not.toBeNull();
    expect(r.paket.vorschau).toBe(true);
    expect(r.paket.wissen?.['islam.grund.e01.l01']).toEqual({
      entwurf: true,
      kinderGeeignet: true,
      aussagen: [{ schluessel: 'islam.grund.e01.l01.a01', text: '[Aussage]', quelle: QUELLE }],
    });
    expect(r.paket.lektionen[0]!.aufgaben[0]).toMatchObject({ typ: 'wahr_falsch', quelle: QUELLE });
    expect(PaketSchema.safeParse(JSON.parse(r.json)).success).toBe(true);
    expect(sha256Hex(r.json)).toBe(r.hash);
    // eine Freigabe reicht nicht für den Prüfvermerk: auch Entwurf
    expect(wissensLektionImPaket(lektion(1), { vorschau: true })?.vermerk).toMatchObject({ entwurf: true });
    // Verzeichnis: die Einheit trägt vorschau
    const v = baueVerzeichnis({
      kurs: 'islam',
      kursId: 'islam',
      zielsprache: 'de',
      ausgangssprache: null,
      stand: 1,
      einheiten: [r],
      stufenFolge: ['grund', 'aufbau', 'vertiefung'],
    });
    expect(VerzeichnisSchema.parse(v).einheiten[0]).toMatchObject({ vorschau: true, hash: r.hash, lektionen: 1 });
  });

  it('zwei Freigaben → Prüfvermerk ohne Entwurf, auch mit Vorschau; Paket dann ohne vorschau und byte-gleich', () => {
    const r = baueWissensEinheit(einheit([lektion(2)]), { vorschau: true })!;
    expect(r.paket.wissen?.['islam.grund.e01.l01']).toMatchObject({ geprueftAm: '2026-10-21' });
    expect(r.paket.wissen?.['islam.grund.e01.l01']).not.toHaveProperty('entwurf');
    expect(r.json).toBe(baueWissensEinheit(einheit([lektion(2)]))!.json);
  });

  it('gemischte Einheit: geprüfte Lektion mit Vermerk, ungeprüfte als Entwurf; ohne Vorschau nur die geprüfte', () => {
    const e = einheit([lektion(2), lektion(0, 'islam.grund.e01.l02')]);
    const an = baueWissensEinheit(e, { vorschau: true })!;
    expect(an.paket.lektionen.map((l) => l.schluessel)).toEqual(['islam.grund.e01.l01', 'islam.grund.e01.l02']);
    expect(an.paket.wissen?.['islam.grund.e01.l01']).toHaveProperty('geprueftAm');
    expect(an.paket.wissen?.['islam.grund.e01.l02']).toHaveProperty('entwurf', true);
    expect(an.paket.vorschau).toBe(true);
    const aus = baueWissensEinheit(e)!;
    expect(aus.paket.lektionen.map((l) => l.schluessel)).toEqual(['islam.grund.e01.l01']);
    expect(aus.hash).not.toBe(an.hash);
  });

  it('auch in der Vorschau nie: zurückgezogen, Einwand, fehlender Beleg, nicht spielbare Quizfrage, gesperrte Einheit', () => {
    const v = { vorschau: true };
    const l = lektion(0);
    const aussage = l.aussagen[0]!;
    expect(wissensLektionImPaket({ ...l, freigabe: { ...l.freigabe, status: 'gesperrt' } }, v)).toBeNull();
    const einwand = {
      ...aussage,
      freigabe: { ...aussage.freigabe, pruefungen: [urteil('p1', aussage.freigabe.baustein, ZWEI[0]!, 'abgelehnt')] },
    };
    expect(wissensLektionImPaket({ ...l, aussagen: [einwand] }, v)).toBeNull();
    const ohneBeleg = { ...aussage, freigabe: mit('aussage', 0, baustein('aussage', 0)) };
    expect(wissensLektionImPaket({ ...l, aussagen: [ohneBeleg] }, v)).toBeNull();
    // Quizfrage, deren Aussage einen Einwand hat
    expect(wissensLektionImPaket({ ...l, aufgaben: [{ ...l.aufgaben[0]!, aussage: einwand }] }, v)).toBeNull();
    expect(wissensLektionImPaket({ ...l, aufgaben: [{ ...l.aufgaben[0]!, daten: { behauptung: '' } }] }, v)).toBeNull();
    expect(wissensLektionImPaket({ ...l, aufgaben: [{ ...l.aufgaben[0]!, aussage: null }] }, v)).toBeNull();
    expect(baueWissensEinheit(einheit([l], 'gesperrt'), v)).toBeNull();
  });

  it('PaketSchema: vorschau genau mit einer Lektion im Entwurf; Prüfvermerk und Entwurf nie zugleich', () => {
    const r = baueWissensEinheit(einheit([lektion(0)]), { vorschau: true })!;
    const { vorschau: _v, ...ohne } = r.paket;
    expect(PaketSchema.safeParse(ohne).success).toBe(false);
    const geprueft = baueWissensEinheit(einheit([lektion(2)]))!.paket;
    expect(PaketSchema.safeParse({ ...geprueft, vorschau: true }).success).toBe(false);
    const beides = {
      ...r.paket,
      wissen: { 'islam.grund.e01.l01': { ...r.paket.wissen!['islam.grund.e01.l01']!, geprueftAm: '2026-10-21' } },
    };
    expect(PaketSchema.safeParse(beides).success).toBe(false);
  });
});
