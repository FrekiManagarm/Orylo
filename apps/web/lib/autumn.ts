import { transactions } from "@/autumn.config";
import { Autumn } from "autumn-js";

export const autumn = new Autumn({
  secretKey: process.env.AUTUMN_SECRET_KEY,
});

/**
 * Check if organization has reached transaction limits
 */
export async function checkTransactionsLimit(organizationId: string) {
  try {
    const response = await autumn.check({
      customer_id: organizationId,
      feature_id: transactions.id,
    });

    // Autumn returns a Result type with data property
    const data = response.data;

    return {
      allowed: data?.allowed,
      used: data?.balance,
      limit: data?.included_usage,
    };
  } catch (error) {
    console.error("Error checking Autumn limits:", error);
    // Fail open - allow transactions if Autumn is down
    return {
      allowed: true,
      used: 0,
      limit: 999999,
    };
  }
}

/**
 * Increment transaction usage counter
 */
export async function incrementUsage(organizationId: string) {
  try {
    await autumn.track({
      customer_id: organizationId,
      feature_id: transactions.id,
      value: 1,
    });

    console.log(
      `📊 Incremented usage for org ${organizationId}: +1 transaction(s)`,
    );
  } catch (error) {
    console.error("Error incrementing Autumn usage:", error);
    // Log but don't fail the transaction
  }
}

/**
 * Get customer billing data including subscription and usage
 */
export async function getBillingData(organizationId: string) {
  try {
    const customerResponse = await autumn.customers.get(organizationId, {
      expand: ["payment_method", "invoices"],
    });
    const customer = customerResponse.data;

    if (!customer) {
      throw new Error("Customer not found");
    }

    // Get transaction usage
    const transactionCheck = await autumn.check({
      customer_id: organizationId,
      feature_id: transactions.id,
    });

    const transactionData = transactionCheck.data;

    // Get active product from customer.products array
    const activeProduct = customer.products.find(
      (p) => p.status === "active" || p.status === "trialing",
    );

    return {
      plan: activeProduct?.name || "Free",
      price: "0 €/mois", // Price info not directly available in Customer type
      interval: "month",
      nextInvoice: null, // Next invoice info not available in Customer type
      invoices: customer.invoices || [],
      usage: {
        transactions: transactionData?.balance || 0,
        limit: transactionData?.included_usage || 0,
      },
      paymentMethod: customer.payment_method || null,
      status: activeProduct?.status || "active",
    };
  } catch (error) {
    console.error("Error fetching billing data:", error);
    throw error;
  }
}

/**
 * Get billing portal URL for customer
 */
export async function getBillingPortalUrl(organizationId: string) {
  try {
    const response = await autumn.customers.billingPortal(organizationId);

    return response.data?.url;
  } catch (error) {
    console.error("Error getting billing portal URL:", error);
    throw error;
  }
}