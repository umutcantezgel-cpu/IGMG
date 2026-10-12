import { ArrowRight, LogIn, Mail, Phone } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { zielFuer } from '@/components/website/CourseCard';
import { Text } from '@/components/website/Text';
import { Link } from '@/i18n/link';
import type { Sprache } from '@/lib/i18n/inhalt';
import { telefonHref } from '@/lib/telefon';
import type { KursDaten } from '@/server/queries/kurse';

/**
 * Abschnitt „Jetzt anmelden“ (design/QuranCourses.dc.html Z36–48, Blatt S19 Abschnitt 4): offene Kurse als Links
 * (abgeleitet aus dem Anmeldeweg), Kontakt aus den zentralen Kontaktdaten (Seiteninhalt kontakt).
 * H-B14: Der Status der offenen Kurse nennt dieselben Worte wie die Kurskarte; Beschriftungen („Telefon:“, „E-Mail:“)
 * stehen außerhalb des Links, nur die Nummer bzw. Adresse ist der Link. Auf dunklem Grund ist der Fokusring weiß (T01, G:122).
 */
export async function AnmeldeKarte({
  kurse,
  kontakt,
  sprache,
}: {
  kurse: KursDaten[];
  kontakt: { telefon: string; email: string };
  sprache: Sprache;
}) {
  const t = await getTranslations('korankurse');
  const tk = await getTranslations('kurskarte');
  const offen = kurse.flatMap((kurs) => {
    const ziel = zielFuer(kurs.anmeldeweg);
    return ziel ? [{ kurs, ziel }] : [];
  });
  const telefonZiel = telefonHref(kontakt.telefon);

  return (
    <section aria-labelledby="reg" className="flex flex-col gap-4 rounded-lg bg-gruen-950 p-5 text-weiss md:p-8">
      <h2 id="reg" className="text-display-2">
        {t('anmeldungUeberschrift')}
      </h2>
      <p className="max-w-text leading-einleitung text-pretty text-gruen-50">{t('anmeldungText')}</p>
      <h3 className="font-text text-18 font-bold">{t('verfuegbar')}</h3>
      {offen.length ? (
        <ul className="flex flex-col gap-2">
          {offen.map(({ kurs, ziel }) => {
            const Icon = kurs.anmeldeweg === 'join' ? LogIn : ArrowRight;
            return (
              <li key={kurs.id}>
                <Link
                  href={ziel}
                  className="flex min-h-14 items-center justify-between gap-3 rounded-md bg-weiss px-4 py-2 text-gruen-950 no-underline transition duration-(--dauer-rueckmeldung) hover:bg-gruen-50 hover:text-gruen-950 focus-visible:outline-weiss active:scale-98"
                >
                  <span className="flex flex-col leading-tight">
                    <Text feld={kurs.titel} sprache={sprache} als="strong" />
                    <span className="text-16 text-tinte-2">
                      {kurs.anmeldeweg === 'join' ? tk('statusKeineAnmeldung') : tk('statusVoranmeldung')}
                    </span>
                  </span>
                  <Icon aria-hidden className="size-5 shrink-0" />
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p>{t('keineVerfuegbar')}</p>
      )}
      <h3 className="mt-2 font-text text-18 font-bold">{t('kontaktUeberschrift')}</h3>
      <p className="max-w-text leading-einleitung text-pretty text-gruen-100">{t('kontaktText')}</p>
      <p className="flex min-h-12 items-center gap-2.5">
        <Phone aria-hidden className="size-5 shrink-0" />
        {t('telefon')}
        {telefonZiel ? (
          <a href={telefonZiel} className="wrap-anywhere text-weiss underline underline-offset-3 focus-visible:outline-weiss">
            {kontakt.telefon}
          </a>
        ) : (
          <span>{kontakt.telefon}</span>
        )}
      </p>
      <p className="flex min-h-12 items-center gap-2.5">
        <Mail aria-hidden className="size-5 shrink-0" />
        {t('email')}
        <a href={`mailto:${kontakt.email}`} className="wrap-anywhere text-weiss underline underline-offset-3 focus-visible:outline-weiss">
          {kontakt.email}
        </a>
      </p>
      <Link
        href="/kontakt"
        className="inline-flex min-h-12 items-center gap-2 self-start rounded-md bg-weiss px-5.5 font-bold text-gruen-950 no-underline transition duration-(--dauer-rueckmeldung) hover:bg-gruen-50 hover:text-gruen-950 focus-visible:outline-weiss active:scale-98"
      >
        {t('kontaktKnopf')}
        <ArrowRight aria-hidden className="size-5" />
      </Link>
    </section>
  );
}
