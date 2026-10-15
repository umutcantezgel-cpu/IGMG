import { ShieldCheck } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Meldung } from '@/components/verwaltung/Meldung';
import { datumLang } from '@/lib/i18n/format';
import type { Angemeldet } from '@/lib/rechte/pruefe';
import { antraegeZurEntscheidung } from '@/lib/rechte/schutzrollen';
import { rollenAntragEntscheiden } from '@/server/actions/benutzer';

const MELDUNGEN = ['bestaetigt', 'abgelehnt', 'nichtGefunden', 'administration'] as const;

/**
 * Offene Anträge auf die Schutzrollen Leitung und Kinderschutz (Vier-Augen-Prinzip, S2/S3) für eine zweite Person mit
 * Leitung oder Kinderschutz – ohne eigene Anträge und ohne Anträge über sich selbst. Formulare ohne JavaScript; der Server
 * prüft alles erneut (`entscheideAntrag`). Ohne offene Anträge und ohne Rückmeldung: nichts.
 */
export async function RollenAntraege({
  angemeldet,
  zurueck,
  meldung,
}: {
  angemeldet: Angemeldet;
  zurueck: '/verwaltung/gemeinde-im-blick' | '/verwaltung/kinderschutz';
  meldung?: string | string[];
}) {
  const [antraege, t, tr] = await Promise.all([
    antraegeZurEntscheidung(angemeldet),
    getTranslations('verwaltung.benutzer.antraege'),
    getTranslations('verwaltung.rollen'),
  ]);
  const rueckmeldung = MELDUNGEN.find((m) => m === meldung);
  if (!antraege.length && !rueckmeldung) return null;
  return (
    <section
      id="rollenantraege"
      aria-labelledby="rollenantraege-titel"
      className="flex scroll-mt-6 flex-col gap-4 rounded-lg border border-linie bg-weiss p-6 shadow-s1 print:hidden"
    >
      <h2 id="rollenantraege-titel" className="flex items-center gap-2 text-24 font-bold">
        <ShieldCheck aria-hidden className="size-6 text-gruen-700" />
        {t('titel')}
      </h2>
      <p className="max-w-text text-pretty text-tinte-2">{t('text')}</p>
      {rueckmeldung ? (
        <Meldung art={rueckmeldung === 'bestaetigt' || rueckmeldung === 'abgelehnt' ? 'erfolg' : 'fehler'}>
          {t(`meldung.${rueckmeldung}`)}
        </Meldung>
      ) : null}
      {antraege.length ? (
        <ul className="flex flex-col divide-y divide-linie">
          {antraege.map((x) => {
            const rolle = tr(x.rolle);
            const datum = datumLang(x.beantragtAm, 'de');
            return (
              <li key={x.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="font-bold">{x.name}</span>
                  <span className="text-16 break-all text-tinte-2">{x.email}</span>
                  <span className="text-16">{t('rolle', { rolle })}</span>
                  <span className="text-16 text-tinte-2">
                    {x.beantragtVonName ? t('beantragtVon', { name: x.beantragtVonName, datum }) : t('beantragtOhneName', { datum })}
                  </span>
                </span>
                <span className="flex flex-wrap gap-2">
                  <form action={rollenAntragEntscheiden}>
                    <input type="hidden" name="id" value={x.id} />
                    <input type="hidden" name="entscheidung" value="bestaetigen" />
                    <input type="hidden" name="zurueck" value={zurueck} />
                    <Button type="submit" size="sm" aria-label={t('bestaetigenLabel', { rolle, name: x.name })}>
                      {t('bestaetigen')}
                    </Button>
                  </form>
                  <form action={rollenAntragEntscheiden}>
                    <input type="hidden" name="id" value={x.id} />
                    <input type="hidden" name="entscheidung" value="ablehnen" />
                    <input type="hidden" name="zurueck" value={zurueck} />
                    <Button type="submit" size="sm" variant="outline" aria-label={t('ablehnenLabel', { rolle, name: x.name })}>
                      {t('ablehnen')}
                    </Button>
                  </form>
                </span>
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}
