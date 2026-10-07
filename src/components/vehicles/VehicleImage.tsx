"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { resolveVehicleImage } from "@/lib/vehicle-image";
import { CarIllustration } from "./CarIllustration";

/**
 * Shows the vehicle's photo, or a matching illustration when there is no
 * photo, the photo was in the retired S3 bucket, or it fails to load.
 */
export function VehicleImage({
  src,
  brand,
  model,
  bodyType,
  className,
  fit = "cover",
  priority,
  sizes = "(max-width: 768px) 100vw, 33vw",
}: {
  src?: string | null;
  brand?: string;
  model?: string;
  bodyType?: string | null;
  className?: string;
  fit?: "cover" | "contain";
  priority?: boolean;
  sizes?: string;
}) {
  const resolved = resolveVehicleImage(src);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showPhoto = !!resolved && failedSrc !== resolved;
  const name = [brand, model].filter(Boolean).join(" ") || "Vehicle";

  return (
    <div
      className={cn(
        "relative aspect-[16/10] w-full overflow-hidden bg-muted",
        className
      )}
    >
      {showPhoto ? (
        <Image
          key={resolved}
          src={resolved}
          alt={name}
          fill
          unoptimized
          priority={priority}
          sizes={sizes}
          className={cn(
            fit === "cover" ? "object-cover" : "object-contain p-4"
          )}
          onError={() => setFailedSrc(resolved)}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center px-[14%] pt-[3%] text-foreground/60">
          <CarIllustration
            bodyType={bodyType}
            title={`${name} illustration`}
            className="max-h-full"
          />
        </div>
      )}
    </div>
  );
}
