import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { schrittMitFehler, wennGueltig, wizardSchritt } from '@/lib/formulare/wizard';

/** B01: Schrittlogik des FormWizard (C12 INTERAKTIONEN: Weiter prüft nur den aktuellen Schritt, Zurück behält Eingaben). */
const schema = z
  .object({
    vorname: z.string('pflicht').trim().min(1, 'pflicht'),
    email: z.email('email'),
    interessen: z.array(z.string()).min(1, 'pflicht'),
    einwilligung: z.literal('ja', 'einwilligung'),
    wiederholung: z.string().optional(),
  })
  .refine((d) => !d.wiederholung || d.wiederholung === d.email, {
    path: ['wiederholung'],
    message: 'ungleich',
    when: wennGueltig('email', 'wiederholung'),
  });
const SCHRITTE = [['vorname', 'email', 'wiederholung'], ['interessen'], ['einwilligung']] as const;

function fd(werte: Record<string, string | string[]>) {
  const f = new FormData();
  for (const [k, v] of Object.entries(werte)) for (const x of Array.isArray(v) ? v : [v]) f.append(k, x);
  return f;
}

describe('wizardSchritt', () => {
  it('Schritt 1 mit Fehlern: bleibt auf Schritt 0, nur Felder dieses Schritts als Fehler, Werte zurück', () => {
    const r = wizardSchritt(fd({ schritt: '0', richtung: 'weiter', vorname: ' ', email: 'x' }), schema, SCHRITTE, ['interessen']);
    expect(r).toMatchObject({
      art: 'schritt',
      schritt: 0,
      ergebnis: { fehler: 'pruefen', feldFehler: { vorname: 'pflicht', email: 'email' } },
    });
    if (r.art !== 'schritt') throw new Error('unerwartet');
    expect(Object.keys(r.ergebnis!.feldFehler!)).toEqual(['vorname', 'email']); // interessen/einwilligung gehören zu späteren Schritten
    expect(r.werte).toMatchObject({ vorname: ' ', email: 'x' });
  });

  it('feldübergreifende Regel (mit wennGueltig) zählt im Schritt ihres Feldes, auch wenn spätere Schritte leer sind', () => {
    const r = wizardSchritt(
      fd({ schritt: '0', vorname: 'Testperson', email: 'a@example.test', wiederholung: 'b@example.test' }),
      schema,
      SCHRITTE,
    );
    expect(r).toMatchObject({ art: 'schritt', schritt: 0, ergebnis: { feldFehler: { wiederholung: 'ungleich' } } });
  });

  it('Schritt gültig → nächster Schritt ohne Fehler; Mehrfachwerte als Liste', () => {
    expect(wizardSchritt(fd({ schritt: '0', vorname: 'Testperson', email: 'a@example.test' }), schema, SCHRITTE)).toMatchObject({
      art: 'schritt',
      schritt: 1,
    });
    const r = wizardSchritt(
      fd({ schritt: '1', vorname: 'Testperson', email: 'a@example.test', interessen: ['a', 'b'] }),
      schema,
      SCHRITTE,
      ['interessen'],
    );
    expect(r).toMatchObject({ art: 'schritt', schritt: 2, werte: { interessen: ['a', 'b'] } });
    expect(r).not.toHaveProperty('ergebnis');
  });

  it('Zurück: einen Schritt zurück, keine Prüfung, Eingaben bleiben; nie unter 0', () => {
    expect(wizardSchritt(fd({ schritt: '2', richtung: 'zurueck', vorname: '' }), schema, SCHRITTE)).toEqual({
      art: 'schritt',
      schritt: 1,
      werte: { vorname: '' },
    });
    expect(wizardSchritt(fd({ schritt: '0', richtung: 'zurueck' }), schema, SCHRITTE)).toMatchObject({ schritt: 0 });
  });

  it('letzter Schritt gültig → absenden; Steuer- und Schutzfelder nie in den Werten', () => {
    const werte = {
      schritt: '2',
      richtung: 'weiter',
      website: '',
      altcha: 'x',
      vorname: 'Testperson',
      email: 'a@example.test',
      interessen: 'a',
      einwilligung: 'ja',
    };
    expect(wizardSchritt(fd(werte), schema, SCHRITTE, ['interessen'])).toEqual({ art: 'absenden', schritt: 2 });
    const r = wizardSchritt(fd({ ...werte, schritt: '1' }), schema, SCHRITTE, ['interessen']);
    if (r.art !== 'schritt') throw new Error('unerwartet');
    expect(Object.keys(r.werte)).toEqual(['vorname', 'email', 'interessen', 'einwilligung']);
  });

  it('manipulierter Schritt: außerhalb des Bereichs begrenzt, Unsinn → 0', () => {
    expect(
      wizardSchritt(fd({ schritt: '99', vorname: 'Testperson', email: 'a@example.test', interessen: 'a' }), schema, SCHRITTE, [
        'interessen',
      ]),
    ).toMatchObject({ art: 'schritt', schritt: 2, ergebnis: { feldFehler: { einwilligung: 'einwilligung' } } });
    expect(wizardSchritt(fd({ schritt: 'abc' }), schema, SCHRITTE)).toMatchObject({ schritt: 0 });
    expect(wizardSchritt(fd({ schritt: '-3' }), schema, SCHRITTE)).toMatchObject({ schritt: 0 });
  });
});

describe('schrittMitFehler', () => {
  it('erster Schritt mit fehlerhaftem Feld (auch verschachtelt), sonst der letzte', () => {
    expect(schrittMitFehler({ einwilligung: 'x', email: 'email' }, SCHRITTE)).toBe(0);
    expect(schrittMitFehler({ 'interessen.0': 'x' }, SCHRITTE)).toBe(1);
    expect(schrittMitFehler({}, SCHRITTE)).toBe(2);
    expect(schrittMitFehler(undefined, SCHRITTE)).toBe(2);
  });
});
