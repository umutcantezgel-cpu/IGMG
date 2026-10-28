import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { prerenderToNodeStream } from 'react-dom/static';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { schema } from '@/lib/validierung/seiteninhalte/igmg';
import { IGMG_BEISPIEL } from '../../drizzle/seeds/bereiche/igmg';
import dachverband from '../../messages/bereiche/dachverband.json';
import igmg from '../../messages/bereiche/igmg.json';

/**
 * Reiter der IGMG-Seite mit dem Seed (Plan Marktstart P1): Kennzahlen je Sprache mit Stand und Quelle, Website als echter
 * Link, Register, Gremien und Fachvereine mit Sprachhinweis, Organisationskarten mit Beschreibung. Die Reiter-Insel
 * rendert auf dem Server ohne Anker den Standardreiter (Server-Snapshot „“). Texte aus den Bereichsdateien.
 */
let sprache: 'de' | 'tr' | 'en' = 'de';
const texte = { de: { ...igmg.de, ...dachverband.de }, tr: { ...igmg.tr, ...dachverband.tr }, en: { ...igmg.en, ...dachverband.en } };
vi.mock('next-intl/server', () => ({
  getLocale: async () => sprache,
  getTranslations: async (ns: string) => (schluessel: string, werte?: Record<string, string>) => {
    let wert: unknown = (texte[sprache] as Record<string, unknown>)[ns];
    for (const teil of schluessel.split('.')) wert = (wert as Record<string, unknown>)[teil];
    return String(wert).replace(/\{(\w+)\}/g, (_, name: string) => werte?.[name] ?? `{${name}}`);
  },
}));
// Die Organisationskarte (Logo, interner Link) prüft ihr eigener Test; hier zählt nur die übergebene Beschreibung
vi.mock('@/components/website/OrgCard', () => ({
  OrgCard: ({ org, desc }: { org: string; desc?: string }) => <p data-org={org}>{desc}</p>,
}));

const { Ueberblick } = await import('@/components/website/igmg/Ueberblick');
const { Struktur } = await import('@/components/website/igmg/Struktur');
const { Kontakt } = await import('@/components/website/igmg/Kontakt');
const { IGMGTabs } = await import('@/components/website/igmg/IGMGTabs');

const inhalt = schema.parse(IGMG_BEISPIEL);

/** HTML mit verschachtelten asynchronen Server-Komponenten (Verweisliste im Leitbild). */
async function alsHtml(ui: ReactNode): Promise<string> {
  const { prelude } = await prerenderToNodeStream(ui);
  let text = '';
  for await (const teil of prelude) text += String(teil);
  return text;
}

describe('Überblick: Kennzahlen, Stand und Quelle, Leitbild', () => {
  beforeEach(() => {
    sprache = 'de';
  });

  it('Deutsch: Werte mit Art, Zusatz, Region mit Ortsbezug, Stand und Quelle als Link', async () => {
    const html = await alsHtml(await Ueberblick({ inhalt, sprache: 'de' }));
    for (const wert of ['über 700', 'rund 2.500', '>44<', 'rund 200.000', 'rund 20.000', '>112<', 'davon 3 im Aufbau']) {
      expect(html).toContain(wert);
    }
    expect(html).toContain('Zweigstellen in der Region Hessen, zu der Wetzlar gehört');
    expect(html).toContain('Stand: Juni 2026');
    expect(html).toContain('href="https://www.igmg.org/wp-content/uploads/2026/07/english_igmg.pdf"');
    expect(html).toContain('rel="noopener noreferrer"');
    // Leere Kennzahl (früher 350.000) entfällt samt Beschriftung
    expect(html).not.toContain(igmg.de.igmg.menschenErreicht);
    expect(html).toContain(igmg.de.igmg.leitbildTitel);
    expect(html).toContain('href="https://www.igmg.org/grundsaetze/"');
  });

  it('Türkisch ohne Kasusendung, Quelle auf die türkische Broschüre', async () => {
    sprache = 'tr';
    const html = await alsHtml(await Ueberblick({ inhalt, sprache: 'tr' }));
    expect(html).toContain('700+');
    expect(html).toContain('yaklaşık 200.000');
    expect(html).toContain('Haziran 2026 itibarıyla');
    expect(html).toContain('IGMG_broshure_tr_new.pdf');
  });

  it('Englisch mit englischer Tausendertrennung', async () => {
    sprache = 'en';
    const html = await alsHtml(await Ueberblick({ inhalt, sprache: 'en' }));
    expect(html).toContain('over 700');
    expect(html).toContain('around 2,500');
    expect(html).toContain('As of June 2026');
  });

  it('Standardwerte: Platzhalter sichtbar, ohne Stand, Quelle und Leitbild', async () => {
    const html = await alsHtml(await Ueberblick({ inhalt: schema.parse({}), sprache: 'de' }));
    expect(html).toContain('[Zahl fehlt: Moscheen]');
    expect(html).not.toContain('Stand:');
    expect(html).not.toContain(igmg.de.igmg.leitbildTitel);
  });
});

describe('Kontakt: Website als Link, Telefon, Register', () => {
  it('Seed: Website-Link mit sichtbarer Kurzform, tel-Link, Register', async () => {
    sprache = 'de';
    const html = renderToStaticMarkup(await Kontakt({ inhalt }));
    expect(html).toMatch(
      /<a href="https:\/\/www\.igmg\.org\/" rel="noopener noreferrer" aria-label="www\.igmg\.org: Website[^"]*"[^>]*>www\.igmg\.org<\/a>/,
    );
    expect(html).toContain('href="tel:+49221942240100"');
    expect(html).toContain('href="mailto:info@igmg.org"');
    expect(html).toContain('Amtsgericht Köln, VR 17018');
    expect(html).toContain(igmg.de.igmg.register);
  });

  it('Platzhalter und Text ohne https bleiben Text; leeres Register entfällt', async () => {
    const standard = schema.parse({});
    const html = renderToStaticMarkup(
      await Kontakt({ inhalt: { ...standard, kontakt: { ...standard.kontakt, website: 'www.igmg.org' } } }),
    );
    expect(html).not.toContain('href="http');
    expect(html).not.toContain('tel:');
    expect(html).not.toContain(igmg.de.igmg.register);
  });
});

describe('Struktur: Gremien, Fachvereine, Organisationskarten', () => {
  it('Deutsch: Organe, Fachvereine mit und ohne Adresse, Beschreibungen der Karten', async () => {
    sprache = 'de';
    const html = renderToStaticMarkup(await Struktur({ inhalt, sprache: 'de' }));
    expect(html).toContain(igmg.de.igmg.gremienTitel);
    expect(html).toContain(igmg.de.igmg.ausschuss);
    expect(html).toContain('href="https://www.hasene.org/de/"');
    expect(html).toContain('hrefLang="de"');
    expect(html).toMatch(/<h3[^>]*>EMUG<\/h3>/);
    for (const org of ['at', 'kt', 'gt', 'kgt'] as const) expect(html).toContain(igmg.de.igmg[`orgBeschreibung_${org}`]);
  });

  it('Türkisch: eigene Adresse für IGMG Reisen, sichtbarer Hinweis bei deutschen Zielen', async () => {
    sprache = 'tr';
    const html = renderToStaticMarkup(await Struktur({ inhalt, sprache: 'tr' }));
    expect(html).toContain('href="https://www.igmgreisen.com/" hrefLang="tr"');
    expect(html).toContain(`Hasene International ${dachverband.tr.dachverband.aufDeutsch}: ${dachverband.tr.dachverband.externeSeite}`);
  });

  it('Sabah Ülkesi (Seite nur auf Türkisch): Zielsprache aus dem Netzwerk-Verzeichnis, auch mit der gespeicherten Adresse nur unter „de“', async () => {
    const verein = inhalt.struktur.fachvereine.find((v) => v.name === 'Sabah Ülkesi');
    expect(verein?.url).toEqual({ de: 'https://www.sabahulkesi.com' });
    for (const s of ['de', 'tr', 'en'] as const) {
      sprache = s;
      const D = dachverband[s].dachverband;
      const html = renderToStaticMarkup(await Struktur({ inhalt, sprache: s }));
      const link = html.match(/<a [^>]*href="https:\/\/www\.sabahulkesi\.com"[^>]*>.*?<\/a>/)?.[0] ?? '';
      expect(link, s).toContain('hrefLang="tr"');
      if (s === 'tr') {
        expect(link, s).toContain(`aria-label="Sabah Ülkesi: ${D.externeSeite}"`);
        expect(link, s).not.toContain(D.aufDeutsch);
      } else {
        expect(link, s).toContain(`aria-label="Sabah Ülkesi ${D.aufTuerkisch}: ${D.externeSeite}"`);
        expect(link, s).toContain(`>${D.aufTuerkisch}</span>`);
      }
    }
    // gespeichert ohne „www.“ bzw. als Unterseite: dieselbe Website, weiter Türkisch
    sprache = 'tr';
    const ohneWww = schema.parse({
      struktur: {
        fachvereine: [
          { name: 'Sabah Ülkesi', bereich: { de: 'Kunst' }, url: { de: 'https://sabahulkesi.com' } },
          { name: 'Sabah Ülkesi Seite', bereich: { de: 'Kunst' }, url: { de: 'https://www.sabahulkesi.com/hakkimizda/' } },
        ],
      },
    });
    const tr = renderToStaticMarkup(await Struktur({ inhalt: ohneWww, sprache: 'tr' }));
    expect(tr).toContain('href="https://sabahulkesi.com" hrefLang="tr"');
    expect(tr).toContain('href="https://www.sabahulkesi.com/hakkimizda/" hrefLang="tr"');
    expect(tr).not.toContain(dachverband.tr.dachverband.aufDeutsch);
    // Adressen außerhalb des Verzeichnisses wie bisher: ohne eigene Fassung gilt die deutsche Seite
    sprache = 'en';
    const fremd = schema.parse({
      struktur: { fachvereine: [{ name: 'Testverein', bereich: { de: 'Test' }, url: { de: 'https://verein.example/' } }] },
    });
    const html = renderToStaticMarkup(await Struktur({ inhalt: fremd, sprache: 'en' }));
    expect(html).toContain('href="https://verein.example/" hrefLang="de"');
    expect(html).toContain(`Testverein ${dachverband.en.dachverband.aufDeutsch}`);
  });

  it('ohne Gremien und Fachvereine entfallen beide Abschnitte', async () => {
    sprache = 'de';
    const html = renderToStaticMarkup(await Struktur({ inhalt: schema.parse({}), sprache: 'de' }));
    expect(html).not.toContain(igmg.de.igmg.gremienTitel);
    expect(html).not.toContain(igmg.de.igmg.fachvereineTitel);
  });
});

describe('Reiter-Insel auf dem Server', () => {
  it('ohne Anker der Standardreiter, die übrigen Felder verborgen', () => {
    const html = renderToStaticMarkup(
      <IGMGTabs
        beschriftung="Themen"
        standard="ueberblick"
        reiter={[
          { schluessel: 'ueberblick', label: 'Überblick', inhalt: <p>A</p> },
          { schluessel: 'geschichte', label: 'Geschichte', inhalt: <p>B</p> },
        ]}
      />,
    );
    expect(html).toMatch(/aria-selected="true"[^>]*>Überblick/);
    expect(html).toMatch(/aria-selected="false"[^>]*>Geschichte/);
    expect(html.match(/hidden=""/g)).toHaveLength(1);
  });
});
