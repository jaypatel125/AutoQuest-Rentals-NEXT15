const SECTIONS: { id: string; title: string; items: string[] }[] = [
  {
    id: "general",
    title: "General Terms",
    items: [
      "All renters must be at least 21 years old. Additional fees may apply for drivers under 25.",
      "A valid driver’s license and a government-issued photo ID must be presented at the time of pickup.",
      "The renter is responsible for verifying that the vehicle is in acceptable condition before leaving the branch.",
      "Vehicles may only be driven by the renter and approved additional drivers listed in the booking.",
    ],
  },
  {
    id: "payment",
    title: "Booking & Payment",
    items: [
      "Full payment or authorization hold is required at the time of booking confirmation.",
      "Accepted payment methods include credit card, debit card, or other approved payment options listed on our platform.",
      "Prices shown at checkout include the rental charge, a service fee, and HST.",
      "Modifications to existing bookings are subject to availability and may affect pricing.",
    ],
  },
  {
    id: "cancellations",
    title: "Cancellations & Refunds",
    items: [
      "Cancellations made more than 24 hours before the scheduled pickup are eligible for a full refund.",
      "Cancellations within 24 hours of pickup are subject to a one-day rental fee (plus tax); the rest is refunded.",
      "Bookings cannot be cancelled online once the rental period has started.",
      "No-shows without cancellation will result in forfeiture of the full rental amount.",
      "Refunds will be issued to the original payment method within 5 to 7 business days.",
      "Reward points earned on a cancelled booking are removed, and points redeemed on it are returned.",
    ],
  },
  {
    id: "use",
    title: "Vehicle Use & Responsibilities",
    items: [
      "Vehicles must be used responsibly and returned in the same condition as at pickup.",
      "Smoking, vaping, or carrying hazardous materials inside the vehicle is strictly prohibited.",
      "Renters are responsible for all traffic violations, tolls, parking tickets, and penalties incurred during the rental period.",
      "In case of an accident, renters must immediately inform both local authorities and our support team.",
    ],
  },
  {
    id: "return",
    title: "Vehicle Return",
    items: [
      "Vehicles must be returned to the same branch where they were picked up unless otherwise arranged.",
      "Late returns may result in additional hourly or daily charges.",
      "Vehicles returned excessively dirty or damaged may incur a cleaning or repair fee.",
    ],
  },
  {
    id: "insurance",
    title: "Insurance & Liability",
    items: [
      "Basic insurance coverage is included with every rental, but additional protection options are available.",
      "Renters are liable for damages not covered by insurance or caused by negligence.",
      "The deductible amount for covered incidents will vary based on vehicle category and coverage selected.",
    ],
  },
  {
    id: "legal",
    title: "Legal & Policy Updates",
    items: [
      "The company reserves the right to modify these terms at any time without prior notice.",
      "Continued use of our platform constitutes acceptance of any updated terms.",
      "For disputes, local laws and jurisdictions in the province of operation will apply.",
    ],
  },
];

export default function TermsDetails() {
  return (
    <div className="grid gap-12 lg:grid-cols-[200px_1fr] lg:gap-16">
      <nav aria-label="Sections" className="hidden lg:block">
        <ol className="sticky top-24 space-y-2 text-sm">
          {SECTIONS.map((s, i) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {i + 1}. {s.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>
      <div className="max-w-2xl divide-y">
        {SECTIONS.map((section, i) => (
          <section
            key={section.id}
            id={section.id}
            className="scroll-mt-24 py-10 first:pt-0"
          >
            <h2 className="mb-5 text-lg font-medium">
              <span className="text-muted-foreground">{i + 1}.</span>{" "}
              {section.title}
            </h2>
            <ul className="list-disc space-y-2.5 pl-5 text-muted-foreground marker:text-border">
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
