/**
 * @orylo/fraud-engine
 *
 * Package réutilisable pour la détection de fraude
 */

// Types
export * from "./types/branded";
export * from "./types/detection";

// Interfaces
export * from "./interfaces/detector.interface";
export * from "./interfaces/scoring-strategy.interface";

// Engine
export { FraudDetectionEngine } from "./engine/fraud-detection-engine";

// Strategies
export { AdditiveScoringStrategy } from "./strategies/additive-scoring.strategy";
