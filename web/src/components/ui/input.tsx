import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Eingabefeld nach design/BaseComponents.dc.html: 48 px hoch, Radius 8, Rand 1 px #8C857C (≥ 3:1),
 * 18 px Text; Fehler: Rand 2 px Fehlerrot (über aria-invalid); deaktiviert gestrichelt auf Sand.
 */
function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'h-12 w-full min-w-0 rounded-md border border-rand bg-weiss px-3.5 text-18 text-tinte placeholder:text-tinte-3',
        'focus-visible:border-2 focus-visible:border-gruen-700',
        'aria-invalid:border-2 aria-invalid:border-fehler',
        'disabled:cursor-not-allowed disabled:border-dashed disabled:bg-sand disabled:text-tinte-2',
        'file:mr-3 file:border-0 file:bg-transparent file:font-bold',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
