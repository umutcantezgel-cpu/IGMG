import { describe, expect, it } from 'vitest';
import { baueMenues } from '@/components/website/navigation';

/** Kopf- und Telefonmenü: „Sprachen lernen“ führt direkt in die Lern-App – nur mit Schalter, direkt nach „Lernen“. */
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
});
