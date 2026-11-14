import Link from "next/link";
import { ReactNode } from "react";
import { ArrowLeft, CalendarX2, Gift, Leaf } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { CarIllustration } from "@/components/vehicles/CarIllustration";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const POINTS = [
  { icon: Gift, text: "2x reward points on every electric rental" },
  { icon: Leaf, text: "A Green Score and CO₂ estimate for every trip" },
  { icon: CalendarX2, text: "Free cancellation up to 24 hours before pick-up" },
];

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-forest p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="relative">
          <Logo tone="light" />
        </div>
        <div className="relative space-y-8">
          <h2 className="max-w-md font-display text-4xl leading-tight font-extrabold">
            Every trip is a little greener with AutoQuest.
          </h2>
          <ul className="space-y-4">
            {POINTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-white/85">
                <span className="inline-flex size-9 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
                  <Icon className="size-4 text-amber" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative -mb-6 max-w-lg" aria-hidden>
          <CarIllustration bodyType="Coupe" color="#e8a33d" />
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center justify-between p-5 sm:p-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> Back to home
          </Link>
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center px-5 pb-16 sm:px-8">
          <div className="w-full max-w-md animate-fade-up">
            <div className="mb-8 lg:hidden">
              <Logo />
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
