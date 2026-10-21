import { connection } from 'next/server';
import { datenbankVerfuegbar } from '@/lib/db/verfuegbar';
import { funktionAn } from '@/lib/funktionen';
import { berlinerDatum } from '@/lib/gebetszeiten/naechstes';
import { text } from '@/lib/i18n/inhalt';
import { textVersion } from '@/lib/konto/einwilligung';
import { hatZugang } from '@/lib/konto/zugang';
import {
  alterVon,
  blendeAus,
  eigeneGruppen,
  familienBestenlisten,
  hatZustimmung,
  KeinGruppenZugang,
  meineZuweisungen,
  stimmeZu,
  zuweisungsDetails,
} from '@/lib/lernapp/gruppe/dienst';
import {
  type GruppeAntwort,
  type GruppeFehler,
  type ListenPlatz,
  themaIn,
  UiSchema,
  ZustimmungAnfrageSchema,
  type ZustimmungAntwort,
} from '@/lib/lernapp/gruppe/protokoll';
import { abSechzehn, type Platz } from '@/lib/lernapp/gruppe/regeln';
import type { Oberflaeche } from '@/lib/lernapp/kurse';
import { gleicherUrsprung, lernappEinwilligung } from '@/lib/lernapp/sync/server';
import { lernTexte } from '@/lib/lernapp/texte';
import { ladeGruppenKontext, ladeKontoMitFaktor } from '@/lib/rechte/gemeinde';
import { pruefeRate } from '@/lib/validierung/ratenbegrenzung';

/**
 * Gruppe in der Lern-App (L7-02; PLAN §3.1; ADR 0043 Nr. 7/8; KERN 4.0 §5): `GET /api/lernapp/gruppe?ui=de` liefert die
 * Zuweisungen der eigenen Gruppen, das Gruppenziel (Summe ohne Namen), Bestenlisten der eigenen Gruppen und Familien und
 * die eigene Zustimmung; `POST` mit `{ aktion: 'zustimmen' | 'ausblenden', ui }` setzt die Zustimmung. Prüfungen:
 * 1. Datenbank und Schalter `lernapp_gruppen` (setzt `lernapp` und `lernplattform` voraus) – sonst 404 ohne Körper; POST
 *    zusätzlich `lernapp_rangliste`.
 * 2. Gleicher Ursprung – sonst 403 `ursprung`.
 * 3. Sitzung mit Kontoart und – wo Pflicht – zweitem Faktor – sonst 401 `anmeldung`.
 * 4. Bremse 60 Anfragen je Minute und Konto – sonst 429 `bremse`.
 * Bestenlisten nur mit `lernapp_rangliste`, nur für Konten ab 16 und nur mit Mitgliedern ab 16 mit Zustimmung (Sperre im
 * Code, `gruppe/regeln.ts`). Kinder bekommen nie eine Bestenliste und keine Zustimmung angeboten. Nie zwischengespeichert.
 */
const KOPF = { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex', 'X-Content-Type-Options': 'nosniff' };
const BREMSE = { max: 60, fensterSekunden: 60 } as const;

function antwort(status: number, fehler?: GruppeFehler) {
  return fehler ? Response.json({ fehler }, { status, headers: KOPF }) : new Response(null, { status, headers: KOPF });
}

/** Gemeinsame Prüfung beider Methoden; Ergebnis ist das Konto oder die fertige Fehlerantwort. */
async function pruefe(anfrage: Request, schalter: readonly ('lernapp_gruppen' | 'lernapp_rangliste')[]) {
  await connection();
  if (!datenbankVerfuegbar()) return { fehler: antwort(404) };
  for (const s of schalter) if (!(await funktionAn(s))) return { fehler: antwort(404) };
  if (!gleicherUrsprung(anfrage.headers)) return { fehler: antwort(403, 'ursprung') };
  const konto = await ladeKontoMitFaktor();
  if (!konto || !hatZugang(konto)) return { fehler: antwort(401, 'anmeldung') };
  const rate = await pruefeRate('lernapp-gruppe', konto.benutzerId, BREMSE);
  if (!rate.erlaubt) return { fehler: antwort(429, 'bremse') };
  return { konto };
}

const alsListe = (plaetze: Platz[], ich: string): ListenPlatz[] =>
  plaetze.map((p) => ({ name: p.name, xp: p.xp, ich: p.benutzerId === ich }));
const gruppenSprache = (ui: Oberflaeche) => (ui === 'tr' ? 'tr' : 'de');

export async function GET(anfrage: Request) {
  const p = await pruefe(anfrage, ['lernapp_gruppen']);
  if (p.fehler) return p.fehler;
  const { konto } = p;
  const ui = UiSchema.safeParse(new URL(anfrage.url).searchParams.get('ui'));
  if (!ui.success) return antwort(400, 'anfrage');
  const jetzt = new Date();
  const heute = berlinerDatum(jetzt);
  const [kontext, rangliste, eigen] = await Promise.all([
    ladeGruppenKontext(konto.benutzerId),
    funktionAn('lernapp_rangliste'),
    alterVon(konto.benutzerId),
  ]);
  // Kinder: Sperre im Code – weder Bestenliste noch Zustimmung, auch wenn die Lage anders gemeldet würde
  const ab16 = !konto.istKind && abSechzehn(eigen.alter, heute);
  try {
    const [einwilligung, zuweisungen, gruppen, familien] = await Promise.all([
      lernappEinwilligung(konto.benutzerId, { istKind: konto.istKind }, jetzt),
      meineZuweisungen(kontext),
      eigeneGruppen(kontext, heute, { rangliste: rangliste && ab16, jetzt }),
      rangliste && ab16 ? familienBestenlisten(kontext, heute, jetzt) : Promise.resolve([]),
    ]);
    const details = await zuweisungsDetails(zuweisungen);
    const angeboten = rangliste && ab16 && (gruppen.some((g) => g.bestenliste !== null) || familien.length > 0);
    const inhalt: GruppeAntwort = {
      einwilligung,
      zuweisungen: zuweisungen.map((z) => ({
        id: z.id,
        gruppe: text(z.gruppe, gruppenSprache(ui.data)),
        kurs: z.kurs,
        einheit: z.einheit,
        thema: themaIn(details.get(z.id)?.thema ?? undefined, ui.data),
        lektion: details.get(z.id)?.paketLektion ?? null,
        nr: details.get(z.id)?.nr ?? null,
        faellig: z.faellig,
        erledigt: z.erledigt,
      })),
      gruppen: gruppen.map((g) => ({
        id: g.id,
        name: text(g.name, gruppenSprache(ui.data)),
        ziel: g.ziel,
        bestenliste: ab16 && g.bestenliste ? alsListe(g.bestenliste, konto.benutzerId) : null,
      })),
      familien: ab16 ? familien.map((f) => ({ eigene: f.eigene, bestenliste: alsListe(f.bestenliste, konto.benutzerId) })) : [],
      zustimmung: angeboten ? { erteilt: await hatZustimmung(konto.benutzerId) } : null,
    };
    return Response.json(inhalt, { headers: KOPF });
  } catch (e) {
    if (e instanceof KeinGruppenZugang) return antwort(404);
    throw e;
  }
}

export async function POST(anfrage: Request) {
  const p = await pruefe(anfrage, ['lernapp_gruppen', 'lernapp_rangliste']);
  if (p.fehler) return p.fehler;
  const { konto } = p;
  if (!anfrage.headers.get('content-type')?.toLowerCase().startsWith('application/json')) return antwort(415, 'anfrage');
  let roh: unknown;
  try {
    const koerper = await anfrage.text();
    if (koerper.length > 1024) return antwort(413, 'anfrage');
    roh = JSON.parse(koerper);
  } catch {
    return antwort(400, 'anfrage');
  }
  const a = ZustimmungAnfrageSchema.safeParse(roh);
  if (!a.success) return antwort(400, 'anfrage');
  if (a.data.aktion === 'ausblenden') {
    await blendeAus(konto.benutzerId);
    return Response.json({ erteilt: false } satisfies ZustimmungAntwort, { headers: KOPF });
  }
  const jetzt = new Date();
  const heute = berlinerDatum(jetzt);
  if (konto.istKind || !abSechzehn((await alterVon(konto.benutzerId)).alter, heute)) return antwort(403, 'alter');
  if ((await lernappEinwilligung(konto.benutzerId, { istKind: konto.istKind }, jetzt)) !== 'erteilt') return antwort(403, 'einwilligung');
  // Version = SHA-256 genau des angezeigten Wortlauts in der Oberflächensprache (Art. 7 Abs. 1 DSGVO)
  const wortlaut = lernTexte(a.data.ui)('gruppe.zustimmung.text');
  try {
    await stimmeZu(konto.benutzerId, heute, `${a.data.ui}:${textVersion('lernapp-bestenliste/2026-10-entwurf', wortlaut)}`);
  } catch (e) {
    if (e instanceof KeinGruppenZugang) return antwort(403, 'alter');
    throw e;
  }
  return Response.json({ erteilt: true } satisfies ZustimmungAntwort, { headers: KOPF });
}
