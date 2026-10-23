import type { EinwilligungsLage } from '@/lib/konto/sechzehn';

/**
 * Kommentar der Lehrkraft an Kinder (S-L2 M-1; offene Entscheidung D-L16 im DSFA-Entwurf der Lern-App; KERN 4.0 §5): Ein
 * Freitext-Kommentar zur Schreibabgabe eines Kindes wäre ein Kanal von einer erwachsenen Person zu einem einzelnen Kind –
 * ohne zweite erwachsene Person, ohne Eltern, ohne Meldeweg. Bis Kinderschutz, Datenschutzbeauftragte und Bildung D-L16
 * entschieden haben, gilt die harte Sperre:
 * - Abgaben von Konten in der Einwilligungslage „eltern“ (unter 16 bzw. Kinderkonto ohne bekanntes Datum,
 *   `konto/sechzehn.ts`) bekommen nur Prüfliste und Einstufung zurück; Dienst und Action lehnen einen Kommentar ab, das
 *   Formular der Lehrkraft blendet das Feld aus und sagt kurz, warum.
 * - Ein früher gespeicherter Kommentar (aus der Zeit vor der Sperre) erreicht das Kind nicht mehr: `eigeneAbgaben` lässt
 *   ihn in dieser Lage weg (Gegenprüfung der S-L2-Auflagen); der Datenexport nach Art. 15/20 bleibt vollständig.
 * - Startklar meldet Rot in der Betriebsart Produktion (Warnung in Vorschau und Entwicklung), solange `lernapp_gruppen` an
 *   ist und hier keine Entscheidung eingetragen ist (`bewerteDL16`).
 *
 * **Bindung der Entscheidung** (Gegenprüfung der S-L2-Auflagen): `kommentarAnKinder: true` allein öffnet nichts. Der
 * Kommentar an Kinder wird erst möglich, wenn zusätzlich jede Schutzmaßnahme aus S-L2 M-1 Behebung 2 im Code umgesetzt
 * und hier in `UMGESETZTE_SCHUTZMASSNAHMEN` eingetragen ist (jeweils mit Test). Fehlt eine, bleibt `kommentarErlaubt`
 * falsch – ein Eintrag der Entscheidung ohne Umsetzung öffnet keinen ungeschützten Kanal. Rein, ohne Abhängigkeiten zur
 * Datenbank (auch für `pnpm startklar`).
 */
export type EntscheidungDL16 = {
  /** Datum der Entscheidung (`JJJJ-MM-TT`) */
  am: string;
  /** Beschluss bzw. Abschnitt im DSFA-Nachtrag */
  fundstelle: string;
  /** Darf die Lehrkraft Kindern einen Kommentar schreiben? */
  kommentarAnKinder: boolean;
};

/**
 * Schutzmaßnahmen, ohne die kein Kommentar ein Kind erreicht (S-L2 M-1 Behebung 2; DSFA D-L16 Option b):
 * - `elternSehenOderMelden`: Kommentar und Prüfliste sehen auch die sorgeberechtigten Eltern (bestätigter Bezug) **oder**
 *   ein Knopf „Kommentar melden“ an Lehrkräfte und `kinderschutz` (wie S-07/S-08, Meldekontext nur diese Abgabe, Audit).
 * - `fassungen`: Kommentare werden angehängt statt ersetzt (Fassungen mit Zeitpunkt, Löschfrist wie die Abgabe).
 * - `bremse`: Obergrenze für Rückgaben je Lehrkraft (z. B. 60 je Stunde).
 * - `zeitfenster`: Rückgaben mit Kommentar an Kinder nur im Zeitfenster wie S-06.
 */
export const SCHUTZMASSNAHMEN = ['elternSehenOderMelden', 'fassungen', 'bremse', 'zeitfenster'] as const;
export type Schutzmassnahme = (typeof SCHUTZMASSNAHMEN)[number];

/** Stand: offen (DSFA-Entwurf Lern-App, D-L16; MENSCHEN LM-08). */
export const ENTSCHEIDUNG_D_L16: EntscheidungDL16 | null = null;

/**
 * Im Code umgesetzte Schutzmaßnahmen (Stand: keine). Erst eintragen, wenn die Maßnahme gebaut und mit Integrationstest
 * belegt ist (ADR 0042 Fortschreibung Nr. 20).
 */
export const UMGESETZTE_SCHUTZMASSNAHMEN: readonly Schutzmassnahme[] = [];

/** Schutzmaßnahmen, die noch fehlen (in der Reihenfolge von `SCHUTZMASSNAHMEN`). */
export function fehlendeSchutzmassnahmen(umgesetzt: readonly Schutzmassnahme[] = UMGESETZTE_SCHUTZMASSNAHMEN): Schutzmassnahme[] {
  return SCHUTZMASSNAHMEN.filter((m) => !umgesetzt.includes(m));
}

/**
 * Darf die Lehrkraft zu einer Abgabe in dieser Einwilligungslage einen Kommentar schreiben, und darf die lernende Person
 * einen gespeicherten Kommentar lesen? Ab 16 immer; in der Lage „eltern“ nur mit eingetragener Entscheidung
 * `kommentarAnKinder: true` **und** allen Schutzmaßnahmen umgesetzt.
 */
export function kommentarErlaubt(
  lage: EinwilligungsLage,
  entscheidung: EntscheidungDL16 | null = ENTSCHEIDUNG_D_L16,
  umgesetzt: readonly Schutzmassnahme[] = UMGESETZTE_SCHUTZMASSNAHMEN,
): boolean {
  if (lage !== 'eltern') return true;
  return entscheidung?.kommentarAnKinder === true && fehlendeSchutzmassnahmen(umgesetzt).length === 0;
}

/** Bewertung für Startklar (nur aufgerufen, wenn `lernapp_gruppen` an ist). */
export type DL16Befund = { status: 'ok' | 'warnung' | 'fehler'; meldung: string };

const NAMEN: Record<Schutzmassnahme, string> = {
  elternSehenOderMelden: 'Eltern sehen oder melden den Kommentar',
  fassungen: 'Fassungen statt Ersetzen',
  bremse: 'Bremse für Rückgaben',
  zeitfenster: 'Zeitfenster',
};

/**
 * Startklar zu D-L16: ohne Entscheidung Rot in der Betriebsart Produktion, Warnung in Vorschau und Entwicklung. Lässt die
 * Entscheidung den Kommentar zu, fehlen aber Schutzmaßnahmen, bleibt der Kommentar gesperrt – Warnung mit der Liste.
 */
export function bewerteDL16(
  produktion: boolean,
  entscheidung: EntscheidungDL16 | null = ENTSCHEIDUNG_D_L16,
  umgesetzt: readonly Schutzmassnahme[] = UMGESETZTE_SCHUTZMASSNAHMEN,
): DL16Befund {
  if (!entscheidung)
    return {
      status: produktion ? 'fehler' : 'warnung',
      meldung:
        'Gruppen der Lern-App sind eingeschaltet, aber D-L16 (Kommentar der Lehrkraft zur Schreibabgabe eines Kindes) ist nicht entschieden. Bis dahin ist der Kommentar an Kinder gesperrt; Kinderschutz, Datenschutzbeauftragte und Bildung entscheiden, danach wird die Entscheidung eingetragen.',
    };
  const kopf = `D-L16 entschieden am ${entscheidung.am} (${entscheidung.fundstelle})`;
  if (!entscheidung.kommentarAnKinder) return { status: 'ok', meldung: `${kopf}: Kommentar der Lehrkraft an Kinder ausgeschlossen.` };
  const fehlt = fehlendeSchutzmassnahmen(umgesetzt);
  return fehlt.length
    ? {
        status: 'warnung',
        meldung: `${kopf}: Kommentar an Kinder zugelassen, aber noch nicht umgesetzt (${fehlt.map((m) => NAMEN[m]).join(', ')}). Bis dahin bleibt er gesperrt.`,
      }
    : { status: 'ok', meldung: `${kopf}: Kommentar der Lehrkraft an Kinder zugelassen, Schutzmaßnahmen umgesetzt.` };
}
