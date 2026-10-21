// Abfrage am Live-Stand für den Koran-Arabisch-Pfad (Tor L6, Z-L03; ADR 0040 Nr. 5, KERN 4.0 §2.3): baut die Pakete beider
// Sprachen aus der Datenbank und prüft jede gezeigte Bedeutung unabhängig von freigabe.ts gegen `quran_wortbedeutung` und
// `lernapp_pruefung` (zwei Personen mit Rolle `religioese_pruefung`, „ok“ zum aktuellen Inhalts-Hash, keine Verfasser, kein
// Einwand), dazu Wortformen nur aus `quran_wort`, kein Audio-Feld, Wortzeiten nur geprüft. Ausgabe nur Zahlen und Stellen
// (keine Texte, keine Personen). Liest DATABASE_URL aus web/.env (sonst PGlite der Entwicklung).
// Aufruf: pnpm lernapp:koran-sichtbar   (Rückgabe 1 bei Verstößen)
import { pruefeKoranSichtbarkeit } from '../../src/server/queries/lernapp/koran';

async function main() {
  const { sichtbar, lektionen, verstoesse } = await pruefeKoranSichtbarkeit();
  console.log(`Koran-Pfad: ${sichtbar} gezeigte Bedeutungen, ${lektionen} Lektionen mit Übungen, ${verstoesse.length} Verstöße`);
  for (const v of verstoesse) console.log(`- ${v}`);
  return verstoesse.length ? 1 : 0;
}

main()
  .then((code) => process.exit(code))
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  });
