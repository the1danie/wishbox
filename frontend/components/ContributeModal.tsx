"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { contributionApi, Item } from "@/lib/api";

interface Props {
  open: boolean;
  slug: string;
  item: Item | null;
  onClose: () => void;
  onContributed: (itemId: string, amount: number) => void;
}

const QUICK_AMOUNTS = [500, 1000, 2000, 5000];

export function ContributeModal({ open, slug, item, onClose, onContributed }: Props) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ contributor_name: "", contributor_email: "", amount: "" });

  const progress = item?.target_amount
    ? Math.min(100, (Number(item.total_contributed) / Number(item.target_amount)) * 100)
    : 0;

  const remaining = item?.target_amount
    ? Math.max(0, Number(item.target_amount) - Number(item.total_contributed))
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item || !form.amount) return;
    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Введи корректную сумму");
      return;
    }
    setLoading(true);
    try {
      await contributionApi.contribute(slug, item.id, {
        contributor_name: form.contributor_name,
        contributor_email: form.contributor_email || undefined,
        amount,
      });
      onContributed(item.id, amount);
      toast.success(`Спасибо за вклад ${amount.toLocaleString()} ₽! 💝`);
      setForm({ contributor_name: "", contributor_email: "", amount: "" });
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Скинуться на подарок</DialogTitle>
          <DialogDescription>
            <span className="font-medium text-gray-900">"{item?.name}"</span>
          </DialogDescription>
        </DialogHeader>

        {item?.target_amount && (
          <div className="bg-purple-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-purple-700 font-medium">
                {Number(item.total_contributed).toLocaleString()} ₽ собрано
              </span>
              <span className="text-gray-500">из {Number(item.target_amount).toLocaleString()} ₽</span>
            </div>
            <Progress value={progress} className="h-2" />
            {remaining !== null && remaining > 0 && (
              <p className="text-xs text-gray-500">
                Ещё нужно: <span className="font-medium text-gray-700">{remaining.toLocaleString()} ₽</span>
              </p>
            )}
            <p className="text-xs text-gray-400">
              {item.contributors_count} {item.contributors_count === 1 ? "человек" : "человека"} уже участвуют
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Твоё имя *</Label>
            <Input
              placeholder="Как тебя зовут?"
              value={form.contributor_name}
              onChange={(e) => setForm({ ...form, contributor_name: e.target.value })}
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>Сумма (₽) *</Label>
            <div className="flex gap-1.5 flex-wrap mb-2">
              {QUICK_AMOUNTS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setForm({ ...form, amount: String(a) })}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                    form.amount === String(a)
                      ? "bg-purple-500 text-white border-purple-500"
                      : "border-gray-200 text-gray-600 hover:border-purple-300"
                  }`}
                >
                  {a.toLocaleString()} ₽
                </button>
              ))}
            </div>
            <Input
              type="number"
              placeholder="Другая сумма"
              min="1"
              step="1"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Email (необязательно)</Label>
            <Input
              type="email"
              placeholder="Для напоминания"
              value={form.contributor_email}
              onChange={(e) => setForm({ ...form, contributor_email: e.target.value })}
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
            Хозяин вишлиста видит только общую сумму — твой вклад останется приватным.
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" disabled={loading || !form.contributor_name.trim() || !form.amount}>
              {loading ? "Отправляем..." : "Скинуться"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
