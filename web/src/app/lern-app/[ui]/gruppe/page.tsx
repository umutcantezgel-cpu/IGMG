import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { GruppeInsel } from '@/components/lernapp/inseln/GruppeInsel';
import { Rahmen } from '@/components/lernapp/Rahmen';
import { Seitenkopf } from '@/components/lernapp/Seitenkopf';
import { funktionAn } from '@/lib/funktionen';
import { lernMetadaten, oberflaeche, verlangeLernApp } from '@/lib/lernapp/seite';
import { lernTexte, rohTexte } from '@/lib/lernapp/texte';

export const ensureStatic = 'navigation';

export async function generateMetadata(): Promise<Metadata> {
  const ui = await oberflaeche();
  return lernMetadaten({ ui, pfad: 'gruppe', titel: lernTexte(ui)('gruppe.titel'), index: false });
}

/**
 * Gruppe (PLAN §3.1, L7-02): statische Hülle ohne Cookies; die Insel holt Zuweisungen, Gruppenziel, Bestenlisten und die
 * eigene Zustimmung von `/api/lernapp/gruppe` (Sitzung, Schalter, Einwilligung und Rechte prüft der Server). Nur mit dem
 * Schalter `lernapp_gruppen` (Personendaten, Produktion aus) – sonst 404.
 */
export default async function Gruppe() {
  await verlangeLernApp();
  if (!(await funktionAn('lernapp_gruppen'))) notFound();
  const ui = await oberflaeche();
  const t = lernTexte(ui);
  return (
    <Rahmen ui={ui} bereich={null} pfad="gruppe">
      <Seitenkopf titel={t('gruppe.titel')} einleitung={t('gruppe.einleitung')} />
      <GruppeInsel ui={ui} texte={rohTexte(ui, 'gruppe')} />
    </Rahmen>
  );
}
