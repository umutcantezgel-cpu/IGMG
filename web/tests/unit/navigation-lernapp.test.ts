import { describe, expect, it } from 'vitest';
import { baueMenues } from '@/components/website/navigation';

/** Kopf- und Telefonmenü: „Lern-App“ führt direkt in den Lernbereich – nur mit Schalter, direkt nach „Lernen“. */
const t = (k: string) => k;
const adresse = (ziel: unknown) => String(ziel);

describe('baueMenues: Lern-App im Bereich Bildung', () => {
  it('ohne Schalter kein Menüpunkt', () => {
    const bildung = baueMenues(t, adresse).find((m) => m.schluessel === 'bildung');
    expect(bildung?.punkte.map((p) => p.schluessel)).not.toContain('lern-app');
  });

  it('mit Adresse direkt nach „Lernen“, Adresse unverändert (außerhalb der Website-Pfade)', () => {
    const bildung = baueMenues(t, adresse, { lernApp: '/lern-app/tr' }).find((m) => m.schluessel === 'bildung');
    const schluessel = bildung?.punkte.map((p) => p.schluessel) ?? [];
    expect(schluessel.indexOf('lern-app')).toBe(schluessel.indexOf('lernen') + 1);
    expect(bildung?.punkte.find((p) => p.schluessel === 'lern-app')).toEqual({
      schluessel: 'lern-app',
      label: 'lernApp',
      beschreibung: 'bLernApp',
      href: '/lern-app/tr',
    });
  });

  it('fünf Punkte ohne Dopplung: Übersicht, Lern-App, Elifbe, Korankurse, Voranmeldung', () => {
    // Ziele mit Parametern (Organisationen) unterscheidbar machen
    const menues = baueMenues(t, (ziel) => JSON.stringify(ziel), { lernApp: '/lern-app/de' });
    const bildung = menues.find((m) => m.schluessel === 'bildung');
    expect(bildung?.punkte.map((p) => p.schluessel)).toEqual(['lernen', 'lern-app', 'elifbe', 'korankurse', 'voranmeldung']);
    // kein Ziel steht zweimal im Hauptmenü
    const ziele = menues.flatMap((m) => m.punkte.map((p) => p.href));
    expect(new Set(ziele).size).toBe(ziele.length);
  });
});
