import 'server-only';
import nachrichten from '../../../messages/bereiche/benachrichtigungen.json';
import { sha256 } from '@/lib/krypto';

/**
 * Einwilligung in Web Push (ADR 0034; DSFA D-15, D-17). Der Wortlaut nennt alle zugelassenen Push-Dienste
 * (Google, Mozilla, Apple, Microsoft – siehe `DIENSTE` in `senden.ts`), das Drittland und die Verknüpfung mit dem
 * Konto. Die Version ist der SHA-256 genau des Texts, den die Person in **ihrer** Sprache gesehen hat (D-15) –
 * Erwachsene und Kinder (Du-Form) haben je eigene Fassungen. Ändert sich ein Wortlaut, ändert sich seine Version:
 * Abos mit einer alten Version bekommen keine Nachrichten mehr, bis die Person den neuen Text bestätigt (D-17).
 */
export type PushSprache = 'de' | 'tr' | 'en';
const SPRACHEN: readonly PushSprache[] = ['de', 'tr', 'en'];

/** Version des Einwilligungstexts (SHA-256 über den angezeigten Wortlaut, gekürzt). */
export function einwilligungsVersion(text: string): string {
  return `push-${sha256(text).slice(0, 16)}`;
}

/** Wortlaut der Einwilligung, den die Person sieht: Sprache des Abos, Kinderkonten in Du-Form. */
export function pushEinwilligungsText(sprache: PushSprache, kind: boolean): string {
  const t = nachrichten[sprache].push;
  return kind ? t.kind.einwilligung : t.einwilligung;
}

export function pushEinwilligungsVersion(sprache: PushSprache, kind: boolean): string {
  return einwilligungsVersion(pushEinwilligungsText(sprache, kind));
}

/** Alle Versionen der aktuellen Wortlaute (drei Sprachen × Erwachsene/Kinder). Nur Abos mit einer davon bekommen Push. */
export function gueltigePushVersionen(): string[] {
  return SPRACHEN.flatMap((s) => [pushEinwilligungsVersion(s, false), pushEinwilligungsVersion(s, true)]);
}
