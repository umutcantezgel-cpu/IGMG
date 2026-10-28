import { seed as dachverband } from './dachverband';
import { seed as igmg } from './igmg';
import { seed as korankurse } from './korankurse';
import { seed as nachrichtenMehr } from './nachrichten-mehr';
import { seed as organisationen } from './organisationen';
import { seed as projekte } from './projekte';
import { seed as rechtliches } from './rechtliches';
import { seed as seiten } from './seiten';
import type { BereichsSeed } from './typ';
import { seed as ueberUns } from './ueber-uns';
import { seed as vorstand } from './vorstand';
import { seed as wissen } from './wissen';

/** Seeds je Bereich (E-027) – in dieser Reihenfolge nach den Grund-Seeds. Neue Bereiche nur hier eintragen. */
export const BEREICHS_SEEDS: { name: string; lauf: BereichsSeed }[] = [
  { name: 'nachrichten (Welle A)', lauf: nachrichtenMehr },
  { name: 'ueber-uns', lauf: ueberUns },
  { name: 'vorstand', lauf: vorstand },
  { name: 'projekte', lauf: projekte },
  { name: 'igmg', lauf: igmg },
  { name: 'dachverband', lauf: dachverband },
  { name: 'organisationen', lauf: organisationen },
  { name: 'korankurse', lauf: korankurse },
  { name: 'wissen', lauf: wissen },
  { name: 'rechtliches', lauf: rechtliches },
  { name: 'seiten (CMS)', lauf: seiten },
];
