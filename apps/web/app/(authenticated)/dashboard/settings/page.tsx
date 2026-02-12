import { getOrganizationSettings } from "@/lib/actions/settings";
import { SettingsForm } from "./settings-form";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SettingsPage() {
  const settings = await getOrganizationSettings();

  return (
    <div className="space-y-6 relative min-h-screen pb-20">
      <div className="absolute inset-0 bg-grid-white opacity-20 pointer-events-none" />
      <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none" />

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Settings
        </h1>
        <p className="text-zinc-400 mt-1 font-light">
          Detection thresholds and notification preferences.
        </p>
      </div>

      <SettingsForm initialSettings={settings} />
    </div>
  );
}
