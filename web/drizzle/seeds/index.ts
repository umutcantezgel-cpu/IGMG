// Seeds (ADR 0015): Inhalte aus Bestand und Design mit Quellenvermerk, Beispielinhalte gekennzeichnet.
// Idempotent (vorhandene Einträge mit gleichem Slug/Schlüssel bleiben unverändert).
// Aufruf: pnpm db:seed (DATABASE_URL oder PGlite).
import { TZDate } from '@date-fns/tz';
import { holeDb, schema } from '../../src/lib/db';
import { dokumentAusAbsaetzen, klartext } from '../../src/lib/inhalt/tiptap';
import { BEREICHS_SEEDS } from './bereiche';
import { BEISPIEL_NACHRICHTEN } from './daten/nachrichten';
import { BEISPIEL_VERANSTALTUNG_DETAIL } from './daten/veranstaltung-detail';
import { BEISPIEL_VERANSTALTUNGEN } from './daten/veranstaltungen';

type Db = ReturnType<typeof holeDb>;

function berlin(lokal: string): Date {
  const [d, t] = lokal.split('T');
  const [j, m, tag] = d.split('-').map(Number);
  const [h, min] = t.split(':').map(Number);
  return new Date(new TZDate(j, m - 1, tag, h, min, 0, 'Europe/Berlin').getTime());
}

async function veranstaltungen(db: Db): Promise<number> {
  const werte = [...BEISPIEL_VERANSTALTUNGEN, BEISPIEL_VERANSTALTUNG_DETAIL].map((v) => ({
    slug: v.slug,
    status: 'veroeffentlicht' as const,
    istBeispiel: true,
    quelle: v.quelle,
    titel: v.titel,
    kurztext: v.kurztext,
    kategorie: v.kategorie,
    organisation: v.organisation,
    zielgruppe: v.zielgruppe ?? null,
    teilnehmerHinweis: v.teilnehmerHinweis ?? null,
    ort: v.ort,
    beginn: berlin(v.beginn),
    ende: v.ende ? berlin(v.ende) : null,
    wiederholung: v.wiederholung,
    empfohlen: v.empfohlen,
    kosten: v.kosten,
    beschreibung: v.beschreibung
      ? {
          de: dokumentAusAbsaetzen(v.beschreibung.de),
          ...(v.beschreibung.tr ? { tr: dokumentAusAbsaetzen(v.beschreibung.tr) } : {}),
          ...(v.beschreibung.en ? { en: dokumentAusAbsaetzen(v.beschreibung.en) } : {}),
        }
      : null,
    anmeldungAktiv: v.anmeldungAktiv ?? false,
    plaetze: v.plaetze ?? null,
    programm: v.programm ?? [],
    hinweise: v.hinweise ?? [],
    schlagwoerter: v.schlagwoerter ?? [],
    veranstalter: v.veranstalter ?? null,
    kontakt: v.kontakt ?? null,
    klartext: {
      de: `${v.titel.de}\n${v.kurztext.de}`,
      ...(v.titel.tr ? { tr: `${v.titel.tr}\n${v.kurztext.tr ?? ''}` } : {}),
      ...(v.titel.en ? { en: `${v.titel.en}\n${v.kurztext.en ?? ''}` } : {}),
    },
  }));
  const r = await db
    .insert(schema.veranstaltung)
    .values(werte)
    .onConflictDoNothing({ target: schema.veranstaltung.slug })
    .returning({ id: schema.veranstaltung.id });
  return r.length;
}

async function nachrichten(db: Db): Promise<number> {
  const werte = BEISPIEL_NACHRICHTEN.map((n) => {
    const inhalt = {
      de: dokumentAusAbsaetzen(n.absaetze.de),
      ...(n.absaetze.tr ? { tr: dokumentAusAbsaetzen(n.absaetze.tr) } : {}),
      ...(n.absaetze.en ? { en: dokumentAusAbsaetzen(n.absaetze.en) } : {}),
    };
    return {
      slug: n.slug,
      status: 'veroeffentlicht' as const,
      istBeispiel: true,
      quelle: n.quelle,
      titel: n.titel,
      kurztext: n.kurztext,
      inhalt,
      kategorie: n.kategorie,
      wichtig: n.wichtig,
      veroeffentlichtAm: berlin(n.veroeffentlicht),
      empfohlen: n.empfohlen,
      lesezeit: n.lesezeit,
      klartext: {
        de: `${n.titel.de}\n${klartext(inhalt.de)}`,
        ...(inhalt.tr ? { tr: `${n.titel.tr ?? ''}\n${klartext(inhalt.tr)}` } : {}),
        ...(inhalt.en ? { en: `${n.titel.en ?? ''}\n${klartext(inhalt.en)}` } : {}),
      },
    };
  });
  const r = await db
    .insert(schema.nachricht)
    .values(werte)
    .onConflictDoNothing({ target: schema.nachricht.slug })
    .returning({ id: schema.nachricht.id });
  return r.length;
}

async function seiteninhalte(db: Db): Promise<number> {
  // Kontaktdaten: nur Design-Platzhalter und Beispielwerte des Bestands (Footer.tsx:98–125, M-010, M-011, M-019)
  const r = await db
    .insert(schema.seiteninhalt)
    .values({
      bereich: 'kontakt',
      istBeispiel: true,
      quelle:
        'design/Footer.dc.html (Platzhalter); bestand/src/app/components/Footer.tsx:98-125 (Öffnungszeiten, E-Mail als Beispielwerte)',
      inhalt: {
        adresse: '[Adresse]',
        telefon: '[Telefonnummer]',
        notfallTelefon: '[Telefonnummer Notfall]',
        email: 'info@igmg-wetzlar.de',
        oeffnungszeiten: [
          {
            tage: { de: 'Mo.–Fr.', tr: 'Pzt.–Cum.', en: 'Mon–Fri' },
            zeiten: '09:00–22:00 Uhr',
            von: [1, 2, 3, 4, 5],
            start: '09:00',
            ende: '22:00',
          },
          {
            tage: { de: 'Sa.–So.', tr: 'Cmt.–Paz.', en: 'Sat–Sun' },
            zeiten: '08:00–22:00 Uhr',
            von: [6, 0],
            start: '08:00',
            ende: '22:00',
          },
        ],
        social: {},
      },
    })
    .onConflictDoNothing({ target: schema.seiteninhalt.bereich })
    .returning({ b: schema.seiteninhalt.bereich });
  return r.length;
}

async function einstellungen(db: Db): Promise<number> {
  const r = await db
    .insert(schema.einstellung)
    .values([
      { schluessel: 'allgemein', wert: { konzepthinweis: true } },
      {
        schluessel: 'gebetszeiten',
        wert: {
          aktiveQuelle: 'berechnung',
          bestaetigt: false,
          methode: 'Turkey',
          madhab: 'shafi',
          hoheBreite: 'seventhofthenight',
          anpassungen: {},
        },
      },
    ])
    .onConflictDoNothing({ target: schema.einstellung.schluessel })
    .returning({ s: schema.einstellung.schluessel });
  return r.length;
}

const SEEDS: { name: string; lauf: (db: Db) => Promise<number> }[] = [
  { name: 'einstellungen', lauf: einstellungen },
  { name: 'seiteninhalte', lauf: seiteninhalte },
  { name: 'veranstaltungen', lauf: veranstaltungen },
  { name: 'nachrichten', lauf: nachrichten },
  ...BEREICHS_SEEDS,
];

async function main() {
  const db = holeDb();
  const fehler: string[] = [];
  // Ein fehlerhafter Bereichs-Seed bricht die übrigen nicht ab (parallele Pakete, E-027); Exit 1 am Ende
  for (const s of SEEDS) {
    try {
      console.log(`Seed ${s.name}: ${await s.lauf(db)} neu`);
    } catch (e) {
      fehler.push(s.name);
      console.error(`Seed ${s.name} FEHLER: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  console.log(fehler.length ? `Seeds mit Fehlern: ${fehler.join(', ')}` : 'Seeds fertig.');
  process.exit(fehler.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
