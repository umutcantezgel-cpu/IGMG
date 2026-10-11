// Lichtung (b): Einladung → Konto, TOTP aktivieren, Anmelden mit zweitem Faktor – alles lokal auf PGlite.
import * as OTPAuth from 'otpauth';
import { auth } from './auth.ts';
import { client } from './db.ts';

const BASIS = 'http://localhost:3000/api/auth';
const EMAIL = 'testperson.eins@example.test';
const PASSWORT = 'Testpasswort-Eins-123';
const ergebnis: Record<string, unknown> = {};

async function http(pfad: string, body: unknown, cookie = '') {
  const res = await auth.handler(new Request(BASIS + pfad, {
    method: 'POST', headers: { 'content-type': 'application/json', origin: 'http://localhost:3000', cookie }, body: JSON.stringify(body),
  }));
  const setCookie = res.headers.getSetCookie().map((c) => c.split(';')[0]).join('; ');
  return { status: res.status, json: await res.json().catch(() => null), setCookie };
}

// 1. Öffentliche Registrierung über HTTP muss scheitern
const offen = await http('/sign-up/email', { email: 'fremd@example.test', password: PASSWORT, name: 'Fremd' });
ergebnis['1_http_registrierung_gesperrt'] = offen.status === 403;

// 2. Einladung annehmen = serverseitiger Aufruf (ohne Request) legt das Konto an
await auth.api.signUpEmail({ body: { email: EMAIL, password: PASSWORT, name: 'Testperson Eins' } });
ergebnis['2_konto_per_einladung'] = true;

// 3. Anmelden (noch ohne 2FA) → Sitzung
const an1 = await http('/sign-in/email', { email: EMAIL, password: PASSWORT });
ergebnis['3_anmeldung_ohne_2fa_status'] = an1.status;
const sitzung1 = an1.setCookie;

// 4. TOTP aktivieren → URI → Code erzeugen → bestätigen
const aktiv = await http('/two-factor/enable', { password: PASSWORT }, sitzung1);
const totpURI = (aktiv.json as { totpURI?: string })?.totpURI ?? '';
const totp = OTPAuth.URI.parse(totpURI) as OTPAuth.TOTP;
const bestaetigt = await http('/two-factor/verify-totp', { code: totp.generate() }, [sitzung1, aktiv.setCookie].filter(Boolean).join('; '));
ergebnis['4_totp_uri_vorhanden'] = totpURI.startsWith('otpauth://totp/');
ergebnis['4_totp_bestaetigt_status'] = bestaetigt.status;
ergebnis['4_backup_codes'] = Array.isArray((aktiv.json as { backupCodes?: unknown[] })?.backupCodes) ? (aktiv.json as { backupCodes: unknown[] }).backupCodes.length : 0;
const zeile = await client.query<{ two_factor_enabled: boolean }>('select two_factor_enabled from "user" where email = $1', [EMAIL]);
ergebnis['4_twoFactorEnabled_in_db'] = zeile.rows[0]?.two_factor_enabled;

// 5. Erneut anmelden → zweiter Faktor wird verlangt, keine volle Sitzung
const an2 = await http('/sign-in/email', { email: EMAIL, password: PASSWORT });
ergebnis['5_twoFactorRedirect'] = (an2.json as { twoFactorRedirect?: boolean })?.twoFactorRedirect === true;
const ohneFaktor = await auth.api.getSession({ headers: new Headers({ cookie: an2.setCookie }) });
ergebnis['5_keine_sitzung_vor_faktor'] = ohneFaktor === null;

// 6. Falscher Code wird abgelehnt, richtiger Code liefert Sitzung
const falsch = await http('/two-factor/verify-totp', { code: '000000' }, an2.setCookie);
ergebnis['6_falscher_code_status'] = falsch.status;
const richtig = await http('/two-factor/verify-totp', { code: totp.generate() }, an2.setCookie);
ergebnis['6_richtiger_code_status'] = richtig.status;
const mitFaktor = await auth.api.getSession({ headers: new Headers({ cookie: richtig.setCookie }) });
ergebnis['6_sitzung_nach_faktor'] = mitFaktor?.user.email === EMAIL;

console.log(JSON.stringify(ergebnis, null, 2));
await client.close();
