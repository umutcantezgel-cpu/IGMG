import { Trash2 } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { HadithFormular } from '@/components/verwaltung/koran/Formulare';
import { AktionsFormular } from '@/components/verwaltung/koran/FormularBausteine';
import { FreigabeLeiste, KARTE, KoranNavigation, VerlaufListe, ZurueckLink } from '@/components/verwaltung/koran/Teile';
import { HADITH_RECHTE, verlangeKoranZugang } from '@/components/verwaltung/koran/zugang';
import { ListenLeer } from '@/components/verwaltung/TabellenRahmen';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { BUKHARI } from '@/lib/hadith/anzeige';
import { hadithKennung } from '@/lib/religioes/freigabe';
import { darf } from '@/lib/rechte/pruefe';
import { hadithNummer, HADITH_SPRACHEN } from '@/lib/validierung/koran';
import { hadithUebersetzungEntfernen, hadithUebersetzungSpeichern } from '@/server/actions/koran';
import { ladeHadithDetail, ladeVerlauf } from '@/server/queries/verwaltung/koran';

/**
 * Ein importierter Hadith (ADR 0030, MN-06): arabischer Text aus dem Import, Übersetzungen de/tr/en mit Herkunft und
 * Freigabe-Ablauf (Vier-Augen), Verlauf je Sprache.
 */
export default async function HadithDetailSeite({ params }: PageProps<'/[locale]/verwaltung/koran/hadith/[nummer]'>) {
  const a = await verlangeKoranZugang(HADITH_RECHTE);
  const roh = decodeURIComponent((await params).nummer);
  const nummer = hadithNummer.safeParse(roh);
  const [t, h] = await Promise.all([
    getTranslations('verwaltung.koran'),
    nummer.success ? ladeHadithDetail(nummer.data) : Promise.resolve(null),
  ]);
  const zurueck = <ZurueckLink href="/verwaltung/koran/hadith" text={t('hadith.titel')} />;
  if (!h)
    return (
      <div className="flex flex-col gap-6">
        {zurueck}
        <ListenLeer text={t('hadith.nichtGefunden')} />
      </div>
    );
  const darfBearbeiten = darf(a.rollen, 'hadith.bearbeiten');
  const darfFreigeben = darf(a.rollen, 'religioes.freigeben');
  const verlaeufe = await Promise.all(
    HADITH_SPRACHEN.map((s) =>
      h.uebersetzungen.some((u) => u.sprache === s)
        ? ladeVerlauf('hadith_uebersetzung', hadithKennung({ sammlungId: BUKHARI, nummer: h.nummer, sprache: s }))
        : [],
    ),
  );
  const ort = h.imBuchNr ? t('hadith.imBuch', { buch: h.buchNr, nr: h.imBuchNr }) : t('hadith.buch', { buch: h.buchNr });
  const listen = h.listen.map((l) => t(`listen.name.${l}`)).join(', ');

  return (
    <div className="flex flex-col gap-8">
      {zurueck}
      <VerwaltungsKopf kennung={t('hadith.titel')} titel={t('hadith.detailTitel', { nummer: h.nummer })} einleitung={ort} />
      <KoranNavigation aktiv="hadith" />
      <section aria-labelledby="hadith-arabisch" className={KARTE}>
        <h2 id="hadith-arabisch" className="text-24 font-bold">
          {t('hadith.arabisch')}
        </h2>
        <p lang="ar" dir="rtl" className="font-arabic text-arabisch-3 text-pretty">
          {h.textAr}
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-16 text-tinte-2">
          {h.bewertung ? <span>{t('hadith.bewertung', { bewertung: h.bewertung })}</span> : null}
          {h.buchTitelEn ? <span lang="en">{h.buchTitelEn}</span> : null}
          {listen ? <span>{t('hadith.inListen', { listen })}</span> : null}
        </div>
      </section>

      {HADITH_SPRACHEN.map((s, i) => {
        const u = h.uebersetzungen.find((x) => x.sprache === s);
        const kennung = hadithKennung({ sammlungId: BUKHARI, nummer: h.nummer, sprache: s });
        const id = `uebersetzung-${s}`;
        return (
          <section key={s} id={id} aria-labelledby={`${id}-titel`} className={`${KARTE} scroll-mt-6`}>
            <h2 id={`${id}-titel`} className="text-24 font-bold">
              {t('hadith.uebersetzungTitel', { sprache: t(`sprache.${s}`) })}
            </h2>
            {u ? (
              <FreigabeLeiste
                art="hadith_uebersetzung"
                kennung={kennung}
                status={u.status}
                verfasstVonId={u.verfasstVonId}
                verfasstVon={u.verfasstVon}
                geprueftVon={u.geprueftVon}
                geprueftAm={u.geprueftAm}
                benutzerId={a.benutzerId}
                darfBearbeiten={darfBearbeiten}
                darfFreigeben={darfFreigeben}
              />
            ) : null}
            {u?.status === 'geprueft' && darfBearbeiten ? <p className="text-16 text-tinte-2">{t('hadith.geprueftHinweis')}</p> : null}
            {darfBearbeiten ? (
              <HadithFormular
                aktion={hadithUebersetzungSpeichern}
                nummer={h.nummer}
                sprache={s}
                start={{ text: u?.text ?? '', uebersetzer: u?.uebersetzer ?? '', quelle: u?.quelle ?? '', lizenz: u?.lizenz ?? '' }}
                einreichen={!u || u.status === 'entwurf'}
              />
            ) : u ? (
              <p lang={s} className="text-18 whitespace-pre-line">
                {u.text}
              </p>
            ) : (
              <p className="text-16 text-tinte-2">{t('nurLesen')}</p>
            )}
            {u && darfBearbeiten ? (
              <AktionsFormular
                aktion={hadithUebersetzungEntfernen}
                felder={{ kennung }}
                aufklappen={t('aktion.loeschenOeffnen')}
                frage={t('aktion.loeschenFrage')}
                knopf={t('aktion.loeschen')}
                symbol={<Trash2 aria-hidden />}
                variante="destructive"
              />
            ) : null}
            {u ? (
              <details className="text-16">
                <summary className="flex min-h-12 cursor-pointer items-center font-bold">{t('verlauf.titel')}</summary>
                <VerlaufListe eintraege={verlaeufe[i]} />
              </details>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
