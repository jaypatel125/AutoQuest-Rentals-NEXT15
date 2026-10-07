import type { Metadata } from "next";
import { Suspense } from "react";
import AuthLayout from "@/components/common/auth/AuthLayout";
import SignupForm from "@/components/common/auth/SignupForm";
import Loader from "@/components/utility/Loader";

export const metadata: Metadata = { title: "Create account" };

export default function Page() {
  return (
    <AuthLayout>
      <Suspense fallback={<Loader />}>
        <SignupForm />
      </Suspense>
    </AuthLayout>
  );
}
