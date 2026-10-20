import type { Metadata } from 'next';
import { Rahmen } from '@/components/lernapp/Rahmen';
import { Seitenkopf } from '@/components/lernapp/Seitenkopf';
import { lernAdresse } from '@/lib/lernapp/adressen';
import { kursTitel } from '@/lib/lernapp/kurstitel';
import { kursOder404, lernMetadaten, oberflaeche, verlangeLernApp } from '@/lib/lernapp/seite';
import { lernTexte } from '@/lib/lernapp/texte';

export const ensureStatic = 'navigation';

/** Aufgaben im Einstufungstest (ADR 0043 Nr. 6). */
const AUFGABEN = 20;

export async function generateMetadata({ params }: PageProps<'/lern-app/[ui]/[kurs]/einstufung'>): Promise<Metadata> {
  const ui = await oberflaeche();
  const kurs = kursOder404((await params).kurs, ui);
  return lernMetadaten({
    ui,
    pfad: `${kurs}/einstufung`,
    titel: `${lernTexte(ui)('einstufung.titel')}: ${kursTitel(ui, kurs)}`,
    index: false,
  });
}

/**
 * Einstufungstest (PLAN §3.1, ADR 0043 Nr. 6: 20 Aufgaben, adaptiv, lokal): statische Hülle. Die Zusammenführung hängt
 * in `#einstufung-test` den Test ein (L2-04, `engine/einstufung.ts`).
 */
export default async function Einstufung({ params }: PageProps<'/lern-app/[ui]/[kurs]/einstufung'>) {
  await verlangeLernApp();
  const ui = await oberflaeche();
  const kurs = kursOder404((await params).kurs, ui);
  const t = lernTexte(ui);
  return (
    <Rahmen ui={ui} bereich={null} pfad={`${kurs}/einstufung`}>
      <Seitenkopf
        zurueck={{ adresse: lernAdresse(ui, kurs), text: kursTitel(ui, kurs) }}
        titel={t('einstufung.titel')}
        einleitung={t('einstufung.text', { anzahl: AUFGABEN })}
      />
      <section id="einstufung-test" aria-label={t('einstufung.titel')} className="rounded-lg border border-linie bg-weiss p-5 md:p-8">
        <p className="text-18 text-tinte-2">{t('einstufung.bald')}</p>
      </section>
    </Rahmen>
  );
}
