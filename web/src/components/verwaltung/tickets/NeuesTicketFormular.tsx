'use client';

import { Save } from 'lucide-react';
import NextLink from 'next/link';
import { useTranslations } from 'next-intl';
import { useActionState, useEffect, useId, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Meldung } from '@/components/verwaltung/Meldung';
import { eingabe, Rahmen } from '@/components/verwaltung/tickets/Felder';
import { cn } from '@/lib/utils';
import type { TicketZustand } from '@/server/actions/tickets';

type Option = { wert: string; label: string };
type Aktion = (vorher: TicketZustand, fd: FormData) => Promise<TicketZustand>;

const STARTWERTE: Record<string, string> = { titel: '', beschreibung: '', kategorie: '', organisation: '', prioritaet: 'mittel' };

/** Feldname → Beschriftungsschlüssel unter `verwaltung.tickets.formular` für die Fehler-Zusammenfassung. */
const LABEL: Record<string, string> = {
  titel: 'formular.titel',
  beschreibung: 'formular.beschreibung',
  kategorie: 'formular.kategorie',
  organisation: 'formular.organisation',
  prioritaet: 'formular.prioritaet',
};

/**
 * Formular „Neues Ticket“ (V10): Titel, Beschreibung, Kategorie, Organisation, Priorität. Typ ist immer „intern“.
 * Der Server prüft mit demselben Schema; Fehler stehen oben als Zusammenfassung mit Sprungverweisen und am Feld (K-07).
 */
export function NeuesTicketFormular({
  aktion,
  organisationen,
  vorgabeOrganisation,
  prioritaeten,
}: {
  aktion: Aktion;
  organisationen: Option[];
  vorgabeOrganisation: string;
  prioritaeten: Option[];
}) {
  const t = useTranslations('verwaltung.tickets');
  const [zustand, absenden, laeuft] = useActionState(aktion, {});
  const meldungRef = useRef<HTMLDivElement>(null);
  const basisId = useId();
  const id = (feld: string) => `${basisId}-${feld}`;
  const wert = (feld: string) => {
    const vorgabe = feld === 'organisation' ? vorgabeOrganisation : STARTWERTE[feld];
    const v = zustand.werte?.[feld] ?? vorgabe;
    return typeof v === 'string' ? v : '';
  };
  const fehler = zustand.feldFehler;
  const f = (feld: string) => (fehler?.[feld] ? t(`fehler.${fehler[feld]}`) : undefined);
  const fehlerListe = Object.keys(fehler ?? {});

  useEffect(() => {
    if (zustand.fehler) meldungRef.current?.focus();
  }, [zustand]);

  return (
    <form action={absenden} className="flex flex-col gap-6" noValidate>
      <div ref={meldungRef} tabIndex={-1} className="outline-none">
        {zustand.fehler ? (
          <Meldung art="fehler">
            <p>{t(`fehler.${zustand.fehler}`)}</p>
            {fehlerListe.length ? (
              <ul className="mt-2 list-disc pl-5 font-normal">
                {fehlerListe.map((k) => (
                  <li key={k}>
                    <a href={`#${id(k)}`} className="text-fehler underline">
                      {LABEL[k] ? t(LABEL[k]) : k}: {t(`fehler.${fehler?.[k]}`)}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </Meldung>
        ) : null}
      </div>

      <div className="grid gap-4 rounded-lg border border-linie bg-weiss p-5 md:grid-cols-2 md:p-6">
        <div className="md:col-span-2">
          <Rahmen
            id={id('titel')}
            label={t('formular.titel')}
            pflicht={t('formular.pflichtfeld')}
            fehler={f('titel')}
            kinder={(aria) => (
              <input
                {...aria}
                name="titel"
                type="text"
                required
                maxLength={160}
                defaultValue={wert('titel')}
                placeholder={t('formular.titelPlatzhalter')}
                className={eingabe}
              />
            )}
          />
        </div>
        <div className="md:col-span-2">
          <Rahmen
            id={id('beschreibung')}
            label={t('formular.beschreibung')}
            pflicht={t('formular.pflichtfeld')}
            fehler={f('beschreibung')}
            kinder={(aria) => (
              <textarea
                {...aria}
                name="beschreibung"
                rows={6}
                required
                maxLength={5000}
                defaultValue={wert('beschreibung')}
                placeholder={t('formular.beschreibungPlatzhalter')}
                className={cn(eingabe, 'py-2.5')}
              />
            )}
          />
        </div>
        <Rahmen
          id={id('kategorie')}
          label={t('formular.kategorie')}
          fehler={f('kategorie')}
          kinder={(aria) => (
            <input
              {...aria}
              name="kategorie"
              type="text"
              maxLength={80}
              defaultValue={wert('kategorie')}
              placeholder={t('formular.kategoriePlatzhalter')}
              className={eingabe}
            />
          )}
        />
        <Rahmen
          id={id('organisation')}
          label={t('formular.organisation')}
          fehler={f('organisation')}
          kinder={(aria) => (
            <select {...aria} name="organisation" defaultValue={wert('organisation')} className={eingabe}>
              {organisationen.map((o) => (
                <option key={o.wert} value={o.wert}>
                  {o.label}
                </option>
              ))}
            </select>
          )}
        />
        <Rahmen
          id={id('prioritaet')}
          label={t('formular.prioritaet')}
          fehler={f('prioritaet')}
          kinder={(aria) => (
            <select {...aria} name="prioritaet" defaultValue={wert('prioritaet')} className={eingabe}>
              {prioritaeten.map((p) => (
                <option key={p.wert} value={p.wert}>
                  {p.label}
                </option>
              ))}
            </select>
          )}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={laeuft}>
          <Save aria-hidden />
          {laeuft ? t('formular.speichert') : t('formular.erstellen')}
        </Button>
        <Button asChild variant="outline">
          <NextLink href="/verwaltung/tickets">{t('formular.abbrechen')}</NextLink>
        </Button>
      </div>
    </form>
  );
}
