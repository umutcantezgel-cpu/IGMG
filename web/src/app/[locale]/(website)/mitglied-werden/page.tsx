import { ArrowLeft, BookOpen, Calendar, Clock, Heart, Info, Mail, MessageSquare, Phone, Users } from 'lucide-react';
import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { FormularInsel } from '@/components/formular/FormularInsel';
import { Bildplatzhalter } from '@/components/website/Bildplatzhalter';
import { MitgliedsantragFormular } from '@/components/website/formulare/MitgliedsantragFormular';
import { PageHeader } from '@/components/website/PageHeader';
import { Seitenrahmen } from '@/components/website/Seitenrahmen';
import { Link } from '@/i18n/link';
import type { Locale } from '@/i18n/routing';
import { metadatenFuer } from '@/lib/seo/metadaten';
import { sendeMitgliedsantrag } from '@/server/actions/formulare/mitgliedsantrag';

export const ensureStatic = 'navigation';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('mitglied');
  return metadatenFuer({ pfad: '/mitglied-werden', titel: t('titel'), beschreibung: t('untertitel') });
}

/**
 * Gemeindekontakt ist nicht mehrsprachig (LB:226, 227, 242). Die Telefonnummer fehlt und wird als Platzhalter gezeigt;
 * E-Mail und Bürozeiten stammen aus Code und Design und sind als Beispielinhalt markiert (MENSCHEN M-011, M-012, M-019).
 */
const KONTAKT = { telefon: '[Telefonnummer]', email: 'info@igmg-wetzlar.de', zeiten: 'Mo.–Fr. 9:00–17:00 Uhr' } as const;

const VORTEILE = [
  { Icon: Users, schluessel: 'gemeinschaft' },
  { Icon: BookOpen, schluessel: 'bildung' },
  { Icon: Calendar, schluessel: 'programme' },
  { Icon: Heart, schluessel: 'wachstum' },
] as const;

/** Anmeldung zur Gemeinde (Blatt S21, design/JoinUs.dc.html): drei Schritte, Vorteile und Kontakt daneben. */
export default async function MitgliedWerdenSeite() {
  const sprache = (await getLocale()) as Locale;
  const [t, tf] = await Promise.all([getTranslations('mitglied'), getTranslations('formulare')]);
  return (
    <Seitenrahmen bereich="keiner" seite="mitglied-werden" sprachZiel="/mitglied-werden" pfad={[{ label: t('brotkrume') }]}>
      <PageHeader kennung={t('kennung')} titel={t('titel')} untertitel={t('untertitel')} />
      <div className="mx-auto flex w-full max-w-(--container-inhalt) flex-col gap-6 px-4 py-8 md:px-8 md:py-12">
        <Link
          href="/"
          className="inline-flex min-h-12 items-center gap-2 self-start font-bold text-gruen-700 underline underline-offset-4 hover:text-gruen-800"
        >
          <ArrowLeft aria-hidden className="size-5" />
          {t('zurueck')}
        </Link>
        <div className="flex flex-wrap items-start gap-8">
          <div className="flex min-w-0 flex-[2_1_560px] flex-col gap-4">
            <h2 className="flex items-center gap-2.5 font-display text-30 font-semibold text-gruen-800">
              <MessageSquare aria-hidden className="size-7 shrink-0 text-gruen-700" />
              {t('formularTitel')}
            </h2>
            <FormularInsel aktion={sendeMitgliedsantrag} ohneSkript={tf('ohneSkript')}>
              <MitgliedsantragFormular sprache={sprache} />
            </FormularInsel>
          </div>
          <aside className="flex min-w-0 flex-[1_1_320px] flex-col gap-6">
            <section className="flex flex-col gap-4 rounded-lg border border-linie bg-weiss p-6">
              <h2 className="flex items-center gap-2.5 font-display text-24 font-semibold">
                <Heart aria-hidden className="size-6 shrink-0 text-gruen-700" />
                {t('vorteile.titel')}
              </h2>
              <ul className="m-0 flex list-none flex-col gap-4 p-0">
                {VORTEILE.map(({ Icon, schluessel }) => (
                  <li key={schluessel} className="flex items-start gap-3">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-gruen-50 text-gruen-800">
                      <Icon aria-hidden className="size-5" />
                    </span>
                    <div className="flex min-w-0 flex-col">
                      <h3 className="text-18 font-bold">{t(`vorteile.${schluessel}.titel`)}</h3>
                      <p className="text-16 text-tinte-2">{t(`vorteile.${schluessel}.text`)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
            <section className="flex flex-col gap-3 rounded-lg bg-gruen-950 p-6 text-weiss">
              <h2 className="flex items-center gap-2.5 font-display text-24 font-semibold">
                <Info aria-hidden className="size-6 shrink-0 text-gruen-100" />
                {t('fragen.titel')}
              </h2>
              <p className="text-gruen-100">{t('fragen.text')}</p>
              <span className="flex items-center gap-2.5">
                <Phone aria-hidden className="size-5 shrink-0" />
                {KONTAKT.telefon}
              </span>
              <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                <Mail aria-hidden className="size-5 shrink-0" />
                <a
                  href={`mailto:${KONTAKT.email}`}
                  className="inline-flex min-h-12 items-center text-weiss underline underline-offset-[3px] hover:text-gruen-100"
                >
                  {KONTAKT.email}
                </a>
                <span className="text-gruen-100">[{t('beispiel')}]</span>
              </span>
              <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                <Clock aria-hidden className="size-5 shrink-0" />
                {KONTAKT.zeiten}
                <span className="text-gruen-100">[{t('beispiel')}]</span>
              </span>
              <Link
                href="/kontakt"
                className="mt-1 inline-flex min-h-12 items-center gap-2 self-start rounded-md bg-weiss px-5 font-bold text-gruen-950 no-underline hover:bg-gruen-50 hover:text-gruen-950"
              >
                <MessageSquare aria-hidden className="size-5" />
                {t('fragen.nachricht')}
              </Link>
            </section>
            <section className="flex flex-col overflow-hidden rounded-lg border border-linie bg-weiss">
              <Bildplatzhalter beschriftung={t('bild.foto')} className="h-40 border-b border-linie" />
              <div className="flex flex-col gap-1 p-5">
                <h2 className="text-20 font-bold">{t('bild.titel')}</h2>
                <p className="text-16 text-tinte-2">
                  {t('bild.text')} <span className="text-tinte">[{t('beispiel')}]</span>
                </p>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </Seitenrahmen>
  );
}
