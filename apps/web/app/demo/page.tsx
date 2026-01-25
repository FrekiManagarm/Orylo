"use client";

import { useState } from "react";
import {
  FraudDetectionEngine,
  AdditiveScoringStrategy,
  type DetectionContext,
  type IDetector,
  type DetectorResult,
  type FraudDetectionResult,
  FraudDecision,
  createOrganizationId,
  createPaymentIntentId,
  createCustomerId,
  createDetectorId,
} from "@orylo/fraud-engine";

/**
 * Detector de démo simple
 */
class DemoDetector implements IDetector {
  readonly id = "demo-detector";
  readonly name = "Demo Detector";
  readonly description = "Un detector de démonstration simple";
  readonly priority = 1;

  async detect(context: DetectionContext): Promise<DetectorResult> {
    // Logic simple : score basé sur le montant
    const score = context.amount > 10000 ? 80 : 20;

    return {
      detectorId: createDetectorId(this.id),
      score,
      confidence: 90,
      reason: `Montant: ${context.amount / 100}€ ${
        score > 50 ? "est suspect" : "est normal"
      }`,
    };
  }
}

export default function DemoPage() {
  const [result, setResult] = useState<FraudDetectionResult | null>(null);
  const [amount, setAmount] = useState(5000); // 50€ en centimes

  const runDetection = async () => {
    // Créer l'engine
    const strategy = new AdditiveScoringStrategy(30, 70);
    const engine = new FraudDetectionEngine(strategy);

    // Enregistrer un detector
    engine.registerDetector(new DemoDetector());

    // Context de test
    const context: DetectionContext = {
      organizationId: createOrganizationId("org_demo_123"),
      paymentIntentId: createPaymentIntentId("pi_demo_456"),
      customerId: createCustomerId("cus_demo_789"),
      amount,
      currency: "eur",
      customerEmail: "test@example.com",
      customerIp: "192.168.1.1",
      cardCountry: "FR",
      cardLast4: "4242",
      metadata: {},
      timestamp: new Date(),
    };

    // Exécuter la détection
    const detectionResult = await engine.detect(context);
    setResult(detectionResult);
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">
        🚀 POC Orylo V3 - Fraud Detection Engine
      </h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Configuration</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Montant de la transaction (en centimes)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full px-3 py-2 border rounded"
          />
          <p className="text-sm text-gray-600 mt-1">
            Valeur actuelle: {amount / 100}€
          </p>
        </div>

        <button
          onClick={runDetection}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Exécuter la Détection
        </button>
      </div>

      {result && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Résultats</h2>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="font-medium">Décision:</span>
              <span
                className={`px-3 py-1 rounded font-bold ${
                  result.decision === FraudDecision.ALLOW
                    ? "bg-green-100 text-green-800"
                    : result.decision === FraudDecision.REVIEW
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {result.decision}
              </span>
            </div>

            <div>
              <span className="font-medium">Score:</span> {result.score}/100
            </div>

            <div>
              <span className="font-medium">Temps d&apos;exécution:</span>{" "}
              {result.executionTimeMs.toFixed(2)}ms
            </div>

            <div>
              <span className="font-medium">Détecteurs exécutés:</span>{" "}
              {result.detectorResults.length}
            </div>

            {result.detectorResults.map((dr: DetectorResult, idx: number) => (
              <div key={idx} className="border-l-4 border-blue-500 pl-4">
                <div className="font-medium">{dr.detectorId}</div>
                <div className="text-sm text-gray-600">{dr.reason}</div>
                <div className="text-sm">
                  Score: {dr.score} | Confidence: {dr.confidence}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-green-800 mb-2">
          ✅ POC Validé !
        </h3>
        <ul className="space-y-2 text-green-700">
          <li>✅ Monorepo Turborepo fonctionnel</li>
          <li>✅ Package @orylo/fraud-engine importé dans Next.js</li>
          <li>✅ Types branded et interfaces fonctionnent</li>
          <li>✅ Detection engine exécute correctement</li>
          <li>✅ Integration entre packages validée</li>
        </ul>
      </div>
    </div>
  );
}
