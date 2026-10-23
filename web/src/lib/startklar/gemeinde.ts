import { and, asc, count, desc, eq, inArray, isNull, lt, ne, sql } from 'drizzle-orm';
import type { Datenbank } from '@/lib/db';
import * as schema from '@/lib/db/schema';
import {
  entscheideWirksam,
  fehlendeVoraussetzungen,
  FUNKTIONEN,
  type Funktion,
  IN_PRODUKTION_AN,
  MIT_PERSONENDATEN,
  umgebungsSchalter,
} from '@/lib/funktionen-regeln';
import { pruefeKette } from '@/lib/chat/hashkette';
import { bewerteDL16 } from '@/lib/lernapp/schreiben/kinderschutz';
import { funktionenEinstellung } from '@/lib/validierung/einstellungen';
import type { Pruefung } from './pruefungen';

/**
 * Startklar-Prüfungen der Gemeinde-Plattform (PLAN 2.8/2.9, ABNAHME Z-12, Z-20): Funktionsschalter in der Produktion,
 * Push-Schlüssel, Kinderschutz (S-02 zwei Erwachsene, S-10 Hash-Kette), Takt und lokaler Helfer-Server (Sicherung,
 * Wiederherstellungsprobe, Medienspiegel), die Pflegepflicht der Koran-Übersetzungen (QuranEnc, 90 Tage) und der Stau
 * offener religiöser Freigaben (ADR 0030, länger als 14 Tage „zur Prüfung“).
 * Prüfungen dürfen erweitert, nie abgeschwächt werden.
 */
type Umgebung = Readonly<Record<string, string | undefined>>;
type LokalEintrag = { ok?: boolean; bytes?: number; zeit?: string };

const STUNDE = 60 * 60 * 1000;
const NAMEN: Record<Funktion, string> = {
  konten: 'Konten',
  lernplattform: 'Lernplattform',
  chat: 'Gruppenchat',
  echtzeit: 'Echtzeit',
  push: 'Web Push',
  push_gebet: 'Gebetserinnerung',
  hatim: 'Gemeinsame Hatim',
  newsletter: 'Newsletter',
  hadith_gesamt: 'Bukhari-Gesamtsammlung',
  ramadan_vorschau: 'Ramadan-Vorschau',
  lernapp: 'Lern-App',
  lernapp_ungeprueft: 'Lern-App: Einheiten vor der Muttersprachler-Stichprobe (mit Hinweis)',
  lernapp_sprechen: 'Lern-App: Sprechübungen im Browser',
  lernapp_meldungen: 'Lern-App: anonyme Fehlermeldungen',
  lernapp_sync: 'Lern-App: Abgleich mit dem Konto',
  lernapp_gruppen: 'Lern-App: Gruppen, Zuweisungen und Schreibkorrektur',
  lernapp_rangliste: 'Lern-App: Bestenliste in Gruppe oder Familie (ab 16)',
  lernapp_statistik: 'Lern-App: anonyme Nutzungsstatistik',
  push_lernapp: 'Lern-App: Erinnerung per Web Push',
};
const VORAUSSETZUNG: Partial<Record<Funktion, string>> = {
  konten: 'Datenschutz v2 (MN-11)',
  lernplattform: 'DSFA und Einwilligungstexte (MN-11)',
  chat: 'DSFA, Schutzkonzept und Ansprechpersonen (MN-10, MN-11)',
  echtzeit: 'lokaler Server mit Echtzeit-Profil (MN-12)',
  push: 'Push-Themen und Drittland-Hinweis (MN-11, MN-17)',
  push_gebet: 'Takt vom lokalen Server oder Vercel Pro (MN-18)',
  hatim: 'Datenschutz v2 (MN-11)',
  newsletter: 'Datenschutz v2 und Double-Opt-in-Text (MN-11)',
  hadith_gesamt: 'Rechtsfreigabe der Hadith-Quelle (MN-06)',
  lernapp_sync: 'DSFA-Nachtrag Lern-App und Einwilligungstext „lernapp“ (LM-08)',
  lernapp_gruppen: 'DSFA-Nachtrag Lern-App (LM-08) und Entscheidung D-L16 zum Kommentar der Lehrkraft an Kinder',
  lernapp_rangliste: 'Entscheidung zur Bestenliste ab 16 (LM-10) und DSFA-Nachtrag zu R-08 (LM-08)',
  lernapp_statistik: 'Entscheidung der Datenschutzbeauftragten (KERN 4.0 §6)',
  push_lernapp: 'wie Web Push: Push-Themen und Drittland-Hinweis (MN-11, MN-17), neutraler Text ohne Serienbezug',
};

/** Zustand eines gemeldeten Laufs: fehlt, fehlgeschlagen, zu alt oder in Ordnung. */
export function bewerteLauf(e: LokalEintrag | undefined, jetzt: Date, maxStunden: number): 'fehlt' | 'fehlgeschlagen' | 'alt' | 'ok' {
  if (!e?.zeit || Number.isNaN(Date.parse(e.zeit))) return 'fehlt';
  if (e.ok === false) return 'fehlgeschlagen';
  return jetzt.getTime() - Date.parse(e.zeit) > maxStunden * STUNDE ? 'alt' : 'ok';
}

function leseSchalter(einstellung: unknown) {
  const gelesen = funktionenEinstellung.safeParse(einstellung ?? {});
  return gelesen.success ? gelesen.data : null;
}

/** Schalter mit Personendaten (oder Rechtsvorbehalt), die eingeschaltet sind und wirken (Sperren beachtet). */
export function eingeschaltet(env: Umgebung, einstellung: unknown): Funktion[] {
  const werte = leseSchalter(einstellung);
  // Von Menschen für die Produktion freigegebene Funktionen (IN_PRODUKTION_AN) zählen nicht als offener Vorbehalt
  return [...MIT_PERSONENDATEN, 'hadith_gesamt' as const]
    .filter((f) => !IN_PRODUKTION_AN.includes(f))
    .filter((f) => entscheideWirksam(f, env, werte));
}

/**
 * Ausdrücklich (Umgebung oder Einstellung) eingeschaltete Schalter, die eine Sperre zurückhält (KERN 4.0 §6), mit den
 * fehlenden Voraussetzungen. Schalter, die nur ihr Standard einschaltet (z. B. `lernapp_ungeprueft` in der Produktion,
 * solange `lernapp` aus ist), sind kein Befund.
 */
export function gesperrteSchalter(env: Umgebung, einstellung: unknown): { schalter: Funktion; fehlt: Funktion[] }[] {
  const werte = leseSchalter(einstellung);
  const ausdruecklich = (f: Funktion) =>
    umgebungsSchalter(f, env) === true || (umgebungsSchalter(f, env) === undefined && werte?.[f] === true);
  return FUNKTIONEN.filter(ausdruecklich)
    .map((schalter) => ({ schalter, fehlt: fehlendeVoraussetzungen(schalter, env, werte) }))
    .filter((z) => z.fehlt.length);
}

function groesse(bytes: number | undefined): string {
  if (!bytes) return '';
  const mb = bytes / 1e6;
  return mb >= 1000 ? ` (${(mb / 1000).toFixed(1).replace('.', ',')} GB)` : ` (${Math.max(1, Math.round(mb))} MB)`;
}

function zeitText(iso: string | undefined): string {
  if (!iso) return '';
  return new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Berlin' }).format(new Date(iso));
}

async function einstellungWert(db: Datenbank, schluessel: string): Promise<unknown> {
  const [z] = await db
    .select({ wert: schema.einstellung.wert })
    .from(schema.einstellung)
    .where(eq(schema.einstellung.schluessel, schluessel))
    .limit(1);
  return z?.wert ?? null;
}

/** Ab so vielen Tagen „zur Prüfung“ gilt ein religiöser Inhalt als liegen geblieben (Cockpit-Warnung). */
export const FREIGABE_STAU_TAGE = 14;

export type FreigabeLage = { offen: number; alt: number; ohneDatum: number; aeltesteSeit: Date | null };

/**
 * Religiöse Freigaben (ADR 0030): Was steht „zur Prüfung“, und seit wann? Maßgeblich ist der Stand in der Tabelle des
 * Inhalts (wie die Warteschlange unter Verwaltung › Freigaben) und bei freien Seiten der letzte Verlaufseintrag. Das
 * Datum der Einreichung kommt aus dem Freigabe-Verlauf (`freigabe`), sonst aus `aktualisiertAm`; Einträge ohne beides
 * (z. B. berechnete besondere Tage) zählen als offen, aber nie als liegen geblieben.
 */
export async function religioeseFreigabeLage(db: Datenbank, jetzt: Date): Promise<FreigabeLage> {
  const offen = 'zur_pruefung' as const;
  const f = schema.freigabe;
  const letzte = await db
    .selectDistinctOn([f.inhaltTyp, f.inhaltId], { typ: f.inhaltTyp, id: f.inhaltId, art: f.art, status: f.status, am: f.am })
    .from(f)
    .orderBy(f.inhaltTyp, f.inhaltId, desc(f.am), desc(f.id));
  const eingereicht = new Map<string, Date>(
    letzte.filter((z) => z.art === 'religioes' && z.status === offen).map((z) => [`${z.typ}|${z.id}`, z.am]),
  );
  const wb = schema.quranWortbedeutung;
  const wbo = schema.quranWortbedeutungOrt;
  const tr = schema.tajwidRegel;
  const hu = schema.hadithUebersetzung;
  const el = schema.elifbeLektion;
  const bt = schema.besondererTag;
  const af = schema.anzeigeFolie;
  const wt = schema.wissenThema;
  const seitenIds = [...eingereicht.keys()].filter((k) => k.startsWith('seite|')).map((k) => k.slice('seite|'.length));
  const [bedeutungen, orte, regeln, hadithe, lektionen, tage, folien, themen, seiten] = await Promise.all([
    db.select({ id: wb.id, geaendert: wb.aktualisiertAm }).from(wb).where(eq(wb.freigabe, offen)),
    db.select({ sure: wbo.sure, vers: wbo.vers, pos: wbo.pos, sprache: wbo.sprache }).from(wbo).where(eq(wbo.freigabe, offen)),
    db.select({ id: tr.schluessel }).from(tr).where(eq(tr.freigabe, offen)),
    db.select({ sammlung: hu.sammlungId, nummer: hu.nummer, sprache: hu.sprache }).from(hu).where(eq(hu.freigabe, offen)),
    db.select({ id: el.id }).from(el).where(eq(el.freigabe, offen)),
    db.select({ id: bt.id }).from(bt).where(eq(bt.freigabe, offen)),
    db.select({ id: af.id, geaendert: af.aktualisiertAm }).from(af).where(eq(af.freigabe, offen)),
    db
      .select({ id: wt.id, geaendert: wt.aktualisiertAm })
      .from(wt)
      .where(and(eq(wt.freigabe, offen), isNull(wt.imPapierkorbSeit))),
    seitenIds.length
      ? db
          .select({ id: schema.seite.id })
          .from(schema.seite)
          .where(and(inArray(schema.seite.id, seitenIds), isNull(schema.seite.imPapierkorbSeit)))
      : Promise.resolve([] as { id: string }[]),
  ]);
  const eintraege: { schluessel: string; geaendert?: Date }[] = [
    ...bedeutungen.map((z) => ({ schluessel: `quran_wortbedeutung|${z.id}`, geaendert: z.geaendert })),
    ...orte.map((z) => ({ schluessel: `quran_wortbedeutung_ort|${z.sure}|${z.vers}|${z.pos}|${z.sprache}` })),
    ...regeln.map((z) => ({ schluessel: `tajwid_regel|${z.id}` })),
    ...hadithe.map((z) => ({ schluessel: `hadith_uebersetzung|${z.sammlung}|${z.nummer}|${z.sprache}` })),
    ...lektionen.map((z) => ({ schluessel: `elifbe_lektion|${z.id}` })),
    ...tage.map((z) => ({ schluessel: `besonderer_tag|${z.id}` })),
    ...folien.map((z) => ({ schluessel: `anzeige_folie|${z.id}`, geaendert: z.geaendert })),
    ...themen.map((z) => ({ schluessel: `wissen_thema|${z.id}`, geaendert: z.geaendert })),
    ...seiten.map((z) => ({ schluessel: `seite|${z.id}` })),
  ];
  const grenze = jetzt.getTime() - FREIGABE_STAU_TAGE * 24 * STUNDE;
  let alt = 0;
  let ohneDatum = 0;
  let aeltesteSeit: Date | null = null;
  for (const e of eintraege) {
    const seit = eingereicht.get(e.schluessel) ?? e.geaendert ?? null;
    if (!seit) {
      ohneDatum++;
      continue;
    }
    if (seit.getTime() < grenze) alt++;
    if (!aeltesteSeit || seit < aeltesteSeit) aeltesteSeit = seit;
  }
  return { offen: eintraege.length, alt, ohneDatum, aeltesteSeit };
}

export async function gemeindePruefen(
  db: Datenbank,
  env: Umgebung,
  produktion: boolean,
  jetzt: Date,
  neu: (p: Pruefung) => void,
): Promise<void> {
  const schalterWert = await einstellungWert(db, 'funktionen');
  const an = eingeschaltet(env, schalterWert);
  const ist = (f: Funktion) => an.includes(f);

  // Schalter: in der Produktion nur nach Freigabe durch Menschen
  neu(
    an.length === 0
      ? {
          id: 'gemeinde.schalter',
          bereich: 'gemeinde',
          titel: 'Funktionsschalter',
          status: 'ok',
          meldung:
            'Alle Funktionen mit Personendaten sind aus (Konten, Lernplattform, Chat, Push, Hatim, Newsletter, Abgleich und Gruppen der Lern-App).',
        }
      : {
          id: 'gemeinde.schalter',
          bereich: 'gemeinde',
          titel: 'Funktionsschalter',
          status: produktion ? 'manuell' : 'hinweis',
          meldung: produktion
            ? `Eingeschaltet: ${an.map((f) => `${NAMEN[f]} (Voraussetzung: ${VORAUSSETZUNG[f] ?? '–'})`).join('; ')}. Voraussetzungen bestätigen.`
            : `Für die Vorführung eingeschaltet: ${an.map((f) => NAMEN[f]).join(', ')}. In der Produktion sind sie aus, bis Menschen freigeben.`,
          ort: 'Umgebung FUNKTION_<NAME>=an|aus (docs/deploy/VERCEL-ENV.md) oder Einstellung „funktionen“; MENSCHEN.md',
          aufwand: '5 min je Schalter',
        },
  );

  // Sperren der Lern-App-Schalter (KERN 4.0 §6): an, aber ohne wirksame Voraussetzung – der Schalter bleibt wirkungslos
  const gesperrt = gesperrteSchalter(env, schalterWert);
  if (gesperrt.length)
    neu({
      id: 'gemeinde.schalter-sperren',
      bereich: 'gemeinde',
      titel: 'Gesperrte Schalter',
      status: produktion ? 'warnung' : 'hinweis',
      meldung: `Eingeschaltet, aber gesperrt: ${gesperrt
        .map((z) => `${NAMEN[z.schalter]} (braucht ${z.fehlt.map((f) => NAMEN[f]).join(', ')})`)
        .join('; ')}. Erst die Voraussetzung einschalten oder den Schalter ausschalten.`,
      ort: 'Umgebung FUNKTION_<NAME>=an|aus (docs/deploy/VERCEL-ENV.md) oder Einstellung „funktionen“',
      aufwand: '5 min je Schalter',
    });

  // Push (auch die Lern-Erinnerung `push_lernapp`): ohne VAPID-Schlüssel kein Versand
  if (ist('push') || ist('push_lernapp')) {
    const vapid = Boolean(env.VAPID_PRIVAT?.trim());
    neu({
      id: 'gemeinde.push-schluessel',
      bereich: 'gemeinde',
      titel: 'Push-Schlüssel (VAPID)',
      status: vapid ? 'ok' : produktion ? 'fehler' : 'warnung',
      meldung: vapid
        ? 'Der VAPID-Schlüssel ist gesetzt.'
        : 'Push ist eingeschaltet, aber VAPID_PRIVAT fehlt – Abos und Versand schlagen fehl.',
      ort: 'pnpm geheimnisse:erzeugen; Vercel › Environment Variables (VAPID_PRIVAT, VAPID_KONTAKT)',
      aufwand: '10 min',
    });
  }

  // S-02: Gruppen mit Chat brauchen mindestens zwei Erwachsene in der Leitung
  if (ist('chat')) {
    const leitung = db
      .select({ gruppeId: schema.gruppenLeitung.gruppeId, anzahl: count().as('anzahl') })
      .from(schema.gruppenLeitung)
      .groupBy(schema.gruppenLeitung.gruppeId)
      .as('leitung');
    const zuWenig = await db
      .select({ id: schema.gruppe.id })
      .from(schema.gruppe)
      .leftJoin(leitung, eq(leitung.gruppeId, schema.gruppe.id))
      .where(and(ne(schema.gruppe.chatModus, 'aus'), eq(schema.gruppe.status, 'aktiv'), sql`coalesce(${leitung.anzahl}, 0) < 2`));
    neu({
      id: 'gemeinde.chat-leitung',
      bereich: 'gemeinde',
      titel: 'Chat nur mit zwei Erwachsenen',
      status: zuWenig.length ? 'warnung' : 'ok',
      meldung: zuWenig.length
        ? `${zuWenig.length === 1 ? 'Eine Gruppe hat' : `${zuWenig.length} Gruppen haben`} Chat eingeschaltet, aber weniger als zwei Erwachsene in der Leitung – der Chat bleibt dort gesperrt (S-02).`
        : 'Jede Gruppe mit Chat hat mindestens zwei Erwachsene in der Leitung.',
      ort: 'Verwaltung › Gruppen',
      aufwand: '10 min',
    });
  }

  // S-L2 M-1 / D-L16: Kommentar der Lehrkraft zur Schreibabgabe eines Kindes – harte Sperre, bis Menschen entschieden haben
  // und die Schutzmaßnahmen umgesetzt sind (`lernapp/schreiben/kinderschutz.ts`); bis dahin gibt die Lehrkraft Kindern nur
  // Prüfliste und Einstufung zurück. Rot in der Betriebsart Produktion, Warnung in Vorschau und Entwicklung.
  if (ist('lernapp_gruppen')) {
    const d = bewerteDL16(produktion);
    neu({
      id: 'gemeinde.lernapp-kommentar-kinder',
      bereich: 'gemeinde',
      titel: 'Lern-App: Kommentar an Kinder (D-L16)',
      status: d.status,
      meldung: d.meldung,
      ort: 'web/docs/recht/entwuerfe/dsfa-lernapp.md (D-L16); Einträge ENTSCHEIDUNG_D_L16 und UMGESETZTE_SCHUTZMASSNAHMEN in web/src/lib/lernapp/schreiben/kinderschutz.ts; MENSCHEN LM-08',
      aufwand: '1 h (Entscheidung), Umsetzung je nach Beschluss',
    });
  }

  // S-10: Moderationsprotokoll unverändert (Hash-Kette; nach dem Löschlauf beginnt sie beim gespeicherten Anker)
  const zeilen = await db.select().from(schema.moderationsprotokoll).orderBy(asc(schema.moderationsprotokoll.id));
  const anker = (await einstellungWert(db, 'moderationsprotokoll_anker')) as { hash?: string } | null;
  const bruch = pruefeKette(
    zeilen.map((z) => ({ ...z, zeitpunkt: z.zeitpunkt.toISOString() })),
    typeof anker?.hash === 'string' ? anker.hash : undefined,
  );
  neu({
    id: 'gemeinde.kette',
    bereich: 'gemeinde',
    titel: 'Moderationsprotokoll unverändert',
    status: bruch === null ? 'ok' : 'fehler',
    meldung:
      bruch === null
        ? `Die Hash-Kette ist vollständig (${zeilen.length} Einträge).`
        : `Die Hash-Kette bricht bei Eintrag ${bruch + 1} von ${zeilen.length}: Das Protokoll wurde verändert. Sofort die Kinderschutz-Verantwortlichen informieren.`,
    ort: 'Datenbank › moderationsprotokoll (Schutzkonzept, MENSCHEN MN-10)',
    aufwand: '1 h',
  });

  // D-05: offene Chat-Meldungen vor der Höchstfrist (12 Monate) – Erinnerung ab 11 Monaten
  const [{ alteMeldungen }] = await db
    .select({ alteMeldungen: count() })
    .from(schema.chatMeldung)
    .where(
      and(ne(schema.chatMeldung.status, 'erledigt'), lt(schema.chatMeldung.erstelltAm, new Date(jetzt.getTime() - 334 * 24 * STUNDE))),
    );
  if (alteMeldungen > 0 || ist('chat'))
    neu({
      id: 'gemeinde.meldungen',
      bereich: 'gemeinde',
      titel: 'Offene Chat-Meldungen',
      status: alteMeldungen > 0 ? 'warnung' : 'ok',
      meldung:
        alteMeldungen > 0
          ? `${alteMeldungen === 1 ? 'Eine Meldung ist' : `${alteMeldungen} Meldungen sind`} seit mehr als 11 Monaten offen. Nach 12 Monaten löscht der Löschlauf sie (Höchstfrist).`
          : 'Keine Meldung ist länger als 11 Monate offen.',
      ort: 'Verwaltung › Meldungen & Kinderschutz',
      aufwand: '30 min',
    });

  // Lokaler Helfer-Server (ADR 0036): Takt, Sicherung, Probe, Spiegel
  const lokal = ((await einstellungWert(db, 'lokaler_server')) ?? {}) as Record<string, LokalEintrag | undefined>;
  const fehltStatus = produktion ? 'warnung' : 'hinweis';
  const laeufe: { art: string; titel: string; stunden: number; noetig: boolean; ok: string; fehlt: string }[] = [
    {
      art: 'takt',
      titel: 'Minutentakt',
      stunden: 0.25,
      noetig: ist('push') && ist('push_gebet'),
      ok: 'Der Takt läuft',
      fehlt: 'Gebetserinnerungen sind an, aber der Minutentakt meldet sich nicht',
    },
    { art: 'sicherung', titel: 'Tägliche Sicherung', stunden: 36, noetig: true, ok: 'Letzte Sicherung', fehlt: 'Keine aktuelle Sicherung' },
    {
      art: 'probe',
      titel: 'Wiederherstellungsprobe',
      stunden: 40 * 24,
      noetig: true,
      ok: 'Letzte Probe',
      fehlt: 'Keine Wiederherstellungsprobe in den letzten 40 Tagen',
    },
    { art: 'spiegel', titel: 'Medienspiegel', stunden: 36, noetig: true, ok: 'Letzter Abgleich', fehlt: 'Kein aktueller Medienspiegel' },
  ];
  for (const l of laeufe) {
    const e = lokal[l.art];
    const zustand = bewerteLauf(e, jetzt, l.stunden);
    if (!l.noetig && zustand !== 'ok') continue;
    neu({
      id: `gemeinde.${l.art}`,
      bereich: 'gemeinde',
      titel: l.titel,
      status: zustand === 'ok' ? 'ok' : zustand === 'fehlgeschlagen' ? (produktion ? 'fehler' : 'warnung') : fehltStatus,
      meldung:
        zustand === 'ok'
          ? `${l.ok}: ${zeitText(e?.zeit)}${groesse(e?.bytes)}.`
          : zustand === 'fehlgeschlagen'
            ? `Der letzte Lauf am ${zeitText(e?.zeit)} ist fehlgeschlagen. Protokoll auf dem lokalen Server ansehen.`
            : zustand === 'alt'
              ? `${l.fehlt} (letzte Meldung ${zeitText(e?.zeit)}).`
              : `${l.fehlt}: Der lokale Server hat sich noch nie gemeldet.`,
      ort: 'Lokaler Server: betrieb/lokal/LIESMICH.md (MENSCHEN MN-12, MN-18)',
      aufwand: zustand === 'fehlt' ? '3–4 h (Einrichtung)' : '15 min',
    });
  }

  // ADR 0030: Stau offener religiöser Freigaben – ohne Imam/Hoca (MN-20, MN-24) bleibt öffentlich nur der Platzhalter
  const freigaben = await religioeseFreigabeLage(db, jetzt);
  neu({
    id: 'gemeinde.freigaben',
    bereich: 'gemeinde',
    titel: 'Religiöse Freigaben',
    status: freigaben.alt > 0 ? 'warnung' : 'ok',
    meldung:
      freigaben.alt > 0
        ? `${freigaben.alt === 1 ? 'Ein religiöser Inhalt wartet' : `${freigaben.alt} religiöse Inhalte warten`} seit mehr als ${FREIGABE_STAU_TAGE} Tagen auf die Prüfung (ältester seit ${zeitText(freigaben.aeltesteSeit?.toISOString())}; insgesamt ${freigaben.offen} offen). Öffentlich bleibt bis dahin der Platzhalter.`
        : freigaben.offen > 0
          ? `${freigaben.offen === 1 ? 'Ein religiöser Inhalt wartet' : `${freigaben.offen} religiöse Inhalte warten`} auf die Prüfung, keiner länger als ${FREIGABE_STAU_TAGE} Tage.`
          : 'Kein religiöser Inhalt wartet auf die Prüfung.',
    ort: 'Verwaltung › Freigaben (Rolle „religiöse Prüfung“, MENSCHEN MN-20, MN-24)',
    aufwand: '30 min',
  });

  // QuranEnc-Bedingung: Übersetzungen regelmäßig auf neue Versionen prüfen (90 Tage)
  const grenze = new Date(jetzt.getTime() - 90 * 24 * STUNDE);
  const alt = await db
    .select({ titel: schema.quranAusgabe.titel })
    .from(schema.quranAusgabe)
    .where(and(eq(schema.quranAusgabe.aktiv, true), lt(schema.quranAusgabe.abgerufenAm, grenze)));
  neu({
    id: 'gemeinde.uebersetzungen',
    bereich: 'gemeinde',
    titel: 'Koran-Übersetzungen aktuell',
    status: alt.length ? 'hinweis' : 'ok',
    meldung: alt.length
      ? `Vor mehr als 90 Tagen abgerufen: ${alt.map((a) => a.titel).join(', ')}. Auf neue Versionen prüfen (Bedingung von QuranEnc).`
      : 'Alle aktiven Übersetzungen wurden in den letzten 90 Tagen abgerufen oder geprüft.',
    ort: 'pnpm inhalte:import; web/daten/quranenc/QUELLE.md',
    aufwand: '20 min',
  });
}
