import AuthLayout from "@/components/common/auth/AuthLayout";
import ForgotPasswordForm from "@/components/common/auth/ForgotPasswordForm";
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
