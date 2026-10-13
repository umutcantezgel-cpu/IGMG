import { Eye } from 'lucide-react';
import NextLink from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import {
  ansichtAktiv,
  ansichtInaktiv,
  ansichtLink,
  feldKlein,
  pilleGut,
  pilleNeutral,
  pilleWarnung,
} from '@/components/verwaltung/lernen/stil';
import { ListenKarte, ListenLeer, TabellenRahmen } from '@/components/verwaltung/TabellenRahmen';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { alterAus } from '@/lib/chat/regeln';
import { funktionAn } from '@/lib/funktionen';
import { berlinerDatum } from '@/lib/gebetszeiten/naechstes';
import { verlangeSeitenRecht } from '@/lib/rechte/pruefe';
import { cn } from '@/lib/utils';
import { ladeGruppenAuswahl } from '@/server/queries/verwaltung/gruppen';
import { ladeLernendeListe, lernendeFilterSchema, type LernendeZeile } from '@/server/queries/verwaltung/lernende';

const STATUS = ['aktiv', 'pausiert', 'beendet', 'alle'] as const;

/**
 * Verwaltung › Lernende (H-L02): datensparsame Liste – Vorname mit Initial, Gruppe, Alter. Personendaten nur in der
 * Detailansicht (entschlüsselt, protokolliert). Lernende entstehen über „Aufnehmen“ bei einer Voranmeldung.
 */
export default async function LernendeVerwalten({ searchParams }: PageProps<'/[locale]/verwaltung/lernende'>) {
  await verlangeSeitenRecht('lernende.lesen');
  if (!(await funktionAn('lernplattform'))) notFound();
  const sp = await searchParams;
  const filter = lernendeFilterSchema.parse({ status: sp.status, gruppe: sp.gruppe });
  const [t, tg, liste, gruppen] = await Promise.all([
    getTranslations('verwaltung.lernende'),
    getTranslations('verwaltung.shell'),
    ladeLernendeListe(filter),
    ladeGruppenAuswahl(),
  ]);
  const heute = berlinerDatum(new Date());
  const alter = (z: LernendeZeile) => (z.sechzehnAm ? t('alter', { alter: alterAus(z.sechzehnAm, heute) }) : t('alterUnbekannt'));
  const gruppenText = (z: LernendeZeile) => (z.gruppen.length ? z.gruppen.map((g) => g.name).join(', ') : t('keineGruppe'));
  const statusPille = (z: LernendeZeile) => (
    <span className={z.status === 'aktiv' ? pilleGut : z.status === 'pausiert' ? pilleWarnung : pilleNeutral}>
      {t(`status.${z.status}`)}
    </span>
  );
  const konto = (z: LernendeZeile) => (
    <span className="flex flex-col gap-0.5 text-16">
      <span>{t('elternKonten', { anzahl: z.eltern })}</span>
      <span className="text-tinte-2">{z.konto ? t('kinderzugangJa') : t('kinderzugangNein')}</span>
    </span>
  );
  const oeffnen = (z: LernendeZeile) => (
    <Button asChild variant="outline" size="icon">
      <NextLink href={`/verwaltung/lernende/${z.id}`}>
        <Eye aria-hidden />
        <span className="sr-only">{t('aktionAnsehen', { name: z.anzeigename })}</span>
      </NextLink>
    </Button>
  );
  const href = (status: string) => {
    const q = new URLSearchParams();
    if (status !== 'aktiv') q.set('status', status);
    if (filter.gruppe) q.set('gruppe', filter.gruppe);
    return `/verwaltung/lernende${q.size ? `?${q}` : ''}`;
  };

  return (
    <>
      <VerwaltungsKopf titel={t('titel')} kennung={tg('gruppe.inhalte')} einleitung={t('einleitung')} />
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <nav aria-label={t('ansichten')}>
          <ul className="flex flex-wrap gap-2">
            {STATUS.map((s) => (
              <li key={s}>
                <NextLink
                  href={href(s)}
                  aria-current={filter.status === s ? 'page' : undefined}
                  className={cn(ansichtLink, filter.status === s ? ansichtAktiv : ansichtInaktiv)}
                >
                  {t(`statusFilter.${s}`)}
                </NextLink>
              </li>
            ))}
          </ul>
        </nav>
        <form method="get" action="/verwaltung/lernende" className="flex flex-wrap items-end gap-2">
          {filter.status !== 'aktiv' ? <input type="hidden" name="status" value={filter.status} /> : null}
          <label className="flex min-w-0 flex-col gap-1 font-bold">
            {t('gruppeFilter')}
            <select name="gruppe" defaultValue={filter.gruppe ?? ''} className={feldKlein}>
              <option value="">{t('alleGruppen')}</option>
              {gruppen.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </label>
          <Button type="submit" variant="outline">
            {t('filtern')}
          </Button>
        </form>
      </div>
      <p className="text-16 text-tinte-2" role="status">
        {t('anzahl', { anzahl: liste.length })}
      </p>
      {liste.length === 0 ? (
        <ListenLeer
          text={t('leer')}
          aktion={
            <Button asChild variant="outline">
              <NextLink href="/verwaltung/eingaenge?art=voranmeldung">{t('zuVoranmeldungen')}</NextLink>
            </Button>
          }
        />
      ) : (
        <TabellenRahmen
          beschriftung={t('titel')}
          mobil={
            <ul className="flex flex-col gap-3">
              {liste.map((z) => (
                <ListenKarte
                  key={z.id}
                  titel={z.anzeigename}
                  angaben={[
                    { label: t('spalte.alter'), wert: alter(z) },
                    { label: t('spalte.gruppen'), wert: gruppenText(z) },
                    { label: t('spalte.konten'), wert: konto(z) },
                    { label: t('spalte.status'), wert: statusPille(z) },
                  ]}
                  aktionen={oeffnen(z)}
                />
              ))}
            </ul>
          }
        >
          <table className="w-full min-w-224 border-collapse text-left">
            <thead className="bg-sand">
              <tr>
                {(['name', 'alter', 'gruppen', 'konten', 'status', 'aktion'] as const).map((s) => (
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
                    {z.anzeigename}
                  </th>
                  <td className="px-4 py-3 whitespace-nowrap">{alter(z)}</td>
                  <td className="px-4 py-3">{gruppenText(z)}</td>
                  <td className="px-4 py-3">{konto(z)}</td>
                  <td className="px-4 py-3">{statusPille(z)}</td>
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
