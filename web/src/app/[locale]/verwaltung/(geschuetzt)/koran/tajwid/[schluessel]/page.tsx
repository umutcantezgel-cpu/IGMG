import { getTranslations } from 'next-intl/server';
import { TajwidFormular } from '@/components/verwaltung/koran/Formulare';
import { FreigabeLeiste, KARTE, KoranNavigation, VerlaufListe, ZurueckLink } from '@/components/verwaltung/koran/Teile';
import { QURAN_RECHTE, verlangeKoranZugang } from '@/components/verwaltung/koran/zugang';
import { ListenLeer } from '@/components/verwaltung/TabellenRahmen';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { REGEL_FACHBEGRIFF } from '@/lib/quran/tajwid';
import { darf } from '@/lib/rechte/pruefe';
import { tajwidSpeichern } from '@/server/actions/koran';
import { ladeTajwidRegelVerwaltung, ladeVerlauf } from '@/server/queries/verwaltung/koran';

/**
 * Texte einer Tajwid-Regel (ADR 0030, MN-04): Name, Kurztext und Erklärung de/tr mit Freigabe-Ablauf. Bis zur Prüfung
 * zeigt die Website den Fachbegriff aus dem Import und keinen Text.
 */
export default async function TajwidRegelSeite({ params }: PageProps<'/[locale]/verwaltung/koran/tajwid/[schluessel]'>) {
  const a = await verlangeKoranZugang(QURAN_RECHTE);
  const { schluessel } = await params;
  const gueltig = /^[a-z0-9_]{2,40}$/.test(schluessel);
  const [t, r, verlauf] = await Promise.all([
    getTranslations('verwaltung.koran'),
    gueltig ? ladeTajwidRegelVerwaltung(schluessel) : Promise.resolve(null),
    gueltig ? ladeVerlauf('tajwid_regel', schluessel) : Promise.resolve([]),
  ]);
  const zurueck = <ZurueckLink href="/verwaltung/koran/tajwid" text={t('tajwid.titel')} />;
  if (!r)
    return (
      <div className="flex flex-col gap-6">
        {zurueck}
        <ListenLeer text={t('tajwid.unbekannt')} />
      </div>
    );
  const darfBearbeiten = darf(a.rollen, 'quran.bearbeiten');
  const fachbegriff = REGEL_FACHBEGRIFF[r.schluessel];
  return (
    <div className="flex flex-col gap-8">
      {zurueck}
      <VerwaltungsKopf kennung={t('tajwid.titel')} titel={r.name.de} einleitung={t('tajwid.schluessel', { schluessel: r.schluessel })} />
      <KoranNavigation aktiv="tajwid" />
      <div className="grid items-start gap-6 lg:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-6 lg:col-span-2">
          {darfBearbeiten ? (
            <TajwidFormular
              aktion={tajwidSpeichern}
              schluessel={r.schluessel}
              start={{ nameDe: r.name.de, nameTr: r.name.tr ?? '', kurzDe: r.kurz?.de ?? '', kurzTr: r.kurz?.tr ?? '' }}
              erklaerung={{ de: r.erklaerung?.de ?? null, tr: r.erklaerung?.tr ?? null }}
              einreichen={r.status === 'entwurf'}
            />
          ) : (
            <p className="text-16 text-tinte-2">{t('nurLesen')}</p>
          )}
        </div>
        <aside className="flex min-w-0 flex-col gap-6">
          <section aria-labelledby="tajwid-stand" className={KARTE}>
            <h2 id="tajwid-stand" className="text-24 font-bold">
              {t('art.tajwid_regel')}
            </h2>
            <FreigabeLeiste
              art="tajwid_regel"
              kennung={r.schluessel}
              status={r.status}
              verfasstVonId={r.verfasstVonId}
              verfasstVon={r.verfasstVon}
              geprueftVon={r.geprueftVon}
              geprueftAm={r.geprueftAm}
              benutzerId={a.benutzerId}
              darfBearbeiten={darfBearbeiten}
              darfFreigeben={darf(a.rollen, 'religioes.freigeben')}
            />
            {r.status === 'geprueft' ? <p className="text-16 text-tinte-2">{t('tajwid.geprueftHinweis')}</p> : null}
            {fachbegriff ? <p className="text-16 text-tinte-2">{t('tajwid.fachbegriff', { name: fachbegriff })}</p> : null}
          </section>
          <section aria-labelledby="tajwid-verlauf" className={KARTE}>
            <h2 id="tajwid-verlauf" className="text-24 font-bold">
              {t('verlauf.titel')}
            </h2>
            <VerlaufListe eintraege={verlauf} />
          </section>
        </aside>
      </div>
    </div>
  );
}
