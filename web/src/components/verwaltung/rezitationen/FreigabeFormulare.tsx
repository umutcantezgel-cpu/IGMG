'use client';

import { FileUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useActionState, useEffect, useId, useRef, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { eingabe, Rahmen } from '@/components/verwaltung/Feld';
import { Meldung } from '@/components/verwaltung/Meldung';
import type { RezitationZustand } from '@/server/actions/rezitationen';

type Aktion = (vorher: RezitationZustand, fd: FormData) => Promise<RezitationZustand>;

function useRueckmeldung(z: RezitationZustand) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (z.fehler || z.gespeichert) ref.current?.focus();
  }, [z]);
  return ref;
}

/** Ein Knopf mit versteckten Feldern (Aktivieren, Standard, Verknüpfung lösen) und Rückmeldung mit Fokus. */
export function AktionsKnopf({
  aktion,
  felder,
  knopf,
  erfolg,
  variante = 'default',
  icon,
}: {
  aktion: Aktion;
  felder: Record<string, string>;
  knopf: string;
  erfolg: string;
  variante?: 'default' | 'secondary' | 'outline' | 'destructive';
  icon?: ReactNode;
}) {
  const t = useTranslations('verwaltung.rezitationen');
  const [z, absenden, laeuft] = useActionState(aktion, {});
  const ref = useRueckmeldung(z);
  return (
    <form action={absenden} className="flex flex-col gap-2">
      <div ref={ref} tabIndex={-1} className="outline-none empty:hidden">
        {z.fehler ? (
          <Meldung art="fehler">{t(`fehler.${z.fehler}` as never)}</Meldung>
        ) : z.gespeichert ? (
          <Meldung art="erfolg">{erfolg}</Meldung>
        ) : null}
      </div>
      {Object.entries(felder).map(([name, wert]) => (
        <input key={name} type="hidden" name={name} value={wert} />
      ))}
      <Button type="submit" variant={variante} disabled={laeuft} className="self-start">
        {icon}
        {laeuft ? t('freigabe.laeuft') : knopf}
      </Button>
    </form>
  );
}

/** Vereinbarung als PDF hochladen oder aus den Medien wählen (Muster 6, ein Formular). */
export function VereinbarungFormular({
  aktion,
  id,
  auswahl,
  darfHochladen,
}: {
  aktion: Aktion;
  id: string;
  auswahl: { id: string; titel: string }[];
  darfHochladen: boolean;
}) {
  const t = useTranslations('verwaltung.rezitationen');
  const [z, absenden, laeuft] = useActionState(aktion, {});
  const ref = useRueckmeldung(z);
  const basis = useId();
  const dateiFehler = z.feldFehler?.datei ? t(`fehler.${z.feldFehler.datei}` as never) : undefined;
  return (
    <form action={absenden} className="flex flex-col gap-4" noValidate>
      <input type="hidden" name="id" value={id} />
      <div ref={ref} tabIndex={-1} className="outline-none empty:hidden">
        {z.fehler && z.fehler !== 'pruefen' ? (
          <Meldung art="fehler">{t(`fehler.${z.fehler}` as never)}</Meldung>
        ) : z.gespeichert ? (
          <Meldung art="erfolg">{t('vereinbarung.gespeichert')}</Meldung>
        ) : dateiFehler ? (
          <Meldung art="fehler">{dateiFehler}</Meldung>
        ) : null}
      </div>
      {darfHochladen ? (
        <Rahmen
          id={`${basis}-datei`}
          label={t('vereinbarung.datei')}
          hinweis={t('vereinbarung.dateiHinweis')}
          fehler={dateiFehler}
          kinder={(aria) => (
            <input {...aria} type="file" name="datei" accept="application/pdf,.pdf" className="min-h-12 w-full max-w-full text-18" />
          )}
        />
      ) : null}
      {auswahl.length ? (
        <Rahmen
          id={`${basis}-auswahl`}
          label={darfHochladen ? t('vereinbarung.oder') : t('vereinbarung.auswahl')}
          kinder={(aria) => (
            <select {...aria} name="mediumId" defaultValue="" className={eingabe}>
              <option value="">{t('vereinbarung.keineAuswahl')}</option>
              {auswahl.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.titel}
                </option>
              ))}
            </select>
          )}
        />
      ) : null}
      <Button type="submit" variant="secondary" className="self-start" disabled={laeuft}>
        <FileUp aria-hidden />
        {laeuft ? t('freigabe.laeuft') : t('vereinbarung.speichern')}
      </Button>
    </form>
  );
}
