import type { Metadata } from "next";
import { Suspense } from "react";
import AuthLayout from "@/components/common/auth/AuthLayout";
import SigninForm from "@/components/common/auth/SigninForm";
import Loader from "@/components/utility/Loader";

export const metadata: Metadata = { title: "Sign in" };

export default function Page() {
  return (
    <AuthLayout>
      <Suspense fallback={<Loader />}>
        <SigninForm />
      </Suspense>
    </AuthLayout>
  );
}
