import { z } from 'zod';
import { wennGueltig } from '@/lib/formulare/wizard';
import { RUECKMELDEARTEN } from '@/lib/validierung/ticket';
import { TELEFON } from './veranstaltungsanmeldung';

/**
 * Öffentliche Meldung der Seite /meldung (C10b, E-034, E-037): Anliegen von Gemeindemitgliedern, die als Ticket im
 * Modul Tickets landen. Nur die Felder des Designs (TicketDialog.dc.html) plus Betreff, Ticket-Titel (G-07).
 * Telefon und Organisation sind freiwillig (Auftrag); Telefon wird bei Rückmeldung per Telefon Pflicht, E-Mail bei
 * Rückmeldung per E-Mail. Fehler sind Schlüssel unter `meldung.fehler` bzw. `formulare.fehler`.
 */
export const MELDUNG_TYPEN = ['beschwerde', 'wunsch', 'vorschlag', 'information'] as const;
/** Leer = allgemein (ohne Organisation). */
export const MELDUNG_ORGANISATION = ['', 'at', 'kt', 'gt', 'kgt'] as const;
export const RUECKMELDUNG = ['ja', 'nein'] as const;

const EMAIL = z.email();

export const meldungSchema = z
  .object({
    typ: z.enum(MELDUNG_TYPEN, 'typPflicht'),
    organisation: z.enum(MELDUNG_ORGANISATION, 'ungueltig').default(''),
    betreff: z.string('betreffPflicht').trim().min(1, 'betreffPflicht').max(160, 'zuLang'),
    beschreibung: z.string('nachrichtPflicht').trim().min(1, 'nachrichtPflicht').max(2000, 'zuLang'),
    vorname: z.string('vornamePflicht').trim().min(1, 'vornamePflicht').max(100, 'zuLang'),
    nachname: z.string('nachnamePflicht').trim().min(1, 'nachnamePflicht').max(100, 'zuLang'),
    telefon: z
      .string()
      .trim()
      .max(30, 'zuLang')
      .refine((t) => t === '' || TELEFON.test(t), 'telefon')
      .default(''),
    email: z
      .string()
      .trim()
      .max(254, 'zuLang')
      .refine((t) => t === '' || EMAIL.safeParse(t).success, 'email')
      .default(''),
    rueckmeldung: z.enum(RUECKMELDUNG, 'wahlPflicht'),
    rueckmeldeArt: z.enum(RUECKMELDEARTEN, 'artPflicht').optional(),
    einwilligung: z.literal('ja', 'einwilligung'),
  })
  // Feldübergreifende Regeln laufen, sobald die beteiligten Felder selbst gültig sind (MUSTER 6b, wennGueltig).
  .refine((d) => d.rueckmeldung !== 'ja' || d.rueckmeldeArt !== undefined, {
    path: ['rueckmeldeArt'],
    message: 'artPflicht',
    when: wennGueltig('rueckmeldung', 'rueckmeldeArt'),
  })
  .refine((d) => !(d.rueckmeldung === 'ja' && d.rueckmeldeArt === 'telefon') || d.telefon !== '', {
    path: ['telefon'],
    message: 'telefonPflicht',
    when: wennGueltig('rueckmeldung', 'rueckmeldeArt', 'telefon'),
  })
  .refine((d) => !(d.rueckmeldung === 'ja' && d.rueckmeldeArt === 'email') || d.email !== '', {
    path: ['email'],
    message: 'emailPflicht',
    when: wennGueltig('rueckmeldung', 'rueckmeldeArt', 'email'),
  });
export type Meldung = z.infer<typeof meldungSchema>;
