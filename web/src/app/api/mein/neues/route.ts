import { connection } from 'next/server';
import { echtzeitAusUmgebung, echtzeitTokens } from '@/lib/echtzeit/centrifugo';
import type { SignalTokens } from '@/lib/echtzeit/signal';
import { funktionAn } from '@/lib/funktionen';
import { hatZugang } from '@/lib/konto/zugang';
import { lesbareKanaele, zaehleNeues } from '@/lib/push/neues';
import { seitAusAbruf, ZUSAMMENFASSUNG_THEMEN } from '@/lib/push/rueckfall';
import { ladeGruppenKontext, ladeKontoMitFaktor } from '@/lib/rechte/gemeinde';

/**
 * Hinweis „Neues“ in Mein Bereich (ADR 0034 Nr. 6, F-38): `GET /api/mein/neues?seit=<ms>[&ohne=<kanal>][&signal=1]`.
 * - Ohne `seit`: nur der Stand (Zeit des Servers) – beim ersten Laden erscheint kein Hinweis.
 * - Mit `seit`: die Anzahl je Bereich seither (Ankündigung, Gruppen mit neuen Nachrichten, Gruppen mit Neuem aus dem
 *   Unterricht) – nur, was die Person sehen darf; keine Namen, keine Titel, keine Inhalte (`zaehleNeues`).
 * - Mit `signal=1`: Tokens für das Echtzeit-Signal der lesbaren Kanäle (höchstens 12; ohne den offenen Kanal `ohne`,
 *   dessen Nachrichten nichts zählen), nur mit den Schaltern `echtzeit`, `chat`, `lernplattform` und einer
 *   Konfiguration; sonst `null` – der Browser bleibt beim Abruf (ADR 0027).
 * Nur mit Sitzung, Kontoart und – wo Pflicht – zweitem Faktor; nie zwischengespeichert.
 */
const KOPF = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' };
const HOECHSTENS_KANAELE = 12;

export async function GET(anfrage: Request) {
  await connection();
  if (!(await funktionAn('konten'))) return new Response(null, { status: 404, headers: KOPF });
  const konto = await ladeKontoMitFaktor();
  if (!konto || !hatZugang(konto)) return new Response(null, { status: 401, headers: KOPF });
  const p = new URL(anfrage.url).searchParams;
  const jetzt = new Date();
  const seit = seitAusAbruf(p.get('seit'), jetzt.getTime());
  const ohne = p.get('ohne');
  const ohneKanal = ohne && /^[0-9a-f-]{36}$/i.test(ohne) ? ohne : null;
  const kontext = await ladeGruppenKontext(konto.benutzerId);
  const neu =
    seit === null
      ? null
      : await zaehleNeues(konto.benutzerId, new Date(seit), ZUSAMMENFASSUNG_THEMEN, {
          jetzt,
          kontext,
          ohneKanal,
        });
  let echtzeit: SignalTokens | null = null;
  const konfig = p.get('signal') === '1' ? echtzeitAusUmgebung() : null;
  if (konfig && (await funktionAn('echtzeit')) && (await funktionAn('chat')) && (await funktionAn('lernplattform'))) {
    const tokens = (await lesbareKanaele(kontext, jetzt))
      .filter((k) => k.kanalId !== ohneKanal)
      .slice(0, HOECHSTENS_KANAELE)
      .map((k) => echtzeitTokens(konfig, konto.benutzerId, k.kanalId));
    if (tokens.length)
      echtzeit = { url: konfig.url, verbindung: tokens[0].verbindung, abos: tokens.map((t) => ({ kanal: t.kanal, abo: t.abo })) };
  }
  return Response.json({ stand: jetzt.getTime(), neu, echtzeit }, { headers: KOPF });
}
