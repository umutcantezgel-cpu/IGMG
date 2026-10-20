/**
 * Freigaberegeln der Lern-App (ADR 0040 Nr. 5, ADR 0041 Nr. 2/5/7/11, KERN 4.0 §2.3). Rein, ohne Datenbank: Der Aufrufer
 * lädt Baustein, Belege und Prüfungen (Tabelle `lernapp_pruefung`) samt den **aktuellen** Rollen der Prüfenden und fragt
 * hier, ob etwas sichtbar ist. Paketbau, Verwaltung und Integrationstests nutzen dieselben Funktionen.
 *
 * Bei religiösen Inhalten gilt immer die strengere Lesart:
 * - Gezählt wird je Person nur ihre jüngste religiöse Prüfung zum aktuellen Hash; „ok“ zählt nur mit der Rolle
 *   `religioese_pruefung` (die Administration ersetzt keine Prüfung), ohne Verfasserschaft und mit jedem aktuellen Beleg
 *   „am Original geprüft“.
 * - Ein „abgelehnt“, „Änderungsvorschlag“ oder „Korrektur“ einer prüfenden Person zum aktuellen Hash sperrt, bis ein neuer
 *   Stand (neuer Hash) vorliegt.
 * - Prüfungen ohne Person (gelöschtes Konto) zählen nicht.
 */

/** Stand eines Bausteins (= Enum `lernapp_status`). */
export const STATUS = ['entwurf', 'automatisch_geprueft', 'veroeffentlicht', 'gesperrt'] as const;
export type Status = (typeof STATUS)[number];

/** Urteile (= Enum `lernapp_urteil`). */
export const URTEILE = ['ok', 'korrektur', 'aenderungsvorschlag', 'abgelehnt'] as const;
export type Urteil = (typeof URTEILE)[number];

/** Art der Prüfung (= Enum `lernapp_pruef_art`). */
export const PRUEF_ARTEN = ['sprache_ziel', 'sprache_uebersetzung', 'religioes'] as const;
export type PruefArt = (typeof PRUEF_ARTEN)[number];

/** Fehlerkategorien (= Enum `lernapp_fehler`, ADR 0041 Nr. 4). */
export const FEHLER = ['bedeutung', 'grammatik', 'anstoessig', 'aussprache', 'natuerlichkeit', 'zeichensetzung'] as const;
export type Fehler = (typeof FEHLER)[number];
export const KRITISCHE_FEHLER: readonly Fehler[] = ['bedeutung', 'grammatik', 'anstoessig', 'aussprache'];

export function istKritisch(kategorie: Fehler | null | undefined): boolean {
  return kategorie != null && KRITISCHE_FEHLER.includes(kategorie);
}

/** Rolle, deren Prüfungen religiöse Freigaben sind (ADR 0040 Nr. 5). */
export const RELIGIOESE_ROLLE = 'religioese_pruefung';
/** Anzahl nötiger Freigaben verschiedener Personen (L3-E01). */
export const NOETIGE_FREIGABEN = 2;

export type BelegStand = { belegId: string; inhaltHash: string };

/** Eine Prüfung aus `lernapp_pruefung`, ergänzt um die aktuellen Rollen der prüfenden Person. */
export type Pruefung = {
  pruefendeId: string | null;
  pruefendeRollen: readonly string[];
  art: PruefArt;
  urteil: Urteil;
  inhaltHash: string;
  kategorie?: Fehler | null;
  belegeGeprueft?: readonly BelegStand[];
  am: Date;
};

/** Ein Baustein mit religiöser Freigabe: Wissen (Aussage, Beleg, Quizfrage, Tipp), Religionsbezug, Formelliste, Koran-Bedeutung. */
export type ReligioeserBaustein = {
  inhaltHash: string;
  /** Wer den aktuellen Stand verfasst hat: KI-Lauf (`ki:<lauf>`) und Konten, die Vorschläge eingearbeitet haben. */
  verfasser: readonly (string | null | undefined)[];
  /** Aktuelle Belege des Bausteins (leer, wenn er keine hat). */
  belege: readonly { id: string; inhaltHash: string }[];
  /** Aussagen brauchen mindestens einen Beleg (Quellenpflicht, ADR 0040 Nr. 4). */
  belegPflicht: boolean;
};

/** Jüngste Prüfung je Person zu genau diesem Hash und dieser Art (Personen ohne Konto fallen weg). */
function juengsteJePerson(pruefungen: readonly Pruefung[], hash: string, arten: readonly PruefArt[]): Map<string, Pruefung> {
  const je = new Map<string, Pruefung>();
  for (const p of pruefungen) {
    if (!p.pruefendeId || p.inhaltHash !== hash || !arten.includes(p.art)) continue;
    const bisher = je.get(p.pruefendeId);
    if (!bisher || p.am.getTime() >= bisher.am.getTime()) je.set(p.pruefendeId, p);
  }
  return je;
}

function alleBelegeBestaetigt(b: ReligioeserBaustein, p: Pruefung): boolean {
  const bestaetigt = new Set((p.belegeGeprueft ?? []).map((x) => `${x.belegId}|${x.inhaltHash}`));
  return b.belege.every((beleg) => bestaetigt.has(`${beleg.id}|${beleg.inhaltHash}`));
}

export type ReligioeseLage = {
  /** Personen, deren Freigabe zählt. */
  freigaben: string[];
  /** Jemand mit der Rolle hat zum aktuellen Hash abgelehnt, einen Änderungsvorschlag oder eine Korrektur gemacht. */
  gesperrt: boolean;
  /** Pflichtbeleg fehlt (Aussage ohne Beleg). */
  belegFehlt: boolean;
  geprueft: boolean;
};

/** Stand der religiösen Freigabe eines Bausteins (ADR 0040 Nr. 5, KERN 4.0 §2.3). */
export function religioeseLage(b: ReligioeserBaustein, pruefungen: readonly Pruefung[]): ReligioeseLage {
  const verfasser = new Set(b.verfasser.filter((v): v is string => Boolean(v)));
  const freigaben: string[] = [];
  let gesperrt = false;
  for (const [person, p] of juengsteJePerson(pruefungen, b.inhaltHash, ['religioes'])) {
    if (!p.pruefendeRollen.includes(RELIGIOESE_ROLLE)) continue;
    if (p.urteil !== 'ok') {
      gesperrt = true;
      continue;
    }
    if (verfasser.has(person) || !alleBelegeBestaetigt(b, p)) continue;
    freigaben.push(person);
  }
  const belegFehlt = b.belegPflicht && b.belege.length === 0;
  return { freigaben, gesperrt, belegFehlt, geprueft: !gesperrt && !belegFehlt && freigaben.length >= NOETIGE_FREIGABEN };
}

/** „geprüft“: zwei Freigaben zum aktuellen Hash von zwei verschiedenen Personen mit Rolle, keine Verfasser, Belege bestätigt. */
export function religioesGeprueft(b: ReligioeserBaustein, pruefungen: readonly Pruefung[]): boolean {
  return religioeseLage(b, pruefungen).geprueft;
}

/**
 * Lektion des Wissenskurses (bzw. jede Lektion mit religiösen Bausteinen): sichtbar nur, wenn sie Bausteine hat und
 * **alle** geprüft sind (KERN 4.0 §2.3). Eine leere Lektion ist nie sichtbar.
 */
export function lektionSichtbar(bausteineGeprueft: readonly boolean[]): boolean {
  return bausteineGeprueft.length > 0 && bausteineGeprueft.every(Boolean);
}

/** Sichtbarkeit eines Sprachkurs-Eintrags: verborgen, mit Hinweis „noch nicht von Muttersprachlern geprüft“ oder ohne. */
export type Sichtbarkeit = 'verborgen' | 'mit_hinweis' | 'sichtbar';

export type SprachEintrag = {
  status: Status;
  inhaltHash: string;
  /** Religiöse Formel oder Begriff: braucht die zwei religiösen Freigaben (ADR 0041 Nr. 11). */
  religionsbezug: boolean;
  /** Nur bei `religionsbezug`: Verfasser und Belege für die religiöse Freigabe. */
  verfasser?: readonly (string | null | undefined)[];
};

export type SprachOptionen = {
  /** Schalter `lernapp_ungeprueft`: Einträge ohne bestandene Stichprobe mit Hinweis zeigen (ADR 0041 Nr. 8). */
  ungeprueftZeigen: boolean;
};

/** Gibt es zum aktuellen Hash eine Sprachprüfung mit „abgelehnt“ oder einem kritischen Fehler? Dann nie sichtbar. */
export function sprachlichGesperrt(inhaltHash: string, pruefungen: readonly Pruefung[]): boolean {
  return pruefungen.some(
    (p) =>
      p.inhaltHash === inhaltHash &&
      (p.art === 'sprache_ziel' || p.art === 'sprache_uebersetzung') &&
      (p.urteil === 'abgelehnt' || istKritisch(p.kategorie)),
  );
}

/**
 * Sichtbarkeit eines Sprachkurs-Eintrags (ADR 0041 Nr. 2, 8, 11):
 * - `entwurf` und `gesperrt` nie; „abgelehnt“ oder kritischer Fehler zum aktuellen Hash nie.
 * - `religionsbezug` nur mit zwei religiösen Freigaben – unabhängig von Status und Schalter `lernapp_ungeprueft`.
 * - `automatisch_geprueft` nur mit dem Schalter und dann mit Hinweis; `veroeffentlicht` ohne Hinweis.
 */
export function sprachSichtbarkeit(e: SprachEintrag, pruefungen: readonly Pruefung[], o: SprachOptionen): Sichtbarkeit {
  if (e.status === 'entwurf' || e.status === 'gesperrt') return 'verborgen';
  if (sprachlichGesperrt(e.inhaltHash, pruefungen)) return 'verborgen';
  if (
    e.religionsbezug &&
    !religioesGeprueft({ inhaltHash: e.inhaltHash, verfasser: e.verfasser ?? [], belege: [], belegPflicht: false }, pruefungen)
  )
    return 'verborgen';
  if (e.status === 'automatisch_geprueft') return o.ungeprueftZeigen ? 'mit_hinweis' : 'verborgen';
  return 'sichtbar';
}

/**
 * Sichtbarkeit eines Wissensbausteins: zurückgezogen (`gesperrt`) nie, sonst nur „geprüft“ (ADR 0040 Nr. 5). Der Schalter
 * `lernapp_ungeprueft` gilt hier nicht.
 */
export function wissenSichtbar(status: Status, b: ReligioeserBaustein, pruefungen: readonly Pruefung[]): boolean {
  return status !== 'gesperrt' && religioesGeprueft(b, pruefungen);
}

/**
 * Annahmeregel der Stichprobe (ADR 0041 Nr. 5): 0 kritische und höchstens 2 leichte Fehler je 20 geprüfte Einträge,
 * anteilig gerechnet (ganzzahlig: leicht × 20 ≤ 2 × geprüft). Ohne geprüfte Einträge kein Urteil.
 */
export function stichprobeBestanden(e: { geprueft: number; kritisch: number; leicht: number }): boolean {
  return e.geprueft > 0 && e.kritisch === 0 && e.leicht * 20 <= 2 * e.geprueft;
}

/**
 * Änderung nach Bestehen (ADR 0041 Nr. 7): Eine geänderte Einheit behält „bestanden“, wenn weniger als 10 % der Einträge
 * geändert sind und jeder geänderte Eintrag einzeln geprüft ist; sonst wird neu gezogen.
 */
export function bestandenBleibt(gesamt: number, geaendert: readonly { einzelnGeprueft: boolean }[]): boolean {
  return gesamt > 0 && geaendert.length * 10 < gesamt && geaendert.every((g) => g.einzelnGeprueft);
}
