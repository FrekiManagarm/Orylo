# Onboarding Automatique - Création d'Organisation

## Vue d'ensemble

L'onboarding automatique crée une organisation pour chaque nouvel utilisateur lors de son inscription. Cela garantit que chaque utilisateur a immédiatement accès à une organisation et peut commencer à utiliser Orylo sans configuration supplémentaire.

## Fonctionnement

### 1. Hook de création d'utilisateur

Lorsqu'un utilisateur s'inscrit via Better Auth, le hook `databaseHooks.user.create.after` est déclenché automatiquement dans `apps/web/lib/auth.ts`.

```typescript
databaseHooks: {
  user: {
    create: {
      after: async (user) => {
        // Crée automatiquement une organisation pour le nouvel utilisateur
        const org = await createUserOrganization(user.id, user.name);
      },
    },
  },
}
```

### 2. Création de l'organisation

La fonction `createUserOrganization` dans `apps/web/lib/onboarding.ts` :

1. **Génère un nom d'organisation** : `${userName}'s Organization`
2. **Génère un slug unique** : Convertit le nom en slug et vérifie l'unicité
3. **Crée l'organisation** dans la table `organization`
4. **Ajoute l'utilisateur comme membre** avec le rôle `owner` dans la table `member`

### 3. Définition de l'organisation active

Lors de la création de la première session, le hook `databaseHooks.session.create.before` définit automatiquement la première organisation de l'utilisateur comme organisation active :

```typescript
session: {
  create: {
    before: async (session) => {
      if (!session.activeOrganizationId) {
        // Trouve la première organisation de l'utilisateur
        const userOrgs = await db.query.member.findFirst({
          where: (member, { eq }) => eq(member.userId, session.userId),
          orderBy: (member, { asc }) => [asc(member.createdAt)],
        });

        if (userOrgs) {
          return {
            data: {
              ...session,
              activeOrganizationId: userOrgs.organizationId,
            },
          };
        }
      }
    },
  },
}
```

## Structure des fichiers

- **`apps/web/lib/onboarding.ts`** : Utilitaires pour créer une organisation (génération de slug, création d'organisation + membre)
- **`apps/web/lib/auth.ts`** : Configuration Better Auth avec hooks d'onboarding

## Flux utilisateur

1. **Inscription** : L'utilisateur s'inscrit via `/login` (page de connexion)
2. **Création automatique** : 
   - Better Auth crée l'utilisateur
   - Le hook `user.create.after` crée automatiquement l'organisation
   - L'utilisateur est ajouté comme membre avec le rôle `owner`
3. **Première connexion** :
   - Better Auth crée une session
   - Le hook `session.create.before` définit l'organisation comme active
   - L'utilisateur est redirigé vers `/dashboard` avec son organisation déjà configurée

## Gestion des erreurs

Si la création de l'organisation échoue (par exemple, problème de base de données), l'inscription de l'utilisateur **succeed quand même**. L'utilisateur pourra créer manuellement une organisation plus tard via l'interface.

## Personnalisation

### Modifier le nom de l'organisation par défaut

Modifiez la fonction `createUserOrganization` dans `apps/web/lib/onboarding.ts` :

```typescript
const orgName = `${userName}'s Organization`; // Personnalisez ici
```

### Modifier le rôle par défaut

Le rôle par défaut est `"owner"` (conforme à Better Auth). Pour changer :

```typescript
await db.insert(member).values({
  // ...
  role: "admin", // ou autre rôle
});
```

### Désactiver l'onboarding automatique

Pour désactiver la création automatique d'organisation, commentez ou supprimez le hook dans `apps/web/lib/auth.ts` :

```typescript
databaseHooks: {
  user: {
    create: {
      after: async (user) => {
        // Désactivé - l'utilisateur devra créer manuellement son organisation
      },
    },
  },
}
```

## Tests

Pour tester l'onboarding :

1. Créez un nouveau compte via `/login`
2. Vérifiez dans la base de données que :
   - Une organisation a été créée avec le nom `${userName}'s Organization`
   - Un membre a été créé avec `userId` et `role = "owner"`
   - La session a `activeOrganizationId` défini

## Notes techniques

- **Slug unique** : Le système génère automatiquement un slug unique en ajoutant un suffixe numérique si nécessaire (`my-org`, `my-org-1`, `my-org-2`, etc.)
- **ID génération** : Utilise `@paralleldrive/cuid2` pour générer les IDs (cohérent avec le reste du projet)
- **Transaction** : La création d'organisation et de membre n'est pas dans une transaction explicite, mais Drizzle gère l'intégrité référentielle
