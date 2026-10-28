import { CalendarClock, Phone, UserRound } from 'lucide-react';
import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { FaqAnsicht } from '@/components/website/bloecke/TextBloecke';
import { Quellenzeile } from '@/components/website/dachverband/Quellenzeile';
import { Abfluege } from '@/components/website/hadsch-umra/Abfluege';
import { Unterlagen } from '@/components/website/hadsch-umra/Unterlagen';
import { Videos } from '@/components/website/hadsch-umra/Videos';
import { ZielLink } from '@/components/website/hadsch-umra/ZielLink';
import { JsonLd } from '@/components/website/JsonLd';
import { PageHeader } from '@/components/website/PageHeader';
import { MitPlatzhaltern } from '@/components/website/Platzhalter';
import { Seitenrahmen } from '@/components/website/Seitenrahmen';
import { Text } from '@/components/website/Text';
import { WissenErklaerung } from '@/components/website/wissen/WissenErklaerung';
import type { Locale } from '@/i18n/routing';
import { aktuelleHinweise } from '@/lib/hadsch-umra/auswahl';
import { datumOhneWochentag } from '@/lib/i18n/format';
import { waehle } from '@/lib/i18n/inhalt';
import { faqSeite } from '@/lib/seo/jsonld';
import { metadatenFuer } from '@/lib/seo/metadaten';
import { telefonHref } from '@/lib/telefon';
import { heuteBerlin } from '@/lib/zeit/heute';
import { ladeSeiteninhalt } from '@/server/queries/seiteninhalte';
import { ladeWissensThema } from '@/server/queries/wissen';

export const ensureStatic = 'navigation';

/** Wissensthema mit der religiösen Erklärung (Plan Marktstart P5, ADR 0047): als Entwurf gekennzeichnet. */
const WISSEN_SLUG = 'hajj-umrah';

const H2 = 'text-display-2 text-balance';
const KARTE = 'flex flex-col gap-3 rounded-lg border border-linie bg-weiss p-5 md:p-6';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('seo.hadschUmra');
  return metadatenFuer({ pfad: '/hadsch-umra', titel: t('titel'), beschreibung: t('beschreibung') });
}

/** Kalendertag JJJJ-MM-TT als Datum (Mittag UTC hält den Tag in Europe/Berlin stabil). */
const tag = (datum: string) => new Date(`${datum}T12:00:00Z`);

/**
 * Hadsch & Umra (Plan Marktstart P4, K-03 mit E-045): Pilgerfahrt mit IGMG Reisen ab Wetzlar und Hessen. Reihenfolge nach
 * dem Grundsatz „Antwort zuerst“: Einleitung, aktuelle Fristen (nach ihrem Tag ausgeblendet), die religiöse Erklärung aus
 * „Islamisches Wissen“ (Entwurf zur Prüfung, nur sichtbar mit `website_wissen_vorschau` oder nach der Freigabe),
 * Programme, Abflüge (vergangene ausgeblendet), Anmeldung mit Ansprechperson der Gemeinde, Unterlagen, Videos erst nach
 * Klick (K-14), Fragen mit FAQPage (K-16) und Quellenzeile. Inhalt aus dem Seiteninhalt „hadsch-umra“; statisch (K-01),
 * der Tag kommt aus `heuteBerlin()`. Nur die Videoflächen sind Client-Inseln (NachKlick, K-12).
 */
export default async function HadschUmraSeite() {
  const sprache = (await getLocale()) as Locale;
  const [t, tk, inhalt, heute, thema] = await Promise.all([
    getTranslations('hadschUmra'),
    getTranslations('kopf'),
    ladeSeiteninhalt('hadsch-umra'),
    heuteBerlin(),
    ladeWissensThema(WISSEN_SLUG),
  ]);
  const hinweise = aktuelleHinweise(inhalt.hinweise, heute.datum);
  const faqTitel = t('faqTitel');
  const faq = faqSeite(inhalt.faq, sprache);
  const person = inhalt.ansprechperson;
  const telefon = telefonHref(person.telefon);
  const einleitung = waehle(inhalt.einleitung, sprache);

  return (
    <Seitenrahmen bereich="islam" seite="hadsch-umra" sprachZiel="/hadsch-umra" pfad={[{ label: tk('islam') }, { label: t('titel') }]}>
      {faq ? <JsonLd daten={faq} /> : null}
      <PageHeader kennung={t('kennung')} titel={t('titel')} untertitel={t('untertitel')} />
      <div className="mx-auto flex max-w-(--container-inhalt) flex-col gap-12 px-4 py-abschnitt-klein md:gap-16 md:px-8">
        <p lang={einleitung.rueckfall ? 'de' : undefined} className="max-w-text text-20 leading-relaxed text-pretty">
          <MitPlatzhaltern text={einleitung.text} />
        </p>

        {hinweise.length ? (
          <section aria-labelledby="hu-hinweise" className="flex max-w-text flex-col gap-4 rounded-lg bg-sand p-5 md:p-6">
            <h2 id="hu-hinweise" className="flex items-center gap-2.5 font-text text-20 font-bold tracking-normal">
              <CalendarClock aria-hidden className="size-5 shrink-0 text-gruen-700" />
              {t('hinweise.titel')}
            </h2>
            <ul className="flex flex-col gap-4">
              {hinweise.map((h, i) => {
                const text = waehle(h.text, sprache);
                return (
                  <li key={`${h.bis}-${i}`} className="flex flex-col gap-1">
                    <p lang={text.rueckfall ? 'de' : undefined} className="text-18 font-bold">
                      {text.text}
                    </p>
                    <p className="text-16 text-tinte-2">{t('hinweise.bis', { datum: datumOhneWochentag(tag(h.bis), sprache) })}</p>
                    {h.link ? <ZielLink ziel={h.link} sprache={sprache} text={t('hinweise.link')} kontext={text.text} /> : null}
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        {thema ? (
          <section aria-labelledby="hu-wissen" className="flex flex-col gap-4">
            <h2 id="hu-wissen" className={H2}>
              {t('wissen.titel')}
            </h2>
            <WissenErklaerung slug={WISSEN_SLUG} sprache={sprache} ebene={3} />
          </section>
        ) : null}

        {inhalt.programme.length ? (
          <section aria-labelledby="hu-programme" className="flex flex-col gap-4">
            <div className="flex max-w-text flex-col gap-2">
              <h2 id="hu-programme" className={H2}>
                {t('programme.titel')}
              </h2>
              <p className="text-tinte-2">{t('programme.text')}</p>
            </div>
            <ul className="grid gap-4 md:grid-cols-2">
              {inhalt.programme.map((p, i) => {
                const titel = waehle(p.titel, sprache);
                const text = p.text ? waehle(p.text, sprache) : null;
                return (
                  <li key={i} className={KARTE}>
                    <span className="self-start rounded-pill bg-gruen-50 px-3 py-0.5 text-16 font-bold text-gruen-800">
                      {t(`arten.${p.art}`)}
                    </span>
                    <h3 lang={titel.rueckfall ? 'de' : undefined} className="font-text text-20 font-bold tracking-normal text-balance">
                      {titel.text}
                    </h3>
                    {text?.text ? (
                      <p lang={text.rueckfall ? 'de' : undefined} className="text-tinte-2">
                        {text.text}
                      </p>
                    ) : null}
                    <ZielLink ziel={p.link} sprache={sprache} text={t('programme.link')} kontext={titel.text} className="mt-auto" />
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        <section aria-labelledby="hu-abfluege" className="flex flex-col gap-4">
          <div className="flex max-w-text flex-col gap-2">
            <h2 id="hu-abfluege" className={H2}>
              {t('abfluege.titel')}
            </h2>
            <p className="text-tinte-2">{t('abfluege.text')}</p>
          </div>
          <Abfluege abfluege={inhalt.abfluege} heute={heute.datum} sprache={sprache} />
        </section>

        <section aria-labelledby="hu-anmeldung" className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start">
          <div className="flex flex-col gap-4">
            <h2 id="hu-anmeldung" className={H2}>
              {t('anmeldung.titel')}
            </h2>
            <Text feld={inhalt.anmeldung.text} sprache={sprache} als="p" platzhalter className="max-w-text text-18 leading-relaxed" />
            {inhalt.anmeldung.stelle ? <ZielLink ziel={inhalt.anmeldung.stelle} sprache={sprache} text={t('anmeldung.stelle')} /> : null}
          </div>
          <div className={KARTE}>
            <h3 className="flex items-center gap-2.5 font-text text-20 font-bold tracking-normal">
              <UserRound aria-hidden className="size-5 shrink-0 text-gruen-700" />
              {t('anmeldung.personTitel')}
            </h3>
            <p className="font-bold">
              <MitPlatzhaltern text={person.name} />
            </p>
            <p className="flex min-h-12 items-center gap-2.5">
              <Phone aria-hidden className="size-5 shrink-0 text-gruen-700" />
              <span className="sr-only">{t('anmeldung.telefon')}: </span>
              {telefon ? (
                <a href={telefon} className="font-bold text-gruen-700 underline underline-offset-4">
                  {person.telefon}
                </a>
              ) : (
                <MitPlatzhaltern text={person.telefon} />
              )}
            </p>
            {person.sprechzeit?.de ? (
              <p className="text-tinte-2">
                <span className="font-bold text-tinte">{t('anmeldung.sprechzeit')}: </span>
                <Text feld={person.sprechzeit} sprache={sprache} platzhalter />
              </p>
            ) : null}
          </div>
        </section>

        {inhalt.unterlagen.length ? (
          <section aria-labelledby="hu-unterlagen" className="flex max-w-seitenkopf flex-col gap-4">
            <div className="flex max-w-text flex-col gap-2">
              <h2 id="hu-unterlagen" className={H2}>
                {t('unterlagen.titel')}
              </h2>
              <p className="text-tinte-2">{t('unterlagen.text')}</p>
            </div>
            <Unterlagen unterlagen={inhalt.unterlagen} sprache={sprache} />
          </section>
        ) : null}

        {inhalt.videos.length ? (
          <section aria-labelledby="hu-videos" className="flex flex-col gap-4">
            <div className="flex max-w-text flex-col gap-2">
              <h2 id="hu-videos" className={H2}>
                {t('videos.titel')}
              </h2>
              <p className="text-tinte-2">{t('videos.text')}</p>
            </div>
            <Videos videos={inhalt.videos} sprache={sprache} />
          </section>
        ) : null}
      </div>
      <div className="flex flex-col gap-12 pb-abschnitt md:gap-16">
        {inhalt.faq.length ? (
          // Überschrift aus den Texten der Seite, in jeder Sprache gleich gesetzt (kein Rückfall-Hinweis lang="de")
          <FaqAnsicht
            b={{ typ: 'faq', id: 'hadsch-umra-faq', titel: { de: faqTitel, tr: faqTitel, en: faqTitel }, eintraege: inhalt.faq }}
            sprache={sprache}
          />
        ) : null}
        {inhalt.stand ? (
          <div className="mx-auto w-full max-w-(--container-inhalt) px-4 md:px-8">
            <Quellenzeile quelle={t('quelleSeite')} stand={inhalt.stand} />
          </div>
        ) : null}
      </div>
    </Seitenrahmen>
  );
}
