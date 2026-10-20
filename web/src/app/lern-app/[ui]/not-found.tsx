import { Rahmen } from '@/components/lernapp/Rahmen';
import { Seitenkopf } from '@/components/lernapp/Seitenkopf';
import { lernAdresse } from '@/lib/lernapp/adressen';
import { oberflaeche } from '@/lib/lernapp/seite';
import { lernTexte } from '@/lib/lernapp/texte';

/**
 * Nicht gefunden innerhalb der Lern-App (ADR 0037 Nr. 2): eigene Gestalt im Rahmen der Lern-App, in der
 * Oberflächensprache und im Wurzel-Layout der Lern-App (`lang`, `dir`). Greift für `notFound()` in jeder Seite unter
 * `[ui]`, auch für die Fangroute `[ui]/[...rest]` und den abgeschalteten Schalter `lernapp`.
 */
export default async function LernAppNichtGefunden() {
  const ui = await oberflaeche();
  const t = lernTexte(ui);
  return (
    <Rahmen ui={ui} bereich={null} pfad="">
      <Seitenkopf
        titel={t('nichtGefunden.titel')}
        einleitung={t('nichtGefunden.text')}
        zusatz={
          <a
            href={lernAdresse(ui)}
            className="mt-2 inline-flex min-h-12 items-center rounded-md bg-gruen-700 px-6 font-bold text-weiss no-underline hover:bg-gruen-800 hover:text-weiss"
          >
            {t('nichtGefunden.zurueck')}
          </a>
        }
      />
    </Rahmen>
  );
}
