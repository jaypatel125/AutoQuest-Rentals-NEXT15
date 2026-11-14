import {
  canEditAdmin,
  canViewAdmin,
  isBlockedForReviewer,
  isReviewer,
  primaryRole,
} from "./roles";
import { maskEmail, maskName, maskPeople } from "./privacy";

describe("roles", () => {
  it("treats missing or unknown roles as customers", () => {
    expect(primaryRole(undefined)).toBe("user");
    expect(primaryRole("")).toBe("user");
    expect(primaryRole("something-else")).toBe("user");
  });

  it("lets admins and reviewers into the admin area, but only admins edit", () => {
    expect(canViewAdmin("admin")).toBe(true);
    expect(canViewAdmin("reviewer")).toBe(true);
    expect(canViewAdmin("user")).toBe(false);
    expect(canEditAdmin("admin")).toBe(true);
    expect(canEditAdmin("reviewer")).toBe(false);
    expect(canEditAdmin("user")).toBe(false);
  });

  it("handles better-auth's comma-separated roles, admin winning", () => {
    expect(primaryRole("reviewer,admin")).toBe("admin");
    expect(primaryRole("user, reviewer")).toBe("reviewer");
    expect(isReviewer("user,reviewer")).toBe(true);
  });

  it("blocks account and admin-plugin endpoints for reviewers", () => {
    for (const path of [
      "/update-user",
      "/change-password",
      "/change-email",
      "/delete-user",
      "/list-sessions",
      "/revoke-other-sessions",
      "/admin/set-role",
      "/admin/list-users",
    ]) {
      expect(isBlockedForReviewer(path)).toBe(true);
    }
    for (const path of ["/sign-in/email", "/sign-out", "/get-session"]) {
      expect(isBlockedForReviewer(path)).toBe(false);
    }
    // A prefix match must be a whole path segment.
    expect(isBlockedForReviewer("/update-user-x")).toBe(false);
  });
});

describe("privacy masking", () => {
  it("masks emails but keeps their shape", () => {
    expect(maskEmail("jordan.rivers@gmail.com")).toBe("j•••@g•••.com");
    expect(maskEmail("a@b")).toBe("a•••@b•••");
    expect(maskEmail("not-an-email")).toBe("•••");
    expect(maskEmail(null)).toBeNull();
  });

  it("keeps first names and the last initial", () => {
    expect(maskName("Jordan Rivers")).toBe("Jordan R.");
    expect(maskName("Mary Jane van Dyke")).toBe("Mary D.");
    expect(maskName("Cher")).toBe("Cher");
    expect(maskName(undefined)).toBeNull();
  });

  it("masks name and email fields on every row without mutating input", () => {
    const rows = [{ id: 1, name: "Sam Okafor", email: "sam@site.ca", n: 3 }];
    const masked = maskPeople(rows);
    expect(masked[0]).toEqual({
      id: 1,
      name: "Sam O.",
      email: "s•••@s•••.ca",
      n: 3,
    });
    expect(rows[0].name).toBe("Sam Okafor");
  });
});
