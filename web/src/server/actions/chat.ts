'use server';

import { after } from 'next/server';
import { z } from 'zod';
import { protokolliere } from '@/lib/audit';
import {
  bearbeiteMeldung,
  bestaetigeRegeln,
  entferneAlsKinderschutz,
  entferneMitglied,
  entferneNachricht,
  ladeKanal,
  leitungsAdressen,
  meldeNachricht,
  pausiereAlsKinderschutz,
  sendeNachricht,
  setzeKanalPause,
  setzeNotfallpause,
  stummschalten,
} from '@/lib/chat/dienst';
import { db, schema } from '@/lib/db';
import { echtzeitAusUmgebung, signalisiere } from '@/lib/echtzeit/centrifugo';
import { funktionAn } from '@/lib/funktionen';
import { verschluessele } from '@/lib/krypto';
import { versendeOffeneMails } from '@/lib/mail/ausgang';
import { ladeGruppenKontext, verlangeKontoRecht } from '@/lib/rechte/gemeinde';
import { KeinRecht, verlangeRecht } from '@/lib/rechte/pruefe';
import { pruefeRate } from '@/lib/validierung/ratenbegrenzung';

/**
 * Server Actions des Gruppenchats (S-01…S-18). Reihenfolge wie MUSTER §5: Konto/Recht zuerst, dann Eingabe prüfen,
 * dann Dienst (der das Gruppenrecht erneut prüft). Rückgaben ohne Texte anderer Personen.
 */
const uuid = z.string().uuid();
const nachrichtId = z.number().int().positive();

async function chatAn(): Promise<boolean> {
  return funktionAn('chat');
}

/** Konto mit Faktor und eingeschaltetem Chat (N-2 der Sicherheitsprüfung S1: auch Moderation und Melden). */
async function kontext() {
  if (!(await chatAn())) throw new KeinRecht();
  const konto = await verlangeKontoRecht();
  return { konto, kontext: await ladeGruppenKontext(konto.benutzerId) };
}

export async function sendeChatNachricht(kanalId: string, text: string) {
  if (!(await chatAn())) return { ok: false as const, grund: 'kanalAus' as const };
  const { kontext: k } = await kontext();
  if (!uuid.safeParse(kanalId).success || typeof text !== 'string' || text.length > 4000)
    return { ok: false as const, grund: 'keinRecht' as const };
  const kanal = await ladeKanal(kanalId);
  if (!kanal) return { ok: false as const, grund: 'keinRecht' as const };
  const ergebnis = await sendeNachricht(kanal, k, text);
  // Echtzeit (K-A): nur das Signal „Kanal hat Neues“ an den lokalen Server, nie der Text (S-16)
  const echtzeit = echtzeitAusUmgebung();
  if (ergebnis.ok && echtzeit && (await funktionAn('echtzeit'))) after(() => signalisiere(echtzeit, kanalId));
  return ergebnis;
}

export async function bestaetigeChatRegeln() {
  const { konto } = await kontext();
  await bestaetigeRegeln(konto.benutzerId);
  return { ok: true as const };
}

const meldungsEingabe = z.object({
  nachrichtId,
  grund: z.enum(['beleidigung', 'bedrohung', 'unangemessen', 'spam', 'sonstiges']),
  freitext: z.string().max(1000).nullable(),
});

/** Höchstens 10 Meldungen je Stunde und Konto – sonst ließen sich Gruppenleitung und Kinderschutz mit Mails fluten. */
const MELDE_GRENZE = { max: 10, fensterSekunden: 3600 };

export async function meldeChatNachricht(eingabe: z.input<typeof meldungsEingabe>) {
  const { konto, kontext: k } = await kontext();
  const p = meldungsEingabe.safeParse(eingabe);
  if (!p.success) return { ok: false as const };
  if (!(await pruefeRate('chat-meldung', konto.benutzerId, MELDE_GRENZE)).erlaubt) return { ok: false as const };
  const ergebnis = await meldeNachricht(k, p.data.nachrichtId, p.data.grund, p.data.freitext);
  if (!ergebnis.ok) return { ok: false as const };
  // S-08: Gruppenleitung und Rolle kinderschutz erfahren von der Meldung – ohne Inhalt
  const empfaenger = [
    ...(await leitungsAdressen(ergebnis.gruppeId, ergebnis.absenderId)).map((an) => ({
      an,
      pfad: `/mein-bereich/unterricht/${ergebnis.gruppeId}/moderation`,
    })),
    { an: 'recht:meldung.chat.bearbeiten', pfad: '/verwaltung/kinderschutz' },
  ];
  await db.insert(schema.mailAusgang).values(
    empfaenger.map(({ an, pfad }) => {
      const v = verschluessele({ an, daten: { art: 'chatmeldung', pfad } });
      return { vorlage: 'benachrichtigung', sprache: 'de', datenVerschluesselt: v.daten, schluesselId: v.schluesselId };
    }),
  );
  await protokolliere({ benutzerId: konto.benutzerId, aktion: 'chat.gemeldet', zielTyp: 'chat_meldung', zielId: ergebnis.meldungId });
  after(() => versendeOffeneMails().catch(() => undefined));
  return { ok: true as const };
}

const grund = z.string().min(3).max(300);

export async function entferneChatNachricht(id: number, begruendung: string) {
  const { kontext: k } = await kontext();
  if (!nachrichtId.safeParse(id).success || !grund.safeParse(begruendung).success) return { fehler: 'grundFehlt' as const };
  const fehler = await entferneNachricht(k, id, begruendung);
  return fehler ? { fehler } : { ok: true as const };
}

export async function schalteStumm(kanalId: string, benutzerId: string, minuten: number, begruendung: string) {
  const { kontext: k } = await kontext();
  if (!uuid.safeParse(kanalId).success || !grund.safeParse(begruendung).success || !Number.isInteger(minuten))
    return { fehler: 'grundFehlt' as const };
  const kanal = await ladeKanal(kanalId);
  if (!kanal) return { fehler: 'nichtGefunden' as const };
  const fehler = await stummschalten(k, kanal, benutzerId, minuten, begruendung);
  return fehler ? { fehler } : { ok: true as const };
}

export async function pausiereKanal(kanalId: string, pause: boolean, begruendung: string) {
  const { kontext: k } = await kontext();
  if (!uuid.safeParse(kanalId).success || !grund.safeParse(begruendung).success) return { fehler: 'grundFehlt' as const };
  const kanal = await ladeKanal(kanalId);
  if (!kanal) return { fehler: 'nichtGefunden' as const };
  const fehler = await setzeKanalPause(k, kanal, pause, begruendung);
  return fehler ? { fehler } : { ok: true as const };
}

/** Verwaltung, Rolle kinderschutz (nie über „Administration darf alles“, NIE_PER_ADMINISTRATION). */
export async function bearbeiteChatMeldung(meldungId: string, status: 'in_bearbeitung' | 'erledigt', begruendung: string) {
  const a = await verlangeRecht('meldung.chat.bearbeiten');
  if (!uuid.safeParse(meldungId).success || !grund.safeParse(begruendung).success) return { fehler: 'grundFehlt' as const };
  const fehler = await bearbeiteMeldung(meldungId, a.benutzerId, status, begruendung);
  if (!fehler)
    await protokolliere({ benutzerId: a.benutzerId, aktion: 'chat.meldung_bearbeitet', zielTyp: 'chat_meldung', zielId: meldungId });
  return fehler ? { fehler } : { ok: true as const };
}

export async function schalteNotfallpause(an: boolean, begruendung: string) {
  const a = await verlangeRecht('chat.notfallpause');
  if (!grund.safeParse(begruendung).success) return { fehler: 'grundFehlt' as const };
  const fehler = await setzeNotfallpause(a.benutzerId, an, begruendung);
  if (!fehler) await protokolliere({ benutzerId: a.benutzerId, aktion: an ? 'chat.notfallpause' : 'chat.notfallpause_aufgehoben' });
  return fehler ? { fehler } : { ok: true as const };
}

export async function entferneGruppenmitglied(gruppeId: string, lernendeId: string, begruendung: string) {
  const { kontext: k } = await kontext();
  if (!uuid.safeParse(gruppeId).success || !uuid.safeParse(lernendeId).success || !grund.safeParse(begruendung).success)
    return { fehler: 'grundFehlt' as const };
  const fehler = await entferneMitglied(k, gruppeId, lernendeId, begruendung);
  return fehler ? { fehler } : { ok: true as const };
}

/** Kinderschutz (Verwaltung): entfernen und pausieren auch ohne Gruppenleitung, z. B. bei Meldungen gegen eine Lehrkraft. */
export async function entferneAlsKinderschutzAction(nachrichtId: number, begruendung: string) {
  const a = await verlangeRecht('meldung.chat.bearbeiten');
  if (!Number.isInteger(nachrichtId) || nachrichtId < 1 || !grund.safeParse(begruendung).success) return { fehler: 'grundFehlt' as const };
  const fehler = await entferneAlsKinderschutz(a.benutzerId, nachrichtId, begruendung);
  return fehler ? { fehler } : { ok: true as const };
}

export async function pausiereAlsKinderschutzAction(kanalId: string, pause: boolean, begruendung: string) {
  const a = await verlangeRecht('meldung.chat.bearbeiten');
  if (!uuid.safeParse(kanalId).success || !grund.safeParse(begruendung).success) return { fehler: 'grundFehlt' as const };
  const fehler = await pausiereAlsKinderschutz(a.benutzerId, kanalId, pause, begruendung);
  return fehler ? { fehler } : { ok: true as const };
}
