import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import {
  IoAddOutline,
  IoClose,
  IoArrowForward,
  IoArrowBack,
  IoSearch,
  IoLogInOutline,
  IoTrash,
  IoCalendarOutline,
  IoPencil,
  IoFilter,
  IoPaperPlaneOutline,
  IoList,
  IoCheckmarkDone,
  IoRefreshOutline,
  IoEyeOutline,
  IoChevronDown,
  IoCloudUploadOutline,
  IoRepeat,
  IoHomeOutline,
} from "react-icons/io5";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  iconType?:
    | "add"
    | "edit"
    | "delete"
    | "search"
    | "close"
    | "down-arrow"
    | "sign-in"
    | "list"
    | "calendar"
    | "right-arrow"
    | "send"
    | "reload"
    | "submit"
    | "reset"
    | "view"
    | "home"
    | "filter"
    | "upload"
    | "left-arrow";
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

  const renderIcon = () => {
    switch (iconType) {
      case "add":
        return <IoAddOutline />;
      case "down-arrow":
        return <IoChevronDown />;
      case "reload":
        return <IoRefreshOutline />;
      case "edit":
        return <IoPencil />;
      case "filter":
        return <IoFilter />;
      case "delete":
        return <IoTrash />;
      case "search":
        return <IoSearch />;
      case "close":
        return <IoClose />;
      case "calendar":
        return <IoCalendarOutline />;
      case "list":
        return <IoList />;
      case "right-arrow":
        return <IoArrowForward />;
      case "left-arrow":
        return <IoArrowBack />;
      case "sign-in":
        return <IoLogInOutline />;
      case "reset":
        return <IoRepeat />;
      case "send":
        return <IoPaperPlaneOutline />;
      case "home":
        return <IoHomeOutline />;
      case "view":
        return <IoEyeOutline />;
      case "upload":
        return <IoCloudUploadOutline />;
      case "submit":
        return <IoCheckmarkDone />;
      default:
        return null;
    }
  };

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="animate-spin" />
          {children}
        </>
      ) : iconType === "right-arrow" || iconType === "down-arrow" ? (
        <>
          {children}
          {renderIcon()}
        </>
      ) : (
        <>
          {renderIcon()}
          {children}
        </>
      )}
    </Comp>
  );
}

export { Button, buttonVariants };
