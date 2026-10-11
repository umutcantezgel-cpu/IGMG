import { connection } from 'next/server';
import { versendeOffeneMails } from '@/lib/mail/ausgang';
import { mitSperre } from '@/lib/wartung/sperre';
import { cronErlaubt, wartungErlaubt } from '@/lib/wartung/zugang';

/**
 * Höchstzahl je Lauf: 20 (Standardwert von `versendeOffeneMails`). Der Versand läuft nacheinander, und ein Lauf
 * soll kurz bleiben, damit er im Zeitlimit einer Serverless-Funktion endet, auch bei langsamem SMTP. Ein Rückstau
 * wird über mehrere Läufe abgearbeitet; die Versuche je Eintrag sind begrenzt (ausgang.ts, höchstens 6).
 */
const MAIL_JE_LAUF = 20;

/**
 * Mail-Ausgang (ADR 0005): versendet offene Mails erneut, die beim ersten Versuch nach einem Formular nicht
 * hinausgingen. Täglich per Vercel Cron als `GET` mit CRON_SECRET; von Hand als `POST` mit WARTUNG_TOKEN.
 * Idempotent: Jede Mail wird vor dem Versand reserviert, und versendete Mails werden nicht noch einmal angefasst.
 * Die Sperre verhindert parallele Läufe; ist sie belegt, antwortet die Route mit `{ uebersprungen: true }`.
 */
async function laufe(): Promise<Response> {
  const lauf = await mitSperre('mail-ausgang', () => versendeOffeneMails(MAIL_JE_LAUF));
  return Response.json(lauf.uebersprungen ? { uebersprungen: true } : { ...lauf.ergebnis, hoechstensJeLauf: MAIL_JE_LAUF }, {
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
