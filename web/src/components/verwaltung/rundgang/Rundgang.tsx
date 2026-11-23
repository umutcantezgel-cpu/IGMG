import { ArrowUp } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import NextLink from 'next/link';
import { Meldung } from '@/components/verwaltung/Meldung';
import { AUFNAHMEN, RUNDGANG_GRUPPEN, aufnahmeAdresse, type SchirmId } from './aufnahmen';

/**
 * Rundgang der Vorführung ohne Datenbank (ADR 0019, Auftrag des Nutzers vom 23.11.2026: „es ist eine Testversion – mach,
 * dass man das Design einfach alles begutachten kann“): Ohne Datenbank gibt es keine Konten und keine Anmeldung; an der
 * Stelle der Verwaltung zeigt die Seite deshalb jeden Bildschirm hinter der Anmeldung als Aufnahme aus der Testumgebung –
 * Verwaltung, „Mein Bereich“ und Unterricht, je für Computer und Handy. Die Aufnahmen zeigen Beispieldaten; das steht oben
 * auf der Seite. Mit verbundener Datenbank erscheint der Rundgang nicht (`verwaltung/layout.tsx`).
 *
 * Ohne Client-JavaScript: Sprungmarken zu den Bereichen, jede Aufnahme in einem Rahmen mit eigener Laufleiste (Fenster am
 * Computer, Gerät am Handy), der Link im Rahmen öffnet die Datei in voller Größe und macht den Rahmen mit der Tastatur
 * erreichbar. Bilder laden erst in der Nähe des sichtbaren Bereichs.
 */
export async function Rundgang() {
  const t = await getTranslations('verwaltung.rundgang');
  const tv = await getTranslations('verwaltung');
  const anzahl = RUNDGANG_GRUPPEN.reduce((n, g) => n + g.schirme.length, 0);
  return (
    <>
      <a
        href="#inhalt"
        className="sr-only z-(--ebene-sprung) rounded-md bg-weiss px-4 py-3 font-bold focus:not-sr-only focus:fixed focus:start-4 focus:top-4"
      >
        {tv('shell.zumInhalt')}
      </a>
      <header id="anfang" className="border-b border-linie bg-weiss">
        <div className="mx-auto flex max-w-(--container-inhalt) flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-3 md:px-8">
          <div className="flex items-center gap-3">
            <Image src="/bilder/logos/logo-igmg-wetzlar.png" alt="" width={40} height={40} className="size-10 rounded-sm" />
            <p className="font-display text-20 font-semibold">
              IGMG Wetzlar{' '}
              <span aria-hidden="true" className="font-normal text-tinte-2">
                ·
              </span>{' '}
              <span className="font-normal text-tinte-2">{tv('titel')}</span>
            </p>
          </div>
          <NextLink href="/" prefetch={false} className="inline-flex min-h-12 items-center font-bold">
            {tv('shell.zurWebsite')}
          </NextLink>
        </div>
      </header>
      <nav aria-label={t('bereiche')} className="sticky top-0 z-(--ebene-kopf) border-b border-linie bg-papier">
        <ul className="mx-auto flex max-w-(--container-inhalt) gap-2 overflow-x-auto px-4 py-2 md:px-8">
          {RUNDGANG_GRUPPEN.map((g) => (
            <li key={g.id} className="shrink-0">
              <a
                href={`#${g.id}`}
                className="inline-flex min-h-11 items-center rounded-pill border border-linie bg-weiss px-3 text-16 font-bold whitespace-nowrap text-tinte no-underline hover:border-gruen-700 hover:bg-gruen-50"
              >
                {t(`gruppen.${g.id}.titel`)}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <main id="inhalt" tabIndex={-1} className="focus:outline-none">
        <div className="border-b border-linie bg-sand">
          <div className="mx-auto max-w-(--container-inhalt) px-4 py-10 md:px-8 md:py-14">
            <p className="text-16 font-bold text-gruen-700">{t('dachzeile')}</p>
            <h1 className="mt-2 text-display-1">{t('titel')}</h1>
            <p className="mt-4 max-w-einleitung text-18 text-pretty text-tinte-2">{t('einleitung')}</p>
            <div className="mt-6 max-w-einleitung">
              <Meldung art="info">{t('hinweis')}</Meldung>
            </div>
            <p className="mt-6 text-16 text-tinte-2">
              <strong className="text-tinte">{t('umfang', { schirme: anzahl, bereiche: RUNDGANG_GRUPPEN.length })}</strong>
              {' · '}
              {t('bedienung')}
            </p>
          </div>
        </div>
        {RUNDGANG_GRUPPEN.map((g) => (
          <section key={g.id} id={g.id} aria-labelledby={`${g.id}-titel`} className="scroll-mt-16 border-b border-linie">
            <div className="mx-auto max-w-(--container-inhalt) px-4 py-10 md:px-8 md:py-14">
              <h2 id={`${g.id}-titel`} className="text-display-2">
                {t(`gruppen.${g.id}.titel`)}
              </h2>
              <p className="mt-2 max-w-einleitung text-18 text-pretty text-tinte-2">{t(`gruppen.${g.id}.text`)}</p>
              <nav aria-label={t('inhalt')} className="mt-4">
                <ul className="flex flex-wrap gap-x-5 gap-y-1">
                  {g.schirme.map((id) => (
                    <li key={id}>
                      <a href={`#${id}`} className="inline-flex min-h-11 items-center text-16 font-bold underline-offset-4">
                        {t(`schirme.${id}.titel`)}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
              {g.schirme.map((id) => (
                <Schirm
                  key={id}
                  id={id}
                  titel={t(`schirme.${id}.titel`)}
                  text={t(`schirme.${id}.text`)}
                  texte={{
                    computer: t('computer'),
                    telefon: t('telefon'),
                    bild: (geraet) => t('bild', { titel: t(`schirme.${id}.titel`), geraet }),
                    oeffnen: (geraet) => t('oeffnen', { titel: t(`schirme.${id}.titel`), geraet }),
                  }}
                />
              ))}
              <p className="mt-8">
                <a href="#anfang" className="inline-flex min-h-11 items-center gap-2 text-16 font-bold underline-offset-4">
                  <ArrowUp aria-hidden className="size-5" />
                  {t('nachOben')}
                </a>
              </p>
            </div>
          </section>
        ))}
      </main>
    </>
  );
}

type SchirmTexte = { computer: string; telefon: string; bild: (geraet: string) => string; oeffnen: (geraet: string) => string };

/** Ein Bildschirm: Titel, ein Satz Nutzen, daneben die Aufnahmen – am Telefon zuerst das Handy, dann der Computer. */
function Schirm({ id, titel, text, texte }: { id: SchirmId; titel: string; text: string; texte: SchirmTexte }) {
  const a = AUFNAHMEN[id];
  return (
    <article id={id} aria-labelledby={`${id}-titel`} className="mt-10 scroll-mt-20 border-t border-linie pt-8">
      <h3 id={`${id}-titel`} className="font-display text-24 font-semibold">
        {titel}
      </h3>
      <p className="mt-1 max-w-einleitung text-pretty text-tinte-2">{text}</p>
      <div className="mt-5 flex flex-col items-center gap-6 verwaltung:flex-row verwaltung:items-start">
        <figure className="order-2 w-full min-w-0 verwaltung:order-1 verwaltung:flex-1">
          <div className="overflow-hidden rounded-lg border border-linie bg-weiss shadow-s2">
            <div aria-hidden className="flex items-center gap-1.5 border-b border-linie bg-sand px-3 py-2.5">
              <span className="size-2.5 rounded-pill bg-linie" />
              <span className="size-2.5 rounded-pill bg-linie" />
              <span className="size-2.5 rounded-pill bg-linie" />
            </div>
            <div className="max-h-144 overflow-y-auto overscroll-contain">
              <a href={aufnahmeAdresse(id, 'desktop')} aria-label={texte.oeffnen(texte.computer)} className="block">
                {/* eslint-disable-next-line @next/next/no-img-element -- feste Datei aus public/, kein Client-JavaScript */}
                <img
                  src={aufnahmeAdresse(id, 'desktop')}
                  alt={texte.bild(texte.computer)}
                  width={a.desktop.breite}
                  height={a.desktop.hoehe}
                  loading="lazy"
                  decoding="async"
                  className="block h-auto w-full"
                />
              </a>
            </div>
          </div>
          <figcaption className="mt-2 text-16 text-tinte-2">{texte.computer}</figcaption>
        </figure>
        <figure className="order-1 w-64 max-w-full shrink-0 verwaltung:order-2">
          <div className="overflow-hidden rounded-lg border-4 border-tinte bg-weiss shadow-s2">
            <div className="h-128 overflow-y-auto overscroll-contain">
              <a href={aufnahmeAdresse(id, 'telefon')} aria-label={texte.oeffnen(texte.telefon)} className="block">
                {/* eslint-disable-next-line @next/next/no-img-element -- feste Datei aus public/, kein Client-JavaScript */}
                <img
                  src={aufnahmeAdresse(id, 'telefon')}
                  alt={texte.bild(texte.telefon)}
                  width={a.telefon.breite}
                  height={a.telefon.hoehe}
                  loading="lazy"
                  decoding="async"
                  className="block h-auto w-full"
                />
              </a>
            </div>
          </div>
          <figcaption className="mt-2 text-16 text-tinte-2">{texte.telefon}</figcaption>
        </figure>
      </div>
    </article>
  );
}
