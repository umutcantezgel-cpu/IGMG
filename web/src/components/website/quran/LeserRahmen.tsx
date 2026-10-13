import { getLocale, getMessages, getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
import { schriftQuran } from '@/app/schriften-quran';
import { pfadFuer } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import type { SichtbareAusgabe } from '@/lib/quran/ausgaben';
import { ladeRezitationen } from '@/server/queries/quran';
import type { LeserTexte } from './leser-typen';
import { QuranLeser } from './QuranLeser';
import './quran.css';

/**
 * Gespeicherte Ansicht vor dem ersten Zeichnen anwenden (kein Springen nach der Hydrierung): liest die Einstellungen
 * aus dem Gerät und setzt nur bekannte Werte an den Leser. Ohne Speicher bleibt die Vorgabe.
 */
const EINSTELLUNGEN_VORAB = `(function(){try{var c=document.currentScript.parentElement,s=JSON.parse(localStorage.getItem('igmg-quran-einstellungen')||'{}');if(/^(beide|arabisch|uebersetzung)$/.test(s.modus))c.dataset.modus=s.modus;if(/^(an|aus)$/.test(s.tajwid))c.dataset.tajwid=s.tajwid;if(/^[1-5]$/.test(String(s.groesse)))c.dataset.groesse=String(s.groesse)}catch(e){}})()`;

/**
 * Rahmen der Leseansichten (Sure, Cüz): Leser-Container mit Einstellungen als data-Attributen, Koranschrift (nur hier
 * vorgeladen), die Insel `QuranLeser` mit Texten und Adressen vom Server und darunter die Lesespalte. Hinweise zur
 * Übersetzung stehen hier, damit der Ausgabewechsel sie umschalten kann.
 */
export async function LeserRahmen({
  sure,
  cuz,
  ausgaben,
  ausgabe,
  children,
}: {
  sure: number | null;
  cuz: number | null;
  ausgaben: SichtbareAusgabe[];
  ausgabe: SichtbareAusgabe | null;
  children: ReactNode;
}) {
  const sprache = (await getLocale()) as Locale;
  const t = await getTranslations('quranSeite');
  const q = ((await getMessages()) as unknown as { quranSeite: Record<string, unknown> }).quranSeite as unknown as LeserTexte & {
    quelle: { uebersetzung: string };
  };
  const texte: LeserTexte = {
    leser: q.leser,
    familien: q.familien,
    muster: q.muster,
    wortkarte: q.wortkarte,
    tajwidLeiste: q.tajwidLeiste,
    player: q.player,
    quelleUebersetzung: q.quelle.uebersetzung,
  };
  const rezitationen = (await ladeRezitationen()).map((r) => ({
    id: r.id,
    name: r.name[sprache] ?? r.name.de,
    rezitator: r.rezitator,
    lizenz: r.lizenz,
  }));
  return (
    <div className={`leser ${schriftQuran.variable}`} data-modus="beide" data-tajwid="an" data-groesse="2" suppressHydrationWarning>
      <script dangerouslySetInnerHTML={{ __html: EINSTELLUNGEN_VORAB }} />
      <QuranLeser
        sprache={sprache}
        sure={sure}
        cuz={cuz}
        texte={texte}
        ausgaben={ausgaben.map((a) => ({
          id: a.id,
          sprache: a.sprache,
          titel: a.titel,
          uebersetzer: a.uebersetzer,
          ausstehend: a.ausstehend,
        }))}
        ausgabe={ausgabe?.id ?? null}
        rezitationen={rezitationen}
        pfade={{
          woerter: '/api/quran/__s__/woerter',
          uebersetzung: '/api/quran/__s__/uebersetzung/__a__',
          zeiten: '/api/quran/__s__/zeiten/__r__',
          tajwid: pfadFuer('/quran/tajwid', sprache),
        }}
      />
      <div className="mx-auto flex max-w-(--container-lesen) flex-col gap-6 px-4 pt-6 pb-abschnitt-klein md:px-8 md:pt-8">
        <p
          data-hinweis-ausstehend
          data-nur-uebersetzung
          hidden={!ausgabe?.ausstehend}
          className="rounded-lg border border-warnung/40 bg-warnung-toenung px-4 py-3 text-16 text-warnung"
        >
          {t('leser.hinweisAusstehend')}
        </p>
        <p
          data-keine-uebersetzung
          data-nur-uebersetzung
          hidden={Boolean(ausgabe)}
          className="rounded-lg border border-linie bg-sand px-4 py-3 text-16 text-tinte-2"
        >
          {t('leser.keineUebersetzung')}
        </p>
        {children}
      </div>
    </div>
  );
}
