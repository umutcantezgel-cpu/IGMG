import { type DBSchema, type IDBPDatabase, openDB } from 'idb';
import type { LektionsStand, TagesStand } from '../ereignisse/ableiten';
import type { Ereignis } from '../ereignisse/typen';
import type { Sprache } from '../kurse';
import type { Kartenstand } from '../bewertung';
import type { KartenBasis } from '../srs';

/**
 * Lokale Datenbank der Lern-App (ADR 0038 Nr. 1, Fortschreibung S6): IndexedDB `igmg-lernapp` über `idb` (ISC),
 * versionierte Migrationen. Ohne IndexedDB (private Fenster, gesperrter Speicher) läuft derselbe Speicher im
 * Arbeitsspeicher; `hinweis` sagt der Oberfläche, dass nach dem Schließen nichts bleibt.
 *
 * | Speicher | Schlüssel | Inhalt |
 * |---|---|---|
 * | profile | id | Lernprofile auf dem Gerät (mehrere je Familiengerät, ohne Passwort) |
 * | ereignisse | [profil, geraet, seq] | Wahrheit, nur anhängen; Indizes [profil, am], [profil, synchron] |
 * | karten | [profil, karte] | abgeleitet: FSRS-Stand; Index [profil, faellig] |
 * | lektionen, tage, abzeichen | [profil, …] | abgeleitet |
 * | einstellungen | [profil, schluessel] | letzter Schreiber nach (am, geraet); Profil '' = Gerät (aktives Profil) |
 * | pakete | [kurs, einheit] | Hash, Bytes, offline ja/nein (Inhalt im Cache Storage, ADR 0039) |
 * | sync | profil | Zeiger des Servers, letzter Abgleich (L1-05) |
 *
 * Client-Modul: läuft nur im Browser (und in Tests mit `fake-indexeddb`).
 */

export const DB_NAME = 'igmg-lernapp';
/**
 * Version der Datenbank. Nach einem Bauwechsel liefert der Lern-App-Worker ohne Netz Seiten und Programmteile des alten Baus aus
 * dessen Kursvorrat, bis die Wiederherstellung fertig ist (ADR 0039 Fortschreibung N9a Nr. 2) – sie öffnen die Datenbank mit
 * ihrer eigenen, älteren Version und scheitern mit `VersionError`, sobald eine neue Seite die Version angehoben hat. Wer sie
 * anhebt, lässt deshalb den Worker die Kursvorräte älterer Bauten nicht mehr ausliefern (gespeicherte Einheiten starten dann
 * erst nach der Wiederherstellung mit Netz wieder offline).
 */
export const DB_VERSION = 1;

export type { Sprache };

export type Profil = {
  id: string;
  /** Anzeigename auf dem Gerät (frei gewählt, z. B. Vorname) */
  name: string;
  oberflaeche: Sprache;
  ausgangssprache?: Sprache;
  /** UUID je Gerät und Profil (Ereignisse) */
  geraet: string;
  angelegt: string;
  /** nach der Anmeldung (ein Profil gehört zu genau einem Konto, ADR 0038 Nr. 7) */
  benutzerId?: string;
  /** Stand der Ableitung in den abgeleiteten Speichern */
  ableitungsVersion?: number;
};

export type GespeichertesEreignis = Ereignis & { profil: string; synchron: 0 | 1 };
export type KartenEintrag = Kartenstand & { profil: string };
export type LektionsEintrag = LektionsStand & { profil: string };
export type TagesEintrag = TagesStand & { profil: string };
export type AbzeichenEintrag = { profil: string; abzeichen: string; am: string };
export type EinstellungsEintrag = { profil: string; schluessel: string; wert: unknown; am: string; geraet: string };
export type PaketEintrag = { kurs: string; einheit: string; hash: string; bytes: number; offline: boolean; geladen: string };
/**
 * Abgleich je Profil (L1-05, lokal/sync.ts): Zeiger des Servers, letzter Abgleich, Anlage des Lernstands auf dem Server
 * (`angelegt`; ändert sie sich, sendet das Gerät alles neu) und verdichtete Kartenstände des Servers (Bewertungen älter als
 * 12 Monate, ADR 0038 Nr. 10) mit ihrem Stand, die die Ableitung als Basis nutzt.
 */
export type SyncEintrag = {
  profil: string;
  zeiger: string | null;
  zuletzt: string | null;
  angelegt?: string | null;
  basisStand?: string | null;
  basen?: Record<string, KartenBasis>;
};

export interface LernappDB extends DBSchema {
  profile: { key: string; value: Profil };
  ereignisse: {
    key: [string, string, number];
    value: GespeichertesEreignis;
    indexes: { 'profil-am': [string, string]; 'profil-synchron': [string, number] };
  };
  karten: { key: [string, string]; value: KartenEintrag; indexes: { 'profil-faellig': [string, string] } };
  lektionen: { key: [string, string]; value: LektionsEintrag };
  tage: { key: [string, string]; value: TagesEintrag };
  abzeichen: { key: [string, string]; value: AbzeichenEintrag };
  einstellungen: { key: [string, string]; value: EinstellungsEintrag };
  pakete: { key: [string, string]; value: PaketEintrag };
  sync: { key: string; value: SyncEintrag };
}

export type SpeicherName = 'profile' | 'ereignisse' | 'karten' | 'lektionen' | 'tage' | 'abzeichen' | 'einstellungen' | 'pakete' | 'sync';
type Wert<N extends SpeicherName> = LernappDB[N]['value'];
type Schl<N extends SpeicherName> = LernappDB[N]['key'];
export type Schluessel = string | number | Schluessel[];

/** Schlüsselpfade und Indizes – eine Quelle für IndexedDB und den Arbeitsspeicher. */
export const SPEICHER: Record<SpeicherName, { schluessel: string | string[]; indizes: Record<string, string[]> }> = {
  profile: { schluessel: 'id', indizes: {} },
  ereignisse: {
    schluessel: ['profil', 'geraet', 'seq'],
    indizes: { 'profil-am': ['profil', 'am'], 'profil-synchron': ['profil', 'synchron'] },
  },
  karten: { schluessel: ['profil', 'karte'], indizes: { 'profil-faellig': ['profil', 'faellig'] } },
  lektionen: { schluessel: ['profil', 'lektion'], indizes: {} },
  tage: { schluessel: ['profil', 'tag'], indizes: {} },
  abzeichen: { schluessel: ['profil', 'abzeichen'], indizes: {} },
  einstellungen: { schluessel: ['profil', 'schluessel'], indizes: {} },
  pakete: { schluessel: ['kurs', 'einheit'], indizes: {} },
  sync: { schluessel: 'profil', indizes: {} },
};

/** Profilbezogene Speicher (für Löschen und Neuberechnen). */
export const PROFIL_SPEICHER = ['ereignisse', 'karten', 'lektionen', 'tage', 'abzeichen', 'einstellungen'] as const;

/** Migrationen: Eintrag `i` hebt die Datenbank von Version `i` auf `i + 1`. Nie ändern, nur anhängen. */
export const MIGRATIONEN: ReadonlyArray<(db: IDBPDatabase<LernappDB>) => void> = [
  (db) => {
    const roh = db as unknown as IDBPDatabase;
    for (const [name, def] of Object.entries(SPEICHER)) {
      const store = roh.createObjectStore(name, { keyPath: def.schluessel });
      for (const [index, pfad] of Object.entries(def.indizes)) store.createIndex(index, pfad);
    }
  },
];

/** Alle Einträge eines Profils in einem Speicher mit Schlüssel [profil, …]: von [p] bis [p, []] (Arrays ordnen hinter allem). */
export const profilBereich = (profil: string): [Schluessel, Schluessel] => [[profil], [profil, []]];

export type SpeicherHinweis = 'keinIndexedDb' | 'gesperrt';

/** Gemeinsame Schnittstelle für IndexedDB und Arbeitsspeicher. Bereiche sind einschließlich, Ergebnisse nach Schlüssel sortiert. */
export interface Speicher {
  readonly art: 'indexeddb' | 'arbeitsspeicher';
  /** gesetzt, wenn nur der Arbeitsspeicher läuft (nach dem Schließen bleibt nichts) */
  readonly hinweis: SpeicherHinweis | null;
  lies<N extends SpeicherName>(name: N, schluessel: Schl<N>): Promise<Wert<N> | undefined>;
  alle<N extends SpeicherName>(name: N, bereich?: [Schluessel, Schluessel]): Promise<Wert<N>[]>;
  alleIndex<N extends 'ereignisse' | 'karten'>(
    name: N,
    index: keyof LernappDB[N]['indexes'] & string,
    bereich: [Schluessel, Schluessel],
  ): Promise<Wert<N>[]>;
  schreibe<N extends SpeicherName>(name: N, werte: readonly Wert<N>[]): Promise<void>;
  loesche<N extends SpeicherName>(name: N, schluessel: Schl<N>): Promise<void>;
  loescheBereich<N extends SpeicherName>(name: N, bereich: [Schluessel, Schluessel]): Promise<void>;
  /** Atomar: nächste Nummer für (profil, geraet) und Einfügen; `baue` erzeugt das Ereignis zur Nummer. */
  haengeAn(profil: string, geraet: string, baue: (seq: number) => GespeichertesEreignis): Promise<GespeichertesEreignis>;
  schliesse(): void;
}

// ——— Schlüsselordnung wie IndexedDB (Zahl < Text < Liste; Listen elementweise, kürzerer Anfang zuerst) ———

const rang = (k: Schluessel) => (typeof k === 'number' ? 0 : typeof k === 'string' ? 1 : 2);

export function vergleicheSchluessel(a: Schluessel, b: Schluessel): number {
  const ra = rang(a);
  const rb = rang(b);
  if (ra !== rb) return ra - rb;
  if (Array.isArray(a) && Array.isArray(b)) {
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      const c = vergleicheSchluessel(a[i] as Schluessel, b[i] as Schluessel);
      if (c) return c;
    }
    return a.length - b.length;
  }
  return a < b ? -1 : a > b ? 1 : 0;
}

function schluesselVon(wert: object, pfad: string | string[]): Schluessel {
  const w = wert as Record<string, Schluessel>;
  return Array.isArray(pfad) ? pfad.map((p) => w[p] as Schluessel) : (w[pfad] as Schluessel);
}

const imBereich = (k: Schluessel, [von, bis]: [Schluessel, Schluessel]) =>
  vergleicheSchluessel(k, von) >= 0 && vergleicheSchluessel(k, bis) <= 0;

/** Speicher im Arbeitsspeicher (Rückfall ohne IndexedDB, gleiches Verhalten). */
export function arbeitsspeicher(hinweis: SpeicherHinweis | null = 'keinIndexedDb'): Speicher {
  const daten = new Map<SpeicherName, Map<string, { k: Schluessel; v: unknown }>>();
  const tabelle = (n: SpeicherName) => {
    let t = daten.get(n);
    if (!t) daten.set(n, (t = new Map()));
    return t;
  };
  const kopie = <T>(v: T): T => structuredClone(v);
  const sortiert = (n: SpeicherName) => [...tabelle(n).values()].sort((a, b) => vergleicheSchluessel(a.k, b.k));
  return {
    art: 'arbeitsspeicher',
    hinweis,
    async lies(name, schluessel) {
      const e = tabelle(name).get(JSON.stringify(schluessel));
      return e ? kopie(e.v as Wert<typeof name>) : undefined;
    },
    async alle(name, bereich) {
      return sortiert(name)
        .filter((e) => !bereich || imBereich(e.k, bereich))
        .map((e) => kopie(e.v as Wert<typeof name>));
    },
    async alleIndex(name, index, bereich) {
      const pfad = SPEICHER[name].indizes[index] ?? [];
      return sortiert(name)
        .map((e) => ({ ...e, i: schluesselVon(e.v as object, pfad) }))
        .filter((e) => imBereich(e.i, bereich))
        .sort((a, b) => vergleicheSchluessel(a.i, b.i) || vergleicheSchluessel(a.k, b.k))
        .map((e) => kopie(e.v as Wert<typeof name>));
    },
    async schreibe(name, werte) {
      for (const v of werte) {
        const k = schluesselVon(v as object, SPEICHER[name].schluessel);
        tabelle(name).set(JSON.stringify(k), { k, v: kopie(v) });
      }
    },
    async loesche(name, schluessel) {
      tabelle(name).delete(JSON.stringify(schluessel));
    },
    async loescheBereich(name, bereich) {
      for (const [s, e] of tabelle(name)) if (imBereich(e.k, bereich)) tabelle(name).delete(s);
    },
    async haengeAn(profil, geraet, baue) {
      const eigene = sortiert('ereignisse').filter((e) =>
        imBereich(e.k, [
          [profil, geraet],
          [profil, geraet, []],
        ]),
      );
      const letzte = eigene.at(-1)?.v as GespeichertesEreignis | undefined;
      const e = baue(letzte ? letzte.seq + 1 : 0);
      const k = schluesselVon(e, SPEICHER.ereignisse.schluessel);
      tabelle('ereignisse').set(JSON.stringify(k), { k, v: kopie(e) });
      return kopie(e);
    },
    schliesse() {},
  };
}

function idbSpeicher(db: IDBPDatabase<LernappDB>): Speicher {
  const roh = db as unknown as IDBPDatabase;
  const bereich = (b?: [Schluessel, Schluessel]) => (b ? IDBKeyRange.bound(b[0], b[1]) : undefined);
  return {
    art: 'indexeddb',
    hinweis: null,
    async lies(name, schluessel) {
      return (await roh.get(name, schluessel as IDBValidKey)) as Wert<typeof name> | undefined;
    },
    async alle(name, b) {
      return (await roh.getAll(name, bereich(b))) as Wert<typeof name>[];
    },
    async alleIndex(name, index, b) {
      return (await roh.getAllFromIndex(name, index, bereich(b))) as Wert<typeof name>[];
    },
    async schreibe(name, werte) {
      const tx = roh.transaction(name, 'readwrite');
      await Promise.all([...werte.map((w) => tx.store.put(w)), tx.done]);
    },
    async loesche(name, schluessel) {
      await roh.delete(name, schluessel as IDBValidKey);
    },
    async loescheBereich(name, b) {
      await roh.delete(name, IDBKeyRange.bound(b[0], b[1]));
    },
    async haengeAn(profil, geraet, baue) {
      const tx = roh.transaction('ereignisse', 'readwrite');
      const zeiger = await tx.store.openCursor(IDBKeyRange.bound([profil, geraet], [profil, geraet, []]), 'prev');
      const e = baue(zeiger ? (zeiger.value as GespeichertesEreignis).seq + 1 : 0);
      await tx.store.add(e);
      await tx.done;
      return e;
    },
    schliesse() {
      db.close();
    },
  };
}

export type OeffnenOptionen = {
  name?: string;
  /** zum Testen: `null` simuliert einen Browser ohne IndexedDB */
  fabrik?: IDBFactory | null;
};

/** Datenbank öffnen und migrieren; ohne IndexedDB oder bei Fehler der Arbeitsspeicher mit Hinweis. */
export async function oeffneSpeicher({ name = DB_NAME, fabrik }: OeffnenOptionen = {}): Promise<Speicher> {
  const vorhanden = fabrik === undefined ? (globalThis as { indexedDB?: IDBFactory }).indexedDB : fabrik;
  if (!vorhanden) return arbeitsspeicher('keinIndexedDb');
  try {
    const verbindung: { db?: IDBPDatabase<LernappDB> } = {};
    const db = await openDB<LernappDB>(name, DB_VERSION, {
      upgrade(datenbank, alt, neu) {
        for (let v = alt; v < (neu ?? DB_VERSION); v++) MIGRATIONEN[v]?.(datenbank);
      },
      // ein neuerer Tab will migrieren: Verbindung freigeben
      blocking() {
        verbindung.db?.close();
      },
    });
    verbindung.db = db;
    return idbSpeicher(db);
  } catch {
    return arbeitsspeicher('gesperrt');
  }
}
