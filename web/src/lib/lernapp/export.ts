import 'server-only';
import { asc, eq } from 'drizzle-orm';
import { db, schema } from '@/lib/db';

/**
 * Lern-App-Daten eines Kontos für den Datenexport nach Art. 15 und 20 DSGVO (S-L3 N-2), maschinenlesbar: Lernprofil,
 * Ereignisprotokoll (wie es der Abgleich speichert), Kartenstand, Lerntage je Tag und je Kurs, Zustimmung zur Bestenliste
 * und Einstellung der Familien-Bestenliste. Schreibabgaben liefert `abgabenFuerExport` (`schreiben/dienst.ts`). Ohne
 * Daten anderer Personen.
 */
export async function lernappFuerExport(benutzerId: string): Promise<Record<string, unknown>> {
  const [profil, ereignisse, karten, tage, tageJeKurs, bestenliste, familie] = await Promise.all([
    db
      .select({
        oberflaeche: schema.lernappProfil.oberflaeche,
        ausgangssprache: schema.lernappProfil.ausgangssprache,
        angelegtAm: schema.lernappProfil.angelegtAm,
        zuletztAktivAm: schema.lernappProfil.zuletztAktivAm,
      })
      .from(schema.lernappProfil)
      .where(eq(schema.lernappProfil.benutzerId, benutzerId)),
    db
      .select({
        geraet: schema.lernappEreignis.geraet,
        seq: schema.lernappEreignis.seq,
        am: schema.lernappEreignis.am,
        tag: schema.lernappEreignis.tag,
        art: schema.lernappEreignis.art,
        daten: schema.lernappEreignis.daten,
        empfangenAm: schema.lernappEreignis.empfangenAm,
      })
      .from(schema.lernappEreignis)
      .where(eq(schema.lernappEreignis.benutzerId, benutzerId))
      .orderBy(asc(schema.lernappEreignis.id)),
    db
      .select({
        karte: schema.lernappKarte.karte,
        zustand: schema.lernappKarte.zustand,
        faellig: schema.lernappKarte.faellig,
        basis: schema.lernappKarte.basis,
        basisBis: schema.lernappKarte.basisBis,
        aktualisiertAm: schema.lernappKarte.aktualisiertAm,
      })
      .from(schema.lernappKarte)
      .where(eq(schema.lernappKarte.benutzerId, benutzerId))
      .orderBy(asc(schema.lernappKarte.karte)),
    db
      .select({
        tag: schema.lernappTag.tag,
        xp: schema.lernappTag.xp,
        lektionen: schema.lernappTag.lektionen,
        pause: schema.lernappTag.pause,
        zielErreicht: schema.lernappTag.zielErreicht,
      })
      .from(schema.lernappTag)
      .where(eq(schema.lernappTag.benutzerId, benutzerId))
      .orderBy(asc(schema.lernappTag.tag)),
    db
      .select({
        tag: schema.lernappTagKurs.tag,
        kurs: schema.lernappTagKurs.kurs,
        xp: schema.lernappTagKurs.xp,
        lektionen: schema.lernappTagKurs.lektionen,
      })
      .from(schema.lernappTagKurs)
      .where(eq(schema.lernappTagKurs.benutzerId, benutzerId))
      .orderBy(asc(schema.lernappTagKurs.tag), asc(schema.lernappTagKurs.kurs)),
    db
      .select({ textVersion: schema.lernappRanglisteZustimmung.textVersion, erteiltAm: schema.lernappRanglisteZustimmung.erteiltAm })
      .from(schema.lernappRanglisteZustimmung)
      .where(eq(schema.lernappRanglisteZustimmung.benutzerId, benutzerId)),
    db
      .select({ bestenliste: schema.lernappFamilie.bestenliste, geaendertAm: schema.lernappFamilie.geaendertAm })
      .from(schema.lernappFamilie)
      .where(eq(schema.lernappFamilie.elternId, benutzerId)),
  ]);
  return {
    profil: profil[0] ?? null,
    ereignisse,
    karten,
    tage,
    tageJeKurs,
    bestenlisteZustimmung: bestenliste[0] ?? null,
    familienBestenliste: familie[0] ?? null,
  };
}
