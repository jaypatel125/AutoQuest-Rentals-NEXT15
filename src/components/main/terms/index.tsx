"use client";

import React from "react";

export default function TermsDetails() {
  return (
    <div className="py-6 space-y-10">
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">1. General Terms</h2>
        <ul className="list-disc list-inside text-muted-foreground space-y-2">
          <li>
            All renters must be at least{" "}
            <span className="font-medium">21 years old</span>. Additional fees
            may apply for drivers under 25.
          </li>
          <li>
            A valid driver’s license and a government-issued photo ID must be
            presented at the time of pickup.
          </li>
          <li>
            The renter is responsible for verifying that the vehicle is in
            acceptable condition before leaving the branch.
          </li>
          <li>
            Vehicles may only be driven by the renter and approved additional
            drivers listed in the booking.
          </li>
        </ul>
      </section>

      {/* Booking & Payment */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">2. Booking & Payment</h2>
        <ul className="list-disc list-inside text-muted-foreground space-y-2">
          <li>
            Full payment or authorization hold is required at the time of
            booking confirmation.
          </li>
          <li>
            Accepted payment methods include credit card, debit card, or other
            approved payment options listed on our platform.
          </li>
          <li>Prices are inclusive of taxes unless otherwise stated.</li>
          <li>
            Modifications to existing bookings are subject to availability and
            may affect pricing.
          </li>
        </ul>
      </section>

      {/* Cancellation Policy */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">3. Cancellations & Refunds</h2>
        <ul className="list-disc list-inside text-muted-foreground space-y-2">
          <li>
            Cancellations made more than 24 hours before the scheduled pickup
            are eligible for a full refund.
          </li>
          <li>
            Cancellations within 24 hours of pickup may be subject to a one-day
            rental fee.
          </li>
          <li>
            No-shows without cancellation will result in forfeiture of the full
            rental amount.
          </li>
          <li>
            Refunds will be issued to the original payment method within 5–7
            business days.
          </li>
        </ul>
      </section>

      {/* Vehicle Use */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">
          4. Vehicle Use & Responsibilities
        </h2>
        <ul className="list-disc list-inside text-muted-foreground space-y-2">
          <li>
            Vehicles must be used responsibly and returned in the same condition
            as at pickup.
          </li>
          <li>
            Smoking, vaping, or carrying hazardous materials inside the vehicle
            is strictly prohibited.
          </li>
          <li>
            Renters are responsible for all traffic violations, tolls, parking
            tickets, and penalties incurred during the rental period.
          </li>
          <li>
            In case of an accident, renters must immediately inform both local
            authorities and our support team.
          </li>
        </ul>
      </section>

      {/* Vehicle Return */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">5. Vehicle Return</h2>
        <ul className="list-disc list-inside text-muted-foreground space-y-2">
          <li>
            Vehicles must be returned to the same branch where they were picked
            up unless otherwise arranged.
          </li>
          <li>
            Late returns may result in additional hourly or daily charges.
          </li>
          <li>
            Vehicles returned excessively dirty or damaged may incur a cleaning
            or repair fee.
          </li>
        </ul>
      </section>

      {/* Insurance and Liability */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">6. Insurance & Liability</h2>
        <ul className="list-disc list-inside text-muted-foreground space-y-2">
          <li>
            Basic insurance coverage is included with every rental, but
            additional protection options are available.
          </li>
          <li>
            Renters are liable for damages not covered by insurance or caused by
            negligence.
          </li>
          <li>
            The deductible amount for covered incidents will vary based on
            vehicle category and coverage selected.
          </li>
        </ul>
      </section>

      {/* Legal & Modifications */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">7. Legal & Policy Updates</h2>
        <ul className="list-disc list-inside text-muted-foreground space-y-2">
          <li>
            The company reserves the right to modify these terms at any time
            without prior notice.
          </li>
          <li>
            Continued use of our platform constitutes acceptance of any updated
            terms.
          </li>
          <li>
            For disputes, local laws and jurisdictions in the province of
            operation will apply.
          </li>
        </ul>
      </section>
    </div>
  );
}
