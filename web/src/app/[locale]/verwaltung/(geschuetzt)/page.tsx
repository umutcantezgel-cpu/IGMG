import { getTranslations } from 'next-intl/server';
import { MODULE } from '@/components/verwaltung/shell/module';
import { Kennzahlen } from '@/components/verwaltung/uebersicht/Kennzahlen';
import { Listen } from '@/components/verwaltung/uebersicht/Listen';
import { sichtbareKacheln } from '@/components/verwaltung/uebersicht/sichtbarkeit';
import { verlangeSeitenRecht } from '@/lib/rechte/pruefe';
import { ladeUebersicht } from '@/server/queries/verwaltung/uebersicht';

/**
 * Verwaltung › Übersicht (Blatt V01, Paket C01): Begrüßung, Kennzahlen je freigegebenem Modul und zwei Kurzlisten.
 * Nur lesen. Die Kacheln folgen `MODULE` (gebaut und Leserecht), damit später freigeschaltete Module ohne Änderung
 * hier erscheinen.
 */
export default async function Uebersicht() {
  const a = await verlangeSeitenRecht('uebersicht.lesen');
  const [t, tv] = await Promise.all([getTranslations('verwaltung.uebersicht'), getTranslations('verwaltung')]);
  const sichtbar = sichtbareKacheln(MODULE, a.rollen);
  const daten = await ladeUebersicht(a, new Set(sichtbar.map((k) => k.schluessel)));
  const kacheln = sichtbar.map((k) => ({
    schluessel: k.schluessel,
    pfad: k.pfad,
    label: tv(`module.${k.schluessel}`),
    wert: daten.kennzahlen[k.schluessel] ?? 0,
    hinweis: t(`hinweis.${k.schluessel}`),
  }));
  const leer = kacheln.length === 0 && daten.kommend === null && daten.neuigkeiten === null;
  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="text-30 md:text-36">{t('titel')}</h1>
        <p className="text-20">{t('willkommen', { name: a.name })}</p>
      </div>
      {kacheln.length ? <Kennzahlen kacheln={kacheln} titel={t('kennzahlen')} /> : null}
      <Listen
        neuigkeiten={daten.neuigkeiten}
        kommend={daten.kommend}
        texte={{
          neuigkeiten: t('neuigkeiten'),
          neuigkeitenLeer: t('neuigkeitenLeer'),
          veranstaltungen: t('veranstaltungen'),
          veranstaltungenLeer: t('veranstaltungenLeer'),
          ganztaegig: t('ganztaegig'),
          status: { entwurf: t('status.entwurf'), veroeffentlicht: t('status.veroeffentlicht') },
        }}
      />
      {leer ? <p className="rounded-lg border border-linie bg-weiss p-6 text-tinte-2">{t('leer')}</p> : null}
    </>
  );
}
