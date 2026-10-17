import type { AdapterAccountType } from "@auth/core/adapters";
import {
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  locale: text("locale").default("en"),
  lastCorridorId: text("lastCorridorId"),
  /** Trip kit / full lesson & quiz access (purchase or grant). */
  fullAccess: integer("fullAccess").notNull().default(0),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  }),
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const entitlements = pgTable("entitlement", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  corridorId: text("corridorId"),
  validUntil: timestamp("validUntil", { mode: "date" }).notNull(),
  providerRef: text("providerRef"),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
});

export const payments = pgTable("payment", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  sku: text("sku").notNull(),
  corridorId: text("corridorId"),
  amountIdr: integer("amountIdr").notNull(),
  status: text("status").notNull(),
  provider: text("provider"),
  providerRef: text("providerRef"),
  qrisString: text("qrisString"),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow(),
});

export const learningProgress = pgTable(
  "learning_progress",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    corridorId: text("corridorId").notNull(),
    itemType: text("itemType").notNull(),
    itemId: text("itemId").notNull(),
    stepIndex: integer("stepIndex").notNull().default(0),
    totalSteps: integer("totalSteps").notNull().default(0),
    completed: integer("completed").notNull().default(0),
    scoreCorrect: integer("scoreCorrect"),
    scoreTotal: integer("scoreTotal"),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow(),
  },
  (row) => ({
    compoundKey: primaryKey({
      columns: [row.userId, row.corridorId, row.itemType, row.itemId],
    }),
  }),
);

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => ({
    compositePk: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  }),
);
