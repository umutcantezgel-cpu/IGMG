import type { JSONContent } from '@tiptap/core';
import { describe, expect, it } from 'vitest';
import { pfadFuer } from '@/i18n/navigation';
import { routing, type Pfad } from '@/i18n/routing';
import { ERLAUBTE_HOSTS, NETZWERK, NETZWERK_SCHLUESSEL, netzwerkZiel } from '@/lib/dachverband/netzwerk';
import { klartext } from '@/lib/inhalt/tiptap';
import { enthaeltArabisch } from '@/lib/lernapp/waechter/kern.mjs';
import { richtextSchema } from '@/lib/validierung/richtext';
import {
  ENTWURF_OEFFENTLICH,
  entwurfDokument,
  istEntwurf,
  istKiEntwurf,
  KI_ENTWURF_VERFASSER,
  linkZiele,
  oeffentlicheFreigaben,
  wissenCacheBetroffen,
} from '@/lib/wissen/entwurf';
import { entwurfQuelle, entwurfZeile, entwurfZiele, WISSEN_ENTWUERFE } from '../../drizzle/seeds/bereiche/wissen-entwuerfe';

/**
 * Religiöse Erklärtexte als gekennzeichneter Entwurf (Plan Marktstart P5, ADR 0047): reine Regeln der Sichtbarkeit und des
 * Caches, die Auszeichnung der Seed-Texte und ein Wächter für die vier KI-Entwürfe – jede Sprache vorhanden, Antwort zuerst,
 * Fragen als Zwischenüberschriften, Quellenliste mit erlaubten Hosts und Stand, keine arabische Schrift, keine längeren
 * Zitate, keine Vers- oder Hadith-Angaben mit Doppelpunkt, keine Segensformeln, keine Beträge (G-06, ADR 0030 Nr. 4).
 */
const SPRACHEN = ['de', 'tr', 'en'] as const;
type Sprache = (typeof SPRACHEN)[number];

const ANTWORT: Record<Sprache, string> = { de: 'Kurz gesagt:', tr: 'Kısaca:', en: 'In short:' };
const QUELLEN: Record<Sprache, string> = { de: 'Quellen', tr: 'Kaynaklar', en: 'Sources' };
const STAND: Record<Sprache, RegExp> = {
  de: /^Stand der Quellen: \d{1,2}\. \p{L}+ 2026/u,
  tr: /^Kaynakların durumu: \d{1,2} \p{L}+ 2026/u,
  en: /^Sources as of \d{1,2} \p{L}+ 2026/u,
};
/** Sichtbarer Sprachhinweis im Linktext, wenn das Ziel nicht in der Sprache der Seite ist (wie `Verweisliste`). */
const HINWEIS: Record<Sprache, Record<Sprache, string>> = {
  de: { de: '', tr: '(auf Türkisch', en: '(auf Englisch' },
  tr: { de: '(Almanca', tr: '', en: '(İngilizce' },
  en: { de: '(in German', tr: '(in Turkish', en: '' },
};

const text = (k: JSONContent): string => (k.text ?? '') + (k.content ?? []).map(text).join(k.type === 'doc' ? '\n' : '');
const bloecke = (doc: JSONContent) => doc.content ?? [];
const alleTexte = (sprache: Sprache) =>
  WISSEN_ENTWUERFE.flatMap((e) => [e.titel[sprache] ?? '', e.kurztext[sprache] ?? '', klartext(e.inhalt[sprache] ?? null)]);

/** Links eines Dokuments mit ihrem Linktext. */
function links(doc: JSONContent): { href: string; text: string }[] {
  const aus: { href: string; text: string }[] = [];
  const lauf = (k: JSONContent) => {
    const href = k.marks?.find((m) => m.type === 'link')?.attrs?.href;
    if (typeof href === 'string') aus.push({ href, text: k.text ?? '' });
    k.content?.forEach(lauf);
  };
  lauf(doc);
  return aus;
}

/** Sprache, in der ein externes Ziel gelesen wird: Netzwerk-Ziele nach `NETZWERK`, einzelne Beiträge nach dem Pfad. */
function zielSprache(href: string, sprache: Sprache): Sprache {
  for (const k of NETZWERK_SCHLUESSEL) {
    const z = netzwerkZiel(k, sprache);
    if (z.href === href) return z.zielSprache;
  }
  const pfad = new URL(href).pathname;
  return pfad.startsWith('/tr/') ? 'tr' : pfad.startsWith('/en/') ? 'en' : 'de';
}

const STATISCHE_PFADE = (Object.keys(routing.pathnames) as Pfad[]).filter((p) => !p.includes('['));

describe('Sichtbarkeit und Cache (ADR 0047)', () => {
  it('ohne Schalter nur „geprüft“, mit Schalter zusätzlich „zur Prüfung“ – „entwurf“ (zurückgewiesen) nie', () => {
    expect(oeffentlicheFreigaben(false)).toEqual(['geprueft']);
    expect(oeffentlicheFreigaben(true)).toEqual(['geprueft', 'zur_pruefung']);
    expect(ENTWURF_OEFFENTLICH).not.toContain('entwurf');
    expect(istEntwurf('geprueft')).toBe(false);
    expect(istEntwurf('zur_pruefung')).toBe(true);
    expect(istKiEntwurf(KI_ENTWURF_VERFASSER)).toBe(true);
    expect(istKiEntwurf('konto-123')).toBe(false);
    expect(istKiEntwurf(null)).toBe(false);
  });

  it('Cache verfällt bei Änderungen an öffentlich möglichen Themen, auch „zur Prüfung“', () => {
    // unverändert: nie
    expect(wissenCacheBetroffen('geprueft', 'geprueft', false, false)).toBe(false);
    expect(wissenCacheBetroffen('zur_pruefung', 'zur_pruefung', false, false)).toBe(false);
    // Entwurf zur Prüfung bearbeitet oder ausgeblendet: öffentlich sichtbar mit Schalter
    expect(wissenCacheBetroffen('zur_pruefung', 'zur_pruefung', true, false)).toBe(true);
    expect(wissenCacheBetroffen('zur_pruefung', 'zur_pruefung', false, true)).toBe(true);
    // Einreichen (entwurf → zur Prüfung) und alle Wege von und zu „geprüft“ wie bisher
    expect(wissenCacheBetroffen('entwurf', 'zur_pruefung', false, false)).toBe(true);
    expect(wissenCacheBetroffen('geprueft', 'zur_pruefung', true, false)).toBe(true);
    expect(wissenCacheBetroffen('geprueft', 'geprueft', false, true)).toBe(true);
    // ein reiner Entwurf, der Entwurf bleibt, ist nie öffentlich
    expect(wissenCacheBetroffen('entwurf', 'entwurf', true, true)).toBe(false);
  });
});

describe('Auszeichnung der Entwurfstexte (entwurfDokument)', () => {
  it('Überschrift Ebene 3, Absätze, zusammenhängende Listen und Links aus Schlüsseln oder Pfaden', () => {
    const doc = entwurfDokument(['Antwort {hier|ziel}.', '### Frage?', '- eins', '- {zwei|/kontakt}', 'Schluss'], {
      ziel: 'https://www.igmg.org/',
    });
    expect(doc).toEqual({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Antwort ' },
            { type: 'text', text: 'hier', marks: [{ type: 'link', attrs: { href: 'https://www.igmg.org/' } }] },
            { type: 'text', text: '.' },
          ],
        },
        { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'Frage?' }] },
        {
          type: 'bulletList',
          content: [
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'eins' }] }] },
            {
              type: 'listItem',
              content: [
                { type: 'paragraph', content: [{ type: 'text', text: 'zwei', marks: [{ type: 'link', attrs: { href: '/kontakt' } }] }] },
              ],
            },
          ],
        },
        { type: 'paragraph', content: [{ type: 'text', text: 'Schluss' }] },
      ],
    });
    expect(richtextSchema.safeParse(doc).success).toBe(true);
    expect(linkZiele(doc)).toEqual(['https://www.igmg.org/', '/kontakt']);
  });

  it('unbekanntes Linkziel bricht ab', () => {
    expect(() => entwurfDokument(['{x|fehlt}'], {})).toThrow('fehlt');
  });
});

describe('Seed-Wächter: die vier KI-Entwürfe', () => {
  it('vier Themen nach den zwölf Bestandsthemen, englische Slugs im Stil des Bestands, als Entwurf zur Prüfung', () => {
    expect(WISSEN_ENTWUERFE.map((e) => e.slug)).toEqual(['hajj-umrah', 'islamic-calendar', 'zakat-fitra-qurban', 'friday-prayer']);
    expect(WISSEN_ENTWUERFE.map((e) => e.sortierung)).toEqual([13, 14, 15, 16]);
    for (const e of WISSEN_ENTWUERFE) {
      expect(e.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(entwurfZeile(e)).toMatchObject({
        status: 'veroeffentlicht',
        freigabe: 'zur_pruefung',
        verfasstVon: KI_ENTWURF_VERFASSER,
        istBeispiel: true,
        kategorie: 'thema',
      });
    }
  });

  it('jede Sprache vorhanden; Längen wie im Verwaltungsformular (Titel 80, Kurztext 300); Rich-Text gültig', () => {
    for (const e of WISSEN_ENTWUERFE)
      for (const s of SPRACHEN) {
        expect(e.titel[s]?.length, `${e.slug} titel ${s}`).toBeGreaterThan(3);
        expect(e.titel[s]!.length, `${e.slug} titel ${s}`).toBeLessThanOrEqual(80);
        expect(e.kurztext[s]?.length, `${e.slug} kurztext ${s}`).toBeGreaterThan(80);
        expect(e.kurztext[s]!.length, `${e.slug} kurztext ${s}`).toBeLessThanOrEqual(300);
        expect(richtextSchema.safeParse(e.inhalt[s]).success, `${e.slug} inhalt ${s}`).toBe(true);
      }
  });

  it('Aufbau: Antwort zuerst, Fragen als Überschriften der Ebene 3, am Ende Quellenliste mit Stand', () => {
    for (const e of WISSEN_ENTWUERFE)
      for (const s of SPRACHEN) {
        const b = bloecke(e.inhalt[s]!);
        const ort = `${e.slug} ${s}`;
        expect(b[0]!.type, ort).toBe('paragraph');
        expect(text(b[0]!), ort).toMatch(new RegExp(`^${ANTWORT[s]}`));
        const ueberschriften = b.filter((k) => k.type === 'heading');
        expect(
          ueberschriften.every((k) => k.attrs?.level === 3),
          ort,
        ).toBe(true);
        const fragen = ueberschriften.slice(0, -1).map(text);
        expect(fragen.length, ort).toBeGreaterThanOrEqual(3);
        for (const f of fragen) expect(f, ort).toMatch(/\?$/);
        // Quellen: letzte Überschrift, dann eine Liste nur aus Links, dann die Standzeile
        const i = b.indexOf(ueberschriften.at(-1)!);
        expect(text(b[i]!), ort).toBe(QUELLEN[s]);
        expect(b[i + 1]!.type, ort).toBe('bulletList');
        const punkte = b[i + 1]!.content ?? [];
        expect(punkte.length, ort).toBeGreaterThanOrEqual(3);
        for (const p of punkte)
          expect(
            links(p)
              .map((l) => l.href)
              .every((h) => h.startsWith('https://')),
            ort,
          ).toBe(true);
        expect(b.length, ort).toBe(i + 3);
        expect(text(b[i + 2]!), ort).toMatch(STAND[s]);
      }
  });

  it('Links: extern nur zu erlaubten Hosts (IGMG, IGMG Reisen, Hasene), intern nur zu Seiten der Website in derselben Sprache', () => {
    for (const e of WISSEN_ENTWUERFE)
      for (const s of SPRACHEN)
        for (const { href, text: t } of links(e.inhalt[s]!)) {
          const ort = `${e.slug} ${s} ${href}`;
          if (href.startsWith('/')) {
            expect(
              STATISCHE_PFADE.map((p) => pfadFuer(p, s)),
              ort,
            ).toContain(href);
            continue;
          }
          const host = new URL(href).hostname;
          expect(ERLAUBTE_HOSTS, ort).toContain(host);
          expect(['www.igmg.org', 'www.igmgreisen.com', 'www.hasene.org'], ort).toContain(host);
          // Sichtbarer Sprachhinweis, wenn das Ziel nicht in der Sprache der Seite gelesen wird
          const ziel = zielSprache(href, s);
          if (ziel !== s) expect(t, ort).toContain(HINWEIS[s][ziel]);
          else for (const h of Object.values(HINWEIS[s]).filter(Boolean)) expect(t, ort).not.toContain(h);
        }
  });

  it('Netzwerk-Ziele stimmen mit dem Linkverzeichnis überein; die Spalte „quelle“ nennt jede verlinkte Adresse', () => {
    for (const s of SPRACHEN) {
      const ziele = entwurfZiele(s);
      for (const k of NETZWERK_SCHLUESSEL) if (k in ziele) expect(ziele[k]).toBe(netzwerkZiel(k, s).href);
    }
    expect(Object.keys(NETZWERK)).toContain('gelehrtenratHilal');
    for (const e of WISSEN_ENTWUERFE) {
      const quelle = entwurfQuelle(e);
      expect(quelle).toMatch(/^KI-Entwurf \(ADR 0047\)/);
      for (const s of SPRACHEN) for (const h of linkZiele(e.inhalt[s]).filter((x) => x.startsWith('https://'))) expect(quelle).toContain(h);
    }
  });

  it('G-06: keine arabische Schrift, keine Zitate über sechs Wörter, keine Versangaben „Sure:Vers“, keine Segensformeln oder Bittgebete', () => {
    const zitat = /[„“”"«»‚‘]([^„“”"«»‚‘]+)[“”"«»‘]/g;
    for (const s of SPRACHEN)
      for (const t of alleTexte(s)) {
        expect(enthaeltArabisch(t), t.slice(0, 60)).toBe(false);
        for (const [, innen] of t.matchAll(zitat)) expect(innen.trim().split(/\s+/).length, innen).toBeLessThanOrEqual(6);
        expect(t).not.toMatch(/\b\d{1,3}\s*:\s*\d{1,3}\b/);
        expect(t).not.toMatch(/\((s|s\.a\.v\.?|sav|saw|a|a\.s\.?|r|r\.a\.?|ra)\)/i);
        expect(t).not.toMatch(/lebbeyk|telbiye|talbiya|labbaik/i);
      }
  });

  it('keine Beträge (Fitra, Fidya, Zakat gibt die IGMG bekannt) und keine Mobilnummern (G-04)', () => {
    for (const s of SPRACHEN)
      for (const t of alleTexte(s)) {
        expect(t).not.toMatch(/€|\bEUR\b|\bEuro\b|\$/i);
        expect(t).not.toMatch(/\+49\s?1[5-7]\d|\b01[5-7]\d/);
      }
  });
});
