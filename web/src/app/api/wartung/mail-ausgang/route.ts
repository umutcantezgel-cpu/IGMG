import { connection } from 'next/server';
import { versendeOffeneMails } from '@/lib/mail/ausgang';
import { planeZusammenfassungen } from '@/lib/push/zusammenfassung';
import { mitSperre } from '@/lib/wartung/sperre';
import { cronErlaubt, wartungErlaubt } from '@/lib/wartung/zugang';

/**
 * Höchstzahl je Lauf: 20 (Standardwert von `versendeOffeneMails`). Der Versand läuft nacheinander, und ein Lauf
 * soll kurz bleiben, damit er im Zeitlimit einer Serverless-Funktion endet, auch bei langsamem SMTP. Ein Rückstau
 * wird über mehrere Läufe abgearbeitet; die Versuche je Eintrag sind begrenzt (ausgang.ts, höchstens 6).
 */
const MAIL_JE_LAUF = 20;
/**
 * Zusätzlich je Lauf für die Zusammenfassungen des Tages (F-38), damit sie nicht hinter dem Rückstau warten; begrenzt,
 * damit der Lauf kurz bleibt. Was nicht hinausgeht, versendet der nächste Lauf (der Empfänger wird dann neu geprüft).
 */
const ZUSAMMENFASSUNGEN_JE_LAUF = 80;

/**
 * Mail-Ausgang (ADR 0005): versendet offene Mails erneut, die beim ersten Versuch nach einem Formular nicht
 * hinausgingen. Täglich per Vercel Cron als `GET` mit CRON_SECRET; von Hand als `POST` mit WARTUNG_TOKEN.
 * Vorher plant derselbe Lauf die tägliche Zusammenfassung ohne Inhalte (ADR 0034 Nr. 6, F-38): je Konto höchstens eine
 * je Tag und nur bei Neuem; ohne Schalter `push` plant er nichts.
 * Idempotent: Jede Mail wird vor dem Versand reserviert, und versendete Mails werden nicht noch einmal angefasst; ein
 * zweiter Lauf am selben Tag plant keine Zusammenfassung mehr.
 * Die Sperre verhindert parallele Läufe; ist sie belegt, antwortet die Route mit `{ uebersprungen: true }`.
 */
async function laufe(): Promise<Response> {
  const lauf = await mitSperre('mail-ausgang', async () => {
    const zusammenfassungen = await planeZusammenfassungen();
    const hoechstens = MAIL_JE_LAUF + Math.min(zusammenfassungen.geplant, ZUSAMMENFASSUNGEN_JE_LAUF);
    return { ...(await versendeOffeneMails(hoechstens)), hoechstensJeLauf: hoechstens, zusammenfassungen: zusammenfassungen.geplant };
  });
  return Response.json(lauf.uebersprungen ? { uebersprungen: true } : lauf.ergebnis, {
    headers: { 'Cache-Control': 'no-store' },
  });
}

/** Vercel Cron (CRON_SECRET). */
export async function GET(anfrage: Request) {
  await connection();
  if (!cronErlaubt(anfrage)) return new Response(null, { status: 401 });
  return laufe();
}

/** Handaufruf (WARTUNG_TOKEN). */
export async function POST(anfrage: Request) {
  await connection();
  if (!wartungErlaubt(anfrage)) return new Response(null, { status: 401 });
  return laufe();
}
