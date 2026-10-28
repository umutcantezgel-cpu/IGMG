import { Landmark } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Verweisliste } from '@/components/website/dachverband/Verweisliste';

/** Angaben aus der Satzung der IGMG in dieser Reihenfolge: § 4.4 (wer, zu welcher Gemeinde), § 5 (Antrag), § 7.3 (Beitrag). */
export const FOERDER_PUNKTE = ['wer', 'gemeinde', 'antrag', 'beitrag'] as const;

/**
 * Kasten „Fördermitglied der IGMG“ in der Seitenspalte von /mitglied-werden (Plan Marktstart P7): eigene Worte nach der
 * Satzung der IGMG (§ 4.4, § 5, § 7.3), klar getrennt von der Anmeldung zur Gemeinde – zwei verschiedene Vereine. Das
 * Antragsformular des Dachverbands wird nur verlinkt, nicht eingebettet (fremdes Formular mit reCAPTCHA, K-14). Keine
 * Beträge. Server-Komponente ohne Client-Code (K-12).
 */
export async function FoerdermitgliedKasten() {
  const t = await getTranslations('mitglied.foerder');
  return (
    <section
      aria-labelledby="mitglied-foerder"
      data-mitglied="foerder"
      className="flex flex-col gap-4 rounded-lg border border-linie bg-weiss p-6"
    >
      <h2 id="mitglied-foerder" className="flex items-center gap-2.5 text-24 leading-ueberschrift">
        <Landmark aria-hidden className="size-6 shrink-0 text-gruen-700" />
        {t('titel')}
      </h2>
      <p className="text-16 text-pretty">{t('text')}</p>
      <h3 id="mitglied-foerder-satzung" className="text-18 font-bold">
        {t('punkteTitel')}
      </h3>
      <ul aria-labelledby="mitglied-foerder-satzung" className="m-0 flex list-disc flex-col gap-2 ps-5 text-16 text-tinte-2">
        {FOERDER_PUNKTE.map((p) => (
          <li key={p}>{t(`punkte.${p}`)}</li>
        ))}
      </ul>
      <p className="text-16 text-tinte-2">{t('quelle')}</p>
      <Verweisliste eintraege={['mitgliedschaft', 'satzung']} mitBeschreibung={false} />
    </section>
  );
}
