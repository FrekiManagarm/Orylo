"use client";

import { z } from "zod";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

import { resetPassword } from "@/lib/auth/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel, FieldError, FieldContent } from "../ui/field";
import { LoaderCircle, ArrowLeft } from "lucide-react";

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, {
      message: "Le mot de passe doit contenir au moins 8 caractères.",
    }),
    confirmPassword: z.string().min(8, {
      message: "Le mot de passe doit contenir au moins 8 caractères.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });

export function ResetPasswordForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const form = useForm({
    validators: {
      onSubmit: resetPasswordSchema,
    },
    onSubmit: async (values) => {
      await onSubmit(values.value);
    },
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof resetPasswordSchema>) {
    setIsLoading(true);
    try {
      await resetPassword({
        newPassword: values.password,
      }, {
        onSuccess() {
          toast.success("Mot de passe réinitialisé !");
          router.push("/sign-in");
        },
        onError(error) {
          toast.error("Erreur", {
            description: error.error.message || "Impossible de réinitialiser le mot de passe.",
          });
        }
      });
    } catch (err) {
      toast.error("Une erreur est survenue", {
        description: "Veuillez réessayer plus tard.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full border-white/10 bg-zinc-900/50 backdrop-blur-xl shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-white">
          Réinitialisation
        </CardTitle>
        <CardDescription className="text-center text-zinc-400">
          Entrez votre nouveau mot de passe
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="reset-password-form" onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }} className="space-y-4">
          <FieldGroup>
            <form.Field
              name="password"
            >
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field>
                    <FieldLabel className="text-zinc-300">
                      Nouveau mot de passe
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        id={field.name}
                        name={field.name}
                        onBlur={field.handleBlur}
                        value={field.state.value}
                        aria-invalid={isInvalid}
                        type="password"
                        placeholder="••••••••"
                        className="bg-zinc-900/50 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-indigo-500"
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </FieldContent>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            </form.Field>
            <form.Field
              name="confirmPassword"
            >
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field>
                    <FieldLabel className="text-zinc-300">
                      Confirmer le mot de passe
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        id={field.name}
                        name={field.name}
                        onBlur={field.handleBlur}
                        value={field.state.value}
                        aria-invalid={isInvalid}
                        type="password"
                        placeholder="••••••••"
                        className="bg-zinc-900/50 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-indigo-500"
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </FieldContent>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            </form.Field>
            <Button
              type="submit"
              className="w-full bg-white text-black hover:bg-zinc-200"
              disabled={isLoading}
            >
              {isLoading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
              Réinitialiser le mot de passe
            </Button>
            <Button
              variant="link"
              className="w-full font-normal text-zinc-400 hover:text-white"
            >
              <Link href="/sign-in">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à la connexion
              </Link>
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card >
  );
}
