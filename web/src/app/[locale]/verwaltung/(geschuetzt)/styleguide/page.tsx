import { getTranslations } from 'next-intl/server';
import { Abstaende } from '@/components/verwaltung/styleguide/Abstaende';
import { Bewegung } from '@/components/verwaltung/styleguide/Bewegung';
import { Barrierefreiheit } from '@/components/verwaltung/styleguide/Barrierefreiheit';
import { Farben } from '@/components/verwaltung/styleguide/Farben';
import { Ebenen } from '@/components/verwaltung/styleguide/Ebenen';
import { Felder } from '@/components/verwaltung/styleguide/Felder';
import { Karten } from '@/components/verwaltung/styleguide/Karten';
import { Knoepfe } from '@/components/verwaltung/styleguide/Knoepfe';
import { Meldungen } from '@/components/verwaltung/styleguide/Meldungen';
import { Pillen } from '@/components/verwaltung/styleguide/Pillen';
import { Raster } from '@/components/verwaltung/styleguide/Raster';
import { Radien } from '@/components/verwaltung/styleguide/Radien';
import { Schatten } from '@/components/verwaltung/styleguide/Schatten';
import { Sprungnavigation } from '@/components/verwaltung/styleguide/Sprungnavigation';
import { Typografie } from '@/components/verwaltung/styleguide/Typografie';
import { verlangeSeitenRecht } from '@/lib/rechte/pruefe';

/**
 * Verwaltung › Styleguide (V14, Blatt V14-verwaltung-styleguide): Nachschlageseite der Designwerte aus globals.css.
 * Recht `styleguide.lesen` (Grundrecht, alle Rollen). Keine Datenbank: die Werte stehen in `tokens.ts`, geprüft per Test.
 */
export default async function Styleguide() {
  await verlangeSeitenRecht('styleguide.lesen');
  const t = await getTranslations('verwaltung.styleguide');
  return (
    <div className="flex flex-col gap-12">
      <header className="flex flex-col gap-3">
        <p className="text-16 font-bold text-gruen-800">{t('eyebrow')}</p>
        <h1 className="text-36 md:text-48">{t('titel')}</h1>
        <p className="max-w-text text-18 text-tinte-2">{t('einleitung')}</p>
      </header>
      <Sprungnavigation />
      <Farben />
      <Typografie />
      <Abstaende />
      <Raster />
      <Radien />
      <Schatten />
      <Knoepfe />
      <Felder />
      <Pillen />
      <Karten />
      <Meldungen />
      <Bewegung />
      <Ebenen />
      <Barrierefreiheit />
    </div>
  );
}
