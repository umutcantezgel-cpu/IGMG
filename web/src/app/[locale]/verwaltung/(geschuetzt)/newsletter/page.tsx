import { Eye, Pencil, Plus, Users } from 'lucide-react';
import NextLink from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { pille } from '@/components/verwaltung/hatim/stil';
import { Meldung } from '@/components/verwaltung/Meldung';
import { ListenKarte, ListenLeer, TabellenRahmen } from '@/components/verwaltung/TabellenRahmen';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { datumOhneWochentag } from '@/lib/i18n/format';
import { darf, verlangeSeitenRecht } from '@/lib/rechte/pruefe';
import { cn } from '@/lib/utils';
import { THEMEN } from '@/lib/validierung/formulare/newsletter';
import { empfaengerUebersicht, ladeAusgaben, type Ausgabe } from '@/server/queries/verwaltung/newsletter';

/**
 * Verwaltung › Newsletter (AUFTRAG 3.10, K-B): Empfängerzahlen je Thema (nie Adressen) und die Ausgaben mit Stand.
 * Lesen mit `newsletter.lesen` (auch Leitung), Schreiben und Versenden mit `newsletter.senden`.
 */
export default async function NewsletterVerwalten({ searchParams }: PageProps<'/[locale]/verwaltung/newsletter'>) {
  const a = await verlangeSeitenRecht('newsletter.lesen');
  const [t, tg, ausgaben, zahlen, suche] = await Promise.all([
    getTranslations('verwaltung.newsletter'),
    getTranslations('verwaltung.shell'),
    ladeAusgaben(),
    empfaengerUebersicht(),
    searchParams,
  ]);
  const darfSenden = darf(a.rollen, 'newsletter.senden');
  const themen = (x: Ausgabe) => (x.themen.length ? x.themen.map((th) => t(`themen.${th}`)).join(', ') : t('themen.alle'));
  const stand = (x: Ausgabe) =>
    x.versendetAm ? (
      <span className={cn(pille, 'bg-gruen-50 text-gruen-800')}>
        {t('stand.versendet', { datum: datumOhneWochentag(x.versendetAm, 'de'), anzahl: x.empfaenger })}
      </span>
    ) : (
      <span className={cn(pille, 'bg-sand text-tinte-2')}>{t('stand.entwurf')}</span>
    );
  const aktion = (x: Ausgabe) => {
    const bearbeiten = darfSenden && !x.versendetAm;
    return (
      <Button asChild variant="outline" size="icon">
        <NextLink href={`/verwaltung/newsletter/${x.id}`}>
          {bearbeiten ? <Pencil aria-hidden /> : <Eye aria-hidden />}
          <span className="sr-only">
            {bearbeiten ? t('aktionBearbeiten', { betreff: x.betreff.de }) : t('aktionAnsehen', { betreff: x.betreff.de })}
          </span>
        </NextLink>
      </Button>
    );
  };
  const anlegen = darfSenden ? (
    <Button asChild>
      <NextLink href="/verwaltung/newsletter/neu">
        <Plus aria-hidden />
        {t('neu')}
      </NextLink>
    </Button>
  ) : null;

  return (
    <>
      <VerwaltungsKopf
        titel={t('titel')}
        kennung={tg('gruppe.kommunikation')}
        einleitung={t('einleitung')}
        aktion={ausgaben.length ? anlegen : null}
      />
      {suche.geloescht ? <Meldung art="erfolg">{t('geloescht')}</Meldung> : null}
      <section aria-labelledby="newsletter-empfaenger" className="flex flex-col gap-4 rounded-lg border border-linie bg-weiss p-5 md:p-6">
        <h2 id="newsletter-empfaenger" className="flex items-center gap-2 font-display text-24 font-semibold">
          <Users aria-hidden className="size-6 text-gruen-700" />
          {t('empfaenger.titel')}
        </h2>
        <p className="text-20 font-bold tabular-nums">{t('empfaenger.gesamt', { anzahl: zahlen.gesamt })}</p>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {THEMEN.map((thema) => (
            <li key={thema} className="flex flex-col rounded-md bg-sand px-4 py-3">
              <span className="text-16 text-tinte-2">{t(`themen.${thema}`)}</span>
              <span className="text-24 font-bold tabular-nums">{t('empfaenger.thema', { anzahl: zahlen.je[thema] })}</span>
            </li>
          ))}
        </ul>
        <p className="text-16 text-tinte-2">{t('empfaenger.hinweis')}</p>
      </section>
      <h2 className="font-display text-24 font-semibold">{t('ausgaben')}</h2>
      {ausgaben.length === 0 ? (
        <ListenLeer text={t('leer')} aktion={anlegen ?? undefined} />
      ) : (
        <TabellenRahmen
          beschriftung={t('tabelle')}
          mobil={
            <ul className="flex flex-col gap-3">
              {ausgaben.map((x) => (
                <ListenKarte
                  key={x.id}
                  titel={x.betreff.de}
                  angaben={[
                    { label: t('spalte.themen'), wert: themen(x) },
                    { label: t('spalte.stand'), wert: stand(x) },
                  ]}
                  aktionen={aktion(x)}
                />
              ))}
            </ul>
          }
        >
          <table className="w-full min-w-220 border-collapse text-left">
            <caption className="sr-only">{t('tabelle')}</caption>
            <thead className="bg-sand">
              <tr>
                {(['betreff', 'themen', 'stand', 'aktionen'] as const).map((s) => (
                  <th key={s} scope="col" className="px-4 py-3 text-16 font-bold">
                    {t(`spalte.${s}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ausgaben.map((x) => (
                <tr key={x.id} className="border-t border-linie align-middle">
                  <th scope="row" className="px-4 py-3 font-bold">
                    {x.betreff.de}
                  </th>
                  <td className="px-4 py-3">{themen(x)}</td>
                  <td className="px-4 py-3">{stand(x)}</td>
                  <td className="px-4 py-3">{aktion(x)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TabellenRahmen>
      )}
    </>
  );
}
