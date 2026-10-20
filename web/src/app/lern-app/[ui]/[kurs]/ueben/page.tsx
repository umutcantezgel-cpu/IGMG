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

export async function generateMetadata({ params }: PageProps<'/lern-app/[ui]/[kurs]/ueben'>): Promise<Metadata> {
  const ui = await oberflaeche();
  const kurs = kursOder404((await params).kurs, ui);
  return lernMetadaten({ ui, pfad: `${kurs}/ueben`, titel: `${lernTexte(ui)('ueben.titel')}: ${kursTitel(ui, kurs)}`, index: false });
}

/**
 * Üben (PLAN §3.1): statische Hülle des Lektionsspielers, Lektion über `?l=<lektion>` (im Browser gelesen, unter
 * Suspense; der Service Worker liefert die Hülle mit `ignoreSearch`). Mikrofon ist hier erlaubt (PFAD_BERECHTIGUNGEN).
 * Der Platz `SuchwertPlatz` (name `l`) ist die Stelle, an der die Zusammenführung den Spieler einhängt.
 */
export default async function Ueben({ params }: PageProps<'/lern-app/[ui]/[kurs]/ueben'>) {
  await verlangeLernApp();
  const ui = await oberflaeche();
  const kurs = kursOder404((await params).kurs, ui);
  const t = lernTexte(ui);
  const lernpfad = { adresse: lernAdresse(ui, kurs), text: t('ueben.zumLernpfad') };
  return (
    <Rahmen ui={ui} bereich={null} pfad={`${kurs}/ueben`}>
      <Seitenkopf zurueck={{ adresse: lernpfad.adresse, text: kursTitel(ui, kurs) }} titel={t('ueben.titel')} />
      <Suspense fallback={<p className="text-18 text-tinte-2">{t('ueben.laedt')}</p>}>
        <SuchwertPlatz name="l" ohneWert={t('ueben.ohneLektion')} mitWert={t('ueben.nichtVerfuegbar')} lernpfad={lernpfad} />
      </Suspense>
    </Rahmen>
  );
}
