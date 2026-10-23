import type { Metadata } from 'next';
import { Suspense } from 'react';
import { UebenInsel } from '@/components/lernapp/inseln/UebenInsel';
import { Rahmen } from '@/components/lernapp/Rahmen';
import { Seitenkopf } from '@/components/lernapp/Seitenkopf';
import { funktionAn } from '@/lib/funktionen';
import { lernAdresse } from '@/lib/lernapp/adressen';
import { istRichtung } from '@/lib/lernapp/kurse';
import { kursTitel } from '@/lib/lernapp/kurstitel';
import { kursOder404, lernMetadaten, oberflaeche, verlangeLernApp } from '@/lib/lernapp/seite';
import { lernTexte, rohTexte } from '@/lib/lernapp/texte';

export const ensureStatic = 'navigation';

export async function generateMetadata({ params }: PageProps<'/lern-app/[ui]/[kurs]/ueben'>): Promise<Metadata> {
  const ui = await oberflaeche();
  const kurs = kursOder404((await params).kurs, ui);
  return lernMetadaten({ ui, pfad: `${kurs}/ueben`, titel: `${lernTexte(ui)('ueben.titel')}: ${kursTitel(ui, kurs)}`, index: false });
}

/**
 * Üben (PLAN §3.1): statische Hülle des Lektionsspielers, Lektion über `?l=<lektion>` (im Browser gelesen, unter
 * Suspense; der Service Worker liefert die Hülle mit `ignoreSearch`). Mikrofon ist hier erlaubt (PFAD_BERECHTIGUNGEN).
 * Die Insel lädt das Einheitenpaket und den Spieler (eigener Chunk) und schreibt die Ereignisse auf das Gerät. Mit dem
 * Schalter `lernapp_gruppen` bietet die Schreibübung die Abgabe an die Lehrkraft an (L5-03; ohne Cookies: ob die Person
 * abgeben darf, fragt die Übung erst im Browser beim Server nach).
 */
export default async function Ueben({ params }: PageProps<'/lern-app/[ui]/[kurs]/ueben'>) {
  await verlangeLernApp();
  const ui = await oberflaeche();
  const kurs = kursOder404((await params).kurs, ui);
  const t = lernTexte(ui);
  const lernpfad = { adresse: lernAdresse(ui, kurs), text: t('ueben.zumLernpfad') };
  return (
    <Rahmen ui={ui} bereich={null} pfad={`${kurs}/ueben`}>
      <Seitenkopf
        zurueck={{ adresse: lernpfad.adresse, text: kursTitel(ui, kurs) }}
        titel={t('ueben.titel')}
        einleitung={t('ueben.text')}
      />
      {/* Platz für den Spieler (eine Bildschirmhöhe), damit der Fuß beim Laden nicht springt (CLS) */}
      <div className="min-h-svh">
        <Suspense fallback={<p className="text-18 text-tinte-2">{t('ueben.laedt')}</p>}>
          <UebenInsel
            ui={ui}
            kurs={kurs}
            texte={rohTexte(ui, 'ueben')}
            spielerTexte={{
              spieler: rohTexte(ui, 'spieler'),
              aufgaben: rohTexte(ui, 'aufgaben'),
              tastatur: rohTexte(ui, 'tastatur'),
              aufgaben2: rohTexte(ui, 'aufgaben2'),
              sprechen: rohTexte(ui, 'sprechen'),
              schreiben: rohTexte(ui, 'schreiben'),
              ansichten: rohTexte(ui, 'ansichten'),
              abschluss: { abschluss: rohTexte(ui, 'abschluss'), serie: rohTexte(ui, 'serie'), abzeichen: rohTexte(ui, 'abzeichen') },
            }}
            spracherkennung={await funktionAn('lernapp_sprechen')}
            // „Fehler melden“ braucht eine Aufgabe in `lernapp_aufgabe`; der Koran-Pfad hat seine Aufgaben nur im Paket (L6-05)
            melden={kurs !== 'koran' && (await funktionAn('lernapp_meldungen')) ? rohTexte(ui, 'melden') : undefined}
            // Schreibabgabe an die Lehrkraft (L5-03): nur Sprachkurse, nur mit `lernapp_gruppen` (Personendaten); den Rest prüft der Server
            schreibabgabe={istRichtung(kurs) && (await funktionAn('lernapp_gruppen')) ? rohTexte(ui, 'schreibabgabe') : undefined}
            lernpfad={lernpfad}
          />
        </Suspense>
      </div>
    </Rahmen>
  );
}
