import { and, desc, eq, gt, gte, inArray, lte, ne } from 'drizzle-orm';
import type { Datenbank } from '@/lib/db';
import * as schema from '@/lib/db/schema';
import { berlinerDatum } from '@/lib/gebetszeiten/naechstes';
import { jahresdateiEnde, leseJahresdatei } from '@/lib/gebetszeiten/quellen/datei';
import { gebetszeitenEinstellung } from '@/lib/validierung/einstellungen';
import type { Pruefung } from './pruefungen';

/**
 * Startklar-Prüfungen zu den Gebetszeiten aus dem IGMG-Gebetskalender (ADR 0048): Abdeckung der nächsten 30 Tage mit
 * Tabellen (IGMG oder Gemeinde), Alter des letzten erfolgreichen Abgleichs und Fehlschläge in Folge, offene Konflikte mit
 * dem Import, Ende der Jahresdatei und – solange kein offizieller Zugang eingerichtet ist – der Menschen-Punkt
 * „IGMG-Datenzugang anfragen“ (MENSCHEN M-100). Prüfungen dürfen erweitert, nie abgeschwächt werden.
 */
type Umgebung = Readonly<Record<string, string | undefined>>;

const ORT = 'Verwaltung › Gebetszeiten (ADR 0048)';
const TAG_MS = 86_400_000;

function tagPlus(datum: string, n: number): string {
  const [j, m, t] = datum.split('-').map(Number);
  return new Date(Date.UTC(j, m - 1, t + n)).toISOString().slice(0, 10);
}

export async function gebetszeitenPruefen(
  db: Datenbank,
  env: Umgebung,
  produktion: boolean,
  jetzt: Date,
  neu: (p: Pruefung) => void,
): Promise<void> {
  const [z] = await db
    .select({ wert: schema.einstellung.wert })
    .from(schema.einstellung)
    .where(eq(schema.einstellung.schluessel, 'gebetszeiten'))
    .limit(1);
  const gelesen = gebetszeitenEinstellung.safeParse(z?.wert ?? {});
  const einstellung = gelesen.success ? gelesen.data : gebetszeitenEinstellung.parse({});
  const heute = berlinerDatum(jetzt);

  // 1. Abdeckung: Tage aus Tabellen in den nächsten 30 Tagen
  const tg = schema.gebetszeitTag;
  const tage = (
    await db
      .select({ datum: tg.datum })
      .from(tg)
      .where(and(gte(tg.datum, heute), lte(tg.datum, tagPlus(heute, 29)), ne(tg.quelle, 'berechnet')))
  ).length;
  // Mit der aktiven Quelle „Berechnung“ lesen die öffentlichen Lader keine Tabelle (server/queries/gebetszeiten.ts) – dann
  // zählen vorhandene Tabellen-Tage nicht als Abdeckung
  const berechnung = einstellung.aktiveQuelle === 'berechnung';
  const wirksam = berechnung ? 0 : tage;
  neu({
    id: 'inhalte.gebetszeiten-abdeckung',
    bereich: 'inhalte',
    titel: 'Gebetszeiten aus dem IGMG-Kalender (30 Tage)',
    status: wirksam >= 30 ? 'ok' : wirksam < 7 && produktion ? 'fehler' : 'warnung',
    meldung:
      wirksam >= 30
        ? 'Für die nächsten 30 Tage liegen Zeiten aus Tabellen vor (IGMG-Kalender oder Gemeinde).'
        : berechnung && tage
          ? `Für ${tage} der nächsten 30 Tage liegen Zeiten aus Tabellen vor, aber die aktive Quelle ist „Berechnung“ – öffentlich erscheinen alle Tage als „berechnet (vorläufig)“. Verwaltung › Gebetszeiten › Quelle auf „IGMG-Gebetskalender“ stellen.`
          : `Nur ${wirksam} der nächsten 30 Tage haben Zeiten aus einer Tabelle; die übrigen sind „berechnet (vorläufig)“. Monat aus dem IGMG-Gebetskalender einfügen oder den Abgleich einrichten${berechnung ? ' und die Quelle auf „IGMG-Gebetskalender“ stellen' : ''}.`,
    ort: ORT,
    aufwand: '10 min je Monat',
  });

  // 2. Abgleich: Alter des letzten erfolgreichen Laufs, Fehlschläge in Folge (nur bei eingeschaltetem Abgleich)
  const a = schema.gebetszeitAbgleich;
  const laeufe = await db.select({ status: a.status, gestartet: a.gestartet }).from(a).orderBy(desc(a.gestartet)).limit(10);
  if (einstellung.abgleich.aktiv) {
    const erfolg = laeufe.find((l) => ['ok', 'unveraendert', 'freigegeben'].includes(l.status));
    const ersterOhneFehler = laeufe.findIndex((l) => l.status !== 'fehler');
    const fehlerInFolge = ersterOhneFehler === -1 ? laeufe.length : ersterOhneFehler;
    const alterTage = erfolg ? (jetzt.getTime() - erfolg.gestartet.getTime()) / TAG_MS : Number.POSITIVE_INFINITY;
    neu({
      id: 'inhalte.gebetszeiten-abgleich',
      bereich: 'inhalte',
      titel: 'IGMG-Abgleich der Gebetszeiten',
      status: alterTage > 7 || fehlerInFolge >= 3 ? 'fehler' : alterTage > 2 ? 'warnung' : 'ok',
      meldung: !erfolg
        ? 'Der Abgleich ist eingeschaltet, war aber noch nie erfolgreich.'
        : fehlerInFolge >= 3
          ? `Der Abgleich ist ${fehlerInFolge}-mal in Folge fehlgeschlagen.`
          : alterTage > 2
            ? `Der letzte erfolgreiche Abgleich liegt ${Math.floor(alterTage)} Tage zurück.`
            : 'Der letzte Abgleich war erfolgreich.',
      ort: `${ORT}; Cron /api/wartung/gebetszeiten-abgleich`,
      aufwand: '15 min',
    });
  } else {
    neu({
      id: 'inhalte.gebetszeiten-abgleich',
      bereich: 'inhalte',
      titel: 'IGMG-Abgleich der Gebetszeiten',
      status: 'hinweis',
      meldung: 'Der tägliche Abgleich ist ausgeschaltet; Zeiten kommen aus eingefügten Tabellen, dem Import oder der Näherung.',
      ort: ORT,
    });
  }

  // 3. Offene Konflikte mit dem Import der Gemeinde (letzter Lauf mit Konflikten, solange kein späterer ohne)
  const [konflikt] = await db
    .select({ konflikte: a.konflikte, gestartet: a.gestartet })
    .from(a)
    .where(gt(a.konflikte, 0))
    .orderBy(desc(a.gestartet))
    .limit(1);
  const spaeterOhne = konflikt
    ? (
        await db
          .select({ id: a.id })
          .from(a)
          .where(and(gt(a.gestartet, konflikt.gestartet), inArray(a.status, ['ok', 'unveraendert']), eq(a.konflikte, 0)))
          .limit(1)
      ).length > 0
    : false;
  const offen = konflikt && !spaeterOhne ? konflikt.konflikte : 0;
  neu({
    id: 'inhalte.gebetszeiten-konflikte',
    bereich: 'inhalte',
    titel: 'Abweichungen IGMG-Kalender und Import',
    status: offen ? 'hinweis' : 'ok',
    meldung: offen
      ? `An ${offen} Tagen weicht der IGMG-Kalender vom Import der Gemeinde ab; es gilt der Import.`
      : 'Keine offenen Abweichungen zum Import der Gemeinde.',
    ort: ORT,
    aufwand: '10 min',
  });

  // 4. Jahresdatei: Ende und Prüfsumme (nur wenn eine Datei vorliegt)
  const jahr = Number(heute.slice(0, 4));
  let ungueltig = false;
  for (const j of [jahr, jahr + 1]) {
    try {
      leseJahresdatei(einstellung.abgleich.stadtId, j);
    } catch {
      ungueltig = true;
    }
  }
  const ende = jahresdateiEnde(einstellung.abgleich.stadtId, jahr);
  if (ungueltig || ende) {
    const restTage = ende ? (Date.parse(`${ende}T00:00:00Z`) - Date.parse(`${heute}T00:00:00Z`)) / TAG_MS : 0;
    neu({
      id: 'inhalte.gebetszeiten-datei',
      bereich: 'inhalte',
      titel: 'Jahresdatei des IGMG-Gebetskalenders',
      status: ungueltig ? 'fehler' : restTage < 60 ? 'warnung' : 'ok',
      meldung: ungueltig
        ? 'Eine Jahresdatei unter web/daten/igmg-gebetskalender/ ist unlesbar oder ihre Prüfsumme fehlt in QUELLE.md.'
        : restTage < 60
          ? `Die Jahresdatei endet am ${ende}; die Datei für das Folgejahr bei der IGMG anfragen.`
          : `Die Jahresdatei reicht bis ${ende}.`,
      ort: 'web/daten/igmg-gebetskalender/ (QUELLE.md, ADR 0025)',
      aufwand: '30 min',
    });
  }

  // 5. Offizieller Zugang: solange keine Adresse gesetzt ist, ein Punkt für Menschen
  if (!env.GEBETSZEITEN_IGMG_URL?.trim()) {
    neu({
      id: 'inhalte.gebetszeiten-igmg-zugang',
      bereich: 'inhalte',
      titel: 'IGMG-Datenzugang für Gebetszeiten',
      status: 'manuell',
      meldung:
        'Bei der IGMG einen offiziellen Zugang zum Gebetskalender (Feed mit Schlüssel oder Jahresdatei für Wetzlar, Methode, schriftliche Erlaubnis) anfragen und GEBETSZEITEN_IGMG_URL setzen (MENSCHEN M-100).',
      ort: 'Vorstand; danach Vercel › Environment Variables',
      aufwand: 'Wochen (Anfrage beim Dachverband)',
    });
  }
}
