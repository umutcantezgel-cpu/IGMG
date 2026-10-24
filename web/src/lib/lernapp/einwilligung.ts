import 'server-only';
import { and, desc, eq, or, type SQL } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { funktionAn } from '@/lib/funktionen';
import { berlinerDatum } from '@/lib/gebetszeiten/naechstes';
import { textVersion } from '@/lib/konto/einwilligung';
import type { EinwilligungsLage } from '@/lib/konto/sechzehn';
import { lernappEinwilligungDetail } from './sync/server';

/**
 * Lebenszyklus der Einwilligung `lernapp` in „Mein Bereich“ (S-L3 N-2; Art. 7, 8 und 9 Abs. 2 lit. a DSGVO; Entwurf
 * `docs/recht/entwuerfe/einwilligung-lernapp.md` EL1–EL3):
 * - **Erteilen** nur, wenn ein Schalter mit Personendaten der Lern-App an ist (`lernapp_sync` oder `lernapp_gruppen`):
 *   Personen ab 16 selbst (Konto › Lern-App), Eltern für ihr Kind über die Kinder-Einwilligungen (`KIND_EINWILLIGUNGEN`).
 * - **Widerrufen** jederzeit, auch ohne Schalter (so leicht wie das Erteilen); die Folgen (Schreibabgaben, Lernstand auf
 *   dem Server, Bestenliste) stehen in `lernapp/schreiben/folgen.ts` (`folgenDesWiderrufs`).
 * - **Version:** `<Art>/2026-10-entwurf+sha256:<Hash des angezeigten Wortlauts>` (wie die übrigen Einwilligungen,
 *   `konto/einwilligung.ts`). Die Endung „entwurf“ zeigt: Der Wortlaut ist noch nicht von Datenschutz und Recht freigegeben
 *   (LM-08); die Schalter mit Personendaten bleiben in der Produktion bis dahin aus (Startklar).
 */
export const LERNAPP_TEXTVERSIONEN = {
  /** EL1: Erwachsene */
  erwachsen: 'lernapp/2026-10-entwurf',
  /** EL3: ab 16, noch minderjährig (eigene Einwilligung) */
  ab16: 'lernapp-ab16/2026-10-entwurf',
  /** EL2: Eltern für ein Kind unter 16 (mit Einvernehmen) */
  kind: 'lernapp-kind/2026-10-entwurf',
} as const;
export type LernappTextArt = keyof typeof LERNAPP_TEXTVERSIONEN;

export function lernappTextVersion(art: LernappTextArt, wortlaut: string): string {
  return textVersion(LERNAPP_TEXTVERSIONEN[art], wortlaut);
}

/** Absätze eines Einwilligungstexts (getrennt durch eine Leerzeile) – so angezeigt, so gehasht. */
export const absaetze = (text: string): string[] => text.split('\n\n').filter((a) => a.trim() !== '');

/** Ist ein Schalter mit Personendaten der Lern-App an (Abgleich oder Gruppen)? Nur dann gibt es das Erteilen. */
export async function lernappMitKontoAn(): Promise<boolean> {
  const [sync, gruppen] = await Promise.all([funktionAn('lernapp_sync'), funktionAn('lernapp_gruppen')]);
  return sync || gruppen;
}

/**
 * Welcher Text gilt für die eigene Einwilligung? EL3 („ab 16“) im Übergang nach dem 16. Geburtstag und bis zum
 * 18. Geburtstag bei bekanntem Datum, sonst EL1 (Erwachsene). Rein, ohne Datenbank.
 */
export function eigeneTextArt(lage: EinwilligungsLage, sechzehnAm: string | null, heute: string): 'erwachsen' | 'ab16' {
  if (lage === 'uebergang') return 'ab16';
  if (!sechzehnAm) return 'erwachsen';
  const achtzehn = `${Number(sechzehnAm.slice(0, 4)) + 2}${sechzehnAm.slice(4)}`;
  return heute < achtzehn ? 'ab16' : 'erwachsen';
}

export type EigeneLernappEinwilligung = {
  /** „eltern“: unter 16 bzw. Kinderkonto – die Eltern entscheiden; sonst die Person selbst. */
  lage: EinwilligungsLage;
  textArt: 'erwachsen' | 'ab16';
  /** Eigener Lerndatensatz (die eigene Einwilligung trägt ihn mit, wie bei Gruppenchat und Push ab 16). */
  lernendeId: string | null;
  /** Gilt jetzt eine Einwilligung (eigene oder – vor 16 und im Übergang – die der Eltern)? */
  gilt: boolean;
  /** Eigene, nicht widerrufene Einwilligung. */
  eigene: { erteiltAm: Date } | null;
  /** Zuletzt widerrufen (nur ohne eigene geltende). */
  widerrufenAm: Date | null;
  /** Zustimmung zur Bestenliste (EL4) seit. */
  bestenliste: Date | null;
};

/** Bedingung „Einwilligung `lernapp` dieser Person“: eigene Zeilen und die für ihren Lerndatensatz. */
export function zeilenDerPerson(benutzerId: string, lernendeId: string | null): SQL {
  const k = schema.kontoEinwilligung;
  return and(
    eq(k.art, 'lernapp'),
    lernendeId ? or(eq(k.benutzerId, benutzerId), eq(k.lernendeId, lernendeId)) : eq(k.benutzerId, benutzerId),
  )!;
}

/** Stand der eigenen Einwilligung `lernapp` und der Zustimmung zur Bestenliste für „Mein Bereich › Konto“. */
export async function eigeneLernappEinwilligung(
  benutzerId: string,
  istKind: boolean,
  jetzt = new Date(),
): Promise<EigeneLernappEinwilligung> {
  const [detail, [lernende], [zustimmung]] = await Promise.all([
    lernappEinwilligungDetail(benutzerId, { istKind }, jetzt),
    db
      .select({ id: schema.lernende.id, sechzehnAm: schema.lernende.sechzehnAm })
      .from(schema.lernende)
      .where(eq(schema.lernende.benutzerId, benutzerId))
      .limit(1),
    db
      .select({ seit: schema.lernappRanglisteZustimmung.erteiltAm })
      .from(schema.lernappRanglisteZustimmung)
      .where(eq(schema.lernappRanglisteZustimmung.benutzerId, benutzerId))
      .limit(1),
  ]);
  const k = schema.kontoEinwilligung;
  const eigene = await db
    .select({ erteiltAm: k.erteiltAm, widerrufenAm: k.widerrufenAm })
    .from(k)
    .where(and(zeilenDerPerson(benutzerId, lernende?.id ?? null), eq(k.erteiltVon, benutzerId)))
    .orderBy(desc(k.erteiltAm));
  const aktiv = eigene.find((z) => z.widerrufenAm === null);
  return {
    lage: detail.lage,
    textArt: eigeneTextArt(detail.lage, lernende?.sechzehnAm ?? null, berlinerDatum(jetzt)),
    lernendeId: lernende?.id ?? null,
    gilt: detail.stand === 'erteilt',
    eigene: aktiv ? { erteiltAm: aktiv.erteiltAm } : null,
    widerrufenAm: aktiv ? null : (eigene[0]?.widerrufenAm ?? null),
    bestenliste: zustimmung?.seit ?? null,
  };
}
