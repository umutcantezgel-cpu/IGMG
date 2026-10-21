import type { Metadata } from 'next';
import { Rahmen } from '@/components/lernapp/Rahmen';
import { Seitenkopf } from '@/components/lernapp/Seitenkopf';
import { STIMMEN } from '@/lib/lernapp/audio/stimmen';
import { SPRACHEN } from '@/lib/lernapp/kurse';
import { LIZENZTEXTE, type LizenzName } from '@/lib/lernapp/lizenztexte';
import {
  BIBLIOTHEKEN,
  BILDKARTEN,
  DATEN,
  DATEN_LIZENZEN,
  ORT_DRITTLIZENZEN,
  SCHRIFTEN,
  SPRACHERKENNUNG,
  type DatenQuelle,
  type LernQuelle,
} from '@/lib/lernapp/quellen';
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
 * Quellen und Lizenzen der Lern-App (ADR 0044 Nr. 7, ADR 0045 Nr. 15, KERN 4.0 §1, Z-L17): Lizenz der Lerninhalte, gepinnte
 * Daten mit Namensnennung (Sprachdaten, Koran und Hadith nur als Verweis und Prüfgrundlage, L8-03), Bildkarten,
 * Programmbibliotheken im Browser, Spracherkennung mit den Drittlizenzen von ONNX Runtime (ADR 0042 Nr. 3 und 10),
 * Sprachausgabe (synthetische Stimmen mit Namensnennung und Herkunftskette, ADR 0039 Nr. 9, ADR 0045 Nr. 11) und Schriften
 * mit Urheber, Fassung, Lizenz und Lizenztext. Ohne Links nach außen (die Seite ist auch ohne Netz vollständig; Adressen stehen
 * als Text); einziger Link ist der Volltext der Drittlizenzen vom eigenen Ursprung. Lizenztexte englisch wie im Original, mit
 * `lang="en"`.
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
  const daten = (id: string, titel: string, text: string, gruppe: DatenQuelle['gruppe']) => (
    <section aria-labelledby={id} className="flex flex-col gap-4">
      <h2 id={id} className="text-display-2">
        {titel}
      </h2>
      <p className="max-w-einleitung text-18 text-tinte-2">{text}</p>
      <ul className="grid raster-karten gap-4">
        {DATEN.filter((d) => d.gruppe === gruppe).map((d) => (
          <li key={d.id} id={`quelle-${d.id}`} className="flex flex-col gap-2 rounded-lg border border-linie bg-weiss p-5">
            <h3 lang="en" dir="ltr" className="self-start text-24 leading-ueberschrift">
              {d.name}
            </h3>
            <dl className="grid raster-symbol gap-x-4 gap-y-1 text-16">
              <dt className="font-bold">{t('quellen.urheber')}</dt>
              <dd lang="en" dir="ltr" className="text-start">
                {d.urheber}
              </dd>
              <dt className="font-bold">{t('lizenzverzeichnis.stand')}</dt>
              <dd dir="ltr" className="text-start tabular-nums">
                {d.version}
              </dd>
              <dt className="font-bold">{t('quellen.lizenz')}</dt>
              <dd className="text-start break-all">
                <bdi dir="ltr">
                  {DATEN_LIZENZEN[d.lizenz].name} · {DATEN_LIZENZEN[d.lizenz].adresse}
                </bdi>
                {d.auchLizenz ? (
                  <span className="block">{t('lizenzverzeichnis.teilmenge', { lizenz: DATEN_LIZENZEN[d.auchLizenz].name })}</span>
                ) : null}
              </dd>
              <dt className="font-bold">{t('quellen.adresse')}</dt>
              <dd dir="ltr" className="text-start break-all">
                {d.adresse}
              </dd>
              <dt className="font-bold">{t('lizenzverzeichnis.verwendung')}</dt>
              <dd className="text-start">{t(`lizenzverzeichnis.verwendungen.${d.id}`)}</dd>
              <dt className="font-bold">{t('lizenzverzeichnis.namensnennung')}</dt>
              <dd lang="de" dir="ltr" className="text-start wrap-anywhere">
                {d.namensnennung}
              </dd>
            </dl>
          </li>
        ))}
      </ul>
    </section>
  );
  const aufzaehlung = new Intl.ListFormat(ui, { type: 'conjunction' });
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
        {daten('sprachdaten', t('lizenzverzeichnis.datenTitel'), t('lizenzverzeichnis.datenText'), 'sprache')}
        {daten('quelltexte', t('lizenzverzeichnis.religionTitel'), t('lizenzverzeichnis.religionText'), 'religion')}
        <section aria-labelledby="bildkarten" className="flex max-w-einleitung flex-col gap-2">
          <h2 id="bildkarten" className="text-display-2">
            {t('lizenzverzeichnis.bildkartenTitel')}
          </h2>
          <p className="text-18 text-tinte-2">
            {t('lizenzverzeichnis.bildkartenText', {
              quelle: BILDKARTEN.quelle,
              version: BILDKARTEN.version,
              lizenz: LIZENZ_NAME[BILDKARTEN.lizenz],
            })}
          </p>
          <p className="text-18 text-tinte-2">
            {t('lizenzverzeichnis.bildkartenFeather', {
              urheber: BILDKARTEN.feather.urheber,
              lizenz: LIZENZ_NAME[BILDKARTEN.feather.lizenz],
              symbole: aufzaehlung.format(BILDKARTEN.feather.symbole),
            })}
          </p>
        </section>
        {liste('bibliotheken', t('quellen.softwareTitel'), BIBLIOTHEKEN)}
        {liste('spracherkennung', t('quellen.spracherkennungTitel'), SPRACHERKENNUNG, t('quellen.spracherkennungText'))}
        <section aria-labelledby="drittlizenzen" className="flex max-w-einleitung flex-col gap-2">
          <h2 id="drittlizenzen" className="text-display-2">
            {t('lizenzverzeichnis.drittlizenzenTitel')}
          </h2>
          <p className="text-18 text-tinte-2">{t('lizenzverzeichnis.drittlizenzenText', { stand: ORT_DRITTLIZENZEN.stand.slice(0, 7) })}</p>
          <p className="text-18 text-tinte-2">
            {t('lizenzverzeichnis.eigen', {
              name: ORT_DRITTLIZENZEN.eigen.name,
              lizenz: ORT_DRITTLIZENZEN.eigen.lizenz,
              adresse: ORT_DRITTLIZENZEN.eigen.adresse,
            })}
          </p>
          <a
            href={ORT_DRITTLIZENZEN.pfad}
            className="inline-flex min-h-11 items-center self-start font-bold text-gruen-700 underline underline-offset-4 hover:text-gruen-800"
          >
            {t('lizenzverzeichnis.drittlizenzenLink')}
          </a>
        </section>
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
                    <dt className="font-bold">{t('lizenzverzeichnis.gewichte')}</dt>
                    <dd dir="ltr" className="text-start break-all">
                      {s.quelle.modell} · SHA-256 {s.quelle.sha256}
                    </dd>
                    <dt className="font-bold">{t('lizenzverzeichnis.export')}</dt>
                    <dd dir="ltr" className="text-start break-all">
                      {s.quelle.onnxSha256}
                    </dd>
                    <dt className="font-bold">{t('lizenzverzeichnis.erzeugung')}</dt>
                    <dd lang="en" dir="ltr" className="text-start">
                      {s.engine}
                    </dd>
                    <dt className="font-bold">{t('lizenzverzeichnis.wasserzeichen')}</dt>
                    {/* `Stimme.wasserzeichen` ist `false` (Typ); eine Stimme mit Wasserzeichen bräuchte hier dessen Offenlegung (ADR 0039 Nr. 9) */}
                    <dd className="text-start">{t('lizenzverzeichnis.ohneWasserzeichen')}</dd>
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
                sprachen: aufzaehlung.format(ohneStimme.map((x) => t(`sprachausgabe.sprachen.${x}`))),
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
