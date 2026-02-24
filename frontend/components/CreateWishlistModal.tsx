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
  DialogFooter,
} from "@/components/ui/dialog";
import { wishlistApi, Wishlist } from "@/lib/api";

const EMOJIS = ["🎁", "🎂", "🎄", "🎉", "🌸", "❤️", "⭐", "🌟", "💫", "🦋", "🌈", "🏖️", "🎮", "📚", "✈️", "🏠"];

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (wishlist: Wishlist) => void;
}

export function CreateWishlistModal({ open, onClose, onCreated }: Props) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    cover_emoji: "🎁",
    is_public: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setLoading(true);
    try {
      const wl = await wishlistApi.create(form);
      onCreated(wl);
      toast.success("Вишлист создан! 🎉");
      setForm({ title: "", description: "", cover_emoji: "🎁", is_public: true });
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Ошибка создания");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Новый вишлист</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label>Эмодзи</Label>
            <div className="grid grid-cols-8 gap-1.5">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setForm({ ...form, cover_emoji: emoji })}
                  className={`text-2xl h-10 rounded-lg flex items-center justify-center transition-colors ${
                    form.cover_emoji === emoji
                      ? "bg-purple-100 ring-2 ring-purple-400"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Название *</Label>
            <Input
              id="title"
              placeholder="День рождения, Новый год..."
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="desc">Описание (необязательно)</Label>
            <Input
              id="desc"
              placeholder="Мой список на день рождения 🎂"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" disabled={loading || !form.title.trim()}>
              {loading ? "Создаём..." : "Создать"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
