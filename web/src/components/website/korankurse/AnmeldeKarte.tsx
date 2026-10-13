import { ArrowRight, Mail, MapPin, Phone } from 'lucide-react';
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
 * stehen außerhalb des Links, nur die Nummer bzw. Adresse ist der Link.
 * H-C07: Ab lg zwei Hälften mit feiner Trennlinie; links Anmeldung, rechts Kontakt.
 * H-F01: Die Karte ist hell (gruen-50 mit gruen-700-Band), weil sie unmittelbar vor dem Fuß steht (ENTSCHEIDUNGEN L-E15).
 * Kurszeilen sind weiße Flächen mit Rand; Symbole und Links in Grün, Fließtext in Tinte.
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
    <section aria-labelledby="reg" className="overflow-hidden rounded-lg bg-gruen-50">
      <div aria-hidden className="h-1.5 bg-gruen-700" />
      <div className="grid gap-8 p-5 md:p-8 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <h2 id="reg" className="text-display-2">
            {t('anmeldungUeberschrift')}
          </h2>
          <p className="max-w-text leading-einleitung text-pretty text-tinte-2">{t('anmeldungText')}</p>
          <h3 className="font-text text-18 font-bold">{t('verfuegbar')}</h3>
          {offen.length ? (
            <ul className="flex flex-col gap-2">
              {offen.map(({ kurs, ziel }) => {
                const Icon = kurs.anmeldeweg === 'join' ? MapPin : ArrowRight;
                return (
                  <li key={kurs.id}>
                    <Link
                      href={ziel}
                      className="flex min-h-14 items-center justify-between gap-3 rounded-md border border-linie bg-weiss px-4 py-2 text-tinte no-underline transition duration-(--dauer-rueckmeldung) hover:border-gruen-700 hover:text-tinte active:scale-98"
                    >
                      <span className="flex flex-col leading-tight">
                        <Text feld={kurs.titel} sprache={sprache} als="strong" />
                        <span className="text-16 text-tinte-2">
                          {kurs.anmeldeweg === 'join' ? tk('statusKeineAnmeldung') : tk('statusVoranmeldung')}
                        </span>
                      </span>
                      <Icon aria-hidden className="size-5 shrink-0 text-gruen-700" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p>{t('keineVerfuegbar')}</p>
          )}
        </div>
        <div className="flex flex-col gap-4 lg:border-l lg:border-linie lg:pl-8">
          <h3 className="font-text text-18 font-bold">{t('kontaktUeberschrift')}</h3>
          <p className="max-w-text leading-einleitung text-pretty text-tinte-2">{t('kontaktText')}</p>
          <div className="flex flex-col">
            <p className="flex min-h-12 items-center gap-2.5">
              <Phone aria-hidden className="size-5 shrink-0 text-gruen-700" />
              {t('telefon')}
              {telefonZiel ? (
                <a href={telefonZiel} className="wrap-anywhere text-gruen-700 underline underline-offset-3">
                  {kontakt.telefon}
                </a>
              ) : (
                <span>{kontakt.telefon}</span>
              )}
            </p>
            <p className="flex min-h-12 items-center gap-2.5">
              <Mail aria-hidden className="size-5 shrink-0 text-gruen-700" />
              {t('email')}
              <a href={`mailto:${kontakt.email}`} className="wrap-anywhere text-gruen-700 underline underline-offset-3">
                {kontakt.email}
              </a>
            </p>
          </div>
          <Link
            href="/kontakt"
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 self-start rounded-md bg-gruen-700 px-5.5 font-bold text-weiss no-underline transition duration-(--dauer-rueckmeldung) hover:bg-gruen-800 hover:text-weiss active:scale-98 sm:w-auto"
          >
            {t('kontaktKnopf')}
            <ArrowRight aria-hidden className="size-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
