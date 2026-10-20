import type { Abgleich, SyncErgebnis } from '../lokal/sync';
import { aktivesProfil } from '../lokal/profile';
import { meldeStand, speicher, vorhandenesProfil } from './geraet';

/**
 * Abgleich mit dem Konto aus Sicht der Oberfläche (ADR 0038 Nr. 5–7, `lokal/sync.ts`): Nur ein an ein Konto gebundenes
 * Profil gleicht ab – ohne Konto entsteht keine Anfrage, auch keine an `/api/lernapp/sitzung` (KERN 4.0 §6). Der Planer
 * (`erzeugeAbgleich`) lädt erst bei Bedarf (`import()`):
 * - Je Seitenaufruf prüft die erste Anfrage die Sitzung (`GET /api/lernapp/sitzung`): Gehört sie zu einem anderen Konto als
 *   das Profil (Kontowechsel auf einem geteilten Gerät) oder fehlt die Einwilligung, ruht der Abgleich – auch nach einer
 *   Handlung (S-L1 M-1). Der Server prüft dasselbe noch einmal (`konto` in der Anfrage, 409).
 * - `nachHandlung()` nach einer Lektion oder Einstellung (gebündelt, nie zwei Abgleiche zugleich),
 * - `beimOeffnen()` beim Öffnen einer Seite; abgeglichen wird höchstens einmal je Minute (Bremse des Servers: 30 je Minute).
 * Das Ergebnis meldet das Fenster-Ereignis `ABGLEICH_ERGEBNIS`; haben sich Ereignisse geändert, auch `STAND_GEAENDERT`.
 */

export const ABGLEICH_ERGEBNIS = 'igmg-lernapp-abgleich';
const HOECHSTENS_ALLE_MS = 60_000;

let planer: Promise<Abgleich> | null = null;

function planerHolen(): Promise<Abgleich> {
  planer ??= Promise.all([import('../lokal/sync'), speicher()]).then(([{ erzeugeAbgleich }, sp]) =>
    erzeugeAbgleich({
      speicher: sp,
      profil: () => aktivesProfil(sp),
      beiErgebnis: (e: SyncErgebnis) => {
        window.dispatchEvent(new CustomEvent<SyncErgebnis>(ABGLEICH_ERGEBNIS, { detail: e }));
        if (e.ok && (e.empfangen > 0 || e.neuAbgeleitet)) meldeStand();
      },
    }),
  );
  return planer;
}

let sitzung: Promise<boolean> | null = null;

/** Sitzung einmal je Seitenaufruf prüfen (vor dem ersten Abgleich, auch vor dem ersten `nachHandlung`). */
function sitzungEinmal(): Promise<boolean> {
  sitzung ??= planerHolen().then((p) => p.pruefeSitzung());
  return sitzung;
}

/** Nach einer Handlung abgleichen (nur mit gebundenem Profil und passender Sitzung). */
export async function nachHandlung(): Promise<void> {
  const { profil } = await vorhandenesProfil();
  if (!profil?.benutzerId || !(await sitzungEinmal())) return;
  (await planerHolen()).nachHandlung();
}

let geoeffnet = false;

/** Beim Öffnen einer Seite: Sitzung prüfen, dann abgleichen (nur mit gebundenem Profil, höchstens einmal je Minute). */
export async function beimOeffnen(jetzt = Date.now()): Promise<void> {
  if (geoeffnet) return;
  geoeffnet = true;
  const { sp, profil } = await vorhandenesProfil();
  if (!profil?.benutzerId || !(await sitzungEinmal())) return;
  const zuletzt = (await sp.lies('sync', profil.id))?.zuletzt;
  if (zuletzt && jetzt - Date.parse(zuletzt) < HOECHSTENS_ALLE_MS) return;
  await (await planerHolen()).abgleichen();
}
