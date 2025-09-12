"use server";

import { authClient } from "../../../auth-client";

export const deleteUsers = async () => {
  try {
    await authClient.deleteUser({
      callbackURL: "/signin",
    });

    return {
      success: true,
      message: "User deleted successfully.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "An unknown error occurred.",
    };
  }
};
