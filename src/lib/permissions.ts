// Role definitions for better-auth's admin plugin, shared by the server and
// the client so admins can assign any of these roles.
import { adminAc, defaultAc, userAc } from "better-auth/plugins/admin/access";

/**
 * Reviewers get no admin-plugin permissions at all: they read admin data
 * through the app's own API routes, which mask personal details for them.
 */
const reviewerAc = defaultAc.newRole({ user: [], session: [] });

export const roles = {
  admin: adminAc,
  user: userAc,
  reviewer: reviewerAc,
};
