import AuthLayout from "@/components/auth/AuthLayout";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { Suspense } from "react";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading select vehicle…</div>}>
      <AuthLayout>
        <ResetPasswordForm />
      </AuthLayout>
    </Suspense>
  );
}
