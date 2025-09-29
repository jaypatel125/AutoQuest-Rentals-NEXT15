import MaxWidthWrapper from "./utility/MaxWidthWrapper";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-8 mt-12">
      <MaxWidthWrapper>
        {/* Logo */}
        <p className="text-xl text-center font-semibold tracking-tight text-gray-300 underline">
          AutoQuest
        </p>
        <div className="mt-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} AutoQuest. All rights reserved.
        </div>
      </MaxWidthWrapper>
    </footer>
  );
}
