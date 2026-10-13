import { desc } from 'drizzle-orm';
import { ArrowRight, Pencil } from 'lucide-react';
import NextLink from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Meldung } from '@/components/verwaltung/Meldung';
import { ListenKarte, ListenLeer, TabellenRahmen } from '@/components/verwaltung/TabellenRahmen';
import { LoeschenBestaetigen } from '@/components/verwaltung/veranstaltungen/LoeschenBestaetigen';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { WeiterleitungsFormular } from '@/components/verwaltung/weiterleitungen/WeiterleitungsFormular';
import { db, schema } from '@/lib/db';
import { datumLang } from '@/lib/i18n/format';
import { verlangeSeitenRecht } from '@/lib/rechte/pruefe';
import { loescheWeiterleitung, speichereWeiterleitung } from '@/server/actions/weiterleitungen';

/**
 * Verwaltung › Weiterleitungen (ADR 0032): alte Adresse → neue Adresse. Oben das Formular (neu oder – mit `?id=` –
 * ändern), darunter die Liste mit Löschen nach Rückfrage. Recht `weiterleitung.bearbeiten`.
 */
export default async function Weiterleitungen({ searchParams }: PageProps<'/[locale]/verwaltung/weiterleitungen'>) {
  await verlangeSeitenRecht('weiterleitung.bearbeiten');
  const sp = await searchParams;
  const [t, tg, liste] = await Promise.all([
    getTranslations('verwaltung.weiterleitungen'),
    getTranslations('verwaltung.shell'),
    db.select().from(schema.weiterleitung).orderBy(desc(schema.weiterleitung.erstelltAm)),
  ]);
  const bearbeiten = typeof sp.id === 'string' ? liste.find((w) => w.id === sp.id) : undefined;
  const aktionen = (w: (typeof liste)[number]) => (
    <>
      <Button asChild variant="outline" size="icon">
        <NextLink href={`/verwaltung/weiterleitungen?id=${w.id}`}>
          <Pencil aria-hidden />
          <span className="sr-only">{t('aktionBearbeiten', { von: w.von })}</span>
        </NextLink>
      </Button>
      <LoeschenBestaetigen
        id={w.id}
        aktion={loescheWeiterleitung}
        texte={{
          ausloeser: t('aktionLoeschen', { von: w.von }),
          titel: t('loeschenTitel'),
          text: t('loeschenText', { von: w.von }),
          bestaetigen: t('loeschen'),
          abbrechen: t('abbrechen'),
        }}
      />
    </>
  );
  return (
    <>
      <VerwaltungsKopf titel={t('titel')} kennung={tg('gruppe.inhalte')} einleitung={t('einleitung')} />
      {sp.gespeichert ? <Meldung art="erfolg">{t('gespeichert')}</Meldung> : null}
      <WeiterleitungsFormular
        key={bearbeiten?.id ?? 'neu'}
        aktion={speichereWeiterleitung}
        modus={bearbeiten ? 'bearbeiten' : 'neu'}
        startwerte={{ id: bearbeiten?.id ?? '', von: bearbeiten?.von ?? '', nach: bearbeiten?.nach ?? '', code: String(bearbeiten?.code ?? 308) }}
      />
      <h2 className="font-display text-24 font-semibold">{t('liste')}</h2>
      {liste.length === 0 ? (
        <ListenLeer text={t('leer')} />
      ) : (
        <TabellenRahmen
          beschriftung={t('liste')}
          mobil={
            <ul className="flex flex-col gap-3">
              {liste.map((w) => (
                <ListenKarte
                  key={w.id}
                  titel={<span className="break-all">{w.von}</span>}
                  angaben={[
                    { label: t('spalte.nach'), wert: <span className="break-all">{w.nach}</span> },
                    { label: t('spalte.code'), wert: String(w.code), zahl: true },
                    { label: t('spalte.angelegt'), wert: datumLang(w.erstelltAm, 'de'), zahl: true },
                  ]}
                  aktionen={aktionen(w)}
                />
              ))}
            </ul>
          }
        >
          <table className="w-full min-w-192 border-collapse text-left">
            <thead className="bg-sand">
              <tr>
                {(['von', 'nach', 'code', 'angelegt', 'aktionen'] as const).map((s) => (
                  <th key={s} scope="col" className="px-4 py-3 text-16 font-bold">
                    {t(`spalte.${s}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {liste.map((w) => (
                <tr key={w.id} className="border-t border-linie align-middle">
                  <th scope="row" className="px-4 py-3 font-bold break-all">
                    {w.von}
                  </th>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-2 break-all">
                      <ArrowRight aria-hidden className="size-4 shrink-0 text-gruen-700" />
                      {w.nach}
                    </span>
                  </td>
                  <td className="px-4 py-3 tabular-nums">{w.code}</td>
                  <td className="px-4 py-3 tabular-nums">{datumLang(w.erstelltAm, 'de')}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">{aktionen(w)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TabellenRahmen>
      )}
    </>
  );
}
