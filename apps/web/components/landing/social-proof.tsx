import { Building2, Globe2, ShieldCheck } from "lucide-react";

/**
 * Social Proof Section Component
 * 
 * Story 2.14:
 * - AC7: Social proof section (optional for MVP: "Join 100+ merchants" or placeholder)
 */
export function SocialProofSection() {
  const stats = [
    {
      value: "100+",
      label: "Marchands protégés",
      icon: Building2,
    },
    {
      value: "95%+",
      label: "Taux de détection",
      icon: ShieldCheck,
    },
    {
      value: "€2M+",
      label: "Sécurisés chaque mois",
      icon: Globe2,
    },
  ];

  return (
    <section className="w-full py-12 border-y bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-16">
          <div className="text-center md:text-left max-w-md">
            <h2 className="text-2xl font-bold tracking-tight">
              Rejoignez les leaders du e-commerce
            </h2>
            <p className="text-muted-foreground mt-2">
              Des startups aux entreprises établies, ils font confiance à Orylo pour protéger leurs revenus.
            </p>
          </div>
          
          <div className="grid grid-cols-3 gap-8 md:gap-16 w-full md:w-auto">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="flex flex-col items-center md:items-start text-center md:text-left">
                  <div className="mb-2 p-2 bg-primary/10 rounded-full text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="text-3xl font-bold tracking-tighter text-foreground">
                    {stat.value}
                  </div>
                  <div className="text-sm font-medium text-muted-foreground mt-1">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
