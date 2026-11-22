import type { ReactNode } from 'react';
import { prerenderToNodeStream } from 'react-dom/static';
import { describe, expect, it, vi } from 'vitest';
import { PROJEKTE_BEISPIEL } from '../../drizzle/seeds/bereiche/projekte';
import { ZEITLEISTE_EROEFFNUNG } from '../../drizzle/seeds/bereiche/ueber-uns';
import projekte from '../../messages/bereiche/projekte.json';
import vorstand from '../../messages/bereiche/vorstand.json';
import de from '../../messages/de.json';
import { schema as projekteSchema } from '@/lib/validierung/seiteninhalte/projekte';
import { schema as ueberUnsSchema } from '@/lib/validierung/seiteninhalte/ueber-uns';

/**
 * Gemeinde-Seiten ohne Platzhalter „[…]“ (Vorstellung 23.11.2026): Was die Gemeinde noch nicht geliefert hat, entfällt
 * samt Beschriftung – nichts wird erfunden. Geprüft an den Bausteinen von /vorstand, /projekte und /ueber-uns mit den
 * Beispielinhalten der Seeds und mit den Standardwerten der Schemas (Seite ohne gespeicherten Inhalt).
 */
const TEXTE = [projekte.de, vorstand.de, de] as Record<string, unknown>[];
function text(pfad: string, werte: Record<string, string | number> = {}): string {
  for (const datei of TEXTE) {
    let wert: unknown = datei;
    for (const teil of pfad.split('.')) wert = wert && typeof wert === 'object' ? (wert as Record<string, unknown>)[teil] : undefined;
    if (typeof wert === 'string') return wert.replace(/\{(\w+)\}/g, (_, name: string) => String(werte[name] ?? ''));
  }
  throw new Error(`Text fehlt: ${pfad}`);
}
vi.mock('next-intl/server', () => ({
  getLocale: async () => 'de',
  getTranslations: async (namensraum: string) => (schluessel: string, werte?: Record<string, string | number>) =>
    text(`${namensraum}.${schluessel}`, werte),
}));

const { PersonCard } = await import('@/components/website/PersonCard');
const { Bauprojekt } = await import('@/components/website/projekte/Bauprojekt');
const { Meilensteine } = await import('@/components/website/projekte/Meilensteine');
const { Unterstuetzen } = await import('@/components/website/projekte/Unterstuetzen');
const { brauchtRueckfall, sichtbareMeilensteine } = await import('@/components/website/projekte/hilfen');
const { ohneFotoVermerk } = await import('@/components/website/ueber-uns/Bildflaeche');
const { stationsTitel } = await import('@/components/website/ueber-uns/Zeitleiste');

async function alsHtml(ui: ReactNode): Promise<string> {
  const { prelude } = await prerenderToNodeStream(ui);
  let html = '';
  for await (const teil of prelude) html += String(teil);
  return html.replaceAll('<!-- -->', '');
}
/** Sichtbarer Text und die für Hilfstechnik gesprochenen Attribute – dort darf kein Platzhalter stehen. */
function lesbar(html: string): string {
  const attribute = [...html.matchAll(/(?:aria-label|alt|title)="([^"]*)"/g)].map((m) => m[1]);
  return [html.replace(/<[^>]+>/g, ' '), ...attribute].join(' ');
}
const PLATZHALTER = /\[[^\]]*\]/;

const P = projekte.de.projekte;
const V = vorstand.de;

describe('PersonCard', () => {
  it('Name noch Platzhalter: das Amt steht in der Hauptzeile (einmal), keine Telefonzeile, E-Mail bleibt', async () => {
    const html = await alsHtml(
      <PersonCard
        variante="board"
        sprache="de"
        person={{
          name: '[Name – Vorsitzender]',
          funktion: { de: 'Vorsitzender' },
          seit: '2025',
          liste: [{ de: 'Gesamtleitung der Gemeinde' }],
          email: 'vorsitz@example.test',
          telefon: '[Telefonnummer]',
        }}
      />,
    );
    expect(lesbar(html)).not.toMatch(PLATZHALTER);
    expect(html).toMatch(/<h3[^>]*>Vorsitzender<\/h3>/);
    expect(html.match(/>Vorsitzender</g)).toHaveLength(1);
    expect(html).toContain(V.personCard.seit.replace('{jahr}', '2025'));
    expect(html).toContain('href="mailto:vorsitz@example.test"');
    expect(html).toContain('aria-label="vorsitz@example.test: Vorsitzender"');
    expect(html).not.toContain('lucide-phone');
  });

  it('mit Namen und Telefonnummer: Name in der Hauptzeile, Amt als Etikett, Telefonzeile', async () => {
    const html = await alsHtml(
      <PersonCard
        variante="board"
        sprache="de"
        person={{
          name: 'Testperson Eins',
          funktion: { de: 'Schatzmeister' },
          email: 'kasse@example.test',
          telefon: '06441 000000',
        }}
      />,
    );
    expect(html).toMatch(/<h3[^>]*>Testperson Eins<\/h3>/);
    expect(html).toContain('>TE<');
    expect(html.match(/>Schatzmeister</g)).toHaveLength(1);
    expect(html).toContain('06441 000000');
    expect(html).toContain('lucide-phone');
  });

  it('Chronik ohne Namen: die Rolle trägt die Karte, der Zeitraum bleibt', async () => {
    const html = await alsHtml(
      <PersonCard
        variante="leader"
        sprache="de"
        person={{ name: '[Name – Vorsitz]', rolle: V.vorstand.rolleEhemalig, zeitraum: '1978–1979', liste: [] }}
      />,
    );
    expect(lesbar(html)).not.toMatch(PLATZHALTER);
    expect(html).toMatch(new RegExp(`<h3[^>]*>${V.vorstand.rolleEhemalig}</h3>`));
    expect(html.match(new RegExp(`>${V.vorstand.rolleEhemalig}<`, 'g'))).toHaveLength(1);
    expect(html).toContain('1978–1979');
  });
});

describe('/projekte', () => {
  const beispiel = projekteSchema.parse(PROJEKTE_BEISPIEL);
  const standard = projekteSchema.parse({});

  it('Beispielinhalt: nur genannte Kennzahlen, kein Ortsetikett, keine Kennzeichnung als Platzhalter', async () => {
    const html = await alsHtml(<Bauprojekt inhalt={beispiel} sprache="de" />);
    expect(lesbar(html)).not.toMatch(PLATZHALTER);
    expect(html).not.toContain('data-platzhalter');
    expect(html.match(/<dd/g)).toHaveLength(1);
    expect(html).toContain(P.bezeichnungen.fertigstellung);
    expect(html).toContain('2026');
    for (const fehlt of [P.bezeichnungen.beginn, P.bezeichnungen.kapazitaet, P.bezeichnungen.flaeche, P.bezeichnungen.einrichtungen])
      expect(html).not.toContain(`>${fehlt}<`);
    // Die Beschreibung besteht nur aus Sätzen mit Platzhalter und entfällt ganz
    expect(html).not.toContain('ist fertiggestellt');
  });

  it('gepflegte Angaben erscheinen: Ort, Beschreibung ohne den Satz mit Platzhalter, Kennzahlen und Einrichtungen', async () => {
    const inhalt = projekteSchema.parse({
      ...PROJEKTE_BEISPIEL,
      projekt: {
        ...PROJEKTE_BEISPIEL.projekt,
        ort: { de: 'Testort' },
        beginn: 2024,
        beschreibung: { de: 'Ein fiktiver Satz zum Projekt. Eröffnung: [Datum – von der Gemeinde].' },
        kapazitaet: { wert: 300, einheit: { de: 'Gläubige' } },
        flaecheM2: 1200,
        einrichtungen: [{ de: 'Gebetsraum' }, { de: '[Weitere Räume]' }],
      },
    });
    const html = await alsHtml(<Bauprojekt inhalt={inhalt} sprache="de" />);
    expect(lesbar(html)).not.toMatch(PLATZHALTER);
    expect(html.match(/<dd/g)).toHaveLength(4);
    for (const t of ['Testort', 'Ein fiktiver Satz zum Projekt.', '2024', '300', 'Gläubige', '1.200', 'Gebetsraum'])
      expect(html).toContain(t);
    expect(html).not.toContain('Eröffnung:');
    expect(html.match(/<li/g)).toHaveLength(1);
  });

  it('ohne gespeicherten Inhalt (Standardwerte): keine Platzhalter, Abschnittstitel „Das Projekt“, feste Überschriften', async () => {
    const bau = await alsHtml(<Bauprojekt inhalt={standard} sprache="de" />);
    expect(lesbar(bau)).not.toMatch(PLATZHALTER);
    expect(bau).toContain(P.bezeichnungen.dasProjekt);
    expect(bau).not.toContain('<dl');
    const aufruf = await alsHtml(<Unterstuetzen inhalt={standard} sprache="de" />);
    expect(lesbar(aufruf)).not.toMatch(PLATZHALTER);
    expect(aufruf).toMatch(new RegExp(`<h2[^>]*>${P.unterstuetzen.titel}</h2>`));
    expect(aufruf).toContain(P.spenden.titel);
    expect(await alsHtml(<Meilensteine inhalt={standard} sprache="de" />)).toBe('');
  });

  it('ohne Bankverbindung: Satz „auf Anfrage“ mit Link zur Kontaktseite, „Jetzt spenden“ führt zu /spenden, kein Spendenstand', async () => {
    const html = await alsHtml(<Unterstuetzen inhalt={beispiel} sprache="de" />);
    expect(lesbar(html)).not.toMatch(PLATZHALTER);
    expect(html).toContain(P.spenden.aufAnfrage);
    expect(html).toContain('href="/spenden"');
    expect(html).not.toContain('#spendenkonto"');
    expect(html.match(/href="\/kontakt"/g)).toHaveLength(2);
    expect(html).not.toContain(P.bezeichnungen.gesammelt);
    expect(html).not.toContain('role="progressbar"');
    // Vom Aufruf bleibt der Satz ohne Platzhalter; der Dank (Ortsangabe fehlt) entfällt
    expect(html).toContain('Unterstützen Sie unsere Gemeinde.');
    expect(html).not.toContain('Wir danken allen');
  });

  it('mit Bankverbindung und Beträgen: Angaben der Gemeinde, „Jetzt spenden“ springt zur Bankverbindung', async () => {
    const inhalt = projekteSchema.parse({
      ...PROJEKTE_BEISPIEL,
      spende: { ...PROJEKTE_BEISPIEL.spende, gesammelt: 1000, ziel: 4000, bankverbindung: { de: 'Testbank, Konto der Gemeinde' } },
    });
    const html = await alsHtml(<Unterstuetzen inhalt={inhalt} sprache="de" />);
    expect(html).toContain('Testbank, Konto der Gemeinde');
    expect(html).not.toContain(P.spenden.aufAnfrage);
    expect(html).toContain('href="/projekte#spendenkonto"');
    expect(html).toContain('role="progressbar"');
    expect(html).toContain(P.spenden.prozent.replace('{prozent}', '25'));
  });

  it('Meilensteine: Daten wie „[Datum]“ entfallen, Meilensteine ohne Titel ebenso; der Stand zählt nur die gezeigten', async () => {
    const html = await alsHtml(<Meilensteine inhalt={beispiel} sprache="de" />);
    expect(lesbar(html)).not.toMatch(PLATZHALTER);
    expect(html).toContain(P.meilenstein.stand.replace('{erledigt}', '6').replace('{gesamt}', '6'));
    expect(html).toContain('März 2024');
    const mitLuecke = {
      ...beispiel,
      meilensteine: [
        ...beispiel.meilensteine.slice(0, 2),
        { ...beispiel.meilensteine[2], titel: { de: '[Meilenstein – von der Gemeinde]' } },
      ],
    };
    expect(sichtbareMeilensteine(mitLuecke, 'de')).toHaveLength(2);
    const zwei = await alsHtml(<Meilensteine inhalt={mitLuecke} sprache="de" />);
    expect(zwei).toContain(P.meilenstein.stand.replace('{erledigt}', '2').replace('{gesamt}', '2'));
    expect(lesbar(zwei)).not.toMatch(PLATZHALTER);
  });

  it('Hinweis „nur auf Deutsch“ zählt keine Felder, die nur Platzhalter sind', () => {
    expect(brauchtRueckfall('tr', [{ de: '[Bankverbindung – von der Gemeinde]' }])).toBe(false);
    expect(brauchtRueckfall('tr', [{ de: 'Nur deutscher Text.' }])).toBe(true);
    expect(brauchtRueckfall('tr', [{ de: 'Text', tr: 'Metin' }])).toBe(false);
  });
});

describe('/ueber-uns', () => {
  it('Station „Eröffnung“: die Jahresmarke als Platzhalter entfällt, der Titel bleibt wörtlich (de, tr, en)', () => {
    const [station] = ueberUnsSchema.parse({ zeitleiste: [ZEITLEISTE_EROEFFNUNG] }).zeitleiste;
    expect(stationsTitel(station, 'de').text).toBe('Eröffnung der neuen Fatih-Moschee');
    expect(stationsTitel(station, 'tr').text).toBe("Yeni Fatih Camii'nin açılışı");
    expect(stationsTitel(station, 'en').text).toBe('Opening of the new Fatih Mosque');
  });

  it('andere Titel bleiben unverändert; ein Platzhalter mitten im Titel lässt die Station entfallen', () => {
    const station = (de: string) => ueberUnsSchema.parse({ zeitleiste: [{ ...ZEITLEISTE_EROEFFNUNG, titel: { de } }] }).zeitleiste[0];
    expect(stationsTitel(station('2019 - Umzug zur Philipsstraße (aktueller Standort)'), 'de').text).toBe(
      '2019 - Umzug zur Philipsstraße (aktueller Standort)',
    );
    expect(stationsTitel(station('Umzug nach [Ort – von der Gemeinde]'), 'de').text).toBe('');
    // Englisch fehlt: sichtbarer Rückfall auf Deutsch
    expect(stationsTitel(station('2008 - 30 Jahre Gemeinde'), 'en')).toEqual({ text: '2008 - 30 Jahre Gemeinde', lang: 'de' });
  });

  it('Bildbeschreibung ohne den Vermerk in eckigen Klammern', () => {
    expect(ohneFotoVermerk('Foto: Neue Fatih-Moschee [Foto – von der Gemeinde]')).toBe('Foto: Neue Fatih-Moschee');
    expect(ohneFotoVermerk('Foto: Fatih Camii heute')).toBe('Foto: Fatih Camii heute');
    expect(ohneFotoVermerk('[Foto – von der Gemeinde]')).toBe('');
  });
});
