import { connection } from 'next/server';
import { z } from 'zod';
import { datenbankVerfuegbar } from '@/lib/db/verfuegbar';
import { funktionAn } from '@/lib/funktionen';
import { hatZugang } from '@/lib/konto/zugang';
import {
  ABGABE_MAX_BYTES,
  AbgabeAnfrageSchema,
  type AbgabeAntwort,
  type ListeAntwort,
  PruefAnfrageSchema,
  type SchreibenFehler,
  SchreibenUiSchema,
} from '@/lib/lernapp/schreiben/abgabe';
import { AbgabeAbgelehnt, alsPruefAntwort, eigeneAbgaben, loescheEigeneAbgabe, pruefeAbgabe, reicheEin } from '@/lib/lernapp/schreiben/dienst';
import { gleicherUrsprung } from '@/lib/lernapp/sync/server';
import { ladeGruppenKontext, ladeKontoMitFaktor } from '@/lib/rechte/gemeinde';
import { pruefeRate } from '@/lib/validierung/ratenbegrenzung';

/**
 * Schreibabgabe an die Lehrkraft (L5-03; PLAN §3.8, §4.3; ADR 0042 Nr. 11; KERN 4.0 §5): Format in
 * `lib/lernapp/schreiben/abgabe.ts`. Prüfungen in fester Reihenfolge:
 * 1. Datenbank und Schalter `lernapp_gruppen` (setzt `lernapp` und `lernplattform` voraus) – sonst 404 ohne Körper.
 *    `DELETE` (eigene Abgabe löschen) geht auch bei ausgeschalteten Schaltern: Löschen jederzeit.
 * 2. Gleicher Ursprung – sonst 403 `ursprung`.
 * 3. Sitzung mit Kontoart und – wo Pflicht – zweitem Faktor – sonst 401 `anmeldung`.
 * 4. Bremse je Konto: Lesen 60 je Minute, Senden 20 je Stunde – sonst 429 `bremse`.
 * 5. `POST`: JSON (415), höchstens 64 KB (413 `groesse`), Zod (400 `anfrage`); dann im Dienst Einwilligung `lernapp` (bei
 *    Kindern die der Eltern, 403 `einwilligung`/`eltern`), Schreibaufgabe im Kurspaket (404 `aufgabe`) und Zuweisung an eine
 *    eigene Gruppe (403 `zuweisung`), Grenzen (429 `grenze`), Kennung eines anderen Kontos (409 `konflikt`).
 * Der Text wird verschlüsselt gespeichert und erscheint nie in Logs, Audit, Push oder Mail. Nie zwischengespeichert.
 */
const KOPF = { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex', 'X-Content-Type-Options': 'nosniff' };
const BREMSE_LESEN = { max: 60, fensterSekunden: 60 } as const;
const BREMSE_SENDEN = { max: 20, fensterSekunden: 3600 } as const;

function antwort(status: number, fehler?: SchreibenFehler) {
  return fehler ? Response.json({ fehler }, { status, headers: KOPF }) : new Response(null, { status, headers: KOPF });
}

async function pruefe(anfrage: Request, mitSchalter: boolean, bremse: 'lesen' | 'senden') {
  await connection();
  if (!datenbankVerfuegbar()) return { fehler: antwort(404) };
  if (mitSchalter && !(await funktionAn('lernapp_gruppen'))) return { fehler: antwort(404) };
  if (!gleicherUrsprung(anfrage.headers)) return { fehler: antwort(403, 'ursprung') };
  const konto = await ladeKontoMitFaktor();
  if (!konto || !hatZugang(konto)) return { fehler: antwort(401, 'anmeldung') };
  const rate =
    bremse === 'lesen'
      ? await pruefeRate('lernapp-schreiben', konto.benutzerId, BREMSE_LESEN)
      : await pruefeRate('lernapp-schreiben-abgabe', konto.benutzerId, BREMSE_SENDEN);
  if (!rate.erlaubt) return { fehler: antwort(429, 'bremse') };
  return { konto };
}

const gruppenSprache = (ui: string) => (ui === 'tr' ? 'tr' : 'de');

export async function GET(anfrage: Request) {
  const p = await pruefe(anfrage, true, 'lesen');
  if (p.fehler) return p.fehler;
  const { konto } = p;
  const such = new URL(anfrage.url).searchParams;
  if (!such.has('aufgabe')) {
    const ui = SchreibenUiSchema.safeParse(such.get('ui'));
    if (!ui.success) return antwort(400, 'anfrage');
    const inhalt: ListeAntwort = { abgaben: await eigeneAbgaben(konto.benutzerId, gruppenSprache(ui.data)) };
    return Response.json(inhalt, { headers: KOPF });
  }
  const a = PruefAnfrageSchema.safeParse({ ui: such.get('ui'), kurs: such.get('kurs'), aufgabe: such.get('aufgabe') });
  if (!a.success) return antwort(400, 'anfrage');
  const m = await pruefeAbgabe(konto, await ladeGruppenKontext(konto.benutzerId), a.data.kurs, a.data.aufgabe);
  return Response.json(alsPruefAntwort(m, gruppenSprache(a.data.ui)), { headers: KOPF });
}

const STATUS: Record<AbgabeAbgelehnt['grund'], number> = {
  einwilligung: 403,
  eltern: 403,
  aufgabe: 404,
  zuweisung: 403,
  grenze: 429,
  konflikt: 409,
};

export async function POST(anfrage: Request) {
  const p = await pruefe(anfrage, true, 'senden');
  if (p.fehler) return p.fehler;
  const { konto } = p;
  if (!anfrage.headers.get('content-type')?.toLowerCase().startsWith('application/json')) return antwort(415, 'anfrage');
  const laenge = Number(anfrage.headers.get('content-length') ?? '0');
  if (laenge > ABGABE_MAX_BYTES) return antwort(413, 'groesse');
  let roh: unknown;
  try {
    const koerper = await anfrage.text();
    if (new TextEncoder().encode(koerper).length > ABGABE_MAX_BYTES) return antwort(413, 'groesse');
    roh = JSON.parse(koerper);
  } catch {
    return antwort(400, 'anfrage');
  }
  const a = AbgabeAnfrageSchema.safeParse(roh);
  if (!a.success) return antwort(400, 'anfrage');
  try {
    const status = await reicheEin(konto, await ladeGruppenKontext(konto.benutzerId), a.data);
    return Response.json({ status } satisfies AbgabeAntwort, { status: status === 'eingereicht' ? 201 : 200, headers: KOPF });
  } catch (e) {
    if (e instanceof AbgabeAbgelehnt) return antwort(STATUS[e.grund], e.grund);
    throw e;
  }
}

export async function DELETE(anfrage: Request) {
  // Ohne Schalter: Die eigene Abgabe lässt sich immer löschen (auch wenn `lernapp_gruppen` inzwischen aus ist)
  const p = await pruefe(anfrage, false, 'lesen');
  if (p.fehler) return p.fehler;
  const id = z.uuid().safeParse(new URL(anfrage.url).searchParams.get('id'));
  if (!id.success) return antwort(400, 'anfrage');
  return (await loescheEigeneAbgabe(p.konto.benutzerId, id.data)) ? Response.json({ geloescht: true }, { headers: KOPF }) : antwort(404);
}
