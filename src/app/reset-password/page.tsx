import AuthLayout from "@/components/auth/AuthLayout";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import Loader from "@/components/utility/Loader";
import { Suspense } from "react";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<Loader />}>
      <AuthLayout>
        <ResetPasswordForm />
      </AuthLayout>
    </Suspense>
  );
}
