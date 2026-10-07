import type { Metadata } from "next";
import { Suspense } from "react";
import AuthLayout from "@/components/common/auth/AuthLayout";
import VerificationPage from "@/components/common/auth/Verification";
import Loader from "@/components/utility/Loader";

export const metadata: Metadata = { title: "Verify your email" };

export default function Verification() {
  return (
    <AuthLayout>
      <Suspense fallback={<Loader />}>
        <VerificationPage />
      </Suspense>
    </AuthLayout>
  );
}
