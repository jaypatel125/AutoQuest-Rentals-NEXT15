"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { addBranch } from "@/app/(admin)/admin/add-branch/actions";
import { useToast } from "@/hooks/use-toast";

const provinces = [
  "Ontario",
  "Quebec",
  "British Columbia",
  "Alberta",
  "Manitoba",
  "Saskatchewan",
  "Nova Scotia",
  "New Brunswick",
  "Newfoundland and Labrador",
  "Prince Edward Island",
  "Northwest Territories",
  "Yukon",
  "Nunavut",
];

export default function AddBranchPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "",
    province: "",
    postal_code: "",
  });

  const mutation = useMutation({
    mutationFn: addBranch,
    onSuccess: () => {
      toast({
        title: "Branch Added",
        description: "The new branch has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      router.push("/admin/manage-branches");
    },
  });

  return (
    <div className="space-y-10">
      {/* Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div className="flex flex-col space-y-1">
          <label className="text-sm font-semibold text-gray-700">Name</label>
          <Input
            value={form.name}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="Enter branch name"
          />
        </div>

        {/* Address */}
        <div className="flex flex-col space-y-1">
          <label className="text-sm font-semibold text-gray-700">Address</label>
          <Input
            value={form.address}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, address: e.target.value }))
            }
            placeholder="Enter address"
          />
        </div>

        {/* City */}
        <div className="flex flex-col space-y-1">
          <label className="text-sm font-semibold text-gray-700">City</label>
          <Input
            value={form.city}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, city: e.target.value }))
            }
            placeholder="Enter city"
          />
        </div>

        {/* Province */}
        <div className="flex flex-col space-y-1">
          <label className="text-sm font-semibold text-gray-700">
            Province
          </label>
          <Select
            value={form.province}
            onValueChange={(value) =>
              setForm((prev) => ({ ...prev, province: value }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select province" />
            </SelectTrigger>
            <SelectContent>
              {provinces.map((province) => (
                <SelectItem key={province} value={province}>
                  {province}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Postal Code */}
        <div className="flex flex-col space-y-1">
          <label className="text-sm font-semibold text-gray-700">
            Postal Code
          </label>
          <Input
            value={form.postal_code}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, postal_code: e.target.value }))
            }
            placeholder="Enter postal code"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-8 border-t border-gray-200">
        <Button
          variant="outline"
          onClick={() => router.push("/admin/manage-branches")}
          iconType="close"
          className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200"
        >
          Cancel
        </Button>

        <Button
          onClick={() => mutation.mutate(form)}
          disabled={mutation.isPending}
          loading={mutation.isPending}
          iconType="add"
        >
          {mutation.isPending ? "Adding..." : "Add Branch"}
        </Button>
      </div>

      {mutation.isError && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm font-medium">
            Error adding branch. Please try again.
          </p>
        </div>
      )}
    </div>
  );
}
