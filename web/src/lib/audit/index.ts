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
  // Nacharbeit N4: Eltern-Einladung an eine Adresse außerhalb der Voranmeldung (Vier-Augen-Prinzip)
  | 'einladung.freigabe_noetig'
  | 'einladung.freigegeben'
  | 'einladung.abgelehnt'
  | 'benutzer.rollen_geaendert'
  // Vier-Augen-Prinzip für Schutzrollen (leitung, kinderschutz; S2/S3)
  | 'benutzer.rolle_beantragt'
  | 'benutzer.rolle_bestaetigt'
  | 'benutzer.rolle_abgelehnt'
  // Nacharbeit N4: Start (erste Leitung) und Entzug von Schutzrollen (auch religiöse Prüfung) im Vier-Augen-Prinzip
  | 'benutzer.leitung_start'
  | 'benutzer.rolle_entzug_beantragt'
  | 'benutzer.rolle_entzogen'
  | 'benutzer.rolle_entzug_abgelehnt'
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
  // DSFA D-16: Vorwarnung vor der Löschung eines inaktiven Kontos (Löschlauf, ohne Inhalte)
  | 'konto.inaktiv_gewarnt'
  // Eltern: Einwilligungen für ihr Kind und Passwort des Kinderzugangs (Paket O-L02-UI/H-L06)
  | 'konto.einwilligung_erteilt'
  | 'konto.einwilligung_widerrufen'
  | 'konto.kinderpasswort_gesetzt'
  // F-38 (ADR 0034 Nr. 6): tägliche Mail-Zusammenfassung ohne Inhalte bestellt, geändert oder abbestellt
  | 'konto.zusammenfassung_geaendert'
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
  // Lehrkraft: Termin fällt aus bzw. findet wieder statt (Grundlage für „Neues aus dem Unterricht“, F-38)
  | 'unterricht.termin_geaendert'
  | 'lernende.aufgenommen'
  | 'lernende.gelesen'
  | 'lernende.geaendert'
  // S2/S3: Eltern-Kind-Bezug beendet – seit N4 nur auf Antrag der Verwaltung und mit Bestätigung durch eine zweite Person
  | 'lernende.elternbezug_beenden_beantragt'
  | 'lernende.elternbezug_beendet'
  | 'lernende.elternbezug_beenden_abgelehnt'
  | 'lehrplan.geaendert'
  | 'gemeindekonto.gelesen'
  | 'gemeindekonto.rollen_geaendert'
  | 'gemeindekonto.gesperrt'
  | 'gemeindekonto.entsperrt'
  | 'gemeindekonto.geloescht'
  // Religiöse Freigabe (ADR 0030): Verwaltung „Koran & Hadith“
  | 'religioes.eingereicht'
  | 'religioes.freigegeben'
  | 'religioes.zurueckgewiesen'
  // Lern-App, Verwaltung v1 (L3-06): Prüfschritte und Pflege ohne Inhalte (PLAN §7.1)
  | 'lernapp.stichprobe_gezogen'
  | 'lernapp.geprueft'
  | 'lernapp.stichprobe_entschieden'
  | 'lernapp.pruefsprachen_geaendert'
  | 'lernapp.sprecher_angelegt'
  | 'lernapp.aufnahme_gespeichert'
  | 'lernapp.aufnahme_verworfen'
  | 'lernapp.stimme_gewaehlt'
  | 'lernapp.meldung_bearbeitet';

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
