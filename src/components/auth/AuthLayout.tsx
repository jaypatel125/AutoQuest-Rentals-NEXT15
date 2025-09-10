import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Left side (form section) */}
      <div className="flex w-full flex-col items-center justify-center bg-white p-8 ">
        {/* Logo / Branding */}
        <div className="mb-8 flex items-center justify-center">
          {/* If you have a logo image */}
          <p className="text-3xl font-extrabold tracking-tight text-primary underline">
            Auto<span className="text-blue-600">Quest</span>
          </p>

          {/* Or fallback to text */}
          {/* <h1 className="text-2xl font-bold text-gray-800">CarRent.com</h1> */}
        </div>

        {/* Auth form */}
        <div className="w-full max-w-md">{children}</div>
      </div>

      {/* Right side (image / illustration) */}
      {/* <div className="hidden w-1/2 md:block">
        <Image
          src="/plants.jpg"
          alt="Auth banner"
          width={800}
          height={800}
          className="h-full w-full object-cover"
        />
      </div> */}
    </div>
  );
}
