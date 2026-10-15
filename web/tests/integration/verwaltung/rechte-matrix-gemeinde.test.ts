import type { PgTable } from 'drizzle-orm/pg-core';
import { afterAll, describe, expect, it, vi } from 'vitest';
import { schema } from '@/lib/db';
import type { Aktion } from '@/lib/rechte/matrix';
import { verwaltungsUmgebung } from '../hilfen/verwaltung';
import { anmelden, ausgang, type Ausgang, erlaubt, formular, momentaufnahme, PERSONEN, type Person, type Pruefung } from './rechte-hilfen';

/**
 * Generierte Rechte-Matrix für die Verwaltungs-Actions des Laufs „Gemeinde-Plattform“ (seit b702c7c; Stufe C k2: bisher
 * nur handgeschriebene Negativtests). 17 Action-Dateien × alle Personengruppen (auch Leitung, religiöse Prüfung und
 * Kinderschutz) × jede exportierte Action.
 *
 * Je Action steht hier die Matrix-Prüfung, die sie laut Code als ERSTES ausführt (`verlangeRecht(<aktion>)`), dazu
 * weitere Prüfungen vor jeder Wirkung. Ein Spion auf `verlangeRecht` hält fest, welche Prüfung tatsächlich lief:
 * - nicht zugelassen (laut `darf()`): Abweisung (KEIN_RECHT geworfen oder Rückgabe „keinRecht“) und der Datenbestand
 *   bleibt unverändert;
 * - zugelassen: Der Spion zeigt die erwartete Prüfung als bestanden; danach endet die Action an der (hier leeren bzw.
 *   minimalen) Eingabe – das genügt als Nachweis, dass die Rechteprüfung bestanden wurde. Die Wirkung mit gültiger
 *   Eingabe prüfen die Modultests (verwaltung-*.test.ts, gemeinde-konten.test.ts, sicherheit-s2-*.test.ts).
 * Eine Vollständigkeitsprüfung stellt sicher, dass jede exportierte Action dieser Dateien hier steht.
 */
const protokoll: { aktion: string; ok: boolean }[] = [];
vi.mock('@/lib/rechte/pruefe', async (original) => {
  const echt = await original<typeof import('@/lib/rechte/pruefe')>();
  return {
    ...echt,
    verlangeRecht: async (aktion: Aktion, ziel?: Parameters<typeof echt.verlangeRecht>[1]) => {
      try {
        const a = await echt.verlangeRecht(aktion, ziel);
        protokoll.push({ aktion, ok: true });
        return a;
      } catch (e) {
        protokoll.push({ aktion, ok: false });
        throw e;
      }
    },
  };
});

const { client, db } = await verwaltungsUmgebung();
afterAll(() => client.close());

// Seite der Organisation gt: Vorschau braucht einen vorhandenen Datensatz (Organisationsrecht am Datensatz)
const [seiteGt] = await db
  .insert(schema.seite)
  .values({ slugDe: 'matrix-test-gt', titel: { de: 'Testseite' }, organisation: 'gt' })
  .returning({ id: schema.seite.id });

/** Alle Personengruppen der Verwaltung: die der bestehenden Matrix und die Rollen des Laufs Gemeinde-Plattform. */
const PERSONEN_ALLE: Person[] = [
  ...PERSONEN,
  { name: 'Leitung', rollen: [{ rolle: 'leitung' }], zweiFaktor: true },
  { name: 'Religiöse Prüfung', rollen: [{ rolle: 'religioese_pruefung' }], zweiFaktor: true },
  { name: 'Kinderschutz', rollen: [{ rolle: 'kinderschutz' }], zweiFaktor: true },
];

const MODULE = {
  anzeige: () => import('@/server/actions/anzeige'),
  'besondere-tage': () => import('@/server/actions/besondere-tage'),
  'einstellungen-spenden': () => import('@/server/actions/einstellungen-spenden'),
  freigaben: () => import('@/server/actions/freigaben'),
  'gemeinde-konten': () => import('@/server/actions/gemeinde-konten'),
  gruppen: () => import('@/server/actions/gruppen'),
  hatim: () => import('@/server/actions/hatim'),
  kinderschutz: () => import('@/server/actions/kinderschutz'),
  koran: () => import('@/server/actions/koran'),
  lehrplan: () => import('@/server/actions/lehrplan'),
  lernende: () => import('@/server/actions/lernende'),
  menues: () => import('@/server/actions/menues'),
  newsletter: () => import('@/server/actions/newsletter'),
  rezitationen: () => import('@/server/actions/rezitationen'),
  seiten: () => import('@/server/actions/seiten'),
  tagesvers: () => import('@/server/actions/tagesvers'),
  weiterleitungen: () => import('@/server/actions/weiterleitungen'),
} as const;
type Datei = keyof typeof MODULE;

/** Tabellen, die eine Abweisung nicht verändern darf (alle Bereiche dieser Actions). */
const TABELLEN: PgTable[] = [
  schema.auditEintrag,
  schema.mailAusgang,
  schema.einstellung,
  schema.anzeigeFolie,
  schema.besondererTag,
  schema.freigabe,
  schema.seite,
  schema.revision,
  schema.vorschauToken,
  schema.menue,
  schema.weiterleitung,
  schema.user,
  schema.gemeindeRolle,
  schema.einladung,
  schema.elternKind,
  schema.gruppe,
  schema.gruppenLeitung,
  schema.gruppenMitglied,
  schema.unterrichtstermin,
  schema.lehrplanStufe,
  schema.lernende,
  schema.hatim,
  schema.hatimTeil,
  schema.chatKanal,
  schema.chatMeldung,
  schema.moderationsprotokoll,
  schema.quranWortbedeutung,
  schema.quranWortbedeutungOrt,
  schema.tajwidRegel,
  schema.hadithUebersetzung,
  schema.hadithAuswahl,
  schema.quranAusgabe,
  schema.quranVersAuswahl,
  schema.quranRezitation,
  schema.newsletterAusgabe,
];

type Fall = {
  datei: Datei;
  aktion: string;
  /** Erste Matrix-Prüfung laut Code (`verlangeRecht`) und weitere Prüfungen vor jeder Wirkung. */
  pruefungen: (Aktion | Pruefung)[];
  /** Eingabe, die vor der Rechteprüfung gelesen wird (sonst leer). */
  eingabe?: Record<string, string>;
  /** Abweichende Aufrufform (Standard: `(fd)` bzw. `(vorher, fd)` nach Zahl der Parameter). */
  aufruf?: (f: (...a: unknown[]) => Promise<unknown>) => Promise<unknown>;
};

const f = (datei: Datei, aktionen: string[], pruefungen: (Aktion | Pruefung)[], extra: Partial<Fall> = {}): Fall[] =>
  aktionen.map((aktion) => ({ datei, aktion, pruefungen, ...extra }));

const UUID = '00000000-0000-4000-8000-000000000001';

const FAELLE: Fall[] = [
  ...f(
    'anzeige',
    ['legeFolieAn', 'speichereFolie', 'setzeFolienStatus', 'verschiebeFolie', 'loescheFolie', 'speichereAnzeigeEinstellung'],
    ['anzeige.bearbeiten'],
  ),
  // Freigeben (Ziel „geprüft“) verlangt die religiöse Freigabe; das Ziel steht vor der Rechteprüfung in der Eingabe
  ...f('anzeige', ['folienFreigabe'], ['religioes.freigeben'], { eingabe: { id: UUID, ziel: 'geprueft' } }),
  ...f('besondere-tage', ['uebernehmeVorschlaege', 'speichereBesonderenTag', 'entferneBesonderenTag'], ['kalender.bearbeiten']),
  ...f('besondere-tage', ['bestaetigeBesonderenTag'], ['religioes.freigeben']),
  ...f('einstellungen-spenden', ['speichereSpenden'], ['einstellung.bearbeiten']),
  ...f('freigaben', ['entscheideFreigabe'], ['freigabe.lesen']),
  ...f(
    'gemeinde-konten',
    [
      'gemeindeRollenSpeichern',
      'gemeindeKontoSperren',
      'gemeindeKontoEntsperren',
      'gemeindeKontoJetztLoeschen',
      'gemeindeEinladen',
      'gemeindeEinladungWiderrufen',
    ],
    ['gemeindekonto.bearbeiten'],
  ),
  ...f('gemeinde-konten', ['elternBezugBeenden'], ['gemeindekonto.bearbeiten', 'lernende.lesen']),
  ...f(
    'gruppen',
    ['speichereGruppe', 'leitungZuweisen', 'leitungEntfernen', 'mitgliedHinzufuegen', 'mitgliedEntfernen', 'termineAnlegen'],
    ['gruppe.bearbeiten'],
  ),
  ...f('hatim', ['legeHatimAnAktion', 'speichereHatim', 'setzeHatimZustand', 'loescheHatim'], ['hatim.bearbeiten']),
  ...f('kinderschutz', ['notfallpauseSetzen'], ['chat.notfallpause'], { eingabe: { grund: 'Testgrund', an: '1' } }),
  ...f('kinderschutz', ['meldungStatusSetzen'], ['meldung.chat.bearbeiten'], {
    eingabe: { grund: 'Testgrund', id: UUID, status: 'erledigt' },
  }),
  ...f('kinderschutz', ['kanalPauseSetzen'], ['meldung.chat.bearbeiten'], { eingabe: { grund: 'Testgrund', kanalId: UUID, pause: '1' } }),
  ...f('kinderschutz', ['nachrichtEntfernen'], ['meldung.chat.bearbeiten'], { eingabe: { grund: 'Testgrund', nachrichtId: '1' } }),
  ...f('kinderschutz', ['meldungsKontextLaden'], ['meldung.chat.lesen'], { aufruf: (fn) => fn(UUID) }),
  ...f('koran', ['bedeutungSpeichern', 'bedeutungEntfernen', 'ortSpeichern', 'ortEntfernen', 'tajwidSpeichern'], ['quran.bearbeiten']),
  ...f('koran', ['hadithUebersetzungSpeichern', 'hadithUebersetzungEntfernen'], ['hadith.bearbeiten']),
  // Ziel „geprüft“: Freigabe verlangt die religiöse Prüfung (Ziel und Art stehen vor der Rechteprüfung in der Eingabe)
  ...f('koran', ['statusSetzen'], ['religioes.freigeben'], { eingabe: { art: 'tajwid_regel', kennung: 'test', ziel: 'geprueft' } }),
  ...f('koran', ['ausgabeFreigeben', 'ausgabeDeaktivieren', 'ausgabeStandard'], ['religioes.freigeben']),
  ...f('koran', ['listeHinzufuegen', 'listeEntfernen', 'listeVerschieben'], ['hadith.bearbeiten', 'religioes.freigeben']),
  ...f('lehrplan', ['stufeAnlegen', 'stufeUmbenennen', 'stufeVerschieben'], ['lehrplan.bearbeiten']),
  ...f('lernende', ['aufnehmen'], ['lernende.aufnehmen', 'eingang.voranmeldung.bearbeiten']),
  ...f('lernende', ['setzeLernendeStatus'], ['lernende.bearbeiten']),
  ...f('menues', ['speichereMenue', 'menueZuruecksetzen'], ['menue.bearbeiten']),
  ...f('newsletter', ['speichereAusgabe', 'versendeAusgabe', 'loescheAusgabe'], ['newsletter.senden']),
  ...f(
    'rezitationen',
    [
      'rezitationAnlegen',
      'rezitationAendern',
      'vereinbarungSetzen',
      'vereinbarungLoesen',
      'audioUebernehmen',
      'verszeitenSpeichern',
      'wortzeitenSpeichern',
      'wortzeitenBestaetigen',
    ],
    ['rezitation.bearbeiten'],
  ),
  ...f('rezitationen', ['freigabeSetzen', 'standardSetzen'], ['rezitation.bearbeiten', 'religioes.freigeben']),
  ...f('seiten', ['seiteInPapierkorb', 'seiteWiederherstellen', 'seiteEndgueltigLoeschen', 'revisionWiederherstellen'], ['seite.lesen']),
  // Speichern: nur, wer überhaupt eine Organisation bearbeiten darf (Leitung liest nur)
  ...f('seiten', ['speichereSeite'], ['seite.lesen', { aktion: 'seite.bearbeiten', ziel: { organisation: 'gt' } }]),
  // Vorschau: Organisationsrecht am Datensatz (hier eine Seite der Organisation gt)
  ...f('seiten', ['erzeugeVorschau'], ['seite.lesen', { aktion: 'seite.bearbeiten', ziel: { organisation: 'gt' } }], {
    eingabe: { id: seiteGt.id },
  }),
  ...f('tagesvers', ['versHinzufuegen', 'versEntfernen', 'versVerschieben'], ['quran.bearbeiten', 'religioes.freigeben']),
  ...f('weiterleitungen', ['speichereWeiterleitung', 'loescheWeiterleitung'], ['weiterleitung.bearbeiten']),
];

/** Rückgaben, die eine Abweisung aus Rechtegründen bedeuten. */
const ABWEISUNG = new Set(['keinRecht', 'nurReligioesePruefung', 'keineFreigabe']);
const alsPruefung = (x: Aktion | Pruefung): Pruefung => (typeof x === 'string' ? { aktion: x } : x);

function abgewiesen(a: Ausgang): boolean {
  if (a.kein) return true;
  const fehler = (a.wert as { fehler?: unknown } | null | undefined)?.fehler;
  return typeof fehler === 'string' && ABWEISUNG.has(fehler);
}

async function rufe(fall: Fall): Promise<Ausgang> {
  const modul = (await MODULE[fall.datei]()) as unknown as Record<string, (...a: unknown[]) => Promise<unknown>>;
  const fn = modul[fall.aktion];
  const fd = formular(fall.eingabe ?? {});
  return ausgang(() => (fall.aufruf ? fall.aufruf(fn) : fn.length >= 2 ? fn({}, fd) : fn(fd)));
}

for (const fall of FAELLE) {
  const pruefungen = fall.pruefungen.map(alsPruefung);
  const erste = pruefungen[0].aktion;
  describe(`${fall.datei}.${fall.aktion} (${pruefungen.map((x) => x.aktion).join(' + ')})`, () => {
    for (const p of PERSONEN_ALLE) {
      const darfJa = erlaubt(p, pruefungen);
      it(`${p.name}: ${darfJa ? 'Rechteprüfung bestanden' : 'abgewiesen'}`, async () => {
        await anmelden(p);
        const vorher = await momentaufnahme(db, TABELLEN);
        protokoll.length = 0;
        const ergebnis = await rufe(fall);
        if (darfJa) {
          expect(protokoll[0], 'Erste Rechteprüfung der Action').toEqual({ aktion: erste, ok: true });
          expect(ergebnis.fehler, 'Unerwarteter Fehler der Action').toBeUndefined();
          expect((ergebnis.wert as { fehler?: unknown } | null | undefined)?.fehler, 'Rückgabe meldet „keinRecht“').not.toBe('keinRecht');
        } else {
          expect(abgewiesen(ergebnis), `Abweisung erwartet, erhalten: ${JSON.stringify(ergebnis)}`).toBe(true);
          if (p.rollen !== null && p.zweiFaktor && protokoll.length)
            expect(protokoll[0].aktion, 'Erste Rechteprüfung der Action').toBe(erste);
          expect(await momentaufnahme(db, TABELLEN), 'Der Datenbestand hat sich bei der Abweisung verändert').toBe(vorher);
        }
      });
    }
  });
}

describe('Vollständigkeit: jede exportierte Action der Gemeinde-Plattform ist erfasst', () => {
  it('stimmt mit den Fällen überein', async () => {
    const exportiert: string[] = [];
    for (const [datei, laden] of Object.entries(MODULE)) {
      const modul = (await laden()) as Record<string, unknown>;
      for (const [name, wert] of Object.entries(modul)) if (typeof wert === 'function') exportiert.push(`${datei}.${name}`);
    }
    expect([...new Set(FAELLE.map((x) => `${x.datei}.${x.aktion}`))].sort()).toEqual(exportiert.sort());
  });

  it('jede Personengruppe kommt vor, jede Rolle der Matrix ist vertreten', async () => {
    const { ROLLEN } = await import('@/lib/rechte/matrix');
    const vertreten = new Set(PERSONEN_ALLE.flatMap((p) => (p.rollen ?? []).map((r) => r.rolle)));
    expect([...vertreten].sort()).toEqual([...ROLLEN].sort());
  });
});
