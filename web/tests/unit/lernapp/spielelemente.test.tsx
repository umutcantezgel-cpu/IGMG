import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { type AbschlussTexte, ZielRing } from '@/components/lernapp/Abschluss';
import { AbschlussInhalt as Abschluss } from '@/components/lernapp/AbschlussInhalt';
import { Abzeichen } from '@/components/lernapp/Abzeichen';
import { FortschrittInsel } from '@/components/lernapp/inseln/FortschrittInsel';
import type { AbschlussStand } from '@/lib/lernapp/ereignisse/ableiten';
import { abzeichenArt } from '@/lib/lernapp/ereignisse/abzeichen';
import type { WochenTag } from '@/lib/lernapp/ereignisse/serie';
import { formatiere } from '@/lib/lernapp/format';
import ar from '../../../messages/lernapp/ar.json';
import de from '../../../messages/lernapp/de.json';

/**
 * Spielelemente (L7-01, ADR 0043, PLAN §8): Abschlussbildschirm mit Tagesziel-Ring, Serie und neuen Abzeichen; Formen der
 * Abzeichen je Rang; Fortschritt ohne Gerätestand. Zahlen stehen als Endwert im ersten Bild (kein Hochzählen), der Ring ist
 * statisch (ohne Übergang), Texte kommen aus den Nachrichtendateien.
 */
const HEUTE = '2026-10-21';
const WOCHE: WochenTag[] = [
  { tag: '2026-10-19', art: 'gelernt' },
  { tag: '2026-10-20', art: 'pause' },
  { tag: HEUTE, art: 'gelernt' },
  { tag: '2026-10-22', art: 'zukunft' },
  { tag: '2026-10-23', art: 'zukunft' },
  { tag: '2026-10-24', art: 'zukunft' },
  { tag: '2026-10-25', art: 'zukunft' },
];
const texte = (m: typeof de): AbschlussTexte => ({ abschluss: m.abschluss, serie: m.serie, abzeichen: m.abzeichen });
const stand = (teil: Partial<AbschlussStand['tag']> = {}, neu: string[] = []): AbschlussStand => ({
  tag: { tag: HEUTE, xp: 10, lektionen: 1, bewertungen: 3, ziel: { art: 'xp', wert: 20 }, erreicht: false, ...teil },
  serie: { laenge: 2, woche: WOCHE, heute: HEUTE, wiedereinstieg: false, pausetage: 2 },
  neu,
});

describe('Abschluss (B-30) mit Tagesziel, Serie und neuen Abzeichen', () => {
  it('Ziel offen: Endwert sofort als Text, Ring statisch zur Hälfte; Serie mit Pausetagen; keine Abzeichen-Liste', () => {
    const h = renderToStaticMarkup(<Abschluss stand={stand()} texte={texte(de)} ui="de" ziffern="oestlich" />);
    expect(h).toContain('Heute 10 von 20 XP');
    expect(h).toContain('stroke-dasharray="0.5 1"');
    expect(h).not.toMatch(/transition|animate-|linie-zeichnet/);
    expect(h).toContain('2 Lerntage in Folge');
    expect(h).toContain(formatiere(de.serie.pausetage, { n: 2 }));
    expect(h).not.toContain(de.serie.wiedereinstieg);
    expect(h).not.toContain('data-abzeichen');
  });

  it('Ziel erreicht, Wiedereinstieg, zwei neue Abzeichen mit Auftritt B-34 und Bedingung als Text', () => {
    const s = {
      ...stand({ xp: 20, erreicht: true }, ['lektionen-1', 'erstes-sprechen']),
      serie: { ...stand().serie, wiedereinstieg: true },
    };
    const h = renderToStaticMarkup(<Abschluss stand={s} texte={texte(de)} ui="de" ziffern="oestlich" />);
    expect(h).toContain(de.abschluss.zielErreicht);
    expect(h).toContain('stroke-dasharray="1 1"');
    expect(h).toContain(de.serie.wiedereinstieg);
    expect(h).toContain('Neue Abzeichen');
    expect([...h.matchAll(/data-abzeichen="/g)]).toHaveLength(2);
    expect(h).toContain('Erste Lektion');
    expect(h).toContain('Die erste Sprechübung gemacht.');
    expect(h).toContain('starting:scale-96');
  });

  it('kein Tagesziel: nur die XP des Tages, ohne Ring; unbekannte Abzeichen fallen weg', () => {
    const h = renderToStaticMarkup(
      <Abschluss
        stand={stand({ ziel: { art: 'kein' }, erreicht: null }, ['gibt-es-nicht'])}
        texte={texte(de)}
        ui="de"
        ziffern="oestlich"
      />,
    );
    expect(h).toContain('Heute 10 XP');
    expect(h).not.toContain('stroke-dasharray');
    expect(h).not.toContain('data-abzeichen');
  });

  it('arabische Oberfläche: östliche Ziffern, Ring gespiegelt; Lektionen als Ziel', () => {
    const h = renderToStaticMarkup(
      <Abschluss stand={stand({ ziel: { art: 'lektionen', wert: 2 } })} texte={texte(ar)} ui="ar" ziffern="oestlich" />,
    );
    expect(h).toContain('١'); // 1
    expect(h).toContain('rtl:-scale-x-100');
    expect(h).toContain('stroke-dasharray="0.5 1"');
  });

  it('Ring: Anteil begrenzt auf 0–1, leer ohne Bogen', () => {
    expect(renderToStaticMarkup(<ZielRing anteil={3} />)).toContain('stroke-dasharray="1 1"');
    expect(renderToStaticMarkup(<ZielRing anteil={0} />)).not.toContain('stroke-dasharray');
  });
});

describe('Abzeichen: Achtstern-Varianten je Rang', () => {
  const zeichne = (id: string, offen = false) => renderToStaticMarkup(<Abzeichen art={abzeichenArt(id)!} name="[Name]" offen={offen} />);

  it('jeder Rang hat eine eigene Form (Linie, zweite Linie, Fläche, kräftig, Kranz)', () => {
    const formen = ['woerter-100', 'woerter-500', 'woerter-1000', 'woerter-2500', 'woerter-5000'].map((id) =>
      zeichne(id).replace(/data-abzeichen="[^"]*"/, ''),
    );
    expect(new Set(formen).size).toBe(5);
    expect([...formen[4]!.matchAll(/<circle /g)]).toHaveLength(8);
    expect(formen[0]).not.toContain('<circle ');
    expect(formen[0]).not.toContain('transform=');
    expect(formen[1]).toContain('transform=');
  });

  it('noch offen: blasse Linie ohne Kranz; Symbol dekorativ, Name als Text', () => {
    const h = zeichne('woerter-5000', true);
    expect(h).toContain('stroke-tinte-3');
    expect(h).not.toContain('<circle ');
    expect(h).toContain('[Name]');
    expect([...h.matchAll(/<svg[^>]*aria-hidden="true"/g)].length).toBe(2);
    expect(h).not.toContain('starting:');
  });
});

describe('Fortschritt', () => {
  it('ohne Stand auf dem Gerät (Server, neues Gerät): nur der Hinweis', () => {
    const h = renderToStaticMarkup(
      <FortschrittInsel ui="de" texte={{ fortschritt: de.fortschritt, serie: de.serie, abzeichen: de.abzeichen }} />,
    );
    expect(h).toBe(`<p class="text-18 text-tinte-2">${de.fortschritt.leer}</p>`);
  });
});
