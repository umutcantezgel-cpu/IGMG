// Testeinheit des Wissenskurses mit Testfreigaben zweier Prüfkonten (AUFTRAG §6 Station 6, PLAN §3.11, ADR 0040 Nr. 5).
// Nur für E2E, Entwicklung und einen Beispielmodus, der den Testkurs anfordert (LERNAPP_TESTKURS=1) – nie in der Produktion
// und nie auf der öffentlichen Test-Domain: läuft nur mit `pnpm lernapp:import --testkurs` (scripts/lernapp/import.ts) und
// verweigert die Testfreigaben in der Betriebsart „produktion“ mit eigener Datenbank sowie im Vercel-Bau ohne
// LERNAPP_TESTKURS=1. Dort zeigt der Wissenskurs ohne echte Freigaben nur den Platzhalter.
// - KI-Regel 2 (ADR 0040, KERN 4.0 §2): KEINE religiösen Inhalte – Lektion, Aussagen, Beleg und Quizfragen sind Platzhalter
//   in eckigen Klammern; die Quelle ist eine Testquelle, kein Werk des Registers. Keine arabische Schrift.
// - Eigener Ort wie die Testeinheiten der Sprachkurse (`<kurs>.a1.test`, Paket N1): Einheit `islam.grund.test` – sie ersetzt
//   nie eine echte Einheit des Wissenskurses.
// - Prüfkonten `lernapp-testpruefung-1/-2`: Rolle `religioese_pruefung`, ohne Passwort und ohne Sitzung (nicht anmeldbar),
//   Adressen unter `.invalid` (RFC 2606). Je Baustein (Lektion, Aussagen, Quizfragen) zwei Freigaben „ok“ zum aktuellen Hash,
//   jeder Beleg „am Original geprüft“ bestätigt. Verfasst ist alles vom Testkurs (`test:…`), nie von einem Prüfkonto.
// - Gegenprobe (Station 6): Die Aussage `islam.grund.test.l02.s01` hat nur EINE Freigabe – ihre Lektion `l02` erscheint
//   nirgends.
// - Kennzeichnung (KERN 4.0 §2.3, ADR 0040 Nr. 4): Die Aussage `l01.s02` ist als strittig markiert (Platzhalter, kein
//   strittiges Thema) – Lernpfad „Enthält strittige Themen“, nach ihren Quizfragen „Strittiges Thema“. Zuordnen und
//   Reihenfolge tragen eine inhaltliche Frage (Feld `anweisung` wie in den Inhaltsdateien), die im Spieler ankommt.
// Idempotent: Die Testeinheit (samt Lektionen, Aussagen, Belegen, Quizfragen) und die Prüfungen der Prüfkonten werden bei
// jedem Lauf neu angelegt.
import { eq, inArray } from 'drizzle-orm';
import type { Datenbank } from '../../src/lib/db';
import { schema } from '../../src/lib/db';
import { inhaltHash } from '../../src/lib/lernapp/paket/hash';
import { betriebsart } from '../../src/lib/umgebung';

export const TEST_WISSEN_EINHEIT = 'islam.grund.test';
export const TEST_PRUEFKONTEN = ['lernapp-testpruefung-1', 'lernapp-testpruefung-2'] as const;
const VERFASST = 'test:lernapp-testkurs';
const QUELLE_KURZ = 'test_quelle';
const e = TEST_WISSEN_EINHEIT;

type Aussage = { schluessel: string; text: string; freigaben: 0 | 1 | 2; strittig?: true };
type Aufgabe = { schluessel: string; typ: string; aussage: string; daten: Record<string, unknown> };
type Lektion = { schluessel: string; titel: string; kinderGeeignet: boolean; aussagen: Aussage[]; aufgaben: Aufgabe[] };

/** Platzhalter-Inhalte (Format der Inhaltsdateien, `IslamAufgabeSchema` ohne Kopf). */
export const TEST_WISSEN: { thema: string; lektionen: Lektion[] } = {
  thema: '[Testeinheit Wissen – Platzhalter]',
  lektionen: [
    {
      schluessel: `${e}.l01`,
      titel: '[Testlektion Wissen – Platzhalter]',
      kinderGeeignet: true,
      aussagen: [
        { schluessel: `${e}.l01.s01`, text: '[Testaussage eins – Platzhalter, kein Lehrinhalt]', freigaben: 2 },
        // als strittig markiert: Platzhalter für die Kennzeichnung, kein strittiges Thema
        { schluessel: `${e}.l01.s02`, text: '[Testaussage zwei – Platzhalter, kein Lehrinhalt]', freigaben: 2, strittig: true },
        // ohne Quizfrage: zählt trotzdem zur Lektion (alle Bausteine, KERN 4.0 §2.3)
        { schluessel: `${e}.l01.s03`, text: '[Testaussage drei – Platzhalter, kein Lehrinhalt]', freigaben: 2 },
      ],
      aufgaben: [
        {
          schluessel: `${e}.l01.q01`,
          typ: 'wahr_falsch',
          aussage: `${e}.l01.s01`,
          daten: { behauptung: '[Testbehauptung – Platzhalter]', richtig: true, begruendung: '[Testbegründung – Platzhalter]' },
        },
        {
          schluessel: `${e}.l01.q02`,
          typ: 'zuordnen',
          aussage: `${e}.l01.s02`,
          daten: {
            anweisung: '[Ordne zu – Platzhalter]',
            paare: [
              { links: '[Eintrag A]', rechts: '[Kategorie 1]' },
              { links: '[Eintrag B]', rechts: '[Kategorie 2]' },
              { links: '[Eintrag C]', rechts: '[Kategorie 1]' },
            ],
          },
        },
        {
          schluessel: `${e}.l01.q03`,
          typ: 'reihenfolge',
          aussage: `${e}.l01.s02`,
          daten: { anweisung: '[Ordne – Platzhalter]', schritte: ['[Schritt 1]', '[Schritt 2]', '[Schritt 3]'] },
        },
        {
          schluessel: `${e}.l01.q04`,
          typ: 'fallfrage',
          aussage: `${e}.l01.s01`,
          daten: {
            fall: '[Übungsfall – Platzhalter]',
            frage: '[Frage – Platzhalter]',
            optionen: ['[Antwort A]', '[Antwort B]', '[Antwort C]'],
            richtig: 1,
          },
        },
      ],
    },
    {
      schluessel: `${e}.l02`,
      titel: '[Testlektion Gegenprobe – Platzhalter]',
      kinderGeeignet: false,
      aussagen: [{ schluessel: `${e}.l02.s01`, text: '[Testaussage Gegenprobe – Platzhalter, nur eine Freigabe]', freigaben: 1 }],
      aufgaben: [
        {
          schluessel: `${e}.l02.q01`,
          typ: 'wahr_falsch',
          aussage: `${e}.l02.s01`,
          daten: { behauptung: '[Testbehauptung Gegenprobe]', richtig: false, begruendung: '[Testbegründung Gegenprobe]' },
        },
      ],
    },
  ],
};

/**
 * Testfreigaben nur außerhalb der Produktion mit eigener Datenbank (Bau ohne Datenbank, E2E, Entwicklung) – und im
 * Vercel-Bau nur, wenn der Testkurs ausdrücklich angefordert ist (`LERNAPP_TESTKURS=1`): Die öffentliche Test-Domain zeigt
 * keine Testeinheit mit Prüfvermerk (wie die Testeinheiten der Sprachkurse, Paket N1 / Stufe C L15-1).
 */
export function testfreigabenErlaubt(env: NodeJS.ProcessEnv = process.env): boolean {
  if (env.VERCEL === '1' && env.LERNAPP_TESTKURS !== '1') return false;
  return betriebsart(env) !== 'produktion' || env.BAU_PGLITE === '1';
}

/** Testeinheit des Wissenskurses mit Testfreigaben anlegen; ohne Erlaubnis (Produktion) nichts. */
export async function lernappTestWissen(db: Datenbank, jetzt = new Date()): Promise<{ lektionen: number; freigaben: number } | null> {
  if (!testfreigabenErlaubt()) return null;
  return db.transaction(async (tx) => {
    await tx.insert(schema.lernappKurs).values({ id: 'islam', art: 'wissen', zielsprache: 'de', aktiv: true }).onConflictDoNothing();
    // Prüfkonten (nicht anmeldbar) mit Rolle
    for (const [i, id] of TEST_PRUEFKONTEN.entries()) {
      await tx
        .insert(schema.user)
        .values({ id, name: `[Testprüfung ${i + 1}]`, email: `${id}@beispiel.invalid`, emailVerified: true })
        .onConflictDoNothing();
      await tx.insert(schema.rolleZuweisung).values({ benutzerId: id, rolle: 'religioese_pruefung' }).onConflictDoNothing();
    }
    // neu anlegen: alte Testeinheit (Kaskade) und alte Prüfungen der Prüfkonten entfernen
    await tx.delete(schema.lernappEinheit).where(eq(schema.lernappEinheit.schluessel, e));
    await tx.delete(schema.lernappPruefung).where(inArray(schema.lernappPruefung.pruefendeId, [...TEST_PRUEFKONTEN]));
    const [abschnitt] = await tx
      .insert(schema.lernappAbschnitt)
      .values({ kursId: 'islam', stufe: 'grund', reihenfolge: 1 })
      .onConflictDoUpdate({ target: [schema.lernappAbschnitt.kursId, schema.lernappAbschnitt.stufe], set: { kursId: 'islam' } })
      .returning({ id: schema.lernappAbschnitt.id });
    const [quelle] = await tx
      .insert(schema.lernappQuelle)
      .values({ kurz: QUELLE_KURZ, werk: '[Testquelle – Platzhalter]', ausgabe: '[Testausgabe]', art: 'fiqh' })
      .onConflictDoUpdate({ target: schema.lernappQuelle.kurz, set: { werk: '[Testquelle – Platzhalter]' } })
      .returning({ id: schema.lernappQuelle.id });
    const thema = { de: TEST_WISSEN.thema };
    const [einheit] = await tx
      .insert(schema.lernappEinheit)
      .values({
        abschnittId: abschnitt!.id,
        schluessel: e,
        reihenfolge: 1,
        thema,
        inhaltHash: inhaltHash({ schluessel: e, thema }),
        verfasstVon: VERFASST,
        status: 'automatisch_geprueft',
      })
      .returning({ id: schema.lernappEinheit.id });

    const pruefungen: (typeof schema.lernappPruefung.$inferInsert)[] = [];
    const freigeben = (
      typ: 'lektion' | 'aussage' | 'aufgabe',
      id: string,
      hash: string,
      n: number,
      belege: { belegId: string; inhaltHash: string }[] = [],
    ) => {
      for (const pruefendeId of TEST_PRUEFKONTEN.slice(0, n))
        pruefungen.push({
          inhaltTyp: typ,
          inhaltId: id,
          inhaltHash: hash,
          art: 'religioes',
          pruefendeId,
          urteil: 'ok',
          belegeGeprueft: belege,
          am: jetzt,
        });
    };
    for (const [li, l] of TEST_WISSEN.lektionen.entries()) {
      const ziel = { de: l.titel };
      const lHash = inhaltHash({ schluessel: l.schluessel, ziel, kinderGeeignet: l.kinderGeeignet });
      const [lektion] = await tx
        .insert(schema.lernappLektion)
        .values({
          einheitId: einheit!.id,
          schluessel: l.schluessel,
          reihenfolge: li + 1,
          ziel,
          kinderGeeignet: l.kinderGeeignet,
          inhaltHash: lHash,
          verfasstVon: VERFASST,
          status: 'automatisch_geprueft',
        })
        .returning({ id: schema.lernappLektion.id });
      freigeben('lektion', lektion!.id, lHash, 2);
      const aussageId = new Map<string, string>();
      for (const [ai, a] of l.aussagen.entries()) {
        // Hash über alle angezeigten Felder, auch die Kennzeichnung „strittig“
        const aHash = inhaltHash({ schluessel: a.schluessel, text: a.text, ...(a.strittig ? { strittig: true } : {}) });
        const [zeile] = await tx
          .insert(schema.lernappAussage)
          .values({
            lektionId: lektion!.id,
            schluessel: a.schluessel,
            text: a.text,
            strittig: a.strittig ?? false,
            reihenfolge: ai + 1,
            inhaltHash: aHash,
            verfasstVon: VERFASST,
            quelle: VERFASST,
            status: 'automatisch_geprueft',
          })
          .returning({ id: schema.lernappAussage.id });
        aussageId.set(a.schluessel, zeile!.id);
        const stelle = { kitab: '[Kitab]', bab: '[Bab]', band: '1', seite: String(ai + 1) };
        const bHash = inhaltHash({ passage: `${QUELLE_KURZ}.ms000${ai + 1}`, stelle });
        const [beleg] = await tx
          .insert(schema.lernappBeleg)
          .values({
            aussageId: zeile!.id,
            quelleId: quelle!.id,
            passage: `${QUELLE_KURZ}.ms000${ai + 1}`,
            stelle,
            inhaltHash: bHash,
            verfasstVon: VERFASST,
          })
          .returning({ id: schema.lernappBeleg.id });
        freigeben('aussage', zeile!.id, aHash, a.freigaben, [{ belegId: beleg!.id, inhaltHash: bHash }]);
      }
      for (const [qi, q] of l.aufgaben.entries()) {
        const qHash = inhaltHash({ schluessel: q.schluessel, typ: q.typ, daten: q.daten });
        const [aufgabe] = await tx
          .insert(schema.lernappAufgabe)
          .values({
            lektionId: lektion!.id,
            schluessel: q.schluessel,
            typ: q.typ,
            daten: q.daten,
            reihenfolge: qi + 1,
            aussageId: aussageId.get(q.aussage)!,
            quelle: VERFASST,
            inhaltHash: qHash,
            verfasstVon: VERFASST,
            status: 'automatisch_geprueft',
          })
          .returning({ id: schema.lernappAufgabe.id });
        freigeben('aufgabe', aufgabe!.id, qHash, 2);
      }
    }
    if (pruefungen.length) await tx.insert(schema.lernappPruefung).values(pruefungen);
    return { lektionen: TEST_WISSEN.lektionen.length, freigaben: pruefungen.length };
  });
}
