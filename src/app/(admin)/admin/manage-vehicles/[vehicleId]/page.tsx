"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchVehicle, updateVehicle } from "./actions";
import Loader from "@/components/utility/Loader";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  body_type,
  fuel_type,
  transmission_type,
} from "@/lib/database/table-types";
import Image from "next/image";

export default function EditVehiclePage() {
  const router = useRouter();
  const params = useParams();
  const vehicleId = params["vehicle-id"] as string;
  const queryClient = useQueryClient();

  const {
    data: vehicle,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["vehicle", vehicleId],
    queryFn: () => fetchVehicle(vehicleId),
    enabled: !!vehicleId,
  });

  const mutation = useMutation({
    mutationFn: (formData: any) => updateVehicle(vehicleId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicle", vehicleId] });
      router.push("/admin/manage-vehicles");
    },
  });

  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    branch_id: "",
    price_per_day: "",
    carbon_emissions: "",
    vehicle_class: "" as body_type,
    passenger_capacity: 0,
    fuel_type: "" as fuel_type,
    transmission: "" as transmission_type,
    available: false,
    image_url: "",
  });

  // Initialize form data when vehicle data is fetched
  useEffect(() => {
    if (vehicle) {
      setFormData({
        brand: vehicle.brand || "",
        model: vehicle.model || "",
        branch_id: vehicle.branch_id?.toString() || "",
        price_per_day: vehicle.price_per_day?.toString() || "",
        carbon_emissions: vehicle.carbon_emissions?.toString() || "",
        vehicle_class: vehicle.vehicle_class || "Sedan",
        passenger_capacity: vehicle.passenger_capacity || 4,
        fuel_type: vehicle.fuel_type || "Petrol",
        transmission: vehicle.transmission || "Automatic",
        available: vehicle.available || false,
        image_url: vehicle.image_url || "/placeholder-car.png",
      });
    }
  }, [vehicle]);

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
      branch_id: Number(formData.branch_id),
      price_per_day: Number(formData.price_per_day),
      passenger_capacity: Number(formData.passenger_capacity),
      carbon_emissions: Number(formData.carbon_emissions),
    });
  };

  if (isLoading)
    return (
      <div className="w-full h-[80vh] flex items-center justify-center">
        <Loader />
      </div>
    );

  if (isError)
    return (
      <div className="w-full h-[80vh] flex items-center justify-center text-red-500">
        Something went wrong. Please try again.
      </div>
    );

  return (
    <div className="space-y-6 ">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Vehicle</h1>
          <p className="text-muted-foreground">
            Update vehicle details and specifications
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push("/admin/manage-vehicles")}
        >
          Back to Vehicles
        </Button>
      </div>

      <Separator />

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Image & Basic Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-4">
                  <Image
                    src={formData.image_url || "/placeholder-car.png"}
                    alt={`${formData.brand} ${formData.model}`}
                    width={400}
                    height={250}
                    className="w-full h-48 object-cover rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image_url">Image URL</Label>
                  <Input
                    id="image_url"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    placeholder="e.g., Toyota"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    placeholder="e.g., Camry"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price_per_day">Price per Day ($)</Label>
                  <Input
                    id="price_per_day"
                    name="price_per_day"
                    type="number"
                    value={formData.price_per_day}
                    onChange={handleChange}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="carbon_emissions">
                    Carbon Emissions (g/km)
                  </Label>
                  <Input
                    id="carbon_emissions"
                    name="carbon_emissions"
                    type="number"
                    value={formData.carbon_emissions}
                    onChange={handleChange}
                    placeholder="0"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Specifications */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Specifications</CardTitle>
                <CardDescription>
                  Configure the technical details and availability
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>Vehicle Class</Label>
                  <RadioGroup
                    value={formData.vehicle_class}
                    onValueChange={(val: string) =>
                      setFormData((prev) => ({
                        ...prev,
                        vehicle_class: val as body_type,
                      }))
                    }
                    className="grid grid-cols-2 md:grid-cols-4 gap-2"
                  >
                    {bodyt.map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <RadioGroupItem
                          value={type}
                          id={`class-${type}`}
                          checked={formData.vehicle_class === type}
                        />
                        <Label
                          htmlFor={`class-${type}`}
                          className="text-sm cursor-pointer"
                        >
                          {type}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label>Passenger Capacity</Label>
                  <RadioGroup
                    value={formData.passenger_capacity.toString()}
                    onValueChange={(val: string) =>
                      setFormData((prev) => ({
                        ...prev,
                        passenger_capacity: Number(val),
                      }))
                    }
                    className="grid grid-cols-4 gap-2"
                  >
                    {[2, 4, 6, 8].map((capacity) => (
                      <div
                        key={capacity}
                        className="flex items-center space-x-2"
                      >
                        <RadioGroupItem
                          value={capacity.toString()}
                          id={`capacity-${capacity}`}
                          checked={formData.passenger_capacity === capacity}
                        />
                        <Label
                          htmlFor={`capacity-${capacity}`}
                          className="text-sm cursor-pointer"
                        >
                          {capacity} {capacity === 1 ? "Person" : "People"}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Label>Fuel Type</Label>
                    <RadioGroup
                      value={formData.fuel_type}
                      onValueChange={(val: string) =>
                        setFormData((prev) => ({
                          ...prev,
                          fuel_type: val as fuel_type,
                        }))
                      }
                      className="space-y-2"
                    >
                      {["Diesel", "Electric", "Hybrid", "Petrol"].map(
                        (fuel) => (
                          <div
                            key={fuel}
                            className="flex items-center space-x-2"
                          >
                            <RadioGroupItem
                              value={fuel}
                              id={`fuel-${fuel}`}
                              checked={formData.fuel_type === fuel}
                            />
                            <Label
                              htmlFor={`fuel-${fuel}`}
                              className="text-sm cursor-pointer"
                            >
                              {fuel}
                            </Label>
                          </div>
                        )
                      )}
                    </RadioGroup>
                  </div>

                  <div className="space-y-4">
                    <Label>Transmission</Label>
                    <RadioGroup
                      value={formData.transmission}
                      onValueChange={(val: string) =>
                        setFormData((prev) => ({
                          ...prev,
                          transmission: val as transmission_type,
                        }))
                      }
                      className="space-y-2"
                    >
                      {["Automatic", "Manual"].map((trans) => (
                        <div
                          key={trans}
                          className="flex items-center space-x-2"
                        >
                          <RadioGroupItem
                            value={trans}
                            id={`trans-${trans}`}
                            checked={formData.transmission === trans}
                          />
                          <Label
                            htmlFor={`trans-${trans}`}
                            className="text-sm cursor-pointer"
                          >
                            {trans}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="branch_id">Registration Branch</Label>
                    <Select
                      value={formData.branch_id}
                      onValueChange={(val) =>
                        setFormData((prev) => ({ ...prev, branch_id: val }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Branch">
                          {formData.branch_id === "1"
                            ? "Hamilton, Ontario"
                            : formData.branch_id === "2"
                            ? "Toronto, Ontario"
                            : "Select Branch"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Hamilton, Ontario</SelectItem>
                        <SelectItem value="2">Toronto, Ontario</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2 pt-8">
                    <Checkbox
                      id="available"
                      checked={formData.available}
                      onCheckedChange={(val) =>
                        setFormData((prev) => ({
                          ...prev,
                          available: val as boolean,
                        }))
                      }
                    />
                    <Label htmlFor="available" className="cursor-pointer">
                      Available for rental
                    </Label>
                    <Badge
                      variant={formData.available ? "default" : "secondary"}
                      className="ml-2"
                    >
                      {formData.available ? "Available" : "Unavailable"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-4 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/admin/manage-vehicles")}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => {
                      // Add delete functionality here
                      console.log("Delete vehicle", vehicleId);
                    }}
                  >
                    Delete Vehicle
                  </Button>
                  <Button
                    type="submit"
                    disabled={mutation.isPending}
                    className="min-w-32"
                  >
                    {mutation.isPending ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Vehicle"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
