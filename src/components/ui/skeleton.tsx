import React, { memo } from 'react';
import { cn } from "@/lib/utils"

const Skeleton = memo(({ 
  className, 
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn("skeleton loading-shimmer", className)}
      {...props}
    />
  )
});

Skeleton.displayName = "Skeleton";

export { Skeleton };
