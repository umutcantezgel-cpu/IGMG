import { Eye, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react';
import NextLink from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Meldung } from '@/components/verwaltung/Meldung';
import { LoeschenBestaetigen } from '@/components/verwaltung/veranstaltungen/LoeschenBestaetigen';
import { datumLang, uhrzeit } from '@/lib/i18n/format';
import { darf, organisationsFilter, verlangeSeitenRecht } from '@/lib/rechte/pruefe';
import { cn } from '@/lib/utils';
import { endgueltigLoeschen, inPapierkorb, wiederherstellen } from '@/server/actions/ankuendigungen';
import { ladeVerwaltungsListe, type Zustand } from '@/server/queries/verwaltung/ankuendigungen';

const pille = 'inline-flex items-center rounded-pill px-3 py-0.5 text-16 font-bold whitespace-nowrap';
const PRIORITAET_FARBE = {
  hoch: 'bg-fehler-toenung text-fehler',
  mittel: 'bg-warnung-toenung text-warnung',
  niedrig: 'bg-sand text-tinte-2',
} as const;
const ZUSTAND_FARBE: Record<Zustand, string> = {
  aktiv: 'bg-gruen-50 text-gruen-800',
  geplant: 'bg-info-toenung text-info',
  entwurf: 'bg-sand text-tinte-2',
  abgelaufen: 'bg-sand text-tinte-2',
};

/** Verwaltung › Ankündigungen (V04): Liste mit Zustand und Priorität, Papierkorb, endgültiges Löschen mit Rückfrage. */
export default async function AnkuendigungenVerwalten({ searchParams }: PageProps<'/[locale]/verwaltung/ankuendigungen'>) {
  const a = await verlangeSeitenRecht('ankuendigung.lesen');
  const papierkorb = (await searchParams).ansicht === 'papierkorb';
  // Organisationsredaktion sieht nur die eigene Organisation (K-06)
  const filter = organisationsFilter(a.rollen, 'ankuendigung.bearbeiten');
  const [t, liste] = await Promise.all([getTranslations('verwaltung.ankuendigungen'), ladeVerwaltungsListe(papierkorb, filter)]);
  const darfAnlegen = filter === null || filter.length > 0;
  const ansichten = [
    { schluessel: 'aktiv', label: t('ansichtAktiv'), href: '/verwaltung/ankuendigungen', aktiv: !papierkorb },
    { schluessel: 'papierkorb', label: t('ansichtPapierkorb'), href: '/verwaltung/ankuendigungen?ansicht=papierkorb', aktiv: papierkorb },
  ];
  const zeit = (d: Date) => `${datumLang(d, 'de')}, ${uhrzeit(d, 'de')}`;
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-30 md:text-36">{t('titel')}</h1>
        {darfAnlegen ? (
          <Button asChild>
            <NextLink href="/verwaltung/ankuendigungen/neu">
              <Plus aria-hidden />
              {t('neu')}
            </NextLink>
          </Button>
        ) : null}
      </div>
      <nav aria-label={t('ansichten')}>
        <ul className="flex gap-2">
          {ansichten.map((v) => (
            <li key={v.schluessel}>
              <NextLink
                href={v.href}
                aria-current={v.aktiv ? 'page' : undefined}
                className={cn(
                  'inline-flex min-h-11 items-center rounded-pill border px-4 font-bold no-underline',
                  v.aktiv
                    ? 'border-gruen-700 bg-gruen-700 text-weiss hover:text-weiss'
                    : 'border-rand bg-weiss text-tinte hover:bg-gruen-50 hover:text-tinte',
                )}
              >
                {v.label}
              </NextLink>
            </li>
          ))}
        </ul>
      </nav>
      {papierkorb ? <Meldung art="info">{t('papierkorbHinweis')}</Meldung> : null}
      {liste.length === 0 ? (
        <p className="rounded-lg border border-linie bg-weiss p-6 text-tinte-2">{papierkorb ? t('leerPapierkorb') : t('leer')}</p>
      ) : (
        <div className="relative overflow-x-auto rounded-lg border border-linie bg-weiss">
          <table className="w-full min-w-[56rem] border-collapse text-left">
            <thead className="bg-sand">
              <tr>
                {(['titel', 'sichtbarkeit', 'prioritaet', 'organisation', 'status', 'aktionen'] as const).map((s) => (
                  <th key={s} scope="col" className="px-4 py-3 text-16 font-bold">
                    {s === 'sichtbarkeit' && papierkorb ? t('spalte.imPapierkorbSeit') : t(`spalte.${s}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {liste.map((z) => {
                const darfBearbeiten = darf(a.rollen, 'ankuendigung.bearbeiten', { organisation: z.organisation });
                const darfLoeschen = darf(a.rollen, 'ankuendigung.loeschen', { organisation: z.organisation });
                return (
                  <tr key={z.id} className="border-t border-linie align-middle">
                    <th scope="row" className="px-4 py-3 font-bold">
                      {z.titel}
                      {z.istBeispiel ? (
                        <span className={cn(pille, 'ml-2 bg-warnung-toenung text-warnung')}>{t('status.beispiel')}</span>
                      ) : null}
                    </th>
                    <td className="px-4 py-3">
                      {papierkorb && z.imPapierkorbSeit ? (
                        zeit(z.imPapierkorbSeit)
                      ) : (
                        <>
                          <span className="block">{z.sichtbarAb ? t('sichtbarAb', { zeit: zeit(z.sichtbarAb) }) : t('sofort')}</span>
                          <span className="block text-16 text-tinte-2">
                            {z.laeuftAb ? t('laeuftAb', { zeit: zeit(z.laeuftAb) }) : t('laeuftNicht')}
                          </span>
                        </>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(pille, PRIORITAET_FARBE[z.prioritaet])}>{t(`prioritaet.${z.prioritaet}`)}</span>
                    </td>
                    <td className="px-4 py-3 font-bold">{z.organisation ? z.organisation.toUpperCase() : t('allgemein')}</td>
                    <td className="px-4 py-3">
                      {papierkorb ? (
                        <span className={cn(pille, 'bg-sand text-tinte-2')}>{t('status.papierkorb')}</span>
                      ) : (
                        <span className={cn(pille, ZUSTAND_FARBE[z.zustand])}>{t(`zustand.${z.zustand}`)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {papierkorb ? (
                          <>
                            {darfBearbeiten ? (
                              <form action={wiederherstellen}>
                                <input type="hidden" name="id" value={z.id} />
                                <Button type="submit" variant="outline" size="icon">
                                  <RotateCcw aria-hidden />
                                  <span className="sr-only">{t('aktionWiederherstellen', { titel: z.titel })}</span>
                                </Button>
                              </form>
                            ) : null}
                            {darfLoeschen ? (
                              <LoeschenBestaetigen
                                id={z.id}
                                aktion={endgueltigLoeschen}
                                texte={{
                                  ausloeser: t('aktionLoeschen', { titel: z.titel }),
                                  titel: t('loeschenTitel'),
                                  text: t('loeschenText', { titel: z.titel }),
                                  bestaetigen: t('endgueltigLoeschen'),
                                  abbrechen: t('abbrechen'),
                                }}
                              />
                            ) : null}
                          </>
                        ) : (
                          <>
                            <Button asChild variant="outline" size="icon">
                              <NextLink href={`/verwaltung/ankuendigungen/${z.id}`}>
                                {darfBearbeiten ? <Pencil aria-hidden /> : <Eye aria-hidden />}
                                <span className="sr-only">
                                  {darfBearbeiten ? t('aktionBearbeiten', { titel: z.titel }) : t('aktionAnsehen', { titel: z.titel })}
                                </span>
                              </NextLink>
                            </Button>
                            {darfLoeschen ? (
                              <form action={inPapierkorb}>
                                <input type="hidden" name="id" value={z.id} />
                                <Button
                                  type="submit"
                                  variant="outline"
                                  size="icon"
                                  className="border-fehler text-fehler hover:bg-fehler-toenung hover:text-fehler"
                                >
                                  <Trash2 aria-hidden />
                                  <span className="sr-only">{t('aktionPapierkorb', { titel: z.titel })}</span>
                                </Button>
                              </form>
                            ) : null}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
