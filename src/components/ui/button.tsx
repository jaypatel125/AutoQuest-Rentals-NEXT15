import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  ChevronDown,
  Eye,
  Filter,
  Home,
  List,
  Loader2,
  LogIn,
  Pencil,
  Plus,
  RefreshCw,
  Repeat,
  Search,
  Send,
  Trash2,
  Upload,
  UserRound,
  X,
} from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap rounded-xl text-sm font-semibold transition-all active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "border border-input bg-card shadow-xs hover:bg-accent hover:text-accent-foreground hover:border-primary/30",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        soft: "bg-accent text-accent-foreground hover:bg-accent/80",
        ink: "bg-ink text-ink-foreground hover:bg-ink/90 dark:bg-white dark:text-slate-900 dark:hover:bg-white/90",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2 has-[>svg]:px-3.5",
        sm: "h-8 rounded-lg gap-1.5 px-3 text-[13px] has-[>svg]:px-2.5",
        lg: "h-11 px-6 has-[>svg]:px-5",
        xl: "h-12 rounded-full px-7 text-base has-[>svg]:px-6",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const ICONS = {
  add: Plus,
  edit: Pencil,
  delete: Trash2,
  search: Search,
  close: X,
  "down-arrow": ChevronDown,
  "sign-in": LogIn,
  list: List,
  calendar: Calendar,
  "right-arrow": ArrowRight,
  "left-arrow": ArrowLeft,
  send: Send,
  reload: RefreshCw,
  profile: UserRound,
  submit: Check,
  reset: Repeat,
  view: Eye,
  home: Home,
  filter: Filter,
  upload: Upload,
} as const;

interface ButtonProps
  extends React.ComponentProps<"button">, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  iconType?: keyof typeof ICONS;
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  iconType,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  const Icon = iconType ? ICONS[iconType] : null;
  const trailing = iconType === "right-arrow" || iconType === "down-arrow";

  if (asChild) {
    return (
      <Comp
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {children}
      </Comp>
    );
  }

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="animate-spin" />
          {children}
        </>
      ) : trailing ? (
        <>
          {children}
          {Icon && <Icon />}
        </>
      ) : (
        <>
          {Icon && <Icon />}
          {children}
        </>
      )}
    </Comp>
  );
}

export { Button, buttonVariants };
