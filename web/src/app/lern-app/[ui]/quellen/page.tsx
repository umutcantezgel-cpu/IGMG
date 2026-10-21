import type { Metadata } from 'next';
import { Rahmen } from '@/components/lernapp/Rahmen';
import { Seitenkopf } from '@/components/lernapp/Seitenkopf';
import { STIMMEN } from '@/lib/lernapp/audio/stimmen';
import { SPRACHEN } from '@/lib/lernapp/kurse';
import { LIZENZTEXTE, type LizenzName } from '@/lib/lernapp/lizenztexte';
import { BIBLIOTHEKEN, SCHRIFTEN, SPRACHERKENNUNG, type LernQuelle } from '@/lib/lernapp/quellen';
import { lernMetadaten, oberflaeche, verlangeLernApp } from '@/lib/lernapp/seite';
import { lernTexte } from '@/lib/lernapp/texte';

export const ensureStatic = 'navigation';

export async function generateMetadata(): Promise<Metadata> {
  const ui = await oberflaeche();
  return lernMetadaten({ ui, pfad: 'quellen', titel: lernTexte(ui)('quellen.titel') });
}

const LIZENZ_NAME: Record<LizenzName, string> = {
  MIT: 'MIT',
  ISC: 'ISC',
  'OFL-1.1': 'SIL Open Font License 1.1',
  'Apache-2.0': 'Apache License 2.0',
};

/**
 * Quellen und Lizenzen der Lern-App (ADR 0044 Nr. 7, KERN 4.0 §1): Lizenz der Lerninhalte, Programmbibliotheken im
 * Browser, Spracherkennung (ADR 0042 Nr. 3 und 10), Sprachausgabe (synthetische Stimmen mit Namensnennung, ADR 0039 Nr. 9,
 * ADR 0045 Nr. 11) und Schriften mit Urheber, Fassung, Lizenz und Lizenztext. Ohne Links nach außen (die Seite ist auch ohne Netz
 * vollständig; Adressen stehen als Text). Lizenztexte englisch wie im Original, mit `lang="en"`.
 */
export default async function Quellen() {
  await verlangeLernApp();
  const ui = await oberflaeche();
  const t = lernTexte(ui);
  const mitStimme = SPRACHEN.filter((x) => STIMMEN[x]);
  const ohneStimme = SPRACHEN.filter((x) => !STIMMEN[x]);
  const liste = (id: string, titel: string, eintraege: readonly LernQuelle[], text?: string) => {
    const lizenzen = [...new Set(eintraege.map((e) => e.lizenz))];
    return (
      <section aria-labelledby={id} className="flex flex-col gap-4">
        <h2 id={id} className="text-display-2">
          {titel}
        </h2>
        {text ? <p className="max-w-einleitung text-18 text-tinte-2">{text}</p> : null}
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
        {liste('spracherkennung', t('quellen.spracherkennungTitel'), SPRACHERKENNUNG, t('quellen.spracherkennungText'))}
        <section aria-labelledby="sprachausgabe" className="flex flex-col gap-4">
          <h2 id="sprachausgabe" className="text-display-2">
            {t('sprachausgabe.titel')}
          </h2>
          <p className="max-w-einleitung text-18 text-tinte-2">{t('sprachausgabe.text')}</p>
          <ul className="grid raster-karten gap-4">
            {mitStimme.map((sprache) => {
              const s = STIMMEN[sprache]!;
              return (
                <li key={s.id} className="flex flex-col gap-2 rounded-lg border border-linie bg-weiss p-5">
                  <p className="self-start rounded-pill bg-sand px-3 py-0.5 text-16 font-bold text-tinte-2">
                    {t('sprachausgabe.synthetisch')}
                  </p>
                  <h3 lang="de" dir="ltr" className="self-start text-24 leading-ueberschrift">
                    {s.bezeichnung}
                  </h3>
                  <dl className="grid raster-symbol gap-x-4 gap-y-1 text-16">
                    <dt className="font-bold">{t('sprachausgabe.sprache')}</dt>
                    <dd className="text-start">{t(`sprachausgabe.sprachen.${sprache}`)}</dd>
                    <dt className="font-bold">{t('sprachausgabe.stimme')}</dt>
                    <dd lang="de" dir="ltr" className="text-start">
                      {s.urheber}
                    </dd>
                    <dt className="font-bold">{t('sprachausgabe.daten')}</dt>
                    <dd dir="ltr" className="text-start break-all">
                      {s.datenLizenz} · {s.datenAdresse}
                    </dd>
                    <dt className="font-bold">{t('sprachausgabe.modell')}</dt>
                    <dd dir="ltr" className="text-start break-all">
                      {LIZENZ_NAME[s.modellLizenz]} · {s.modellAdresse}
                    </dd>
                    <dt className="font-bold">{t('sprachausgabe.kennung')}</dt>
                    <dd dir="ltr" className="text-start break-all">
                      {s.id}
                    </dd>
                    <dt className="font-bold">{t('sprachausgabe.namensnennung')}</dt>
                    <dd lang="de" dir="ltr" className="text-start">
                      {s.namensnennung}
                    </dd>
                  </dl>
                </li>
              );
            })}
          </ul>
          {ohneStimme.length ? (
            <p className="max-w-einleitung text-18 text-tinte-2">
              {t('sprachausgabe.ohneStimme', {
                sprachen: new Intl.ListFormat(ui, { type: 'conjunction' }).format(ohneStimme.map((x) => t(`sprachausgabe.sprachen.${x}`))),
              })}
            </p>
          ) : null}
          {[...new Set(mitStimme.map((x) => STIMMEN[x]!.modellLizenz))].map((l) => (
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
        {liste('schriften', t('quellen.schriftenTitel'), SCHRIFTEN)}
      </div>
    </Rahmen>
  );
}
