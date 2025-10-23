import { getServerSideSession } from "@/hooks/SessionHandler";
import Navbar from "./NavBar";

export default async function UserNavbarWrapper() {
  const { session, user } = await getServerSideSession();

  return <Navbar session={session} user={user} />;
}
