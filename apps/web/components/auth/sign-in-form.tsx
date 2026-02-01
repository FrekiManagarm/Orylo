"use client";

import { z } from "zod";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { signIn } from "@/lib/auth/auth-client";
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
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
  FieldContent,
} from "@/components/ui/field";
import { LoaderCircle } from "lucide-react";

const signInSchema = z.object({
  email: z.email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
});

export function SignInForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    validators: {
      onSubmit: signInSchema,
    },
    onSubmit: async (values) => {
      await onSubmit(values.value);
    },
    defaultValues: {
      email: "",
      password: "",
    } as z.infer<typeof signInSchema>,
  });

  async function onSubmit(values: z.infer<typeof signInSchema>) {
    setIsLoading(true);
    try {
      await signIn.email({
        email: values.email,
        password: values.password,
        callbackURL: "/dashboard",
      }, {
        onSuccess() {
          toast.success("Connexion réussie !");
          router.push("/dashboard");
        },
        onError(error) {
          toast.error("Erreur de connexion", {
            description: error.error.message || "Identifiants invalides.",
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
          Connexion
        </CardTitle>
        <CardDescription className="text-center text-zinc-400">
          Entrez vos identifiants pour accéder à votre compte
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="sign-in-form" onSubmit={(e) => {
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
                  <Field>
                    <FieldLabel className="text-zinc-300">Email</FieldLabel>
                    <FieldContent>
                      <Input
                        placeholder="m@example.com"
                        className="bg-zinc-900/50 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-indigo-500"
                        id={field.name}
                        name={field.name}
                        onBlur={field.handleBlur}
                        value={field.state.value}
                        aria-invalid={isInvalid}
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
              name="password"
            >
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field>
                    <FieldLabel className="flex items-center justify-between text-zinc-300">
                      Mot de passe
                      <Link
                        href="/forgot-password"
                        className="text-sm font-medium text-indigo-400 hover:text-indigo-300 hover:underline"
                      >
                        Mot de passe oublié ?
                      </Link>
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="bg-zinc-900/50 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-indigo-500"
                        id={field.name}
                        name={field.name}
                        onBlur={field.handleBlur}
                        value={field.state.value}
                        aria-invalid={isInvalid}
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
              Se connecter
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-zinc-400">
          Vous n&apos;avez pas de compte ?{" "}
          <Link
            href="/sign-up"
            className="font-medium text-indigo-400 hover:text-indigo-300 hover:underline"
          >
            S&apos;inscrire
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
