import { describe, expect, it } from 'vitest';
import type { Pruefung } from '@/lib/lernapp/freigabe';
import type { KoranPfadDatei } from '@/lib/lernapp/inhalt/schema';
import { koranPaketAdresse, koranVerzeichnisAdresse } from '@/lib/lernapp/koran/typen';
import { ladeKoranPaket, ladeKoranVerzeichnis } from '@/lib/lernapp/lokal/koran';
import { ladeKoranLektion } from '@/lib/lernapp/lokal/pakete';
import { baueKoranEinheit, baueKoranVerzeichnis, koranBedeutungHash, type KoranWortEingabe } from '@/lib/lernapp/paket/koran';

/**
 * Koran-Pfad im Browser (L6-05, Gegenprüfung L6-05/06: Testlücke): Verzeichnis nur in der erwarteten Form und Sprache, Paket nur
 * mit gleichem SHA-256 der Bytes wie die Adresse und ohne Audio-Feld, Lektion für den Spieler nur aus `koran_wort` samt der
 * nächsten spielbaren Lektion. Abruf über einen Ersatz für `fetch`. Testdaten: Wortformen nur als Codepunkte, Bedeutungen als
 * Platzhalter.
 */

const STELLEN = ['1:1:1', '1:1:2', '1:1:3', '1:1:4'] as const;
// neutrale Wörter, nur als Codepunkte (KI-Regel 2): b-a-b, d-a-r, q-a-l-a-m, b-a-y-t
const FORMEN = ['\u0628\u0627\u0628', '\u062F\u0627\u0631', '\u0642\u0644\u0645', '\u0628\u064A\u062A'];

const lektion = (n: number, stellen: readonly string[]) => ({
  schluessel: `koran.grund.e01.l0${n}`,
  wortformen: [...stellen],
  aufgaben: stellen.map((s, i) => ({
    schluessel: `koran.grund.e01.l0${n}.a0${i + 1}`,
    typ: 'koran_wort' as const,
    art: 'bedeutung' as const,
    wortform: s,
    ablenker: stellen.filter((x) => x !== s),
  })),
});

const EINHEIT: KoranPfadDatei['einheiten'][number] = {
  schluessel: 'koran.grund.e01',
  stufe: 'grund',
  reihenfolge: 1,
  thema: { de: '[Thema]' },
  lektionen: [lektion(1, STELLEN.slice(0, 2)), lektion(2, STELLEN.slice(2))],
};

function ok(person: string, hash: string): Pruefung {
  return {
    pruefendeId: person,
    pruefendeRollen: ['religioese_pruefung'],
    art: 'religioes',
    urteil: 'ok',
    inhaltHash: hash,
    am: new Date('2026-10-21T10:00:00Z'),
  };
}

const woerter = new Map<string, KoranWortEingabe>(
  STELLEN.map((s, i) => {
    const bedeutung = `[Bedeutung ${i + 1}]`;
    const inhaltHash = koranBedeutungHash({ formId: i + 1, sprache: 'de', bedeutung, wurzel: null, anmerkung: null });
    return [
      s,
      {
        text: FORMEN[i]!,
        vorkommen: 10 - i,
        bedeutung: {
          text: bedeutung,
          freigabe: {
            status: 'veroeffentlicht',
            baustein: { inhaltHash, verfasser: ['person-hoca'], belege: [], belegPflicht: false },
            pruefungen: [ok('person-a', inhaltHash), ok('person-b', inhaltHash)],
          },
        },
      },
    ];
  }),
);

const gebaut = baueKoranEinheit({ einheit: EINHEIT, sprache: 'de', woerter, quellen: ['[Quelle]'] });
const verzeichnis = baueKoranVerzeichnis('de', [gebaut]);

/** Ersatz für fetch: Adresse → Antwort (sonst 404). */
function abruf(antworten: Record<string, () => Response>): typeof fetch {
  return (async (adresse: string) => antworten[adresse]?.() ?? new Response(null, { status: 404 })) as unknown as typeof fetch;
}

const V = koranVerzeichnisAdresse('de');
const P = koranPaketAdresse('de', EINHEIT.schluessel, gebaut.hash);
const normal = abruf({ [V]: () => Response.json(verzeichnis), [P]: () => new Response(gebaut.json) });

describe('Koran-Pfad im Browser', () => {
  it('Verzeichnis: nur in der Form und Sprache des Pfads; 404 und kaputtes JSON ergeben null', async () => {
    expect(gebaut.paket.lektionen).toHaveLength(2);
    expect(await ladeKoranVerzeichnis('de', normal)).toEqual(verzeichnis);
    expect(await ladeKoranVerzeichnis('tr', abruf({ [koranVerzeichnisAdresse('tr')]: () => Response.json(verzeichnis) }))).toBeNull();
    expect(await ladeKoranVerzeichnis('de', abruf({}))).toBeNull();
    expect(await ladeKoranVerzeichnis('de', abruf({ [V]: () => new Response('{') }))).toBeNull();
  });

  it('Paket: nur mit gleichem SHA-256 wie die Adresse; veränderte Bytes oder ein Audio-Feld werden verworfen', async () => {
    const e = verzeichnis.einheiten[0]!;
    expect(await ladeKoranPaket('de', e, normal)).toEqual(gebaut.paket);
    const veraendert = gebaut.json.replace('[Bedeutung 1]', '[Bedeutung X]');
    expect(await ladeKoranPaket('de', e, abruf({ [P]: () => new Response(veraendert) }))).toBeNull();
    // passender Hash, aber Audio-Feld: verworfen
    const mitAudio = JSON.stringify({ ...gebaut.paket, woerter: [{ ...gebaut.paket.woerter[0], audio: '/x' }] });
    const hash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(mitAudio))), (b) =>
      b.toString(16).padStart(2, '0'),
    ).join('');
    const adresse = koranPaketAdresse('de', e.schluessel, hash);
    expect(await ladeKoranPaket('de', { ...e, hash }, abruf({ [adresse]: () => new Response(mitAudio) }))).toBeNull();
    expect(await ladeKoranPaket('de', e, abruf({}))).toBeNull();
  });

  it('Lektion für den Spieler: aus dem Paket, nur koran_wort, mit der nächsten spielbaren Lektion', async () => {
    const erste = await ladeKoranLektion('de', 'koran.grund.e01.l01', normal);
    expect(erste?.lektion).toMatchObject({ schluessel: 'koran.grund.e01.l01', kurs: 'koran', ausgangssprache: 'de' });
    expect(erste?.lektion.aufgaben.every((a) => a.typ === 'koran_wort')).toBe(true);
    expect(erste?.naechste).toBe('koran.grund.e01.l02');
    expect((await ladeKoranLektion('de', 'koran.grund.e01.l02', normal))?.naechste).toBeNull();
    // unbekannte Lektion, fehlendes Paket, veränderte Bytes: keine Lektion
    expect(await ladeKoranLektion('de', 'koran.grund.e01.l09', normal)).toBeNull();
    expect(await ladeKoranLektion('de', 'koran.grund.e01.l01', abruf({ [V]: () => Response.json(verzeichnis) }))).toBeNull();
    const fremd = gebaut.json.replace('"koran_wort"', '"auswahl"');
    expect(
      await ladeKoranLektion('de', 'koran.grund.e01.l01', abruf({ [V]: () => Response.json(verzeichnis), [P]: () => new Response(fremd) })),
    ).toBeNull();
  });
});
