import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Users, Fuel, Car, CarFront, StarIcon } from "lucide-react";
import Image from "next/image";
import pool from "@/lib/db";
import type {
  Car as CarType,
  Review as ReviewType,
} from "@/lib/database/table-types";
import MaxWidthWrapper from "@/components/utility/MaxWidthWrapper";
import Link from "next/link";

// Fetch single car by ID
async function getCarById(id: string): Promise<CarType | null> {
  const result = await pool.query(`SELECT * FROM car WHERE id = $1`, [id]);
  console.log(result.rows);
  return result.rows[0] || null;
}

// fetch review by car id
async function getReviewsByCarId(carId: string): Promise<ReviewType[]> {
  const result = await pool.query(`SELECT * FROM review WHERE "carId" = $1`, [
    carId,
  ]);
  return result.rows as ReviewType[];
}

// fetch user by id
async function getUserById(userId: string): Promise<{ name: string } | null> {
  const result = await pool.query(`SELECT name FROM "user" WHERE id = $1`, [
    userId,
  ]);
  return result.rows[0] || null;
}

export default async function VehicleDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const car = await getCarById(params.id);
  const reviews = await getReviewsByCarId(params.id);
  const reviewsWithUserNames = await Promise.all(
    reviews.map(async (review) => {
      const user = await getUserById(review.userId);
      return {
        ...review,
        userName: user ? user.name : "Unknown User",
      };
    })
  );

  console.log(reviewsWithUserNames);

  if (!car) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Vehicle not found</h2>
        <p className="text-muted-foreground mt-2">
          Try going back and selecting a different vehicle.
        </p>
      </div>
    );
  }

  return (
    <MaxWidthWrapper>
      <div className="space-y-8">
        {/* Back link */}
        <Button variant="ghost" asChild>
          <Link href="/select-vehicle">← Back</Link>
        </Button>

        <div className="grid md:grid-cols-2 gap-10 items-start">
          {/* Car Image */}
          <Image
            src={car.images || "/car-placeholder.png"}
            alt={`${car.brand} ${car.model}`}
            width={700}
            height={400}
            className="rounded-lg shadow-md"
          />

          {/* Car Information */}
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">
              {car.brand} {car.model}
            </h1>

            {/* Rating */}
            <div className="flex items-center text-sm text-muted-foreground">
              <StarIcon fill="orange" className="h-5 w-5 mr-1" />
              4.8 (2,436 reviews) {/* Placeholder rating */}
            </div>

            {/* Vehicle Information */}
            <Card>
              <CardContent className=" text-sm text-muted-foreground">
                <div className="grid grid-cols-2 gap-4">
                  {/* Left column */}
                  <div className="space-y-2">
                    <p>
                      <CarFront className="inline h-4 w-4 mr-2" />
                      {car.bodyType}
                    </p>
                    <p>
                      <CarFront className="inline h-4 w-4 mr-2" />
                      {car.carbonEmissions} g/km CO2
                    </p>
                    <p>
                      <Users className="inline h-4 w-4 mr-2" />
                      {car.passengerCapacity} Passengers
                    </p>
                  </div>

                  {/* Right column */}
                  <div className="space-y-2">
                    <p>
                      <Car className="inline h-4 w-4 mr-2" />
                      {car.transmission}
                    </p>
                    <p>
                      <Fuel className="inline h-4 w-4 mr-2" />
                      {car.fuelType}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Price + Rent Button */}
            <div className="flex items-center justify-between">
              <span className="text-xl font-semibold">
                ${car.pricePerDay} / day
              </span>
              <Button size="lg">Rent Now →</Button>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Reviews</h2>

          {reviewsWithUserNames.length > 0 ? (
            <div className="space-y-2">
              {reviewsWithUserNames.map((reviewsWithUserNames) => (
                <Card key={reviewsWithUserNames.id}>
                  <CardContent className="px-4">
                    <p className="font-semibold">
                      {reviewsWithUserNames.userName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {reviewsWithUserNames.comment}
                    </p>
                    <div className="flex mt-1">
                      {[...Array(Math.round(reviewsWithUserNames.rating))].map(
                        (_, i) => (
                          <Star
                            key={i}
                            fill="orange"
                            className="h-4 w-4 text-yellow-500"
                          />
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No reviews yet.</p>
          )}
        </div>
      </div>
    </MaxWidthWrapper>
  );
}
