"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Car, CalendarIcon, MapPin } from "lucide-react";
import { fetchCarBodyTypes, fetchCarBrands } from "@/app/actions";
import { useQuery } from "@tanstack/react-query";
import Loader from "../../utility/Loader";
import { useRouter } from "next/navigation";
import { SearchBar } from "../searchbar";
import Error from "@/components/utility/Error";

const HomePage = () => {
  const {
    data: brands = [],
    isLoading,
    error,
  } = useQuery<string[]>({
    queryKey: ["brands"],
    queryFn: () => fetchCarBrands(),
  });

  const {
    data: bodyTypes = [],
    isLoading: bodyTypesLoading,
    error: bodyTypesError,
  } = useQuery<string[]>({
    queryKey: ["bodyTypes"],
    queryFn: () => fetchCarBodyTypes(),
  });

  const router = useRouter();

  if (isLoading || bodyTypesLoading) {
    return <Loader title="Loading vehicle details" />;
  }

  if (error || bodyTypesError) {
    return <Error error="Failed to load details. Please try again." />;
  }

  return (
    <div className="space-y-18 my-10 md:my-16">
      {/* Hero Section */}
      <section className="grid md:grid-cols-2 gap-8 items-center">
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
            src="/car.png"
            alt="EV Car"
            width={500}
            height={400}
            className="rounded-lg"
          />
        </div>
      </section>

      {/* Search Bar */}
      <section>
        <SearchBar />
      </section>

      {/* Rent by Brands */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Available Brands</h2>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {brands.map((brand, i) => (
            <Card key={i} className="hover:shadow-md cursor-pointer">
              <CardContent className="flex items-center justify-center h-20">
                <span className="font-medium">{brand}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Rent by Body Type */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Available Body Type</h2>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {bodyTypes.map((type, i) => (
            <Card key={i} className="hover:shadow-md cursor-pointer">
              <CardContent className="flex items-center justify-center h-20">
                <span className="font-medium">{type}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Rewards Section */}
      <section className="py-12 lg:px-0 px-10 bg-green-50 dark:bg-green-900/10 rounded-xl text-center">
        <h2 className="text-2xl font-semibold mb-4">
          Earn Rewards for Going Green
        </h2>
        <p className="text-muted-foreground  mb-8">
          Earn <span className="font-semibold">2x points</span> when renting
          electric vehicles. Redeem your points for discounts on future rides.
        </p>
        <Button iconType="right-arrow" onClick={() => router.push("/rewards")}>
          Learn More
        </Button>
      </section>

      {/* How It Works */}
      <section className="py-8 bg-muted rounded-xl text-center">
        <h2 className="text-2xl lg:px-0 px-10 font-semibold mb-6">
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

      {/* Our Reach Section */}
      <section className="py-16 lg:px-0 px-10 bg-muted rounded-xl text-center">
        <h2 className="text-2xl font-semibold mb-6">Our Growing Community</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-10">
          We&apos;re proud to serve a growing network of eco-conscious drivers,
          modern vehicles, and trusted branch locations across the region.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <h3 className="text-4xl font-bold text-green-600">2,500+</h3>
            <p className="text-muted-foreground text-sm">Registered Users</p>
          </div>
          <div className="space-y-3">
            <h3 className="text-4xl font-bold text-green-600">180+</h3>
            <p className="text-muted-foreground text-sm">
              Electric & Hybrid Vehicles
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="text-4xl font-bold text-green-600">35+</h3>
            <p className="text-muted-foreground text-sm">
              Branches Across Canada
            </p>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section>
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
    </div>
  );
};

export default HomePage;
