'use client';

import { Copy, Eye, ExternalLink } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useActionState, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import type { VorschauZustand } from '@/server/actions/seiten';

type Aktion = (vorher: VorschauZustand, fd: FormData) => Promise<VorschauZustand>;

const zeit = new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Berlin' });

/**
 * Signierte Vorschau (ADR 0032): erzeugt einen Link, der 24 Stunden gilt und die Seite im gespeicherten Stand zeigt –
 * auch ohne Anmeldung (z. B. für den Vorstand). Kopieren über die Zwischenablage, Ansage über eine Live-Region.
 */
export function VorschauKnopf({ aktion, id }: { aktion: Aktion; id: string }) {
  const t = useTranslations('verwaltung.seiten.vorschau');
  const [zustand, absenden, laeuft] = useActionState(aktion, {});

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-linie bg-weiss px-4 py-3 md:px-5">
      <form action={absenden} className="flex flex-wrap items-center gap-3">
        <input type="hidden" name="id" value={id} />
        <Button type="submit" variant="secondary" disabled={laeuft}>
          <Eye aria-hidden />
          {t('knopf')}
        </Button>
        <p className="max-w-einleitung text-16 text-tinte-2">{t('hinweis')}</p>
      </form>
      <div role="status" className="flex flex-col gap-2 empty:hidden">
        {zustand.fehler ? <p className="font-bold text-fehler">{t(`fehler.${zustand.fehler}`)}</p> : null}
        {zustand.url && zustand.gueltigBis ? <VorschauLink key={zustand.url} pfad={zustand.url} gueltigBis={zustand.gueltigBis} /> : null}
      </div>
    </div>
  );
}

/** Erzeugter Link: öffnen, kopieren, als Text zeigen. Je Link neu aufgebaut (Schlüssel), damit „Kopiert“ zurückgesetzt ist. */
function VorschauLink({ pfad, gueltigBis }: { pfad: string; gueltigBis: string }) {
  const t = useTranslations('verwaltung.seiten.vorschau');
  const [kopiert, setKopiert] = useState(false);
  const linkRef = useRef<HTMLAnchorElement>(null);
  const url = new URL(pfad, window.location.origin).toString();

  useEffect(() => {
    linkRef.current?.focus();
  }, []);

  return (
    <>
      <p className="text-16">{t('erzeugt', { zeit: zeit.format(new Date(gueltigBis)) })}</p>
      <div className="flex flex-wrap items-center gap-2">
        <a
          ref={linkRef}
          href={pfad}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-12 items-center gap-2 font-bold underline underline-offset-4"
        >
          {t('oeffnen')}
          <ExternalLink aria-hidden className="size-4" />
        </a>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="min-h-12"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(url);
              setKopiert(true);
            } catch {
              setKopiert(false);
            }
          }}
        >
          <Copy aria-hidden />
          {kopiert ? t('kopiert') : t('kopieren')}
        </Button>
      </div>
      <code className="block rounded-md bg-sand px-3 py-2 text-16 break-all">{url}</code>
    </>
  );
}
