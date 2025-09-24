import VerificationPage from "@/components/auth/Verification";
import MaxWidthWrapper from "@/components/utility/MaxWidthWrapper";

export default function Verification() {
  return (
    <MaxWidthWrapper>
      <div className="flex items-center justify-center min-h-[90vh]">
        <VerificationPage />
      </div>
    </MaxWidthWrapper>
  );
}
