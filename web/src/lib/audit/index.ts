import 'server-only';
import { db, schema } from '@/lib/db';

/**
 * Audit-Log (G-07, S5). Jeder Zugriff auf Personendaten und jede Änderung in der Verwaltung
 * schreibt einen Eintrag. `details` darf KEINE Personendaten enthalten (nur IDs, Zähler, Feldnamen).
 */
export type AuditAktion =
  | 'anmeldung.erfolg'
  | 'anmeldung.fehlgeschlagen'
  | 'abmeldung'
  | 'zwei_faktor.eingerichtet'
  | 'einladung.erstellt'
  | 'einladung.angenommen'
  | 'einladung.widerrufen'
  | 'benutzer.rollen_geaendert'
  | 'benutzer.gesperrt'
  | 'benutzer.entsperrt'
  | 'benutzer.zwei_faktor_zurueckgesetzt'
  | 'benutzer.geloescht'
  | 'benutzer.gelesen'
  | 'konto.passwort_geaendert'
  | 'konto.passwort_zurueckgesetzt'
  | 'konto.ersatzcodes_erzeugt'
  // Gemeinde-Konten und Mein Bereich (ADR 0026)
  | 'konto.registriert'
  | 'konto.bestaetigt'
  | 'konto.profil_geaendert'
  | 'konto.zwei_faktor_abgeschaltet'
  | 'konto.passkey_angelegt'
  | 'konto.passkey_entfernt'
  | 'konto.sitzungen_beendet'
  | 'konto.daten_exportiert'
  | 'konto.loeschantrag'
  | 'konto.kinderkonto_angelegt'
  | 'inhalt.angelegt'
  | 'inhalt.geaendert'
  | 'inhalt.veroeffentlicht'
  | 'inhalt.papierkorb'
  | 'inhalt.wiederhergestellt'
  | 'inhalt.geloescht'
  | 'eingang.angelegt'
  | 'eingang.gelesen'
  | 'eingang.status'
  | 'eingang.notiz'
  | 'eingang.exportiert'
  | 'eingang.geloescht'
  | 'eingang.frist_geloescht'
  | 'medium.hochgeladen'
  | 'medium.geloescht'
  | 'gebetszeiten.importiert'
  | 'gebetszeiten.import_entfernt'
  | 'gebetszeiten.einstellung'
  | 'einstellung.geaendert'
  | 'ticket.angelegt'
  | 'ticket.geaendert'
  | 'ticket.kommentiert'
  | 'ticket.gelesen'
  | 'postfach.gesendet'
  | 'chat.gemeldet'
  | 'chat.meldung_bearbeitet'
  | 'chat.notfallpause'
  | 'chat.notfallpause_aufgehoben'
  // Verwaltung Lernen und Aufnahme (O-L01, H-L01…L05)
  | 'gruppe.angelegt'
  | 'gruppe.geaendert'
  | 'gruppe.leitung'
  | 'gruppe.mitglieder'
  | 'gruppe.termine'
  | 'lernende.aufgenommen'
  | 'lernende.gelesen'
  | 'lernende.geaendert'
  | 'lehrplan.geaendert'
  | 'gemeindekonto.gelesen'
  | 'gemeindekonto.rollen_geaendert'
  | 'gemeindekonto.gesperrt'
  | 'gemeindekonto.entsperrt'
  | 'gemeindekonto.geloescht';

export type AuditDetails = Record<string, string | number | boolean | null>;

export type AuditEintrag = {
  benutzerId: string | null;
  aktion: AuditAktion;
  zielTyp?: string;
  zielId?: string;
  details?: AuditDetails;
};

/** Schreibt einen Audit-Eintrag. Fehler beim Schreiben brechen die Aktion ab (lieber kein Zugriff als ein unprotokollierter). */
export async function protokolliere(eintrag: AuditEintrag, tx: Pick<typeof db, 'insert'> = db): Promise<void> {
  await tx.insert(schema.auditEintrag).values({
    benutzerId: eintrag.benutzerId,
    aktion: eintrag.aktion,
    zielTyp: eintrag.zielTyp ?? null,
    zielId: eintrag.zielId ?? null,
    details: eintrag.details ?? null,
  });
}
