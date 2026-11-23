'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { VORFUEHRUNG_COOKIE, pruefeTestzugang } from '@/lib/vorfuehrung/konten';
import { vorfuehrung } from '@/lib/vorfuehrung/modus';

/** Zwölf Stunden: lang genug für eine Vorstellung, danach meldet man sich neu an. */
const DAUER_SEKUNDEN = 60 * 60 * 12;

/**
 * Anmeldung mit dem Testzugang (ADR 0052) – nur in der Vorführung ohne echte Datenbank; sonst führt die Aktion ohne
 * Wirkung zur Anmeldeseite. Benutzername und Passwort stehen offen auf der Seite; die Aktion setzt das Cookie des
 * gewählten Zugangs und führt in dessen Bereich. Falsche Eingabe: zurück zur Anmeldeseite mit Hinweis.
 */
export async function testzugangAnmelden(daten: FormData): Promise<void> {
  if (!vorfuehrung()) redirect('/verwaltung/anmelden');
  const konto = pruefeTestzugang(daten.get('benutzername'), daten.get('passwort'));
  if (!konto) redirect('/verwaltung/anmelden?fehler=1');
  (await cookies()).set(VORFUEHRUNG_COOKIE, konto.schluessel, {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
    maxAge: DAUER_SEKUNDEN,
  });
  redirect(konto.ziel);
}

/** Abmelden auf der Anmeldeseite der Vorführung: Cookie des Testzugangs löschen und dort bleiben. */
export async function testzugangAbmelden(): Promise<void> {
  if (vorfuehrung()) (await cookies()).delete(VORFUEHRUNG_COOKIE);
  redirect('/verwaltung/anmelden?abgemeldet=1');
}
