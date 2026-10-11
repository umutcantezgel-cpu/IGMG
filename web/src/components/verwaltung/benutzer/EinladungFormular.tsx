'use client';

import NextLink from 'next/link';
import { useActionState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Feld } from '@/components/verwaltung/Feld';
import { Meldung } from '@/components/verwaltung/Meldung';
import { einladen, type BenutzerZustand } from '@/server/actions/benutzer';
import { RollenFelder } from './RollenFelder';
import { useRollenTexte } from './texte';

/** Person einladen (C12, K-06): Prüfung auf dem Server, Fehler am Feld, Link nach Erfolg nur einmal sichtbar. */
export function EinladungFormular() {
  const t = useTranslations('verwaltung.benutzer');
  const tv = useTranslations('verwaltung');
  const rollenTexte = useRollenTexte();
  const [z, absenden, laeuft] = useActionState<BenutzerZustand, FormData>(einladen, {});
  const meldung = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (z.fehler || z.ok) meldung.current?.querySelector<HTMLElement>('[tabindex="-1"]')?.focus();
  }, [z]);
  const fehler = (feld: string) => (z.feldFehler?.[feld] ? t(`fehler.${z.feldFehler[feld]}` as never) : undefined);
  const wert = (feld: string) => {
    const w = z.werte?.[feld];
    return typeof w === 'string' ? w : undefined;
  };
  const liste = (feld: string) => {
    const w = z.werte?.[feld];
    return Array.isArray(w) ? w : [];
  };

  if (z.ok && z.link) {
    return (
      <div ref={meldung} className="flex flex-col gap-4">
        <Meldung art="erfolg" fokus>
          <span className="flex flex-col gap-1">
            <strong>{t('formular.erfolgTitel')}</strong>
            {t('formular.erfolgText')}
          </span>
        </Meldung>
        <Feld
          id="einladung-link"
          label={t('formular.link')}
          value={z.link}
          readOnly
          className="font-mono text-16"
          onFocus={(e) => e.currentTarget.select()}
        />
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            {/* neuer Suchparameter → die Seite bindet das Formular mit neuem Schlüssel ein (leerer Zustand) */}
            <NextLink href={`/verwaltung/benutzer/einladen?neu=${z.link.slice(-8)}`}>{t('formular.weitere')}</NextLink>
          </Button>
          <Button asChild variant="outline">
            <NextLink href="/verwaltung/benutzer">{t('formular.zurueck')}</NextLink>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form action={absenden} className="flex flex-col gap-5" noValidate>
      <div ref={meldung}>
        {z.fehler ? (
          <Meldung art="fehler" fokus>
            {t(`fehler.${z.fehler}` as never)}
          </Meldung>
        ) : null}
      </div>
      <Feld
        id="einladung-email"
        name="email"
        type="email"
        autoComplete="off"
        required
        label={t('formular.email')}
        pflicht={tv('pflichtfeld')}
        defaultValue={wert('email')}
        fehler={fehler('email')}
      />
      <Feld
        id="einladung-name"
        name="name"
        required
        label={t('formular.name')}
        pflicht={tv('pflichtfeld')}
        hinweis={t('formular.nameHinweis')}
        defaultValue={wert('name')}
        fehler={fehler('name')}
      />
      <RollenFelder
        texte={rollenTexte}
        rollen={liste('rollen')}
        organisationen={liste('organisationen')}
        fehlerRollen={fehler('rollen')}
        fehlerOrganisationen={fehler('organisationen')}
      />
      <Feld
        id="einladung-gueltig"
        name="gueltigTage"
        type="number"
        min={1}
        max={14}
        step={1}
        className="w-32"
        label={t('formular.gueltigTage')}
        hinweis={t('formular.gueltigHinweis')}
        defaultValue={wert('gueltigTage') || '3'}
        fehler={fehler('gueltigTage')}
      />
      <Button type="submit" className="self-start" disabled={laeuft}>
        {laeuft ? t('formular.sendet') : t('formular.senden')}
      </Button>
    </form>
  );
}
