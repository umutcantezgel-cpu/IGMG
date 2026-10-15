import { ShieldCheck } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Meldung } from '@/components/verwaltung/Meldung';
import { datumLang } from '@/lib/i18n/format';
import { elternAntraegeZurEntscheidung } from '@/lib/konto/eltern-freigabe';
import type { Angemeldet } from '@/lib/rechte/pruefe';
import { antraegeZurEntscheidung } from '@/lib/rechte/schutzrollen';
import { rollenAntragEntscheiden } from '@/server/actions/benutzer';

const ERFOLG = ['bestaetigt', 'abgelehnt', 'einladungBestaetigt', 'einladungAbgelehnt', 'bezugBeendet', 'bezugAbgelehnt'] as const;
const MELDUNGEN = [...ERFOLG, 'nichtGefunden', 'administration'] as const;
const unterTitel = 'font-text text-20 font-bold tracking-normal';
const zeile = 'flex flex-wrap items-center justify-between gap-3 py-3';

/** Formularpaar „Bestätigen“/„Ablehnen“ ohne JavaScript; der Server prüft alles erneut. */
function Entscheidung({
  felder,
  zurueck,
  texte,
}: {
  felder: Record<string, string>;
  zurueck: string;
  texte: { bestaetigen: string; ablehnen: string; bestaetigenLabel: string; ablehnenLabel: string };
}) {
  const versteckt = (entscheidung: string) => (
    <>
      {Object.entries(felder).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <input type="hidden" name="entscheidung" value={entscheidung} />
      <input type="hidden" name="zurueck" value={zurueck} />
    </>
  );
  return (
    <span className="flex flex-wrap gap-2">
      <form action={rollenAntragEntscheiden}>
        {versteckt('bestaetigen')}
        <Button type="submit" size="sm" aria-label={texte.bestaetigenLabel}>
          {texte.bestaetigen}
        </Button>
      </form>
      <form action={rollenAntragEntscheiden}>
        {versteckt('ablehnen')}
        <Button type="submit" size="sm" variant="outline" aria-label={texte.ablehnenLabel}>
          {texte.ablehnen}
        </Button>
      </form>
    </span>
  );
}

/**
 * Offene Vorgänge im Vier-Augen-Prinzip (S2/S3, Nacharbeit N4) für eine zweite Person mit Leitung oder Kinderschutz –
 * ohne eigene Anträge und ohne Vorgänge über sich selbst: Vergabe und Entzug von Schutzrollen, Eltern-Einladungen an
 * Adressen außerhalb der Voranmeldung, Beenden eines Eltern-Kind-Bezugs. Formulare ohne JavaScript; der Server prüft
 * alles erneut. Ohne offene Vorgänge und ohne Rückmeldung: nichts.
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
  const [antraege, eltern, t, tr] = await Promise.all([
    antraegeZurEntscheidung(angemeldet),
    elternAntraegeZurEntscheidung(angemeldet),
    getTranslations('verwaltung.benutzer.antraege'),
    getTranslations('verwaltung.rollen'),
  ]);
  const rueckmeldung = MELDUNGEN.find((m) => m === meldung);
  const anzahl = antraege.length + eltern.einladungen.length + eltern.bezuege.length;
  if (!anzahl && !rueckmeldung) return null;
  const knoepfe = { bestaetigen: t('bestaetigen'), ablehnen: t('ablehnen') };
  const von = (name: string | null, am: Date) =>
    name ? t('beantragtVon', { name, datum: datumLang(am, 'de') }) : t('beantragtOhneName', { datum: datumLang(am, 'de') });
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
        <Meldung art={(ERFOLG as readonly string[]).includes(rueckmeldung) ? 'erfolg' : 'fehler'}>{t(`meldung.${rueckmeldung}`)}</Meldung>
      ) : null}
      {antraege.length ? (
        <>
          <h3 className={unterTitel}>{t('rollenTitel')}</h3>
          <ul className="flex flex-col divide-y divide-linie">
            {antraege.map((x) => {
              const rolle = tr(x.rolle);
              const entzug = x.art === 'entzug';
              return (
                <li key={x.id} className={zeile}>
                  <span className="flex min-w-0 flex-col gap-1">
                    <span className="font-bold">{x.name}</span>
                    <span className="text-16 break-all text-tinte-2">{x.email}</span>
                    <span className="text-16">{entzug ? t('rolleEntzug', { rolle }) : t('rolle', { rolle })}</span>
                    <span className="text-16 text-tinte-2">{von(x.beantragtVonName, x.beantragtAm)}</span>
                  </span>
                  <Entscheidung
                    felder={{ art: 'rolle', id: x.id }}
                    zurueck={zurueck}
                    texte={{
                      ...knoepfe,
                      bestaetigenLabel: t(entzug ? 'entzugBestaetigenLabel' : 'bestaetigenLabel', { rolle, name: x.name }),
                      ablehnenLabel: t(entzug ? 'entzugAblehnenLabel' : 'ablehnenLabel', { rolle, name: x.name }),
                    }}
                  />
                </li>
              );
            })}
          </ul>
        </>
      ) : null}
      {eltern.einladungen.length ? (
        <>
          <h3 className={unterTitel}>{t('einladungenTitel')}</h3>
          <p className="max-w-text text-16 text-pretty text-tinte-2">{t('einladungenText')}</p>
          <ul className="flex flex-col divide-y divide-linie">
            {eltern.einladungen.map((x) => (
              <li key={x.id} className={zeile}>
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="font-bold">{x.name}</span>
                  <span className="text-16 break-all text-tinte-2">{x.email}</span>
                  <span className="text-16">{t('elternteilVon', { kind: x.kind })}</span>
                  <span className="text-16 text-tinte-2">{von(x.beantragtVonName, x.beantragtAm)}</span>
                </span>
                <Entscheidung
                  felder={{ art: 'einladung', id: x.id }}
                  zurueck={zurueck}
                  texte={{
                    ...knoepfe,
                    bestaetigenLabel: t('einladungBestaetigenLabel', { name: x.name }),
                    ablehnenLabel: t('einladungAblehnenLabel', { name: x.name }),
                  }}
                />
              </li>
            ))}
          </ul>
        </>
      ) : null}
      {eltern.bezuege.length ? (
        <>
          <h3 className={unterTitel}>{t('bezuegeTitel')}</h3>
          <p className="max-w-text text-16 text-pretty text-tinte-2">{t('bezuegeText')}</p>
          <ul className="flex flex-col divide-y divide-linie">
            {eltern.bezuege.map((x) => (
              <li key={`${x.lernendeId}-${x.elternId}`} className={zeile}>
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="font-bold">{x.name}</span>
                  <span className="text-16 break-all text-tinte-2">{x.email}</span>
                  <span className="text-16">{t('elternteilVon', { kind: x.kind })}</span>
                  <span className="text-16 text-tinte-2">{von(x.beantragtVonName, x.beantragtAm)}</span>
                </span>
                <Entscheidung
                  felder={{ art: 'bezug', id: x.lernendeId, konto: x.elternId }}
                  zurueck={zurueck}
                  texte={{
                    ...knoepfe,
                    bestaetigenLabel: t('bezugBestaetigenLabel', { name: x.name }),
                    ablehnenLabel: t('bezugAblehnenLabel', { name: x.name }),
                  }}
                />
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </section>
  );
}
