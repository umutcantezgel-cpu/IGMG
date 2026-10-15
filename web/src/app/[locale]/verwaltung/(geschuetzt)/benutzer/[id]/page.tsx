import { ArrowLeft } from 'lucide-react';
import NextLink from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { RollenFormular } from '@/components/verwaltung/benutzer/RollenFormular';
import { LoeschenBestaetigen } from '@/components/verwaltung/veranstaltungen/LoeschenBestaetigen';
import { Meldung } from '@/components/verwaltung/Meldung';
import { datumLang, uhrzeit } from '@/lib/i18n/format';
import { darf, verlangeSeitenRecht } from '@/lib/rechte/pruefe';
import { antraegeVon } from '@/lib/rechte/schutzrollen';
import { Button } from '@/components/ui/button';
import { kontoEntsperren, kontoLoeschen, kontoSperren, zweiFaktorZuruecksetzen } from '@/server/actions/benutzer';
import { ladeBenutzerAnsicht } from '@/server/queries/verwaltung/benutzer';

const karte = 'flex flex-col gap-4 rounded-lg border border-linie bg-weiss p-5 md:p-6';
const FEHLER = ['selbst', 'letzteAdministration'] as const;

/** Verwaltung › Benutzer › Konto (C12): Rollen, Zwei-Faktor zurücksetzen, endgültig löschen. */
export default async function KontoBearbeiten({ params, searchParams }: PageProps<'/[locale]/verwaltung/benutzer/[id]'>) {
  const a = await verlangeSeitenRecht('benutzer.lesen');
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const konto = await ladeBenutzerAnsicht(id, a);
  if (!konto) notFound();
  const t = await getTranslations('verwaltung.benutzer');
  const bearbeiten = darf(a.rollen, 'benutzer.bearbeiten');
  const selbst = konto.id === a.benutzerId;
  const fehler = FEHLER.find((f) => f === sp.fehler);
  const meldung = (['zweiFaktor', 'gesperrt', 'entsperrt'] as const).find((m) => m === sp.meldung);
  const [tg, tr, offen] = await Promise.all([
    getTranslations('verwaltung.shell'),
    getTranslations('verwaltung.rollen'),
    antraegeVon(konto.id),
  ]);
  return (
    <>
      <NextLink href="/verwaltung/benutzer" className="inline-flex min-h-11 items-center gap-2 self-start font-bold">
        <ArrowLeft aria-hidden className="size-5" />
        {t('detail.zurueck')}
      </NextLink>
      <VerwaltungsKopf titel={konto.name} kennung={tg('gruppe.betrieb')} einleitung={<span className="break-all">{konto.email}</span>} />
      <div className="flex flex-col gap-2">
        <p className="text-16 text-tinte-2">
          {t('detail.seit')} {datumLang(konto.erstelltAm, 'de')} ·{' '}
          {t(konto.zweiFaktor ? 'zweiFaktorStatus.eingerichtet' : 'zweiFaktorStatus.ausstehend')} ({t('spalte.zweiFaktor')}) ·{' '}
          {t('spalte.letzteAnmeldung')}:{' '}
          {konto.letzteAnmeldung ? `${datumLang(konto.letzteAnmeldung, 'de')}, ${uhrzeit(konto.letzteAnmeldung, 'de')}` : t('nie')}
        </p>
      </div>
      {fehler ? <Meldung art="fehler">{t(`fehler.${fehler}`)}</Meldung> : null}
      {meldung ? <Meldung art="erfolg">{t(`meldung.${meldung}`)}</Meldung> : null}
      {selbst ? <Meldung art="info">{t('detail.selbstHinweis')}</Meldung> : null}
      <section aria-labelledby="konto-rollen" className={`${karte} max-w-einleitung`}>
        <h2 id="konto-rollen" className="text-24">
          {t('detail.rollenTitel')}
        </h2>
        {offen.length ? <Meldung art="info">{t('antraege.offen', { rollen: offen.map((r) => tr(r)).join(', ') })}</Meldung> : null}
        {bearbeiten ? <RollenFormular id={konto.id} rollen={konto.rollen} /> : <p>{konto.rollen.map((r) => r.rolle).join(', ')}</p>}
      </section>
      {bearbeiten && !selbst ? (
        <div className="grid max-w-5xl gap-6 lg:grid-cols-2">
          <section aria-labelledby="konto-zugang" className={karte}>
            <h2 id="konto-zugang" className="text-24">
              {t('detail.zugangTitel')}
            </h2>
            <p>{t('detail.sperrenText')}</p>
            {konto.gesperrtAm ? (
              <>
                <p className="font-bold text-fehler">
                  {t('detail.gesperrtSeit', { datum: `${datumLang(konto.gesperrtAm, 'de')}, ${uhrzeit(konto.gesperrtAm, 'de')}` })}
                </p>
                <form action={kontoEntsperren}>
                  <input type="hidden" name="id" value={konto.id} />
                  <Button type="submit" variant="outline">
                    {t('detail.entsperren')}
                  </Button>
                </form>
              </>
            ) : (
              <LoeschenBestaetigen
                id={konto.id}
                aktion={kontoSperren}
                texte={{
                  ausloeser: t('detail.sperren'),
                  titel: t('detail.sperrenTitel'),
                  text: t('detail.sperrenFrage'),
                  bestaetigen: t('detail.sperrenBestaetigen'),
                  abbrechen: t('detail.abbrechen'),
                }}
              />
            )}
          </section>
          <section aria-labelledby="konto-zwei-faktor" className={karte}>
            <h2 id="konto-zwei-faktor" className="text-24">
              {t('detail.sicherheitTitel')}
            </h2>
            <p>{t('detail.zweiFaktorText')}</p>
            <LoeschenBestaetigen
              id={konto.id}
              aktion={zweiFaktorZuruecksetzen}
              texte={{
                ausloeser: t('detail.zweiFaktorZuruecksetzen'),
                titel: t('detail.zweiFaktorTitel'),
                text: t('detail.zweiFaktorFrage'),
                bestaetigen: t('detail.zweiFaktorBestaetigen'),
                abbrechen: t('detail.abbrechen'),
              }}
            />
          </section>
          <section aria-labelledby="konto-loeschen" className={karte}>
            <h2 id="konto-loeschen" className="text-24">
              {t('detail.loeschenTitelAbschnitt')}
            </h2>
            <p>{t('detail.loeschenText')}</p>
            <LoeschenBestaetigen
              id={konto.id}
              aktion={kontoLoeschen}
              texte={{
                ausloeser: t('detail.loeschen'),
                titel: t('detail.loeschenTitel'),
                text: t('detail.loeschenFrage'),
                bestaetigen: t('detail.loeschenBestaetigen'),
                abbrechen: t('detail.abbrechen'),
              }}
            />
          </section>
        </div>
      ) : null}
    </>
  );
}
