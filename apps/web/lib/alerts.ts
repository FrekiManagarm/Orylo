/**
 * Email Alerts via Resend (Optional)
 * 
 * Story 3.3 AC6: Alerting rules via email
 * 
 * Condition: Include alerts if budget allows (€15/month)
 * Installation required: bun add resend
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let resend: any = null; // Resend client type (optional dependency)

function getResend() {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }

  if (!resend) {
    try {
      // Dynamic import to avoid errors if package not installed
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { Resend } = require("resend");
      resend = new Resend(process.env.RESEND_API_KEY);
    } catch {
      console.warn("[Alerts] Resend package not installed. Run: bun add resend");
      return null;
    }
  }

  return resend;
}

/**
 * Send alert email
 */
export async function sendAlertEmail(subject: string, message: string) {
  const client = getResend();
  if (!client) {
    console.warn("[Alerts] Resend not configured, skipping email alert");
    return;
  }

  if (!process.env.ADMIN_EMAIL) {
    console.warn("[Alerts] ADMIN_EMAIL not configured");
    return;
  }

  try {
    await client.emails.send({
      from: "alerts@orylo.com",
      to: process.env.ADMIN_EMAIL,
      subject,
      text: message,
    });
    console.log(`[Alerts] Email sent: ${subject}`);
  } catch (error) {
    console.error("[Alerts] Failed to send email:", error);
  }
}

/**
 * Alert on auto-blacklist (Story 3.2 integration)
 */
export async function alertAutoBlacklist(
  customerId: string,
  chargebacks: number
) {
  await sendAlertEmail(
    "Customer Auto-Blacklisted",
    `Customer ${customerId} was auto-blacklisted after ${chargebacks} chargebacks.`
  );
}
