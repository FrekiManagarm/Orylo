"use client";

import { z } from "zod";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { requestPasswordReset } from "@/lib/auth/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel, FieldError, FieldContent } from "../ui/field";
import { LoaderCircle, ArrowLeft } from "lucide-react";

const forgotPasswordSchema = z.object({
  email: z.email({
    message: "Veuillez entrer une adresse email valide.",
  }),
});

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm({
    validators: {
      onSubmit: forgotPasswordSchema,
    },
    onSubmit: async (values) => {
      await onSubmit(values.value);
    },
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof forgotPasswordSchema>) {
    setIsLoading(true);
    try {
      await requestPasswordReset({
        email: values.email,
        redirectTo: "/reset-password",
      }, {
        onSuccess() {
          setIsSubmitted(true);
          toast.success("Email envoyé !");
        },
        onError(error) {
          toast.error("Erreur", {
            description: error.error.message || "Une erreur est survenue.",
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

  if (isSubmitted) {
    return (
      <Card className="w-full border-white/10 bg-zinc-900/50 backdrop-blur-xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-white">
            Email envoyé
          </CardTitle>
          <CardDescription className="text-center text-zinc-400">
            Si un compte existe avec cette adresse email, vous recevrez un lien
            pour réinitialiser votre mot de passe.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center">
          <Button
            variant="ghost"
            className="w-full text-zinc-300 hover:text-white hover:bg-white/10"
          >
            <Link href="/sign-in">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la connexion
            </Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full border-white/10 bg-zinc-900/50 backdrop-blur-xl shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-white">
          Mot de passe oublié
        </CardTitle>
        <CardDescription className="text-center text-zinc-400">
          Entrez votre email pour recevoir un lien de réinitialisation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }} className="space-y-4">
          <FieldGroup>
            <form.Field
              name="email"
            >
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel className="text-zinc-300">Email</FieldLabel>
                    <FieldContent>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="email"
                        onBlur={field.handleBlur}
                        value={field.state.value}
                        aria-invalid={isInvalid}
                        placeholder="m@example.com"
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
              Envoyer le lien
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button
          variant="link"
          className="px-0 font-normal text-zinc-400 hover:text-white"
        >
          <Link href="/sign-in">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la connexion
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
