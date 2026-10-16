import { isValidElement, type ReactElement, type ReactNode } from 'react';
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';
import de from '../../messages/de.json';
import { angemeldetAls, verwaltungsUmgebung } from './hilfen/verwaltung';

/**
 * /verwaltung mit einem Konto ohne Verwaltungsrolle (Endprüfung Stufe C, Kleinigkeiten): vorher Umleitung auf
 * „Zwei-Faktor einrichten“ (`pruefe.ts`: zweiter Faktor vor der Rolle), jetzt die Seite „Kein Zugang zur Verwaltung“ mit
 * den Wegen „Mein Bereich“ und „Abmelden“. Sicherheit unverändert: Mit Rolle gilt weiter Anmeldung → zweiter Faktor →
 * Recht; die Seite selbst nennt weder Rollen noch Daten des Kontos.
 */
vi.mock('next-intl/server', () => ({ getTranslations: async (ns: string) => (k: string) => `${ns}.${k}` }));
const { client } = await verwaltungsUmgebung();
const { verlangeSitzung, verlangeSeitenRecht } = await import('@/lib/rechte/pruefe');
const { default: KeinZugangSeite } = await import('@/app/[locale]/verwaltung/kein-zugang/page');
const { default: ZweiFaktorSeite } = await import('@/app/[locale]/verwaltung/zwei-faktor/page');
afterAll(() => client.close());
afterEach(() => {
  delete process.env.FUNKTION_KONTEN;
});

const ziel = async (aufruf: () => Promise<unknown>) => {
  try {
    await aufruf();
    return null;
  } catch (e) {
    return (e as { ziel?: string }).ziel ?? (e as Error).message;
  }
};

/** Alle Knoten eines Elementbaums (Props und Kinder), um Texte und Ziele zu prüfen – ohne zu rendern. */
function knoten(el: ReactNode, liste: ReactElement[] = []): ReactElement[] {
  if (Array.isArray(el)) for (const k of el) knoten(k, liste);
  else if (isValidElement(el)) {
    liste.push(el);
    const props = el.props as { children?: ReactNode };
    knoten(props.children, liste);
  }
  return liste;
}

describe('Verwaltung ohne Rolle', () => {
  it('Gemeinde-Konto ohne Rolle und ohne zweiten Faktor: „Kein Zugang“, nicht „Zwei-Faktor einrichten“', async () => {
    await angemeldetAls([], false);
    expect(await ziel(verlangeSitzung)).toBe('/verwaltung/kein-zugang');
    expect(await ziel(() => verlangeSeitenRecht('audit.lesen'))).toBe('/verwaltung/kein-zugang');
    // auch der direkte Aufruf der Einrichtung führt dorthin
    expect(await ziel(ZweiFaktorSeite)).toBe('/verwaltung/kein-zugang');
  });

  it('mit zweitem Faktor, ohne Rolle: ebenfalls „Kein Zugang“', async () => {
    await angemeldetAls([]);
    expect(await ziel(verlangeSitzung)).toBe('/verwaltung/kein-zugang');
  });

  it('unverändert: ohne Sitzung → Anmeldung; mit Rolle ohne Faktor → Einrichtung; mit Rolle und Faktor → weiter', async () => {
    await angemeldetAls(null);
    expect(await ziel(verlangeSitzung)).toBe('/verwaltung/anmelden');
    await angemeldetAls([{ rolle: 'redaktion' }], false);
    expect(await ziel(verlangeSitzung)).toBe('/verwaltung/zwei-faktor');
    await angemeldetAls([{ rolle: 'redaktion' }]);
    expect(await ziel(verlangeSitzung)).toBeNull();
    expect(await ziel(() => verlangeSeitenRecht('audit.lesen'))).toBe('/verwaltung/kein-zugriff');
  });

  it('Seite „Kein Zugang“: ohne Sitzung → Anmeldung, mit Rolle → Verwaltung', async () => {
    await angemeldetAls(null);
    expect(await ziel(KeinZugangSeite)).toBe('/verwaltung/anmelden');
    await angemeldetAls([{ rolle: 'bildung' }], false);
    expect(await ziel(KeinZugangSeite)).toBe('/verwaltung');
  });

  it('Seite „Kein Zugang“: Titel, Text, Mein Bereich und Abmelden – ohne Angaben zum Konto', async () => {
    await angemeldetAls([], false);
    const seite = (await KeinZugangSeite()) as ReactElement<{ titel: string; untertitel: string; children: ReactNode }>;
    expect(seite.props.titel).toBe('verwaltung.keinZugang.titel');
    expect(seite.props.untertitel).toBe('verwaltung.keinZugang.text');
    const alle = knoten(seite.props.children);
    const links = alle.filter((k) => typeof (k.props as { href?: unknown }).href === 'string');
    expect(links.map((k) => (k.props as { href: string }).href)).toEqual(['/mein-bereich']);
    const abmelden = alle.find((k) => (k.props as { text?: string }).text === 'verwaltung.keinZugang.abmelden');
    expect(abmelden, 'Abmelden-Knopf').toBeDefined();
    // keine Personendaten in den Props (Name und Adresse der Testperson)
    const texte = [seite.props.titel, seite.props.untertitel, ...alle.flatMap((k) => Object.values(k.props as object))]
      .filter((w): w is string => typeof w === 'string')
      .join(' ');
    expect(texte).not.toContain('Testperson');
    expect(texte).not.toContain('@example.test');
  });

  it('Konten ausgeschaltet: kein Weg nach Mein Bereich, Abmelden bleibt', async () => {
    process.env.FUNKTION_KONTEN = 'aus';
    await angemeldetAls([], false);
    const seite = (await KeinZugangSeite()) as ReactElement<{ children: ReactNode }>;
    const alle = knoten(seite.props.children);
    expect(alle.some((k) => typeof (k.props as { href?: unknown }).href === 'string')).toBe(false);
    expect(alle.some((k) => (k.props as { text?: string }).text === 'verwaltung.keinZugang.abmelden')).toBe(true);
  });

  it('Texte stehen in messages/de.json (Verwaltung nur Deutsch, ADR 0016)', () => {
    expect(Object.keys(de.verwaltung.keinZugang).sort()).toEqual(['abmelden', 'meinBereich', 'text', 'titel']);
  });
});
