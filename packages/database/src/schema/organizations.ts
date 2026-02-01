import { InferInsertModel, InferSelectModel, relations } from "drizzle-orm";
import {
  boolean,
  decimal,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { member } from "./members";
import { invitation } from "./invitations";

// ==========================================
// ORGANIZATION ONBOARDING CONFIG TYPE
// ==========================================
export interface OrganizationOnboardingConfig {
  // Platform type
  platformType?:
  | "marketplace"
  | "saas_b2b"
  | "saas_b2c"
  | "ecommerce"
  | "payment_platform"
  | "other";
  platformTypeOther?: string;

  // Customer creation strategy
  customerCreationStrategy?:
  | "first_payment"
  | "registration"
  | "manual"
  | "not_applicable"
  | "other";
  customerCreationStrategyOther?: string;

  // Business information
  monthlyTransactionVolume?:
  | "0-1k"
  | "1k-10k"
  | "10k-100k"
  | "100k-1M"
  | "1M+";
  averageTransactionAmount?:
  | "0-50"
  | "50-200"
  | "200-500"
  | "500-1000"
  | "1000+";
}

// ==========================================
// ORGANIZATION SETTINGS TYPE
// ==========================================
export interface OrganizationSettings {
  // Alert preferences
  emailAlerts?: boolean;
  slackWebhookUrl?: string;
  discordWebhookUrl?: string;
  alertSeverityThreshold?: "INFO" | "WARNING" | "HIGH" | "CRITICAL";

  // Detection settings
  autoBlock?: boolean;
  autoBlockThreshold?: number; // risk score
  reviewThreshold?: number; // risk score
  blockThreshold?: number; // risk score
  require3DSScore?: number; // risk score for 3DS
  whitelistTrustedCustomers?: boolean;
  shadowMode?: boolean; // analyze but don't block

  // Custom rules
  customRules?: Array<{
    id: string;
    name: string;
    enabled: boolean;
  }>;

  // Notifications
  notifyOnBlock?: boolean;
  notifyOnReview?: boolean;
  dailySummary?: boolean;
}

// ==========================================
// ORGANIZATION TABLE
// ==========================================
export const organization = pgTable(
  "organization",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    logo: text("logo"),
    createdAt: timestamp("created_at").notNull(),
    metadata: text("metadata"),

    // Contact Information
    phoneNumber: text("phone_number"),

    // ==========================================
    // STRIPE CONNECT OAUTH
    // ==========================================
    stripeAccountId: text("stripe_account_id").unique(),
    stripeAccessToken: text("stripe_access_token"),
    stripeRefreshToken: text("stripe_refresh_token"),
    stripeScope: text("stripe_scope"),
    stripeConnectedAt: timestamp("stripe_connected_at"),

    // Webhook configuration
    webhookEndpointId: text("webhook_endpoint_id"),
    webhookSecret: text("webhook_secret"),

    // ==========================================
    // SUBSCRIPTION & BILLING
    // ==========================================
    plan: text("plan").default("free").notNull(), // free, pro, business, enterprise
    planPeriod: text("plan_period").default("monthly").notNull(), // monthly, annual
    subscriptionStatus: text("subscription_status"), // active, canceled, past_due, trialing
    stripeSubscriptionId: text("stripe_subscription_id"),
    stripeCustomerId: text("stripe_customer_id"), // Stripe Customer ID for billing
    currentPeriodStart: timestamp("current_period_start"),
    currentPeriodEnd: timestamp("current_period_end"),
    cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false).notNull(),

    // Trial
    trialStartedAt: timestamp("trial_started_at"),
    trialEndsAt: timestamp("trial_ends_at"),

    // ==========================================
    // USAGE & LIMITS
    // ==========================================
    monthlyTransactionLimit: integer("monthly_transaction_limit")
      .default(1000)
      .notNull(),
    transactionsThisMonth: integer("transactions_this_month")
      .default(0)
      .notNull(),
    monthlyResetDate: timestamp("monthly_reset_date"),

    // ==========================================
    // EARLY BIRD PRICING LOCK
    // ==========================================
    hasEarlyBirdPricing: boolean("has_early_bird_pricing")
      .default(false)
      .notNull(),
    earlyBirdPrice: decimal("early_bird_price", { precision: 10, scale: 2 }),
    earlyBirdLockedAt: timestamp("early_bird_locked_at"),

    // ==========================================
    // SETTINGS (JSONB)
    // ==========================================
    settings: jsonb("settings")
      .$type<OrganizationSettings>()
      .default({
        emailAlerts: true,
        autoBlock: true,
        autoBlockThreshold: 80,
        reviewThreshold: 60,
        blockThreshold: 80,
        require3DSScore: 70,
        whitelistTrustedCustomers: true,
        notifyOnBlock: true,
        notifyOnReview: true,
        shadowMode: false,
      })
      .notNull(),

    // ==========================================
    // ONBOARDING & METADATA
    // ==========================================
    onboardingCompleted: boolean("onboarding_completed").default(false).notNull(),
    onboardingConfig: jsonb("onboarding_config").$type<OrganizationOnboardingConfig>(),
    firstTransactionAt: timestamp("first_transaction_at"),

    // ==========================================
    // TIMESTAMPS
    // ==========================================
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("organization_stripe_account_idx").on(table.stripeAccountId),
    index("organization_plan_idx").on(table.plan),
    index("organization_subscription_status_idx").on(table.subscriptionStatus),
    index("organization_slug_idx").on(table.slug),
  ]
);

// ==========================================
// RELATIONS
// ==========================================
export const organizationRelations = relations(organization, ({ many }) => ({
  members: many(member),
  invitations: many(invitation),
}));

// ==========================================
// TYPES & SCHEMAS
// ==========================================
export type Organization = InferSelectModel<typeof organization>;
export type NewOrganization = InferInsertModel<typeof organization>;

export const organizationInsertSchema = createInsertSchema(organization);
export const organizationSelectSchema = createSelectSchema(organization);