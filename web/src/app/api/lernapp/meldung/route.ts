import { eq } from 'drizzle-orm';
import { connection } from 'next/server';
import { db, schema } from '@/lib/db';
import { datenbankVerfuegbar } from '@/lib/db/verfuegbar';
import { funktionAn } from '@/lib/funktionen';
import { hatZugang } from '@/lib/konto/zugang';
import { aufgabeGehoertZumKurs, MeldungSchema, meldungsSchluessel } from '@/lib/lernapp/meldung';
import { gleicherUrsprung } from '@/lib/lernapp/sync/server';
import { zaehleBetrieb } from '@/lib/lernapp/verwaltung/betrieb';
import { ladeKontoMitFaktor } from '@/lib/rechte/gemeinde';
import { clientAdresse } from '@/lib/sicherheit/ip';
import { altchaBereit, pruefeAltcha } from '@/lib/validierung/altcha';
import { type Grenze, pruefeRate } from '@/lib/validierung/ratenbegrenzung';

/**
 * „Fehler melden“ aus der Lern-App (ADR 0041 Nr. 9, KERN 4.0 §5/§6, PLAN §11; Verwaltung L3-06): `POST /api/lernapp/meldung`
 * mit `{ kurs, aufgabe, kategorie, altcha, antwort? }` (Schema `lib/lernapp/meldung.ts`). Ohne Konto möglich, ohne
 * Personenbezug: gespeichert werden nur Aufgabenschlüssel (mit Richtung) und Kategorie; die eigene Antwort nur von
 * angemeldeten Personen ab 16 (sonst verworfen). Reihenfolge:
 * 1. Datenbank und Schalter `lernapp_meldungen` (setzt `lernapp` voraus) – sonst 404 ohne Körper; ohne ALTCHA-Geheimnis 503.
 * 2. Gleicher Ursprung (Fetch-Metadaten bzw. `Origin`) – sonst 403 `ursprung`.
 * 3. Ratenbegrenzung je IP (nur als HMAC, nie gespeichert) – sonst 429 `zuViele`.
 * 4. JSON ≤ 4 KB, Zod streng, Aufgabe gehört zum Kurs und existiert – sonst 413/415/400 bzw. 404.
 * 5. ALTCHA (einmal verwendbar) – sonst 400 `altcha`.
 * Antwort 201 ohne Inhalt. Die Route setzt keine Cookies; die Sitzung liest sie nur, wenn eine Antwort mitkommt. Nie
 * zwischengespeichert; der Service Worker der Lern-App hält `/api/**` nie vor.
 */
const KOPF = { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex', 'X-Content-Type-Options': 'nosniff' };
export const MELDUNG_GRENZE: Grenze = { max: 10, fensterSekunden: 600 };
const HOECHSTENS_BYTES = 4096;

function antwort(status: number, fehler?: string, extra: Record<string, string> = {}) {
  return fehler
    ? Response.json({ fehler }, { status, headers: { ...KOPF, ...extra } })
    : new Response(null, { status, headers: { ...KOPF, ...extra } });
}

async function leseJson(anfrage: Request): Promise<{ ok: true; wert: unknown } | { ok: false; status: number }> {
  if (!anfrage.headers.get('content-type')?.toLowerCase().startsWith('application/json')) return { ok: false, status: 415 };
  if (Number(anfrage.headers.get('content-length') ?? '0') > HOECHSTENS_BYTES) return { ok: false, status: 413 };
  const text = await anfrage.text().catch(() => null);
  if (text === null) return { ok: false, status: 400 };
  if (new TextEncoder().encode(text).length > HOECHSTENS_BYTES) return { ok: false, status: 413 };
  try {
    return { ok: true, wert: JSON.parse(text) };
  } catch {
    return { ok: false, status: 400 };
  }
}

export async function POST(anfrage: Request) {
  await connection();
  if (!datenbankVerfuegbar() || !(await funktionAn('lernapp_meldungen'))) return antwort(404);
  if (!altchaBereit()) return antwort(503, 'nicht_eingerichtet');
  if (!gleicherUrsprung(anfrage.headers)) return antwort(403, 'ursprung');
  const rate = await pruefeRate('lernapp-meldung', clientAdresse(anfrage.headers), MELDUNG_GRENZE);
  if (!rate.erlaubt) return antwort(429, 'zuViele', { 'Retry-After': String(MELDUNG_GRENZE.fensterSekunden) });
  const roh = await leseJson(anfrage);
  if (!roh.ok) return antwort(roh.status, 'anfrage');
  const p = MeldungSchema.safeParse(roh.wert);
  if (!p.success || !aufgabeGehoertZumKurs(p.data.kurs, p.data.aufgabe)) return antwort(400, 'pruefen');
  const [aufgabe] = await db
    .select({ id: schema.lernappAufgabe.id })
    .from(schema.lernappAufgabe)
    .where(eq(schema.lernappAufgabe.schluessel, p.data.aufgabe))
    .limit(1);
  if (!aufgabe) return antwort(404, 'aufgabe');
  if (!(await pruefeAltcha(p.data.altcha))) return antwort(400, 'altcha');

  // Eigene Antwort nur von angemeldeten Personen ab 16 (KERN 4.0 §5); ohne Konto und bei Kindern nie
  let eigeneAntwort: string | null = null;
  if (p.data.antwort) {
    const konto = await ladeKontoMitFaktor();
    if (konto && hatZugang(konto) && !konto.istKind) eigeneAntwort = p.data.antwort;
  }
  await db.insert(schema.lernappMeldung).values({
    aufgabeSchluessel: meldungsSchluessel(p.data.kurs as Parameters<typeof meldungsSchluessel>[0], p.data.aufgabe),
    kategorie: p.data.kategorie,
    antwort: eigeneAntwort,
  });
  await zaehleBetrieb('meldung');
  return antwort(201);
}
