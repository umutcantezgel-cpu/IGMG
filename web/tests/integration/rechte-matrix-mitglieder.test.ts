import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { PgTable } from 'drizzle-orm/pg-core';
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';
import { schema } from '@/lib/db';
import type { Funktion } from '@/lib/funktionen-regeln';
import type { GemeindeRolle } from '@/lib/rechte/gemeinde';
import type { RollenZuweisung } from '@/lib/rechte/matrix';
import { angemeldetAls, verwaltungsUmgebung } from './hilfen/verwaltung';
import { ausgang, type Ausgang, formular, momentaufnahme } from './verwaltung/rechte-hilfen';

/**
 * Generierte Rechte-Matrix der Server Actions des Mitgliederbereichs (Z-13, Endprüfung Stufe C: „die Actions des
 * Mitgliederbereichs sind nur handgeschrieben getestet“). Gegenstück zu `verwaltung/rechte-matrix.test.ts` und
 * `verwaltung/rechte-matrix-gemeinde.test.ts` (Verwaltung, `verlangeRecht`): 8 Action-Dateien × 9 Personengruppen ×
 * jede exportierte Action, dazu je Action jeder Funktionsschalter, der sie abschaltet (ADR 0035).
 *
 * Soll je Action (ADR 0026, nicht aus dem Code abgeleitet): welche Personengruppe die Konto-Prüfung bestehen muss –
 * angemeldet, zweiter Faktor wo Pflicht (Lehrkräfte, Verwaltungsrollen), ggf. die Kontoart (Eltern, Schüler, Lehrkraft)
 * bzw. überhaupt eine Rolle („Mein Bereich“). Ein Spion auf `verlangeKontoRecht` hält fest, ob und mit welcher Kontoart
 * die Prüfung lief:
 * - nicht zugelassen: Abweisung (KEIN_RECHT, Rückgabe `{ ok: false }` bzw. „kanalAus“ oder Umleitung zur Anmeldung) und
 *   der Datenbestand bleibt unverändert;
 * - zugelassen: Die Konto-Prüfung ist bestanden (Spion) bzw. die Action endet ohne Abweisung an der leeren oder
 *   minimalen Eingabe. Danach folgen Prüfungen am Objekt (Gruppe, Kind, Kanal) – die prüfen die Gruppen-Wahrheitstafel
 *   (`gruppen-wahrheitstafel.test.ts`) und die Modultests (`mein-bereich-lernen`, `chat`, `sicherheit-s2-*`).
 * Die Vollständigkeitsprüfung verlangt, dass jede exportierte Action hier steht und dass jede Datei unter
 * `src/server/actions` genau einer Matrix (oder den öffentlichen Formularen) zugeordnet ist.
 */
const protokoll: { rollen: readonly GemeindeRolle[] | null; ok: boolean }[] = [];
vi.mock('@/lib/rechte/gemeinde', async (original) => {
  const echt = await original<typeof import('@/lib/rechte/gemeinde')>();
  return {
    ...echt,
    verlangeKontoRecht: async (rollen?: readonly GemeindeRolle[]) => {
      try {
        const k = await echt.verlangeKontoRecht(rollen);
        protokoll.push({ rollen: rollen ?? null, ok: true });
        return k;
      } catch (e) {
        protokoll.push({ rollen: rollen ?? null, ok: false });
        throw e;
      }
    },
  };
});

const { client, db } = await verwaltungsUmgebung();
const { auth } = await import('@/lib/auth/server');
// Better Auth ist in dieser Umgebung bis auf die Sitzung ersetzt; Abmelden muss dennoch antworten
(auth.api as unknown as Record<string, unknown>).signOut = async () => ({ success: true });
afterAll(() => client.close());
afterEach(() => {
  for (const f of ['KONTEN', 'LERNPLATTFORM', 'CHAT', 'PUSH']) delete process.env[`FUNKTION_${f}`];
});

/** Personengruppe aus Sicht des Mitgliederbereichs. Testdaten fiktiv (G-04). */
type Person = {
  name: string;
  sitzung: boolean;
  gemeinde: GemeindeRolle[];
  verwaltung: RollenZuweisung[];
  zweiFaktor: boolean;
  kind: boolean;
};
const person = (name: string, p: Partial<Person> = {}): Person => ({
  name,
  sitzung: true,
  gemeinde: [],
  verwaltung: [],
  zweiFaktor: false,
  kind: false,
  ...p,
});
const PERSONEN: Person[] = [
  person('ohne Sitzung', { sitzung: false }),
  person('Konto ohne Kontoart (unbestätigt)'),
  person('Gemeinde', { gemeinde: ['gemeinde'] }),
  person('Eltern', { gemeinde: ['gemeinde', 'eltern'] }),
  person('Schüler (Kinderkonto)', { gemeinde: ['schueler'], kind: true }),
  person('Lehrkraft', { gemeinde: ['lehrkraft'], zweiFaktor: true }),
  person('Lehrkraft ohne zweiten Faktor', { gemeinde: ['lehrkraft'] }),
  person('Verwaltung (Administration)', { verwaltung: [{ rolle: 'administration' }], zweiFaktor: true }),
  person('Verwaltung ohne zweiten Faktor', { verwaltung: [{ rolle: 'administration' }] }),
];

// Soll nach ADR 0026 (Konto-Seite): Pflicht zum zweiten Faktor für Lehrkräfte und Verwaltungsrollen
const faktorOk = (p: Person) => p.zweiFaktor || (p.verwaltung.length === 0 && !p.gemeinde.includes('lehrkraft'));
const kontoRecht = (p: Person, arten?: GemeindeRolle[]) =>
  p.sitzung && faktorOk(p) && (!arten || arten.some((a) => p.gemeinde.includes(a)));
const mitRolle = (p: Person) => p.gemeinde.length > 0 || p.verwaltung.length > 0;

type Soll = (p: Person) => boolean;
const SOLL = {
  /** Mein Bereich: Konto mit Rolle und (wo Pflicht) Faktor */
  meinBereich: (p) => kontoRecht(p) && mitRolle(p),
  /** Mail-Zusammenfassung (F-38): wie Mein Bereich, aber nie Kinderkonten (keine zustellbare Adresse) */
  ohneKind: (p) => kontoRecht(p) && mitRolle(p) && !p.kind,
  /** Einrichtung des zweiten Faktors: angemeldet mit Rolle, kein Kinderkonto – der Faktor darf noch fehlen */
  einrichtung: (p) => p.sitzung && mitRolle(p) && !p.kind,
  /** Passkey anlegen: wie Mein Bereich, aber nie für Kinderkonten und Verwaltungskonten (SP-P3 H1) */
  passkey: (p) => kontoRecht(p) && mitRolle(p) && !p.kind && p.verwaltung.length === 0,
  eltern: (p) => kontoRecht(p, ['eltern']),
  schueler: (p) => kontoRecht(p, ['schueler']),
  lehrkraft: (p) => kontoRecht(p, ['lehrkraft']),
  /** Gruppenchat und Unterricht: jedes Konto mit Faktor; das Gruppenrecht prüft danach der Dienst */
  konto: (p) => kontoRecht(p),
  /** Anmeldung, Registrierung, Passwort: öffentlich (nur der Schalter `konten`) */
  oeffentlich: () => true,
  angemeldet: (p) => p.sitzung,
} satisfies Record<string, Soll>;

const MODULE = {
  benachrichtigungen: () => import('@/server/actions/benachrichtigungen'),
  chat: () => import('@/server/actions/chat'),
  kinder: () => import('@/server/actions/kinder'),
  konto: () => import('@/server/actions/konto'),
  lehrkraft: () => import('@/server/actions/lehrkraft'),
  'mein-bereich': () => import('@/server/actions/mein-bereich'),
  schueler: () => import('@/server/actions/schueler'),
  unterricht: () => import('@/server/actions/unterricht'),
} as const;
type Datei = keyof typeof MODULE;

type Fall = {
  datei: Datei;
  aktion: string;
  soll: Soll;
  /** Schalter, von denen jeder allein die Action abschaltet (ADR 0035). */
  schalter: Funktion[];
  /** Kontoart der Konto-Prüfung (`verlangeKontoRecht(...)`), wenn der Spion sie belegen soll; null = ohne Kontoart. */
  spion?: readonly GemeindeRolle[] | null;
  aufruf?: (f: (...a: unknown[]) => Promise<unknown>) => Promise<unknown>;
};
const f = (datei: Datei, aktionen: string[], soll: Soll, schalter: Funktion[], extra: Partial<Fall> = {}): Fall[] =>
  aktionen.map((aktion) => ({ datei, aktion, soll, schalter, ...extra }));

const UUID = '00000000-0000-4000-8000-000000000001';
const GRUND = 'Testbegründung';

const FAELLE: Fall[] = [
  // Mein Bereich › Konto (mein-bereich.ts): konto() = Schalter, verlangeKontoRecht(), Rolle vorhanden
  ...f('mein-bereich', ['profilSpeichern', 'kontoPasswortAendern', 'kontoZweiFaktorAbschalten', 'loeschAntragStellen'], SOLL.meinBereich, [
    'konten',
  ]),
  ...f('mein-bereich', ['passkeyEntfernen', 'sitzungBeenden', 'andereSitzungenBeenden'], SOLL.meinBereich, ['konten']),
  ...f('mein-bereich', ['datenExportieren'], SOLL.meinBereich, ['konten'], { aufruf: (fn) => fn() }),
  ...f('mein-bereich', ['kontoZweiFaktorStarten', 'kontoZweiFaktorBestaetigen'], SOLL.einrichtung, ['konten']),
  ...f('mein-bereich', ['passkeyRegistrierOptionen'], SOLL.passkey, ['konten'], { aufruf: (fn) => fn() }),
  ...f('mein-bereich', ['passkeyRegistrieren'], SOLL.passkey, ['konten'], { aufruf: (fn) => fn('', '') }),
  // Benachrichtigungen (benachrichtigungen.ts, F-38): Schalter konten + push, verlangeKontoRecht(), nie Kinderkonten
  ...f('benachrichtigungen', ['speichereZusammenfassung'], SOLL.ohneKind, ['konten', 'push']),
  // Eltern (kinder.ts): Schalter konten + lernplattform, verlangeKontoRecht(['eltern']); danach Bezug zum Kind
  ...f('kinder', ['einwilligungAendern'], SOLL.eltern, ['konten', 'lernplattform'], { spion: ['eltern'] }),
  ...f('kinder', ['kinderzugangAnlegen', 'kinderPasswortSetzen'], SOLL.eltern, ['konten', 'lernplattform'], {
    spion: ['eltern'],
    aufruf: (fn) => fn({}, formular({ lernendeId: UUID, benutzername: 'test.kind', passwort: 'Testpasswort-Eins-2026' })),
  }),
  // Schüler (schueler.ts): verlangeKontoRecht(['schueler']); danach der eigene Lerndatensatz
  ...f('schueler', ['eigeneEinwilligungAendern'], SOLL.schueler, ['konten', 'lernplattform'], {
    spion: ['schueler'],
    aufruf: (fn) => fn(formular({ art: 'gruppenchat', aktion: 'erteilen' })),
  }),
  // Lehrkraft (lehrkraft.ts): verlangeKontoRecht(['lehrkraft']); danach Gruppenrecht (Leitung, chat.moderieren)
  ...f('lehrkraft', ['terminAusfallSetzen'], SOLL.lehrkraft, ['konten', 'lernplattform'], {
    spion: ['lehrkraft'],
    aufruf: (fn) => fn(formular({ terminId: UUID, ausgefallen: '1' })),
  }),
  ...f('lehrkraft', ['moderiereMeldung', 'kanalPauseSetzen'], SOLL.lehrkraft, ['konten', 'lernplattform', 'chat'], {
    spion: ['lehrkraft'],
    aufruf: (fn) => fn(formular({ gruppeId: UUID, meldungId: UUID, kanalId: UUID, pause: '1', grund: GRUND, massnahme: 'keine' })),
  }),
  // Unterricht (unterricht.ts): Eingabe zuerst, dann verlangeKontoRecht(); das Gruppenrecht prüft der Dienst
  ...f('unterricht', ['speichereAnwesenheit'], SOLL.konto, ['konten', 'lernplattform'], {
    spion: null,
    aufruf: (fn) => fn({ terminId: UUID, eintraege: [{ lernendeId: UUID, status: 'anwesend' }] }),
  }),
  ...f('unterricht', ['setzeTerminAusfall'], SOLL.konto, ['konten', 'lernplattform'], { spion: null, aufruf: (fn) => fn(UUID, true) }),
  ...f('unterricht', ['speichereFortschritt'], SOLL.konto, ['konten', 'lernplattform'], {
    spion: null,
    aufruf: (fn) => fn({ gruppeId: UUID, lernendeId: UUID, stufeId: UUID, status: 'begonnen' }),
  }),
  ...f('unterricht', ['speichereHifz'], SOLL.konto, ['konten', 'lernplattform'], {
    spion: null,
    aufruf: (fn) => fn({ gruppeId: UUID, lernendeId: UUID, sure: 1, vonVers: 1, bisVers: 7, bewertung: null }),
  }),
  ...f('unterricht', ['meldeKindFehlend'], SOLL.konto, ['konten', 'lernplattform'], {
    spion: null,
    aufruf: (fn) => fn({ lernendeId: UUID, datum: '2026-10-16', grund: 'krank' }),
  }),
  // Gruppenchat (chat.ts): Schalter chat + konten, verlangeKontoRecht(); das Kanal- und Gruppenrecht prüft der Dienst
  ...f('chat', ['sendeChatNachricht'], SOLL.konto, ['konten', 'chat'], { spion: null, aufruf: (fn) => fn(UUID, 'Hallo') }),
  ...f('chat', ['bestaetigeChatRegeln'], SOLL.konto, ['konten', 'chat'], { spion: null, aufruf: (fn) => fn() }),
  ...f('chat', ['meldeChatNachricht'], SOLL.konto, ['konten', 'chat'], {
    spion: null,
    aufruf: (fn) => fn({ nachrichtId: 1, grund: 'spam', freitext: null }),
  }),
  ...f('chat', ['entferneChatNachricht'], SOLL.konto, ['konten', 'chat'], { spion: null, aufruf: (fn) => fn(1, GRUND) }),
  ...f('chat', ['schalteStumm'], SOLL.konto, ['konten', 'chat'], { spion: null, aufruf: (fn) => fn(UUID, UUID, 30, GRUND) }),
  ...f('chat', ['pausiereKanal'], SOLL.konto, ['konten', 'chat'], { spion: null, aufruf: (fn) => fn(UUID, true, GRUND) }),
  // Konto-Einstieg (konto.ts): öffentlich hinter dem Schalter `konten`; Übernehmen einer Einladung nur angemeldet
  ...f(
    'konto',
    [
      'kontoAnmelden',
      'kinderAnmelden',
      'kontoZweiFaktorPruefen',
      'registrieren',
      'kontoBestaetigen',
      'gemeindeEinladungAnnehmen',
      'kontoPasswortVergessen',
      'kontoPasswortNeu',
    ],
    SOLL.oeffentlich,
    ['konten'],
  ),
  ...f('konto', ['passkeyAnmeldeOptionen'], SOLL.oeffentlich, ['konten'], { aufruf: (fn) => fn() }),
  ...f('konto', ['passkeyAnmelden'], SOLL.oeffentlich, ['konten'], { aufruf: (fn) => fn('', 'de') }),
  ...f('konto', ['gemeindeEinladungUebernehmen'], SOLL.angemeldet, ['konten']),
  // Abmelden geht immer – auch mit ausgeschalteten Konten (N-7 der Sicherheitsprüfung S1)
  ...f('konto', ['kontoAbmelden'], SOLL.oeffentlich, []),
];

/** Tabellen, die eine Abweisung nicht verändern darf. */
const TABELLEN: PgTable[] = [
  schema.user,
  schema.session,
  schema.account,
  schema.passkey,
  schema.twoFactor,
  schema.verification,
  schema.kontoProfil,
  schema.gemeindeRolle,
  schema.kontoEinwilligung,
  schema.rolleZuweisung,
  schema.auditEintrag,
  schema.mailAusgang,
  schema.ratenbegrenzung,
  schema.ticket,
  schema.lernende,
  schema.elternKind,
  schema.gruppe,
  schema.gruppenLeitung,
  schema.gruppenMitglied,
  schema.unterrichtstermin,
  schema.anwesenheit,
  schema.fehlmeldung,
  schema.lernfortschritt,
  schema.hifzEintrag,
  schema.chatKanal,
  schema.chatNachricht,
  schema.chatRegelnBestaetigt,
  schema.chatStumm,
  schema.chatMeldung,
  schema.moderationsprotokoll,
  schema.pushAbo,
  schema.mailZusammenfassung,
];

/**
 * Abweisung: KEIN_RECHT, Rückgabe ohne Wirkung (`{ ok: false }`, „kanalAus“, „keinRecht“) oder Umleitung zur Anmeldung
 * ohne Hinweis (ein Ziel wie `/anmelden?hinweis=abgemeldet` ist dagegen der Erfolg des Abmeldens).
 */
function abgewiesen(a: Ausgang): boolean {
  if (a.kein) return true;
  if (a.weiter !== undefined) return /^\/(?:(?:tr|en)\/)?(?:anmelden|giris|sign-in)$/.test(a.weiter);
  const w = a.wert as { ok?: unknown; grund?: unknown; fehler?: unknown } | null | undefined;
  if (!w || typeof w !== 'object') return false;
  if (w.fehler === 'keinRecht' || w.grund === 'kanalAus') return true;
  return w.ok === false && Object.keys(w).length === 1;
}

/** Meldet die Person an: Konto mit Profil, Kontoarten und Verwaltungsrollen (oder ohne Sitzung). */
async function anmelden(p: Person): Promise<void> {
  if (!p.sitzung) {
    await angemeldetAls(null);
    return;
  }
  const id = (await angemeldetAls(p.verwaltung, p.zweiFaktor))!;
  await db.insert(schema.kontoProfil).values({ benutzerId: id, anzeigename: `Testperson ${p.name}`, istKind: p.kind });
  if (p.gemeinde.length) await db.insert(schema.gemeindeRolle).values(p.gemeinde.map((rolle) => ({ benutzerId: id, rolle })));
}

async function rufe(fall: Fall): Promise<Ausgang> {
  const modul = (await MODULE[fall.datei]()) as unknown as Record<string, (...a: unknown[]) => Promise<unknown>>;
  const fn = modul[fall.aktion];
  return ausgang(() => (fall.aufruf ? fall.aufruf(fn) : fn.length >= 2 ? fn({}, formular({})) : fn(formular({}))));
}

for (const fall of FAELLE) {
  describe(`${fall.datei}.${fall.aktion}`, () => {
    for (const p of PERSONEN) {
      const darf = fall.soll(p);
      it(`${p.name}: ${darf ? 'Konto-Prüfung bestanden' : 'abgewiesen'}`, async () => {
        await anmelden(p);
        const vorher = await momentaufnahme(db, TABELLEN);
        protokoll.length = 0;
        const ergebnis = await rufe(fall);
        expect(ergebnis.fehler, `Unerwarteter Fehler: ${String(ergebnis.fehler)}`).toBeUndefined();
        if (darf) {
          if (fall.spion !== undefined) expect(protokoll[0], 'Konto-Prüfung der Action').toEqual({ rollen: fall.spion, ok: true });
          else expect(abgewiesen(ergebnis), `Zugelassen erwartet, erhalten: ${JSON.stringify(ergebnis)}`).toBe(false);
        } else {
          expect(abgewiesen(ergebnis), `Abweisung erwartet, erhalten: ${JSON.stringify(ergebnis)}`).toBe(true);
          if (fall.spion !== undefined && p.sitzung)
            expect(protokoll[0], 'Konto-Prüfung der Action').toEqual({ rollen: fall.spion, ok: false });
          expect(await momentaufnahme(db, TABELLEN), 'Der Datenbestand hat sich bei der Abweisung verändert').toBe(vorher);
        }
      });
    }
    for (const schalter of fall.schalter) {
      it(`Schalter „${schalter}“ aus: abgewiesen, auch für zugelassene Konten`, async () => {
        const bester = PERSONEN.find((p) => fall.soll(p) && p.sitzung) ?? PERSONEN[0];
        await anmelden(bester);
        process.env[`FUNKTION_${schalter.toUpperCase()}`] = 'aus';
        const vorher = await momentaufnahme(db, TABELLEN);
        const ergebnis = await rufe(fall);
        expect(ergebnis.fehler, `Unerwarteter Fehler: ${String(ergebnis.fehler)}`).toBeUndefined();
        expect(abgewiesen(ergebnis), `Abweisung erwartet, erhalten: ${JSON.stringify(ergebnis)}`).toBe(true);
        expect(await momentaufnahme(db, TABELLEN), 'Der Datenbestand hat sich verändert').toBe(vorher);
      });
    }
  });
}

/** Zuordnung aller Dateien unter src/server/actions zu genau einer Matrix (oder den öffentlichen Formularen). */
const ZUORDNUNG: Record<string, string[]> = {
  'verwaltung/rechte-matrix.test.ts (rechte-hilfen.ts)': [
    'veranstaltungen',
    'neuigkeiten',
    'ankuendigungen',
    'kurse',
    'medien',
    'eingaenge',
    'postfach',
    'tickets',
    'seiteninhalte',
    'seiteninhalte-organisationen',
    'gebetszeiten',
    'einstellungen',
    'startklar',
    'benutzer',
    'anmeldung',
  ],
  'verwaltung/rechte-matrix-gemeinde.test.ts': [
    'anzeige',
    'besondere-tage',
    'einstellungen-spenden',
    'freigaben',
    'gemeinde-konten',
    'gruppen',
    'hatim',
    'kinderschutz',
    'koran',
    'lehrplan',
    'lernende',
    'menues',
    'newsletter',
    'rezitationen',
    'seiten',
    'startseite',
    'tagesvers',
    'weiterleitungen',
    'wissen',
  ],
  'rechte-matrix-mitglieder.test.ts': Object.keys(MODULE),
  // Lern-App, Verwaltung v1 (L3-06)
  'verwaltung/rechte-matrix-lernapp.test.ts': ['lernapp-audio', 'lernapp-meldungen', 'lernapp-sprachpruefung'],
  // Öffentliche Formulare: ohne Konto, mit ALTCHA und Ratenbegrenzung (formular-*.test.ts, newsletter-anmeldung.test.ts)
  'öffentliche Formulare': [
    'formulare/kontakt',
    'formulare/meldung',
    'formulare/mitgliedsantrag',
    'formulare/moschee-anfrage',
    'formulare/newsletter',
    'formulare/veranstaltungsanmeldung',
    'formulare/voranmeldung',
  ],
};

describe('Vollständigkeit', () => {
  it('jede exportierte Action der acht Dateien ist erfasst', async () => {
    const exportiert: string[] = [];
    for (const [datei, laden] of Object.entries(MODULE)) {
      const modul = (await laden()) as Record<string, unknown>;
      for (const [name, wert] of Object.entries(modul)) if (typeof wert === 'function') exportiert.push(`${datei}.${name}`);
    }
    expect([...new Set(FAELLE.map((x) => `${x.datei}.${x.aktion}`))].sort()).toEqual(exportiert.sort());
  });

  it('jede Datei unter src/server/actions gehört zu genau einer Matrix', () => {
    const wurzel = join(import.meta.dirname, '..', '..', 'src', 'server', 'actions');
    const dateien = readdirSync(wurzel, { recursive: true, withFileTypes: true })
      .filter((d) => d.isFile() && /\.tsx?$/.test(d.name))
      .map((d) =>
        join(d.parentPath, d.name)
          .slice(wurzel.length + 1)
          .replace(/\.tsx?$/, ''),
      )
      .sort();
    const zugeordnet = Object.values(ZUORDNUNG).flat();
    expect(new Set(zugeordnet).size, 'eine Datei steht in zwei Matrizen').toBe(zugeordnet.length);
    expect([...zugeordnet].sort()).toEqual(dateien);
  });

  it('jede Personengruppe kommt vor; jede Kontoart ist vertreten', async () => {
    const { schema: s } = await import('@/lib/db');
    const vertreten = new Set(PERSONEN.flatMap((p) => p.gemeinde));
    expect([...vertreten].sort()).toEqual([...s.gemeindeRolleEnum.enumValues].sort());
  });
});
