import type { Metadata } from 'next';
import { FortschrittInsel } from '@/components/lernapp/inseln/FortschrittInsel';
import { Rahmen } from '@/components/lernapp/Rahmen';
import { Seitenkopf } from '@/components/lernapp/Seitenkopf';
import { lernMetadaten, oberflaeche, verlangeLernApp } from '@/lib/lernapp/seite';
import { lernTexte, rohTexte } from '@/lib/lernapp/texte';

export const ensureStatic = 'navigation';

export async function generateMetadata(): Promise<Metadata> {
  const ui = await oberflaeche();
  return lernMetadaten({ ui, pfad: 'fortschritt', titel: lernTexte(ui)('fortschritt.titel'), index: false });
}

/**
 * Fortschritt (PLAN §3.1): statische Hülle mit dem leeren Stand eines neuen Geräts; in `#fortschritt-stand` die Insel mit
 * dem Stand aus der lokalen Datenbank (Lerntage, XP, Lektionen, Serie, Abzeichen; ADR 0038, ADR 0043) – Zahlen statisch,
 * ohne Vergleich mit anderen, ohne Cookies.
 */
export default async function Fortschritt() {
  await verlangeLernApp();
  const ui = await oberflaeche();
  const t = lernTexte(ui);
  return (
    <Rahmen ui={ui} bereich="fortschritt" pfad="fortschritt">
      <Seitenkopf titel={t('fortschritt.titel')} einleitung={t('fortschritt.einleitung')} />
      <section id="fortschritt-stand" aria-label={t('fortschritt.titel')} className="rounded-lg border border-linie bg-weiss p-5 md:p-8">
        <FortschrittInsel
          ui={ui}
          texte={{ fortschritt: rohTexte(ui, 'fortschritt'), serie: rohTexte(ui, 'serie'), abzeichen: rohTexte(ui, 'abzeichen') }}
        />
      </section>
    </Rahmen>
  );
}
