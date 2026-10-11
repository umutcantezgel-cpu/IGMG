import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

/**
 * Lokalisierte Navigation. `Link` ohne `locale`-Prop verwenden – die Angabe von `locale`
 * erzwingt das Präfix auch für Deutsch (Lichtung a). Nur der Sprachumschalter setzt `locale`.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
