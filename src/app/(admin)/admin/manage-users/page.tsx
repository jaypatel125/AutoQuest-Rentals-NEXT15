import React from "react";
import CustomersOverview from "./components/customers-overview";
import { getServerSideSession } from "@/hooks/SessionHandler";

const CustomersPage = async () => {
  const { user } = await getServerSideSession();
  return user ? <CustomersOverview user={user} /> : <div>Loading...</div>;
};

export default CustomersPage;
