import { autumnHandler } from "autumn-js/next";
import { auth } from "@/lib/auth/auth";

export const { GET, POST } = autumnHandler({
  identify: async (req) => {
    const organization = await auth.api.getFullOrganization({
      headers: req.headers,
    });

    return {
      customerId: organization?.id,
      customerData: {
        ...organization,
      },
    };
  },
});