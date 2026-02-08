import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
  parseAsArrayOf,
  parseAsStringLiteral,
} from "nuqs/server";

// Définir les parsers pour les filtres et la pagination
export const transactionsSearchParamsCache = createSearchParamsCache({
  // Pagination
  page: parseAsInteger.withDefault(1),

  // Filtres
  riskScore: parseAsStringLiteral(["low", "medium", "high"] as const).withDefault(
    undefined as any
  ),
  actions: parseAsArrayOf(
    parseAsStringLiteral([
      "ALLOW",
      "BLOCK",
      "REVIEW",
    ] as const)
  ).withDefault([]),
  dateRange: parseAsStringLiteral(["24h", "7d", "30d", "all"] as const).withDefault(
    "all"
  ),

  // Recherche
  search: parseAsString.withDefault(""),
});

// Exporter les parsers pour utilisation côté client
export const transactionsParsers = {
  page: parseAsInteger.withDefault(1),
  riskScore: parseAsStringLiteral(["low", "medium", "high"] as const).withDefault(
    undefined as any
  ),
  actions: parseAsArrayOf(
    parseAsStringLiteral([
      "ALLOW",
      "BLOCK",
      "REVIEW",
    ] as const)
  ).withDefault([]),
  dateRange: parseAsStringLiteral(["24h", "7d", "30d", "all"] as const).withDefault(
    "all"
  ),
  search: parseAsString.withDefault(""),
};
