/**
 * Branded Types pour type-safety au niveau du compilateur
 *
 * Évite les erreurs où on passe un OrganizationId à la place d'un PaymentIntentId
 */

declare const __brand: unique symbol;

type Brand<T, TBrand> = T & { [__brand]: TBrand };

export type OrganizationId = Brand<string, "OrganizationId">;
export type PaymentIntentId = Brand<string, "PaymentIntentId">;
export type CustomerId = Brand<string, "CustomerId">;
export type DetectorId = Brand<string, "DetectorId">;
export type FraudDetectionId = Brand<string, "FraudDetectionId">;

/**
 * Helper functions pour créer des branded types
 */
export const createOrganizationId = (id: string): OrganizationId =>
  id as OrganizationId;
export const createPaymentIntentId = (id: string): PaymentIntentId =>
  id as PaymentIntentId;
export const createCustomerId = (id: string): CustomerId => id as CustomerId;
export const createDetectorId = (id: string): DetectorId => id as DetectorId;
export const createFraudDetectionId = (id: string): FraudDetectionId =>
  id as FraudDetectionId;
