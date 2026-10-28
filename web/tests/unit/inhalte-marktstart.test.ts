import { describe, expect, it } from 'vitest';
import { VIDEOS_IGMG_REISEN } from '../../drizzle/seeds/bereiche/wissen';
import { WISSEN_ENTWUERFE } from '../../drizzle/seeds/bereiche/wissen-entwuerfe';
import { wissenInhalt } from '@/components/website/wissen/inhalt';
import { marktstartStaende, MIGRATION, wissenVideosNeu } from '@/lib/inhalt/stand-marktstart';
import { stabil, ueberUnsNeu } from '@/lib/inhalt/stand-2026';
import { schema as igmgSchema } from '@/lib/validierung/seiteninhalte/igmg';
import { schema as ueberUnsSchema } from '@/lib/validierung/seiteninhalte/ueber-uns';
import { schema as vorstandSchema } from '@/lib/validierung/seiteninhalte/vorstand';

/**
 * Stand-Migration „Marktstart IGMG“ (Welle 3, Nachtrag ADR 0019): Zielstände aus den Seeds, gültig gegen die Schemas,
 * belegte Fakten (1978, keine unbelegten 518/350.000), reine Umrechnung der Wissensvideos (idempotent) und die Reihenfolge
 * mit `inhalte-2026`. Datenbankfälle: tests/integration/inhalte-marktstart.test.ts.
 */
const staende = marktstartStaende();
const ziel = (bereich: string) => {
  const s = staende.find((x) => x.bereich === bereich);
  if (!s) throw new Error(`Bereich ${bereich} fehlt`);
  return s;
};

/** Umgekehrte Schlüsselfolge auf allen Ebenen (so ordnet jsonb gelegentlich um). */
function umgeordnet(wert: unknown): unknown {
  if (Array.isArray(wert)) return wert.map(umgeordnet);
  if (wert && typeof wert === 'object')
    return Object.fromEntries(
      Object.entries(wert)
        .reverse()
        .map(([k, v]) => [k, umgeordnet(v)]),
    );
  return wert;
}

describe('Zielstände Marktstart', () => {
  it('alle Bereiche in fester Reihenfolge, je mit Quelle', () => {
    expect(MIGRATION).toBe('inhalte-marktstart');
    expect(staende.map((s) => s.bereich)).toEqual([
      'igmg',
      'ueber-uns',
      'vorstand',
      'organisation-ana-teskilati',
      'organisation-kadin-teskilati',
      'organisation-genclik-teskilati',
      'organisation-kadin-genclik-teskilati',
      'dachverband',
      'hadsch-umra',
    ]);
    for (const s of staende) expect(s.quelle.trim().length, s.bereich).toBeGreaterThan(20);
  });

  it('Seeds parsen und sind Fixpunkte ihres Schemas (sonst wäre jeder Lauf eine Änderung)', () => {
    expect(stabil(igmgSchema.parse(ziel('igmg').inhalt))).toBe(stabil(ziel('igmg').inhalt));
    expect(stabil(ueberUnsSchema.parse(ziel('ueber-uns').inhalt))).toBe(stabil(ziel('ueber-uns').inhalt));
    expect(stabil(vorstandSchema.parse(ziel('vorstand').inhalt))).toBe(stabil(ziel('vorstand').inhalt));
    // Zwei Aufrufe liefern denselben Stand
    expect(stabil(marktstartStaende())).toBe(stabil(staende));
  });

  it('igmg: keine unbelegten Werte 518 und 350.000', () => {
    const text = stabil(ziel('igmg').inhalt);
    expect(text).not.toMatch(/\b518\b/);
    expect(text).not.toMatch(/350[.,\s ]?000/);
  });

  it('Gründungsjahr 1978 in ueber-uns und vorstand, 1975 nirgends', () => {
    expect(stabil(ziel('ueber-uns').inhalt)).toContain('1978');
    const vorstand = vorstandSchema.parse(ziel('vorstand').inhalt);
    expect(vorstand.fuehrungSeit).toBe('1978');
    for (const s of staende) expect(stabil(s.inhalt), s.bereich).not.toContain('1975');
  });

  it('Reihenfolge mit inhalte-2026: Seed „ueber-uns“ endet mit der Eröffnung, inhalte-2026 hat danach nichts zu tun', () => {
    const u = ueberUnsSchema.parse(ziel('ueber-uns').inhalt);
    const letzte = [...u.zeitleiste].sort((a, b) => a.reihenfolge - b.reihenfolge).at(-1);
    expect(letzte?.titel.de).toContain('Eröffnung der neuen Fatih-Moschee');
    expect(ueberUnsNeu(ziel('ueber-uns').inhalt)).toBeNull();
  });

  it('Vergleich unabhängig von der Schlüsselfolge (jsonb)', () => {
    for (const s of staende) expect(stabil(umgeordnet(s.inhalt)), s.bereich).toBe(stabil(s.inhalt));
  });
});

describe('Wissensvideos von IGMG Reisen (reine Umrechnung)', () => {
  const altesVideo = {
    schluessel: 'video-1',
    thema: 'islam',
    titel: { de: 'Islam in 5 Minuten erklärt' },
    dauer: '5 min',
    beschreibung: { de: 'Eine kurze Einführung.' },
  };
  const alt = wissenInhalt.parse({ artikel: [], videos: [altesVideo], experten: [] });

  it('alter Stand ohne die Videos: beide angehängt, alles Übrige bleibt; zweiter Lauf ändert nichts', () => {
    const neu = wissenVideosNeu(alt);
    expect(neu?.videos.map((v) => v.schluessel)).toEqual(['video-1', ...VIDEOS_IGMG_REISEN.map((v) => v.schluessel)]);
    expect(neu?.videos.slice(1).map((v) => v.youtubeId)).toEqual(['ytTuELK2slU', 'eYOO4BNqx0Q']);
    expect(neu?.videos[0]).toEqual(alt.videos[0]);
    expect(wissenVideosNeu(neu)).toBeNull();
    expect(wissenVideosNeu(umgeordnet(neu))).toBeNull();
  });

  it('Video mit gleichem Schlüssel, aber altem Stand (ohne YouTube-ID) wird auf den Seed gesetzt, an seiner Stelle', () => {
    const mitAltemVideo = wissenInhalt.parse({
      videos: [{ ...VIDEOS_IGMG_REISEN[0], youtubeId: undefined }, altesVideo],
    });
    const neu = wissenVideosNeu(mitAltemVideo);
    expect(neu?.videos.map((v) => v.schluessel)).toEqual(['video-hadsch', 'video-1', 'video-umra-gepaeck']);
    expect(neu?.videos[0].youtubeId).toBe('ytTuELK2slU');
  });

  it('ungültiger Inhalt bleibt unberührt (null)', () => {
    expect(wissenVideosNeu({ videos: 'kaputt' })).toBeNull();
  });
});

describe('Wissens-Entwürfe', () => {
  it('Slugs sind eindeutig (die Migration legt nur fehlende an)', () => {
    const slugs = WISSEN_ENTWUERFE.map((e) => e.slug);
    expect(slugs.length).toBeGreaterThan(0);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
