import type { Metadata } from 'next';
import { Suspense } from 'react';
import { TippsInsel } from '@/components/lernapp/inseln/TippsInsel';
import { Rahmen } from '@/components/lernapp/Rahmen';
import { Seitenkopf } from '@/components/lernapp/Seitenkopf';
import { lernAdresse } from '@/lib/lernapp/adressen';
import { kursTitel } from '@/lib/lernapp/kurstitel';
import { kursOder404, lernMetadaten, oberflaeche, verlangeLernApp } from '@/lib/lernapp/seite';
import { lernTexte, rohTexte } from '@/lib/lernapp/texte';

export const ensureStatic = 'navigation';

export async function generateMetadata({ params }: PageProps<'/lern-app/[ui]/[kurs]/tipps'>): Promise<Metadata> {
  const ui = await oberflaeche();
  const kurs = kursOder404((await params).kurs, ui);
  return lernMetadaten({ ui, pfad: `${kurs}/tipps`, titel: `${lernTexte(ui)('tipps.titel')}: ${kursTitel(ui, kurs)}`, index: false });
}

/**
 * Grammatik-Tipps einer Einheit (PLAN §3.1): statische Hülle, Einheit über `?e=<einheit>` (im Browser gelesen); die Insel
 * zeigt die Tipps aus dem Einheitenpaket (Tiptap, in der Ausgangssprache mit `lang`/`dir`).
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
      {/* Platz für die Tipps (eine Bildschirmhöhe), damit der Fuß beim Laden des Pakets nicht springt (CLS, L8-02) */}
      <div className="min-h-svh">
        <Suspense fallback={<p className="text-18 text-tinte-2">{t('tipps.laedt')}</p>}>
          <TippsInsel kurs={kurs} texte={rohTexte(ui, 'tipps')} lernpfad={lernpfad} />
        </Suspense>
      </div>
    </Rahmen>
  );
}
