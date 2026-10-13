import { ArrowLeft, ArrowRight, Trash2 } from 'lucide-react';
import NextLink from 'next/link';
import { getTranslations } from 'next-intl/server';
import { schriftQuran } from '@/app/schriften-quran';
import { Button } from '@/components/ui/button';
import { BedeutungFormular, OrtFormular } from '@/components/verwaltung/koran/Formulare';
import { AktionsFormular } from '@/components/verwaltung/koran/FormularBausteine';
import { FreigabeLeiste, KARTE, KoranNavigation, VerlaufListe, ZurueckLink } from '@/components/verwaltung/koran/Teile';
import { QURAN_RECHTE, verlangeKoranZugang } from '@/components/verwaltung/koran/zugang';
import { ListenLeer } from '@/components/verwaltung/TabellenRahmen';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { ortKennung } from '@/lib/religioes/freigabe';
import { darf } from '@/lib/rechte/pruefe';
import { cn } from '@/lib/utils';
import { bedeutungEntfernen, bedeutungSpeichern, ortEntfernen, ortSpeichern } from '@/server/actions/koran';
import { ladeVerlauf, ladeWortform } from '@/server/queries/verwaltung/koran';

const SPRACHEN = ['de', 'tr'] as const;

/**
 * Eine Wortform in der Werkstatt (ADR 0030): Stellen und Vers-Zusammenhang aus der Datenbank, Bedeutung de/tr mit
 * Freigabe-Ablauf (Vier-Augen), abweichende Bedeutungen an einzelnen Stellen, Verlauf, vorheriges/nächstes Wort.
 */
export default async function WortformSeite({ params }: PageProps<'/[locale]/verwaltung/koran/woerter/[sure]/[form]'>) {
  const a = await verlangeKoranZugang(QURAN_RECHTE);
  const { sure: sureRoh, form: formRoh } = await params;
  const nr = /^\d{1,3}$/.test(sureRoh) ? Number(sureRoh) : 0;
  const formId = /^\d{1,8}$/.test(formRoh) ? Number(formRoh) : 0;
  const [t, d] = await Promise.all([getTranslations('verwaltung.koran'), ladeWortform(nr, formId)]);
  const zurueck = <ZurueckLink href={`/verwaltung/koran/woerter/${nr || ''}`} text={t('woerter.zurUebersicht')} />;
  if (!d)
    return (
      <div className="flex flex-col gap-6">
        {zurueck}
        <ListenLeer text={t('woerter.formUnbekannt')} />
      </div>
    );
  const darfBearbeiten = darf(a.rollen, 'quran.bearbeiten');
  const darfFreigeben = darf(a.rollen, 'religioes.freigeben');
  const verlaeufe = await Promise.all(
    SPRACHEN.map((s) => (d.bedeutungen[s] ? ladeVerlauf('quran_wortbedeutung', d.bedeutungen[s]!.id) : Promise.resolve([]))),
  );
  const erste = d.stellen[0];
  const stelleText = (vers: number, pos: number, sure = d.sure.nr) => t('woerter.ortStelleText', { sure, vers, pos });
  const nachbar = (form: number | null, richtung: 'vorher' | 'naechstes') =>
    form ? (
      <Button asChild variant="outline">
        <NextLink href={`/verwaltung/koran/woerter/${d.sure.nr}/${form}`}>
          {richtung === 'vorher' ? <ArrowLeft aria-hidden /> : null}
          {t(`woerter.${richtung}`)}
          {richtung === 'naechstes' ? <ArrowRight aria-hidden /> : null}
        </NextLink>
      </Button>
    ) : (
      <span />
    );
  const knoepfe = (
    <>
      {nachbar(d.vorher, 'vorher')}
      {nachbar(d.naechste, 'naechstes')}
    </>
  );

  return (
    <div className={cn('flex flex-col gap-8', schriftQuran.variable)}>
      <ZurueckLink
        href={`/verwaltung/koran/woerter/${d.sure.nr}`}
        text={t('woerter.sureTitel', { nr: d.sure.nr, name: d.sure.umschrift || d.sure.nr })}
      />
      <VerwaltungsKopf
        kennung={t('woerter.titel')}
        titel={t('woerter.formTitel', { stelle: stelleText(erste.vers, erste.pos) })}
        einleitung={t('woerter.vorkommenGesamt', { gesamt: d.vorkommen, hier: d.stellen.length })}
        aktion={
          <span lang="ar" dir="rtl" className="font-quran text-arabisch-1 text-gruen-950">
            {d.textAr}
          </span>
        }
      />
      <KoranNavigation aktiv="woerter" />
      <nav aria-label={t('woerter.wortNav')} className="flex flex-wrap items-center justify-between gap-3">
        {knoepfe}
      </nav>

      <div className="grid items-start gap-6 lg:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-6 lg:col-span-2">
          {SPRACHEN.map((s, i) => {
            const b = d.bedeutungen[s];
            const id = `bedeutung-${s}`;
            return (
              <section key={s} aria-labelledby={id} className={KARTE}>
                <h2 id={id} className="text-24 font-bold">
                  {t('woerter.bedeutungTitel', { sprache: t(`sprache.${s}`) })}
                </h2>
                {b ? (
                  <FreigabeLeiste
                    art="quran_wortbedeutung"
                    kennung={b.id}
                    status={b.status}
                    verfasstVonId={b.verfasstVonId}
                    verfasstVon={b.verfasstVon}
                    geprueftVon={b.geprueftVon}
                    geprueftAm={b.geprueftAm}
                    benutzerId={a.benutzerId}
                    darfBearbeiten={darfBearbeiten}
                    darfFreigeben={darfFreigeben}
                  />
                ) : null}
                {b?.status === 'geprueft' && darfBearbeiten ? <p className="text-16 text-tinte-2">{t('woerter.geprueftHinweis')}</p> : null}
                <BedeutungFormular
                  aktion={bedeutungSpeichern}
                  formId={d.formId}
                  sprache={s}
                  start={{ bedeutung: b?.bedeutung ?? '', wurzel: b?.wurzel ?? '', anmerkung: b?.anmerkung ?? '' }}
                  einreichen={!b || b.status === 'entwurf'}
                  nurLesen={!darfBearbeiten}
                />
                {b && darfBearbeiten ? (
                  <AktionsFormular
                    aktion={bedeutungEntfernen}
                    felder={{ kennung: b.id }}
                    aufklappen={t('aktion.loeschenOeffnen')}
                    frage={t('aktion.loeschenFrage')}
                    knopf={t('aktion.loeschen')}
                    symbol={<Trash2 aria-hidden />}
                    variante="destructive"
                  />
                ) : null}
                {b ? (
                  <details className="text-16">
                    <summary className="flex min-h-12 cursor-pointer items-center font-bold">{t('verlauf.titel')}</summary>
                    <VerlaufListe eintraege={verlaeufe[i]} />
                  </details>
                ) : null}
              </section>
            );
          })}

          <section aria-labelledby="ort-titel" className={KARTE}>
            <div className="flex flex-col gap-1">
              <h2 id="ort-titel" className="text-24 font-bold">
                {t('woerter.ortTitel')}
              </h2>
              <p className="text-16 text-tinte-2">{t('woerter.ortText')}</p>
            </div>
            {d.orte.length === 0 ? (
              <p className="text-16 text-tinte-2">{t('woerter.ortLeer')}</p>
            ) : (
              <ul className="flex flex-col divide-y divide-linie">
                {d.orte.map((o) => (
                  <li key={ortKennung(o)} className="flex flex-col gap-3 py-4">
                    <p className="flex flex-wrap items-baseline gap-x-3">
                      <span className="font-bold tabular-nums">{stelleText(o.vers, o.pos, o.sure)}</span>
                      <span className="text-16 text-tinte-2">{t(`sprache.${o.sprache}`)}</span>
                      <span lang={o.sprache}>{o.bedeutung}</span>
                    </p>
                    <FreigabeLeiste
                      art="quran_wortbedeutung_ort"
                      kennung={ortKennung(o)}
                      status={o.status}
                      verfasstVonId={o.verfasstVonId}
                      verfasstVon={o.verfasstVon}
                      geprueftVon={o.geprueftVon}
                      geprueftAm={null}
                      benutzerId={a.benutzerId}
                      darfBearbeiten={darfBearbeiten}
                      darfFreigeben={darfFreigeben}
                    />
                    {darfBearbeiten ? (
                      <AktionsFormular
                        aktion={ortEntfernen}
                        felder={{ sure: String(o.sure), vers: String(o.vers), pos: String(o.pos), sprache: o.sprache }}
                        aufklappen={t('aktion.loeschenOeffnen')}
                        frage={t('aktion.loeschenFrage')}
                        knopf={t('aktion.loeschen')}
                        symbol={<Trash2 aria-hidden />}
                        variante="destructive"
                      />
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
            {darfBearbeiten ? (
              <OrtFormular
                aktion={ortSpeichern}
                stellen={d.stellen.map((s) => ({ wert: `${d.sure.nr}|${s.vers}|${s.pos}`, label: stelleText(s.vers, s.pos) }))}
                sprachen={SPRACHEN.map((s) => ({ wert: s, label: t(`sprache.${s}`) }))}
              />
            ) : null}
          </section>
        </div>

        <aside className="flex min-w-0 flex-col gap-6">
          <section aria-labelledby="stellen-titel" className={KARTE}>
            <h2 id="stellen-titel" className="text-24 font-bold">
              {t('woerter.stellenTitel')}
            </h2>
            <ul className="flex flex-wrap gap-2">
              {d.stellen.map((s) => (
                <li key={`${s.vers}:${s.pos}`} className="rounded-pill bg-sand px-3 text-16 tabular-nums">
                  {`${d.sure.nr}:${s.vers} · ${s.pos}`}
                </li>
              ))}
            </ul>
            {d.andereSuren.length ? (
              <div className="flex flex-col gap-2">
                <h3 className="text-18 font-bold">{t('woerter.andereSuren')}</h3>
                <p className="text-16 text-tinte-2">
                  {d.andereSuren
                    .slice(0, 30)
                    .map((x) => t('woerter.andereSure', { sure: x.sure, anzahl: x.anzahl }))
                    .join(' · ')}
                  {d.andereSuren.length > 30 ? ' …' : ''}
                </p>
              </div>
            ) : null}
          </section>
          {d.zusammenhang.map((z) => {
            const id = `vers-${z.vers}-${z.pos}`;
            return (
              <section key={id} aria-labelledby={id} className={KARTE}>
                <h2 id={id} className="text-18 font-bold">
                  {t('woerter.imVers', { stelle: `${d.sure.nr}:${z.vers}` })}
                </h2>
                <p lang="ar" dir="rtl" className="font-quran text-arabisch-3">
                  {z.woerter.map((w, i) => (
                    <span key={w.pos}>
                      {i > 0 ? ' ' : null}
                      {w.pos === z.pos ? <mark className="rounded-sm bg-gruen-100 px-1 text-gruen-950">{w.text}</mark> : w.text}
                    </span>
                  ))}
                </p>
              </section>
            );
          })}
        </aside>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">{knoepfe}</div>
    </div>
  );
}
