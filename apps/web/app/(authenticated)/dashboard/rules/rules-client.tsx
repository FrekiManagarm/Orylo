"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2, Pencil, Trash2, Shield } from "lucide-react";

type Condition = {
  field: string;
  operator: ">" | "<" | "=" | "!=" | "IN";
  value: number | string | string[];
};

type Rule = {
  id: string;
  name: string;
  description: string | null;
  condition: Condition;
  action: "BLOCK" | "REVIEW" | "ALLOW";
  scoreModifier: number;
  isActive: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
};

function formatCondition(c: Condition): string {
  let v: string;
  if (c.field === "amount" && typeof c.value === "number") {
    v = `${(c.value / 100).toFixed(2)} €`;
  } else {
    v = Array.isArray(c.value) ? c.value.join(", ") : String(c.value);
  }
  return `${c.field} ${c.operator} ${v}`;
}

export function RulesClient() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [field, setField] = useState<"amount" | "score">("amount");
  const [operator, setOperator] = useState<Condition["operator"]>(">");
  const [value, setValue] = useState("");
  const [action, setAction] = useState<Rule["action"]>("BLOCK");
  const [isActive, setIsActive] = useState(true);
  const [priority, setPriority] = useState(100);

  const fetchRules = async () => {
    const res = await fetch("/api/rules");
    if (!res.ok) {
      toast.error("Failed to load rules");
      return;
    }
    const json = await res.json();
    setRules(json.data ?? []);
  };

  useEffect(() => {
    fetchRules().finally(() => setLoading(false));
  }, []);

  const resetForm = () => {
    setName("");
    setDescription("");
    setField("amount");
    setOperator(">");
    setValue("");
    setAction("BLOCK");
    setIsActive(true);
    setPriority(100);
    setEditingId(null);
  };

  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (rule: Rule) => {
    setEditingId(rule.id);
    setName(rule.name);
    setDescription(rule.description ?? "");
    const c = rule.condition as Condition;
    const isAmount = c.field === "amount";
    setField(isAmount ? "amount" : "score");
    setOperator(c.operator);
    if (isAmount && typeof c.value === "number") {
      setValue(String((c.value / 100).toFixed(2)));
    } else {
      setValue(Array.isArray(c.value) ? c.value.join(", ") : String(c.value));
    }
    setAction(rule.action);
    setIsActive(rule.isActive);
    setPriority(rule.priority);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numValue = field === "amount" ? Math.round(parseFloat(value) * 100) : parseInt(value, 10);
    if (isNaN(numValue) && field !== "amount") {
      toast.error("Invalid value");
      return;
    }
    const condition: Condition = {
      field,
      operator,
      value: field === "amount" ? numValue : numValue,
    };

    setSaving(true);
    try {
      if (editingId) {
        const res = await fetch(`/api/rules/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name || "Unnamed rule",
            description: description || null,
            condition,
            action,
            isActive,
            priority,
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? "Failed to update");
        }
        toast.success("Rule updated");
      } else {
        if (rules.length >= 10) {
          toast.error("Maximum 10 rules allowed");
          setSaving(false);
          return;
        }
        const res = await fetch("/api/rules", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name || "Unnamed rule",
            description: description || null,
            condition,
            action,
            scoreModifier: 0,
            isActive,
            priority,
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? "Failed to create");
        }
        toast.success("Rule created");
      }
      setDialogOpen(false);
      resetForm();
      await fetchRules();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Request failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/rules/${deleteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Rule deleted");
      setDeleteId(null);
      await fetchRules();
    } catch {
      toast.error("Failed to delete rule");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500 font-mono">
          {rules.length} / 10 rules
        </p>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={openCreate}
              className="bg-white text-black hover:bg-zinc-200 font-mono text-xs uppercase tracking-wider gap-2 min-h-[44px]"
            >
              <Plus className="h-4 w-4" />
              Add rule
            </Button>
          </DialogTrigger>
          <DialogContent className="border border-white/10 bg-zinc-900 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="font-mono">
                {editingId ? "Edit rule" : "New rule"}
              </DialogTitle>
              <DialogDescription className="text-zinc-500">
                Condition is evaluated per transaction. Action applies when the condition matches.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-zinc-400 text-xs font-mono uppercase tracking-widest">Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Block high amount"
                  className="bg-zinc-900 border-white/10 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-400 text-xs font-mono uppercase tracking-widest">Description (optional)</Label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional note"
                  className="bg-zinc-900 border-white/10 text-white"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-2">
                  <Label className="text-zinc-400 text-xs font-mono uppercase tracking-widest">Field</Label>
                  <Select value={field} onValueChange={(v) => setField(v as "amount" | "score")}>
                    <SelectTrigger className="bg-zinc-900 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="amount">amount</SelectItem>
                      <SelectItem value="score">score</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-400 text-xs font-mono uppercase tracking-widest">Operator</Label>
                  <Select value={operator} onValueChange={(v) => setOperator(v as Condition["operator"])}>
                    <SelectTrigger className="bg-zinc-900 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=">">&gt;</SelectItem>
                      <SelectItem value="<">&lt;</SelectItem>
                      <SelectItem value="=">=</SelectItem>
                      <SelectItem value="!=">≠</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-400 text-xs font-mono uppercase tracking-widest">
                    {field === "amount" ? "Value (€)" : "Value (0-100)"}
                  </Label>
                  <Input
                    type={field === "amount" ? "number" : "number"}
                    step={field === "amount" ? "0.01" : "1"}
                    min={field === "score" ? 0 : undefined}
                    max={field === "score" ? 100 : undefined}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={field === "amount" ? "500" : "80"}
                    className="bg-zinc-900 border-white/10 text-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-400 text-xs font-mono uppercase tracking-widest">Action</Label>
                <Select value={action} onValueChange={(v) => setAction(v as Rule["action"])}>
                  <SelectTrigger className="bg-zinc-900 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BLOCK">Block</SelectItem>
                    <SelectItem value="REVIEW">Review</SelectItem>
                    <SelectItem value="ALLOW">Allow</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-zinc-400 text-xs font-mono uppercase tracking-widest">Active</Label>
                <Switch checked={isActive} onCheckedChange={setIsActive} className="data-[state=checked]:bg-indigo-500" />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  className="border-white/10 text-zinc-400"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-white text-black hover:bg-zinc-200 font-mono text-xs uppercase"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {rules.length === 0 ? (
        <Card className="border border-dashed border-white/20 bg-zinc-900/30">
          <CardContent className="py-12 text-center">
            <Shield className="mx-auto h-10 w-10 text-zinc-600 mb-4" />
            <p className="text-zinc-500 font-mono text-sm">No custom rules yet</p>
            <p className="text-zinc-600 text-xs mt-1">Add a rule to block or flag transactions by amount or risk score.</p>
            <Button
              onClick={openCreate}
              variant="outline"
              className="mt-4 border-white/10 text-zinc-400 hover:text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add rule
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {rules.map((rule) => (
            <Card
              key={rule.id}
              className="border border-white/10 bg-zinc-900/50 backdrop-blur-xl hover:border-indigo-500/30 transition-colors"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-base font-mono text-white flex items-center gap-2">
                      {rule.name}
                      {!rule.isActive && (
                        <Badge variant="outline" className="text-xs text-zinc-500 border-zinc-600">
                          Inactive
                        </Badge>
                      )}
                      <Badge
                        variant={rule.action === "BLOCK" ? "destructive" : rule.action === "REVIEW" ? "warning" : "success"}
                        className="text-xs"
                      >
                        {rule.action}
                      </Badge>
                    </CardTitle>
                    {rule.description && (
                      <CardDescription className="text-zinc-500 text-xs mt-1">
                        {rule.description}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-zinc-400 hover:text-white"
                      onClick={() => openEdit(rule)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-zinc-400 hover:text-destructive"
                      onClick={() => setDeleteId(rule.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs font-mono text-zinc-500">
                  If {formatCondition(rule.condition as Condition)} → {rule.action}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="border border-white/10 bg-zinc-900 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete rule?</AlertDialogTitle>
            <AlertDialogDescription>
              This rule will no longer be applied to new transactions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/10 text-zinc-400">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
