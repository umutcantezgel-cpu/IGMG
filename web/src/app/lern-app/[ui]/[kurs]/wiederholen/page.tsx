import type { Metadata } from 'next';
import { WiederholenInsel } from '@/components/lernapp/inseln/WiederholenInsel';
import { Rahmen } from '@/components/lernapp/Rahmen';
import { Seitenkopf } from '@/components/lernapp/Seitenkopf';
import { funktionAn } from '@/lib/funktionen';
import { lernAdresse } from '@/lib/lernapp/adressen';
import { kursTitel } from '@/lib/lernapp/kurstitel';
import { kursOder404, lernMetadaten, oberflaeche, verlangeLernApp } from '@/lib/lernapp/seite';
import { lernTexte, rohTexte } from '@/lib/lernapp/texte';

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
 * Wiederholen (PLAN §3.1, FSRS-Sitzung): statische Hülle; die Insel wählt die Karten aus dem lokalen Stand (fällige
 * zuerst) und spielt sie mit dem Spieler. Mikrofon ist hier erlaubt (PFAD_BERECHTIGUNGEN).
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
      {/* Platz für den Spieler (eine Bildschirmhöhe), damit der Fuß beim Laden nicht springt (CLS) */}
      <section id="wiederholen-sitzung" aria-label={t('wiederholen.titel')} className="min-h-svh">
        <WiederholenInsel
          ui={ui}
          kurs={kurs}
          texte={rohTexte(ui, 'wiederholen')}
          spielerTexte={{
            spieler: rohTexte(ui, 'spieler'),
            aufgaben: rohTexte(ui, 'aufgaben'),
            aufgaben2: rohTexte(ui, 'aufgaben2'),
            sprechen: rohTexte(ui, 'sprechen'),
            schreiben: rohTexte(ui, 'schreiben'),
          }}
          spracherkennung={await funktionAn('lernapp_sprechen')}
          lernpfad={{ adresse: lernAdresse(ui, kurs), text: t('ueben.zumLernpfad') }}
        />
      </section>
    </Rahmen>
  );
}
