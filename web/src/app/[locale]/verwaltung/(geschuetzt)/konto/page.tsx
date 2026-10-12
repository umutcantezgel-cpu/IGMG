import { getTranslations } from 'next-intl/server';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { ErsatzcodesFormular, PasswortFormular } from '@/components/verwaltung/benutzer/KontoFormulare';
import { Meldung } from '@/components/verwaltung/Meldung';
import { verlangeSitzung } from '@/lib/rechte/pruefe';

const karte = 'flex flex-col gap-4 rounded-lg border border-linie bg-weiss p-5 md:p-6';

/** Verwaltung › Mein Konto (C12, Blatt V12): eigene Angaben, Rollen, Passwort, Ersatzcodes. */
export default async function MeinKonto({ searchParams }: PageProps<'/[locale]/verwaltung/konto'>) {
  const a = await verlangeSitzung();
  const [t, tr, sp] = await Promise.all([getTranslations('verwaltung.benutzer'), getTranslations('verwaltung.rollen'), searchParams]);
  const tg = await getTranslations('verwaltung.shell');
  return (
    <>
      <VerwaltungsKopf titel={t('konto.titel')} kennung={tg('konto')} einleitung={t('konto.untertitel')} />
      {sp.passwort === 'geaendert' ? <Meldung art="erfolg">{t('konto.passwortGeaendert')}</Meldung> : null}
      <div className="grid max-w-6xl items-start gap-6 lg:grid-cols-2">
        <section aria-labelledby="konto-angaben" className={karte}>
          <h2 id="konto-angaben" className="text-24">
            {t('konto.angaben')}
          </h2>
          <dl className="grid gap-x-4 gap-y-2 sm:grid-cols-[minmax(0,9rem)_minmax(0,1fr)]">
            <dt className="font-bold">{t('formular.name')}</dt>
            <dd>{a.name}</dd>
            <dt className="font-bold">{t('formular.email')}</dt>
            <dd className="break-words">{a.email}</dd>
            <dt className="font-bold">{t('konto.rollen')}</dt>
            <dd>
              {a.rollen.map((r) => (r.organisation ? `${tr(r.rolle)} (${t(`organisationen.${r.organisation}`)})` : tr(r.rolle))).join(', ')}
            </dd>
            <dt className="font-bold">{t('konto.zweiFaktor')}</dt>
            <dd>{t('konto.zweiFaktorAktiv')}</dd>
          </dl>
          <p className="text-16 text-tinte-2">{t('konto.aenderungHinweis')}</p>
        </section>
        <section aria-labelledby="konto-passwort" className={karte}>
          <h2 id="konto-passwort" className="text-24">
            {t('konto.passwortTitel')}
          </h2>
          <p className="text-tinte-2">{t('konto.passwortText')}</p>
          <PasswortFormular />
        </section>
        <section aria-labelledby="konto-ersatz" className={karte}>
          <h2 id="konto-ersatz" className="text-24">
            {t('konto.ersatzTitel')}
          </h2>
          <p className="text-tinte-2">{t('konto.ersatzText')}</p>
          <ErsatzcodesFormular />
        </section>
      </div>
    </>
  );
}
