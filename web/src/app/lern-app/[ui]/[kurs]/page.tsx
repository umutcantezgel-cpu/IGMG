import { ClipboardCheck, RotateCcw } from 'lucide-react';
import type { Metadata } from 'next';
import { KoranPfadInsel } from '@/components/lernapp/inseln/KoranPfadInsel';
import { LernpfadInsel } from '@/components/lernapp/inseln/LernpfadInsel';
import { Rahmen } from '@/components/lernapp/Rahmen';
import { Seitenkopf } from '@/components/lernapp/Seitenkopf';
import { LernStern } from '@/components/lernapp/Zeichen';
import { lernAdresse } from '@/lib/lernapp/adressen';
import { istRichtung, richtung, zerlegeRichtung } from '@/lib/lernapp/kurse';
import { kursTitel, kursUntertitel } from '@/lib/lernapp/kurstitel';
import { kursOder404, lernMetadaten, oberflaeche, verlangeLernApp } from '@/lib/lernapp/seite';
import { lernTexte, rohTexte } from '@/lib/lernapp/texte';

export const ensureStatic = 'navigation';

export async function generateMetadata({ params }: PageProps<'/lern-app/[ui]/[kurs]'>): Promise<Metadata> {
  const ui = await oberflaeche();
  const kurs = kursOder404((await params).kurs, ui);
  return lernMetadaten({ ui, pfad: kurs, titel: kursTitel(ui, kurs), beschreibung: kursUntertitel(ui, kurs) });
}

/**
 * Lernpfad eines Kurses (PLAN §3.1, AUFTRAG §6 Stationen 2, 4, 6, 7): statische Hülle mit Titel, Hinweisen (Wissen auf
 * Deutsch und nur mit zwei Prüfungen, Koran-Arabisch nur geprüfte Bedeutungen und keine Computerstimme), Wegen zu
 * Einstufung und Wiederholung und der Insel für die Stationen (`LernpfadInsel`: Kursverzeichnis, Pakete und lokaler Stand;
 * Einheit offline speichern).
 */
export default async function Lernpfad({ params }: PageProps<'/lern-app/[ui]/[kurs]'>) {
  await verlangeLernApp();
  const ui = await oberflaeche();
  const kurs = kursOder404((await params).kurs, ui);
  const t = lernTexte(ui);
  const sprachkurs = istRichtung(kurs);
  const ziel = sprachkurs ? zerlegeRichtung(kurs).ziel : null;
  const hinweise = [
    ...(kurs === 'islam' && ui !== 'de' ? [{ text: t('lernpfad.aufDeutsch') }] : []),
    ...(kurs === 'islam' ? [{ text: t('lernpfad.pruefHinweis') }] : []),
    ...(kurs === 'koran' ? [{ text: t('lernpfad.koranHinweis') }] : []),
  ];
  const wege = [
    ...(sprachkurs
      ? [
          {
            adresse: lernAdresse(ui, kurs, 'einstufung'),
            titel: t('lernpfad.einstufung'),
            text: t('lernpfad.einstufungText'),
            Zeichen: ClipboardCheck,
          },
        ]
      : []),
    {
      adresse: lernAdresse(ui, kurs, 'wiederholen'),
      titel: t('lernpfad.wiederholen'),
      text: t('lernpfad.wiederholenText'),
      Zeichen: RotateCcw,
    },
  ];
  return (
    <Rahmen ui={ui} bereich={null} pfad={kurs}>
      <Seitenkopf
        zurueck={{ adresse: lernAdresse(ui), text: t('lernpfad.alleKurse') }}
        titel={kursTitel(ui, kurs)}
        einleitung={kursUntertitel(ui, kurs)}
        zusatz={
          ziel ? (
            <p lang={ziel} dir={richtung(ziel)} className="text-24 text-gruen-800">
              {lernTexte(ziel)('sprache.eigenname')}
            </p>
          ) : null
        }
      />
      <div className="flex flex-col gap-abschnitt-klein">
        {hinweise.length ? (
          <ul className="flex max-w-einleitung flex-col gap-2 rounded-lg bg-sand p-5">
            {hinweise.map((h) => (
              <li key={h.text} className="flex gap-3 text-18">
                <LernStern className="mt-1 size-5 shrink-0 text-gruen-700" />
                {h.text}
              </li>
            ))}
          </ul>
        ) : null}
        <ul className="grid raster-karten gap-4">
          {wege.map(({ adresse, titel, text, Zeichen }) => (
            <li
              key={adresse}
              className="group relative flex gap-4 rounded-lg border border-linie bg-weiss p-5 hover:border-gruen-700 hover:bg-gruen-50"
            >
              <Zeichen aria-hidden className="mt-1 size-6 shrink-0 text-gruen-700" />
              <div className="flex flex-col gap-1">
                <h2 className="text-24 leading-ueberschrift">
                  <a
                    href={adresse}
                    className="text-tinte no-underline group-hover:text-gruen-800 after:absolute after:inset-0 after:rounded-lg"
                  >
                    {titel}
                  </a>
                </h2>
                <p className="text-16 text-tinte-2">{text}</p>
              </div>
            </li>
          ))}
        </ul>
        <section aria-labelledby="lernpfad" className="flex flex-col gap-4">
          <h2 id="lernpfad" className="text-display-2">
            {t('lernpfad.einheiten')}
          </h2>
          {kurs === 'koran' && ui !== 'ar' ? (
            // Koran-Arabisch: eigener Pfad je Sprache der Bedeutungen (L6-05); nur freigegebene Bedeutungen, sonst „Bedeutung folgt“
            <KoranPfadInsel
              ui={ui}
              sprache={ui}
              adresse={lernAdresse(ui, kurs)}
              stufen={rohTexte(ui, 'lernpfad').stufe}
              texte={rohTexte(ui, 'koranpfad')}
            />
          ) : (
            <LernpfadInsel ui={ui} kurs={kurs} adresse={lernAdresse(ui, kurs)} texte={rohTexte(ui, 'lernpfad')} />
          )}
        </section>
      </div>
    </Rahmen>
  );
}
