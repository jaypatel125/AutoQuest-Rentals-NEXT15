import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/Logo";
import { CarIllustration } from "@/components/vehicles/CarIllustration";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4 py-16 text-center">
      <Logo />
      <div className="w-64 opacity-90" aria-hidden>
        <CarIllustration bodyType="Hatchback" color="#94a3b8" />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">
          Error 404
        </p>
        <h1 className="text-3xl font-bold md:text-4xl">
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
