import { Heart, Users } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Text, textMitSprache } from '@/components/website/Text';
import { Link } from '@/i18n/link';
import type { Sprache } from '@/lib/i18n/inhalt';
import type { ProjekteInhalt } from '@/lib/validierung/seiteninhalte/projekte';
import { brauchtRueckfall } from './hilfen';
import { Spenden } from './Spenden';

/**
 * Unterstützen (Design Projects.dc.html D:65–70): dunkle Fläche mit Aufruf, Dank und zwei Knöpfen – „Kontakt aufnehmen“
 * führt zu /kontakt, „Jetzt spenden“ springt zur Bankverbindung. Rechts im Raster steht die Spendenkarte.
 * Auf dem Telefon und Tablet liegt die Spendenkarte auf dem Papier unter dem dunklen Aufruf; ab lg liegen beide auf
 * einer dunklen Fläche nebeneinander (H-C05).
 */
export async function Unterstuetzen({ inhalt, sprache }: { inhalt: ProjekteInhalt; sprache: Sprache }) {
  const t = await getTranslations('projekte');
  const tAllg = await getTranslations('allgemein');
  const u = inhalt.unterstuetzung;
  const titel = textMitSprache(u.titel, sprache).text;
  const spendenTitel = textMitSprache(inhalt.spende.titel, sprache).text;
  const rueckfall = brauchtRueckfall(sprache, [u.titel, u.text, u.dank]);
  return (
    <section
      aria-labelledby="unterstuetzen-titel"
      className="grid gap-6 lg:grid-cols-2 lg:items-center lg:gap-12 lg:rounded-lg lg:bg-gruen-950 lg:p-12"
    >
      <div className="flex flex-col gap-4 rounded-lg bg-gruen-950 p-6 text-weiss md:p-12 lg:rounded-none lg:bg-transparent lg:p-0">
        <h2 id="unterstuetzen-titel" className="text-display-2">
          <Text feld={u.titel} sprache={sprache} />
        </h2>
        {rueckfall ? <p className="text-16 text-gruen-100">{tAllg('nurDeutsch')}</p> : null}
        <Text feld={u.text} sprache={sprache} als="p" className="max-w-(--container-text) text-pretty text-gruen-50" />
        <Text feld={u.dank} sprache={sprache} als="p" className="max-w-(--container-text) text-pretty text-gruen-100" />
        <div className="flex flex-wrap gap-3">
          <Link
            href="/kontakt"
            aria-label={t('linkKontext', { sichtbar: t('unterstuetzen.knopf'), titel })}
            className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-weiss px-6 font-bold text-gruen-950 no-underline transition duration-(--dauer-rueckmeldung) hover:bg-gruen-50 focus-visible:outline-weiss active:scale-98"
          >
            <Users aria-hidden className="size-5 shrink-0" />
            {t('unterstuetzen.knopf')}
          </Link>
          <Link
            href={{ pathname: '/projekte', hash: 'spendenkonto' }}
            aria-label={t('linkKontext', { sichtbar: t('spenden.jetzt'), titel: spendenTitel })}
            className="inline-flex min-h-12 items-center gap-2 rounded-lg border-2 border-weiss px-5.5 font-bold text-weiss no-underline transition duration-(--dauer-rueckmeldung) hover:bg-gruen-800 hover:text-weiss focus-visible:outline-weiss active:scale-98"
          >
            <Heart aria-hidden className="size-5 shrink-0" />
            {t('spenden.jetzt')}
          </Link>
        </div>
      </div>
      <Spenden inhalt={inhalt} sprache={sprache} />
    </section>
  );
}
