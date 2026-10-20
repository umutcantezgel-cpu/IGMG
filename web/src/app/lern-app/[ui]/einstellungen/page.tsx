import type { Metadata } from 'next';
import { DatenInsel } from '@/components/lernapp/inseln/DatenInsel';
import { EinstellungenFormular } from '@/components/lernapp/inseln/EinstellungenFormular';
import { KontoInsel } from '@/components/lernapp/inseln/KontoInsel';
import { Rahmen } from '@/components/lernapp/Rahmen';
import { Seitenkopf } from '@/components/lernapp/Seitenkopf';
import { funktionAn } from '@/lib/funktionen';
import { lernAdresse } from '@/lib/lernapp/adressen';
import { OBERFLAECHEN, richtung, SPRACHEN } from '@/lib/lernapp/kurse';
import { lernMetadaten, oberflaeche, verlangeLernApp } from '@/lib/lernapp/seite';
import { lernTexte, rohTexte } from '@/lib/lernapp/texte';

export const ensureStatic = 'navigation';

export async function generateMetadata(): Promise<Metadata> {
  const ui = await oberflaeche();
  return lernMetadaten({ ui, pfad: 'einstellungen', titel: lernTexte(ui)('einstellungen.titel'), index: false });
}

/**
 * Einstellungen (PLAN §3.1, ADR 0037 Nr. 7): Oberflächensprache als Links auf dieselbe Seite in der anderen Sprache
 * (statisch), Ausgangssprache, Tagesziel, Ziffern (nur `ar`), Hör- und Sprechübungen als Insel mit Speicher auf dem
 * Gerät; reduzierte Bewegung folgt dem System (nur Hinweis). Mit Schalter `lernapp_sync` zusätzlich „Konto und Abgleich“
 * (Insel; ohne Klick keine Anfrage). „Deine Daten“: Lernstand als Datei sichern und einlesen (Art. 20 DSGVO) und der
 * Hinweis, wenn das Gerät nichts dauerhaft speichern kann (Insel). Statisch, ohne Cookies.
 */
export default async function Einstellungen() {
  await verlangeLernApp();
  const ui = await oberflaeche();
  const t = lernTexte(ui);
  const abgleich = await funktionAn('lernapp_sync');
  return (
    <Rahmen ui={ui} bereich="einstellungen" pfad="einstellungen">
      <Seitenkopf titel={t('einstellungen.titel')} einleitung={t('einstellungen.einleitung')} />
      <div className="flex max-w-(--container-lesen) flex-col gap-6">
        <section aria-labelledby="oberflaeche" className="flex flex-col gap-2 rounded-lg border border-linie bg-weiss p-5">
          <h2 id="oberflaeche" className="text-24">
            {t('einstellungen.oberflaeche')}
          </h2>
          <p className="text-16 text-tinte-2">{t('einstellungen.oberflaecheText')}</p>
          <ul className="flex flex-wrap gap-2">
            {OBERFLAECHEN.map((s) => (
              <li key={s}>
                <a
                  href={lernAdresse(s, 'einstellungen')}
                  hrefLang={s}
                  lang={s}
                  dir={richtung(s)}
                  aria-current={s === ui ? 'page' : undefined}
                  className={`inline-flex min-h-11 items-center rounded-md border px-4 font-bold no-underline ${s === ui ? 'border-gruen-700 bg-gruen-50 text-gruen-800' : 'border-rand bg-weiss text-tinte hover:bg-gruen-50'}`}
                >
                  {lernTexte(s)('sprache.eigenname')}
                </a>
              </li>
            ))}
          </ul>
        </section>
        <EinstellungenFormular
          ui={ui}
          texte={rohTexte(ui, 'einstellungen')}
          sprachen={SPRACHEN.map((s) => ({ sprache: s, eigenname: lernTexte(s)('sprache.eigenname'), dir: richtung(s) }))}
        />
        {abgleich ? <KontoInsel ui={ui} texte={rohTexte(ui, 'konto')} /> : null}
        <section aria-labelledby="bewegung" className="flex flex-col gap-2">
          <h2 id="bewegung" className="text-24">
            {t('einstellungen.bewegung')}
          </h2>
          <p className="text-16 text-tinte-2">{t('einstellungen.bewegungText')}</p>
        </section>
        <section aria-labelledby="daten" className="flex flex-col gap-2">
          <h2 id="daten" className="text-24">
            {t('einstellungen.daten')}
          </h2>
          <p className="text-16 text-tinte-2">{t('einstellungen.datenText')}</p>
          <DatenInsel ui={ui} texte={rohTexte(ui, 'einstellungen')} />
        </section>
      </div>
    </Rahmen>
  );
}
