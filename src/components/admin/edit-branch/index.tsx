"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Loader from "@/components/utility/Loader";
import {
  deleteBranch,
  getBranchById,
  updateBranch,
} from "@/app/(admin)/admin/manage-branches/[branchId]/actions";
import {
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Select,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import Error from "@/components/utility/Error";

const provinces = [
  "Alberta",
  "British Columbia",
  "Manitoba",
  "New Brunswick",
  "Newfoundland and Labrador",
  "Nova Scotia",
  "Ontario",
  "Prince Edward Island",
  "Quebec",
  "Saskatchewan",
];

export default function EditBranchPage() {
  const { branchId } = useParams<{ branchId: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: branch,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["branch", branchId],
    queryFn: () => getBranchById(branchId),
    enabled: !!branchId,
  });

  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "",
    province: "",
    postal_code: "",
  });

  useEffect(() => {
    if (branch) {
      setForm({
        name: branch.name || "",
        address: branch.address || "",
        city: branch.city || "",
        province: branch.province || "",
        postal_code: branch.postal_code || "",
      });
    }
  }, [branch]);

  const mutation = useMutation({
    mutationFn: (updated: typeof form) => updateBranch(branchId, updated),
    onSuccess: () => {
      toast({
        title: "Branch Updated",
        description: "The branch details have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["branch", branchId] });
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      router.push("/admin/manage-branches");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (branchId: string) => deleteBranch(branchId),
    onSuccess: () => {
      toast({
        title: "Branch Deleted",
        description: "The branch has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      router.push("/admin/manage-branches");
    },
  });

  if (isLoading) {
    return <Loader title="Loading branch details" />;
  }

  if (isError) {
    return <Error error="Failed to load branch details. Please try again." />;
  }

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

        {/* Province (Select dropdown) */}
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
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t border-gray-200">
        <div className="flex gap-3 w-full sm:w-auto">
          <Button
            iconType="view"
            variant="outline"
            onClick={() =>
              router.push(`/admin/manage-vehicles?branchId=${branchId}`)
            }
          >
            View Vehicles
          </Button>
          <Button
            variant="destructive"
            onClick={() => deleteMutation.mutate(branchId)}
            iconType="delete"
          >
            Delete Branch
          </Button>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            iconType="reset"
            onClick={() =>
              branch &&
              setForm({
                name: branch.name || "",
                address: branch.address || "",
                city: branch.city || "",
                province: branch.province || "",
                postal_code: branch.postal_code || "",
              })
            }
            className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200"
          >
            Reset
          </Button>

          <Button
            onClick={() => mutation.mutate(form)}
            disabled={mutation.isPending}
            loading={mutation.isPending}
            iconType="submit"
          >
            {mutation.isPending ? "Updating..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Status Feedback */}
      {mutation.isError && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm font-medium">
            Error updating branch. Please try again.
          </p>
        </div>
      )}
    </div>
  );
}
