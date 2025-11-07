export type Json = unknown;
export type body_type =
  | "Convertible"
  | "Coupe"
  | "Hatchback"
  | "Sedan"
  | "Suv"
  | "Truck"
  | "Van";
export type booking_status_type =
  | "Cancelled"
  | "Completed"
  | "Confirmed"
  | "Pending";
export type fuel_type = "Diesel" | "Electric" | "Hybrid" | "Petrol";
export type reward_transaction_type = "Adjusted" | "Earned" | "Redeemed";
export type transaction_type_enum = "adjustment" | "earn" | "redeem";
export type transmission_type = "Automatic" | "Manual";
export type passenger_capacity = 2 | 4 | 5 | 6 | 7 | 8;

// Table account
export interface Account {
  id: string;
  accountId: string;
  providerId: string;
  userId: string;
  accessToken: string | null;
  refreshToken: string | null;
  idToken: string | null;
  accessTokenExpiresAt: Date | null;
  refreshTokenExpiresAt: Date | null;
  scope: string | null;
  password: string | null;
  createdAt: Date;
  updatedAt: Date;
}
export interface AccountInput {
  id: string;
  accountId: string;
  providerId: string;
  userId: string;
  accessToken?: string | null;
  refreshToken?: string | null;
  idToken?: string | null;
  accessTokenExpiresAt?: Date | null;
  refreshTokenExpiresAt?: Date | null;
  scope?: string | null;
  password?: string | null;
  createdAt?: Date;
  updatedAt: Date;
}
const account = {
  tableName: "account",
  columns: [
    "id",
    "accountId",
    "providerId",
    "userId",
    "accessToken",
    "refreshToken",
    "idToken",
    "accessTokenExpiresAt",
    "refreshTokenExpiresAt",
    "scope",
    "password",
    "createdAt",
    "updatedAt",
  ],
  requiredForInsert: ["id", "accountId", "providerId", "userId", "updatedAt"],
  primaryKey: "id",
  foreignKeys: {
    userId: { table: "user", column: "id", $type: null as unknown as User },
  },
  $type: null as unknown as Account,
  $input: null as unknown as AccountInput,
} as const;

// Table bookings
export interface Bookings {
  id: string;
  user_id: string;
  car_id: string;
  start_date: Date;
  end_date: Date;
  sub_total: number;
  total_price: number;
  status: booking_status_type;
  created_at: Date;
  updated_at: Date;
}
export interface BookingsInput {
  id?: string;
  user_id: string;
  car_id: string;
  start_date: Date;
  end_date: Date;
  total_price: number;
  status?: booking_status_type;
  created_at?: Date;
  updated_at?: Date;
}
const bookings = {
  tableName: "bookings",
  columns: [
    "id",
    "user_id",
    "car_id",
    "start_date",
    "end_date",
    "total_price",
    "status",
    "created_at",
    "updated_at",
  ],
  requiredForInsert: [
    "user_id",
    "car_id",
    "start_date",
    "end_date",
    "total_price",
  ],
  primaryKey: "id",
  foreignKeys: {
    car_id: { table: "cars", column: "id", $type: null as unknown as Cars },
  },
  $type: null as unknown as Bookings,
  $input: null as unknown as BookingsInput,
} as const;

// Table branches
export interface Branches {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  province: string | null;
  postal_code: string | null;
  created_at: Date;
  updated_at: Date;
}
export interface BranchesInput {
  id?: string;
  name: string;
  address?: string | null;
  city?: string | null;
  province?: string | null;
  postal_code?: string | null;
  created_at?: Date;
  updated_at?: Date;
}
const branches = {
  tableName: "branches",
  columns: [
    "id",
    "name",
    "address",
    "city",
    "province",
    "postal_code",
    "created_at",
    "updated_at",
  ],
  requiredForInsert: ["name"],
  primaryKey: "id",
  foreignKeys: {},
  $type: null as unknown as Branches,
  $input: null as unknown as BranchesInput,
} as const;

// Table cars
export interface Cars {
  id: string;
  branch_id: string;
  brand: string;
  model: string;
  transmission: transmission_type;
  fuel_type: fuel_type;
  passenger_capacity: number;
  body_type: body_type;
  carbon_emissions: number;
  price_per_day: number;
  available: boolean;
  image: string;
  created_at: Date;
  updated_at: Date;
}
export interface CarsInput {
  id?: string;
  branch_id?: string;
  brand: string;
  model: string;
  transmission?: transmission_type;
  fuel_type?: fuel_type;
  passenger_capacity: number;
  body_type?: body_type;
  carbon_emissions?: number;
  price_per_day: number;
  available?: boolean;
  image?: string;
  created_at?: Date;
  updated_at?: Date;
}
const cars = {
  tableName: "cars",
  columns: [
    "id",
    "branch_id",
    "brand",
    "model",
    "transmission",
    "fuel_type",
    "passenger_capacity",
    "body_type",
    "carbon_emissions",
    "price_per_day",
    "available",
    "image",
    "created_at",
    "updated_at",
  ],
  requiredForInsert: ["brand", "model", "price_per_day"],
  primaryKey: "id",
  foreignKeys: {
    branch_id: {
      table: "branches",
      column: "id",
      $type: null as unknown as Branches,
    },
  },
  $type: null as unknown as Cars,
  $input: null as unknown as CarsInput,
} as const;

// Table rewardshistory
export interface Rewardshistory {
  id: string;
  user_id: string;
  booking_id: string | null;
  points: number;
  transaction_type: reward_transaction_type;
  created_at: Date;
}
export interface RewardshistoryInput {
  id?: string;
  user_id: string;
  booking_id?: string | null;
  points: number;
  transaction_type: reward_transaction_type;
  created_at?: Date;
}
const rewardshistory = {
  tableName: "rewardshistory",
  columns: [
    "id",
    "user_id",
    "booking_id",
    "points",
    "transaction_type",
    "created_at",
  ],
  requiredForInsert: ["user_id", "points", "transaction_type"],
  primaryKey: "id",
  foreignKeys: {
    user_id: { table: "user", column: "id", $type: null as unknown as User },
    booking_id: {
      table: "bookings",
      column: "id",
      $type: null as unknown as Bookings,
    },
  },
  $type: null as unknown as Rewardshistory,
  $input: null as unknown as RewardshistoryInput,
} as const;

// Table session
export interface Session {
  id: string;
  expiresAt: Date;
  token: string;
  createdAt: Date;
  updatedAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
  userId: string;
  impersonatedBy: string | null;
}
export interface SessionInput {
  id: string;
  expiresAt: Date;
  token: string;
  createdAt?: Date;
  updatedAt: Date;
  ipAddress?: string | null;
  userAgent?: string | null;
  userId: string;
  impersonatedBy?: string | null;
}
const session = {
  tableName: "session",
  columns: [
    "id",
    "expiresAt",
    "token",
    "createdAt",
    "updatedAt",
    "ipAddress",
    "userAgent",
    "userId",
    "impersonatedBy",
  ],
  requiredForInsert: ["id", "expiresAt", "token", "updatedAt", "userId"],
  primaryKey: "id",
  foreignKeys: {
    userId: { table: "user", column: "id", $type: null as unknown as User },
  },
  $type: null as unknown as Session,
  $input: null as unknown as SessionInput,
} as const;

// Table user
export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  role: string | null;
  banned: boolean | null;
  banReason: string | null;
  banExpires: Date | null;
  reward_points: number;
}
export interface UserInput {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  role?: string | null;
  banned?: boolean | null;
  banReason?: string | null;
  banExpires?: Date | null;
  reward_points: number;
}
const user = {
  tableName: "user",
  columns: [
    "id",
    "name",
    "email",
    "emailVerified",
    "image",
    "createdAt",
    "updatedAt",
    "role",
    "banned",
    "banReason",
    "banExpires",
    "reward_points",
  ],
  requiredForInsert: ["id", "name", "email", "emailVerified", "reward_points"],
  primaryKey: "id",
  foreignKeys: {},
  $type: null as unknown as User,
  $input: null as unknown as UserInput,
} as const;

// Table verification
export interface Verification {
  id: string;
  identifier: string;
  value: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
export interface VerificationInput {
  id: string;
  identifier: string;
  value: string;
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
const verification = {
  tableName: "verification",
  columns: ["id", "identifier", "value", "expiresAt", "createdAt", "updatedAt"],
  requiredForInsert: ["id", "identifier", "value", "expiresAt"],
  primaryKey: "id",
  foreignKeys: {},
  $type: null as unknown as Verification,
  $input: null as unknown as VerificationInput,
} as const;

export interface TableTypes {
  account: {
    select: Account;
    input: AccountInput;
  };
  bookings: {
    select: Bookings;
    input: BookingsInput;
  };
  branches: {
    select: Branches;
    input: BranchesInput;
  };
  cars: {
    select: Cars;
    input: CarsInput;
  };
  rewardshistory: {
    select: Rewardshistory;
    input: RewardshistoryInput;
  };
  session: {
    select: Session;
    input: SessionInput;
  };
  user: {
    select: User;
    input: UserInput;
  };
  verification: {
    select: Verification;
    input: VerificationInput;
  };
}

export const tables = {
  account,
  bookings,
  branches,
  cars,
  rewardshistory,
  session,
  user,
  verification,
};
