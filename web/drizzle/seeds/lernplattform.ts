// Lehrplanstufen der Lernplattform (AUFTRAG 3.5): neutrale Platzhalter je Kursart, bis die Lehrkräfte die Stufen
// benennen (MENSCHEN MN-07/MN-16). Keine religiösen Inhalte. Idempotent über (kursart, reihenfolge).
import { holeDb, schema } from '../../src/lib/db';

type Db = ReturnType<typeof holeDb>;

const STUFEN: Record<(typeof schema.kursartEnum.enumValues)[number], number> = { elifbe: 8, kuran: 6, tecvid: 6, ilmihal: 4, hifz: 6 };

export async function lehrplanStufen(db: Db): Promise<number> {
  const werte = Object.entries(STUFEN).flatMap(([kursart, anzahl]) =>
    Array.from({ length: anzahl }, (_, i) => ({
      kursart: kursart as (typeof schema.kursartEnum.enumValues)[number],
      reihenfolge: i + 1,
      titel: {
        de: `Stufe ${i + 1} [Bezeichnung – von der Lehrkraft]`,
        tr: `Seviye ${i + 1} [Ad – öğretmen tarafından]`,
        en: `Level ${i + 1} [Name – from the teacher]`,
      },
    })),
  );
  const r = await db.insert(schema.lehrplanStufe).values(werte).onConflictDoNothing().returning({ id: schema.lehrplanStufe.id });
  return r.length;
}
