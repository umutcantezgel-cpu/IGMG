'use server';

import { eq } from 'drizzle-orm';
import { refresh } from 'next/cache';
import { redirect } from 'next/navigation';
import { after } from 'next/server';
import { z } from 'zod';
import { protokolliere } from '@/lib/audit';
import { bearbeiteMeldung, entferneMitglied, entferneNachricht, ladeKanal, setzeKanalPause, stummschalten } from '@/lib/chat/dienst';
import { db, schema } from '@/lib/db';
import { funktionAn } from '@/lib/funktionen';
import { versendeOffeneMails } from '@/lib/mail/ausgang';
import { sendeGruppenPush } from '@/lib/push/gruppe';
import { verlangeKontenAktion } from '@/lib/konto/zugang';
import { MASSNAHMEN } from '@/lib/lernen/ansicht';
import { aendereTermin, KeinGruppenRecht } from '@/lib/lernen/dienst';
import { ladeGruppenKontext, verlangeKontoRecht } from '@/lib/rechte/gemeinde';
import { darfInGruppe } from '@/lib/rechte/gruppen';
import { KeinRecht } from '@/lib/rechte/pruefe';
import { pfadFuer } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { offeneMeldungen } from '@/server/queries/mein-bereich/unterricht';

/**
 * Formular-Aktionen der Lehrkraft-Seiten (AUFTRAG 3.5, S-09): Termin ausfallen lassen, Meldungen moderieren, Kanal
 * pausieren. Funktionieren ohne JavaScript (Formulare in Server-Komponenten). Reihenfolge wie MUSTER §5: Schalter,
 * Konto (Lehrkraft mit TOTP über `verlangeKontoRecht`), Eingabe, Gruppenrecht; die Dienste prüfen es erneut.
 */
const uuid = z.string().uuid();
const spracheSchema = z.enum(['de', 'tr', 'en']).catch('de');

async function lehrkraftKontext(chat = false) {
  await verlangeKontenAktion();
  if (!(await funktionAn('lernplattform')) || (chat && !(await funktionAn('chat')))) throw new KeinRecht();
  const konto = await verlangeKontoRecht(['lehrkraft']);
  return { konto, kontext: await ladeGruppenKontext(konto.benutzerId) };
}

const ausfallSchema = z.object({ terminId: uuid, ausgefallen: z.enum(['1', '0']) });

/**
 * Termin ausfallen lassen oder wieder stattfinden lassen (Leitung der Gruppe); die Seite rendert neu. Schüler und Eltern
 * mit dem Thema „Unterricht“ bekommen danach einen Push ohne Inhalt (ADR 0034); der Audit-Eintrag ist zugleich die Quelle
 * für Mail-Zusammenfassung und Hinweis in Mein Bereich (Rückfall, F-38).
 */
export async function terminAusfallSetzen(fd: FormData): Promise<void> {
  const { konto, kontext } = await lehrkraftKontext();
  const p = ausfallSchema.safeParse({ terminId: fd.get('terminId'), ausgefallen: fd.get('ausgefallen') });
  if (!p.success) throw new KeinRecht();
  try {
    await aendereTermin(p.data.terminId, kontext, { ausgefallen: p.data.ausgefallen === '1' });
  } catch (e) {
    if (e instanceof KeinGruppenRecht) throw new KeinRecht();
    throw e;
  }
  const [t] = await db
    .select({ gruppeId: schema.unterrichtstermin.gruppeId })
    .from(schema.unterrichtstermin)
    .where(eq(schema.unterrichtstermin.id, p.data.terminId));
  // Grundlage für „Neues aus dem Unterricht“ in der Mail-Zusammenfassung und im Hinweis (F-38): nur IDs, keine Inhalte
  if (t)
    await protokolliere({
      benutzerId: konto.benutzerId,
      aktion: 'unterricht.termin_geaendert',
      zielTyp: 'gruppe',
      zielId: t.gruppeId,
      details: { termin: p.data.terminId, ausgefallen: p.data.ausgefallen === '1' },
    });
  if (t)
    after(() =>
      sendeGruppenPush(
        t.gruppeId,
        'unterricht',
        { schueler: true, eltern: true },
        `/mein-bereich/gruppen/${t.gruppeId}`,
        konto.benutzerId,
      ).catch(() => 0),
    );
  refresh();
}

const meldungSchema = z.object({
  gruppeId: uuid,
  meldungId: uuid,
  massnahme: z.enum(MASSNAHMEN),
  grund: z.string().trim().min(3).max(300),
  abschliessen: z.literal('ja').optional(),
});

function moderationsZiel(gruppeId: string, sprache: Locale, query: Record<string, string>) {
  return pfadFuer({ pathname: '/mein-bereich/unterricht/[gruppe]/moderation', params: { gruppe: gruppeId }, query }, sprache);
}

export async function moderiereMeldung(fd: FormData): Promise<void> {
  const sprache = spracheSchema.parse(fd.get('sprache')) as Locale;
  const { konto, kontext } = await lehrkraftKontext(true);
  const gruppeId = uuid.safeParse(fd.get('gruppeId'));
  const meldungId = uuid.safeParse(fd.get('meldungId'));
  if (!gruppeId.success || !meldungId.success) throw new KeinRecht();
  if (!darfInGruppe(kontext, 'chat.moderieren', gruppeId.data)) throw new KeinRecht();
  const p = meldungSchema.safeParse({
    gruppeId: gruppeId.data,
    meldungId: meldungId.data,
    massnahme: fd.get('massnahme'),
    grund: fd.get('grund'),
    abschliessen: fd.get('abschliessen') ?? undefined,
  });
  const zurueck = (query: Record<string, string>): never => redirect(moderationsZiel(gruppeId.data, sprache, query));
  if (!p.success) zurueck({ fehler: 'grund', meldung: meldungId.data });
  const { massnahme, grund } = p.data!;

  // Nur offene Meldungen dieser Gruppe, nie über eigene Nachrichten (D-02) – dieselbe Auswahl wie die Seite
  const m = (await offeneMeldungen(gruppeId.data, kontext))?.find((x) => x.id === meldungId.data);
  if (!m) zurueck({ fehler: 'nichtMoeglich' });
  const meldung = m!;
  const gegenLeitung = meldung.absenderIstLeitung;

  let fehler: string | null = null;
  let ok: string = massnahme;
  if (massnahme === 'entfernen') {
    fehler =
      meldung.nachrichtId && !meldung.nachrichtEntfernt ? await entferneNachricht(kontext, meldung.nachrichtId, grund) : 'nichtMoeglich';
  } else if (massnahme === 'stumm30' || massnahme === 'stummTag') {
    const kanal = await ladeKanal(meldung.kanalId);
    fehler =
      kanal && meldung.absenderId && !gegenLeitung
        ? await stummschalten(kontext, kanal, meldung.absenderId, massnahme === 'stumm30' ? 30 : 24 * 60, grund)
        : 'nichtMoeglich';
    ok = 'stumm';
  } else if (massnahme === 'mitglied') {
    fehler = meldung.absenderLernendeId
      ? await entferneMitglied(kontext, gruppeId.data, meldung.absenderLernendeId, grund)
      : 'nichtMoeglich';
  }
  if (fehler) zurueck({ fehler: fehler === 'grundFehlt' ? 'grund' : 'nichtMoeglich', meldung: meldung.id });

  const status = massnahme === 'in_bearbeitung' ? 'in_bearbeitung' : massnahme === 'erledigt' || p.data!.abschliessen ? 'erledigt' : null;
  if (status) {
    const f = await bearbeiteMeldung(meldung.id, konto.benutzerId, status, grund);
    if (f) zurueck({ fehler: 'allgemein', meldung: meldung.id });
    await protokolliere({ benutzerId: konto.benutzerId, aktion: 'chat.meldung_bearbeitet', zielTyp: 'chat_meldung', zielId: meldung.id });
  }
  zurueck(status === 'erledigt' ? { ok } : { ok, meldung: meldung.id });
}

const pauseSchema = z.object({ gruppeId: uuid, kanalId: uuid, pause: z.enum(['1', '0']), grund: z.string().trim().min(3).max(300) });

/** Kanal der Gruppe pausieren oder fortsetzen (S-09, mit Grund; eine Pause der Rolle kinderschutz bleibt, D-02). */
export async function kanalPauseSetzen(fd: FormData): Promise<void> {
  const sprache = spracheSchema.parse(fd.get('sprache')) as Locale;
  const { kontext } = await lehrkraftKontext(true);
  const gruppeId = uuid.safeParse(fd.get('gruppeId'));
  if (!gruppeId.success || !darfInGruppe(kontext, 'chat.moderieren', gruppeId.data)) throw new KeinRecht();
  const p = pauseSchema.safeParse({ gruppeId: gruppeId.data, kanalId: fd.get('kanalId'), pause: fd.get('pause'), grund: fd.get('grund') });
  if (!p.success) redirect(moderationsZiel(gruppeId.data, sprache, { fehler: 'grund' }));
  const kanal = await ladeKanal(p.data.kanalId);
  if (!kanal || kanal.gruppeId !== gruppeId.data) throw new KeinRecht();
  const fehler = await setzeKanalPause(kontext, kanal, p.data.pause === '1', p.data.grund);
  // Fortsetzen meldet der Dienst der Rolle kinderschutz (Mail-Ausgang); Versand nach der Antwort
  if (!fehler && p.data.pause === '0') after(() => versendeOffeneMails().catch(() => undefined));
  redirect(
    moderationsZiel(
      gruppeId.data,
      sprache,
      fehler ? { fehler: 'nichtMoeglich' } : { ok: p.data.pause === '1' ? 'pausiert' : 'fortgesetzt' },
    ),
  );
}
