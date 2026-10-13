import { describe, expect, it } from 'vitest';
import { PROJEKTE_BEISPIEL } from '../../drizzle/seeds/bereiche/projekte';
import { ZEITLEISTE_EROEFFNUNG } from '../../drizzle/seeds/bereiche/ueber-uns';
import { projekteNeu, stabil, ueberUnsNeu } from '@/lib/inhalt/stand-2026';
import { schema as projekteSchema } from '@/lib/validierung/seiteninhalte/projekte';

/**
 * Inhaltsstand 2026 (AUFTRAG 3.9, E0-K05): Seeds ohne Bauphase, Platzhalter statt unbelegter Fakten, und die reine
 * Umrechnung der Migration (idempotent, nur die Station „Zukunft“ wird ersetzt). Datenbankfälle: tests/integration.
 */
const station = (de: string, reihenfolge: number) => ({
  kennzeichnung: { de },
  titel: { de: `${de} – Titel` },
  bildbeschreibung: { de: `Foto: ${de}` },
  reihenfolge,
  symbol: 'standort' as const,
});

describe('Seed „projekte“ Stand 2026', () => {
  const inhalt = projekteSchema.parse(PROJEKTE_BEISPIEL);

  it('Neue Fatih-Moschee, fertiggestellt, alle Meilensteine erledigt, Eröffnung zuletzt', () => {
    expect(inhalt.projekt.name.de).toBe('Neue Fatih-Moschee');
    expect(inhalt.projekt.status).toBe('fertiggestellt');
    expect(inhalt.meilensteine.every((m) => m.erledigt)).toBe(true);
    expect(inhalt.meilensteine.at(-1)?.titel.de).toBe('Eröffnung');
  });

  it('keine unbelegten Zahlen, keine Behördenaussage, kein „Bau“ im Spendenaufruf', () => {
    expect(inhalt.projekt.kapazitaet.wert).toBeNull();
    expect(inhalt.projekt.flaecheM2).toBeNull();
    expect(inhalt.projekt.einrichtungen).toEqual([]);
    const texte = stabil(inhalt);
    expect(texte).not.toMatch(/blockiert|Verwaltung|bloke|administration/i);
    expect(stabil(inhalt.unterstuetzung) + stabil(inhalt.spende)).not.toMatch(/\bBau|historisch|inşa|construction/i);
    expect(inhalt.spende.text.de).toMatch(/^\[.+\]$/);
  });

  it('Schema-Standard ist „fertiggestellt“', () => {
    expect(projekteSchema.parse({}).projekt.status).toBe('fertiggestellt');
  });
});

describe('Migration (reine Umrechnung)', () => {
  it('projekte: alter Stand → Seed-Stand; Seed-Stand → nichts zu tun (auch mit umgeordneten Schlüsseln)', () => {
    const alt = projekteSchema.parse({ projekt: { name: { de: 'Neue Fatih Moschee Projekt' }, status: 'in_planung' } });
    expect(projekteNeu(alt)?.projekt.status).toBe('fertiggestellt');
    const neu = projekteSchema.parse(PROJEKTE_BEISPIEL);
    // jsonb ordnet Schlüssel um: rekursiv umgekehrte Schlüsselfolge darf nicht als Änderung gelten
    const umkehren = (w: unknown): unknown =>
      Array.isArray(w)
        ? w.map(umkehren)
        : w && typeof w === 'object'
          ? Object.fromEntries(
              Object.entries(w)
                .reverse()
                .map(([k, v]) => [k, umkehren(v)]),
            )
          : w;
    const umgeordnet = umkehren(neu);
    expect(JSON.stringify(umgeordnet)).not.toBe(JSON.stringify(neu));
    expect(projekteNeu(neu)).toBeNull();
    expect(projekteNeu(umgeordnet)).toBeNull();
  });

  it('ueber-uns: ersetzt nur „Zukunft“, behält Reihenfolge und übrige Stationen; zweiter Lauf ändert nichts', () => {
    const alt = { zeitleiste: [station('1976', 1), station('2019', 4), station('Zukunft', 5)], werte: [] };
    const neu = ueberUnsNeu(alt);
    expect(neu?.zeitleiste.map((e) => e.kennzeichnung.de)).toEqual(['1976', '2019', ZEITLEISTE_EROEFFNUNG.kennzeichnung.de]);
    expect(neu?.zeitleiste[2]).toMatchObject({ titel: ZEITLEISTE_EROEFFNUNG.titel, reihenfolge: 5, symbol: 'gebaeude' });
    expect(neu?.zeitleiste[2].titel.de).toBe('[Jahr – von der Gemeinde] – Eröffnung der neuen Fatih-Moschee');
    expect(neu?.zeitleiste.slice(0, 2)).toEqual(alt.zeitleiste.slice(0, 2).map((e) => expect.objectContaining(e)));
    expect(ueberUnsNeu(neu)).toBeNull();
  });

  it('ohne Station „Zukunft“ oder bei ungültigem Inhalt: nichts zu tun', () => {
    expect(ueberUnsNeu({ zeitleiste: [station('2019', 4)] })).toBeNull();
    expect(ueberUnsNeu({ zeitleiste: 'kaputt' })).toBeNull();
  });

  it('stabil: gleiche Daten in anderer Schlüsselfolge ergeben denselben Text', () => {
    expect(stabil({ b: 1, a: [{ d: 2, c: 3 }] })).toBe(stabil({ a: [{ c: 3, d: 2 }], b: 1 }));
    expect(stabil({ a: 1, b: undefined })).toBe(stabil({ a: 1 }));
  });
});
