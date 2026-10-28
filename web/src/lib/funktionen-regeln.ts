import { betriebsart, type UmgebungsWerte } from '@/lib/umgebung';
import type { FunktionenEinstellung } from '@/lib/validierung/einstellungen';

/**
 * Reine Regeln der Funktionsschalter (ADR 0035) ohne Datenbank und ohne `server-only`: Liste, Standard je Betriebsart
 * und Vorrang Umgebung → Einstellung → Standard. Genutzt von `funktionen.ts`, dem Startklar-Cockpit und `pnpm startklar`.
 */
export const FUNKTIONEN = [
  'konten',
  'lernplattform',
  'chat',
  'echtzeit',
  'push',
  'push_gebet',
  'hatim',
  'newsletter',
  'hadith_gesamt',
  'ramadan_vorschau',
  // Marktstart IGMG (ADR 0047): religiöse Erklärtexte der Website als gekennzeichneter „Entwurf zur Prüfung“
  'website_wissen_vorschau',
  // Lauf Lern-App (ADR 0035, KERN 4.0 §6): ausgeschaltet heißt 404 und die Links verschwinden
  'lernapp',
  'lernapp_ungeprueft',
  'lernapp_wissen_vorschau',
  'lernapp_sprechen',
  'lernapp_meldungen',
  'lernapp_sync',
  'lernapp_gruppen',
  'lernapp_rangliste',
  'lernapp_statistik',
  'push_lernapp',
] as const satisfies readonly (keyof FunktionenEinstellung)[];
export type Funktion = (typeof FUNKTIONEN)[number];

/**
 * Ohne Personendaten und für die Produktion freigegeben – dort standardmäßig an. `hadith_gesamt`: Entscheidung des
 * Nutzers vom 13.10.2026 (gemeinfreie Quelle, Restrisiko der offenen Rechtsprüfung MN-06 trägt die Gemeinde).
 * Lern-App (KERN 4.0 §6): `lernapp_ungeprueft` (Hinweis statt Sperre, ADR 0041 Nr. 8) und `lernapp_meldungen` (anonym,
 * nur Kategorien). Sie wirken erst, wenn `lernapp` selbst an ist (`VORAUSSETZUNGEN`). `lernapp` (ohne Personendaten, Fortschritt
 * nur auf dem Gerät) ist an: Entscheidung des Nutzers vom 21.10.2026 („Die App ist ein Teil der Seite!“, „ich erlaube dir
 * alles“, `_lernapp/ENTSCHEIDUNGEN.md` L3-E12b, ADR 0035 „Fortschreibung Lern-App 2“); Abgleich, Gruppen, Bestenliste und
 * Statistik bleiben aus (`MIT_PERSONENDATEN`).
 * `lernapp_wissen_vorschau` (Wissenskurs als deutlich gekennzeichneter, ungeprüfter Entwurf auf der Test-Domain, ohne
 * Personendaten): Entscheidung des Nutzers vom 27.10.2026 (`_lernapp/ENTSCHEIDUNGEN.md` L3-E22). Vor dem öffentlichen Start
 * ausschalten (`FUNKTION_LERNAPP_WISSEN_VORSCHAU=aus`) – dann gilt wieder allein die Sperre bis zu zwei Freigaben; das
 * Startklar-Cockpit warnt, solange sie in der Produktion an ist.
 * `website_wissen_vorschau` (Wissensthemen der Website „zur Prüfung“ als deutlich gekennzeichneter „Entwurf zur Prüfung –
 * noch nicht vom Imam geprüft“, `noindex`, ohne Personendaten, ohne Voraussetzung): Entscheidung des Nutzers vom 27./28.10.2026
 * (E-044 Nr. 5, ADR 0047) – in allen Betriebsarten an. Abschalten mit `FUNKTION_WEBSITE_WISSEN_VORSCHAU=aus` (Umgebung) oder
 * der Einstellung „funktionen“; dann ist wieder allein „geprüft“ öffentlich (ADR 0030 Nr. 2).
 */
export const IN_PRODUKTION_AN: readonly Funktion[] = [
  'hadith_gesamt',
  'website_wissen_vorschau',
  'lernapp',
  'lernapp_ungeprueft',
  'lernapp_wissen_vorschau',
  'lernapp_meldungen',
];

/** Standard: in Entwicklung und Vorschau an (Vorführung), in der Produktion aus – außer `IN_PRODUKTION_AN`. */
export function standardFuer(env: UmgebungsWerte, f?: Funktion): boolean {
  if (f && IN_PRODUKTION_AN.includes(f)) return true;
  return betriebsart(env) !== 'produktion';
}

/** Wert aus der Umgebung (`FUNKTION_CHAT=an`), sonst undefined. */
export function umgebungsSchalter(f: Funktion, env: UmgebungsWerte): boolean | undefined {
  const wert = env[`FUNKTION_${f.toUpperCase()}`]?.trim().toLowerCase();
  if (wert === 'an' || wert === 'true' || wert === '1') return true;
  if (wert === 'aus' || wert === 'false' || wert === '0') return false;
  return undefined;
}

/** Reine Entscheidung (unit-testbar): Umgebung → Einstellung → Standard. */
export function entscheide(f: Funktion, env: UmgebungsWerte, einstellung: FunktionenEinstellung | null): boolean {
  const ausUmgebung = umgebungsSchalter(f, env);
  if (ausUmgebung !== undefined) return ausUmgebung;
  const ausEinstellung = einstellung?.[f];
  if (ausEinstellung !== undefined) return ausEinstellung;
  return standardFuer(env, f);
}

/**
 * Funktionen mit Personendaten: in der Produktion erst nach Freigabe durch Menschen (MN-10, MN-11, MN-17; Lern-App LM-08,
 * LM-10). `lernapp_statistik` zählt dazu (IP-Adresse grenzwertig, Entscheidung der DSB).
 */
export const MIT_PERSONENDATEN = [
  'konten',
  'lernplattform',
  'chat',
  'echtzeit',
  'push',
  'push_gebet',
  'hatim',
  'newsletter',
  'lernapp_sync',
  'lernapp_gruppen',
  'lernapp_rangliste',
  'lernapp_statistik',
  'push_lernapp',
] as const satisfies readonly Funktion[];

/**
 * Sperren (KERN 4.0 §6, „Sperre im Cockpit“): Ein Schalter wirkt nur, wenn alle seine Voraussetzungen wirken. Jeder
 * Schalter der Lern-App braucht `lernapp`; der Abgleich braucht Konten, Gruppen die Lernplattform und Konten (S-L2 H-2:
 * Schreib- und Gruppenrouten nie ohne Konten), die Bestenliste die Gruppen, die Lern-Erinnerung den Web-Push. Das Cockpit
 * meldet Schalter, die an sind, aber gesperrt bleiben.
 */
export const VORAUSSETZUNGEN: Partial<Record<Funktion, readonly Funktion[]>> = {
  lernapp_ungeprueft: ['lernapp'],
  lernapp_wissen_vorschau: ['lernapp'],
  lernapp_sprechen: ['lernapp'],
  lernapp_meldungen: ['lernapp'],
  lernapp_sync: ['lernapp', 'konten'],
  lernapp_gruppen: ['lernapp', 'lernplattform', 'konten'],
  lernapp_rangliste: ['lernapp', 'lernapp_gruppen'],
  lernapp_statistik: ['lernapp'],
  push_lernapp: ['lernapp', 'push'],
};

/**
 * Wirksamer Schalter (unit-testbar): selbst an (`entscheide`) und alle Voraussetzungen wirksam, rekursiv. Für Schalter
 * ohne Voraussetzungen gleich `entscheide`.
 */
export function entscheideWirksam(
  f: Funktion,
  env: UmgebungsWerte,
  einstellung: FunktionenEinstellung | null,
  besucht: ReadonlySet<Funktion> = new Set(),
): boolean {
  if (besucht.has(f) || !entscheide(f, env, einstellung)) return false;
  const weiter = new Set([...besucht, f]);
  return (VORAUSSETZUNGEN[f] ?? []).every((v) => entscheideWirksam(v, env, einstellung, weiter));
}

/** Voraussetzungen, die einem eingeschalteten Schalter fehlen (leer, wenn er wirkt oder aus ist). */
export function fehlendeVoraussetzungen(f: Funktion, env: UmgebungsWerte, einstellung: FunktionenEinstellung | null): Funktion[] {
  if (!entscheide(f, env, einstellung)) return [];
  return (VORAUSSETZUNGEN[f] ?? []).filter((v) => !entscheideWirksam(v, env, einstellung));
}
