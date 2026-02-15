import {
  CreditCard,
  ShoppingBag,
  Wallet,
  Building2,
  Store,
  type LucideIcon,
} from "lucide-react";

export const PAYMENT_PROCESSORS = {
  stripe: "stripe",
  shopify: "shopify",
  mangopay: "mangopay",
  adyen: "adyen",
  lemonSqueezy: "lemonSqueezy",
  checkout: "checkout",
} as const;

export type PaymentProcessorId = keyof typeof PAYMENT_PROCESSORS;

export type PaymentProcessorStatus = "available" | "coming_soon";

export type PaymentProcessorConfig = {
  id: PaymentProcessorId;
  name: string;
  description: string;
  status: PaymentProcessorStatus;
  icon: LucideIcon;
  connectLabel: string;
  docsUrl?: string;
};

export const paymentProcessorConfigs: Record<
  PaymentProcessorId,
  PaymentProcessorConfig
> = {
  stripe: {
    id: "stripe",
    name: "Stripe",
    description: "Connect your Stripe account for real-time fraud detection on payments.",
    status: "available",
    icon: CreditCard,
    connectLabel: "Connect Stripe",
    docsUrl: "https://stripe.com/docs",
  },
  shopify: {
    id: "shopify",
    name: "Shopify",
    description: "Connect your Shopify store to analyze orders and payments.",
    status: "coming_soon",
    icon: ShoppingBag,
    connectLabel: "Connect Shopify",
    docsUrl: "https://shopify.dev/docs",
  },
  mangopay: {
    id: "mangopay",
    name: "Mangopay",
    description: "Connect your Mangopay platform for marketplace payment fraud detection.",
    status: "coming_soon",
    icon: Wallet,
    connectLabel: "Connect Mangopay",
    docsUrl: "https://docs.mangopay.com",
  },
  adyen: {
    id: "adyen",
    name: "Adyen",
    description: "Connect your Adyen account for unified payment fraud detection.",
    status: "coming_soon",
    icon: Building2,
    connectLabel: "Connect Adyen",
    docsUrl: "https://docs.adyen.com",
  },
  lemonSqueezy: {
    id: "lemonSqueezy",
    name: "Lemon Squeezy",
    description: "Connect your Lemon Squeezy store for digital product & SaaS fraud detection.",
    status: "coming_soon",
    icon: Store,
    connectLabel: "Connect Lemon Squeezy",
    docsUrl: "https://docs.lemonsqueezy.com",
  },
  checkout: {
    id: "checkout",
    name: "Checkout.com",
    description: "Connect your Checkout.com account for payment fraud detection.",
    status: "coming_soon",
    icon: CreditCard,
    connectLabel: "Connect Checkout.com",
    docsUrl: "https://www.checkout.com/docs",
  },
};

export const paymentProcessorList = Object.values(paymentProcessorConfigs);
