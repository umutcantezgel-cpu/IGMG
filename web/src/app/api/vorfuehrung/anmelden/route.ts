import { NextResponse, type NextRequest } from 'next/server';
import { VORFUEHRUNG_COOKIE, kontoZuSchluessel, pruefeTestzugang, type VorfuehrungsKonto } from '@/lib/vorfuehrung/konten';
import { vorfuehrung } from '@/lib/vorfuehrung/modus';

/** Zwölf Stunden: lang genug für eine Vorstellung, danach meldet man sich neu an. */
const DAUER_SEKUNDEN = 60 * 60 * 12;
const NICHT_DA = { status: 404, headers: { 'Cache-Control': 'no-store' } } as const;

/**
 * Antwort: weiter zum Ziel (303, nie zwischengespeichert); mit Konto das Cookie des Testzugangs. Das Ziel steht als
 * Pfad in `Location` (RFC 9110 erlaubt relative Verweise) – unabhängig davon, unter welchem Namen der Server sich sieht.
 */
function weiter(ziel: string, konto?: VorfuehrungsKonto): NextResponse {
  const antwort = new NextResponse(null, { status: 303, headers: { Location: ziel, 'Cache-Control': 'no-store' } });
  if (konto) {
    antwort.cookies.set(VORFUEHRUNG_COOKIE, konto.schluessel, {
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/',
      maxAge: DAUER_SEKUNDEN,
    });
  }
  return antwort;
}

/**
 * Anmeldung mit dem Testzugang (ADR 0052) – nur in der Vorführung ohne echte Datenbank, sonst 404. Bewusst die einfachste
 * Technik: ein gewöhnliches Formular (POST) und gewöhnliche Links (GET `?als=<benutzername>`), die Antwort ist eine
 * Weiterleitung mit dem Cookie des Zugangs. Kein Client-JavaScript, keine Server Action: Die Route braucht keine
 * Datenbank und antwortet sofort – der Browser zeigt den Seitenwechsel, auch wenn die Zielseite auf einer frischen
 * Instanz erst die Datenbank lädt (Rückmeldung des Nutzers: „passiert nichts, wenn man auf Anmelden drückt“).
 * Anmelden per Link ist hier vertretbar: Benutzernamen und Passwort stehen offen auf der Seite, es gibt nichts zu schützen.
 */
export async function POST(request: NextRequest) {
  if (!vorfuehrung()) return new Response(null, NICHT_DA);
  const daten = await request.formData().catch(() => null);
  const konto = pruefeTestzugang(daten?.get('benutzername'), daten?.get('passwort'));
  return konto ? weiter(konto.ziel, konto) : weiter('/verwaltung/anmelden?fehler=1');
}

export async function GET(request: NextRequest) {
  if (!vorfuehrung()) return new Response(null, NICHT_DA);
  const konto = kontoZuSchluessel(request.nextUrl.searchParams.get('als'));
  return konto ? weiter(konto.ziel, konto) : weiter('/verwaltung/anmelden?fehler=1');
}
