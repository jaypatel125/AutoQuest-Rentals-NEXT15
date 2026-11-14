import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/Logo";
import { CarIllustration } from "@/components/vehicles/CarIllustration";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-hero px-4 py-16 text-center">
      <Logo />
      <div className="w-72 rounded-3xl bg-studio px-6 pt-6 pb-2" aria-hidden>
        <CarIllustration bodyType="Hatchback" color="#d9d4c7" />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-semibold tracking-wider text-primary uppercase">
          Error 404
        </p>
        <h1 className="font-display text-3xl font-bold md:text-4xl">
          This road doesn&apos;t go anywhere
        </h1>
        <p className="mx-auto max-w-md text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/">Back to Home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/select-vehicle">
            <Compass /> Browse cars
          </Link>
        </Button>
      </div>
    </div>
  );
}
