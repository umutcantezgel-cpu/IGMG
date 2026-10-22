import type { Metadata } from 'next';
import { EinstufungInsel } from '@/components/lernapp/inseln/EinstufungInsel';
import { Rahmen } from '@/components/lernapp/Rahmen';
import { Seitenkopf } from '@/components/lernapp/Seitenkopf';
import { lernAdresse } from '@/lib/lernapp/adressen';
import { kursTitel } from '@/lib/lernapp/kurstitel';
import { kursOder404, lernMetadaten, oberflaeche, verlangeLernApp } from '@/lib/lernapp/seite';
import { lernTexte, rohTexte } from '@/lib/lernapp/texte';

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
 * Einstufungstest (PLAN §3.1, ADR 0043 Nr. 6: 20 Aufgaben, adaptiv, lokal): statische Hülle ohne Cookies und Kopfzeilen.
 * Die Insel lädt erst nach „Test beginnen“ den Test, die Pakete der nötigen Stufe und die Übungs-Chunks
 * (`engine/einstufung.ts`); das Ergebnis bleibt als Ereignis `einstufung` auf dem Gerät.
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
      {/* Platz für den Test (eine Bildschirmhöhe), damit der Fuß beim Laden nicht springt (CLS) */}
      <section id="einstufung-test" aria-label={t('einstufung.titel')} className="min-h-svh">
        <EinstufungInsel
          ui={ui}
          kurs={kurs}
          adresse={lernAdresse(ui, kurs)}
          texte={rohTexte(ui, 'einstufung')}
          spielerTexte={{
            spieler: rohTexte(ui, 'spieler'),
            aufgaben: rohTexte(ui, 'aufgaben'),
            tastatur: rohTexte(ui, 'tastatur'),
            aufgaben2: rohTexte(ui, 'aufgaben2'),
            sprechen: rohTexte(ui, 'sprechen'),
            schreiben: rohTexte(ui, 'schreiben'),
            ansichten: rohTexte(ui, 'ansichten'),
          }}
          stufenNamen={rohTexte(ui, 'lernpfad').stufe}
          einheitText={rohTexte(ui, 'lernpfad').einheit}
          lernpfad={{ adresse: lernAdresse(ui, kurs), text: t('ueben.zumLernpfad') }}
        />
      </section>
    </Rahmen>
  );
}
