import 'server-only';
import { and, eq, gt, inArray, isNull, lte, min, ne, or } from 'drizzle-orm';
import { ladeKanal, leseLage } from '@/lib/chat/dienst';
import { db, schema } from '@/lib/db';
import { funktionAn } from '@/lib/funktionen';
import { ladeGruppenKontext } from '@/lib/rechte/gemeinde';
import type { GruppenKontext } from '@/lib/rechte/gruppen';
import { darfBenachrichtigen } from './ankuendigung';
import { KEIN_NEUES, type NeuesZaehlung, type ZusammenfassungThema } from './rueckfall';

/**
 * Was ist seit einem Zeitpunkt neu? (ADR 0034 Nr. 6, F-38) – Grundlage der täglichen Mail-Zusammenfassung und des
 * Hinweises in Mein Bereich. Gezählt wird nur, was die Person selbst sehen darf, und nur Bereich und Anzahl:
 *
 * - **Chat und Elternkanal:** Gruppen mit Nachrichten anderer (nicht entfernt), die die Person lesen darf – dieselbe
 *   Prüfung wie beim Abruf (`leseLage`: Gruppenrecht, Einwilligung Gruppenchat, Notfall-Pause; S-03, S-17, D-01, D-11).
 * - **Unterricht:** Gruppen mit einem ausgefallenen (oder wieder stattfindenden) Termin – Audit `unterricht.termin_geaendert`
 *   – oder einer neuen Aufgabe, jeweils von anderen.
 * - **Ankündigung:** sichtbare Ankündigungen, deren Sichtbarkeit seither begonnen hat (erste Veröffentlichung laut Audit
 *   `inhalt.veroeffentlicht`, sonst die Anlage; ein späterer Beginn zählt ab dem Beginn). Wie beim Push nur, wenn die
 *   Person, die zuletzt gespeichert hat, benachrichtigen darf (`push.ankuendigung`).
 *
 * Funktionsschalter: Chat braucht `chat` und `lernplattform`, Unterricht `lernplattform`; sonst zählt der Bereich 0.
 */
export type NeuesOptionen = {
  jetzt?: Date;
  /** Kanal, den die Person gerade offen hat (Chat-Seite): Seine Nachrichten sieht sie ohnehin. */
  ohneKanal?: string | null;
  /** Bereits geladener Gruppenkontext (spart Abfragen). */
  kontext?: GruppenKontext;
};

/** Alle Gruppen, zu denen ein Konto gehört: Leitung, eigene Gruppen (Schüler), Gruppen der Kinder (Eltern). */
export function gruppenDes(k: GruppenKontext): string[] {
  const alle = new Set<string>([...k.leitung.keys(), ...k.eigeneGruppen]);
  for (const gruppen of k.kinder.values()) for (const g of gruppen) alle.add(g);
  return [...alle];
}

/** Welche Bereiche zählen für dieses Konto überhaupt? (Schalter und Gruppen) */
export async function aktiveBereiche(kontext: GruppenKontext | null): Promise<Set<ZusammenfassungThema>> {
  const [lernplattform, chat] = await Promise.all([funktionAn('lernplattform'), funktionAn('chat')]);
  const inGruppe = Boolean(lernplattform && kontext && gruppenDes(kontext).length);
  const aktiv = new Set<ZusammenfassungThema>(['ankuendigung']);
  if (inGruppe) aktiv.add('unterricht');
  if (inGruppe && chat) aktiv.add('chat');
  return aktiv;
}

/** Lesbare Kanäle der Gruppen eines Kontos (für Zählung und Echtzeit-Signal). */
export async function lesbareKanaele(kontext: GruppenKontext, jetzt = new Date()): Promise<{ kanalId: string; gruppeId: string }[]> {
  const gruppen = gruppenDes(kontext);
  if (!gruppen.length) return [];
  const kanaele = await db.select({ id: schema.chatKanal.id }).from(schema.chatKanal).where(inArray(schema.chatKanal.gruppeId, gruppen));
  const lesbar: { kanalId: string; gruppeId: string }[] = [];
  for (const { id } of kanaele) {
    const kanal = await ladeKanal(id);
    if (kanal && (await leseLage(kanal, kontext, jetzt)) === 'ok') lesbar.push({ kanalId: kanal.kanalId, gruppeId: kanal.gruppeId });
  }
  return lesbar;
}

async function zaehleChat(kontext: GruppenKontext, seit: Date, jetzt: Date, ohneKanal: string | null): Promise<number> {
  const gruppen = gruppenDes(kontext);
  if (!gruppen.length) return 0;
  const n = schema.chatNachricht;
  const k = schema.chatKanal;
  // Erst die (seltenen) Kanäle mit neuen Nachrichten anderer, dann nur für sie das Leserecht prüfen
  const kandidaten = await db
    .selectDistinct({ kanalId: k.id })
    .from(n)
    .innerJoin(k, eq(k.id, n.kanalId))
    .where(
      and(
        inArray(k.gruppeId, gruppen),
        gt(n.erstelltAm, seit),
        isNull(n.entferntAm),
        or(isNull(n.absenderId), ne(n.absenderId, kontext.benutzerId)),
        ohneKanal ? ne(k.id, ohneKanal) : undefined,
      ),
    );
  const mitNeuem = new Set<string>();
  for (const { kanalId } of kandidaten) {
    const kanal = await ladeKanal(kanalId);
    if (kanal && (await leseLage(kanal, kontext, jetzt)) === 'ok') mitNeuem.add(kanal.gruppeId);
  }
  return mitNeuem.size;
}

async function zaehleUnterricht(kontext: GruppenKontext, seit: Date): Promise<number> {
  const gruppen = gruppenDes(kontext);
  if (!gruppen.length) return 0;
  const a = schema.auditEintrag;
  const auf = schema.aufgabe;
  const [termine, aufgaben] = await Promise.all([
    db
      .selectDistinct({ gruppeId: a.zielId })
      .from(a)
      .where(
        and(
          eq(a.aktion, 'unterricht.termin_geaendert'),
          eq(a.zielTyp, 'gruppe'),
          inArray(a.zielId, gruppen),
          gt(a.zeitpunkt, seit),
          or(isNull(a.benutzerId), ne(a.benutzerId, kontext.benutzerId)),
        ),
      ),
    db
      .selectDistinct({ gruppeId: auf.gruppeId })
      .from(auf)
      .where(
        and(inArray(auf.gruppeId, gruppen), gt(auf.erstelltAm, seit), or(isNull(auf.erstelltVon), ne(auf.erstelltVon, kontext.benutzerId))),
      ),
  ]);
  return new Set([...termine.map((t) => t.gruppeId), ...aufgaben.map((x) => x.gruppeId)]).size;
}

async function zaehleAnkuendigungen(seit: Date, jetzt: Date): Promise<number> {
  const v = schema.ankuendigung;
  const sichtbar = await db
    .select({ id: v.id, sichtbarAb: v.sichtbarAb, erstelltAm: v.erstelltAm, aktualisiertVon: v.aktualisiertVon })
    .from(v)
    .where(
      and(
        eq(v.status, 'veroeffentlicht'),
        isNull(v.imPapierkorbSeit),
        or(isNull(v.sichtbarAb), lte(v.sichtbarAb, jetzt)),
        or(isNull(v.laeuftAb), gt(v.laeuftAb, jetzt)),
      ),
    );
  if (!sichtbar.length) return 0;
  const a = schema.auditEintrag;
  const erste = new Map(
    (
      await db
        .select({ id: a.zielId, am: min(a.zeitpunkt) })
        .from(a)
        .where(
          and(
            eq(a.aktion, 'inhalt.veroeffentlicht'),
            eq(a.zielTyp, 'ankuendigung'),
            inArray(
              a.zielId,
              sichtbar.map((z) => z.id),
            ),
          ),
        )
        .groupBy(a.zielId)
    ).map((z) => [z.id, z.am]),
  );
  const darf = new Map<string, boolean>();
  let anzahl = 0;
  for (const z of sichtbar) {
    const veroeffentlicht = erste.get(z.id) ?? z.erstelltAm;
    const beginn = Math.max(veroeffentlicht.getTime(), z.sichtbarAb?.getTime() ?? 0);
    if (beginn <= seit.getTime()) continue;
    const wer = z.aktualisiertVon ?? '';
    if (!darf.has(wer)) darf.set(wer, await darfBenachrichtigen(z.aktualisiertVon));
    if (darf.get(wer)) anzahl++;
  }
  return anzahl;
}

/**
 * Neues seit `seit` für ein Konto in den gewünschten Bereichen. Bereiche, die für das Konto nicht aktiv sind (Schalter,
 * keine Gruppe), zählen 0.
 */
export async function zaehleNeues(
  benutzerId: string,
  seit: Date,
  themen: readonly ZusammenfassungThema[],
  o: NeuesOptionen = {},
): Promise<NeuesZaehlung> {
  const jetzt = o.jetzt ?? new Date();
  const kontext = o.kontext ?? (await ladeGruppenKontext(benutzerId));
  const aktiv = await aktiveBereiche(kontext);
  const soll = (t: ZusammenfassungThema) => themen.includes(t) && aktiv.has(t);
  const [chat, unterricht, ankuendigung] = await Promise.all([
    soll('chat') ? zaehleChat(kontext, seit, jetzt, o.ohneKanal ?? null) : 0,
    soll('unterricht') ? zaehleUnterricht(kontext, seit) : 0,
    soll('ankuendigung') ? zaehleAnkuendigungen(seit, jetzt) : 0,
  ]);
  return { ...KEIN_NEUES, chat, unterricht, ankuendigung };
}
