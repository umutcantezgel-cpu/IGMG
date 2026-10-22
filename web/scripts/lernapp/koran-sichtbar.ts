// Abfrage am Live-Stand für den Koran-Arabisch-Pfad (Tor L6, Z-L03; ADR 0040 Nr. 5, KERN 4.0 §2.3): prüft jede gezeigte
// Bedeutung der Pakete beider Sprachen unabhängig von freigabe.ts gegen `quran_wortbedeutung` und `lernapp_pruefung` (zwei
// Personen mit Rolle `religioese_pruefung`, „ok“ zum aktuellen Inhalts-Hash, keine Verfasser, kein Einwand, kein Website-
// Entwurf), dazu Wortformen nur aus `quran_wort`, kein Audio-Feld, Wortzeiten nur geprüft. Ausgabe nur Zahlen und Stellen
// (keine Texte, keine Personen). Liest DATABASE_URL aus web/.env (sonst PGlite der Entwicklung).
//   pnpm lernapp:koran-sichtbar                      Pakete frisch aus der Datenbank gebaut
//   pnpm lernapp:koran-sichtbar --basis https://…    Pakete, wie die Adressen sie gerade ausliefern (Daten-Cache, CDN);
//                                                    findet so auch eine veraltete Auslieferung
// Rückgabe 1 bei Verstößen.
import { parseArgs } from 'node:util';
import { ausgeliefert, frischGebaut, pruefeKoranSichtbarkeit } from '../../src/server/queries/lernapp/koran';

async function main() {
  const { values } = parseArgs({ options: { basis: { type: 'string' } } });
  const quelle = values.basis ? ausgeliefert(new URL(values.basis).origin) : frischGebaut;
  const { sichtbar, lektionen, verstoesse } = await pruefeKoranSichtbarkeit(quelle);
  console.log(
    `Koran-Pfad (${values.basis ? 'ausgeliefert' : 'frisch gebaut'}): ${sichtbar} gezeigte Bedeutungen, ${lektionen} Lektionen mit Übungen, ${verstoesse.length} Verstöße`,
  );
  for (const v of verstoesse) console.log(`- ${v}`);
  return verstoesse.length ? 1 : 0;
}

main()
  .then((code) => process.exit(code))
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  });
