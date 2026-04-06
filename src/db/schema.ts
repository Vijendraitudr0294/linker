import { pgTable, boolean, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  email: text("email").notNull(),
  slug: text("slug").notNull(),
  isAdmin: boolean("is_admin").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const failedJobs = pgTable("failed_jobs", {
  id: uuid("id").primaryKey(),
  payload: text("payload"),
  error: text("error"),
  failedAt: timestamp("failed_at"),
});

export const socialPosts = pgTable("social_posts", {
  id: uuid("id").primaryKey(),
  status: text("status"),
});

export const customDomains = pgTable("custom_domains", {
  id:         uuid("id").defaultRandom().primaryKey(),
  userId:     uuid("user_id")
                .notNull()
                .references(() => users.id, { onDelete: "cascade" })
                .unique(),
  domain:     text("domain").notNull().unique(),
  verified:   boolean("verified").notNull().default(false),
  txtRecord:  text("txt_record").notNull(),
  createdAt:  timestamp("created_at").defaultNow().notNull(),
  verifiedAt: timestamp("verified_at"),
});
