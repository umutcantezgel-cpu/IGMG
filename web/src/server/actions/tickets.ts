'use server';

import { eq } from 'drizzle-orm';
import { refresh } from 'next/cache';
import { redirect } from 'next/navigation';
import type { ZodError } from 'zod';
import { protokolliere } from '@/lib/audit';
import { db, schema } from '@/lib/db';
import { verlangeRecht, type Angemeldet } from '@/lib/rechte/pruefe';
import { aenderungSchema, ausFormular, feldFehlerAus, kennungFehlt, kommentarSchema, neuesTicketSchema } from '@/lib/validierung/ticket';
import { darfAnlegen, darfBearbeiten, darfKommentieren, ladeTicketKopf } from '@/server/queries/verwaltung/tickets';

/**
 * Verwaltung „Tickets“ (V10, ADR 0005, G-07). Reihenfolge je Action: Recht (Sitzung, zweiter Faktor, Rolle) als erste
 * Anweisung → Eingabe prüfen → Organisationsgrenze am Ticket → Speichern in einer Transaktion → Audit im selben `tx`.
 * Fehler sind Schlüssel unter `verwaltung.tickets.fehler`; Antworten und Audit-Details nennen keinen Freitext.
 * Tickets haben keine öffentliche Wirkung und keinen Cache-Tag: `inhaltGeaendert` entfällt hier.
 */
export type TicketZustand = {
  fehler?: string;
  feldFehler?: Record<string, string>;
  werte?: Record<string, unknown>;
  gespeichert?: number;
};

/** Eingabefehler: fehlende Kennung → nicht gefunden, sonst Feldfehler mit den eingegebenen Werten. */
function eingabeFehler(fehler: ZodError, roh: Record<string, unknown>): TicketZustand {
  if (kennungFehlt(fehler)) return { fehler: 'nichtGefunden' };
  return { fehler: 'pruefen', feldFehler: feldFehlerAus(fehler), werte: roh };
}

/** Neues Ticket (Typ „intern“). Die Organisation muss innerhalb der Grenze der Person liegen (K-06). */
export async function neuesTicket(_vorher: TicketZustand, fd: FormData): Promise<TicketZustand> {
  let a: Angemeldet;
  try {
    a = await verlangeRecht('ticket.anlegen');
  } catch {
    return { fehler: 'keinRecht' };
  }
  const roh = ausFormular(fd);
  const geprueft = neuesTicketSchema.safeParse(roh);
  if (!geprueft.success) return { fehler: 'pruefen', feldFehler: feldFehlerAus(geprueft.error), werte: roh };
  const e = geprueft.data;
  const organisation = e.organisation || null;
  if (!darfAnlegen(a, organisation)) return { fehler: 'pruefen', feldFehler: { organisation: 'organisation' }, werte: roh };

  const id = await db.transaction(async (tx) => {
    const [neu] = await tx
      .insert(schema.ticket)
      .values({
        titel: e.titel,
        beschreibung: e.beschreibung,
        kategorie: e.kategorie || null,
        organisation,
        prioritaet: e.prioritaet,
        typ: 'intern',
        status: 'offen',
        erstelltVon: a.benutzerId,
      })
      .returning({ id: schema.ticket.id });
    await protokolliere({ benutzerId: a.benutzerId, aktion: 'ticket.angelegt', zielTyp: 'ticket', zielId: neu.id }, tx);
    return neu.id;
  });
  redirect(`/verwaltung/tickets/${id}?angelegt=1`);
}

/**
 * Status und Priorität ändern (nur `ticket.bearbeiten`). Jede Änderung je Feld steht im Audit-Log mit altem und neuem
 * Wert; `geschlossenAm` folgt dem Status (gesetzt bei „gelöst“ und „geschlossen“, Tor B/C SP-B B4).
 */
const ABGESCHLOSSEN = new Set<string>(['geloest', 'geschlossen']);

export async function aendereTicket(_vorher: TicketZustand, fd: FormData): Promise<TicketZustand> {
  let a: Angemeldet;
  try {
    a = await verlangeRecht('ticket.bearbeiten');
  } catch {
    return { fehler: 'keinRecht' };
  }
  const roh = ausFormular(fd);
  const geprueft = aenderungSchema.safeParse(roh);
  if (!geprueft.success) return eingabeFehler(geprueft.error, roh);
  const e = geprueft.data;
  const alt = await ladeTicketKopf(e.id, a);
  if (!alt) return { fehler: 'nichtGefunden' };
  if (!darfBearbeiten(a, alt.organisation)) return { fehler: 'keinRecht' };

  const jetzt = new Date();
  const ergebnis = await db.transaction(async (tx) => {
    // Sperre auf dem Datensatz: Der Vergleich mit dem Stand im Audit-Log darf nicht von einer parallelen Änderung überholt werden.
    const [vorher] = await tx
      .select({ status: schema.ticket.status, prioritaet: schema.ticket.prioritaet, geschlossenAm: schema.ticket.geschlossenAm })
      .from(schema.ticket)
      .where(eq(schema.ticket.id, alt.id))
      .for('update');
    if (!vorher) return 'nichtGefunden' as const;
    if (vorher.status === e.status && vorher.prioritaet === e.prioritaet) return 'unveraendert' as const;

    // Abschluss = gelöst oder geschlossen (B4): ab dann läuft die Frist für die Melderangaben (E-037)
    const geschlossenAm = !ABGESCHLOSSEN.has(e.status) ? null : ABGESCHLOSSEN.has(vorher.status) ? (vorher.geschlossenAm ?? jetzt) : jetzt;
    await tx.update(schema.ticket).set({ status: e.status, prioritaet: e.prioritaet, geschlossenAm }).where(eq(schema.ticket.id, alt.id));
    if (vorher.status !== e.status)
      await protokolliere(
        {
          benutzerId: a.benutzerId,
          aktion: 'ticket.geaendert',
          zielTyp: 'ticket',
          zielId: alt.id,
          details: { feld: 'status', von: vorher.status, nach: e.status },
        },
        tx,
      );
    if (vorher.prioritaet !== e.prioritaet)
      await protokolliere(
        {
          benutzerId: a.benutzerId,
          aktion: 'ticket.geaendert',
          zielTyp: 'ticket',
          zielId: alt.id,
          details: { feld: 'prioritaet', von: vorher.prioritaet, nach: e.prioritaet },
        },
        tx,
      );
    return 'gespeichert' as const;
  });
  if (ergebnis === 'nichtGefunden') return { fehler: 'nichtGefunden' };
  if (ergebnis === 'gespeichert') refresh();
  return { gespeichert: Date.now() };
}

/**
 * Kommentar im Verlauf. Recht: `ticket.anlegen` oder `ticket.bearbeiten` (siehe `darfKommentieren`). Das Audit-Log
 * hält nur fest, dass und ob intern kommentiert wurde – nie den Text.
 */
export async function kommentiereTicket(_vorher: TicketZustand, fd: FormData): Promise<TicketZustand> {
  let a: Angemeldet;
  try {
    a = await verlangeRecht('ticket.lesen');
  } catch {
    return { fehler: 'keinRecht' };
  }
  const roh = ausFormular(fd);
  const geprueft = kommentarSchema.safeParse(roh);
  if (!geprueft.success) return eingabeFehler(geprueft.error, roh);
  const e = geprueft.data;
  const kopf = await ladeTicketKopf(e.id, a);
  if (!kopf) return { fehler: 'nichtGefunden' };
  if (!darfKommentieren(a, kopf.organisation)) return { fehler: 'keinRecht' };

  await db.transaction(async (tx) => {
    await tx.insert(schema.ticketKommentar).values({ ticketId: kopf.id, autorId: a.benutzerId, text: e.text, intern: e.intern });
    await protokolliere(
      { benutzerId: a.benutzerId, aktion: 'ticket.kommentiert', zielTyp: 'ticket', zielId: kopf.id, details: { intern: e.intern } },
      tx,
    );
  });
  refresh();
  return { gespeichert: Date.now() };
}
