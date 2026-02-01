"use client";

import { z } from "zod";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

import { signUp } from "@/lib/auth/auth-client";
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
} from "../ui/field";
import { LoaderCircle } from "lucide-react";

const signUpSchema = z.object({
  name: z.string().min(2, {
    message: "Le nom doit contenir au moins 2 caractères.",
  }),
  email: z.email({
    message: "Veuillez entrer une adresse email valide.",
  }),
  password: z.string().min(8, {
    message: "Le mot de passe doit contenir au moins 8 caractères.",
  }),
});

export function SignUpForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    validators: {
      onSubmit: signUpSchema,
    },
    onSubmit: async (values) => {
      await onSubmit(values.value);
    },
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof signUpSchema>) {
    setIsLoading(true);
    try {
      await signUp.email({
        email: values.email,
        password: values.password,
        name: values.name,
        callbackURL: "/dashboard",
      }, {
        onSuccess() {
          toast.success("Compte créé avec succès !");
          router.push("/dashboard");
        },
        onError(error) {
          toast.error("Erreur d'inscription", {
            description: error.error.message || "Une erreur est survenue lors de l'inscription.",
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
          Créer un compte
        </CardTitle>
        <CardDescription className="text-center text-zinc-400">
          Commencez votre expérience Orylo dès aujourd&apos;hui
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="sign-up-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }} className="space-y-4">
          <FieldGroup>
            <form.Field
              name="name"
            >
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field>
                    <FieldLabel className="text-zinc-300">Nom complet</FieldLabel>
                    <FieldContent>
                      <Input
                        placeholder="John Doe"
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
                    <FieldLabel className="text-zinc-300">Mot de passe</FieldLabel>
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
              S&apos;inscrire
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-zinc-400">
          Vous avez déjà un compte ?{" "}
          <Link
            href="/sign-in"
            className="font-medium text-indigo-400 hover:text-indigo-300 hover:underline"
          >
            Se connecter
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
