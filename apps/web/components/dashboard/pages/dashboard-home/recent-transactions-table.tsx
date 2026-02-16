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
    <Card className="w-full border border-white/10 bg-zinc-900/50 backdrop-blur-xl shadow-2xl overflow-hidden p-0 gap-0">
      <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 bg-white/2 p-5">
        <div className="space-y-1">
          <CardTitle className="text-white font-semibold">Recent Transactions</CardTitle>
          <CardDescription className="text-zinc-400 font-light">
            Live feed of processed payments and risk scores
          </CardDescription>
        </div>
        <Link href="/dashboard/transactions">
          <Button
            variant="ghost"
            size="sm"
            className="text-zinc-400 hover:text-white hover:bg-white/10 border border-white/5 rounded-full px-3 py-1.5 gap-2 font-mono text-xs uppercase tracking-wider"
          >
            View Full Report <ArrowUpRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="p-0 border-t border-white/5">
        <Table>
          <TableHeader>
            <TableRow className="border-white/5 hover:bg-transparent bg-white/2">
              <TableHead className="text-zinc-500 font-mono text-xs uppercase tracking-widest pl-6">
                Transaction ID
              </TableHead>
              <TableHead className="text-zinc-500 font-mono text-xs uppercase tracking-widest">
                Amount
              </TableHead>
              <TableHead className="text-zinc-500 font-mono text-xs uppercase tracking-widest">
                Score Total
              </TableHead>
              <TableHead className="text-zinc-500 font-mono text-xs uppercase tracking-widest">
                Action
              </TableHead>
              <TableHead className="text-zinc-500 font-mono text-xs uppercase tracking-widest">
                Reasoning
              </TableHead>
              <TableHead className="text-right text-zinc-500 font-mono text-xs uppercase tracking-widest">
                Date
              </TableHead>
              <TableHead className="text-right text-zinc-500 font-mono text-xs uppercase tracking-widest pr-6">
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
                    <span className="font-mono text-sm font-medium text-zinc-300">
                      {analysis.score ?? "—"}
                    </span>
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
                        className="h-8 w-8 text-zinc-500 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-all"
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
