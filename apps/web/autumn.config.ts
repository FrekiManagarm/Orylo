import {
  feature,
  product,
  featureItem,
  pricedFeatureItem,
  priceItem,
} from "atmn";

// Features
export const transactions = feature({
  id: "transactions",
  name: "Transactions",
  type: "single_use",
});

export const apiAccess = feature({
  id: "api_access",
  name: "API Access",
  type: "boolean",
});

export const priorityEmailSupport = feature({
  id: "priority_email_support",
  name: "Priority Email Support",
  type: "boolean",
});

export const rules = feature({
  id: "rules",
  name: "Rules",
  type: "single_use",
});

export const stripeAccounts = feature({
  id: "stripe_accounts",
  name: "Stripe Accounts",
  type: "single_use",
});

export const daysHistory = feature({
  id: "days_history",
  name: "Days history",
  type: "single_use",
});

export const slackdiscordAlerts = feature({
  id: "slackdiscord_alerts",
  name: "Slack/Discord alerts",
  type: "boolean",
});

// Products
export const freePlan = product({
  id: "free_plan",
  name: "Free plan",
  is_default: true,
  items: [
    featureItem({
      feature_id: daysHistory.id,
      included_usage: 7,
    }),

    featureItem({
      feature_id: transactions.id,
      included_usage: 1000,
      interval: "month",
    }),
  ],
});

export const proMonthly = product({
  id: "pro_monthly",
  name: "Pro Monthly",
  items: [
    priceItem({
      price: 39,
      interval: "month",
    }),

    featureItem({
      feature_id: daysHistory.id,
      included_usage: 30,
    }),

    featureItem({
      feature_id: priorityEmailSupport.id,
      included_usage: 0,
    }),

    featureItem({
      feature_id: rules.id,
      included_usage: 3,
    }),

    featureItem({
      feature_id: stripeAccounts.id,
      included_usage: 5,
    }),

    featureItem({
      feature_id: transactions.id,
      included_usage: "inf",
    }),
  ],
});

export const businessMonthly = product({
  id: "business_monthly",
  name: "Business Monthly",
  items: [
    priceItem({
      price: 99,
      interval: "month",
    }),

    featureItem({
      feature_id: apiAccess.id,
      included_usage: 0,
    }),

    featureItem({
      feature_id: daysHistory.id,
      included_usage: 90,
    }),

    featureItem({
      feature_id: priorityEmailSupport.id,
      included_usage: 0,
    }),

    featureItem({
      feature_id: rules.id,
      included_usage: "inf",
    }),

    featureItem({
      feature_id: slackdiscordAlerts.id,
      included_usage: 0,
    }),

    featureItem({
      feature_id: stripeAccounts.id,
      included_usage: "inf",
    }),

    featureItem({
      feature_id: transactions.id,
      included_usage: "inf",
    }),
  ],
});

export const proYearly = product({
  id: "pro_yearly",
  name: "Pro Yearly",
  items: [
    priceItem({
      price: 351,
      interval: "year",
    }),

    featureItem({
      feature_id: daysHistory.id,
      included_usage: 30,
    }),

    featureItem({
      feature_id: priorityEmailSupport.id,
      included_usage: 0,
    }),

    featureItem({
      feature_id: rules.id,
      included_usage: 3,
    }),

    featureItem({
      feature_id: stripeAccounts.id,
      included_usage: 5,
    }),

    featureItem({
      feature_id: transactions.id,
      included_usage: "inf",
    }),
  ],
});

export const businessYearly = product({
  id: "business_yearly",
  name: "Business Yearly",
  items: [
    priceItem({
      price: 891,
      interval: "year",
    }),

    featureItem({
      feature_id: apiAccess.id,
      included_usage: 0,
    }),

    featureItem({
      feature_id: daysHistory.id,
      included_usage: 90,
    }),

    featureItem({
      feature_id: priorityEmailSupport.id,
      included_usage: 0,
    }),

    featureItem({
      feature_id: rules.id,
      included_usage: "inf",
    }),

    featureItem({
      feature_id: slackdiscordAlerts.id,
      included_usage: 0,
    }),

    featureItem({
      feature_id: stripeAccounts.id,
      included_usage: "inf",
    }),

    featureItem({
      feature_id: transactions.id,
      included_usage: "inf",
    }),
  ],
});

export const growthTier7Yearly = product({
  id: "growth_tier_7_yearly",
  name: "Growth Tier 7 Yearly",
  items: [
    priceItem({
      price: 72000,
      interval: "year",
    }),

    featureItem({
      feature_id: "advanced_ai_agents",
      included_usage: 0,
    }),

    featureItem({
      feature_id: apiAccess.id,
      included_usage: 0,
    }),

    featureItem({
      feature_id: priorityEmailSupport.id,
      included_usage: 0,
    }),

    featureItem({
      feature_id: rules.id,
      included_usage: "inf",
    }),

    featureItem({
      feature_id: stripeAccounts.id,
      included_usage: 5,
    }),

    featureItem({
      feature_id: transactions.id,
      included_usage: 1000000,
      interval: "year",
    }),
  ],
});