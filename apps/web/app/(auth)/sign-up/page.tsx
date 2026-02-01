import { SignUpForm } from "@/components/auth/sign-up-form";
import { Metadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://orylo.app";

export const metadata: Metadata = {
  title: "Sign Up",
  description:
    "Create your Orylo account and start protecting your Stripe transactions with AI-powered fraud detection.",
  alternates: {
    canonical: "/sign-up",
  },
  openGraph: {
    title: "Sign Up | Orylo",
    description:
      "Create your Orylo account and start protecting your Stripe transactions with AI-powered fraud detection.",
    url: `${baseUrl}/sign-up`,
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

export default function SignUpPage() {
  return <SignUpForm />;
}
