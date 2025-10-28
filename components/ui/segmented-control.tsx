import * as React from "react"
import { cn } from "@/lib/utils"

interface SegmentedControlProps {
  options: { value: string; label: string; icon?: React.ReactNode }[]
  value: string
  onChange: (value: string) => void
  className?: string
}

export function SegmentedControl({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 p-1 bg-muted/30 backdrop-blur rounded-xl border-2 border-border/50 shadow-inner",
        className
      )}
    >
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "relative flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap",
            value === option.value
              ? "bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] text-white shadow-lg gremlin-glow"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          {option.icon && (
            <span className={cn(
              "w-4 h-4 transition-all",
              value === option.value && "animate-pulse"
            )}>
              {option.icon}
            </span>
          )}
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  )
}
