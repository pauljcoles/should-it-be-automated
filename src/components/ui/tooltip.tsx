/**
 * Tooltip UI Component
 * Simple tooltip implementation for displaying contextual help
 */

import * as React from "react"
import { cn } from "@/lib/utils"

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

export function Tooltip({ content, children, side = 'top', className }: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false);

  const sideClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2'
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && (
        <div
          className={cn(
            "absolute z-50 px-3 py-2 text-sm font-medium text-black bg-white border-brutal shadow-brutal-lg whitespace-normal max-w-xs",
            sideClasses[side],
            className
          )}
          role="tooltip"
        >
          {content}
          {/* Arrow */}
          <div
            className={cn(
              "absolute w-2 h-2 bg-white border-black",
              side === 'top' && "bottom-[-5px] left-1/2 -translate-x-1/2 border-b-2 border-r-2 rotate-45",
              side === 'right' && "left-[-5px] top-1/2 -translate-y-1/2 border-l-2 border-b-2 rotate-45",
              side === 'bottom' && "top-[-5px] left-1/2 -translate-x-1/2 border-t-2 border-l-2 rotate-45",
              side === 'left' && "right-[-5px] top-1/2 -translate-y-1/2 border-r-2 border-t-2 rotate-45"
            )}
          />
        </div>
      )}
    </div>
  );
}
