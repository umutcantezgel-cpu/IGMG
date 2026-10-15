'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Meldung } from '@/components/verwaltung/Meldung';
import type { RollenZuweisung } from '@/lib/rechte/matrix';
import { rollenSpeichern, type BenutzerZustand } from '@/server/actions/benutzer';
import { RollenFelder } from './RollenFelder';
import { useRollenTexte } from './texte';

/**
 * Rollen eines Kontos ändern (C12): Schutzregeln (eigene/letzte Administration, Vier-Augen-Prinzip für Vergabe und Entzug
 * der Schutzrollen) prüft der Server.
 */
export function RollenFormular({ id, rollen }: { id: string; rollen: RollenZuweisung[] }) {
  const t = useTranslations('verwaltung.benutzer');
  const rollenTexte = useRollenTexte();
  const [z, absenden, laeuft] = useActionState<BenutzerZustand, FormData>(rollenSpeichern, {});
  const meldung = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (z.fehler || z.ok) meldung.current?.querySelector<HTMLElement>('[tabindex="-1"]')?.focus();
  }, [z]);
  const fehler = (feld: string) => (z.feldFehler?.[feld] ? t(`fehler.${z.feldFehler[feld]}` as never) : undefined);
  const aus = (feld: 'rollen' | 'organisationen', start: string[]) => {
    const w = z.werte?.[feld];
    return Array.isArray(w) ? w : start;
  };
  return (
    <form action={absenden} className="flex flex-col gap-4" noValidate>
      <input type="hidden" name="id" value={id} />
      <div ref={meldung}>
        {z.fehler ? (
          <Meldung art="fehler" fokus>
            {t(`fehler.${z.fehler}` as never)}
          </Meldung>
        ) : z.ok ? (
          <Meldung art={z.beantragt?.length || z.entzugBeantragt?.length ? 'info' : 'erfolg'} fokus>
            {t(
              z.beantragt?.length
                ? 'formular.rollenBeantragt'
                : z.entzugBeantragt?.length
                  ? 'formular.entzugBeantragt'
                  : 'formular.rollenGespeichert',
            )}
            {z.beantragt?.length && z.entzugBeantragt?.length ? ` ${t('formular.entzugBeantragt')}` : null}
          </Meldung>
        ) : null}
      </div>
      <RollenFelder
        texte={rollenTexte}
        rollen={aus('rollen', [...new Set(rollen.map((r) => r.rolle))])}
        organisationen={aus(
          'organisationen',
          rollen.flatMap((r) => (r.organisation ? [r.organisation] : [])),
        )}
        fehlerRollen={fehler('rollen')}
        fehlerOrganisationen={fehler('organisationen')}
      />
      <Button type="submit" className="self-start" disabled={laeuft}>
        {laeuft ? t('konto.sendet') : t('formular.rollenSpeichern')}
      </Button>
    </form>
  );
}
