import { resolveTxt } from 'node:dns/promises';
import { count, eq, sql } from 'drizzle-orm';
import journal from '../../../drizzle/migrations/meta/_journal.json';
import type { Datenbank } from '@/lib/db';
import * as schema from '@/lib/db/schema';
import { type Betriebsart, oeffentlicheAdresse, pruefeUmgebung } from '@/lib/umgebung';
import { schema as projekteSchema } from '@/lib/validierung/seiteninhalte/projekte';
import { dachverbandPruefen } from './dachverband';
import { gebetszeitenPruefen } from './gebetszeiten';
import { gemeindePruefen } from './gemeinde';
import { lernappPruefen } from './lernapp';
import { vergangeneOffene } from './meilensteine';
import { pruefeSpeicher, type SpeicherProbe, type Umgebung } from './speicher-probe';

/**
 * Startklar-Prüfungen (Kern 2.0, AUFTRAG V-11, Z-12): eine Quelle für das Cockpit `/verwaltung/startklar` und
 * `pnpm startklar`. Jede Prüfung sagt, was fehlt, wo es zu beheben ist und wie lange das dauert. Prüfungen dürfen
 * erweitert, nie abgeschwächt werden (UNANTASTBAR). Werte von Geheimnissen erscheinen nie in einer Meldung.
 */
export type Status = 'ok' | 'hinweis' | 'warnung' | 'fehler' | 'manuell';
export type Bereich = 'umgebung' | 'auslieferung' | 'datenbank' | 'inhalte' | 'recht' | 'gemeinde' | 'lernapp' | 'mail';

export type Pruefung = {
  id: string;
  bereich: Bereich;
  titel: string;
  status: Status;
  meldung: string;
  /** Wo es zu beheben ist (Dashboard-Seite, Verwaltungsmodul, Datei). */
  ort?: string;
  /** Geschätzter Aufwand für einen Menschen. */
  aufwand?: string;
};

export type StartklarErgebnis = {
  betriebsart: Betriebsart;
  zeitpunkt: string;
  pruefungen: Pruefung[];
  zaehler: Record<Status, number>;
  /** Startklar heißt: kein Fehler. Warnungen und manuelle Punkte stehen im Bericht. */
  startklar: boolean;
};

export type StartklarKontext = {
  env: Readonly<Record<string, string | undefined>>;
  /** Ohne Datenbank (z. B. CLI ohne DATABASE_URL) entfallen die Datenbank- und Inhaltsprüfungen mit Hinweis. */
  db: Datenbank | null;
  /** DNS-Abfragen für Mail-Einträge (SPF/DMARC); in Tests abschaltbar. */
  dnsPruefen?: boolean;
  /** Erreichbarkeitsprobe des Medienspeichers (V-11); in Tests abschaltbar oder durch eine Attrappe ersetzbar. */
  speicherPruefen?: boolean;
  speicherProbe?: (env: Umgebung) => Promise<SpeicherProbe>;
  jetzt?: Date;
};

const VERCEL_DOMAIN = /\.vercel\.app$/i;
/** Wo ein nicht erreichbarer Speicher zu beheben ist, je Art (ADR 0007, ADR 0020). */
const SPEICHER_ORT: Record<SpeicherProbe['art'], string> = {
  blob: 'Vercel › Storage › Blob (Frankfurt) und BLOB_READ_WRITE_TOKEN (docs/deploy/VERCEL.md, Speicher)',
  s3: 'S3-Anbieter: Bucket, Zugang und Endpunkt (S3_* in den Umgebungsvariablen)',
  dateisystem: 'MEDIEN_VERZEICHNIS bzw. Docker-Volume (docs/BETRIEB.md)',
};
const LOKAL = /^(localhost|127\.0\.0\.1|\[::1\])$/i;
/** Platzhalter in eckigen Klammern, z. B. „[Adresse]“ (Seeds, MENSCHEN.md). */
const PLATZHALTER = /\[[^\]]{2,}\]/;

/** Sucht Platzhalter nur in Texten, nicht in der JSON-Struktur (Listen in Rechtstexten sind keine Platzhalter). */
function hatPlatzhalter(wert: unknown): boolean {
  if (typeof wert === 'string') return PLATZHALTER.test(wert);
  if (Array.isArray(wert)) return wert.some(hatPlatzhalter);
  if (wert && typeof wert === 'object') return Object.values(wert).some(hatPlatzhalter);
  return false;
}

export async function fuehreStartklarAus(kontext: StartklarKontext): Promise<StartklarErgebnis> {
  const { env, db } = kontext;
  const umgebung = pruefeUmgebung(env);
  const betriebsart = umgebung.betriebsart;
  const produktion = betriebsart === 'produktion';
  const pruefungen: Pruefung[] = [];
  const neu = (p: Pruefung) => pruefungen.push(p);

  // 1. Umgebung: jede Meldung der gemeinsamen Umgebungsprüfung (lib/umgebung.ts) wird eine Zeile
  for (const befund of umgebung.befunde) {
    neu({
      id: `umgebung.${befund.variable}`,
      bereich: 'umgebung',
      titel: befund.variable,
      status: befund.schwere,
      meldung: befund.meldung,
      ort: 'Vercel › Projekt › Settings › Environment Variables (docs/deploy/VERCEL-ENV.md)',
      aufwand: '5 min',
    });
  }
  if (!umgebung.befunde.some((b) => b.schwere === 'fehler')) {
    neu({
      id: 'umgebung.pflicht',
      bereich: 'umgebung',
      titel: 'Pflichtvariablen',
      status: 'ok',
      meldung: `Alle Pflichtvariablen für „${betriebsart}“ sind gesetzt.`,
    });
  }

  // 2. Auslieferung: Region, Adresse mit HTTPS und eigener Domain, Cron
  const region = env.VERCEL_REGION;
  neu(
    region
      ? {
          id: 'auslieferung.region',
          bereich: 'auslieferung',
          titel: 'Region der Funktionen',
          status: region === 'fra1' ? 'ok' : 'warnung',
          meldung:
            region === 'fra1' ? 'Funktionen laufen in Frankfurt (fra1).' : `Funktionen laufen in ${region}, nicht in Frankfurt (fra1).`,
          ort: 'vercel.json › regions',
          aufwand: '5 min',
        }
      : {
          id: 'auslieferung.region',
          bereich: 'auslieferung',
          titel: 'Region der Funktionen',
          status: 'manuell',
          meldung: 'Außerhalb von Vercel nicht feststellbar. Auf Vercel muss fra1 (Frankfurt) eingestellt sein.',
          ort: 'vercel.json › regions; Vercel › Projekt › Settings › Functions',
          aufwand: '2 min',
        },
  );
  const adresse = oeffentlicheAdresse(env);
  const host = hostVon(adresse);
  neu({
    id: 'auslieferung.https',
    bereich: 'auslieferung',
    titel: 'Öffentliche Adresse mit HTTPS',
    status: adresse.startsWith('https://') ? 'ok' : produktion ? 'fehler' : 'hinweis',
    meldung: adresse.startsWith('https://') ? `Adresse: ${adresse}` : `Die Adresse ${adresse} ist nicht https.`,
    ort: 'APP_URL (Vercel › Environment Variables)',
    aufwand: '5 min',
  });
  if (produktion) {
    const eigene = Boolean(host) && !VERCEL_DOMAIN.test(host!) && !LOKAL.test(host!);
    neu({
      id: 'auslieferung.domain',
      bereich: 'auslieferung',
      titel: 'Eigene Domain',
      status: eigene ? 'ok' : 'warnung',
      meldung: eigene
        ? `Domain ${host} ist eingetragen.`
        : host && LOKAL.test(host)
          ? 'Die öffentliche Adresse zeigt auf diesen Rechner (localhost) – APP_URL mit der eigenen Domain setzen.'
          : 'Die Produktion läuft noch unter einer vercel.app-Adresse.',
      ort: 'Vercel › Projekt › Settings › Domains (docs/deploy/VERCEL.md, Schritt Domain)',
      aufwand: '15 min + DNS-Wartezeit',
    });
  }
  neu({
    id: 'auslieferung.schutz',
    bereich: 'auslieferung',
    titel: 'Vorschauen geschützt',
    status: 'manuell',
    meldung: 'Vercel Authentication für Vorschauen einschalten und den teilbaren Link für den Vorstand anlegen.',
    ort: 'Vercel › Projekt › Settings › Deployment Protection',
    aufwand: '5 min',
  });
  if (betriebsart === 'vorschau') {
    neu({
      id: 'auslieferung.vorschau-datenbank',
      bereich: 'auslieferung',
      titel: 'Vorschau mit eigener Datenbank',
      status: 'manuell',
      meldung:
        'Vorschauen dürfen nie die Produktionsdatenbank nutzen: DATABASE_URL im Bereich „Preview“ muss auf einen Neon-Branch zeigen.',
      ort: 'Vercel › Projekt › Storage (Neon-Integration) und Environment Variables › Preview',
      aufwand: '10 min',
    });
  }

  // Medienspeicher erreichbar (AUFTRAG V-11): lesende Probe mit Zeitlimit, schreibt nichts
  if (kontext.speicherPruefen !== false) {
    const probe = await (kontext.speicherProbe ?? pruefeSpeicher)(env);
    neu({
      id: 'auslieferung.speicher',
      bereich: 'auslieferung',
      titel: 'Medienspeicher erreichbar',
      status: probe.erreichbar ? 'ok' : betriebsart === 'entwicklung' ? 'warnung' : 'fehler',
      meldung: probe.meldung,
      ort: SPEICHER_ORT[probe.art],
      aufwand: '10 min',
    });
  }

  // 3. Datenbank: Verbindung und Migrationsstand
  if (!db) {
    neu({
      id: 'datenbank.verbindung',
      bereich: 'datenbank',
      titel: 'Datenbank',
      status: produktion ? 'fehler' : 'hinweis',
      meldung: 'Keine Datenbank verbunden (DATABASE_URL fehlt) – Datenbank- und Inhaltsprüfungen entfallen.',
      ort: 'Vercel › Storage › Neon (Frankfurt), docs/deploy/VERCEL.md',
      aufwand: '15 min',
    });
  } else {
    try {
      await datenbankPruefen(db, neu, produktion, kontext.jetzt ?? new Date());
    } catch {
      // Laufzeitfehler (Tabellen fehlen, obwohl die Verbindung steht): als Fehler melden statt die ganze Prüfung abzubrechen.
      neu({
        id: 'inhalte.lesbar',
        bereich: 'inhalte',
        titel: 'Inhalte lesbar',
        status: 'fehler',
        meldung: 'Die Inhalte lassen sich nicht lesen. Die Migrationen sind vermutlich unvollständig (siehe Migrationen).',
        ort: 'Vercel › Deployments › Redeploy',
        aufwand: '5 min',
      });
    }
    try {
      await gemeindePruefen(db, env, produktion, kontext.jetzt ?? new Date(), neu);
    } catch {
      neu({
        id: 'gemeinde.lesbar',
        bereich: 'gemeinde',
        titel: 'Gemeinde-Plattform lesbar',
        status: 'fehler',
        meldung: 'Schalter, Protokoll und Betriebsmeldungen lassen sich nicht lesen. Die Migrationen sind vermutlich unvollständig.',
        ort: 'Vercel › Deployments › Redeploy',
        aufwand: '5 min',
      });
    }
    try {
      await lernappPruefen(db, env, produktion, kontext.jetzt ?? new Date(), neu);
    } catch {
      neu({
        id: 'lernapp.lesbar',
        bereich: 'lernapp',
        titel: 'Lern-App lesbar',
        status: 'fehler',
        meldung: 'Schalter, Prüfende und Einheiten der Lern-App lassen sich nicht lesen. Die Migrationen sind vermutlich unvollständig.',
        ort: 'Vercel › Deployments › Redeploy',
        aufwand: '5 min',
      });
    }
    // Aus dem Dachverband (Marktstart P3, ADR 0046): neueste sichtbare Freitagspredigt höchstens 14 Tage alt, Ablauf
    try {
      await dachverbandPruefen(db, kontext.jetzt ?? new Date(), neu);
    } catch {
      neu({
        id: 'inhalte.dachverband-aktuell',
        bereich: 'inhalte',
        titel: 'Aus dem Dachverband aktuell',
        status: 'fehler',
        meldung: 'Der Seiteninhalt „Aus dem Dachverband“ lässt sich nicht lesen. Die Migrationen sind vermutlich unvollständig.',
        ort: 'Vercel › Deployments › Redeploy',
        aufwand: '5 min',
      });
    }
    // Gebetszeiten aus dem IGMG-Gebetskalender (ADR 0048): Abdeckung, Abgleich, Konflikte, Jahresdatei, Datenzugang
    try {
      await gebetszeitenPruefen(db, env, produktion, kontext.jetzt ?? new Date(), neu);
    } catch {
      neu({
        id: 'inhalte.gebetszeiten-lesbar',
        bereich: 'inhalte',
        titel: 'Gebetszeiten lesbar',
        status: 'fehler',
        meldung: 'Gebetszeiten und Abgleichprotokoll lassen sich nicht lesen. Die Migrationen sind vermutlich unvollständig.',
        ort: 'Vercel › Deployments › Redeploy',
        aufwand: '5 min',
      });
    }
  }

  // 4. Mail-DNS (SPF, DMARC) der Absender-Domain
  const absenderDomain = /@([^>\s]+)>?\s*$/.exec(env.MAIL_ABSENDER ?? '')?.[1];
  if (produktion && absenderDomain && kontext.dnsPruefen !== false) {
    neu(await mailDnsPruefen(absenderDomain));
  } else if (produktion) {
    neu({
      id: 'mail.dns',
      bereich: 'mail',
      titel: 'SPF, DKIM und DMARC',
      status: 'manuell',
      meldung: 'Für die Absender-Domain SPF-, DKIM- und DMARC-Einträge setzen (Werte vom Mailanbieter).',
      ort: 'DNS-Verwaltung der Domain (docs/deploy/VERCEL.md, Schritt E-Mail)',
      aufwand: '20 min',
    });
  }

  const zaehler: Record<Status, number> = { ok: 0, hinweis: 0, warnung: 0, fehler: 0, manuell: 0 };
  for (const p of pruefungen) zaehler[p.status]++;
  return { betriebsart, zeitpunkt: (kontext.jetzt ?? new Date()).toISOString(), pruefungen, zaehler, startklar: zaehler.fehler === 0 };
}

async function datenbankPruefen(db: Datenbank, neu: (p: Pruefung) => void, produktion: boolean, jetzt: Date) {
  try {
    await db.execute(sql`select 1`);
    neu({ id: 'datenbank.verbindung', bereich: 'datenbank', titel: 'Datenbank', status: 'ok', meldung: 'Die Datenbank antwortet.' });
  } catch {
    neu({
      id: 'datenbank.verbindung',
      bereich: 'datenbank',
      titel: 'Datenbank',
      status: 'fehler',
      meldung: 'Die Datenbank antwortet nicht. DATABASE_URL, Region und Freigaben prüfen.',
      ort: 'Vercel › Storage › Neon',
      aufwand: '15 min',
    });
    return;
  }

  const erwartet = journal.entries.length;
  let angewendet = 0;
  try {
    const ergebnis = await db.execute(sql`select count(*)::int as anzahl from drizzle.__drizzle_migrations`);
    angewendet = Number((ergebnis as unknown as { rows: { anzahl: number }[] }).rows?.[0]?.anzahl ?? 0);
  } catch {
    angewendet = 0;
  }
  neu({
    id: 'datenbank.migrationen',
    bereich: 'datenbank',
    titel: 'Migrationen',
    status: angewendet >= erwartet ? 'ok' : 'fehler',
    meldung:
      angewendet >= erwartet
        ? `Alle ${erwartet} Migrationen sind angewendet.`
        : `${angewendet} von ${erwartet} Migrationen angewendet. Ein neuer Bau auf Vercel migriert automatisch (ADR 0019).`,
    ort: 'Vercel › Deployments › Redeploy',
    aufwand: '5 min',
  });

  const allgemein = await einstellung(db, 'allgemein');
  const konzepthinweis = (allgemein as { konzepthinweis?: boolean } | null)?.konzepthinweis ?? true;
  neu({
    id: 'inhalte.konzepthinweis',
    bereich: 'inhalte',
    titel: 'Hinweis „Konzept-Website“',
    status: konzepthinweis ? (produktion ? 'fehler' : 'warnung') : 'ok',
    meldung: konzepthinweis
      ? 'Der Dialog „Alle angezeigten Daten sind fiktiv“ ist eingeschaltet und erscheint jedem Besucher. Solange er an ist, ist die Seite auf Vercel noindex (nicht in Suchmaschinen) und /llms.txt antwortet mit 404 (ADR 0049).'
      : 'Der Konzept-Hinweis ist ausgeschaltet.',
    ort: 'Einstellung „allgemein.konzepthinweis“ (MENSCHEN ML-03)',
    aufwand: '5 min',
  });

  const gebetszeiten = await einstellung(db, 'gebetszeiten');
  const bestaetigt = (gebetszeiten as { bestaetigt?: boolean } | null)?.bestaetigt ?? false;
  neu({
    id: 'inhalte.gebetszeiten',
    bereich: 'inhalte',
    titel: 'Gebetszeiten bestätigt',
    status: bestaetigt ? 'ok' : 'warnung',
    meldung: bestaetigt
      ? 'Die Gebetszeiten sind bestätigt.'
      : 'Die Gebetszeiten sind berechnet und noch nicht bestätigt (Hinweis „berechnet“ auf jeder Seite).',
    ort: 'Verwaltung › Gebetszeiten',
    aufwand: '15 min',
  });

  const beispiele = await beispielInhalte(db);
  neu({
    id: 'inhalte.beispiele',
    bereich: 'inhalte',
    titel: 'Beispielinhalte',
    status: beispiele === 0 ? 'ok' : produktion ? 'warnung' : 'hinweis',
    meldung:
      beispiele === 0
        ? 'Keine Beispielinhalte mehr veröffentlicht.'
        : `${beispiele} Beispielinhalte (Veranstaltungen, Nachrichten, Seiten) sind noch vorhanden.`,
    ort: 'Verwaltung › Veranstaltungen, Neuigkeiten, Seiteninhalte',
    aufwand: '1–3 h',
  });

  // Projekte (AUFTRAG 3.9, E0-K05): Meilensteine mit vergangenem Datum, die noch offen sind, und Platzhalter der Gemeinde
  // (Ort, Daten, Spendenzweck, Bankverbindung). Ohne gespeicherten Inhalt gelten die Standardwerte der Seite.
  const [projektZeile] = await db
    .select({ inhalt: schema.seiteninhalt.inhalt })
    .from(schema.seiteninhalt)
    .where(eq(schema.seiteninhalt.bereich, 'projekte'))
    .limit(1);
  const gelesen = projekteSchema.safeParse(projektZeile?.inhalt ?? {});
  const projekt = gelesen.success ? gelesen.data : projekteSchema.parse({});
  const offen = vergangeneOffene(projekt.meilensteine, jetzt);
  neu({
    id: 'inhalte.meilensteine',
    bereich: 'inhalte',
    titel: 'Meilenstein vergangen, aber offen',
    status: offen.length ? 'warnung' : 'ok',
    meldung: offen.length
      ? `${offen.length === 1 ? 'Ein Meilenstein ist' : `${offen.length} Meilensteine sind`} vorbei, aber nicht erledigt: ${offen
          .map((m) => `„${m.titel}“ (${m.datum})`)
          .join(', ')}. Erledigt setzen, Datum anpassen oder entfernen.`
      : 'Kein Meilenstein mit vergangenem Datum ist offen.',
    ort: 'Verwaltung › Seiteninhalte › Projekte',
    aufwand: '10 min',
  });
  const projektPlatzhalter = !projektZeile || hatPlatzhalter(projekt);
  neu({
    id: 'inhalte.projekt-platzhalter',
    bereich: 'inhalte',
    titel: 'Projekt-Platzhalter offen',
    status: projektPlatzhalter ? 'warnung' : 'ok',
    meldung: projektPlatzhalter
      ? 'Die Seite „Projekte“ enthält noch Platzhalter in eckigen Klammern (z. B. Ort, Eröffnungsdatum, Spendenzweck, Bankverbindung).'
      : 'Die Seite „Projekte“ ist ohne Platzhalter.',
    ort: 'Verwaltung › Seiteninhalte › Projekte (MENSCHEN MN-08, MN-13)',
    aufwand: '30 min',
  });

  for (const bereich of ['impressum', 'datenschutz'] as const) {
    const [zeile] = await db
      .select({ inhalt: schema.seiteninhalt.inhalt })
      .from(schema.seiteninhalt)
      .where(eq(schema.seiteninhalt.bereich, bereich))
      .limit(1);
    const platzhalter = !zeile || hatPlatzhalter(zeile.inhalt);
    neu({
      id: `recht.${bereich}`,
      bereich: 'recht',
      titel: bereich === 'impressum' ? 'Impressum' : 'Datenschutzerklärung',
      status: platzhalter ? (produktion ? 'fehler' : 'warnung') : 'ok',
      meldung: platzhalter ? 'Enthält noch Platzhalter in eckigen Klammern oder fehlt.' : 'Ohne Platzhalter.',
      ort: `Verwaltung › Seiteninhalte › ${bereich === 'impressum' ? 'Impressum' : 'Datenschutz'} (fachliche Prüfung: MENSCHEN.md)`,
      aufwand: '30 min',
    });
  }
}

async function einstellung(db: Datenbank, schluessel: string): Promise<unknown> {
  const [zeile] = await db
    .select({ wert: schema.einstellung.wert })
    .from(schema.einstellung)
    .where(eq(schema.einstellung.schluessel, schluessel))
    .limit(1);
  return zeile?.wert ?? null;
}

async function beispielInhalte(db: Datenbank): Promise<number> {
  const zaehle = async (tabelle: typeof schema.veranstaltung | typeof schema.nachricht | typeof schema.seiteninhalt) => {
    const [z] = await db.select({ anzahl: count() }).from(tabelle).where(eq(tabelle.istBeispiel, true));
    return Number(z?.anzahl ?? 0);
  };
  const [a, b, c] = await Promise.all([zaehle(schema.veranstaltung), zaehle(schema.nachricht), zaehle(schema.seiteninhalt)]);
  return a + b + c;
}

async function mailDnsPruefen(domain: string): Promise<Pruefung> {
  const txt = async (name: string) => {
    let wecker: ReturnType<typeof setTimeout> | undefined;
    try {
      const frist = new Promise<never>((_, nein) => {
        wecker = setTimeout(() => nein(new Error('Zeit')), 3000);
      });
      return (await Promise.race([resolveTxt(name), frist])).map((t) => t.join(''));
    } catch {
      return [];
    } finally {
      clearTimeout(wecker);
    }
  };
  const [spf, dmarc] = await Promise.all([txt(domain), txt(`_dmarc.${domain}`)]);
  const hatSpf = spf.some((t) => t.startsWith('v=spf1'));
  const hatDmarc = dmarc.some((t) => t.startsWith('v=DMARC1'));
  const fehlt = [!hatSpf && 'SPF', !hatDmarc && 'DMARC'].filter(Boolean).join(' und ');
  return {
    id: 'mail.dns',
    bereich: 'mail',
    titel: 'SPF, DKIM und DMARC',
    status: fehlt ? 'warnung' : 'ok',
    meldung: fehlt
      ? `Für ${domain} fehlt ${fehlt}. DKIM bitte beim Mailanbieter prüfen.`
      : `SPF und DMARC für ${domain} gefunden; DKIM beim Mailanbieter prüfen.`,
    ort: 'DNS-Verwaltung der Domain (docs/deploy/VERCEL.md, Schritt E-Mail)',
    aufwand: '20 min',
  };
}

function hostVon(adresse: string): string | null {
  try {
    return new URL(adresse).hostname;
  } catch {
    return null;
  }
}
