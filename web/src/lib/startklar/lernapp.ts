import { and, count, eq, gte, inArray, isNull, like, sql } from 'drizzle-orm';
import type { Datenbank } from '@/lib/db';
import * as schema from '@/lib/db/schema';
import { entscheideWirksam, type Funktion } from '@/lib/funktionen-regeln';
import { SPRACHEN } from '@/lib/lernapp/kurse';
import { MATRIX, ROLLEN } from '@/lib/rechte/matrix';
import { funktionenEinstellung } from '@/lib/validierung/einstellungen';
import type { Pruefung } from './pruefungen';

/**
 * Cockpit-Karte „Lern-App“ (PLAN §7.1, ADR 0041 Folgen, L3-06): Schalter, Blob-Speicher für Audio, Prüfende (mindestens
 * zwei mit religiöser Prüfung, mindestens eine Person je Prüfsprache), Einheiten je Status, offene Meldungen und abgelehnte
 * Abgleiche wegen der Grenzen je Konto (S-L1 M-2, nur Zahlen). Prüfungen dürfen erweitert, nie abgeschwächt werden.
 */
type Umgebung = Readonly<Record<string, string | undefined>>;

const SPRACHNAMEN: Record<string, string> = { de: 'Deutsch', tr: 'Türkisch', ar: 'Arabisch' };
const SCHALTER: { f: Funktion; name: string }[] = [
  { f: 'lernapp', name: 'Lern-App' },
  { f: 'lernapp_ungeprueft', name: 'Einheiten vor der Stichprobe (mit Hinweis)' },
  { f: 'lernapp_meldungen', name: 'Fehlermeldungen' },
  { f: 'lernapp_sprechen', name: 'Sprechübungen' },
  { f: 'lernapp_sync', name: 'Abgleich' },
  { f: 'lernapp_gruppen', name: 'Gruppen' },
];

const zahl = (n: number, eins: string, viele: string) => (n === 1 ? `1 ${eins}` : `${n} ${viele}`);

export async function lernappPruefen(
  db: Datenbank,
  env: Umgebung,
  produktion: boolean,
  jetzt: Date,
  neu: (p: Pruefung) => void,
): Promise<void> {
  const [z] = await db
    .select({ wert: schema.einstellung.wert })
    .from(schema.einstellung)
    .where(eq(schema.einstellung.schluessel, 'funktionen'))
    .limit(1);
  const gelesen = funktionenEinstellung.safeParse(z?.wert ?? {});
  const werte = gelesen.success ? gelesen.data : null;
  const an = (f: Funktion) => entscheideWirksam(f, env, werte);
  const lernapp = an('lernapp');

  neu({
    id: 'lernapp.schalter',
    bereich: 'lernapp',
    titel: 'Schalter der Lern-App',
    status: lernapp ? 'ok' : 'hinweis',
    meldung: lernapp
      ? `Eingeschaltet: ${SCHALTER.filter((s) => an(s.f))
          .map((s) => s.name)
          .join(', ')}. Ausgeschaltet: ${
          SCHALTER.filter((s) => !an(s.f))
            .map((s) => s.name)
            .join(', ') || '–'
        }.`
      : 'Die Lern-App ist ausgeschaltet (in der Produktion bis zur Abnahme). Seiten und Links erscheinen erst danach.',
    ort: 'Umgebung FUNKTION_LERNAPP=an|aus bzw. Einstellung „funktionen“ (ADR 0035, KERN 4.0 §6)',
    aufwand: '5 min',
  });
  if (!lernapp) return;

  // Audio: ohne Blob-Speicher nur Testbündel; Hörübungen zeigen „Audio folgt“ (KERN 4.0 §4)
  const blob = Boolean(env.LERNAPP_BLOB_BASIS?.trim());
  neu({
    id: 'lernapp.blob',
    bereich: 'lernapp',
    titel: 'Audio-Speicher der Lern-App',
    status: blob ? 'ok' : produktion ? 'warnung' : 'hinweis',
    meldung: blob
      ? 'Die Adresse des Blob-Speichers „lernapp“ ist gesetzt.'
      : 'LERNAPP_BLOB_BASIS fehlt: Hörübungen zeigen „Audio folgt“ (nur der Testkurs hat Töne). Erst mit der Tarifentscheidung (LM-15).',
    ort: 'Vercel › Storage › Blob „lernapp“; docs/deploy/VERCEL-ENV.md',
    aufwand: '15 min',
  });

  // Prüfende: religiöse Prüfung (zwei Freigaben, ADR 0040) und Sprachprüfung je Sprache (ADR 0041)
  const aktiv = isNull(schema.user.gesperrtAm);
  const [religioes] = await db
    .select({ n: sql<number>`count(distinct ${schema.rolleZuweisung.benutzerId})`.mapWith(Number) })
    .from(schema.rolleZuweisung)
    .innerJoin(schema.user, eq(schema.user.id, schema.rolleZuweisung.benutzerId))
    .where(and(eq(schema.rolleZuweisung.rolle, 'religioese_pruefung'), aktiv));
  const nReligioes = religioes?.n ?? 0;
  neu({
    id: 'lernapp.pruefende-religioes',
    bereich: 'lernapp',
    titel: 'Religiöse Prüfung (zwei Personen)',
    status: nReligioes >= 2 ? 'ok' : produktion ? 'warnung' : 'hinweis',
    meldung:
      nReligioes >= 2
        ? `${zahl(nReligioes, 'Person hat', 'Personen haben')} die Rolle „religiöse Prüfung“.`
        : `Nur ${zahl(nReligioes, 'Person hat', 'Personen haben')} die Rolle „religiöse Prüfung“. Wissenskurs, Koran-Arabisch und Einträge mit Religionsbezug brauchen zwei Freigaben von zwei Personen und bleiben bis dahin verborgen.`,
    ort: 'Verwaltung › Benutzer (Vier-Augen-Prinzip), MENSCHEN LM-03',
    aufwand: '30 min',
  });

  const pruefRollen = ROLLEN.filter((r) => MATRIX[r].has('lernapp.sprache.pruefen'));
  const sprachen = await db
    .select({
      sprache: schema.lernappPrueferSprache.sprache,
      n: sql<number>`count(distinct ${schema.lernappPrueferSprache.benutzerId})`.mapWith(Number),
    })
    .from(schema.lernappPrueferSprache)
    .innerJoin(schema.user, eq(schema.user.id, schema.lernappPrueferSprache.benutzerId))
    .where(
      and(
        aktiv,
        inArray(
          schema.lernappPrueferSprache.benutzerId,
          db
            .select({ id: schema.rolleZuweisung.benutzerId })
            .from(schema.rolleZuweisung)
            .where(inArray(schema.rolleZuweisung.rolle, pruefRollen)),
        ),
      ),
    )
    .groupBy(schema.lernappPrueferSprache.sprache);
  const je = Object.fromEntries(sprachen.map((s) => [s.sprache, s.n]));
  const fehlen = SPRACHEN.filter((s) => !je[s]);
  neu({
    id: 'lernapp.pruefende-sprache',
    bereich: 'lernapp',
    titel: 'Sprachprüfung je Sprache',
    status: fehlen.length === 0 ? 'ok' : produktion ? 'warnung' : 'hinweis',
    meldung:
      fehlen.length === 0
        ? `Prüfende je Sprache: ${SPRACHEN.map((s) => `${SPRACHNAMEN[s]} ${je[s]}`).join(', ')} (empfohlen sind je zwei, LM-01).`
        : `Ohne Prüfperson: ${fehlen.map((s) => SPRACHNAMEN[s]).join(', ')}. Einheiten dieser Sprachen bleiben „automatisch geprüft“ (mit Hinweis), bis eine Stichprobe bestanden ist.`,
    ort: 'Verwaltung › Lern-App › Prüfende (Rolle „Sprachprüfung“ mit Prüfsprachen)',
    aufwand: '15 min je Person',
  });

  // Einheiten je Status (Sprachkurse, Wissen, Koran-Arabisch)
  const stati = await db
    .select({ status: schema.lernappEinheit.status, n: count() })
    .from(schema.lernappEinheit)
    .groupBy(schema.lernappEinheit.status);
  const n = (s: string) => stati.find((x) => x.status === s)?.n ?? 0;
  const gesamt = stati.reduce((a, x) => a + x.n, 0);
  neu({
    id: 'lernapp.einheiten',
    bereich: 'lernapp',
    titel: 'Einheiten je Status',
    status: gesamt > 0 ? 'ok' : 'hinweis',
    meldung:
      gesamt > 0
        ? `${zahl(gesamt, 'Einheit', 'Einheiten')}: ${n('veroeffentlicht')} veröffentlicht, ${n('automatisch_geprueft')} automatisch geprüft (mit Hinweis), ${n('entwurf')} Entwurf, ${n('gesperrt')} gesperrt.`
        : 'Noch keine Einheiten importiert (pnpm lernapp:import).',
    ort: 'Verwaltung › Lern-App',
    aufwand: gesamt > 0 ? '–' : '30 min',
  });

  const [meldungen] = await db.select({ n: count() }).from(schema.lernappMeldung).where(eq(schema.lernappMeldung.status, 'offen'));
  const offen = meldungen?.n ?? 0;
  neu({
    id: 'lernapp.meldungen',
    bereich: 'lernapp',
    titel: 'Fehlermeldungen aus der App',
    status: offen > 0 ? 'hinweis' : 'ok',
    meldung: offen > 0 ? `${zahl(offen, 'Meldung ist', 'Meldungen sind')} offen.` : 'Keine offene Meldung.',
    ort: 'Verwaltung › Lern-App › Meldungen',
    aufwand: '5 min je Meldung',
  });

  // Abgleich: Anfragen, die an den Grenzen je Konto scheiterten (letzte 7 Tage, ohne Personenbezug)
  const ab = new Date(jetzt.getTime() - 6 * 86_400_000).toISOString().slice(0, 10);
  const [grenzen] = await db
    .select({ n: sql<number>`coalesce(sum(${schema.lernappStatistikTag.wert}), 0)`.mapWith(Number) })
    .from(schema.lernappStatistikTag)
    .where(
      and(
        eq(schema.lernappStatistikTag.kursId, ''),
        eq(schema.lernappStatistikTag.bereich, 'betrieb'),
        like(schema.lernappStatistikTag.kennzahl, 'sync_grenze_%'),
        gte(schema.lernappStatistikTag.tag, ab),
      ),
    );
  const nGrenzen = grenzen?.n ?? 0;
  if (nGrenzen > 0 || an('lernapp_sync'))
    neu({
      id: 'lernapp.grenzen',
      bereich: 'lernapp',
      titel: 'Abgleich an den Grenzen je Konto',
      status: nGrenzen > 0 ? 'hinweis' : 'ok',
      meldung:
        nGrenzen > 0
          ? `${zahl(nGrenzen, 'Abgleich wurde', 'Abgleiche wurden')} in den letzten 7 Tagen wegen der Grenzen je Konto abgelehnt (Ereignisse gesamt, je Tag oder Geräte). Häufung prüfen.`
          : 'Kein Abgleich wurde in den letzten 7 Tagen wegen der Grenzen je Konto abgelehnt.',
      ort: 'web/src/lib/lernapp/sync/protokoll.ts (GRENZEN), S-L1 M-2',
      aufwand: '15 min',
    });
}
