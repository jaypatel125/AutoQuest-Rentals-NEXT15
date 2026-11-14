// Masks personal details for viewers who may browse admin data but should
// not see who the customers are (the read-only reviewer role).

/** "jordan.rivers@gmail.com" -> "j•••@g•••.com" */
export function maskEmail(email: string | null | undefined) {
  if (!email) return email ?? null;
  const at = email.lastIndexOf("@");
  if (at < 1) return "•••";
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  const dot = domain.lastIndexOf(".");
  const host = dot > 0 ? domain.slice(0, dot) : domain;
  const tld = dot > 0 ? domain.slice(dot) : "";
  return `${local[0]}•••@${host[0] ?? ""}•••${tld}`;
}

/** "Jordan Rivers" -> "Jordan R." and "Cher" -> "Cher" */
export function maskName(name: string | null | undefined) {
  if (!name) return name ?? null;
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]?.toUpperCase()}.`;
}

/** Returns a copy of each row with its name and email fields masked. */
export function maskPeople<T extends Record<string, unknown>>(
  rows: T[],
  fields: { name?: string[]; email?: string[] } = {
    name: ["name"],
    email: ["email"],
  }
): T[] {
  return rows.map((row) => {
    const copy: Record<string, unknown> = { ...row };
    for (const key of fields.name ?? []) {
      if (typeof copy[key] === "string") copy[key] = maskName(copy[key]);
    }
    for (const key of fields.email ?? []) {
      if (typeof copy[key] === "string") copy[key] = maskEmail(copy[key]);
    }
    return copy as T;
  });
}
