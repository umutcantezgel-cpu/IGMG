import { ArrowLeft } from 'lucide-react';
import NextLink from 'next/link';
import { getTranslations } from 'next-intl/server';
import { GrundFormular } from '@/components/verwaltung/kinderschutz/GrundFormular';
import { KontextAnsicht } from '@/components/verwaltung/kinderschutz/KontextAnsicht';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { ListenLeer } from '@/components/verwaltung/TabellenRahmen';
import { datumKurz, uhrzeit } from '@/lib/i18n/format';
import { darf, verlangeSeitenRecht } from '@/lib/rechte/pruefe';
import { lokaleTeile } from '@/lib/termine';
import { kanalPauseSetzen, meldungStatusSetzen } from '@/server/actions/kinderschutz';
import { ladeMeldung } from '@/server/queries/verwaltung/kinderschutz';

const KARTE = 'flex flex-col gap-4 rounded-lg border border-linie bg-weiss p-6 shadow-s1';

/**
 * Eine Meldung (S-08, S-09, S-11): Angaben ohne Inhalt, Kontext nur auf Klick (protokolliert), Status mit Grund,
 * Kanal pausieren oder fortsetzen – auch bei Meldungen gegen eine Leitungsperson (D-02).
 */
export default async function MeldungSeite({ params }: PageProps<'/[locale]/verwaltung/kinderschutz/[id]'>) {
  const a = await verlangeSeitenRecht('meldung.chat.lesen');
  const { id } = await params;
  const t = await getTranslations('verwaltung.kinderschutz');
  const m = /^[0-9a-f-]{36}$/i.test(id) ? await ladeMeldung(id) : null;
  const zurueck = (
    <NextLink
      href="/verwaltung/kinderschutz"
      className="inline-flex min-h-12 items-center gap-2 self-start font-bold text-gruen-800 underline underline-offset-4"
    >
      <ArrowLeft aria-hidden className="size-5" />
      {t('detail.zurueck')}
    </NextLink>
  );
  if (!m)
    return (
      <div className="flex flex-col gap-6">
        {zurueck}
        <ListenLeer text={t('detail.nichtGefunden')} />
      </div>
    );
  const darfBearbeiten = darf(a.rollen, 'meldung.chat.bearbeiten');
  const datum = (d: Date) => `${datumKurz(d, 'de')} ${lokaleTeile(d).jahr}, ${uhrzeit(d, 'de')}`;
  const pausiert = m.kanalStatus === 'pausiert';
  return (
    <div className="flex flex-col gap-8">
      {zurueck}
      <VerwaltungsKopf kennung={t('kennung')} titel={t('detail.titel', { datum: datum(m.erstelltAm) })} />
      <div className="grid items-start gap-6 lg:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-6 lg:col-span-2">
          <section aria-labelledby="ks-kontext" className={KARTE}>
            <h2 id="ks-kontext" className="text-24 font-bold">
              {t('detail.kontextTitel')}
            </h2>
            <KontextAnsicht meldungId={m.id} darfBearbeiten={darfBearbeiten} />
          </section>
        </div>
        <div className="flex min-w-0 flex-col gap-6">
          <section aria-labelledby="ks-angaben" className={KARTE}>
            <h2 id="ks-angaben" className="text-24 font-bold">
              {t('detail.angaben')}
            </h2>
            <dl className="grid gap-3">
              <div>
                <dt className="text-16 text-tinte-2">{t('spalte.grund')}</dt>
                <dd className="font-bold">{t(`grundArt.${m.grund}`)}</dd>
              </div>
              <div>
                <dt className="text-16 text-tinte-2">{t('spalte.status')}</dt>
                <dd className="font-bold">{t(`status.${m.status}`)}</dd>
              </div>
              <div>
                <dt className="text-16 text-tinte-2">{t('detail.eingang')}</dt>
                <dd className="tabular-nums">{datum(m.erstelltAm)}</dd>
              </div>
              <div>
                <dt className="text-16 text-tinte-2">{t('detail.bearbeitet')}</dt>
                <dd>
                  {m.bearbeitetAm
                    ? t('detail.bearbeitetVon', { datum: datum(m.bearbeitetAm), name: m.bearbeitetVon ?? '–' })
                    : t('detail.nieBearbeitet')}
                </dd>
              </div>
              <div>
                <dt className="text-16 text-tinte-2">{t('detail.kanal')}</dt>
                <dd>
                  {m.kanalArt ? `${t(`kanalArt.${m.kanalArt}`)}${m.gruppe ? ` · ${m.gruppe}` : ''}` : t('kanalArt.ohne')}
                  {pausiert ? <span className="font-bold text-fehler"> · {t('detail.kanalPausiert')}</span> : null}
                </dd>
              </div>
            </dl>
          </section>
          {darfBearbeiten ? (
            <section aria-labelledby="ks-status" className={KARTE}>
              <h2 id="ks-status" className="text-24 font-bold">
                {t('detail.statusTitel')}
              </h2>
              <GrundFormular
                aktion={meldungStatusSetzen}
                felder={{ id: m.id }}
                knopf={t('aktion.statusKnopf')}
                auswahl={{
                  name: 'status',
                  label: t('aktion.status'),
                  optionen: (m.status === 'offen'
                    ? (['in_bearbeitung', 'erledigt'] as const)
                    : (['erledigt', 'in_bearbeitung'] as const)
                  ).map((s) => ({
                    wert: s,
                    label: t(`status.${s}`),
                  })),
                }}
              />
            </section>
          ) : null}
          {darfBearbeiten && m.kanalId ? (
            <section aria-labelledby="ks-kanal" className={KARTE}>
              <h2 id="ks-kanal" className="text-24 font-bold">
                {t('detail.kanalTitel')}
              </h2>
              <GrundFormular
                aktion={kanalPauseSetzen}
                felder={{ kanalId: m.kanalId, pause: pausiert ? '0' : '1' }}
                knopf={pausiert ? t('aktion.fortsetzen') : t('aktion.pausieren')}
                gefahr={!pausiert}
              />
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
