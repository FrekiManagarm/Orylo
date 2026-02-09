import { SignInView } from "@/components/auth/sign-in-view";
import { Metadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://orylo.app";

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in to your Orylo account to access fraud detection and transaction protection features.",
  alternates: {
    canonical: "/sign-in",
  },
  openGraph: {
    title: "Sign In | Orylo",
    description:
      "Sign in to your Orylo account to access fraud detection and transaction protection features.",
    url: `${baseUrl}/sign-in`,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function SignInPage() {
  return <SignInView />;
}
