"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { LoaderCircle, LogOut, Shield, Sparkles } from "lucide-react";

import { createOrganization } from "@/lib/actions/organization";
import { signOut } from "@/lib/auth/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel, FieldError, FieldContent } from "../ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const organizationSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters.")
    .max(80, "Name is too long."),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters.")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase with no spaces.",
    ),
  logo: z
    .string()
    .max(256, "URL is too long.")
    .refine(
      (val) => val === "" || z.string().url().safeParse(val).success,
      { message: "Please provide a valid URL." }
    ),
});

type OrganizationFormValues = z.infer<typeof organizationSchema>;

const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 64);

export function CreateOrganizationForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [slugEdited, setSlugEdited] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const form = useForm({
    validators: {
      onSubmit: organizationSchema,
    },
    onSubmit: (values) => onSubmit(values.value),
    defaultValues: {
      name: "",
      slug: "",
      logo: "",
    },
  });

  const onSubmit = (values: OrganizationFormValues) => {
    startTransition(async () => {
      const result = await createOrganization(
        values.name,
        values.slug,
        values.logo?.trim() || "",
      );

      if (!result) {
        toast.error("Erreur lors de la création de l'organisation");
        return;
      }

      toast.success("Organisation créée", {
        description: "Passons maintenant à la configuration.",
      });
      router.push("/onboarding");
    });
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut({
        fetchOptions: {
          onRequest: () => {
            setIsSigningOut(true);
          },
          onSuccess: () => {
            router.push("/sign-in");
          },
          onError: (error) => {
            toast.error("Sign out failed", { description: error.error.message });
          },
          onFinally: () => {
            setIsSigningOut(false);
          }
        }
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to sign out. Please try again.";
      toast.error("Sign out failed", { description: message });
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <Card className="w-full border-white/10 bg-zinc-900/50 backdrop-blur-xl shadow-2xl">
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-indigo-500/10 p-2 border border-indigo-500/30 text-indigo-300">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-white">
                Create your organization
              </CardTitle>
              <CardDescription className="text-zinc-400">
                This workspace will protect your business from fraud.
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-zinc-400 hover:text-white hover:bg-white/10 border border-white/5 rounded-full px-3 py-1.5"
            onClick={handleSignOut}
            disabled={isSigningOut}
          >
            {isSigningOut ? (
              <div className="flex items-center gap-2">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                <span>Signing out…</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
              </div>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="col-span-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
              }}
              className="space-y-4"
            >
              <FieldGroup>
                <form.Field
                  name="name"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field>
                        <FieldLabel className="text-zinc-300">
                          Organization name
                        </FieldLabel>
                        <FieldContent>
                          <Input
                            placeholder="e.g. Acme Payments"
                            className="bg-zinc-900/50 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-indigo-500"
                            id={field.name}
                            name={field.name}
                            onBlur={field.handleBlur}
                            value={field.state.value}
                            aria-invalid={isInvalid}
                            onChange={(e) => {
                              const newValue = e.target.value;
                              field.handleChange(newValue);

                              // Auto-update slug if it hasn't been manually edited
                              if (!slugEdited) {
                                const slugifiedValue = slugify(newValue);
                                form.setFieldValue("slug", slugifiedValue);
                              }
                            }}
                          />
                        </FieldContent>
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                />

                <form.Field
                  name="slug"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field>
                        <FieldLabel className="text-zinc-300">
                          Slug (identifier)
                        </FieldLabel>
                        <FieldContent>
                          <Input
                            placeholder="acme-payments"
                            className="bg-zinc-900/50 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-indigo-500"
                            id={field.name}
                            name={field.name}
                            onBlur={field.handleBlur}
                            value={field.state.value}
                            aria-invalid={isInvalid}
                            onChange={(event) => {
                              setSlugEdited(true);
                              field.handleChange(event.target.value);
                            }}
                          />
                        </FieldContent>
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                />

                <form.Field
                  name="logo"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field>
                        <FieldLabel className="text-zinc-300">
                          Logo URL (optional)
                        </FieldLabel>
                        <FieldContent>
                          <Input
                            id={field.name}
                            name={field.name}
                            placeholder="https://cdn.orylo.app/logo.png"
                            className="bg-zinc-900/50 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-indigo-500"
                            onChange={(e) => field.handleChange(e.target.value)}
                            onBlur={field.handleBlur}
                            value={field.state.value}
                            aria-invalid={isInvalid}
                          />
                        </FieldContent>
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                />

                <Button
                  type="submit"
                  className="w-full bg-white text-black hover:bg-zinc-200"
                  disabled={isPending}
                >
                  {isPending && (
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Launch my secure workspace
                </Button>
              </FieldGroup>
            </form>
          </div>
          <div className="rounded-xl border border-white/10 bg-linear-to-br from-indigo-500/10 via-zinc-900/60 to-zinc-900/60 p-4 shadow-inner space-y-4">
            <div className="flex items-center gap-3 text-indigo-300">
              <Sparkles className="h-4 w-4" />
              <p className="text-sm font-medium">Why create an organization?</p>
            </div>
            <Separator className="bg-white/5" />
            <ul className="space-y-3 text-sm text-zinc-300">
              <li className="flex gap-2">
                <span className="text-indigo-300">•</span>
                Centralize rules, alerts, and Stripe connections.
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-300">•</span>
                Add members and manage your organization permissions.
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-300">•</span>
                Enable fraud protections before opening the dashboard.
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}