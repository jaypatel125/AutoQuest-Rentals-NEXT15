// VehicleManage.logic.test.ts
import {
  updateVehicle,
  replaceVehiclePhoto,
} from "@/app/(admin)/admin/manage-vehicles/[vehicleId]/actions";

// Mock the actions
jest.mock("@/app/(admin)/admin/manage-vehicles/[vehicleId]/actions");

describe("VehicleManage Logic", () => {
  test("updateVehicle should be called with correct data", async () => {
    const mockUpdateVehicle = updateVehicle as jest.MockedFunction<
      typeof updateVehicle
    >;

    const formData = {
      brand: "Toyota",
      model: "Camry",
      branch_id: "1",
      price_per_day: 50,
      carbon_emissions: 120,
      body_type: "Sedan" as const,
      passenger_capacity: 5,
      fuel_type: "Petrol" as const,
      transmission: "Automatic" as const,
      available: true,
      image_url: "/test.jpg",
    };

    await mockUpdateVehicle("1", formData);

    expect(mockUpdateVehicle).toHaveBeenCalledWith("1", formData);
  });

  test("replaceVehiclePhoto should handle file upload", async () => {
    const mockReplaceVehiclePhoto = replaceVehiclePhoto as jest.MockedFunction<
      typeof replaceVehiclePhoto
    >;
    const mockFile = new File(["test"], "test.jpg", { type: "image/jpeg" });

    await mockReplaceVehiclePhoto("1", mockFile, "/old-image.jpg");

    expect(mockReplaceVehiclePhoto).toHaveBeenCalledWith(
      "1",
      mockFile,
      "/old-image.jpg"
    );
  });
});
