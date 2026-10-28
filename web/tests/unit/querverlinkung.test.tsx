import type { ReactNode } from 'react';
import { prerenderToNodeStream } from 'react-dom/static';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ARTIKEL_2011 } from '../../drizzle/seeds/bereiche/ueber-uns';
import { VIDEOS_IGMG_REISEN } from '../../drizzle/seeds/bereiche/wissen';
import dachverband from '../../messages/bereiche/dachverband.json';
import mitglied from '../../messages/bereiche/mitglied.json';
import quellen from '../../messages/bereiche/quellen.json';
import ramadan from '../../messages/bereiche/ramadan.json';
import spenden from '../../messages/bereiche/spenden.json';
import wissen from '../../messages/bereiche/wissen.json';

/**
 * Querverlinkung (Plan Marktstart P7): Block „IGMG-Netzwerk“ im Fuß mit Sprachkürzel beim Rückfall, Kasten „Weltweit helfen
 * mit Hasene“ (/spenden), „Fördermitglied der IGMG“ (/mitglied-werden), Ramadan-Begleiter, Abschnitt „dachverband“ auf
 * /quellen, Fitre-Platzhalter und YouTube-ID der Wissensvideos. Texte aus messages; nur Links, keine Bilder, keine
 * Einbettungen (K-14).
 */
type Sprache = 'de' | 'tr' | 'en';
let sprache: Sprache = 'de';
const TEXTE = [dachverband, mitglied, ramadan, spenden, quellen, wissen];
/** Text unter `<namensraum>.<schlüssel>` aus allen Bereichsdateien der Sprache. */
function text(locale: Sprache, pfad: string): string {
  for (const datei of TEXTE) {
    let wert: unknown = datei[locale];
    for (const teil of pfad.split('.')) wert = wert && typeof wert === 'object' ? (wert as Record<string, unknown>)[teil] : undefined;
    if (typeof wert === 'string') return wert;
  }
  throw new Error(`Text fehlt: ${locale}.${pfad}`);
}
vi.mock('next-intl/server', () => ({
  getLocale: async () => sprache,
  getTranslations: async (arg: string | { locale: Sprache; namespace: string }) => {
    const { locale, namespace } = typeof arg === 'string' ? { locale: sprache, namespace: arg } : arg;
    return (schluessel: string) => text(locale, `${namespace}.${schluessel}`);
  },
}));

const { FussNetzwerk, FUSS_NETZWERK } = await import('@/components/website/fuss/Netzwerk');
const { HaseneKasten } = await import('@/components/website/spenden/HaseneKasten');
const { FoerdermitgliedKasten } = await import('@/components/website/formulare/FoerdermitgliedKasten');
const { RamadanBegleiter } = await import('@/components/website/ramadan/RamadanBegleiter');
const { ABSCHNITTE, ARTIKEL_WETZLAR_2011 } = await import('@/app/[locale]/(website)/quellen/verzeichnis');
const { videoInhalt } = await import('@/components/website/wissen/inhalt');
const { pfadFuer } = await import('@/i18n/navigation');

async function alsHtml(ui: ReactNode): Promise<string> {
  const { prelude } = await prerenderToNodeStream(ui);
  let html = '';
  for await (const teil of prelude) html += String(teil);
  return html.replaceAll('<!-- -->', '');
}
/** Alle Links eines HTML-Stücks mit ihren Attributen. */
function links(html: string): Record<string, string>[] {
  return [...html.matchAll(/<a\s([^>]*)>/g)].map((m) =>
    Object.fromEntries([...m[1].matchAll(/([a-zA-Z-]+)="([^"]*)"/g)].map((a) => [a[1], a[2].replaceAll('&amp;', '&')])),
  );
}
const ueberschrift = (titel: string) => <h2>{titel}</h2>;
const fuss = () => alsHtml(<FussNetzwerk ueberschrift={ueberschrift} linkKlasse="LINK" />);

beforeEach(() => {
  sprache = 'de';
});

describe('Fuß: Block „IGMG-Netzwerk“', () => {
  it('Deutsch: nav mit Namen, fünf externe Ziele mit rel und hrefLang, „Mehr über die IGMG“ intern', async () => {
    const html = await fuss();
    const T = dachverband.de.dachverband;
    expect(html).toContain(`<nav aria-label="${T.netzwerk.titel}"`);
    expect(html).toContain(`<h2>${T.netzwerk.titel}</h2>`);
    const a = links(html);
    expect(a).toHaveLength(FUSS_NETZWERK.length + 1);
    const extern = a.filter((l) => l.href.startsWith('https://'));
    expect(extern.map((l) => l.href)).toEqual([
      'https://www.igmg.org/',
      'https://www.igmgreisen.com/de/',
      'https://www.hasene.org/de/',
      'https://www.igmg.org/gebetskalender?stadt=Wetzlar&id=20238',
      'https://www.igmgcocuk.org',
    ]);
    for (const l of extern) expect(l.rel).toBe('noopener noreferrer');
    expect(a.at(-1)).toEqual({ href: pfadFuer('/igmg', 'de'), class: 'LINK' });
    expect(html).toContain(`>${T.netzwerk.mehr}</a>`);
    expect(html).not.toMatch(/<img|<iframe/);
  });

  it('Deutsch: Kinderclub (nur Türkisch) mit sichtbarem Kürzel TR, hrefLang tr und ausgeschriebenem Hinweis im Linknamen', async () => {
    const html = await fuss();
    const T = dachverband.de.dachverband;
    const kinder = links(html).find((l) => l.href === 'https://www.igmgcocuk.org')!;
    expect(kinder.hreflang ?? kinder.hrefLang).toBe('tr');
    expect(kinder['aria-label']).toBe(`${T.netzwerk.links.kinderclub} TR ${T.aufTuerkisch}: ${T.externeSeite}`);
    expect(html).toMatch(/<span class="inline-block[^"]*">TR<\/span>/);
    // Deutsche Ziele ohne Kürzel
    const igmg = links(html).find((l) => l.href === 'https://www.igmg.org/')!;
    expect(igmg['aria-label']).toBe(`${T.netzwerk.links.igmg}: ${T.externeSeite}`);
    expect(html.match(/>(DE|TR|EN)<\/span>/g)).toEqual(['>TR</span>']);
  });

  it('Englisch: Rückfall auf Deutsch (Reisen, Hasene, Gebetskalender) mit Kürzel DE, Kinderclub TR, IGMG englisch', async () => {
    sprache = 'en';
    const html = await fuss();
    const T = dachverband.en.dachverband;
    const a = links(html);
    const hasene = a.find((l) => l.href === 'https://www.hasene.org/de/')!;
    expect(hasene.hreflang ?? hasene.hrefLang).toBe('de');
    expect(hasene['aria-label']).toBe(`${T.netzwerk.links.hasene} DE ${T.aufDeutsch}: ${T.externeSeite}`);
    expect(a.find((l) => l.href === 'https://www.igmgreisen.com/de/')).toBeDefined();
    expect(a.find((l) => l.href === 'https://www.igmg.org/gebetskalender?stadt=Wetzlar&id=20238')).toBeDefined();
    const igmg = a.find((l) => l.href === 'https://www.igmg.org/en/')!;
    expect(igmg.hreflang ?? igmg.hrefLang).toBe('en');
    expect(html.match(/>(DE|TR|EN)<\/span>/g)).toEqual(['>DE</span>', '>DE</span>', '>DE</span>', '>TR</span>']);
    expect(a.at(-1)?.href).toBe(pfadFuer('/igmg', 'en'));
  });

  it('Türkisch: eigene Fassungen (IGMG, Reisen, Gebetskalender, Kinderclub) ohne Kürzel, Hasene auf Deutsch', async () => {
    sprache = 'tr';
    const html = await fuss();
    const T = dachverband.tr.dachverband;
    const hrefs = links(html).map((l) => l.href);
    expect(hrefs).toContain('https://www.igmg.org/tr/');
    expect(hrefs).toContain('https://www.igmgreisen.com/');
    expect(hrefs).toContain('https://www.igmg.org/tr/gebetskalender?stadt=Wetzlar&id=20238');
    expect(html.match(/>(DE|TR|EN)<\/span>/g)).toEqual(['>DE</span>']);
    expect(html).toContain(`${T.netzwerk.links.hasene} DE ${T.aufDeutsch}: ${T.externeSeite}`);
  });
});

describe('/spenden: Kasten „Weltweit helfen mit Hasene“', () => {
  it('sagt deutlich, wohin die Spenden gehen; Links zu Hasene und Zakat-Rechner; kein GiroCode, kein Bild', async () => {
    const html = await alsHtml(<HaseneKasten />);
    const H = spenden.de.spenden.hasene;
    expect(html).toContain('data-spenden="hasene"');
    expect(html).toContain(H.empfaenger);
    expect(H.empfaenger).toBe('Diese Spenden gehen an HASENE International e. V., nicht an die Gemeinde.');
    for (const b of Object.values(H.bereiche)) expect(html).toContain(`>${b}</li>`);
    const a = links(html);
    expect(a.map((l) => l.href)).toEqual(['https://www.hasene.org/de/', 'https://www.hasene.org/de/zakat-rechner/']);
    for (const l of a) expect(l.rel).toBe('noopener noreferrer');
    expect(html).not.toMatch(/<img|<svg[^>]*role="img"|GiroCode|IBAN/);
  });

  it('Türkisch und Englisch: eigener Satz zum Empfänger, Hasene mit Hinweis auf Deutsch', async () => {
    for (const s of ['tr', 'en'] as const) {
      sprache = s;
      const html = await alsHtml(<HaseneKasten />);
      expect(html).toContain(spenden[s].spenden.hasene.empfaenger);
      expect(html).toContain(dachverband[s].dachverband.aufDeutsch);
    }
  });

  it('Fitra (E-046 Nr. 1): direkt am Empfänger-Hinweis der Zusatz, dass auch die Gemeinde sie entgegennimmt – ohne Weitergabe', async () => {
    const GEMEINDE = { de: /Fatih-Moschee Wetzlar/, tr: /Wetzlar Fatih Camii/, en: /Fatih Mosque Wetzlar/ } as const;
    const FITRA = { de: /\bFitra\b/, tr: /\b[Ff]itre/, en: /\bFitra\b/ } as const;
    for (const s of ['de', 'tr', 'en'] as const) {
      sprache = s;
      const H = spenden[s].spenden.hasene as typeof spenden.de.spenden.hasene;
      expect(H.fitra, s).toMatch(FITRA[s]);
      expect(H.fitra, s).toMatch(GEMEINDE[s]);
      expect(H.fitra, s).not.toMatch(/weiterleit|iletir|aktarır|forward/i);
      const html = await alsHtml(<HaseneKasten />);
      // im selben Hinweiskasten, gleich nach „…, nicht an die Gemeinde.“
      expect(html, s).toMatch(new RegExp(`${H.empfaenger.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</p><p[^>]*>${H.fitra}</p>`));
    }
  });
});

describe('/mitglied-werden: Kasten „Fördermitglied der IGMG“', () => {
  it('vier Angaben nach der Satzung, getrennt von der Anmeldung; Links zur Mitgliedschaft und Satzung, nichts eingebettet', async () => {
    const html = await alsHtml(<FoerdermitgliedKasten />);
    const F = mitglied.de.mitglied.foerder;
    expect(html).toContain('data-mitglied="foerder"');
    expect(html).toContain(`>${F.titel}</h2>`);
    expect(html).toContain(F.text);
    for (const p of Object.values(F.punkte)) expect(html).toContain(`<li>${p}</li>`);
    expect(html).toContain(F.quelle);
    expect(links(html).map((l) => l.href)).toEqual(['https://www.igmg.org/mitgliedschaft/', 'https://www.igmg.org/satzung/']);
    expect(html).not.toMatch(/<iframe|<form|<img/);
  });
});

describe('/ramadan: Ramadan-Begleiter', () => {
  it('je Sprache der Titel der passenden Fassung, eine Adresse mit allen drei Fassungen, hrefLang der Seite', async () => {
    const titel = { de: 'Mein Ramadan Begleiter', tr: 'Ramazan Yoldaşım', en: 'Ramadan Guide' } as const;
    for (const s of ['de', 'tr', 'en'] as const) {
      sprache = s;
      const html = await alsHtml(<RamadanBegleiter sprache={s} />);
      const [link] = links(html);
      expect(link.href).toBe('https://www.igmg.org/ramazan-yoldasim/');
      expect(link.hreflang ?? link.hrefLang).toBe(s);
      expect(link.rel).toBe('noopener noreferrer');
      expect(link['aria-label']).toBe(`${titel[s]}: ${dachverband[s].dachverband.externeSeite}`);
      expect(html).toContain(ramadan[s].ramadan.begleiter.titel);
    }
  });

  it('Fitre-Platzhalter: Bekanntgabe der IGMG statt Diyanet, in allen Sprachen in eckigen Klammern', () => {
    expect(ramadan.de.ramadan.gemeinde.fitre).toBe('[Fitre-Betrag – Bekanntgabe der IGMG, vom Vorstand bestätigt]');
    for (const s of ['de', 'tr', 'en'] as const) {
      expect(ramadan[s].ramadan.gemeinde.fitre).toMatch(/^\[.*IGMG.*\]$/);
      expect(ramadan[s].ramadan.gemeinde.fitre).not.toContain('Diyanet');
    }
  });
});

describe('/quellen: Abschnitt „dachverband“', () => {
  const abschnitt = ABSCHNITTE.find((a) => a.id === 'dachverband')!;

  it('Einträge zum Dachverband mit Zustimmung statt Lizenz; Gebetskalender nicht doppelt', () => {
    expect(abschnitt.eintraege.map((e) => e.id)).toEqual([
      'igmg-website',
      'igmg-broschuere-en',
      'igmg-broschuere-tr',
      'igmg-satzung',
      'igmg-wetzlar-2008',
      'igmg-wetzlar-2011',
      'igmg-hutba-feed',
      'hasene',
      'igmg-reisen',
    ]);
    for (const e of abschnitt.eintraege) {
      expect(e.lizenz).toBeUndefined();
      expect(e.zustimmung).toBe(true);
      expect(new URL(e.url).protocol).toBe('https:');
    }
    const alle = ABSCHNITTE.flatMap((a) => a.eintraege.map((e) => e.id));
    expect(alle.filter((id) => id === 'igmg-gebetskalender')).toHaveLength(1);
    expect(new Set(alle).size).toBe(alle.length);
    expect(ARTIKEL_WETZLAR_2011).toBe(ARTIKEL_2011);
  });

  it('Texte in allen Sprachen: Abschnitt, Einleitung, Zustimmung, Fassung und Verwendung je Eintrag; Ausnahme im Stand-Kasten', () => {
    for (const s of ['de', 'tr', 'en'] as const) {
      const q = quellen[s].quellen as unknown as {
        abschnitte: Record<string, string>;
        einleitung: Record<string, string>;
        dachverband: { lizenz: string };
        eintraege: Record<string, { fassung: string; verwendung: string }>;
        standVorschauWebsite: string;
      };
      expect(q.abschnitte.dachverband).toBeTruthy();
      expect(q.einleitung.dachverband).toBeTruthy();
      expect(q.dachverband.lizenz).toContain('27');
      expect(q.standVorschauWebsite).toBeTruthy();
      for (const e of abschnitt.eintraege) {
        expect(q.eintraege[e.id]?.fassung, `${s}.${e.id}.fassung`).toBeTruthy();
        expect(q.eintraege[e.id]?.verwendung, `${s}.${e.id}.verwendung`).toBeTruthy();
      }
    }
    expect(quellen.de.quellen.dachverband.lizenz).toBe(
      'Übernahme mit Zustimmung der IGMG (27.10.2026); Texte eigenständig formuliert, Zahlen und Kontaktdaten mit Quelle übernommen.',
    );
  });
});

describe('Wissensvideos: YouTube-ID', () => {
  const basis = { schluessel: 'v', thema: 'fivestoesarz', titel: { de: 'Titel' }, dauer: '', beschreibung: { de: 'Text' } };

  it('optional; eingefügte Adressen werden zur ID, Unsinn wird abgewiesen', () => {
    expect(videoInhalt.parse(basis).youtubeId).toBeUndefined();
    expect(videoInhalt.parse({ ...basis, youtubeId: 'https://youtu.be/ytTuELK2slU' }).youtubeId).toBe('ytTuELK2slU');
    expect(videoInhalt.parse({ ...basis, youtubeId: 'https://www.youtube.com/watch?v=eYOO4BNqx0Q' }).youtubeId).toBe('eYOO4BNqx0Q');
    expect(videoInhalt.safeParse({ ...basis, youtubeId: 'https://example.org/x' }).success).toBe(false);
  });

  it('Seed: zwei Videos von IGMG Reisen beim Thema „Fünf Säulen“ mit ID; Titel in drei Sprachen', () => {
    expect(VIDEOS_IGMG_REISEN.map((v) => [v.thema, v.youtubeId])).toEqual([
      ['fivestoesarz', 'ytTuELK2slU'],
      ['fivestoesarz', 'eYOO4BNqx0Q'],
    ]);
    for (const v of VIDEOS_IGMG_REISEN) {
      expect(videoInhalt.safeParse(v).success).toBe(true);
      expect(Object.keys(v.titel)).toEqual(['de', 'tr', 'en']);
    }
    expect(wissen.de.wissen.videos.youtube).toBe('Auf YouTube ansehen');
  });
});
