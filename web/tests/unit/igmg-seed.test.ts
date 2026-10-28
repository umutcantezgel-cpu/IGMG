import { describe, expect, it } from 'vitest';
import { ERLAUBTE_HOSTS, NETZWERK_SCHLUESSEL } from '@/lib/dachverband/netzwerk';
import { schema } from '@/lib/validierung/seiteninhalte/igmg';
import { IGMG_BEISPIEL, IGMG_QUELLE } from '../../drizzle/seeds/bereiche/igmg';

/**
 * Seed „igmg“ (Plan Marktstart P1, ADR 0046): belegte Fakten mit Quelle und Stand, eigenständige Texte in drei Sprachen,
 * keine unbelegten Zahlen (518, 350.000) und keine Platzhalter mehr; alte gespeicherte Fassungen parsen weiter.
 * Personennamen kommen weder im Seed noch in diesem Test vor (G-04).
 */
const inhalt = schema.parse(IGMG_BEISPIEL);
const text = JSON.stringify(IGMG_BEISPIEL);

type Fund = { pfad: string; wert: Record<string, unknown> };

/** Mehrsprachige Texte im Inhalt: Objekte mit deutschem Text; Adressen (`url`) sind keine Texte. */
function mehrsprachige(wert: unknown, pfad = '', ziel: Fund[] = []): Fund[] {
  if (Array.isArray(wert)) wert.forEach((w, i) => mehrsprachige(w, `${pfad}.${i}`, ziel));
  else if (wert && typeof wert === 'object') {
    const o = wert as Record<string, unknown>;
    if (typeof o.de === 'string' && !pfad.endsWith('.url')) ziel.push({ pfad, wert: o });
    for (const [k, w] of Object.entries(o)) mehrsprachige(w, `${pfad}.${k}`, ziel);
  }
  return ziel;
}

describe('Seed „igmg“: belegte Fakten', () => {
  it('ist gültig nach dem Schema', () => {
    expect(schema.safeParse(IGMG_BEISPIEL).success).toBe(true);
  });

  it('keine unbelegten Zahlen 518 und 350.000 (G-05)', () => {
    expect(text).not.toMatch(/(?<![\d.,])518(?![\d.,])/);
    expect(text).not.toMatch(/350[.,]?000/);
    expect(inhalt.zahlen.menschenErreicht).toBe('');
  });

  it('keine Platzhalter mehr: Zahlen, Adresse, E-Mail, Website, Texte', () => {
    for (const platzhalter of ['[Zahl fehlt', '[Adresse]', '[E-Mail]', '[Website]', '[Telefonnummer]', '[Text fehlt']) {
      expect(text).not.toContain(platzhalter);
    }
  });

  it('Kennzahlen laut Broschüre Juni 2026, mit Stand und Quelle', () => {
    const z = inhalt.zahlen;
    expect(z.moscheen).toEqual({ wert: 700, art: 'ueber' });
    expect(z.zweigstellen).toEqual({ wert: 2500, art: 'rund' });
    expect(z.regionen).toMatchObject({ wert: 44, art: 'genau', zusatz: { de: expect.stringContaining('3') as string } });
    expect(z.mitglieder).toEqual({ wert: 200000, art: 'rund' });
    expect(z.mitwirkende).toEqual({ wert: 20000, art: 'rund' });
    expect(z.region).toEqual({ name: 'Hessen', zweigstellen: { wert: 112, art: 'genau' } });
    expect(z.stand).toBe('2026-06');
    expect(z.quelle?.url.de).toBe('https://www.igmg.org/wp-content/uploads/2026/07/english_igmg.pdf');
    expect(z.quelle?.url.tr).toBe('https://www.igmg.org/wp-content/uploads/2026/04/IGMG_broshure_tr_new.pdf');
  });

  it('Zentralkontakt laut Impressum, Website als https-Adresse', () => {
    expect(inhalt.kontakt).toEqual({
      adresse: 'Colonia-Allee 3\n51067 Köln',
      telefon: '+49 221 942240-100',
      email: 'info@igmg.org',
      website: 'https://www.igmg.org/',
      register: 'Amtsgericht Köln, VR 17018',
    });
  });

  it('Quelle nennt alle genutzten Seiten, Abruf, Zustimmung und ADR', () => {
    for (const teil of [
      '/selbstdarstellung/',
      '/grundsaetze/',
      '/vom-samen-zum-baum-',
      '/struktur-fachvereine-und-kooperationen/',
      '/satzung/',
      '/impressum/',
      'english_igmg.pdf',
      'IGMG_broshure_tr_new.pdf',
      'igmgreisen.com',
      '13.10.2026',
      'E-044',
      'ADR 0046',
    ]) {
      expect(IGMG_QUELLE).toContain(teil);
    }
  });
});

describe('Seed „igmg“: Texte', () => {
  it('alle mehrsprachigen Texte mit Türkisch und Englisch (K-02)', () => {
    const funde = mehrsprachige(inhalt);
    expect(funde.length).toBeGreaterThan(50);
    const fehlend = funde.filter(({ wert }) => wert.de && (!wert.tr || !wert.en)).map((f) => f.pfad);
    expect(fehlend).toEqual([]);
  });

  it('Überblick nennt die Fatih-Moschee Wetzlar und die IGMG beim ersten Nennen voll', () => {
    expect(inhalt.ueberblick.text.de).toMatch(/^Die Islamische Gemeinschaft Millî Görüş \(IGMG\)/);
    expect(inhalt.ueberblick.text.de).toContain('Fatih-Moschee Wetzlar');
    expect(inhalt.ueberblick.text.tr).toContain('İslam Toplumu Millî Görüş (IGMG)');
    expect(inhalt.ueberblick.text.tr).toContain('Wetzlar Fatih Camii');
    expect(inhalt.ueberblick.text.en).toContain('Islamic Community Millî Görüş (IGMG)');
    expect(inhalt.ueberblick.text.en).toContain('Fatih Mosque Wetzlar');
  });

  it('keine Bruchstücke der früher wörtlich übernommenen Absätze', () => {
    for (const bruchstueck of [
      'Vermittlung und Pflege des islamischen Glaubens',
      'Erfüllung der koranischen Gebote',
      'Probleme der Muslime weltweit aufmerksam zu beobachten',
      'ständig wachsenden Zahl von Regionalverbänden',
      'umfassenden Religionsverwirklichung',
      'Der islamischen Lehre zufolge',
      'Demnach beschreibt',
      'demnach',
      'Zentrale Ausführungsausschuss',
      'acht Abteilungen',
      'fehlte ein zentraler Dachverband',
      'Kurani emirlerin',
      'fulfillment of Quranic commandments',
    ]) {
      expect(text).not.toContain(bruchstueck);
    }
  });

  it('Bedeutung nennt die Suren nur als Fundstelle (G-06)', () => {
    const bedeutung = JSON.stringify(inhalt.bedeutung);
    for (const sure of ['Nahl', 'Imrân', 'Nisâ']) expect(bedeutung).toContain(sure);
    expect(inhalt.bedeutung.absaetze).toHaveLength(3);
  });

  it('Zeitleiste: höchstens 12 Stationen, Jahre aufsteigend, von den 1960er Jahren bis heute', () => {
    const eintraege = inhalt.geschichte.eintraege;
    expect(eintraege.length).toBeLessThanOrEqual(12);
    expect(eintraege[0]?.label.de).toContain('1960');
    expect(eintraege.at(-1)?.label.de).toBe('Heute');
    const jahre = eintraege.map((e) => e.label.de).filter((l) => /^\d{4}$/.test(l));
    expect(jahre).toEqual(['1969', '1976', '1982', '1985', '1995', '2001', '2009']);
    expect(eintraege.find((e) => e.label.de === '1969')?.text.de).toContain('Braunschweig');
    expect(eintraege.find((e) => e.label.de === '1985')?.text.de).toContain('AMGT');
  });

  it('Struktur: erweiterter Vorstand, Organe laut Satzung, Fachvereine mit belegten Adressen', () => {
    expect(inhalt.struktur.ausschuss.de).toContain('erweiterten Vorstand');
    for (const organ of ['Schura', 'Vorstand', 'Kuratorium', 'Wahlrat', 'Gelehrtenrat', 'Prüfungsausschuss']) {
      expect(inhalt.struktur.gremien.de).toContain(organ);
    }
    const namen = inhalt.struktur.fachvereine.map((v) => v.name);
    expect(namen).toEqual(expect.arrayContaining(['Hasene International', 'UKBA', 'EHZ', 'IGMG Reisen', 'Sabah Ülkesi', 'EMUG', 'Fudul']));
    for (const verein of inhalt.struktur.fachvereine) {
      for (const adresse of Object.values(verein.url ?? {})) expect(ERLAUBTE_HOSTS).toContain(new URL(adresse).hostname);
    }
  });

  it('Leitbild: fünf Kernaussagen mit den Grundsätzen als Quelle', () => {
    expect(inhalt.leitbild.punkte).toHaveLength(5);
    expect(inhalt.leitbild.quelle).toBe('grundsaetze');
  });

  it('Verweise: Ziele aus dem Netzwerk oder eigene https-Verweise, höchstens 16', () => {
    expect(inhalt.verweise.length).toBeLessThanOrEqual(16);
    for (const v of inhalt.verweise) {
      if (typeof v === 'string') expect(NETZWERK_SCHLUESSEL).toContain(v);
      else expect(v.url.de).toMatch(/^https:\/\//);
    }
    expect(inhalt.verweise).toEqual(expect.arrayContaining(['grundsaetze', 'satzung', 'gebetskalender', 'mitgliedschaft', 'reisen']));
  });

  it('Fragen: vier bis sechs organisatorische Fragen, die erste zur Zugehörigkeit der Gemeinde', () => {
    expect(inhalt.faq.length).toBeGreaterThanOrEqual(4);
    expect(inhalt.faq.length).toBeLessThanOrEqual(6);
    expect(inhalt.faq[0]?.frage.de).toBe('Gehört die Fatih-Moschee Wetzlar zur IGMG?');
    expect(inhalt.faq[0]?.antwort.de).toMatch(/^Ja\./);
  });

  it('Stand der Prüfung als Kalendertag', () => {
    expect(inhalt.stand).toBe('2026-10-27');
  });
});

describe('Gespeicherte Fassungen aus der Zeit vor P1 bleiben lesbar (ADR 0019)', () => {
  const alt = {
    ueberblick: { text: { de: 'Alter Text' }, auftrag: { de: 'Alter Auftrag' } },
    zahlen: { moscheen: '518', zweigstellen: '[Zahl fehlt: Zweigstellen]', menschenErreicht: '350.000' },
    bedeutung: { absaetze: [{ de: 'Absatz' }] },
    geschichte: { eintraege: [{ label: { de: '1960er Jahre' }, text: { de: 'Text' } }] },
    struktur: { praesidium: { de: 'Präsidium' }, ausschuss: { de: 'Ausschuss' } },
    kontakt: { adresse: '[Adresse]', telefon: '[Telefonnummer]', email: '[E-Mail]', website: 'www.igmg.org' },
  };

  it('alte Texte der Kennzahlen bleiben, neue Felder bekommen leere Standardwerte', () => {
    const geprueft = schema.parse(alt);
    expect(geprueft.zahlen.moscheen).toBe('518');
    expect(geprueft.zahlen.menschenErreicht).toBe('350.000');
    expect(geprueft.zahlen.regionen).toBeNull();
    expect(geprueft.zahlen.region).toBeNull();
    expect(geprueft.struktur.gremien).toEqual({ de: '' });
    expect(geprueft.struktur.fachvereine).toEqual([]);
    expect(geprueft.kontakt.register).toBe('');
    expect(geprueft.kontakt.website).toBe('www.igmg.org');
    expect(geprueft.leitbild).toEqual({ punkte: [], quelle: null });
    expect(geprueft.verweise).toEqual([]);
    expect(geprueft.faq).toEqual([]);
    expect(geprueft.stand).toBe('');
  });

  it('gelesen und wieder gespeichert bleibt die Fassung gültig', () => {
    const einmal = schema.parse(alt);
    expect(schema.parse(JSON.parse(JSON.stringify(einmal)))).toEqual(einmal);
  });

  it('unbekannter Netzwerk-Schlüssel und http-Verweis werden abgelehnt', () => {
    expect(schema.safeParse({ verweise: ['gibtEsNicht'] }).success).toBe(false);
    expect(schema.safeParse({ verweise: [{ titel: { de: 'Test' }, url: { de: 'http://www.igmg.org/' } }] }).success).toBe(false);
  });
});
