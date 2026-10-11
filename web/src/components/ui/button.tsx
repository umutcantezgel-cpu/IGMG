import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import { cn } from '@/lib/utils';

/**
 * Schaltflächen nach design/BaseComponents.dc.html (02 Komponenten): mindestens 48 px hoch, Radius 8,
 * 18 px fett. Primär Grün 700 (Hover 800), Sekundär weiß mit 2 px grünem Rand, Tertiär ohne Rand,
 * Löschen Fehlerrot, deaktiviert gestrichelt auf Sand. Fokus global (2 px Tiefgrün, 2 px Abstand).
 */
const buttonVariants = cva(
  'inline-flex min-h-12 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md px-6 text-18 leading-tight font-bold whitespace-nowrap no-underline transition-colors disabled:cursor-not-allowed disabled:border disabled:border-dashed disabled:border-rand disabled:bg-sand disabled:text-tinte-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-5',
  {
    variants: {
      variant: {
        default: 'bg-gruen-700 text-weiss hover:bg-gruen-800 hover:text-weiss',
        secondary: 'border-2 border-gruen-700 bg-weiss px-[22px] text-gruen-800 hover:bg-gruen-50 hover:text-gruen-800',
        outline: 'border border-rand bg-weiss px-4 text-tinte hover:bg-gruen-50 hover:text-tinte',
        ghost: 'bg-transparent px-[18px] text-tinte hover:bg-gruen-50 hover:text-tinte',
        destructive: 'bg-fehler px-[22px] text-weiss hover:bg-fehler/90 hover:text-weiss',
        link: 'min-h-11 px-0 text-gruen-700 underline underline-offset-4 hover:text-gruen-800',
        aufDunkel: 'bg-weiss px-[22px] text-gruen-950 hover:bg-gruen-100 hover:text-gruen-950',
      },
      size: {
        default: '',
        sm: 'min-h-11 px-4 text-16',
        lg: 'min-h-14 px-8 text-20',
        icon: 'size-12 min-h-12 px-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : 'button';
  return <Comp data-slot="button" data-variant={variant} data-size={size} className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
