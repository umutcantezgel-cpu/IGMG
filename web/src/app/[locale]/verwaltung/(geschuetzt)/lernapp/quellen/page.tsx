import { getTranslations } from 'next-intl/server';
import { Klappe } from '@/components/verwaltung/Klappe';
import { LernappNavigation } from '@/components/verwaltung/lernapp/Navigation';
import { TabellenRahmen } from '@/components/verwaltung/TabellenRahmen';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { STIMMEN } from '@/lib/lernapp/verwaltung/quellen';
import { verlangeLernappSeite } from '@/lib/lernapp/verwaltung/seite';
import { ladeSprecher } from '@/server/queries/lernapp/audio-studio';
import { ladeDatensaetze, ladeQuellenregister } from '@/server/queries/lernapp/quellen';

const kurzSha = (sha: string) => `${sha.slice(0, 12)}…${sha.slice(-4)}`;

/**
 * Verwaltung › Lern-App › Quellen (L3-06, PLAN §7.1, ADR 0025/0045): gepinnte Datensätze mit Lizenz, Namensnennung und
 * SHA-256 (aus `web/daten/*\/QUELLE.md`), das Quellenregister des Wissenskurses (nur Metadaten, „nur Verweis“) und die Stimmen
 * mit Herkunftskette (Beleg S3) samt den Sprecherinnen und Sprechern mit Vereinbarung. Recht `lernapp.bearbeiten`.
 */
export default async function Quellen() {
  const a = await verlangeLernappSeite('lernapp.bearbeiten');
  const [t, tl, tg, datensaetze, register, sprecher] = await Promise.all([
    getTranslations('verwaltung.lernapp.quellen'),
    getTranslations('verwaltung.lernapp'),
    getTranslations('verwaltung.shell'),
    ladeDatensaetze(),
    ladeQuellenregister(),
    ladeSprecher(),
  ]);

  return (
    <>
      <VerwaltungsKopf kennung={tg('gruppe.inhalte')} titel={t('titel')} einleitung={t('einleitung')} />
      <LernappNavigation aktiv="quellen" rollen={a.rollen} />

      <section aria-labelledby="quellen-daten" className="flex flex-col gap-3">
        <h2 id="quellen-daten" className="text-30">
          {t('datensaetze')}
        </h2>
        <ul className="flex flex-col gap-4">
          {datensaetze.map((d) => (
            <li key={d.ordner} className="flex flex-col gap-2 rounded-lg border border-linie bg-weiss p-4 md:p-6">
              <h3 className="font-text text-20 font-bold tracking-normal">{d.beschreibung?.titel || d.ordner}</h3>
              <p className="text-16 text-tinte-2">
                <span className="font-mono">web/daten/{d.ordner}</span> · {t(`zweck.${d.zweck}`)}
              </p>
              {!d.beschreibung ? (
                <p>{t('datensatzFehlt', { ordner: d.ordner })}</p>
              ) : (
                <>
                  <dl className="flex flex-col gap-1 text-16">
                    <dt className="font-bold">{t('lizenz')}</dt>
                    {d.beschreibung.lizenzen.map((l) => (
                      <dd key={l}>{l}</dd>
                    ))}
                    {d.beschreibung.namensnennungen.length ? <dt className="font-bold">{t('namensnennung')}</dt> : null}
                    {d.beschreibung.namensnennungen.map((n) => (
                      <dd key={n}>{n}</dd>
                    ))}
                  </dl>
                  <Klappe titel={t('dateien', { anzahl: d.beschreibung.dateien.length })} className="border-t border-linie">
                    <TabellenRahmen beschriftung={t('dateien', { anzahl: d.beschreibung.dateien.length })} className="mb-3">
                      <table className="w-full text-start text-16">
                        <thead className="bg-sand">
                          <tr>
                            <th scope="col" className="px-3 py-2 text-start">
                              {t('datei')}
                            </th>
                            <th scope="col" className="px-3 py-2 text-end">
                              {t('bytes')}
                            </th>
                            <th scope="col" className="px-3 py-2 text-start">
                              {t('sha')}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {d.beschreibung.dateien.map((f) => (
                            <tr key={`${f.abschnitt}|${f.datei}|${f.sha256}`} className="border-t border-linie">
                              <th scope="row" className="px-3 py-2 text-start font-normal">
                                <span className="font-mono">{f.datei}</span>
                                {f.abschnitt ? <span className="block text-tinte-2">{f.abschnitt}</span> : null}
                              </th>
                              <td className="px-3 py-2 text-end tabular-nums">{f.bytes?.toLocaleString('de-DE') ?? '–'}</td>
                              <td className="px-3 py-2">
                                <code title={f.sha256} className="font-mono">
                                  {kurzSha(f.sha256)}
                                </code>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </TabellenRahmen>
                  </Klappe>
                </>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="quellen-register" className="flex flex-col gap-3">
        <h2 id="quellen-register" className="text-30">
          {t('register')}
        </h2>
        <p className="text-tinte-2">{t('registerText')}</p>
        {register.length === 0 ? (
          <p>{t('registerLeer')}</p>
        ) : (
          <TabellenRahmen beschriftung={t('register')}>
            <table className="w-full text-start text-16">
              <thead className="bg-sand">
                <tr>
                  {(['werk', 'art', 'ausgabe', 'lizenz', 'verweis'] as const).map((s) => (
                    <th key={s} scope="col" className="px-3 py-2 text-start">
                      {t(`spalte.${s}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {register.map((q) => (
                  <tr key={q.kurz} className="border-t border-linie">
                    <th scope="row" className="px-3 py-2 text-start font-normal">
                      {q.werk}
                      {q.autor ? <span className="block text-tinte-2">{q.autor}</span> : null}
                    </th>
                    <td className="px-3 py-2">{q.art}</td>
                    <td className="px-3 py-2">{q.ausgabe ?? '–'}</td>
                    <td className="px-3 py-2">{q.lizenz ?? '–'}</td>
                    <td className="px-3 py-2">{q.nurVerweis ? t('ja') : t('nein')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TabellenRahmen>
        )}
      </section>

      <section aria-labelledby="quellen-stimmen" className="flex flex-col gap-3">
        <h2 id="quellen-stimmen" className="text-30">
          {t('stimmen')}
        </h2>
        <p className="text-tinte-2">{t('stimmenText')}</p>
        <ul className="flex flex-col gap-4">
          {STIMMEN.map((s) => (
            <li key={s.id} className="flex flex-col gap-2 rounded-lg border border-linie bg-weiss p-4 md:p-6">
              <h3 className="font-text text-20 font-bold tracking-normal">
                {s.name} <span className="text-16 font-normal text-tinte-2">({s.sprachen.map((x) => tl(`sprache.${x}`)).join(', ')})</span>
              </h3>
              <p className="font-bold">{t(`stand.${s.stand}`)}</p>
              <dl className="grid gap-x-3 gap-y-1 text-16 sm:grid-cols-4">
                <dt className="font-bold">{t('gewichte')}</dt>
                <dd className="sm:col-span-3">
                  {t(`stimme.${s.id}.gewichte`)} ({s.lizenzGewichte})
                </dd>
                <dt className="font-bold">{t('daten')}</dt>
                <dd className="sm:col-span-3">
                  {t(`stimme.${s.id}.daten`)} ({s.lizenzDaten})
                </dd>
                <dt className="font-bold">{t('code')}</dt>
                <dd className="sm:col-span-3">{t(`stimme.${s.id}.code`)}</dd>
                <dt className="font-bold">{t('befund')}</dt>
                <dd className="sm:col-span-3">{t(`stimme.${s.id}.befund`)}</dd>
                {s.namensnennung ? (
                  <>
                    <dt className="font-bold">{t('namensnennung')}</dt>
                    <dd className="sm:col-span-3">{t(`stimme.${s.id}.namensnennung` as never)}</dd>
                  </>
                ) : null}
                {s.manifest ? (
                  <>
                    <dt className="font-bold">{t('manifest')}</dt>
                    <dd className="font-mono sm:col-span-3">{s.manifest}</dd>
                  </>
                ) : null}
                <dt className="font-bold">{t('beleg')}</dt>
                <dd className="font-mono sm:col-span-3">{s.beleg}</dd>
              </dl>
            </li>
          ))}
        </ul>
        <h3 className="text-20 font-bold">{t('menschen')}</h3>
        <p className="text-tinte-2">{t('menschenText')}</p>
        {sprecher.length === 0 ? (
          <p>{t('menschenLeer')}</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {sprecher.map((p) => (
              <li key={p.id}>
                {p.name}: <span className="font-mono">mensch:{p.id}</span> ·{' '}
                {[p.kiSyntheseErlaubt ? tl('audio.b1') : null, p.klonenErlaubt ? tl('audio.b2') : null].filter(Boolean).join(', ') ||
                  tl('audio.nurA')}
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
