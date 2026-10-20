import type { Metadata } from 'next';
import { KursKarte } from '@/components/lernapp/KursKarte';
import { Rahmen } from '@/components/lernapp/Rahmen';
import { Seitenkopf } from '@/components/lernapp/Seitenkopf';
import { AusgangInsel } from '@/components/lernapp/inseln/AusgangInsel';
import { HeuteInsel } from '@/components/lernapp/inseln/HeuteInsel';
import { ChevronDown } from 'lucide-react';
import { lernAdresse } from '@/lib/lernapp/adressen';
import {
  KURS_SLUGS,
  kursInOberflaeche,
  OBERFLAECHEN,
  richtung,
  richtungenAus,
  zerlegeRichtung,
  type Oberflaeche,
  type RichtungId,
} from '@/lib/lernapp/kurse';
import { kursTitel } from '@/lib/lernapp/kurstitel';
import { lernMetadaten, oberflaeche, verlangeLernApp } from '@/lib/lernapp/seite';
import { lernTexte, rohTexte } from '@/lib/lernapp/texte';

export const ensureStatic = 'navigation';

export async function generateMetadata(): Promise<Metadata> {
  const sprache = await oberflaeche();
  return lernMetadaten({ ui: sprache, pfad: '', beschreibung: lernTexte(sprache)('meta.beschreibung') });
}

function Sprachkurse({ ui, richtungen }: { ui: Oberflaeche; richtungen: RichtungId[] }) {
  const t = lernTexte(ui);
  return (
    <ul className="grid raster-karten gap-4">
      {richtungen.map((r) => {
        const { ziel, ausgang } = zerlegeRichtung(r);
        return (
          <KursKarte
            key={r}
            adresse={lernAdresse(ui, r)}
            titel={kursTitel(ui, r)}
            eigenname={{ text: lernTexte(ziel)('sprache.eigenname'), lang: ziel, dir: richtung(ziel) }}
            text={t(`kurse.fuer.${ausgang}`)}
            stufen={t('kurse.stufen')}
          />
        );
      })}
    </ul>
  );
}

/**
 * Start der Lern-App (PLAN §3.1, AUFTRAG §6 Station 1): Insel „Heute“ (Tagesziel, Weiter lernen, fällige Wiederholung
 * aus dem Stand auf dem Gerät), Kurswahl aus `kurse.ts` – zuerst die Sprachkurse der Oberflächensprache, die übrigen
 * Ausgangssprachen aufklappbar; Wissen mit Hinweis „auf Deutsch“ (außer in de), Koran-Arabisch nicht in `ar`.
 * Statisch, ohne Cookies; Schalter `lernapp` aus → 404.
 */
export default async function LernAppStart() {
  await verlangeLernApp();
  const ui = await oberflaeche();
  const t = lernTexte(ui);
  const kurse = KURS_SLUGS.filter((k) => kursInOberflaeche(k, ui));
  const andere = OBERFLAECHEN.filter((s) => s !== ui);
  return (
    <Rahmen ui={ui} bereich="start" pfad="">
      <Seitenkopf titel={t('start.titel')} einleitung={t('start.einleitung')} />
      <div className="flex flex-col gap-abschnitt-klein">
        <HeuteInsel
          ui={ui}
          texte={rohTexte(ui, 'heute')}
          kurse={Object.fromEntries(kurse.map((k) => [k, kursTitel(ui, k)]))}
          adressen={{
            einstellungen: lernAdresse(ui, 'einstellungen'),
            kurs: Object.fromEntries(kurse.map((k) => [k, lernAdresse(ui, k)])),
          }}
        />

        <section aria-labelledby="sprachen" className="flex flex-col gap-6">
          <div className="flex max-w-einleitung flex-col gap-2">
            <h2 id="sprachen" className="text-display-2">
              {t('kurse.sprachenTitel')}
            </h2>
            <p className="text-18 text-pretty text-tinte-2">{t('kurse.sprachenText')}</p>
          </div>
          <Sprachkurse ui={ui} richtungen={richtungenAus(ui)} />
          <div className="flex flex-col gap-3">
            <h3 className="text-24">{t('kurse.andere')}</h3>
            {andere.map((ausgang) => (
              <details key={ausgang} id={`kurse-aus-${ausgang}`} className="group rounded-lg border border-linie bg-weiss">
                <summary className="flex min-h-12 cursor-pointer items-center gap-3 px-5 py-3 font-bold">
                  <ChevronDown
                    aria-hidden
                    className="size-5 shrink-0 text-gruen-700 group-open:rotate-180 motion-safe:transition-transform"
                  />
                  <span lang={ausgang} dir={richtung(ausgang)}>
                    {lernTexte(ausgang)('sprache.eigenname')}
                  </span>
                  <span className="font-normal text-tinte-2">{t(`kurse.fuer.${ausgang}`)}</span>
                </summary>
                <div className="px-5 pb-5">
                  <Sprachkurse ui={ui} richtungen={richtungenAus(ausgang)} />
                </div>
              </details>
            ))}
          </div>
          <AusgangInsel ui={ui} />
        </section>

        <section aria-labelledby="weitere" className="flex flex-col gap-6">
          <div className="flex max-w-einleitung flex-col gap-2">
            <h2 id="weitere" className="text-display-2">
              {t('kurse.wissenTitel')}
            </h2>
            <p className="text-18 text-pretty text-tinte-2">{t('kurse.wissenText')}</p>
          </div>
          <ul className="grid raster-karten gap-4">
            <KursKarte
              adresse={lernAdresse(ui, 'islam')}
              titel={t('kurse.islamTitel')}
              text={t('kurse.islamText')}
              stufen={t('kurse.eigeneStufen')}
              hinweis={ui === 'de' ? undefined : { text: t('kurse.aufDeutsch') }}
            />
            {kursInOberflaeche('koran', ui) ? (
              <KursKarte
                adresse={lernAdresse(ui, 'koran')}
                titel={t('kurse.koranTitel')}
                text={t('kurse.koranText')}
                stufen={t('kurse.eigeneStufen')}
              />
            ) : null}
          </ul>
        </section>
      </div>
    </Rahmen>
  );
}
