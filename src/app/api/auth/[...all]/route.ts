import { auth } from "../../../../../auth";
import { toNextJsHandler } from "better-auth/next-js";
import { authClient } from "../../../../../auth-client";

export const signIn = async () => {
  const data = await authClient.signIn.social({
    provider: "google",
  });
};

export const { POST, GET } = toNextJsHandler(auth);
