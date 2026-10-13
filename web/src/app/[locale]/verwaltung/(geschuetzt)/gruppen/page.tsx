import { Eye, Pencil, Plus } from 'lucide-react';
import NextLink from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import {
  ansichtAktiv,
  ansichtInaktiv,
  ansichtLink,
  alsTag,
  pilleGut,
  pilleNeutral,
  pilleWarnung,
} from '@/components/verwaltung/lernen/stil';
import { ListenKarte, ListenLeer, TabellenRahmen } from '@/components/verwaltung/TabellenRahmen';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { funktionAn } from '@/lib/funktionen';
import { datumKurz } from '@/lib/i18n/format';
import { MIN_ERWACHSENE, WOCHENTAGE_REIHE } from '@/lib/lernen/verwaltung';
import { darf, verlangeSeitenRecht } from '@/lib/rechte/pruefe';
import { cn } from '@/lib/utils';
import { ladeGruppenListe, type GruppenZeile } from '@/server/queries/verwaltung/gruppen';

/** Verwaltung › Gruppen (H-L01): Lerngruppen mit Leitung (S-02), Mitgliedern und nächstem Termin. */
export default async function GruppenVerwalten({ searchParams }: PageProps<'/[locale]/verwaltung/gruppen'>) {
  const a = await verlangeSeitenRecht('gruppe.lesen');
  if (!(await funktionAn('lernplattform'))) notFound();
  const archiv = (await searchParams).ansicht === 'archiviert';
  const [t, tl, tg, liste] = await Promise.all([
    getTranslations('verwaltung.gruppen'),
    getTranslations('verwaltung.lernen'),
    getTranslations('verwaltung.shell'),
    ladeGruppenListe(archiv ? 'archiviert' : 'aktiv'),
  ]);
  const bearbeiten = darf(a.rollen, 'gruppe.bearbeiten');
  const anlegen = (
    <Button asChild>
      <NextLink href="/verwaltung/gruppen/neu">
        <Plus aria-hidden />
        {t('neu')}
      </NextLink>
    </Button>
  );
  const zeiten = (z: GruppenZeile) => {
    const tage = WOCHENTAGE_REIHE.filter((w) => z.wochentage.includes(w))
      .map((w) => tl(`wochentagKurz.${w}`))
      .join(', ');
    const uhr = z.uhrzeitVon ? (z.uhrzeitBis ? `${z.uhrzeitVon}–${z.uhrzeitBis}` : z.uhrzeitVon) : '';
    if (!tage && !uhr) return t('keineZeiten');
    return (
      <span className="flex flex-col">
        {tage ? <span>{tage}</span> : null}
        {uhr ? <span className="whitespace-nowrap tabular-nums">{t('uhr', { zeit: uhr })}</span> : null}
      </span>
    );
  };
  const kurs = (z: GruppenZeile) => [z.kurs, z.kursart ? tl(`kursart.${z.kursart}`) : null].filter(Boolean).join(' · ') || t('keinKurs');
  const leitung = (z: GruppenZeile) => (
    <span className="flex flex-wrap items-center gap-1.5">
      <span>{t('erwachsene', { anzahl: z.leitung })}</span>
      <span className={z.leitung >= MIN_ERWACHSENE ? pilleGut : pilleWarnung}>
        {z.leitung >= MIN_ERWACHSENE ? t('leitungReicht') : t('leitungFehlt', { anzahl: MIN_ERWACHSENE - z.leitung })}
      </span>
    </span>
  );
  const termin = (z: GruppenZeile) => (z.naechsterTermin ? datumKurz(alsTag(z.naechsterTermin), 'de') : t('keinTermin'));
  const oeffnen = (z: GruppenZeile) => (
    <Button asChild variant="outline" size="icon">
      <NextLink href={`/verwaltung/gruppen/${z.id}`}>
        {bearbeiten ? <Pencil aria-hidden /> : <Eye aria-hidden />}
        <span className="sr-only">{bearbeiten ? t('aktionBearbeiten', { name: z.name }) : t('aktionAnsehen', { name: z.name })}</span>
      </NextLink>
    </Button>
  );
  const ansichten = [
    { schluessel: 'aktiv', href: '/verwaltung/gruppen', aktiv: !archiv },
    { schluessel: 'archiviert', href: '/verwaltung/gruppen?ansicht=archiviert', aktiv: archiv },
  ] as const;

  return (
    <>
      <VerwaltungsKopf
        titel={t('titel')}
        kennung={tg('gruppe.inhalte')}
        einleitung={t('einleitung')}
        aktion={bearbeiten && liste.length ? anlegen : null}
      />
      <nav aria-label={t('ansichten')}>
        <ul className="flex flex-wrap gap-2">
          {ansichten.map((v) => (
            <li key={v.schluessel}>
              <NextLink
                href={v.href}
                aria-current={v.aktiv ? 'page' : undefined}
                className={cn(ansichtLink, v.aktiv ? ansichtAktiv : ansichtInaktiv)}
              >
                {t(`status.${v.schluessel}`)}
              </NextLink>
            </li>
          ))}
        </ul>
      </nav>
      {liste.length === 0 ? (
        <ListenLeer text={archiv ? t('leerArchiv') : t('leer')} aktion={bearbeiten && !archiv ? anlegen : undefined} />
      ) : (
        <TabellenRahmen
          beschriftung={t('titel')}
          mobil={
            <ul className="flex flex-col gap-3">
              {liste.map((z) => (
                <ListenKarte
                  key={z.id}
                  titel={z.name}
                  angaben={[
                    { label: t('spalte.kurs'), wert: kurs(z) },
                    { label: t('spalte.zeiten'), wert: zeiten(z) },
                    { label: t('spalte.leitung'), wert: leitung(z) },
                    { label: t('spalte.mitglieder'), wert: z.mitglieder, zahl: true },
                    { label: t('spalte.naechsterTermin'), wert: termin(z) },
                  ]}
                  aktionen={oeffnen(z)}
                />
              ))}
            </ul>
          }
        >
          <table className="w-full min-w-256 border-collapse text-left">
            <thead className="bg-sand">
              <tr>
                {(['name', 'kurs', 'zeiten', 'leitung', 'mitglieder', 'naechsterTermin', 'aktion'] as const).map((s) => (
                  <th key={s} scope="col" className="px-4 py-3 text-16 font-bold">
                    {t(`spalte.${s}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {liste.map((z) => (
                <tr key={z.id} className="border-t border-linie align-middle">
                  <th scope="row" className="px-4 py-3 font-bold">
                    <span className="flex flex-col gap-1">
                      <span>{z.name}</span>
                      {z.chatModus !== 'aus' ? (
                        <span className={cn(pilleNeutral, 'self-start')}>{t(`chatModus.${z.chatModus}`)}</span>
                      ) : null}
                    </span>
                  </th>
                  <td className="px-4 py-3">{kurs(z)}</td>
                  <td className="px-4 py-3">{zeiten(z)}</td>
                  <td className="px-4 py-3">{leitung(z)}</td>
                  <td className="px-4 py-3 tabular-nums">{z.mitglieder}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{termin(z)}</td>
                  <td className="px-4 py-3">{oeffnen(z)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TabellenRahmen>
      )}
    </>
  );
}
