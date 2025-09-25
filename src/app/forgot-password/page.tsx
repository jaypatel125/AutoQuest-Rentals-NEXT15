import AuthLayout from "@/components/auth/AuthLayout";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import { Suspense } from "react";

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div>Loading forgot password…</div>}>
      <AuthLayout>
        <ForgotPasswordForm />
      </AuthLayout>
    </Suspense>
  );
}
