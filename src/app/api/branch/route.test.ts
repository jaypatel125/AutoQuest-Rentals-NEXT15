import { GET } from "./route";
import pool from "@/lib/db";

// Mock the database module
jest.mock("@/lib/db", () => ({
  query: jest.fn(),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({
      json: async () => data,
      status: init?.status || 200,
    })),
  },
}));

describe("/api/branch GET", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 200 and list of branches when query succeeds", async () => {
    const mockRows = [
      { id: 1, city: "Toronto" },
      { id: 2, city: "Vancouver" },
    ];
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: mockRows });

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual(mockRows);
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("SELECT *")
    );
  });

  it("should return 500 and error message when query fails", async () => {
    (pool.query as jest.Mock).mockRejectedValueOnce(new Error("DB error"));

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json).toEqual({ error: "Failed to fetch cities" });
    expect(pool.query).toHaveBeenCalled();
  });
});
