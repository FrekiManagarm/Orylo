"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { updateOrganizationSettings } from "@/lib/actions/settings";
import type { OrganizationSettings } from "@orylo/database";
import { Loader2, Shield, Bell } from "lucide-react";

const defaults: OrganizationSettings = {
  autoBlock: true,
  autoBlockThreshold: 80,
  reviewThreshold: 60,
  blockThreshold: 80,
  notifyOnBlock: true,
  notifyOnReview: true,
  emailAlerts: true,
  shadowMode: false,
};

type Props = {
  initialSettings: OrganizationSettings | null;
};

export function SettingsForm({ initialSettings }: Props) {
  const [saving, setSaving] = useState(false);
  const [autoBlock, setAutoBlock] = useState(initialSettings?.autoBlock ?? defaults.autoBlock);
  const [autoBlockThreshold, setAutoBlockThreshold] = useState(
    initialSettings?.autoBlockThreshold ?? defaults.autoBlockThreshold ?? 80
  );
  const [reviewThreshold, setReviewThreshold] = useState(
    initialSettings?.reviewThreshold ?? defaults.reviewThreshold ?? 60
  );
  const [blockThreshold, setBlockThreshold] = useState(
    initialSettings?.blockThreshold ?? defaults.blockThreshold ?? 80
  );
  const [notifyOnBlock, setNotifyOnBlock] = useState(
    initialSettings?.notifyOnBlock ?? defaults.notifyOnBlock
  );
  const [notifyOnReview, setNotifyOnReview] = useState(
    initialSettings?.notifyOnReview ?? defaults.notifyOnReview
  );
  const [emailAlerts, setEmailAlerts] = useState(
    initialSettings?.emailAlerts ?? defaults.emailAlerts
  );
  const [shadowMode, setShadowMode] = useState(
    initialSettings?.shadowMode ?? defaults.shadowMode
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const result = await updateOrganizationSettings({
      autoBlock,
      autoBlockThreshold,
      reviewThreshold,
      blockThreshold,
      notifyOnBlock,
      notifyOnReview,
      emailAlerts,
      shadowMode,
    });
    setSaving(false);
    if (result.success) {
      toast.success("Settings saved");
    } else {
      toast.error(result.error ?? "Failed to save");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <Card className="border border-white/10 bg-zinc-900/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white font-mono flex items-center gap-2">
            <Shield className="h-5 w-5 text-indigo-400" />
            Detection
          </CardTitle>
          <CardDescription className="text-zinc-500">
            Risk score thresholds and auto-actions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="autoBlock" className="text-zinc-300 font-mono text-xs uppercase tracking-widest">
              Auto-block high risk
            </Label>
            <Switch
              id="autoBlock"
              checked={autoBlock}
              onCheckedChange={setAutoBlock}
              className="data-[state=checked]:bg-indigo-500"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-500 text-xs font-mono uppercase tracking-widest">
              Auto-block threshold (risk score ≥)
            </Label>
            <div className="flex items-center gap-4">
              <Slider
                value={[autoBlockThreshold]}
                onValueChange={([v]) => setAutoBlockThreshold(v)}
                min={50}
                max={100}
                step={5}
                className="flex-1"
              />
              <Input
                type="number"
                min={50}
                max={100}
                value={autoBlockThreshold}
                onChange={(e) => setAutoBlockThreshold(Number(e.target.value) || 80)}
                className="w-16 h-9 bg-zinc-900 border-white/10 font-mono text-center"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-500 text-xs font-mono uppercase tracking-widest">
              Review threshold (risk score ≥)
            </Label>
            <div className="flex items-center gap-4">
              <Slider
                value={[reviewThreshold]}
                onValueChange={([v]) => setReviewThreshold(v)}
                min={20}
                max={90}
                step={5}
                className="flex-1"
              />
              <Input
                type="number"
                min={20}
                max={90}
                value={reviewThreshold}
                onChange={(e) => setReviewThreshold(Number(e.target.value) || 60)}
                className="w-16 h-9 bg-zinc-900 border-white/10 font-mono text-center"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-500 text-xs font-mono uppercase tracking-widest">
              Block threshold (risk score ≥)
            </Label>
            <div className="flex items-center gap-4">
              <Slider
                value={[blockThreshold]}
                onValueChange={([v]) => setBlockThreshold(v)}
                min={50}
                max={100}
                step={5}
                className="flex-1"
              />
              <Input
                type="number"
                min={50}
                max={100}
                value={blockThreshold}
                onChange={(e) => setBlockThreshold(Number(e.target.value) || 80)}
                className="w-16 h-9 bg-zinc-900 border-white/10 font-mono text-center"
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="shadowMode" className="text-zinc-300 font-mono text-xs uppercase tracking-widest">
              Shadow mode (analyze only, no block)
            </Label>
            <Switch
              id="shadowMode"
              checked={shadowMode}
              onCheckedChange={setShadowMode}
              className="data-[state=checked]:bg-indigo-500"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border border-white/10 bg-zinc-900/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white font-mono flex items-center gap-2">
            <Bell className="h-5 w-5 text-indigo-400" />
            Notifications
          </CardTitle>
          <CardDescription className="text-zinc-500">
            When to receive alerts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="emailAlerts" className="text-zinc-300 font-mono text-xs uppercase tracking-widest">
              Email alerts
            </Label>
            <Switch
              id="emailAlerts"
              checked={emailAlerts}
              onCheckedChange={setEmailAlerts}
              className="data-[state=checked]:bg-indigo-500"
            />
          </div>
          <Separator className="bg-white/10" />
          <div className="flex items-center justify-between">
            <Label htmlFor="notifyOnBlock" className="text-zinc-300 font-mono text-xs uppercase tracking-widest">
              Notify on block
            </Label>
            <Switch
              id="notifyOnBlock"
              checked={notifyOnBlock}
              onCheckedChange={setNotifyOnBlock}
              className="data-[state=checked]:bg-indigo-500"
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="notifyOnReview" className="text-zinc-300 font-mono text-xs uppercase tracking-widest">
              Notify on review
            </Label>
            <Switch
              id="notifyOnReview"
              checked={notifyOnReview}
              onCheckedChange={setNotifyOnReview}
              className="data-[state=checked]:bg-indigo-500"
            />
          </div>
        </CardContent>
      </Card>

      <Button
        type="submit"
        disabled={saving}
        className="bg-white text-black hover:bg-zinc-200 font-mono text-xs uppercase tracking-wider min-h-[44px]"
      >
        {saving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving…
          </>
        ) : (
          "Save settings"
        )}
      </Button>
    </form>
  );
}
