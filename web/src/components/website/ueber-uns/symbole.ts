import { ArrowUpRight, Building2, Heart, House, type LucideIcon, MapPin, Users } from 'lucide-react';
import type { Symbolschluessel } from '@/lib/validierung/seiteninhalte/ueber-uns';

/** Symbole aus design/AboutUs.dc.html (Lucide-Zeichen): Zeitleiste D:92–96, Werte D:99–102. */
export const SYMBOL: Record<Symbolschluessel, LucideIcon> = {
  haus: House,
  gebaeude: Building2,
  gemeinde: Users,
  standort: MapPin,
  aufwaerts: ArrowUpRight,
  herz: Heart,
};
