import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SuchwertPlatz } from '@/components/lernapp/inseln/SuchwertPlatz';
import { Rahmen } from '@/components/lernapp/Rahmen';
import { Seitenkopf } from '@/components/lernapp/Seitenkopf';
import { lernAdresse } from '@/lib/lernapp/adressen';
import { kursTitel } from '@/lib/lernapp/kurstitel';
import { kursOder404, lernMetadaten, oberflaeche, verlangeLernApp } from '@/lib/lernapp/seite';
import { lernTexte } from '@/lib/lernapp/texte';

export const ensureStatic = 'navigation';

export async function generateMetadata({ params }: PageProps<'/lern-app/[ui]/[kurs]/tipps'>): Promise<Metadata> {
  const ui = await oberflaeche();
  const kurs = kursOder404((await params).kurs, ui);
  return lernMetadaten({ ui, pfad: `${kurs}/tipps`, titel: `${lernTexte(ui)('tipps.titel')}: ${kursTitel(ui, kurs)}`, index: false });
}

/**
 * Grammatik-Tipps einer Einheit (PLAN §3.1): statische Hülle, Einheit über `?e=<einheit>` (im Browser gelesen). Die
 * Zusammenführung hängt im `SuchwertPlatz` (name `e`) die Tipps aus dem Kurspaket ein (Tiptap, Beispiele mit `lang`).
 */
export default async function Tipps({ params }: PageProps<'/lern-app/[ui]/[kurs]/tipps'>) {
  await verlangeLernApp();
  const ui = await oberflaeche();
  const kurs = kursOder404((await params).kurs, ui);
  const t = lernTexte(ui);
  const lernpfad = { adresse: lernAdresse(ui, kurs), text: t('ueben.zumLernpfad') };
  return (
    <Rahmen ui={ui} bereich={null} pfad={`${kurs}/tipps`}>
      <Seitenkopf zurueck={{ adresse: lernpfad.adresse, text: kursTitel(ui, kurs) }} titel={t('tipps.titel')} />
      <Suspense fallback={null}>
        <SuchwertPlatz name="e" ohneWert={t('tipps.ohneEinheit')} mitWert={t('tipps.leer')} lernpfad={lernpfad} />
      </Suspense>
    </Rahmen>
  );
}
