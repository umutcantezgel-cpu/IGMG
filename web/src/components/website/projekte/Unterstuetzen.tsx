import { Heart, Users } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Text, textMitSprache } from '@/components/website/Text';
import { Link } from '@/i18n/link';
import type { Sprache } from '@/lib/i18n/inhalt';
import type { ProjekteInhalt } from '@/lib/validierung/seiteninhalte/projekte';
import { brauchtRueckfall } from './hilfen';

/** Unterstützen (Design Projects.dc.html D:65–70): dunkle Fläche mit zwei Absätzen und Kontaktknopf zu /kontakt. */
export async function Unterstuetzen({ inhalt, sprache }: { inhalt: ProjekteInhalt; sprache: Sprache }) {
  const t = await getTranslations('projekte');
  const tAllg = await getTranslations('allgemein');
  const u = inhalt.unterstuetzung;
  const titel = textMitSprache(u.titel, sprache).text;
  const rueckfall = brauchtRueckfall(sprache, [u.titel, u.text, u.dank]);
  return (
    <section aria-labelledby="unterstuetzen-titel" className="flex flex-col gap-4 rounded-lg bg-gruen-950 p-6 text-weiss md:p-12">
      <h2 id="unterstuetzen-titel" className="flex items-center gap-3 text-30 md:text-36">
        <Heart aria-hidden className="size-7 shrink-0 text-gruen-100" />
        <Text feld={u.titel} sprache={sprache} />
      </h2>
      {rueckfall ? <p className="text-16 text-gruen-100">{tAllg('nurDeutsch')}</p> : null}
      <Text feld={u.text} sprache={sprache} als="p" className="max-w-(--container-text) text-pretty text-gruen-50" />
      <Text feld={u.dank} sprache={sprache} als="p" className="max-w-(--container-text) text-pretty text-gruen-100" />
      <Link
        href="/kontakt"
        aria-label={t('linkKontext', { sichtbar: t('unterstuetzen.knopf'), titel })}
        className="inline-flex min-h-12 items-center gap-2 self-start rounded-lg bg-weiss px-6 font-bold text-gruen-950 no-underline hover:bg-gruen-50"
      >
        <Users aria-hidden className="size-5 shrink-0" />
        {t('unterstuetzen.knopf')}
      </Link>
    </section>
  );
}
