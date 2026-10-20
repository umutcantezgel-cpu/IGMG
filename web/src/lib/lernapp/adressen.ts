import type { Oberflaeche } from './kurse';

/**
 * Adressen der Lern-App (ADR 0037 Nr. 1). Rein, auch im Client nutzbar. Links in der Lern-App sind einfache `<a>`:
 * Übungsseiten brauchen ein eigenes Dokument (Mikrofon je Pfad, PFAD_BERECHTIGUNGEN), und der Service Worker hält nur
 * ganze Seiten vor.
 */
export function lernAdresse(ui: Oberflaeche, ...teile: string[]): string {
  return ['/lern-app', ui, ...teile.filter(Boolean)].join('/');
}

const LERN_APP_PFAD = /^\/lern-app\/(?:de|tr|ar)(?:\/[a-z0-9-]+)*$/;

/**
 * Ist der Pfad (ohne Suchteil) ein Ziel in der Lern-App, zu dem man nach der Anmeldung zurückkehren darf? Nur
 * Oberflächen de/tr/ar und Segmente aus Kleinbuchstaben, Ziffern und Bindestrich; nie die Anmeldung selbst.
 */
export function istLernAppZiel(pfad: string): boolean {
  return LERN_APP_PFAD.test(pfad) && !/^\/lern-app\/[a-z]{2}\/anmelden(?:\/|$)/.test(pfad);
}

/** Oberflächensprache eines Lern-App-Pfads (`/lern-app/tr/…` → `tr`), sonst null. */
export function oberflaecheVon(pfad: string): Oberflaeche | null {
  const m = /^\/lern-app\/(de|tr|ar)(?:[/?]|$)/.exec(pfad);
  return m ? (m[1] as Oberflaeche) : null;
}
