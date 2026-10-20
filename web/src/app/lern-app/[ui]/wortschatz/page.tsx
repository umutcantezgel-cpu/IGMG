import type { Metadata } from 'next';
import { Rahmen } from '@/components/lernapp/Rahmen';
import { Seitenkopf } from '@/components/lernapp/Seitenkopf';
import { lernMetadaten, oberflaeche, verlangeLernApp } from '@/lib/lernapp/seite';
import { lernTexte } from '@/lib/lernapp/texte';

export const ensureStatic = 'navigation';

export async function generateMetadata(): Promise<Metadata> {
  const ui = await oberflaeche();
  return lernMetadaten({ ui, pfad: 'wortschatz', titel: lernTexte(ui)('wortschatz.titel'), index: false });
}

/**
 * Wortschatz (PLAN §3.1): statische Hülle mit dem leeren Stand eines neuen Geräts. Die Zusammenführung hängt in
 * `#wortschatz-stand` die Insel mit den gelernten Wörtern aus der lokalen Datenbank ein (Karten, ADR 0038); fremdsprachige
 * Wörter mit `lang` und `dir`.
 */
export default async function Wortschatz() {
  await verlangeLernApp();
  const ui = await oberflaeche();
  const t = lernTexte(ui);
  return (
    <Rahmen ui={ui} bereich="wortschatz" pfad="wortschatz">
      <Seitenkopf titel={t('wortschatz.titel')} einleitung={t('wortschatz.einleitung')} />
      <section id="wortschatz-stand" aria-label={t('wortschatz.titel')} className="rounded-lg border border-linie bg-weiss p-5 md:p-8">
        <p className="text-18 text-tinte-2">{t('wortschatz.leer')}</p>
      </section>
    </Rahmen>
  );
}
