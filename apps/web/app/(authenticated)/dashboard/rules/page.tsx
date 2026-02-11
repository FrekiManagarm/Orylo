import { RulesClient } from "./rules-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function RulesPage() {
  return (
    <div className="space-y-6 relative min-h-screen pb-20">
      <div className="absolute inset-0 bg-grid-white opacity-20 pointer-events-none" />
      <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none" />

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Custom rules
        </h1>
        <p className="text-zinc-400 mt-1 font-light">
          Define conditions to block or flag transactions (max 10 rules).
        </p>
      </div>

      <RulesClient />
    </div>
  );
}
