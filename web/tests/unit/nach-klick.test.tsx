import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { NachKlick } from '@/components/website/einbettung/NachKlick';
import { KarteNachKlick } from '@/components/website/kontakt/KarteNachKlick';
import { youtubeEinbettung, youtubeLink } from '@/lib/einbettung/youtube';
import { DATENSCHUTZ_BEISPIEL } from '../../drizzle/seeds/bereiche/rechtliches';
import einbettung from '../../messages/bereiche/einbettung.json';

/**
 * Einbettung nach Klick (K-14, Plan Marktstart): Vor dem Klick steht nur der Platzhalter vom Server mit Ladeknopf und
 * Hinweis – kein iframe, keine Adresse des Anbieters im Markup außer dem reinen Link, kein Vorschaubild (ytimg). Die
 * Fläche hat feste Maße (kein CLS). Die Karte bleibt eine Hülle mit denselben Texten wie bisher.
 */
const ID = 'ytTuELK2slU';
const texte = { laden: 'Video laden', hinweis: 'Hinweis zur Datenübertragung', iframeTitel: 'Video: Titel', link: 'Auf YouTube ansehen' };

describe('NachKlick vor dem Klick', () => {
  const html = renderToStaticMarkup(
    <NachKlick
      einbettung={youtubeEinbettung(ID)}
      texte={texte}
      platzhalter={<span>Platzhalter vom Server</span>}
      verhaeltnis="video"
      referrerPolicy="strict-origin-when-cross-origin"
      allow="autoplay; encrypted-media; picture-in-picture"
      vollbild
      linkZiel={youtubeLink(ID)}
      kontext="Titel"
    />,
  );

  it('kein iframe, keine Einbettungsadresse, kein Vorschaubild', () => {
    expect(html).not.toContain('<iframe');
    expect(html).not.toContain('youtube-nocookie');
    expect(html).not.toMatch(/ytimg|<img/);
  });

  it('Platzhalter, Ladeknopf, Hinweis und Link mit Kontext (MUSTER §4)', () => {
    expect(html).toContain('Platzhalter vom Server');
    expect(html).toMatch(/<button type="button" aria-label="Video laden: Titel"[^>]*>Video laden<\/button>/);
    expect(html).toContain('Hinweis zur Datenübertragung');
    expect(html).toContain(`href="${youtubeLink(ID)}"`);
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain('aria-label="Auf YouTube ansehen: Titel"');
  });

  it('Video-Fläche mit festem Seitenverhältnis, fokussierbar für den Fokus nach dem Laden', () => {
    expect(html).toMatch(/tabindex="-1" class="[^"]*aspect-video/);
  });
});

describe('KarteNachKlick als Hülle', () => {
  const html = renderToStaticMarkup(
    <KarteNachKlick
      einbettung="https://www.openstreetmap.org/export/embed.html?bbox=1"
      texte={{ platzhalter: 'Karte: Anfahrt', laden: 'Karte laden', hinweis: 'Hinweis OSM', iframeTitel: 'Karte' }}
    />,
  );

  it('zeigt Platzhalter, Knopf ohne zusätzliches aria-label und Hinweis, aber weder Karte noch Link', () => {
    expect(html).not.toContain('<iframe');
    expect(html).not.toContain('openstreetmap');
    expect(html).toContain('<p class="text-16 text-tinte-2">Karte: Anfahrt</p>');
    expect(html).toContain('<button type="button" class=');
    expect(html).toContain('>Karte laden</button>');
    expect(html).toContain('Hinweis OSM');
    expect(html).not.toContain('<a ');
  });

  it('behält die Fläche der Anfahrt (Mindesthöhe, füllt die Spalte)', () => {
    expect(html).toMatch(/class="[^"]*min-h-85[^"]*flex-1/);
  });
});

describe('Texte zur Datenübertragung: was erst nach dem Klick geschieht (YouTube, M-111)', () => {
  it('Klick-Hinweis je Sprache: IP-Adresse und Herkunft, danach Speicherung im Browser und Nutzungsdaten, vorher nichts', () => {
    const MUSTER = {
      de: [
        /IP-Adresse/,
        /Adresse dieser Website/,
        /Cookies/,
        /lokalen Speicher/,
        /wie Sie das Video nutzen/,
        /Vor dem Klick fließen keine Daten/,
      ],
      tr: [
        /IP adresiniz/,
        /bu web sitesinin adresi/,
        /çerez/,
        /yerel depolama/,
        /videoyu nasıl kullandığınız/,
        /Tıklamadan önce hiçbir veri/,
      ],
      en: [
        /IP address/,
        /address of this website/,
        /cookies/,
        /local storage/,
        /how you use the video/,
        /No data is sent before you click/,
      ],
    } as const;
    for (const s of ['de', 'tr', 'en'] as const)
      for (const m of MUSTER[s]) expect(einbettung[s].einbettung.video.hinweis, `${s} ${m}`).toMatch(m);
  });

  it('Datenschutz-Entwurf: „keine Inhalte von Dritten“ und „keine Cookies“ gelten nur ohne Klick; Videos mit Speicherung im Browser', () => {
    const absaetze = (abschnitt: 'empfaenger' | 'browser') =>
      (DATENSCHUTZ_BEISPIEL[abschnitt] ?? []).flatMap((b) => (b.art === 'absatz' ? [b.text.de] : []));
    const empfaenger = absaetze('empfaenger');
    const browser = absaetze('browser');
    const dritte = empfaenger.find((t) => t.includes('keine Inhalte von Dritten'));
    expect(dritte).toMatch(/^Ohne Ihren Klick laden die öffentlichen Seiten keine Inhalte von Dritten\./);
    expect(dritte).toMatch(/„Karte“ und „Videos“/);
    const video = empfaenger.find((t) => t.startsWith('Videos (Entwurf):'));
    expect(video).toMatch(/Nach dem Klick kann YouTube \(Google\) Daten in Ihrem Browser speichern/);
    expect(video).toMatch(/Cookies/);
    expect(video).toMatch(/lokalen Speicher/);
    expect(video).toMatch(/\[[^\]]*Rechtsberatung\]/);
    const cookies = browser.find((t) => t.includes('keine Cookies'));
    expect(cookies).toMatch(/^Auf den öffentlichen Seiten setzt die Website selbst keine Cookies\./);
    expect(cookies).toMatch(/Video/);
    // weiter als Entwurf gekennzeichnet, mit Prüfhinweis (M-111, G-08)
    expect(empfaenger.some((t) => t.startsWith('[Hinweis für die Prüfung (ENTWURF, M-111)'))).toBe(true);
  });
});
