"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  body_type,
  fuel_type,
  passenger_capacity,
  transmission_type,
} from "@/lib/database/table-types";
import Image from "next/image";
import { createVehicle } from "@/app/(admin)/admin/add-vehicle/actions";
import { Loader2, Check } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { fetchBranches } from "@/app/actions";
import { addVehicleSchema } from "@/lib/zod";
import PageLayout from "@/components/common/page-layout";

export type CarsInput = {
  branch_id: string;
  brand: string;
  model: string;
  transmission: transmission_type;
  fuel_type: fuel_type;
  passenger_capacity: number;
  body_type: body_type;
  carbon_emissions: number;
  price_per_day: number;
  available: boolean;
  image: File | undefined;
  imageUrl: string;
};

export default function AddVehicleForm() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<CarsInput>({
    brand: "",
    model: "",
    branch_id: "",
    price_per_day: 0,
    carbon_emissions: 0,
    body_type: "Sedan",
    passenger_capacity: 4,
    fuel_type: "Petrol",
    transmission: "Automatic",
    available: true,
    image: undefined,
    imageUrl: "",
  });

  const { data: branches = [] } = useQuery({
    queryKey: ["branches"],
    queryFn: fetchBranches,
  });

  const createMutation = useMutation({
    mutationFn: (data: CarsInput) => createVehicle(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      router.push("/admin/manage-vehicles");
    },
  });

  const fuelTypes: fuel_type[] = ["Diesel", "Electric", "Hybrid", "Petrol"];
  const passengerCapacity: passenger_capacity[] = [2, 4, 5, 6, 7, 8];
  const bodyTypes: body_type[] = [
    "Convertible",
    "Coupe",
    "Hatchback",
    "Sedan",
    "Suv",
    "Truck",
    "Van",
  ];
  const transmissionTypes: transmission_type[] = ["Automatic", "Manual"];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = addVehicleSchema.safeParse(formData);

    if (!parsed.success) {
      console.error(parsed.error.flatten().fieldErrors);
      return;
    }

    createMutation.mutate({
      ...formData,
      price_per_day: Number(formData.price_per_day),
      passenger_capacity: Number(formData.passenger_capacity),
      carbon_emissions: Number(formData.carbon_emissions),
    });
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Image */}
          <div className="xl:col-span-1 space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Vehicle Image
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={formData.imageUrl || "/placeholder-car.png"}
                    alt={formData.model || "Vehicle"}
                    fill
                    className="object-cover"
                  />
                </div>

                <Label htmlFor="file" className="text-sm font-medium">
                  Upload Photo
                </Label>
                <Input
                  id="file"
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const previewUrl = URL.createObjectURL(file);
                      setFormData((prev) => ({
                        ...prev,
                        image: file,
                        imageUrl: previewUrl,
                      }));
                    }
                  }}
                />
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Availability & Branch
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Label htmlFor="branch_id" className="text-sm font-medium">
                    Assigned Branch
                  </Label>
                  <Select
                    value={formData.branch_id}
                    onValueChange={(val: string) =>
                      setFormData((prev) => ({ ...prev, branch_id: val }))
                    }
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue
                        placeholder="Select a branch"
                        className="text-sm"
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((branch) => (
                        <SelectItem
                          key={branch.id}
                          value={branch.id.toString()}
                        >
                          {branch.name} - {branch.city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-3 mt-4">
                  <Switch
                    id="available"
                    checked={formData.available}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, available: checked }))
                    }
                  />
                  <Label htmlFor="available" className="text-sm font-medium">
                    Available for Rent
                  </Label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Vehicle Info */}
          <div className="xl:col-span-2 space-y-6 mb-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Vehicle Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-full">
                    <Label htmlFor="brand" className="text-sm font-medium">
                      Brand
                    </Label>
                    <Input
                      id="brand"
                      name="brand"
                      value={formData.brand}
                      onChange={handleChange}
                      placeholder="e.g., Toyota"
                      className="h-9"
                    />
                  </div>
                  <div className="w-full">
                    <Label htmlFor="model" className="text-sm font-medium">
                      Model
                    </Label>
                    <Input
                      id="model"
                      name="model"
                      value={formData.model}
                      onChange={handleChange}
                      placeholder="e.g., Camry"
                      className="h-9"
                    />
                  </div>
                </div>

                <div className="flex gap-4 mt-2">
                  <div className="w-full">
                    <Label
                      htmlFor="price_per_day"
                      className="text-sm font-medium"
                    >
                      Price per Day ($)
                    </Label>
                    <Input
                      id="price_per_day"
                      name="price_per_day"
                      type="number"
                      value={formData.price_per_day}
                      onChange={handleChange}
                      className="h-9"
                    />
                  </div>
                  <div className="w-full">
                    <Label
                      htmlFor="carbon_emissions"
                      className="text-sm font-medium"
                    >
                      Carbon Emissions (g/km)
                    </Label>
                    <Input
                      id="carbon_emissions"
                      name="carbon_emissions"
                      type="number"
                      value={formData.carbon_emissions}
                      onChange={handleChange}
                      className="h-9"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Specifications */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Specifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Body Type */}
                <div>
                  <Label className="text-sm font-medium">Vehicle Class</Label>
                  <RadioGroup
                    value={formData.body_type}
                    onValueChange={(val: string) =>
                      setFormData((prev) => ({
                        ...prev,
                        body_type: val as body_type,
                      }))
                    }
                    className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2"
                  >
                    {bodyTypes.map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <RadioGroupItem
                          value={type}
                          id={`class-${type}`}
                          className="h-4 w-4"
                        />
                        <Label
                          htmlFor={`class-${type}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {type}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <Separator />

                {/* Passenger Capacity */}
                <div>
                  <Label className="text-sm font-medium">
                    Passenger Capacity
                  </Label>
                  <RadioGroup
                    value={formData.passenger_capacity.toString()}
                    onValueChange={(val: string) =>
                      setFormData((prev) => ({
                        ...prev,
                        passenger_capacity: Number(val),
                      }))
                    }
                    className="grid grid-cols-5 gap-3 mt-2"
                  >
                    {passengerCapacity.map((cap) => (
                      <div key={cap} className="flex items-center space-x-2">
                        <RadioGroupItem
                          value={cap.toString()}
                          id={`cap-${cap}`}
                          className="h-4 w-4"
                        />
                        <Label
                          htmlFor={`cap-${cap}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {cap} Seats
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <Separator />

                {/* Fuel Type */}
                <div>
                  <Label className="text-sm font-medium">Fuel Type</Label>
                  <RadioGroup
                    value={formData.fuel_type}
                    onValueChange={(val: string) =>
                      setFormData((prev) => ({
                        ...prev,
                        fuel_type: val as fuel_type,
                      }))
                    }
                    className="grid grid-cols-5 gap-3 mt-2"
                  >
                    {fuelTypes.map((fuel) => (
                      <div key={fuel} className="flex items-center space-x-2">
                        <RadioGroupItem
                          value={fuel}
                          id={`fuel-${fuel}`}
                          className="h-4 w-4"
                        />
                        <Label
                          htmlFor={`fuel-${fuel}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {fuel}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <Separator />

                {/* Transmission */}
                <div>
                  <Label className="text-sm font-medium">Transmission</Label>
                  <RadioGroup
                    value={formData.transmission}
                    onValueChange={(val: string) =>
                      setFormData((prev) => ({
                        ...prev,
                        transmission: val as transmission_type,
                      }))
                    }
                    className="grid grid-cols-5 gap-3 mt-2"
                  >
                    {transmissionTypes.map((t) => (
                      <div key={t} className="flex items-center space-x-2">
                        <RadioGroupItem
                          value={t}
                          id={`trans-${t}`}
                          className="h-4 w-4"
                        />
                        <Label
                          htmlFor={`trans-${t}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {t}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex justify-end gap-3 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/manage-vehicles")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Add Vehicle
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>{" "}
    </div>
  );
}
