// Reward status levels, based on lifetime points earned.

export interface RewardTier {
  name: string;
  min: number;
  blurb: string;
}

export const REWARD_TIERS: RewardTier[] = [
  { name: "Seedling", min: 0, blurb: "Every journey starts somewhere." },
  { name: "Sapling", min: 1000, blurb: "You're putting down roots." },
  { name: "Evergreen", min: 5000, blurb: "A regular on the green road." },
  { name: "Forest", min: 15000, blurb: "Our most committed drivers." },
];

export function tierFor(lifetimePoints: number) {
  let index = 0;
  REWARD_TIERS.forEach((tier, i) => {
    if (lifetimePoints >= tier.min) index = i;
  });
  const current = REWARD_TIERS[index];
  const next = REWARD_TIERS[index + 1] ?? null;
  const progress = next
    ? Math.min(1, (lifetimePoints - current.min) / (next.min - current.min))
    : 1;
  return {
    current,
    next,
    progress,
    pointsToNext: next ? Math.max(0, next.min - lifetimePoints) : 0,
  };
}
