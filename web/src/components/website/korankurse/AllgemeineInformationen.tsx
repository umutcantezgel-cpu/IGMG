import { Check, CircleCheck, Info, type LucideIcon } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

/**
 * Abschnitt „Allgemeine Informationen“ (design/QuranCourses.dc.html Z29–35, Blatt S19 Abschnitt 3):
 * Voraussetzungen und „Was Sie mitbringen sollten“ als zwei Listen. Feste Texte aus messages/bereiche/korankurse.json.
 */
export async function AllgemeineInformationen() {
  const t = await getTranslations('korankurse');
  return (
    <section aria-labelledby="info" className="flex flex-[1_1_420px] flex-col gap-5 rounded-lg border border-linie bg-weiss p-5 md:p-8">
      <h2 id="info" className="flex items-center gap-2.5 text-30">
        <Info aria-hidden className="size-7 text-gruen-700" />
        {t('infoUeberschrift')}
      </h2>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6">
        <Liste ueberschrift={t('voraussetzungen')} eintraege={[t('vor1'), t('vor2'), t('vor3'), t('vor4')]} Icon={CircleCheck} />
        <Liste ueberschrift={t('mitbringen')} eintraege={[t('mit1'), t('mit2'), t('mit3'), t('mit4')]} Icon={Check} />
      </div>
    </section>
  );
}

function Liste({ ueberschrift, eintraege, Icon }: { ueberschrift: string; eintraege: string[]; Icon: LucideIcon }) {
  return (
    <div>
      <h3 className="mb-2 font-text text-20 font-bold">{ueberschrift}</h3>
      <ul className="flex flex-col gap-1.5">
        {eintraege.map((eintrag) => (
          <li key={eintrag} className="flex items-start gap-2.5">
            <span className="flex pt-[3px] text-gruen-700">
              <Icon aria-hidden className="size-5" />
            </span>
            {eintrag}
          </li>
        ))}
      </ul>
    </div>
  );
}
