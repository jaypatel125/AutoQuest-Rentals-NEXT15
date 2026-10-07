import { buildQuote, rentalDays } from "./pricing";
import { cancellationTerms, ADMIN_TRANSITIONS } from "./cancellation";
import { greenScore, tripEmissionsKg, tripSavingsKg } from "./green";
import { tierFor } from "./rewards";
import { escapeHtml } from "./html";
import { renderEmail } from "./email-templates";
import { resolveVehicleImage, absoluteImageUrl } from "./vehicle-image";
import { buildRentalIcs } from "./ics";
import { parseRentalDates } from "./bookings";
import { sniffImageType } from "./images";
import { nextRange } from "./date-range";

jest.mock("./db", () => ({
  __esModule: true,
  default: {},
  withTransaction: jest.fn(),
}));
jest.mock("./stripe", () => ({ getStripe: jest.fn() }));

const DAY = 24 * 60 * 60 * 1000;

describe("pricing", () => {
  it("counts same-day rentals as one day", () => {
    expect(rentalDays("2030-01-01", "2030-01-01")).toBe(1);
    expect(rentalDays("2030-01-01", "2030-01-05")).toBe(4);
  });

  it("builds a quote in cents without floating point drift", () => {
    const q = buildQuote({
      pricePerDay: "119.00",
      start: "2030-01-01",
      end: "2030-01-05",
      fuelType: "Electric",
      availablePoints: 0,
    });
    expect(q).toMatchObject({
      days: 4,
      rentalCharge: 476,
      serviceFee: 15,
      tax: 61.88,
      discount: 0,
      total: 552.88,
      pointsToEarn: 1105,
    });
  });

  it("caps redemption at 1,000 points per booking", () => {
    const q = buildQuote({
      pricePerDay: 500,
      start: "2030-01-01",
      end: "2030-01-03",
      availablePoints: 5000,
    });
    expect(q.pointsRedeemed).toBe(1000);
    expect(q.discount).toBe(100);
  });

  it("never discounts the total below $1", () => {
    const q = buildQuote({
      pricePerDay: 1,
      start: "2030-01-01",
      end: "2030-01-02",
      availablePoints: 1000,
    });
    // Points come in 10 cent steps, so the floor lands just above $1.
    expect(q.total).toBeGreaterThanOrEqual(1);
    expect(q.total).toBeLessThan(1.1);
  });

  it("only redeems points when asked to", () => {
    const q = buildQuote({
      pricePerDay: 50,
      start: "2030-01-01",
      end: "2030-01-02",
      availablePoints: 300,
      redeemPoints: false,
    });
    expect(q.pointsRedeemed).toBe(0);
  });
});

describe("cancellation policy", () => {
  const now = new Date("2030-01-10T12:00:00Z");
  const booking = (hoursAhead: number, status = "Confirmed") => ({
    status,
    start_date: new Date(now.getTime() + hoursAhead * 3_600_000),
    total_price: "354.00",
    price_per_day: "59.00",
  });

  it("refunds in full more than 24 hours before pick-up", () => {
    expect(cancellationTerms(booking(48), now)).toMatchObject({
      allowed: true,
      free: true,
      refund: 354,
      fee: 0,
    });
  });

  it("keeps one day plus tax inside 24 hours", () => {
    expect(cancellationTerms(booking(10), now)).toMatchObject({
      allowed: true,
      free: false,
      fee: 66.67,
      refund: 287.33,
    });
  });

  it("does not allow cancelling after pick-up or a cancelled booking", () => {
    expect(cancellationTerms(booking(-1), now).allowed).toBe(false);
    expect(cancellationTerms(booking(48, "Cancelled"), now).allowed).toBe(
      false
    );
  });

  it("never lets admins reopen finished bookings", () => {
    expect(ADMIN_TRANSITIONS.Cancelled).toEqual([]);
    expect(ADMIN_TRANSITIONS.Completed).toEqual([]);
    expect(ADMIN_TRANSITIONS.Confirmed).toContain("Cancelled");
  });
});

describe("rental date validation", () => {
  const now = new Date("2030-01-10T12:00:00Z");
  const iso = (offsetDays: number) =>
    new Date(now.getTime() + offsetDays * DAY).toISOString();

  it("accepts a normal future trip", () => {
    expect(parseRentalDates(iso(2), iso(5), now)).toHaveProperty("start");
  });

  it.each([
    ["missing dates", undefined, undefined],
    ["garbage", "not-a-date", iso(2)],
    ["the past", iso(-5), iso(-2)],
    ["return before pick-up", iso(5), iso(2)],
    ["more than 60 days", iso(2), iso(80)],
    ["more than a year ahead", iso(400), iso(402)],
  ])("rejects %s", (_label, start, end) => {
    expect(parseRentalDates(start, end, now)).toHaveProperty("error");
  });
});

describe("green score", () => {
  it("grades emissions from A+ to E", () => {
    expect(greenScore(0).grade).toBe("A+");
    expect(greenScore(92).grade).toBe("A");
    expect(greenScore(128).grade).toBe("B");
    expect(greenScore(160).grade).toBe("C");
    expect(greenScore(210).grade).toBe("D");
    expect(greenScore(265).grade).toBe("E");
  });

  it("estimates trip emissions and savings", () => {
    expect(tripEmissionsKg(180, 4, 80)).toBeCloseTo(57.6);
    expect(tripSavingsKg(0, 4, 80)).toBeCloseTo(57.6);
    expect(tripSavingsKg(250, 4, 80)).toBe(0);
  });
});

describe("reward tiers", () => {
  it("tracks progress toward the next tier", () => {
    const t = tierFor(2368);
    expect(t.current.name).toBe("Sapling");
    expect(t.next?.name).toBe("Evergreen");
    expect(t.pointsToNext).toBe(2632);
  });

  it("tops out at Forest", () => {
    const t = tierFor(50000);
    expect(t.current.name).toBe("Forest");
    expect(t.next).toBeNull();
    expect(t.progress).toBe(1);
  });
});

describe("html escaping and emails", () => {
  it("escapes markup", () => {
    expect(escapeHtml(`<a href="x">'&'</a>`)).toBe(
      "&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;"
    );
  });

  it("escapes user content and refuses non-http links in emails", () => {
    const html = renderEmail({
      title: "Hi <b>there</b>",
      greeting: "Hello <script>alert(1)</script>",
      details: [["Name", "<img src=x onerror=alert(1)>"]],
      button: { label: "Go", href: "javascript:alert(1)" },
    });
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<img src=x");
    expect(html).not.toContain("javascript:");
  });
});

describe("vehicle images", () => {
  it("drops photos that lived in the retired S3 bucket", () => {
    expect(
      resolveVehicleImage(
        "https://autoquest.s3.us-east-2.amazonaws.com/vehicles/a.png"
      )
    ).toBeNull();
    expect(resolveVehicleImage("/api/images/123")).toBe("/api/images/123");
    expect(resolveVehicleImage("")).toBeNull();
    expect(resolveVehicleImage("javascript:alert(1)")).toBeNull();
  });

  it("builds absolute URLs for Stripe only over https", () => {
    expect(absoluteImageUrl("/api/images/1", "https://site.test/")).toBe(
      "https://site.test/api/images/1"
    );
    expect(
      absoluteImageUrl("/api/images/1", "http://localhost:3000")
    ).toBeNull();
  });

  it("detects real image types from magic bytes", () => {
    const png = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0,
    ]);
    const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0]);
    const webp = new Uint8Array(Buffer.from("RIFF\0\0\0\0WEBPVP8 "));
    const html = new Uint8Array(Buffer.from("<script>alert(1)</script>"));
    expect(sniffImageType(png)).toBe("image/png");
    expect(sniffImageType(jpeg)).toBe("image/jpeg");
    expect(sniffImageType(webp)).toBe("image/webp");
    expect(sniffImageType(html)).toBeNull();
  });
});

describe("calendar export", () => {
  it("creates an all-day event that includes the return day", () => {
    const ics = buildRentalIcs({
      uid: "b1",
      title: "AutoQuest rental: Tesla Model 3",
      description: "Bring your licence, please",
      location: "Downtown, 1 King St; Toronto",
      start: new Date(2030, 0, 10),
      end: new Date(2030, 0, 12),
    });
    expect(ics).toContain("DTSTART;VALUE=DATE:20300110");
    expect(ics).toContain("DTEND;VALUE=DATE:20300113");
    expect(ics).toContain("LOCATION:Downtown\\, 1 King St\\; Toronto");
  });
});

describe("trip range picking", () => {
  const oct = (d: number) => new Date(2026, 9, d);

  it("starts with the pick-up day and waits for a return day", () => {
    expect(nextRange(undefined, oct(9))).toEqual({
      from: oct(9),
      to: undefined,
    });
  });

  it("uses the second click as the return day", () => {
    expect(nextRange({ from: oct(9) }, oct(12))).toEqual({
      from: oct(9),
      to: oct(12),
    });
  });

  it("allows a same-day rental", () => {
    expect(nextRange({ from: oct(9) }, oct(9))).toEqual({
      from: oct(9),
      to: oct(9),
    });
  });

  it("restarts when clicking before pick-up or after a full range", () => {
    expect(nextRange({ from: oct(9) }, oct(5))).toEqual({
      from: oct(5),
      to: undefined,
    });
    expect(nextRange({ from: oct(9), to: oct(12) }, oct(20))).toEqual({
      from: oct(20),
      to: undefined,
    });
  });
});
