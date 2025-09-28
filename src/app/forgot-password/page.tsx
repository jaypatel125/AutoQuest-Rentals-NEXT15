import AuthLayout from "@/components/auth/AuthLayout";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import Loader from "@/components/utility/Loader";
import { Suspense } from "react";

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<Loader />}>
      <AuthLayout>
        <ForgotPasswordForm />
      </AuthLayout>
    </Suspense>
  );
}
