'use client';

import * as React from 'react';
import { Label as LabelPrimitive } from 'radix-ui';
import { cn } from '@/lib/utils';

/** Feldbeschriftung: 16 px fett (design/BaseComponents.dc.html). Placeholder ist nie Beschriftung. */
function Label({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return <LabelPrimitive.Root data-slot="label" className={cn('text-16 leading-normal font-bold text-tinte', className)} {...props} />;
}

export { Label };
