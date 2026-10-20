import { lerntagVon } from '../ereignisse/serie';
import {
  HOECHSTENS_BYTES,
  HOECHSTENS_EREIGNISSE,
  SITZUNG_ADRESSE,
  SitzungAntwortSchema,
  SYNC_ADRESSE,
  SYNC_FEHLER,
  type SitzungAntwort,
  SyncAntwortSchema,
  type SyncFehler,
} from '../sync/protokoll';
import { leiteNeuAb } from './ableitung';
import { ausstehende, markiereSynchron, uebernimm } from './ausgang';
import { type GespeichertesEreignis, type Profil, profilBereich, type Speicher, type SyncEintrag } from './db';
import { aendereProfil, legeProfilAn } from './profile';

/**
 * Abgleich auf dem Gerät (ADR 0038 Nr. 5–7, PLAN §3.8). Client-Modul: läuft nur im Browser (und in Tests).
 *
 * - Nur ein an ein Konto gebundenes Profil gleicht ab; ohne Konto entsteht keine Anfrage (KERN 4.0 §6).
 * - `synchronisiere` sendet die ausstehenden Ereignisse (≤ 500 bzw. ≤ 256 KB je Anfrage), übernimmt fremde Ereignisse
 *   idempotent, folgt `mehr` und leitet danach Karten, Lektionen und Tage neu ab – mit den verdichteten Basen des Servers.
 * - `erzeugeAbgleich` plant den Abgleich: kurz nach jeder Handlung (gebündelt) und beim Öffnen mit Konto; nie zwei zugleich.
 * - Erste Anmeldung: `bindungFuer` sagt, ob die Übernahme-Frage nötig ist; `beantworteUebernahme` setzt die Antwort um.
 */

export type Abruf = (adresse: string, init?: RequestInit) => Promise<Response>;

const standardAbruf: Abruf = (adresse, init) => fetch(adresse, init);

/**
 * Sitzung abfragen. `null`: Abgleich aus (404), offline oder unlesbare Antwort. Nur aufrufen, wenn ein Profil an ein Konto
 * gebunden ist oder die Person die Anmeldung geöffnet hat.
 */
export async function ladeSitzung(abruf: Abruf = standardAbruf): Promise<SitzungAntwort | null> {
  try {
    const r = await abruf(SITZUNG_ADRESSE, { credentials: 'same-origin', cache: 'no-store', headers: { accept: 'application/json' } });
    if (!r.ok) return null;
    const p = SitzungAntwortSchema.safeParse(await r.json());
    return p.success ? p.data : null;
  } catch {
    return null;
  }
}

// ——— Erste Anmeldung (ADR 0038 Nr. 7) ———

/**
 * - `gebunden`: Das Profil gehört schon zu diesem Konto.
 * - `binden`: noch kein Konto und kein Fortschritt – ohne Frage binden (`beantworteUebernahme(…, true)`).
 * - `frage`: lokaler Fortschritt vorhanden – fragen: „Lokalen Fortschritt in dein Konto übernehmen?“
 * - `anderesKonto`: Das Profil gehört zu einem anderen Konto; es gleicht mit diesem nie ab (ein Profil, ein Konto).
 */
export type Bindung = 'gebunden' | 'binden' | 'frage' | 'anderesKonto';

export async function bindungFuer(sp: Speicher, profil: Pick<Profil, 'id' | 'benutzerId'>, konto: string): Promise<Bindung> {
  if (profil.benutzerId === konto) return 'gebunden';
  if (profil.benutzerId) return 'anderesKonto';
  return (await sp.alle('ereignisse', profilBereich(profil.id))).length ? 'frage' : 'binden';
}

/** Alle Ereignisse eines Profils als nicht abgeglichen markieren (neues Konto bzw. neu angelegter Lernstand auf dem Server). */
async function markiereAlleOffen(sp: Speicher, profil: string): Promise<void> {
  const alle = await sp.alle('ereignisse', profilBereich(profil));
  const offen: GespeichertesEreignis[] = alle.filter((e) => e.synchron !== 0).map((e) => ({ ...e, synchron: 0 }));
  if (offen.length) await sp.schreibe('ereignisse', offen);
}

/**
 * Antwort auf die Übernahme-Frage. Ja: Dieses Profil wird an das Konto gebunden und sendet beim nächsten Abgleich sein
 * ganzes Protokoll. Nein: Ein neues, leeres Profil für das Konto wird angelegt und aktiv; das bisherige bleibt nur auf dem
 * Gerät. Ergebnis ist das Profil, das ab jetzt abgleicht.
 */
export async function beantworteUebernahme(
  sp: Speicher,
  profil: Profil,
  konto: string,
  uebernehmen: boolean,
  { jetzt = new Date() }: { jetzt?: Date } = {},
): Promise<Profil> {
  if (profil.benutzerId === konto) return profil;
  if (uebernehmen && !profil.benutzerId) {
    await markiereAlleOffen(sp, profil.id);
    await sp.schreibe('sync', [{ profil: profil.id, zeiger: null, zuletzt: null }]);
    return aendereProfil(sp, profil.id, { benutzerId: konto });
  }
  const neu = await legeProfilAn(
    sp,
    { name: profil.name, oberflaeche: profil.oberflaeche, ...(profil.ausgangssprache ? { ausgangssprache: profil.ausgangssprache } : {}) },
    { jetzt },
  );
  return aendereProfil(sp, neu.id, { benutzerId: konto });
}

// ——— Abgleich ———

export type SyncGrund = 'nichtGebunden' | 'aus' | 'netz' | 'antwort' | SyncFehler;

export type SyncErgebnis =
  | { ok: true; gesendet: number; empfangen: number; runden: number; neuAbgeleitet: boolean }
  | { ok: false; grund: SyncGrund; gesendet: number; empfangen: number };

export type SyncOptionen = { abruf?: Abruf; jetzt?: () => Date; zeitzone?: string; hoechstensRunden?: number };

const bytes = (text: string) => new TextEncoder().encode(text).length;
const istSyncFehler = (f: unknown): f is SyncFehler => typeof f === 'string' && (SYNC_FEHLER as readonly string[]).includes(f);

/**
 * Ein Abgleich des Profils mit dem Konto: senden, empfangen, Seiten folgen (höchstens `hoechstensRunden` Anfragen, unter der
 * Bremse von 30 je Minute), danach neu ableiten, wenn sich etwas geändert hat.
 */
export async function synchronisiere(
  sp: Speicher,
  profil: Pick<Profil, 'id' | 'geraet' | 'benutzerId'>,
  { abruf = standardAbruf, jetzt = () => new Date(), zeitzone, hoechstensRunden = 10 }: SyncOptionen = {},
): Promise<SyncErgebnis> {
  let gesendet = 0;
  let empfangen = 0;
  if (!profil.benutzerId) return { ok: false, grund: 'nichtGebunden', gesendet, empfangen };
  let stand: SyncEintrag = (await sp.lies('sync', profil.id)) ?? { profil: profil.id, zeiger: null, zuletzt: null };
  let geaendert = false;
  let runden = 0;
  const fehler = async (grund: SyncGrund): Promise<SyncErgebnis> => {
    if (geaendert) await leiteNeuAb(sp, profil.id, lerntagVon(jetzt(), zeitzone));
    return { ok: false, grund, gesendet, empfangen };
  };

  while (runden < hoechstensRunden) {
    runden++;
    let paket = await ausstehende(sp, profil.id, HOECHSTENS_EREIGNISSE);
    const koerper = (liste: typeof paket) =>
      JSON.stringify({ geraet: profil.geraet, cursor: stand.zeiger, ereignisse: liste, basis: stand.basisStand ?? null });
    let text = koerper(paket);
    while (bytes(text) > HOECHSTENS_BYTES && paket.length > 1) {
      paket = paket.slice(0, Math.ceil(paket.length / 2));
      text = koerper(paket);
    }

    let r: Response;
    try {
      r = await abruf(SYNC_ADRESSE, {
        method: 'POST',
        credentials: 'same-origin',
        cache: 'no-store',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: text,
      });
    } catch {
      return fehler('netz');
    }
    if (r.status === 404) return fehler('aus');
    const roh: unknown = await r.json().catch(() => null);
    if (!r.ok)
      return fehler(istSyncFehler((roh as { fehler?: unknown } | null)?.fehler) ? (roh as { fehler: SyncFehler }).fehler : 'antwort');
    const p = SyncAntwortSchema.safeParse(roh);
    if (!p.success) return fehler('antwort');
    const a = p.data;

    // Der Lernstand auf dem Server ist neu angelegt (z. B. nach der Löschung wegen Inaktivität): alles neu senden
    if (stand.angelegt && stand.angelegt !== a.angelegt) {
      await markiereAlleOffen(sp, profil.id);
      stand = { profil: profil.id, zeiger: null, zuletzt: null, angelegt: a.angelegt, basisStand: null };
      await sp.schreibe('sync', [stand]);
      geaendert = true;
      continue;
    }

    await markiereSynchron(sp, profil.id, paket);
    gesendet += paket.length;
    if (a.geklemmt.length) {
      await sp.schreibe(
        'ereignisse',
        a.geklemmt.map((e) => ({ ...e, profil: profil.id, synchron: 1 as const })),
      );
      geaendert = true;
    }
    const u = await uebernimm(sp, profil.id, a.ereignisse);
    empfangen += u.neu;
    if (u.neu) geaendert = true;
    const basen = a.basen ?? (a.basisStand ? stand.basen : undefined);
    if (a.basen || (stand.basen && !a.basisStand)) geaendert = true;
    stand = {
      profil: profil.id,
      zeiger: a.cursor,
      zuletzt: jetzt().toISOString(),
      angelegt: a.angelegt,
      basisStand: a.basisStand,
      ...(basen ? { basen } : {}),
    };
    await sp.schreibe('sync', [stand]);
    if (!a.mehr && !(await ausstehende(sp, profil.id, 1)).length) break;
  }

  if (geaendert) await leiteNeuAb(sp, profil.id, lerntagVon(jetzt(), zeitzone));
  return { ok: true, gesendet, empfangen, runden, neuAbgeleitet: geaendert };
}

// ——— Planung: nach Handlung und beim Öffnen ———

export type Abgleich = {
  /** Nach einer Handlung (Lektion beendet, Einstellung geändert): gebündelt nach `verzoegerungMs`. */
  nachHandlung(): void;
  /** Beim Öffnen der App: Sitzung prüfen, dann sofort abgleichen. */
  beimOeffnen(): Promise<SyncErgebnis | null>;
  beenden(): void;
};

export type AbgleichOptionen = SyncOptionen & {
  speicher: Speicher;
  /** aktuelles Profil (z. B. `aktivesProfil`) */
  profil: () => Promise<Profil | null> | Profil | null;
  verzoegerungMs?: number;
  beiErgebnis?: (e: SyncErgebnis) => void;
};

/**
 * Plant den Abgleich eines Profils mit Konto. Nie zwei Abgleiche zugleich: Kommt während eines Laufs eine Handlung, folgt
 * genau ein weiterer Lauf. Nach `aus`, `anmeldung`, `einwilligung` oder `eltern` ruht der Abgleich bis zum nächsten Öffnen.
 */
export function erzeugeAbgleich({ speicher, profil, verzoegerungMs = 4000, beiErgebnis, ...optionen }: AbgleichOptionen): Abgleich {
  let zeitgeber: ReturnType<typeof setTimeout> | null = null;
  let laeuft: Promise<SyncErgebnis | null> | null = null;
  let nochmal = false;
  let ruht = false;
  let beendet = false;

  const lauf = async (): Promise<SyncErgebnis | null> => {
    if (laeuft) {
      nochmal = true;
      return laeuft;
    }
    laeuft = (async () => {
      let ergebnis: SyncErgebnis | null = null;
      do {
        nochmal = false;
        const p = await profil();
        if (!p?.benutzerId || ruht || beendet) break;
        ergebnis = await synchronisiere(speicher, p, optionen);
        if (!ergebnis.ok && ['aus', 'anmeldung', 'einwilligung', 'eltern'].includes(ergebnis.grund)) ruht = true;
        beiErgebnis?.(ergebnis);
      } while (nochmal && !beendet);
      return ergebnis;
    })();
    try {
      return await laeuft;
    } finally {
      laeuft = null;
    }
  };

  return {
    nachHandlung() {
      if (beendet || ruht) return;
      if (zeitgeber) clearTimeout(zeitgeber);
      zeitgeber = setTimeout(() => {
        zeitgeber = null;
        void lauf();
      }, verzoegerungMs);
    },
    async beimOeffnen() {
      if (beendet) return null;
      const p = await profil();
      if (!p?.benutzerId) return null;
      const s = await ladeSitzung(optionen.abruf);
      if (!s || !s.angemeldet || s.konto !== p.benutzerId || s.einwilligung !== 'erteilt') {
        ruht = true;
        return null;
      }
      ruht = false;
      return lauf();
    },
    beenden() {
      beendet = true;
      if (zeitgeber) clearTimeout(zeitgeber);
      zeitgeber = null;
    },
  };
}
