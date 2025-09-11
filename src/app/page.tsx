import MaxWidthWrapper from "@/components/utility/MaxWidthWrapper";
import { auth } from "../../auth";
import { headers } from "next/headers";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // console.log(session);

  return (
    <MaxWidthWrapper>
      <div>hello world</div>
    </MaxWidthWrapper>
  );
}
