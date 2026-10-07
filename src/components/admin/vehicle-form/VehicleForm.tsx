"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2, TriangleAlert } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VehicleImage } from "@/components/vehicles/VehicleImage";
import { GreenScoreBadge } from "@/components/vehicles/badges";
import { Branches } from "@/lib/database/table-types";
import { vehicleSchema } from "@/lib/zod";
import {
  BODY_TYPES,
  FUEL_TYPES,
  SEAT_OPTIONS,
  TRANSMISSIONS,
  bodyTypeLabel,
} from "@/lib/vehicles";
import { cn } from "@/lib/utils";

export interface VehicleFormValues {
  brand: string;
  model: string;
  branch_id: string;
  price_per_day: number | string;
  carbon_emissions: number | string;
  body_type: string;
  passenger_capacity: number;
  fuel_type: string;
  transmission: string;
  available: boolean;
}

type FieldErrors = Partial<Record<keyof VehicleFormValues, string>>;

const ACCEPT = "image/png,image/jpeg,image/webp";

function ChipGroup<T extends string | number>({
  label,
  options,
  value,
  onChange,
  format = (v) => String(v),
}: {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  format?: (value: T) => string;
}) {
  return (
    <fieldset className="space-y-2.5">
      <legend className="text-sm font-medium">{label}</legend>
      <div
        className="flex flex-wrap gap-2"
        role="radiogroup"
        aria-label={label}
      >
        {options.map((option) => {
          const selected = option === value;
          return (
            <button
              key={String(option)}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(option)}
              className={cn(
                "cursor-pointer rounded-xl border px-3.5 py-2 text-sm font-medium transition-colors",
                selected
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "bg-card hover:border-primary/40 hover:bg-accent"
              )}
            >
              {format(option)}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function VehicleForm({
  mode,
  initial,
  initialImage,
  branches,
  submitting,
  submitLabel,
  onSubmit,
  onCancel,
  onReplacePhoto,
  onRemovePhoto,
  photoBusy,
}: {
  mode: "create" | "edit";
  initial?: Partial<VehicleFormValues>;
  initialImage?: string | null;
  branches: Branches[];
  submitting: boolean;
  submitLabel: string;
  onSubmit: (values: VehicleFormValues, file: File | null) => void;
  onCancel: () => void;
  /** Edit mode: upload immediately and return the new URL. */
  onReplacePhoto?: (file: File) => Promise<string | void>;
  onRemovePhoto?: () => Promise<void>;
  photoBusy?: boolean;
}) {
  const [values, setValues] = useState<VehicleFormValues>({
    brand: "",
    model: "",
    branch_id: "",
    price_per_day: "",
    carbon_emissions: "",
    body_type: "Sedan",
    passenger_capacity: 5,
    fuel_type: "Petrol",
    transmission: "Automatic",
    available: true,
    ...initial,
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(initialImage ?? null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview]
  );

  const set = <K extends keyof VehicleFormValues>(
    key: K,
    value: VehicleFormValues[K]
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const legacyPhoto = !!image && /amazonaws\.com/i.test(image) && !preview;

  const pickFile = async (picked?: File) => {
    if (!picked) return;
    const url = URL.createObjectURL(picked);
    setPreview(url);
    if (mode === "edit" && onReplacePhoto) {
      const newUrl = await onReplacePhoto(picked).catch(() => undefined);
      if (newUrl) setImage(newUrl);
      else setPreview(null);
    } else {
      setFile(picked);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = vehicleSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >;
      setErrors(
        Object.fromEntries(
          Object.entries(fieldErrors).map(([k, v]) => [k, v?.[0]])
        ) as FieldErrors
      );
      return;
    }
    onSubmit(
      {
        ...values,
        price_per_day: Number(values.price_per_day),
        carbon_emissions: Number(values.carbon_emissions),
      },
      file
    );
  };

  const fieldError = (key: keyof VehicleFormValues) =>
    errors[key] ? (
      <p className="text-sm text-destructive">{errors[key]}</p>
    ) : null;

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-6 xl:grid-cols-[360px_1fr]"
      noValidate
    >
      <div className="space-y-6">
        <section className="space-y-4 rounded-2xl border bg-card p-5">
          <h3 className="font-semibold">Vehicle photo</h3>
          <div className="relative overflow-hidden rounded-xl border">
            <VehicleImage
              src={preview ?? image}
              brand={values.brand}
              model={values.model}
              bodyType={values.body_type}
            />
            {photoBusy && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
                <Loader2 className="size-6 animate-spin text-primary" />
              </div>
            )}
          </div>
          {legacyPhoto && (
            <p className="flex gap-2 rounded-xl bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-200">
              <TriangleAlert className="size-4 shrink-0" />
              This photo was stored in the old S3 bucket and no longer loads.
              Upload a new one (it&apos;s stored for free in your database).
            </p>
          )}
          {!image && !preview && (
            <p className="text-xs text-muted-foreground">
              No photo yet. Customers will see an illustration of a{" "}
              {bodyTypeLabel(values.body_type)}.
            </p>
          )}
          <input
            ref={fileInput}
            id="file"
            type="file"
            accept={ACCEPT}
            className="sr-only"
            onChange={(e) => {
              pickFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              disabled={photoBusy}
              onClick={() => fileInput.current?.click()}
            >
              <ImagePlus />{" "}
              {image || preview ? "Replace photo" : "Upload photo"}
            </Button>
            {mode === "edit" && image && onRemovePhoto && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Remove photo"
                disabled={photoBusy}
                onClick={async () => {
                  await onRemovePhoto();
                  setImage(null);
                  setPreview(null);
                }}
              >
                <Trash2 />
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            PNG, JPEG, or WebP. Photos are resized before upload.
          </p>
        </section>

        <section className="space-y-4 rounded-2xl border bg-card p-5">
          <h3 className="font-semibold">Availability & branch</h3>
          <div className="space-y-2">
            <Label htmlFor="branch_id">Assigned Branch</Label>
            <Select
              value={values.branch_id}
              onValueChange={(v) => set("branch_id", v)}
            >
              <SelectTrigger
                id="branch_id"
                className="w-full"
                aria-invalid={!!errors.branch_id}
              >
                <SelectValue placeholder="Select a branch" />
              </SelectTrigger>
              <SelectContent>
                {branches.map((branch) => (
                  <SelectItem key={branch.id} value={String(branch.id)}>
                    {branch.name} - {branch.city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldError("branch_id")}
          </div>
          <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl bg-muted/60 p-3">
            <span>
              <span className="block text-sm font-medium">
                Available for Rent
              </span>
              <span className="text-xs text-muted-foreground">
                Hidden from search when off.
              </span>
            </span>
            <Switch
              id="available"
              checked={values.available}
              onCheckedChange={(checked) => set("available", checked)}
            />
          </label>
        </section>
      </div>

      <div className="space-y-6">
        <section className="grid gap-4 rounded-2xl border bg-card p-5 sm:grid-cols-2">
          <h3 className="font-semibold sm:col-span-2">Vehicle details</h3>
          <div className="space-y-2">
            <Label htmlFor="brand">Brand</Label>
            <Input
              id="brand"
              value={values.brand}
              onChange={(e) => set("brand", e.target.value)}
              placeholder="e.g., Toyota"
              aria-invalid={!!errors.brand}
            />
            {fieldError("brand")}
          </div>
          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Input
              id="model"
              value={values.model}
              onChange={(e) => set("model", e.target.value)}
              placeholder="e.g., Camry"
              aria-invalid={!!errors.model}
            />
            {fieldError("model")}
          </div>
          <div className="space-y-2">
            <Label htmlFor="price_per_day">Price per Day ($)</Label>
            <Input
              id="price_per_day"
              type="number"
              inputMode="decimal"
              min={1}
              step="0.01"
              value={values.price_per_day}
              onChange={(e) => set("price_per_day", e.target.value)}
              placeholder="0.00"
              aria-invalid={!!errors.price_per_day}
            />
            {fieldError("price_per_day")}
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="carbon_emissions"
              className="flex items-center justify-between"
            >
              Carbon Emissions (g/km)
              {values.carbon_emissions !== "" && (
                <GreenScoreBadge emissions={values.carbon_emissions} />
              )}
            </Label>
            <Input
              id="carbon_emissions"
              type="number"
              inputMode="numeric"
              min={0}
              value={values.carbon_emissions}
              onChange={(e) => set("carbon_emissions", e.target.value)}
              placeholder="0"
              aria-invalid={!!errors.carbon_emissions}
            />
            {fieldError("carbon_emissions")}
          </div>
        </section>

        <section className="space-y-6 rounded-2xl border bg-card p-5">
          <h3 className="font-semibold">Specifications</h3>
          <ChipGroup
            label="Vehicle Class"
            options={BODY_TYPES}
            value={values.body_type as (typeof BODY_TYPES)[number]}
            onChange={(v) => set("body_type", v)}
            format={(v) => bodyTypeLabel(v)}
          />
          <ChipGroup
            label="Fuel Type"
            options={FUEL_TYPES}
            value={values.fuel_type as (typeof FUEL_TYPES)[number]}
            onChange={(v) => {
              set("fuel_type", v);
              // Electric cars have no tailpipe emissions.
              if (v === "Electric") set("carbon_emissions", 0);
            }}
          />
          <ChipGroup
            label="Passenger Capacity"
            options={SEAT_OPTIONS}
            value={values.passenger_capacity as (typeof SEAT_OPTIONS)[number]}
            onChange={(v) => set("passenger_capacity", v)}
            format={(v) => `${v} seats`}
          />
          <ChipGroup
            label="Transmission"
            options={TRANSMISSIONS}
            value={values.transmission as (typeof TRANSMISSIONS)[number]}
            onChange={(v) => set("transmission", v)}
          />
        </section>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            iconType="close"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            loading={submitting}
            iconType="submit"
          >
            {submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}
