import { Heart, Users } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Text, textMitSprache } from '@/components/website/Text';
import { Link } from '@/i18n/link';
import type { Sprache } from '@/lib/i18n/inhalt';
import type { ProjekteInhalt } from '@/lib/validierung/seiteninhalte/projekte';
import { brauchtRueckfall } from './hilfen';
import { Spenden } from './Spenden';

/**
 * Unterstützen (Design Projects.dc.html D:65–70, H-F01): hell (gruen-50 mit gruen-700-Band), direkt vor dem Fuß. Der Aufruf
 * mit Dank und zwei Knöpfen – „Kontakt aufnehmen“ führt zu /kontakt, „Jetzt spenden“ springt zur Bankverbindung. Auf dem
 * Telefon und Tablet steht der Aufruf auf dem Papier, die Spendenkarte liegt frei darunter (H-C05). Ab lg liegen Aufruf und
 * Spendenkarte nebeneinander auf einer hellen Fläche; die Spendenkarte ist weiß mit Rand und Schatten.
 */
export async function Unterstuetzen({ inhalt, sprache }: { inhalt: ProjekteInhalt; sprache: Sprache }) {
  const t = await getTranslations('projekte');
  const tAllg = await getTranslations('allgemein');
  const u = inhalt.unterstuetzung;
  const titel = textMitSprache(u.titel, sprache).text;
  const spendenTitel = textMitSprache(inhalt.spende.titel, sprache).text;
  const rueckfall = brauchtRueckfall(sprache, [u.titel, u.text, u.dank]);
  return (
    <section aria-labelledby="unterstuetzen-titel" className="flex flex-col lg:overflow-hidden lg:rounded-lg lg:bg-gruen-50">
      <div aria-hidden className="h-1.5 bg-gruen-700 max-lg:hidden" />
      <div className="grid gap-6 lg:grid-cols-2 lg:items-center lg:gap-12 lg:p-12">
        <div className="flex flex-col overflow-hidden rounded-lg bg-gruen-50 lg:overflow-visible lg:rounded-none lg:bg-transparent">
          <div aria-hidden className="h-1.5 bg-gruen-700 lg:hidden" />
          <div className="flex flex-col gap-4 p-6 md:p-12 lg:p-0">
            <h2 id="unterstuetzen-titel" className="text-display-2">
              <Text feld={u.titel} sprache={sprache} />
            </h2>
            {rueckfall ? <p className="text-16 text-tinte-2">{tAllg('nurDeutsch')}</p> : null}
            <Text feld={u.text} sprache={sprache} als="p" className="max-w-(--container-text) text-pretty" />
            <Text feld={u.dank} sprache={sprache} als="p" className="max-w-(--container-text) text-pretty text-tinte-2" />
            <div className="flex flex-wrap gap-3">
              <Link
                href="/kontakt"
                aria-label={t('linkKontext', { sichtbar: t('unterstuetzen.knopf'), titel })}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-gruen-700 px-6 font-bold text-weiss no-underline transition duration-(--dauer-rueckmeldung) hover:bg-gruen-800 hover:text-weiss active:scale-98 sm:w-auto"
              >
                <Users aria-hidden className="size-5 shrink-0" />
                {t('unterstuetzen.knopf')}
              </Link>
              <Link
                href={{ pathname: '/projekte', hash: 'spendenkonto' }}
                aria-label={t('linkKontext', { sichtbar: t('spenden.jetzt'), titel: spendenTitel })}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border-2 border-gruen-700 bg-weiss px-5.5 font-bold text-gruen-800 no-underline transition duration-(--dauer-rueckmeldung) hover:bg-gruen-50 hover:text-gruen-800 active:scale-98 sm:w-auto"
              >
                <Heart aria-hidden className="size-5 shrink-0" />
                {t('spenden.jetzt')}
              </Link>
            </div>
          </div>
        </div>
        <Spenden inhalt={inhalt} sprache={sprache} />
      </div>
    </section>
  );
}
