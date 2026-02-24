"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { reservationApi, Item } from "@/lib/api";

interface Props {
  open: boolean;
  slug: string;
  item: Item | null;
  onClose: () => void;
  onReserved: (itemId: string) => void;
}

export function ReserveModal({ open, slug, item, onClose, onReserved }: Props) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ reserver_name: "", reserver_email: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;
    setLoading(true);
    try {
      await reservationApi.reserve(slug, item.id, {
        reserver_name: form.reserver_name,
        reserver_email: form.reserver_email || undefined,
      });
      onReserved(item.id);
      toast.success(`Подарок зарезервирован! Отличный выбор 🎉`);
      setForm({ reserver_name: "", reserver_email: "" });
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Ошибка резервирования");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Зарезервировать подарок</DialogTitle>
          <DialogDescription>
            <span className="font-medium text-gray-900">"{item?.name}"</span>
            <br />
            Хозяин вишлиста не узнает, что именно ты выбрал — сюрприз сохранится.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="r-name">Твоё имя *</Label>
            <Input
              id="r-name"
              placeholder="Как тебя зовут?"
              value={form.reserver_name}
              onChange={(e) => setForm({ ...form, reserver_name: e.target.value })}
              required
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="r-email">Email (необязательно)</Label>
            <Input
              id="r-email"
              type="email"
              placeholder="Для напоминания"
              value={form.reserver_email}
              onChange={(e) => setForm({ ...form, reserver_email: e.target.value })}
            />
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
            После резервирования другие увидят, что подарок занят — без твоего имени.
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" disabled={loading || !form.reserver_name.trim()}>
              {loading ? "Резервируем..." : "Забронировать"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
