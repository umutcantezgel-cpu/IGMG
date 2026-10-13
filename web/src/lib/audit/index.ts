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
  // Eltern: Einwilligungen für ihr Kind und Passwort des Kinderzugangs (Paket O-L02-UI/H-L06)
  | 'konto.einwilligung_erteilt'
  | 'konto.einwilligung_widerrufen'
  | 'konto.kinderpasswort_gesetzt'
  | 'inhalt.angelegt'
  | 'inhalt.geaendert'
  | 'inhalt.veroeffentlicht'
  | 'inhalt.papierkorb'
  | 'inhalt.wiederhergestellt'
  | 'inhalt.geloescht'
  | 'inhalt.zur_pruefung'
  | 'inhalt.revision_wiederhergestellt'
  | 'inhalt.vorschau_erstellt'
  | 'freigabe.erteilt'
  | 'freigabe.zurueckgewiesen'
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
  // Kür A (H-K01–H-K04): Namen der Übernehmenden einer Hatim ansehen, besonderen Tag bestätigen, Newsletter versenden
  | 'hatim.namen_gelesen'
  | 'besonderer_tag.bestaetigt'
  | 'newsletter.versendet'
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
  | 'gemeindekonto.geloescht'
  // Religiöse Freigabe (ADR 0030): Verwaltung „Koran & Hadith“
  | 'religioes.eingereicht'
  | 'religioes.freigegeben'
  | 'religioes.zurueckgewiesen';

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
