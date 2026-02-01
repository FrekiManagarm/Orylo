"use client";

import React from "react";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  FieldGroup,
  FieldContent,
  Field,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { KeyRound, Mail } from "lucide-react";
// import { updateUserProfile } from "@/lib/api/actions/user.action";
import { User } from "@orylo/database";

const userProfileSchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(120),
  phoneNumber: z.string().max(40).optional().nullable(),
  lang: z.enum(["fr", "en"]).default("fr").optional(),
  image: z.url().optional().or(z.literal("")).or(z.null()),
  emailNotifications: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),
});

type UserProfileFormValues = z.infer<typeof userProfileSchema>;

interface UserProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
}

export function UserProfileDialog({
  open,
  onOpenChange,
  user,
}: UserProfileDialogProps) {
  const router = useRouter();
  // const form = useForm<UserProfileFormValues>({
  //   resolver: zodResolver(userProfileSchema),
  //   defaultValues: {
  //     name: user.name,
  //     phoneNumber: user.phoneNumber,
  //     lang: user.lang as "fr" | "en" | undefined,
  //     image: user.image ?? "",
  //     emailNotifications: user.emailNotifications,
  //     smsNotifications: user.smsNotifications,
  //   },
  // });

  // const { handleSubmit, control, formState } = form;

  // const { mutateAsync, isPending } = useMutation({
  //   mutationFn: updateUserProfile,
  //   onSuccess: () => {
  //     toast.success("Profil mis à jour avec succès");
  //     onOpenChange(false);
  //   },
  //   onError: (error) => {
  //     toast.error(error.message ?? "Erreur lors de la mise à jour du profil");
  //   },
  // });

  // const onSubmit = handleSubmit(async (data) => {
  //   await mutateAsync({
  //     name: data.name,
  //     phoneNumber: data.phoneNumber,
  //     lang: data.lang as "fr" | "en",
  //     image: data.image ?? "",
  //     emailNotifications: data.emailNotifications,
  //     smsNotifications: data.smsNotifications,
  //   });
  // });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg">Mon profil</DialogTitle>
          <DialogDescription>
            Mettez à jour vos informations personnelles
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="h-12 w-12 rounded-lg">
            <AvatarImage
              src={user.image || undefined}
              alt={user.name || "Profil"}
            />
            <AvatarFallback className="rounded-lg">
              {user.name?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>

        {/* <Form {...form}>
          <form onSubmit={onSubmit}>
            <Tabs defaultValue="profil" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1">
                <TabsTrigger
                  value="profil"
                  className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-border/50 font-medium transition-all"
                >
                  Profil
                </TabsTrigger>
                <TabsTrigger
                  value="notifications"
                  className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-border/50 font-medium transition-all"
                >
                  Notifications
                </TabsTrigger>
                <TabsTrigger
                  value="securite"
                  className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-border/50 font-medium transition-all"
                >
                  Sécurité
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profil" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom</FormLabel>
                        <FormControl>
                          <Input placeholder="Votre nom" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Téléphone</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Votre numéro"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="lang"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Langue</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Choisir la langue" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="fr">Français</SelectItem>
                              <SelectItem value="en">Anglais</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Photo de profil (URL)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://..."
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="notifications" className="space-y-4 mt-4">
                <div className="rounded-lg border p-4 space-y-3 bg-card">
                  <p className="text-sm font-medium">
                    Préférences de notifications
                  </p>
                  <FormField
                    control={control}
                    name="emailNotifications"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <FormLabel>Notifications par email</FormLabel>
                        <FormControl>
                          <Switch
                            checked={!!field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="smsNotifications"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <FormLabel>Notifications par SMS</FormLabel>
                        <FormControl>
                          <Switch
                            checked={!!field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="securite" className="space-y-4 mt-4">
                <div className="rounded-lg border p-4 space-y-3 bg-card">
                  <p className="text-sm font-medium">Gestion de sécurité</p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/dashboard/settings")}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Changer d&apos;email
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/dashboard/settings")}
                    >
                      <KeyRound className="h-4 w-4 mr-2" />
                      Changer de mot de passe
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <Separator className="my-4" />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isPending || !formState.isDirty}>
                {isPending ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </form>
        </Form> */}
      </DialogContent>
    </Dialog>
  );
}

export default UserProfileDialog;