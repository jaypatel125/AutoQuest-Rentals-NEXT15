/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  replaceVehiclePhoto,
  updateVehicle,
} from "@/app/(admin)/admin/manage-vehicles/[vehicleId]/actions";
import { jsonResponse } from "@/test-utils";

jest.mock("@/lib/compress-image", () => ({
  compressImage: jest.fn(async (file: File) => file),
}));

describe("vehicle admin actions", () => {
  beforeEach(() => {
    global.fetch = jest.fn() as any;
  });

  it("updateVehicle sends a PUT with the changed fields", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      jsonResponse({ success: true })
    );
    const data = { brand: "Toyota", price_per_day: 50, available: true };

    await updateVehicle("car 1", data);

    const [url, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe("/api/admin/update-vehicle/car%201");
    expect(init.method).toBe("PUT");
    expect(JSON.parse(init.body)).toEqual(data);
  });

  it("updateVehicle surfaces the first validation error", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      jsonResponse(
        {
          error: "Invalid vehicle",
          fields: { price_per_day: ["Price must be positive"] },
        },
        false
      )
    );
    await expect(updateVehicle("1", { price_per_day: -1 })).rejects.toThrow(
      "Price must be positive"
    );
  });

  it("replaceVehiclePhoto uploads the file with the car id", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      jsonResponse({ success: true, image: "/api/images/abc" })
    );
    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

    const result = await replaceVehiclePhoto("1", file);

    expect(result.image).toBe("/api/images/abc");
    const [url, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe("/api/admin/update-image");
    expect(init.method).toBe("POST");
    expect((init.body as FormData).get("carId")).toBe("1");
    expect((init.body as FormData).get("file")).toBeInstanceOf(File);
  });

  it("replaceVehiclePhoto reports upload errors", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      jsonResponse({ error: "Image is larger than 4 MB." }, false)
    );
    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
    await expect(replaceVehiclePhoto("1", file)).rejects.toThrow(
      "Image is larger than 4 MB."
    );
  });
});
