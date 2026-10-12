import { Check } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

/**
 * Abschnitt „Allgemeine Informationen“ (design/QuranCourses.dc.html Z29–35, Blatt S19 Abschnitt 3):
 * Voraussetzungen und „Was Sie mitbringen sollten“ als zwei Listen. Feste Texte aus messages/bereiche/korankurse.json.
 * H-B14: direkt auf dem Papier (ohne Kartenrahmen), Abschnittsüberschrift in derselben Stufe wie „Unsere Kursangebote“ (ohne Icon), ein
 * Häkchen-Stil für beide Listen.
 */
export async function AllgemeineInformationen() {
  const t = await getTranslations('korankurse');
  return (
    <section aria-labelledby="info" className="@container grid gap-5 lg:grid-cols-3 lg:gap-8">
      <h2 id="info" className="text-display-2">
        {t('infoUeberschrift')}
      </h2>
      {/* Ab lg: Überschrift in Spalte 1, Listen in Spalte 2–3. Zwei Listen nebeneinander ab 448 px Breite des Abschnitts (Containerabfrage), sonst untereinander */}
      <div className="grid gap-6 lg:col-span-2 @md:grid-cols-2">
        <Liste ueberschrift={t('voraussetzungen')} eintraege={[t('vor1'), t('vor2'), t('vor3'), t('vor4')]} />
        <Liste ueberschrift={t('mitbringen')} eintraege={[t('mit1'), t('mit2'), t('mit3'), t('mit4')]} />
      </div>
    </section>
  );
}

function Liste({ ueberschrift, eintraege }: { ueberschrift: string; eintraege: string[] }) {
  return (
    <div>
      <h3 className="mb-2 font-text text-20 font-bold">{ueberschrift}</h3>
      <ul className="flex flex-col gap-1.5">
        {eintraege.map((eintrag) => (
          <li key={eintrag} className="flex items-start gap-2.5">
            <span className="flex pt-0.75 text-gruen-700">
              <Check aria-hidden className="size-5" />
            </span>
            {eintrag}
          </li>
        ))}
      </ul>
    </div>
  );
}
