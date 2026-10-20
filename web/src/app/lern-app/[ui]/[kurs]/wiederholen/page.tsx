import type { Metadata } from 'next';
import { Rahmen } from '@/components/lernapp/Rahmen';
import { Seitenkopf } from '@/components/lernapp/Seitenkopf';
import { lernAdresse } from '@/lib/lernapp/adressen';
import { kursTitel } from '@/lib/lernapp/kurstitel';
import { kursOder404, lernMetadaten, oberflaeche, verlangeLernApp } from '@/lib/lernapp/seite';
import { lernTexte } from '@/lib/lernapp/texte';

export const ensureStatic = 'navigation';

export async function generateMetadata({ params }: PageProps<'/lern-app/[ui]/[kurs]/wiederholen'>): Promise<Metadata> {
  const ui = await oberflaeche();
  const kurs = kursOder404((await params).kurs, ui);
  return lernMetadaten({
    ui,
    pfad: `${kurs}/wiederholen`,
    titel: `${lernTexte(ui)('wiederholen.titel')}: ${kursTitel(ui, kurs)}`,
    index: false,
  });
}

/**
 * Wiederholen (PLAN §3.1, FSRS-Sitzung): statische Hülle mit dem leeren Stand. Die Zusammenführung hängt in
 * `#wiederholen-sitzung` den Spieler mit den fälligen Karten aus der lokalen Datenbank ein (L2-04). Mikrofon ist hier
 * erlaubt (PFAD_BERECHTIGUNGEN).
 */
export default async function Wiederholen({ params }: PageProps<'/lern-app/[ui]/[kurs]/wiederholen'>) {
  await verlangeLernApp();
  const ui = await oberflaeche();
  const kurs = kursOder404((await params).kurs, ui);
  const t = lernTexte(ui);
  return (
    <Rahmen ui={ui} bereich={null} pfad={`${kurs}/wiederholen`}>
      <Seitenkopf
        zurueck={{ adresse: lernAdresse(ui, kurs), text: kursTitel(ui, kurs) }}
        titel={t('wiederholen.titel')}
        einleitung={t('wiederholen.text')}
      />
      <section id="wiederholen-sitzung" aria-label={t('wiederholen.titel')} className="rounded-lg border border-linie bg-weiss p-5 md:p-8">
        <p className="text-18 text-tinte-2">{t('wiederholen.leer')}</p>
      </section>
    </Rahmen>
  );
}
