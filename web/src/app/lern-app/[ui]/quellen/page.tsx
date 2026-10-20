import type { Metadata } from 'next';
import { Rahmen } from '@/components/lernapp/Rahmen';
import { Seitenkopf } from '@/components/lernapp/Seitenkopf';
import { LIZENZTEXTE, type LizenzName } from '@/lib/lernapp/lizenztexte';
import { BIBLIOTHEKEN, SCHRIFTEN, type LernQuelle } from '@/lib/lernapp/quellen';
import { lernMetadaten, oberflaeche, verlangeLernApp } from '@/lib/lernapp/seite';
import { lernTexte } from '@/lib/lernapp/texte';

export const ensureStatic = 'navigation';

export async function generateMetadata(): Promise<Metadata> {
  const ui = await oberflaeche();
  return lernMetadaten({ ui, pfad: 'quellen', titel: lernTexte(ui)('quellen.titel') });
}

const LIZENZ_NAME: Record<LizenzName, string> = { MIT: 'MIT', ISC: 'ISC', 'OFL-1.1': 'SIL Open Font License 1.1' };

/**
 * Quellen und Lizenzen der Lern-App (ADR 0044 Nr. 7, KERN 4.0 §1): Lizenz der Lerninhalte, Programmbibliotheken im
 * Browser und Schriften mit Urheber, Fassung, Lizenz und Lizenztext. Ohne Links nach außen (die Seite ist auch ohne Netz
 * vollständig; Adressen stehen als Text). Lizenztexte englisch wie im Original, mit `lang="en"`.
 */
export default async function Quellen() {
  await verlangeLernApp();
  const ui = await oberflaeche();
  const t = lernTexte(ui);
  const liste = (id: string, titel: string, eintraege: readonly LernQuelle[]) => {
    const lizenzen = [...new Set(eintraege.map((e) => e.lizenz))];
    return (
      <section aria-labelledby={id} className="flex flex-col gap-4">
        <h2 id={id} className="text-display-2">
          {titel}
        </h2>
        <ul className="grid raster-karten gap-4">
          {eintraege.map((e) => (
            <li key={e.id} className="flex flex-col gap-2 rounded-lg border border-linie bg-weiss p-5">
              <h3 lang="en" dir="ltr" className="self-start text-24 leading-ueberschrift">
                {e.name}
              </h3>
              <dl className="grid raster-symbol gap-x-4 gap-y-1 text-16">
                <dt className="font-bold">{t('quellen.urheber')}</dt>
                <dd lang="en" dir="ltr" className="text-start">
                  {e.urheber}
                </dd>
                <dt className="font-bold">{t('quellen.version')}</dt>
                <dd dir="ltr" className="text-start tabular-nums">
                  {e.version}
                </dd>
                <dt className="font-bold">{t('quellen.lizenz')}</dt>
                <dd dir="ltr" className="text-start">
                  {LIZENZ_NAME[e.lizenz]}
                </dd>
                <dt className="font-bold">{t('quellen.adresse')}</dt>
                <dd dir="ltr" className="text-start break-all">
                  {e.adresse}
                </dd>
              </dl>
            </li>
          ))}
        </ul>
        {lizenzen.map((l) => (
          <details key={l} className="rounded-lg border border-linie bg-weiss">
            <summary className="flex min-h-12 cursor-pointer items-center px-5 py-3 font-bold">
              {t('quellen.lizenztext', { name: LIZENZ_NAME[l] })}
            </summary>
            <pre lang="en" dir="ltr" className="overflow-x-auto px-5 pb-5 font-text text-16 whitespace-pre-wrap">
              {LIZENZTEXTE[l]}
            </pre>
          </details>
        ))}
      </section>
    );
  };
  return (
    <Rahmen ui={ui} bereich={null} pfad="quellen">
      <Seitenkopf titel={t('quellen.titel')} einleitung={t('quellen.einleitung')} />
      <div className="flex flex-col gap-abschnitt-klein">
        <section aria-labelledby="inhalte" className="flex max-w-einleitung flex-col gap-2">
          <h2 id="inhalte" className="text-display-2">
            {t('quellen.inhalteTitel')}
          </h2>
          <p className="text-18 text-tinte-2">{t('quellen.inhalteText')}</p>
        </section>
        {liste('bibliotheken', t('quellen.softwareTitel'), BIBLIOTHEKEN)}
        {liste('schriften', t('quellen.schriftenTitel'), SCHRIFTEN)}
      </div>
    </Rahmen>
  );
}
