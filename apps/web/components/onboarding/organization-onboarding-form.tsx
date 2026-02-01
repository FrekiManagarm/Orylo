"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CreditCard,
  LoaderCircle,
  Settings,
  Users,
} from "lucide-react";

import { updateOrganizationOnboarding } from "@/lib/actions/organization";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldLabel,
  FieldContent,
} from "../ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { RadioGroupItem, RadioGroup } from "../ui/radio-group";

const onboardingSchema = z.object({
  platformType: z.enum([
    "marketplace",
    "saas_b2b",
    "saas_b2c",
    "ecommerce",
    "payment_platform",
    "other",
  ]),
  platformTypeOther: z.string().optional(),
  customerCreationStrategy: z.enum([
    "first_payment",
    "registration",
    "manual",
    "not_applicable",
    "other",
  ]),
  customerCreationStrategyOther: z.string().optional(),
  monthlyTransactionVolume: z
    .enum(["0-1k", "1k-10k", "10k-100k", "100k-1M", "1M+"])
    .optional(),
  averageTransactionAmount: z
    .enum(["0-50", "50-200", "200-500", "500-1000", "1000+"])
    .optional(),
});

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

const STEPS = [
  {
    id: 1,
    title: "Type de plateforme",
    description: "Aidez-nous à comprendre votre activité",
    icon: Building2,
  },
  {
    id: 2,
    title: "Gestion des clients",
    description: "Comment créez-vous vos clients Stripe ?",
    icon: Users,
  },
  {
    id: 3,
    title: "Configuration",
    description: "Quelques informations supplémentaires",
    icon: Settings,
  },
  {
    id: 4,
    title: "Connexion Stripe",
    description: "Connectez votre premier compte",
    icon: CreditCard,
  },
];

const PLATFORM_TYPES = [
  {
    value: "marketplace",
    label: "Marketplace",
    description: "Plateforme connectant acheteurs et vendeurs",
  },
  {
    value: "saas_b2b",
    label: "SaaS B2B",
    description: "Logiciel en tant que service pour entreprises",
  },
  {
    value: "saas_b2c",
    label: "SaaS B2C",
    description: "Logiciel en tant que service pour particuliers",
  },
  {
    value: "ecommerce",
    label: "E-commerce",
    description: "Boutique en ligne de produits/services",
  },
  {
    value: "payment_platform",
    label: "Plateforme de paiement",
    description: "Solution de paiement ou fintech",
  },
  {
    value: "other",
    label: "Autre",
    description: "Un autre type de plateforme",
  },
];

const CUSTOMER_CREATION_STRATEGIES = [
  {
    value: "first_payment",
    label: "Au premier paiement",
    description: "Le customer est créé lors de la première transaction",
  },
  {
    value: "registration",
    label: "À l'inscription",
    description: "Le customer est créé dès qu'un utilisateur s'inscrit",
  },
  {
    value: "manual",
    label: "Manuellement",
    description: "Vous créez les customers manuellement selon vos besoins",
  },
  {
    value: "not_applicable",
    label: "Non applicable",
    description: "Vous n'utilisez pas les customers Stripe",
  },
  {
    value: "other",
    label: "Autre",
    description: "Une autre méthode de création",
  },
];

const TRANSACTION_VOLUMES = [
  { value: "0-1k", label: "0 - 1 000 €/mois" },
  { value: "1k-10k", label: "1 000 - 10 000 €/mois" },
  { value: "10k-100k", label: "10 000 - 100 000 €/mois" },
  { value: "100k-1M", label: "100 000 € - 1 M€/mois" },
  { value: "1M+", label: "Plus de 1 M€/mois" },
];

const TRANSACTION_AMOUNTS = [
  { value: "0-50", label: "0 - 50 €" },
  { value: "50-200", label: "50 - 200 €" },
  { value: "200-500", label: "200 - 500 €" },
  { value: "500-1000", label: "500 - 1 000 €" },
  { value: "1000+", label: "Plus de 1 000 €" },
];

export function OrganizationOnboardingForm({
  organizationId,
  organizationName,
}: {
  organizationId: string;
  organizationName: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [currentStep, setCurrentStep] = useState(1);
  const [isConnectingStripe, setIsConnectingStripe] = useState(false);

  const form = useForm({
    validators: {
      onSubmit: onboardingSchema
    },
    onSubmit: (values) => onSubmit(values.value),
    defaultValues: {
      platformType: "marketplace",
      platformTypeOther: "",
      customerCreationStrategy: "first_payment",
      customerCreationStrategyOther: "",
      monthlyTransactionVolume: undefined,
      averageTransactionAmount: undefined,
    } as OnboardingFormValues,
  });

  const onSubmit = (values: OnboardingFormValues) => {
    if (currentStep < 4) {
      // Sauvegarder et passer à l'étape suivante
      startTransition(async () => {
        try {
          await updateOrganizationOnboarding(organizationId, {
            platformType: values.platformType,
            platformTypeOther: values.platformTypeOther,
            customerCreationStrategy: values.customerCreationStrategy,
            customerCreationStrategyOther:
              values.customerCreationStrategyOther,
            monthlyTransactionVolume: values.monthlyTransactionVolume,
            averageTransactionAmount: values.averageTransactionAmount,
          });
          setCurrentStep(currentStep + 1);
        } catch (error) {
          toast.error("Erreur", {
            description: "Impossible de sauvegarder les données",
          });
        }
      });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStripeConnect = () => {
    setIsConnectingStripe(true);
    // Rediriger vers la page de connexion Stripe
    router.push("/dashboard/connect");
  };

  const handleSkipStripeConnect = () => {
    startTransition(async () => {
      try {
        await updateOrganizationOnboarding(
          organizationId,
          {
            platformType: form.state.values.platformType,
            platformTypeOther: form.state.values.platformTypeOther,
            customerCreationStrategy:
              form.state.values.customerCreationStrategy,
            customerCreationStrategyOther:
              form.state.values.customerCreationStrategyOther,
            monthlyTransactionVolume:
              form.state.values.monthlyTransactionVolume,
            averageTransactionAmount:
              form.state.values.averageTransactionAmount,
          },
          true
        );
        toast.success("Configuration terminée", {
          description: "Vous pouvez connecter Stripe plus tard",
        });
        router.push("/dashboard");
      } catch (error) {
        toast.error("Erreur", {
          description: "Impossible de finaliser la configuration",
        });
      }
    });
  };

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-zinc-400">
          <span>
            Étape {currentStep} sur {STEPS.length}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Steps Navigation */}
      <div className="grid grid-cols-4 gap-2">
        {STEPS.map((step) => {
          const Icon = step.icon;
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <div
              key={step.id}
              className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-colors ${isCurrent
                ? "border-indigo-500 bg-indigo-500/10"
                : isCompleted
                  ? "border-green-500/30 bg-green-500/5"
                  : "border-white/10 bg-zinc-900/50"
                }`}
            >
              <div
                className={`rounded-full p-2 ${isCurrent
                  ? "bg-indigo-500/20 text-indigo-300"
                  : isCompleted
                    ? "bg-green-500/20 text-green-300"
                    : "bg-zinc-800 text-zinc-500"
                  }`}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>
              <span
                className={`text-xs font-medium text-center ${isCurrent
                  ? "text-indigo-300"
                  : isCompleted
                    ? "text-green-300"
                    : "text-zinc-500"
                  }`}
              >
                {step.title}
              </span>
            </div>
          );
        })}
      </div>

      {/* Form Card */}
      <Card className="border-white/10 bg-zinc-900/50 backdrop-blur-xl shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white">
            {STEPS[currentStep - 1].title}
          </CardTitle>
          <CardDescription className="text-zinc-400">
            {STEPS[currentStep - 1].description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
            className="space-y-6"
          >
            {/* Step 1: Platform Type */}
            {currentStep === 1 && (
              <form.Field
                name="platformType"
                children={(field) => (
                  <div className="space-y-4">
                    <RadioGroup
                      value={field.state.value}
                      onValueChange={(value) => field.handleChange(value as OnboardingFormValues["platformType"])}
                    >
                      <div className="grid gap-3">
                        {PLATFORM_TYPES.map((type) => (
                          <div key={type.value}>
                            <Label
                              htmlFor={`platform-${type.value}`}
                              className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${field.state.value === type.value
                                ? "border-indigo-500 bg-indigo-500/10"
                                : "border-white/10 bg-zinc-900/30 hover:border-white/20"
                                }`}
                            >
                              <RadioGroupItem
                                value={type.value}
                                id={`platform-${type.value}`}
                                className="mt-0.5"
                              />
                              <div className="flex-1">
                                <div className="font-medium text-white">
                                  {type.label}
                                </div>
                                <div className="text-sm text-zinc-400">
                                  {type.description}
                                </div>
                              </div>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>

                    {field.state.value === "other" && (
                      <form.Field
                        name="platformTypeOther"
                        children={(otherField) => (
                          <Field>
                            <FieldLabel className="text-zinc-300">
                              Précisez votre type de plateforme
                            </FieldLabel>
                            <FieldContent>
                              <Input
                                placeholder="Ex: Plateforme de location"
                                className="bg-zinc-900/50 border-white/10 text-white placeholder:text-zinc-500"
                                value={otherField.state.value}
                                onChange={(e) =>
                                  otherField.handleChange(e.target.value)
                                }
                              />
                            </FieldContent>
                          </Field>
                        )}
                      />
                    )}
                  </div>
                )}
              />
            )}

            {/* Step 2: Customer Creation Strategy */}
            {currentStep === 2 && (
              <form.Field
                name="customerCreationStrategy"
                children={(field) => (
                  <div className="space-y-4">
                    <RadioGroup
                      value={field.state.value}
                      onValueChange={(value) => field.handleChange(value as OnboardingFormValues["customerCreationStrategy"])}
                    >
                      <div className="grid gap-3">
                        {CUSTOMER_CREATION_STRATEGIES.map((strategy) => (
                          <div key={strategy.value}>
                            <Label
                              htmlFor={`strategy-${strategy.value}`}
                              className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${field.state.value === strategy.value
                                ? "border-indigo-500 bg-indigo-500/10"
                                : "border-white/10 bg-zinc-900/30 hover:border-white/20"
                                }`}
                            >
                              <RadioGroupItem
                                value={strategy.value}
                                id={`strategy-${strategy.value}`}
                                className="mt-0.5"
                              />
                              <div className="flex-1">
                                <div className="font-medium text-white">
                                  {strategy.label}
                                </div>
                                <div className="text-sm text-zinc-400">
                                  {strategy.description}
                                </div>
                              </div>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>

                    {field.state.value === "other" && (
                      <form.Field
                        name="customerCreationStrategyOther"
                        children={(otherField) => (
                          <Field>
                            <FieldLabel className="text-zinc-300">
                              Précisez votre méthode
                            </FieldLabel>
                            <FieldContent>
                              <Input
                                placeholder="Ex: Via une API tierce"
                                className="bg-zinc-900/50 border-white/10 text-white placeholder:text-zinc-500"
                                value={otherField.state.value}
                                onChange={(e) =>
                                  otherField.handleChange(e.target.value)
                                }
                              />
                            </FieldContent>
                          </Field>
                        )}
                      />
                    )}
                  </div>
                )}
              />
            )}

            {/* Step 3: Business Information */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <form.Field
                  name="monthlyTransactionVolume"
                  children={(field) => (
                    <Field>
                      <FieldLabel className="text-zinc-300">
                        Volume de transactions mensuel estimé (optionnel)
                      </FieldLabel>
                      <FieldContent>
                        <RadioGroup
                          value={field.state.value || ""}
                          onValueChange={(value) =>
                            field.handleChange(
                              value as OnboardingFormValues["monthlyTransactionVolume"]
                            )
                          }
                        >
                          <div className="grid gap-2">
                            {TRANSACTION_VOLUMES.map((volume) => (
                              <Label
                                key={volume.value}
                                htmlFor={`volume-${volume.value}`}
                                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${field.state.value === volume.value
                                  ? "border-indigo-500 bg-indigo-500/10"
                                  : "border-white/10 bg-zinc-900/30 hover:border-white/20"
                                  }`}
                              >
                                <RadioGroupItem
                                  value={volume.value}
                                  id={`volume-${volume.value}`}
                                />
                                <span className="text-white">
                                  {volume.label}
                                </span>
                              </Label>
                            ))}
                          </div>
                        </RadioGroup>
                      </FieldContent>
                    </Field>
                  )}
                />

                <Separator className="bg-white/5" />

                <form.Field
                  name="averageTransactionAmount"
                  children={(field) => (
                    <Field>
                      <FieldLabel className="text-zinc-300">
                        Montant moyen d'une transaction (optionnel)
                      </FieldLabel>
                      <FieldContent>
                        <RadioGroup
                          value={field.state.value || ""}
                          onValueChange={(value) =>
                            field.handleChange(
                              value as OnboardingFormValues["averageTransactionAmount"]
                            )
                          }
                        >
                          <div className="grid gap-2">
                            {TRANSACTION_AMOUNTS.map((amount) => (
                              <Label
                                key={amount.value}
                                htmlFor={`amount-${amount.value}`}
                                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${field.state.value === amount.value
                                  ? "border-indigo-500 bg-indigo-500/10"
                                  : "border-white/10 bg-zinc-900/30 hover:border-white/20"
                                  }`}
                              >
                                <RadioGroupItem
                                  value={amount.value}
                                  id={`amount-${amount.value}`}
                                />
                                <span className="text-white">
                                  {amount.label}
                                </span>
                              </Label>
                            ))}
                          </div>
                        </RadioGroup>
                      </FieldContent>
                    </Field>
                  )}
                />
              </div>
            )}

            {/* Step 4: Stripe Connection */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-6">
                  <div className="flex gap-4">
                    <div className="rounded-full bg-indigo-500/20 p-3 text-indigo-300 h-fit">
                      <CreditCard className="h-6 w-6" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <h3 className="text-lg font-semibold text-white">
                        Connectez votre compte Stripe
                      </h3>
                      <p className="text-sm text-zinc-300">
                        Pour commencer à analyser vos transactions et détecter
                        la fraude, vous devez connecter votre compte Stripe.
                        Cette connexion est sécurisée et vous permet de garder
                        le contrôle total de vos données.
                      </p>
                      <ul className="space-y-2 text-sm text-zinc-300 mt-4">
                        <li className="flex gap-2">
                          <Check className="h-5 w-5 text-green-400" />
                          <span>Analyse en temps réel des transactions</span>
                        </li>
                        <li className="flex gap-2">
                          <Check className="h-5 w-5 text-green-400" />
                          <span>
                            Détection automatique des comportements suspects
                          </span>
                        </li>
                        <li className="flex gap-2">
                          <Check className="h-5 w-5 text-green-400" />
                          <span>Alertes personnalisées sur la fraude</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    type="button"
                    className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white"
                    onClick={handleStripeConnect}
                    disabled={isConnectingStripe || isPending}
                  >
                    {isConnectingStripe && (
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Connecter Stripe
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="sm:w-auto border-white/10 text-zinc-300 hover:bg-white/5"
                    onClick={handleSkipStripeConnect}
                    disabled={isConnectingStripe || isPending}
                  >
                    {isPending && (
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Passer cette étape
                  </Button>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            {currentStep < 4 && (
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="border-white/10 text-zinc-300 hover:bg-white/5"
                  onClick={handlePrevious}
                  disabled={currentStep === 1 || isPending}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Précédent
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-white text-black hover:bg-zinc-200"
                  disabled={isPending}
                >
                  {isPending && (
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {currentStep === 3 ? "Continuer" : "Suivant"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}