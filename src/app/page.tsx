"use client";
import MaxWidthWrapper from "@/components/utility/MaxWidthWrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Car, CalendarIcon, MapPin } from "lucide-react";
import { SearchBar } from "@/components/select-vehicle/Seachbar";
export default function Home() {
  return (
    <MaxWidthWrapper>
      <section className="grid md:grid-cols-2 gap-8 items-center py-12">
        <div>
          <h1 className="text-4xl font-bold leading-tight">
            Find, Book, and Drive Green <br />
            Choose an EV for a Cleaner{" "}
            <span className="text-green-600">Tomorrow!</span>
          </h1>
          <p className="mt-4 text-muted-foreground">
            Discover best deals and rewards on electric vehicles.
          </p>
        </div>
        <div className="flex justify-center">
          <Image
            src="/car-hero.png"
            alt="EV Car"
            width={400}
            height={300}
            className="rounded-lg"
          />
        </div>
      </section>

      <SearchBar />

      {/* Rent by Brands */}
      <section className="py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Rent by Brands</h2>
          <Button variant="ghost">View all →</Button>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {["Toyota", "Ford", "Tesla", "BMW", "Chevrolet", "Audi"].map(
            (brand, i) => (
              <Card key={i} className="hover:shadow-md cursor-pointer">
                <CardContent className="flex items-center justify-center h-20">
                  <span className="font-medium">{brand}</span>
                </CardContent>
              </Card>
            )
          )}
        </div>
      </section>

      {/* Rent by Body Type */}
      <section className="py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Rent by Body Type</h2>
          <Button variant="ghost">View all →</Button>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {["SUV", "Crossover", "Sedan", "Coupe", "Wagon", "Convertible"].map(
            (type, i) => (
              <Card key={i} className="hover:shadow-md cursor-pointer">
                <CardContent className="flex items-center justify-center h-20">
                  <span className="font-medium">{type}</span>
                </CardContent>
              </Card>
            )
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-8 bg-muted rounded-xl text-center">
        <h2 className="text-2xl font-semibold mb-6">
          Rent with following 3 working steps
        </h2>
        <div className="grid md:grid-cols-3 gap-6 p-12">
          <Card>
            <CardContent className="p-6">
              <Car className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold">Select Filters</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Choose your location and find your best car.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <CalendarIcon className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold">Find Best Pick</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Select your pick that meets your expectations.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <MapPin className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold">Book Your Car</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Book your car and we will deliver it directly to you.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16">
        <h2 className="text-2xl font-semibold text-center mb-8">
          Why Choose Us
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="font-semibold">Best Price Guaranteed</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Find a lower price? We&apos;ll refund you 100% of the
                difference.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="font-semibold">Rewards for Choosing EV</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Best deals and rewards on electric vehicles.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="font-semibold">24/7 Technical Support</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Have a question? Contact support anytime.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </MaxWidthWrapper>
  );
}
