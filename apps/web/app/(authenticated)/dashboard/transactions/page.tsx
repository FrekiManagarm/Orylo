import TransactionsClient from "@/app/(authenticated)/dashboard/transactions/components/transactions-client";
import { Metadata } from "next";
import { transactionsSearchParamsCache } from "./searchParams";
import {
  getFraudAnalyses,
  getTotalFraudAnalysesCount,
  type FraudAnalysisFilters,
} from "@/lib/actions/transactions";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Transactions | Orylo",
  description: "Detailed breakdown of all processed transactions.",
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

const ITEMS_PER_PAGE = 10;

const TransactionsPage = async ({ searchParams }: PageProps) => {
  // Parser les search params côté serveur
  const { page, riskScore, actions, dateRange, search } =
    await transactionsSearchParamsCache.parse(searchParams);

  // Construire les filtres
  const filters: FraudAnalysisFilters = {
    riskScoreRange: riskScore,
    actions: actions.length > 0 ? actions : undefined,
    dateRange,
  };

  // Charger les données côté serveur
  const [analyses, totalCount] = await Promise.all([
    getFraudAnalyses({
      limit: ITEMS_PER_PAGE,
      offset: (page - 1) * ITEMS_PER_PAGE,
      filters,
    }),
    getTotalFraudAnalysesCount(filters),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <TransactionsClient
        initialAnalyses={analyses}
        initialTotalCount={totalCount}
        initialPage={page}
        totalPages={totalPages}
      />
    </Suspense>
  );
};

export default TransactionsPage;