import { Pencil, UserPlus } from 'lucide-react';
import NextLink from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Meldung } from '@/components/verwaltung/Meldung';
import { TabellenRahmen } from '@/components/verwaltung/TabellenRahmen';
import { datumLang, uhrzeit } from '@/lib/i18n/format';
import { darf, verlangeSeitenRecht } from '@/lib/rechte/pruefe';
import type { RollenZuweisung } from '@/lib/rechte/matrix';
import { einladungWiderrufen } from '@/server/actions/benutzer';
import { ladeBenutzerListe, ladeOffeneEinladungen } from '@/server/queries/verwaltung/benutzer';

const pille = 'inline-flex items-center rounded-pill px-3 py-0.5 text-16 font-bold whitespace-nowrap';
const zeitpunkt = (d: Date) => `${datumLang(d, 'de')}, ${uhrzeit(d, 'de')}`;

/** Verwaltung › Benutzer und Rollen (C12, Blatt V12): Konten, Zwei-Faktor-Status, offene Einladungen. */
export default async function BenutzerVerwalten({ searchParams }: PageProps<'/[locale]/verwaltung/benutzer'>) {
  const a = await verlangeSeitenRecht('benutzer.lesen');
  const [t, tr, sp, konten, einladungen] = await Promise.all([
    getTranslations('verwaltung.benutzer'),
    getTranslations('verwaltung.rollen'),
    searchParams,
    ladeBenutzerListe(a),
    ladeOffeneEinladungen(),
  ]);
  const rollenText = (rollen: RollenZuweisung[]) =>
    rollen.map((r) => (r.organisation ? `${tr(r.rolle)} (${t(`organisationen.${r.organisation}`)})` : tr(r.rolle))).join(', ');
  const meldung = typeof sp.meldung === 'string' && ['widerrufen', 'geloescht'].includes(sp.meldung) ? sp.meldung : null;
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-display-2">{t('titel')}</h1>
          <p className="max-w-[70ch] text-tinte-2">{t('untertitel')}</p>
        </div>
        {darf(a.rollen, 'benutzer.einladen') ? (
          <Button asChild>
            <NextLink href="/verwaltung/benutzer/einladen">
              <UserPlus aria-hidden />
              {t('einladen')}
            </NextLink>
          </Button>
        ) : null}
      </div>
      {meldung ? <Meldung art="erfolg">{t(`meldung.${meldung}` as never)}</Meldung> : null}
      <section aria-labelledby="benutzer-konten" className="flex flex-col gap-3">
        <h2 id="benutzer-konten" className="text-24">
          {t('listeTitel')}
        </h2>
        <p className="text-16 text-tinte-2" role="status">
          {t('anzahl', { anzahl: konten.length })}
        </p>
        {konten.length === 0 ? (
          <p className="rounded-lg border border-linie bg-weiss p-6 text-tinte-2">{t('leer')}</p>
        ) : (
          <TabellenRahmen beschriftung={t('listeTitel')}>
            <table className="w-full min-w-[64rem] border-collapse text-left">
              <thead className="bg-sand">
                <tr>
                  {(['name', 'email', 'rollen', 'zweiFaktor', 'status', 'letzteAnmeldung', 'aktion'] as const).map((s) => (
                    <th key={s} scope="col" className="px-4 py-3 text-16 font-bold">
                      {t(`spalte.${s}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {konten.map((k) => (
                  <tr key={k.id} className="border-t border-linie align-middle">
                    <th scope="row" className="px-4 py-3 font-bold">
                      {k.name}
                      {k.id === a.benutzerId ? <span className="block text-16 font-normal text-tinte-2">{t('du')}</span> : null}
                    </th>
                    <td className="px-4 py-3 break-words">{k.email}</td>
                    <td className="px-4 py-3">{rollenText(k.rollen) || '–'}</td>
                    <td className="px-4 py-3">
                      <span className={k.zweiFaktor ? `${pille} bg-gruen-50 text-gruen-800` : `${pille} bg-warnung-toenung text-warnung`}>
                        {t(k.zweiFaktor ? 'zweiFaktorStatus.eingerichtet' : 'zweiFaktorStatus.ausstehend')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={k.gesperrtAm ? `${pille} bg-fehler-toenung text-fehler` : `${pille} bg-gruen-50 text-gruen-800`}>
                        {t(k.gesperrtAm ? 'status.gesperrt' : 'status.aktiv')}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{k.letzteAnmeldung ? zeitpunkt(k.letzteAnmeldung) : t('nie')}</td>
                    <td className="px-4 py-3">
                      <Button asChild variant="outline" size="icon">
                        <NextLink href={`/verwaltung/benutzer/${k.id}`}>
                          <Pencil aria-hidden />
                          <span className="sr-only">{t('bearbeiten', { name: k.name })}</span>
                        </NextLink>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TabellenRahmen>
        )}
      </section>
      <section aria-labelledby="benutzer-einladungen" className="flex flex-col gap-3">
        <h2 id="benutzer-einladungen" className="text-24">
          {t('einladungen.titel')}
        </h2>
        {einladungen.length === 0 ? (
          <p className="text-tinte-2">{t('einladungen.leer')}</p>
        ) : (
          <TabellenRahmen beschriftung={t('einladungen.titel')}>
            <table className="w-full min-w-[48rem] border-collapse text-left">
              <thead className="bg-sand">
                <tr>
                  {(['name', 'email', 'rollen', 'gueltigBis', 'aktion'] as const).map((s) => (
                    <th key={s} scope="col" className="px-4 py-3 text-16 font-bold">
                      {t(`spalte.${s}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {einladungen.map((e) => (
                  <tr key={e.id} className="border-t border-linie align-middle">
                    <th scope="row" className="px-4 py-3 font-bold">
                      {e.name}
                    </th>
                    <td className="px-4 py-3 break-words">{e.email}</td>
                    <td className="px-4 py-3">{rollenText(e.rollen)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {zeitpunkt(e.laeuftAb)}
                      {e.abgelaufen ? <span className="block text-16 font-bold text-fehler">{t('einladungen.abgelaufen')}</span> : null}
                    </td>
                    <td className="px-4 py-3">
                      {darf(a.rollen, 'benutzer.einladen') ? (
                        <form action={einladungWiderrufen}>
                          <input type="hidden" name="id" value={e.id} />
                          <Button type="submit" variant="outline" aria-label={t('einladungen.widerrufenLabel', { name: e.name })}>
                            {t('einladungen.widerrufen')}
                          </Button>
                        </form>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TabellenRahmen>
        )}
      </section>
    </>
  );
}
