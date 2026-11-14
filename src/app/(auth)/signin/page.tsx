import type { Metadata } from "next";
import { Suspense } from "react";
import AuthLayout from "@/components/common/auth/AuthLayout";
import SigninForm from "@/components/common/auth/SigninForm";
import Loader from "@/components/utility/Loader";
import { ensureReviewerDemo } from "@/lib/reviewer-demo";

export const metadata: Metadata = { title: "Sign in" };
// Reads the reviewer demo settings at request time, not build time.
export const dynamic = "force-dynamic";

export default async function Page() {
  // Creates or repairs the shared reviewer account before showing its login.
  const reviewerDemo = await ensureReviewerDemo();
  return (
    <AuthLayout>
      <Suspense fallback={<Loader />}>
        <SigninForm reviewerDemo={reviewerDemo} />
      </Suspense>
    </AuthLayout>
  );
}
