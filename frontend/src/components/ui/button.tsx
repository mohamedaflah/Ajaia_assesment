import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer border-2",
  {
    variants: {
      variant: {
        default:
          "bg-indigo-600 text-white border-slate-900 shadow-[3px_3px_0_#0f172a] hover:shadow-[4px_4px_0_#0f172a] hover:translate-x-[-1px] hover:translate-y-[-1px] active:shadow-[1px_1px_0_#0f172a] active:translate-x-[1px] active:translate-y-[1px]",
        secondary:
          "bg-indigo-50 text-indigo-700 border-indigo-300 hover:bg-indigo-100 hover:border-indigo-400",
        outline:
          "bg-white text-slate-800 border-slate-300 hover:border-slate-900 hover:shadow-[3px_3px_0_#0f172a] hover:translate-x-[-1px] hover:translate-y-[-1px]",
        ghost:
          "text-slate-600 border-transparent hover:bg-slate-100 hover:text-slate-900",
        destructive:
          "bg-red-500 text-white border-slate-900 shadow-[3px_3px_0_#0f172a] hover:shadow-[4px_4px_0_#0f172a] hover:translate-x-[-1px] hover:translate-y-[-1px] active:shadow-[1px_1px_0_#0f172a] active:translate-x-[1px] active:translate-y-[1px]",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-10 px-6",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
