import 'server-only';
import { and, eq, gt, isNull, sql } from 'drizzle-orm';
import { protokolliere } from '@/lib/audit';
import { db, schema, type Transaktion } from '@/lib/db';
import { datumLang, uhrzeit } from '@/lib/i18n/format';
import { sha256, zufallsToken } from '@/lib/krypto';
import { planeKontoMail } from '@/lib/mail/ausgang';
import type { MailSprache } from '@/lib/mail/konto-vorlagen';
import { basisUrl } from '@/lib/seo/metadaten';
import { pfadFuer } from '@/i18n/navigation';

/**
 * Einladungen in Gemeinde-Konten aus der Verwaltung (ADR 0026, O-L01, H-L05): Eltern (aus der Aufnahme einer
 * Voranmeldung oder nachträglich), Lehrkräfte und Schüler ab 16. Bestehendes Einladungssystem (K-06): Token nur als
 * SHA-256, Mail „konto-einladung“ in der Sprache der Person (nur Link und Ablauf, keine Namen oder Rollen).
 *
 * Mit `lernendeId` trägt die Einladung den Bezug auf die Lernende: Bei der Annahme entsteht für Eltern der
 * Eltern-Kind-Bezug, für Schüler das eigene Konto am Lerndatensatz (`src/lib/konto/einladung.ts`).
 *
 * Idempotent: Gibt es für dieselbe Adresse, Kontoart und Lernende schon eine offene, gültige Einladung, entsteht keine
 * zweite (`neu: false`, ohne Link – der Klartext-Token ist nicht mehr bekannt).
 *
 * Mit `freigabeNoetig` (Eltern-Einladung an eine Adresse außerhalb der Voranmeldung, Nacharbeit N4) entsteht die
 * Einladung ohne gültigen Link und ohne Mail; beides erst bei der Freigabe durch eine zweite Person
 * (`src/lib/konto/eltern-freigabe.ts`).
 */
export type GemeindeEinladungArt = 'eltern' | 'lehrkraft' | 'schueler';

export type GemeindeEinladung = {
  name: string;
  email: string;
  art: GemeindeEinladungArt;
  lernendeId: string | null;
  gueltigTage: number;
  sprache: MailSprache;
  erstelltVon: string;
  /** Erst nach Freigabe durch eine zweite Person verschicken (N4). */
  freigabeNoetig?: boolean;
};

/** `link: null` = Einladung wartet auf Freigabe (noch kein gültiger Link). */
export type EinladungErgebnis = { id: string; neu: true; link: string | null } | { id: string; neu: false };

/** Link und Mail „konto-einladung“ zu einem Klartext-Token planen (in der Transaktion des Aufrufers). */
export async function planeEinladungsMail(
  tx: Pick<Transaktion, 'insert'>,
  o: { email: string; token: string; laeuftAb: Date; sprache: MailSprache },
): Promise<string> {
  const link = `${basisUrl()}${pfadFuer({ pathname: '/einladung/[token]', params: { token: o.token } }, o.sprache)}`;
  await planeKontoMail(
    {
      an: o.email,
      vorlage: 'konto-einladung',
      sprache: o.sprache,
      daten: { link, gueltigBis: `${datumLang(o.laeuftAb, o.sprache)}, ${uhrzeit(o.laeuftAb, o.sprache)}` },
    },
    tx,
  );
  return link;
}

/** Offene, gültige Einladung derselben Adresse, Kontoart und Lernenden (oder null). */
export async function offeneEinladung(
  o: Pick<GemeindeEinladung, 'email' | 'art' | 'lernendeId'>,
  ausfuehrer: Pick<typeof db, 'select'> = db,
): Promise<string | null> {
  const e = schema.einladung;
  const [z] = await ausfuehrer
    .select({ id: e.id })
    .from(e)
    .where(
      and(
        sql`lower(${e.email}) = ${o.email.trim().toLowerCase()}`,
        isNull(e.angenommenAm),
        isNull(e.widerrufenAm),
        gt(e.laeuftAb, new Date()),
        o.lernendeId ? eq(e.lernendeId, o.lernendeId) : isNull(e.lernendeId),
        sql`${e.gemeindeRollen} @> ${JSON.stringify([o.art])}::jsonb`,
      ),
    )
    .limit(1);
  return z?.id ?? null;
}

/** Legt die Einladung samt Mail im Ausgang an (in der Transaktion des Aufrufers) und protokolliert sie. */
export async function erstelleGemeindeEinladung(tx: Transaktion, o: GemeindeEinladung): Promise<EinladungErgebnis> {
  const email = o.email.trim().toLowerCase();
  const vorhanden = await offeneEinladung({ email, art: o.art, lernendeId: o.lernendeId }, tx);
  if (vorhanden) return { id: vorhanden, neu: false };
  // Wartet die Einladung auf Freigabe, ist ihr Token unbekannt (verworfen) – der Link entsteht erst bei der Freigabe
  const token = zufallsToken();
  const freigabe = o.freigabeNoetig === true;
  const laeuftAb = new Date(Date.now() + o.gueltigTage * 86_400_000);
  const [neu] = await tx
    .insert(schema.einladung)
    .values({
      email,
      name: o.name.trim(),
      rollen: [],
      gemeindeRollen: ['gemeinde', o.art],
      lernendeId: o.lernendeId,
      tokenHash: sha256(token),
      laeuftAb,
      erstelltVon: o.erstelltVon,
      freigabeNoetig: freigabe,
      sprache: o.sprache,
    })
    .returning({ id: schema.einladung.id });
  const link = freigabe ? null : await planeEinladungsMail(tx, { email, token, laeuftAb, sprache: o.sprache });
  await protokolliere(
    {
      benutzerId: o.erstelltVon,
      aktion: 'einladung.erstellt',
      zielTyp: 'einladung',
      zielId: neu.id,
      details: { gemeindeRolle: o.art, mitLernende: o.lernendeId !== null, freigabeNoetig: freigabe },
    },
    tx,
  );
  return { id: neu.id, neu: true, link };
}
