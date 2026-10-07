import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/Logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col px-5 sm:px-8">
      <div className="flex h-16 items-center">
        <Logo />
      </div>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 pb-24">
        <p className="text-sm text-muted-foreground">404</p>
        <h1 className="text-3xl font-semibold">
          This road doesn&apos;t go anywhere
        </h1>
        <p className="text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/">Back to Home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/select-vehicle">Browse cars</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
