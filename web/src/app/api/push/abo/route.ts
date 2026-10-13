import { after, connection } from 'next/server';
import nachrichten from '../../../../../messages/bereiche/benachrichtigungen.json';
import { funktionAn } from '@/lib/funktionen';
import { entferneAbo, kindDarfPush, sendeAnAbo, speichereAbo } from '@/lib/push/abo';
import { erlaubterEndpunkt } from '@/lib/push/senden';
import { vapidAusUmgebung } from '@/lib/push/vapid';
import { gueltigeAboSchluessel } from '@/lib/push/verschluesselung';
import { ladeKontoMitFaktor } from '@/lib/rechte/gemeinde';
import { clientAdresse } from '@/lib/sicherheit/ip';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { pushAboEingabe, pushAbmeldung } from '@/lib/validierung/push';
import { pruefeRate } from '@/lib/validierung/ratenbegrenzung';

/**
 * Push-Abo an- und abmelden (ADR 0034). Nur gleiche Herkunft (Sec-Fetch-Site), JSON ≤ 4 KB, Ratenbegrenzung je Adresse,
 * nur bekannte Push-Dienste als Endpunkt. Angemeldete Konten werden verknüpft (für Chat/Unterricht), sonst anonym.
 */
const KEIN_SPEICHER = { 'Cache-Control': 'no-store' };
const GRENZE = { max: 20, fensterSekunden: 600 };

function antwort(status: number, inhalt?: object) {
  return inhalt ? Response.json(inhalt, { status, headers: KEIN_SPEICHER }) : new Response(null, { status, headers: KEIN_SPEICHER });
}

async function leseJson(anfrage: Request): Promise<unknown | null> {
  if (anfrage.headers.get('sec-fetch-site') && anfrage.headers.get('sec-fetch-site') !== 'same-origin') return null;
  if (!anfrage.headers.get('content-type')?.startsWith('application/json')) return null;
  const text = await anfrage.text();
  if (text.length > 4096) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function POST(anfrage: Request) {
  await connection();
  if (!(await funktionAn('push'))) return antwort(404);
  const vapid = vapidAusUmgebung();
  if (!vapid) return antwort(503, { fehler: 'aus' });
  const roh = await leseJson(anfrage);
  if (roh === null) return antwort(400, { fehler: 'anfrage' });
  const rate = await pruefeRate('push-abo', clientAdresse(anfrage.headers), GRENZE);
  if (!rate.erlaubt) return antwort(429, { fehler: 'rate' });
  const eingabe = pushAboEingabe.safeParse(roh);
  if (
    !eingabe.success ||
    !erlaubterEndpunkt(eingabe.data.abo.endpoint) ||
    !gueltigeAboSchluessel(eingabe.data.abo.keys.p256dh, eingabe.data.abo.keys.auth)
  )
    return antwort(400, { fehler: 'pruefen' });
  if (!eingabe.data.themen.length) return antwort(400, { fehler: 'thema' });
  // Verknüpfung mit dem Konto nur mit erfülltem zweiten Faktor (M-1 der Sicherheitsprüfung S1); sonst anonymes Abo
  const konto = await ladeKontoMitFaktor();
  if (konto?.istKind && !(await kindDarfPush(konto.benutzerId))) return antwort(403, { fehler: 'einwilligung' });
  // Chat und Unterricht nur mit Konto (Inhalte gehören zu einer Person); anonym bleiben Gebet und Ankündigung
  const themen = konto ? eingabe.data.themen : eingabe.data.themen.filter((t) => t === 'gebet' || t === 'ankuendigung');
  const ergebnis = await speichereAbo(
    { ...eingabe.data, themen },
    konto?.benutzerId ?? null,
    `${nachrichten.de.push.einwilligung}|${nachrichten.tr.push.einwilligung}|${nachrichten.en.push.einwilligung}`,
  );
  if (ergebnis.neu) {
    after(async () => {
      const [abo] = await db.select().from(schema.pushAbo).where(eq(schema.pushAbo.id, ergebnis.id));
      if (abo) await sendeAnAbo(abo, { art: 'probe' }, vapid);
    });
  }
  return antwort(200, { gespeichert: true, neu: ergebnis.neu, themen });
}

export async function DELETE(anfrage: Request) {
  await connection();
  const roh = await leseJson(anfrage);
  if (roh === null) return antwort(400, { fehler: 'anfrage' });
  const rate = await pruefeRate('push-abo', clientAdresse(anfrage.headers), GRENZE);
  if (!rate.erlaubt) return antwort(429, { fehler: 'rate' });
  const eingabe = pushAbmeldung.safeParse(roh);
  if (!eingabe.success) return antwort(400, { fehler: 'pruefen' });
  await entferneAbo(eingabe.data.endpoint);
  // Immer 204: keine Auskunft, ob ein Abo bestand
  return antwort(204);
}
