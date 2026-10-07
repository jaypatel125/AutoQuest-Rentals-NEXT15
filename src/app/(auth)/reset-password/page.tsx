import type { Metadata } from "next";
import { Suspense } from "react";
import AuthLayout from "@/components/common/auth/AuthLayout";
import ResetPasswordForm from "@/components/common/auth/ResetPasswordForm";
import Loader from "@/components/utility/Loader";

export const metadata: Metadata = { title: "Reset password" };

export default function Page() {
  return (
    <AuthLayout>
      <Suspense fallback={<Loader />}>
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
