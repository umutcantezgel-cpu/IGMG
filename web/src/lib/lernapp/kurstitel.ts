import 'server-only';
import { zerlegeRichtung, type KursSlug, type Oberflaeche } from './kurse';
import { lernTexte } from './texte';

/** Titel eines Kurses in der Oberflächensprache: Sprachkurs = Zielsprache, Wissen und Koran-Arabisch mit eigenem Titel. */
export function kursTitel(ui: Oberflaeche, kurs: KursSlug): string {
  const t = lernTexte(ui);
  if (kurs === 'islam') return t('kurse.islamTitel');
  if (kurs === 'koran') return t('kurse.koranTitel');
  return t(`kurse.ziel.${zerlegeRichtung(kurs).ziel}`);
}

/** Untertitel: Ausgangssprache des Sprachkurses („für Deutschsprachige“), sonst die Kurzbeschreibung. */
export function kursUntertitel(ui: Oberflaeche, kurs: KursSlug): string {
  const t = lernTexte(ui);
  if (kurs === 'islam') return t('kurse.islamText');
  if (kurs === 'koran') return t('kurse.koranText');
  return t(`kurse.fuer.${zerlegeRichtung(kurs).ausgang}`);
}
