import { eq } from 'drizzle-orm';
import { giltNoch, neuesteHutba, tagPlus } from '@/lib/dachverband/auswahl';
import { berlinerTag } from '@/lib/dachverband/feed';
import type { Datenbank } from '@/lib/db';
import * as schema from '@/lib/db/schema';
import { schema as dachverbandSchema } from '@/lib/validierung/seiteninhalte/dachverband';
import type { Pruefung } from './pruefungen';

/**
 * Startklar „Aus dem Dachverband“ (Plan Marktstart P3): Die neueste sichtbare Freitagspredigt ist höchstens 14 Tage alt
 * (sonst Warnung – der tägliche Feed-Abgleich läuft dann vermutlich nicht oder die Predigten sind ausgeblendet); sichtbare
 * Einträge mit abgelaufenem „Anzeigen bis“ sind ein Hinweis zum Aufräumen. Ein gespeicherter Inhalt, der nicht zum Schema
 * passt, ist eine Warnung (die Seite zeigt dann nichts). Prüfungen dürfen erweitert, nie abgeschwächt werden.
 */
const ORT = 'Verwaltung › Seiteninhalte › Aus dem Dachverband (Cron /api/wartung/dachverband-abgleich, ADR 0046)';
export const HUTBA_HOECHSTALTER_TAGE = 14;

export async function dachverbandPruefen(db: Datenbank, jetzt: Date, neu: (p: Pruefung) => void): Promise<void> {
  const [zeile] = await db
    .select({ inhalt: schema.seiteninhalt.inhalt })
    .from(schema.seiteninhalt)
    .where(eq(schema.seiteninhalt.bereich, 'dachverband'))
    .limit(1);
  const basis = { id: 'inhalte.dachverband-aktuell', bereich: 'inhalte' as const, titel: 'Aus dem Dachverband aktuell', ort: ORT };
  const gelesen = dachverbandSchema.safeParse(zeile?.inhalt ?? {});
  if (!gelesen.success) {
    neu({
      ...basis,
      status: 'warnung',
      meldung:
        'Der gespeicherte Inhalt „Aus dem Dachverband“ passt nicht zum Schema; Startseite und Nachrichten zeigen den Abschnitt nicht. Einträge in der Verwaltung prüfen und speichern.',
      aufwand: '15 min',
    });
    return;
  }
  const heute = berlinerTag(jetzt);
  const eintraege = gelesen.data.eintraege;
  const hutba = neuesteHutba(eintraege, heute);
  const grenze = tagPlus(heute, -HUTBA_HOECHSTALTER_TAGE);
  const abgelaufen = eintraege.filter((e) => e.sichtbar && !giltNoch(e, heute));
  const teile: string[] = [];
  let status: Pruefung['status'] = 'ok';
  if (!hutba) {
    status = 'warnung';
    teile.push('Es gibt keine sichtbare Freitagspredigt. Feed-Abgleich prüfen oder die aktuelle Predigt eintragen.');
  } else if (hutba.datum < grenze) {
    status = 'warnung';
    teile.push(
      `Die neueste sichtbare Freitagspredigt ist vom ${hutba.datum} und damit älter als ${HUTBA_HOECHSTALTER_TAGE} Tage. Läuft der tägliche Feed-Abgleich (CRON_SECRET, Protokoll der Funktion)?`,
    );
  } else {
    teile.push(`Die neueste sichtbare Freitagspredigt ist vom ${hutba.datum}.`);
  }
  if (abgelaufen.length) {
    if (status === 'ok') status = 'hinweis';
    teile.push(
      `${abgelaufen.length === 1 ? 'Ein sichtbarer Eintrag ist' : `${abgelaufen.length} sichtbare Einträge sind`} abgelaufen und erscheinen nicht mehr: ${abgelaufen
        .map((e) => e.schluessel)
        .join(', ')}. Ausblenden oder entfernen.`,
    );
  }
  neu({ ...basis, status, meldung: teile.join(' '), ...(status === 'ok' ? {} : { aufwand: '10 min' }) });
}
