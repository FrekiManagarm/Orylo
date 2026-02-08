import Link from "next/link";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FraudDetectionRow } from "@/lib/actions/transactions";

/** Drizzle stocke detector_results en JSON ; structure minimale pour l’affichage */
type DetectorResultRow = { detectorId: string };

const RecentTransactionsTable = async ({
  recentAnalyses,
}: {
  recentAnalyses: FraudDetectionRow[];
}) => {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount / 100);
  };

  // Get composite score color based on risk level
  const getCompositeScoreColor = (level: string | null | undefined) => {
    switch (level) {
      case "minimal":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "low":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "moderate":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "elevated":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      case "high":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "critical":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default:
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    }
  };

  const getCompositeRiskLabel = (level: string | null | undefined) => {
    switch (level) {
      case "minimal": return "Min";
      case "low": return "Faible";
      case "moderate": return "Mod";
      case "elevated": return "Élevé";
      case "high": return "Très élevé";
      case "critical": return "Critique";
      default: return "—";
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case "ALLOW":
        return (
          <Badge
            variant="secondary"
            className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          >
            Accepted
          </Badge>
        );
      case "BLOCK":
        return (
          <Badge
            variant="destructive"
            className="bg-rose-500/10 text-rose-400 border-rose-500/20"
          >
            Blocked
          </Badge>
        );
      case "REVIEW":
        return (
          <Badge
            variant="outline"
            className="bg-orange-500/10 text-orange-400 border-orange-500/20"
          >
            Review
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-zinc-400">
            {action}
          </Badge>
        );
    }
  };

  return (
    <Card className="bg-zinc-900/50 border-white/5 backdrop-blur-xl overflow-hidden p-0 gap-0">
      <CardHeader className="flex flex-row items-center justify-between border-white/5 bg-white/2 p-5">
        <div className="space-y-1">
          <CardTitle className="text-white">Recent Transactions</CardTitle>
          <CardDescription className="text-zinc-400">
            Live feed of processed payments and risk scores
          </CardDescription>
        </div>
        <Link href="/dashboard/transactions">
          <Button
            variant="ghost"
            size="sm"
            className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 gap-2"
          >
            View Full Report <ArrowUpRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="p-0 border-t border-white/5">
        <Table>
          <TableHeader className="bg-white/2">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-zinc-500 font-medium pl-6">
                Transaction ID
              </TableHead>
              <TableHead className="text-zinc-500 font-medium">
                Amount
              </TableHead>
              <TableHead className="text-zinc-500 font-medium">
                Score Total
              </TableHead>
              <TableHead className="text-zinc-500 font-medium">
                Action
              </TableHead>
              <TableHead className="text-zinc-500 font-medium">
                Reasoning
              </TableHead>
              <TableHead className="text-right text-zinc-500 font-medium">
                Date
              </TableHead>
              <TableHead className="text-right text-zinc-500 font-medium pr-6">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentAnalyses.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-zinc-400 py-8"
                >
                  Aucune transaction trouvée
                </TableCell>
              </TableRow>
            ) : (
              recentAnalyses.map((analysis) => (
                <TableRow
                  key={analysis.id}
                  className="border-white/5 hover:bg-white/5 transition-colors group"
                >
                  <TableCell className="font-mono text-xs text-zinc-400 group-hover:text-white transition-colors pl-6">
                    {analysis.paymentIntentId}
                  </TableCell>
                  <TableCell className="text-zinc-300 font-medium">
                    {formatCurrency(analysis.amount, analysis.currency)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {/* Composite Score Badge */}
                      <div className="flex items-center gap-2">
                        <div
                          className={`inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-bold border ${getCompositeScoreColor(analysis.decision)}`}
                          title={`Score composite: ${analysis.score ?? analysis.score}/100`}
                        >
                          {analysis.score ?? analysis.score}
                        </div>
                        <span className={`text-[10px] font-medium ${getCompositeScoreColor(analysis.decision).split(' ')[1]}`}>
                          {getCompositeRiskLabel(analysis.decision)}
                        </span>
                      </div>
                      {/* Breakdown: Risk / Card Testing */}
                      <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                        <span title="Score de risque général">R:{analysis.score}</span>
                        <span className="text-zinc-600">·</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getActionBadge(analysis.decision)}
                  </TableCell>
                  <TableCell
                    className="text-zinc-400 text-sm max-w-[200px] truncate"
                    title={
                      Array.isArray(analysis.detectorResults)
                        ? (analysis.detectorResults as DetectorResultRow[])
                            .map((r: DetectorResultRow) => r.detectorId)
                            .join(", ")
                        : ""
                    }
                  >
                    {Array.isArray(analysis.detectorResults)
                      ? (analysis.detectorResults as DetectorResultRow[])
                          .map((r: DetectorResultRow) => r.detectorId)
                          .join(", ") || "—"
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right text-zinc-500 text-sm">
                    {analysis.createdAt
                      ? new Date(analysis.createdAt).toLocaleDateString()
                      : "N/A"}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Link href="/dashboard/transactions">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-zinc-500 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span className="sr-only">View details</span>
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default RecentTransactionsTable;
