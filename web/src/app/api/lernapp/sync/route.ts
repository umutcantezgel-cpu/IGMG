import { connection } from 'next/server';
import { datenbankVerfuegbar } from '@/lib/db/verfuegbar';
import { funktionAn } from '@/lib/funktionen';
import { hatZugang } from '@/lib/konto/zugang';
import { BREMSE, GRENZEN, HOECHSTENS_BYTES, SyncAnfrageSchema, type SyncFehler } from '@/lib/lernapp/sync/protokoll';
import { gleicheKontoAb, gleicherUrsprung, lernappEinwilligung, vermerkeZuweisungen } from '@/lib/lernapp/sync/server';
import { zaehleBetrieb } from '@/lib/lernapp/verwaltung/betrieb';
import { ladeKontoMitFaktor } from '@/lib/rechte/gemeinde';
import { pruefeRate } from '@/lib/validierung/ratenbegrenzung';

/**
 * Abgleich der Lern-App (ADR 0038 Nr. 5–7, PLAN §3.8): `POST /api/lernapp/sync` mit `{ konto, geraet, cursor, ereignisse, basis? }`
 * (Format in `src/lib/lernapp/sync/protokoll.ts`). Reihenfolge der Prüfungen:
 * 1. Datenbank und Schalter `lernapp_sync` (setzt `lernapp` und `konten` voraus) – sonst 404 ohne Körper.
 * 2. Gleicher Ursprung (Fetch-Metadaten bzw. `Origin`) – sonst 403 `ursprung`.
 * 3. Sitzung mit Kontoart und – wo Pflicht – zweitem Faktor – sonst 401 `anmeldung`.
 * 4. Einwilligung `lernapp` (Art. 9 DSGVO), bei Kindern von den Eltern – sonst 403 `einwilligung` bzw. `eltern`.
 * 5. Bremse 30 Anfragen je Minute und Konto – sonst 429 `bremse`.
 * 6. JSON ≤ 256 KB, Zod (Hülle streng, Ereignisse einzeln) – sonst 413 `zuGross`, 415/400 `anfrage` bzw. 400 `pruefen`.
 * 7. Das Profil ist an das Konto der Sitzung gebunden (`konto`) – sonst 409 `konto`, nichts wird geschrieben (S-L1 M-1:
 *    Kontowechsel auf einem geteilten Gerät oder in einem zweiten Tab vermischt sonst Lernstände zweier Konten).
 * 8. Grenzen je Konto (`GRENZEN`: Ereignisse gesamt, je 24 Stunden, Geräte) – sonst 429 `grenze`, nichts wird geschrieben.
 * Danach schreibt `gleicheKontoAb` idempotent und antwortet mit den fremden Ereignissen nach dem Zeiger. Nie
 * zwischengespeichert; der Service Worker der Lern-App hält `/api/**` ohnehin nie vor.
 */
const KOPF = { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex', 'X-Content-Type-Options': 'nosniff' };

function antwort(status: number, fehler?: SyncFehler, extra: Record<string, string> = {}) {
  return fehler
    ? Response.json({ fehler }, { status, headers: { ...KOPF, ...extra } })
    : new Response(null, { status, headers: { ...KOPF, ...extra } });
}

/** Körper als JSON lesen, höchstens `grenze` Bytes (auch ohne bzw. mit falscher Content-Length). */
async function leseJson(
  anfrage: Request,
  grenze: number,
): Promise<{ ok: true; wert: unknown } | { ok: false; status: number; fehler: SyncFehler }> {
  if (!anfrage.headers.get('content-type')?.toLowerCase().startsWith('application/json'))
    return { ok: false, status: 415, fehler: 'anfrage' };
  const laenge = Number(anfrage.headers.get('content-length') ?? '0');
  if (laenge > grenze) return { ok: false, status: 413, fehler: 'zuGross' };
  if (!anfrage.body) return { ok: false, status: 400, fehler: 'anfrage' };
  const teile: Uint8Array[] = [];
  let gelesen = 0;
  const leser = anfrage.body.getReader();
  for (;;) {
    const { done, value } = await leser.read();
    if (done) break;
    gelesen += value.length;
    if (gelesen > grenze) {
      await leser.cancel();
      return { ok: false, status: 413, fehler: 'zuGross' };
    }
    teile.push(value);
  }
  try {
    return { ok: true, wert: JSON.parse(Buffer.concat(teile).toString('utf8')) };
  } catch {
    return { ok: false, status: 400, fehler: 'anfrage' };
  }
}

export async function POST(anfrage: Request) {
  await connection();
  if (!datenbankVerfuegbar() || !(await funktionAn('lernapp_sync'))) return antwort(404);
  if (!gleicherUrsprung(anfrage.headers)) return antwort(403, 'ursprung');
  const konto = await ladeKontoMitFaktor();
  if (!konto || !hatZugang(konto)) return antwort(401, 'anmeldung');
  const einwilligung = await lernappEinwilligung(konto.benutzerId, { istKind: konto.istKind });
  if (einwilligung !== 'erteilt') return antwort(403, einwilligung === 'eltern' ? 'eltern' : 'einwilligung');
  const rate = await pruefeRate('lernapp-sync', konto.benutzerId, BREMSE);
  if (!rate.erlaubt) return antwort(429, 'bremse', { 'Retry-After': String(BREMSE.fensterSekunden) });
  const roh = await leseJson(anfrage, HOECHSTENS_BYTES);
  if (!roh.ok) return antwort(roh.status, roh.fehler);
  const p = SyncAnfrageSchema.safeParse(roh.wert);
  if (!p.success) return antwort(400, 'pruefen');
  if (p.data.konto !== konto.benutzerId) return antwort(409, 'konto');

  const jetzt = new Date();
  const ergebnis = await gleicheKontoAb(konto.benutzerId, p.data, jetzt);
  if (ergebnis.grenze) {
    console.warn(`[lernapp-sync] Grenze je Konto erreicht: ${ergebnis.grenze}`);
    // Zählung ohne Personenbezug für das Cockpit (S-L1 M-2, Verwaltung L3-06)
    await zaehleBetrieb(`sync_grenze_${ergebnis.grenze}`, jetzt);
    return antwort(429, 'grenze', { 'Retry-After': String(GRENZEN.wartenSekunden) });
  }
  // Zuweisungen der Lehrkraft nur mit Schalter `lernapp_gruppen` (Personendaten für die Gruppe)
  if (ergebnis.neue.some((e) => e.art === 'lektion') && (await funktionAn('lernapp_gruppen')))
    await vermerkeZuweisungen(konto.benutzerId, jetzt);
  return Response.json(ergebnis.antwort, { headers: KOPF });
}
