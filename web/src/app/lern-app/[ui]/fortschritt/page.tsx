import type { Metadata } from 'next';
import { Rahmen } from '@/components/lernapp/Rahmen';
import { Seitenkopf } from '@/components/lernapp/Seitenkopf';
import { lernMetadaten, oberflaeche, verlangeLernApp } from '@/lib/lernapp/seite';
import { lernTexte } from '@/lib/lernapp/texte';

export const ensureStatic = 'navigation';

export async function generateMetadata(): Promise<Metadata> {
  const ui = await oberflaeche();
  return lernMetadaten({ ui, pfad: 'fortschritt', titel: lernTexte(ui)('fortschritt.titel'), index: false });
}

/**
 * Fortschritt (PLAN §3.1): statische Hülle mit dem leeren Stand eines neuen Geräts. Die Zusammenführung hängt in
 * `#fortschritt-stand` die Insel mit dem Stand aus der lokalen Datenbank ein (Lerntage, XP, Stufen, Abzeichen; ADR 0038,
 * ADR 0043) – Zahlen statisch, ohne Vergleich mit anderen.
 */
export default async function Fortschritt() {
  await verlangeLernApp();
  const ui = await oberflaeche();
  const t = lernTexte(ui);
  return (
    <Rahmen ui={ui} bereich="fortschritt" pfad="fortschritt">
      <Seitenkopf titel={t('fortschritt.titel')} einleitung={t('fortschritt.einleitung')} />
      <section id="fortschritt-stand" aria-label={t('fortschritt.titel')} className="rounded-lg border border-linie bg-weiss p-5 md:p-8">
        <p className="text-18 text-tinte-2">{t('fortschritt.leer')}</p>
      </section>
    </Rahmen>
  );
}
