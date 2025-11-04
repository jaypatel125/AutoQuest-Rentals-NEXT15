"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  body_type,
  Branches,
  fuel_type,
  passenger_capacity,
  transmission_type,
} from "@/lib/database/table-types";
import Image from "next/image";
import {
  CarWithBranchDetails,
  replaceVehiclePhoto,
  updateVehicle,
} from "@/app/(admin)/admin/manage-vehicles/[vehicleId]/actions";
import { Check, Loader2, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";

type formDataType = {
  brand: string;
  model: string;
  branch_id: string;
  price_per_day: number;
  carbon_emissions: number;
  body_type: body_type;
  passenger_capacity: number;
  fuel_type: fuel_type;
  transmission: transmission_type;
  available: boolean;
  image_url: string;
};

export default function VehicleManage({
  vehicle,
  branches,
}: {
  vehicle: CarWithBranchDetails;
  branches: Branches[];
}) {
  const router = useRouter();
  const params = useParams();
  const vehicleId = params["vehicleId"] as string;
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (formData: formDataType) => updateVehicle(vehicleId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicle", vehicleId] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      router.push("/admin/manage-vehicles");
    },
  });

  const replacePhotoMutation = useMutation({
    mutationFn: (file: File) =>
      replaceVehiclePhoto(vehicleId, file, vehicle.image),
    onSuccess: (data) => {
      setFormData((prev) => ({ ...prev, image_url: data.image }));
      queryClient.invalidateQueries({ queryKey: ["vehicles", vehicleId] });
    },
    onError: (error: unknown) => {
      console.error(error);
    },
  });

  const [formData, setFormData] = useState<formDataType>({
    brand: vehicle.brand,
    model: vehicle.model,
    branch_id: vehicle.branch_id?.toString(),
    price_per_day: vehicle.price_per_day,
    carbon_emissions: vehicle.carbon_emissions,
    body_type: vehicle.body_type as body_type,
    passenger_capacity: vehicle.passenger_capacity,
    fuel_type: vehicle.fuel_type as fuel_type,
    transmission: vehicle.transmission as transmission_type,
    available: vehicle.available,
    image_url: vehicle.image,
  });

  const fuelTypes: fuel_type[] = ["Diesel", "Electric", "Hybrid", "Petrol"];
  const passengerCapacity: passenger_capacity[] = [2, 4, 6, 7, 8];

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
    mutation.mutate({
      ...formData,
      branch_id: formData.branch_id,
      price_per_day: Number(formData.price_per_day),
      passenger_capacity: Number(formData.passenger_capacity),
      carbon_emissions: Number(formData.carbon_emissions),
    });
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Image & Basic Info */}
          <div className="xl:col-span-1 space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Vehicle Image
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                    {" "}
                    <Image
                      src={formData.image_url || "/placeholder-car.png"}
                      alt={formData.model}
                      fill
                      className="object-cover"
                    />{" "}
                  </div>{" "}
                  <Label htmlFor="file" className="text-sm font-medium">
                    Replace Photo
                  </Label>
                  <input
                    id="file"
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    className="text-sm border border-input rounded-md p-2 w-full"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const previewUrl = URL.createObjectURL(file);
                        setFormData((prev) => ({
                          ...prev,
                          image_url: previewUrl,
                        }));
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={replacePhotoMutation.isPending}
                    onClick={() => {
                      const fileInput = document.getElementById(
                        "file"
                      ) as HTMLInputElement;
                      const file = fileInput?.files?.[0];
                      if (!file) return alert("Please select a file first");
                      replacePhotoMutation.mutate(file);
                    }}
                    className="w-full"
                  >
                    {replacePhotoMutation.isPending
                      ? "Replacing..."
                      : "Replace Photo"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-0">
                <CardTitle className="text-lg font-semibold">
                  Availability & Branch
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
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
                          className="text-sm"
                        >
                          {branch.name} - {branch.city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-3">
                  <Switch
                    id="available"
                    checked={formData.available}
                    onCheckedChange={(checked: boolean) =>
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

          {/* Right Column - Specifications */}
          <div className="xl:col-span-2 space-y-6 mb-6">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex w-full gap-4">
                  <div className="space-y-3 w-full">
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
                  <div className="space-y-3 w-full">
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

                <div className="flex w-full gap-4">
                  <div className="space-y-3 w-full">
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
                      placeholder="0.00"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-3 w-full">
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
                      placeholder="0"
                      className="h-9"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <div className="space-y-2">
                  <CardTitle className="text-lg font-semibold">
                    Vehicle Specifications
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Configure the technical details and availability
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Vehicle Class */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Vehicle Class</Label>
                  <RadioGroup
                    value={formData.body_type}
                    onValueChange={(val: string) =>
                      setFormData((prev) => ({
                        ...prev,
                        body_type: val as body_type,
                      }))
                    }
                    className="grid grid-cols-2 md:grid-cols-4 gap-3"
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
                <div className="space-y-4">
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
                    className="grid grid-cols-5 gap-3"
                  >
                    {passengerCapacity.map((capacity) => (
                      <div
                        key={capacity}
                        className="flex items-center space-x-2"
                      >
                        <RadioGroupItem
                          value={capacity.toString()}
                          id={`capacity-${capacity}`}
                          className="h-4 w-4"
                        />
                        <Label
                          htmlFor={`capacity-${capacity}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {capacity} Seats
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <Separator />

                {/* Fuel Type & Transmission */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Fuel Type</Label>
                  <RadioGroup
                    value={formData.fuel_type}
                    onValueChange={(val: string) =>
                      setFormData((prev) => ({
                        ...prev,
                        fuel_type: val as fuel_type,
                      }))
                    }
                    className="grid grid-cols-5 gap-3"
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

                <div className="space-y-4">
                  <Label className="text-sm font-medium">Transmission</Label>
                  <RadioGroup
                    value={formData.transmission}
                    onValueChange={(val: string) =>
                      setFormData((prev) => ({
                        ...prev,
                        transmission: val as transmission_type,
                      }))
                    }
                    className="grid grid-cols-5 gap-3"
                  >
                    {transmissionTypes.map((trans) => (
                      <div key={trans} className="flex items-center space-x-2">
                        <RadioGroupItem
                          value={trans}
                          id={`trans-${trans}`}
                          className="h-4 w-4"
                        />
                        <Label
                          htmlFor={`trans-${trans}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {trans}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}

            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/manage-vehicles")}
                className="sm:w-auto w-full order-2 sm:order-1"
              >
                Cancel
              </Button>
              <div className="flex gap-3 order-1 sm:order-2 sm:w-auto w-full">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    // Add delete functionality here
                    console.log("Delete vehicle", vehicleId);
                  }}
                  className="flex-1 sm:flex-none"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  className="flex-1 sm:flex-none min-w-32"
                >
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Update Vehicle
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
