import { kiHerkunftVerboten } from '../religioes/freigabe';

/**
 * Freigaberegeln der Lern-App (ADR 0040 Nr. 5, ADR 0041 Nr. 2/5/7/11, KERN 4.0 §2.3). Rein, ohne Datenbank: Der Aufrufer
 * lädt Baustein, Belege und Prüfungen (Tabelle `lernapp_pruefung`) samt den **aktuellen** Rollen der Prüfenden und fragt
 * hier, ob etwas sichtbar ist. Paketbau, Verwaltung und Integrationstests nutzen dieselben Funktionen.
 *
 * Bei religiösen Inhalten gilt immer die strengere Lesart:
 * - Gezählt wird je Person nur ihre jüngste religiöse Prüfung zum aktuellen Hash; „ok“ zählt nur mit der Rolle
 *   `religioese_pruefung` (die Administration ersetzt keine Prüfung), ohne Verfasserschaft und mit jedem aktuellen Beleg
 *   „am Original geprüft“.
 * - Ein Konto, das (auch) die Rolle `administration` trägt, zählt nie als Freigabe (Stufe C N2, Z-L02: sonst erzeugte die
 *   Administration über zwei eigene Konten mit beiden Rollen die Freigaben allein; beide Rollen zusammen vergibt „Benutzer
 *   und Rollen“ nicht mehr, `rechte/schutzrollen.ts`). Sein Einwand sperrt aber weiter (fail closed, Gegenprüfung N2):
 *   Neue Urteile solcher Konten nimmt `pruefeUrteil` nicht an, ein gespeichertes „abgelehnt“ aus dem Altbestand bleibt wirksam.
 * - Ein „abgelehnt“, „Änderungsvorschlag“ oder „Korrektur“ einer Person mit der Rolle `religioese_pruefung` zum aktuellen
 *   Hash sperrt, bis ein neuer Stand (neuer Hash) vorliegt.
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
/** Rolle, mit der eine Prüfung nie religiös zählt – auch nicht zusammen mit {@link RELIGIOESE_ROLLE} (Stufe C N2). */
export const NIE_RELIGIOES = 'administration';

/** Zählt das Urteil einer Person mit diesen Rollen religiös? Nur mit der Rolle und ohne Administration. */
export function zaehltReligioes(rollen: readonly string[]): boolean {
  return rollen.includes(RELIGIOESE_ROLLE) && !rollen.includes(NIE_RELIGIOES);
}
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
  /**
   * Art des Bausteins (`aussage`, `aufgabe`, `lektion`, `koran_bedeutung`, …). Bei Arten, die nur Menschen verfassen
   * (KI-Regel 2: Koran-Bedeutungen, Wurzeln, Tajwid, Vers- und Hadith-Übersetzungen), macht eine KI-Herkunft den Baustein
   * unfreigebbar (`religioes/freigabe.ts` `kiHerkunftVerboten`).
   */
  art?: string;
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
  /** Jemand mit der Rolle (auch mit Administration) hat zum aktuellen Hash abgelehnt, geändert oder korrigiert. */
  gesperrt: boolean;
  /** Pflichtbeleg fehlt (Aussage ohne Beleg). */
  belegFehlt: boolean;
  /** KI-Regel 2: Der Baustein darf nicht von einer KI stammen, tut es aber nach seinen Verfassern – nie freigebbar. */
  kiHerkunft: boolean;
  geprueft: boolean;
};

/** Stand der religiösen Freigabe eines Bausteins (ADR 0040 Nr. 5, KERN 4.0 §2.3). */
export function religioeseLage(b: ReligioeserBaustein, pruefungen: readonly Pruefung[]): ReligioeseLage {
  const verfasser = new Set(b.verfasser.filter((v): v is string => Boolean(v)));
  const freigaben: string[] = [];
  let gesperrt = false;
  for (const [person, p] of juengsteJePerson(pruefungen, b.inhaltHash, ['religioes'])) {
    if (!p.pruefendeRollen.includes(RELIGIOESE_ROLLE)) continue;
    // Einwand jeder Person mit der Rolle sperrt – auch mit Administration (strengere Lesart)
    if (p.urteil !== 'ok') {
      gesperrt = true;
      continue;
    }
    if (!zaehltReligioes(p.pruefendeRollen) || verfasser.has(person) || !alleBelegeBestaetigt(b, p)) continue;
    freigaben.push(person);
  }
  const belegFehlt = b.belegPflicht && b.belege.length === 0;
  const kiHerkunft = b.art !== undefined && kiHerkunftVerboten(b.art, b.verfasser);
  return {
    freigaben,
    gesperrt,
    belegFehlt,
    kiHerkunft,
    geprueft: !gesperrt && !belegFehlt && !kiHerkunft && freigaben.length >= NOETIGE_FREIGABEN,
  };
}

/**
 * „geprüft“: zwei Freigaben zum aktuellen Hash von zwei verschiedenen Personen mit Rolle (ohne Administration), keine
 * Verfasser, Belege bestätigt.
 */
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
  /**
   * Formelliste freigegeben (KERN 4.0 §2.3 „Formelliste“, LM-09; `formelliste.ts` `formellisteFrei`): zwei religiöse
   * Freigaben zum aktuellen Stand der Liste und Status „freigegeben“ im Leitfaden. Fehlt die Angabe, gilt sie als gesperrt.
   */
  formellisteFrei?: boolean;
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
 * - `religionsbezug` nur mit zwei religiösen Freigaben **und** freigegebener Formelliste – unabhängig von Status und
 *   Schalter `lernapp_ungeprueft`. Die Formelliste gilt für jeden gekennzeichneten Eintrag (Stufe C N2, Z-L10), nicht nur
 *   für Formeln: Ob ein gekennzeichneter Eintrag eine Formel (F-Kandidat) oder nur ein Ort bzw. Termin (R-Kandidat) ist,
 *   weiß diese Regel nicht, also die strengere Lesart. Lateinische Formel-Kandidaten ohne Kennzeichen setzt der Paketbau
 *   selbst auf `religionsbezug` (`paket/bauen.ts`, `formelkandidat.ts`).
 * - `automatisch_geprueft` nur mit dem Schalter und dann mit Hinweis; `veroeffentlicht` ohne Hinweis.
 */
export function sprachSichtbarkeit(e: SprachEintrag, pruefungen: readonly Pruefung[], o: SprachOptionen): Sichtbarkeit {
  if (e.status === 'entwurf' || e.status === 'gesperrt') return 'verborgen';
  if (sprachlichGesperrt(e.inhaltHash, pruefungen)) return 'verborgen';
  if (
    e.religionsbezug &&
    (o.formellisteFrei !== true ||
      !religioesGeprueft({ inhaltHash: e.inhaltHash, verfasser: e.verfasser ?? [], belege: [], belegPflicht: false }, pruefungen))
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

/** Ein Baustein mit religiöser Freigabe samt Stand und Prüfungen (Paketbau, Verwaltung, Tests). */
export type FreigabeBaustein = { status: Status; baustein: ReligioeserBaustein; pruefungen: readonly Pruefung[] };

const sichtbar = (b: FreigabeBaustein) => wissenSichtbar(b.status, b.baustein, b.pruefungen);

/**
 * Aufgabe des Wissenskurses (L2-03: `wahr_falsch`, `zuordnen`, `reihenfolge`, `fallfrage`; ebenso `auswahl` und `luecke` im
 * Wissenskurs): sichtbar nur, wenn sie selbst geprüft ist **und** jede Aussage, aus der sie entsteht – mindestens eine
 * (ADR 0040 Nr. 2.2: Quizfragen nur aus Aussagen; Nr. 5: zwei Freigaben je Baustein, auch für die Quizfrage).
 */
export function wissensAufgabeSichtbar(aufgabe: FreigabeBaustein, aussagen: readonly FreigabeBaustein[]): boolean {
  return aussagen.length > 0 && sichtbar(aufgabe) && aussagen.every(sichtbar);
}

/**
 * Freigabelage einer Aufgabe `koran_wort` (ADR 0040 Nr. 5 „Koran-Arabisch“, LM-13, LM-31): Bedeutungen kommen aus
 * `quran_wortbedeutung` und brauchen je zwei Freigaben zum aktuellen Stand – auch die Ablenker, denn sie werden ebenso
 * gezeigt. Wurzeln kommen aus der eigenen Wurzeltabelle, die als Ganze zwei Freigaben braucht. Die Wortform selbst stammt
 * aus den gepinnten Daten (`web/daten`) und hat keine eigene Freigabe.
 */
export type KoranWortFreigabe =
  | { anweisung: 'waehleBedeutung'; bedeutungen: readonly FreigabeBaustein[] }
  | { anweisung: 'waehleWurzel'; wurzeltabelle: FreigabeBaustein | null };

/** Aufgabe `koran_wort`: sichtbar nur mit allen Freigaben nach `KoranWortFreigabe` (mindestens zwei Bedeutungen). */
export function koranWortSichtbar(f: KoranWortFreigabe): boolean {
  if (f.anweisung === 'waehleWurzel') return f.wurzeltabelle !== null && sichtbar(f.wurzeltabelle);
  return f.bedeutungen.length >= 2 && f.bedeutungen.every(sichtbar);
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

// ——— Zwei-Prüfer-Oberfläche (L6-02/03, ADR 0040 Nr. 5, PLAN §6.7 Nr. 5–6) ———

/**
 * Bausteine mit religiöser Zwei-Prüfer-Freigabe in der Verwaltung (Werte von `lernapp_inhalt_typ`); `formelliste` ist die
 * Liste erlaubter Alltagsformeln als Ganzes (KERN 4.0 §2.3, LM-09; `formelliste.ts`).
 */
export const RELIGIOESE_BAUSTEINE = ['aussage', 'aufgabe', 'lektion', 'koran_bedeutung', 'formelliste'] as const;
export type ReligioeserBausteinTyp = (typeof RELIGIOESE_BAUSTEINE)[number];

export function istReligioeserBaustein(wert: unknown): wert is ReligioeserBausteinTyp {
  return typeof wert === 'string' && (RELIGIOESE_BAUSTEINE as readonly string[]).includes(wert);
}

/** Urteile der religiösen Prüfung (ADR 0040 Nr. 5); `korrektur` gehört nur zur Sprachprüfung. */
export const RELIGIOESE_URTEILE = ['ok', 'aenderungsvorschlag', 'abgelehnt'] as const;
export type ReligioesesUrteil = (typeof RELIGIOESE_URTEILE)[number];

/** Anzeige „n/2“: gezählte Freigaben zum aktuellen Hash, höchstens {@link NOETIGE_FREIGABEN}. */
export function freigabeStand(lage: Pick<ReligioeseLage, 'freigaben'>): number {
  return Math.min(lage.freigaben.length, NOETIGE_FREIGABEN);
}

/** Jüngstes religiöses Urteil einer Person zum aktuellen Hash (oder null). */
export function eigenesUrteil(person: string, hash: string, pruefungen: readonly Pruefung[]): Urteil | null {
  return juengsteJePerson(pruefungen, hash, ['religioes']).get(person)?.urteil ?? null;
}

export type UrteilsAntrag = {
  pruefendeId: string;
  /** Aktuelle Rollen der Person (Administration allein zählt nicht) */
  pruefendeRollen: readonly string[];
  baustein: ReligioeserBaustein;
  /** Hash, den die Person gesehen hat – muss der aktuelle sein */
  gesehenerHash: string;
  urteil: ReligioesesUrteil;
  /**
   * Belege, für die „Quelle geprüft, Aussage stimmt nach hanefitischer Lehre“ angekreuzt ist – je Haken Kennung und Hash der
   * gesehenen Fassung ({@link belegHaken}); ein Haken zu einer älteren Fassung des Belegs zählt nicht
   */
  belegeBestaetigt: readonly string[];
  /** Häkchen „Inhalt geprüft, stimmt nach hanefitischer Lehre“ – Pflicht für „ok“ bei Bausteinen ohne Belege */
  inhaltBestaetigt: boolean;
};

/** Wert des Hakens je Beleg: Kennung und Hash der Fassung, die die Person gesehen hat (`<id>|<hash>`). */
export function belegHaken(b: { id: string; inhaltHash: string }): string {
  return `${b.id}|${b.inhaltHash}`;
}

export type UrteilsFehler =
  | 'keineRolle'
  | 'administration'
  | 'veraltet'
  | 'verfasser'
  | 'kiHerkunft'
  | 'belegFehlt'
  | 'belegeBestaetigen'
  | 'inhaltBestaetigen'
  | 'schonFreigegeben';

/**
 * Darf diese Person dieses Urteil abgeben (ADR 0040 Nr. 5, KERN 4.0 §2.3)? `null` = ja. Regeln:
 * - nur mit der Rolle `religioese_pruefung` (die Administration ersetzt keine Prüfung) und nie von einem Konto, das auch
 *   die Rolle `administration` trägt (Stufe C N2);
 * - nur zum aktuellen Hash (hat sich der Inhalt seit dem Öffnen geändert, gilt das Urteil nicht);
 * - wer den aktuellen Stand verfasst hat (KI-Lauf oder Redaktion), prüft ihn nicht – Vier-Augen-Prinzip je Freigabe;
 * - „ok“ nur, wenn KI-Regel 2 nicht verletzt ist, ein Pflichtbeleg vorhanden ist, jeder aktuelle Beleg ausdrücklich bestätigt
 *   ist („Quelle geprüft, Aussage stimmt nach hanefitischer Lehre“; ohne Belege der Inhalt selbst), und nicht ein zweites Mal
 *   von derselben Person zum selben Hash (zwei verschiedene Personen).
 */
export function pruefeUrteil(a: UrteilsAntrag, pruefungen: readonly Pruefung[]): UrteilsFehler | null {
  if (!a.pruefendeRollen.includes(RELIGIOESE_ROLLE)) return 'keineRolle';
  if (!zaehltReligioes(a.pruefendeRollen)) return 'administration';
  if (a.gesehenerHash !== a.baustein.inhaltHash) return 'veraltet';
  if (a.baustein.verfasser.some((v) => v === a.pruefendeId)) return 'verfasser';
  if (a.urteil !== 'ok') return null;
  if (a.baustein.art !== undefined && kiHerkunftVerboten(a.baustein.art, a.baustein.verfasser)) return 'kiHerkunft';
  if (a.baustein.belegPflicht && a.baustein.belege.length === 0) return 'belegFehlt';
  const bestaetigt = new Set(a.belegeBestaetigt);
  if (!a.baustein.belege.every((b) => bestaetigt.has(belegHaken(b)))) return 'belegeBestaetigen';
  if (a.baustein.belege.length === 0 && !a.inhaltBestaetigt) return 'inhaltBestaetigen';
  if (eigenesUrteil(a.pruefendeId, a.baustein.inhaltHash, pruefungen) === 'ok') return 'schonFreigegeben';
  return null;
}

/**
 * Belegprüfung durch einen frischen Agenten (PLAN §6.7 Nr. 5, ADR 0040 Nr. 2.3): `belegt`, `teilweise` oder `nicht_belegt`
 * je Beleg und dessen Hash. Sie ersetzt keine Freigabe und ordnet nur die Warteschlange. Abgelegt in `lernapp_pruefung` als
 * Zeile ohne Person (`inhaltTyp` `beleg`, Art `religioes`; `ok` = belegt, `aenderungsvorschlag` = teilweise, `abgelehnt` =
 * nicht belegt) – Prüfungen ohne Person zählen nie als Freigabe.
 */
export type Belegpruefung = { belegId: string; inhaltHash: string; ergebnis: 'belegt' | 'teilweise' | 'nicht_belegt' };

export function belegpruefungErgebnis(urteil: Urteil): Belegpruefung['ergebnis'] {
  return urteil === 'ok' ? 'belegt' : urteil === 'abgelehnt' ? 'nicht_belegt' : 'teilweise';
}

/** „unsicher“: Die Belegprüfung hält einen aktuellen Beleg für nur teilweise oder nicht belegt. */
export function belegeUnsicher(belege: readonly { id: string; inhaltHash: string }[], pruefungen: readonly Belegpruefung[]): boolean {
  return belege.some((b) => pruefungen.some((p) => p.belegId === b.id && p.inhaltHash === b.inhaltHash && p.ergebnis !== 'belegt'));
}

export type WarteschlangenPlatz = {
  schluessel: string;
  /** Belegprüfung „teilweise“ oder „nicht belegt“ */
  unsicher: boolean;
  /** gezählte Freigaben (0 oder 1) */
  stand: number;
  /** Die angemeldete Person hat zum aktuellen Hash schon geurteilt bzw. ist Verfasser */
  erledigt: boolean;
};

/**
 * Reihenfolge der Warteschlange: „unsicher“ zuerst (Belegprüfung), dann was die Person noch prüfen kann, dabei 1/2 vor 0/2
 * (die zweite Freigabe schließt einen Baustein ab), sonst nach Schlüssel (Lehrplan-Reihenfolge).
 */
export function ordneWarteschlange<T extends WarteschlangenPlatz>(liste: readonly T[]): T[] {
  return [...liste].sort(
    (a, b) =>
      Number(b.unsicher) - Number(a.unsicher) ||
      Number(a.erledigt) - Number(b.erledigt) ||
      b.stand - a.stand ||
      (a.schluessel < b.schluessel ? -1 : a.schluessel > b.schluessel ? 1 : 0),
  );
}
