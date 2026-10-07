import type { Metadata } from "next";
import { Suspense } from "react";
import AuthLayout from "@/components/common/auth/AuthLayout";
import ForgotPasswordForm from "@/components/common/auth/ForgotPasswordForm";
import Loader from "@/components/utility/Loader";

export const metadata: Metadata = { title: "Forgot password" };

export default function Page() {
  return (
    <AuthLayout>
      <Suspense fallback={<Loader />}>
        <ForgotPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
