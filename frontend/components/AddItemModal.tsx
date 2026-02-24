"use client";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Loader2, Link2, Sparkles } from "lucide-react";
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
import { itemApi, scraperApi, Item } from "@/lib/api";

interface Props {
  open: boolean;
  slug: string;
  onClose: () => void;
  onAdded: (item: Item) => void;
  editItem?: Item | null;
}

export function AddItemModal({ open, slug, onClose, onAdded, editItem }: Props) {
  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [form, setForm] = useState({
    name: editItem?.name || "",
    url: editItem?.url || "",
    price: editItem?.price ? String(editItem.price) : "",
    image_url: editItem?.image_url || "",
    description: editItem?.description || "",
    priority: editItem?.priority || 2,
    is_group_gift: editItem?.is_group_gift || false,
    target_amount: editItem?.target_amount ? String(editItem.target_amount) : "",
  });

  const scrapeUrl = useCallback(async () => {
    if (!form.url) return;
    setScraping(true);
    try {
      const result = await scraperApi.scrape(form.url);
      setForm((prev) => ({
        ...prev,
        name: result.name || prev.name,
        price: result.price ? String(result.price) : prev.price,
        image_url: result.image_url || prev.image_url,
        description: result.description || prev.description,
      }));
      toast.success("Данные подтянуты автоматически ✨");
    } catch {
      toast.error("Не удалось загрузить данные по ссылке");
    } finally {
      setScraping(false);
    }
  }, [form.url]);

  const handleUrlBlur = () => {
    if (form.url && !form.name) {
      scrapeUrl();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    try {
      const data = {
        name: form.name.trim(),
        url: form.url || undefined,
        price: form.price ? parseFloat(form.price) : undefined,
        image_url: form.image_url || undefined,
        description: form.description || undefined,
        priority: form.priority,
        is_group_gift: form.is_group_gift,
        target_amount: form.target_amount ? parseFloat(form.target_amount) : undefined,
      };

      let item: Item;
      if (editItem) {
        item = await itemApi.update(slug, editItem.id, data);
        toast.success("Желание обновлено");
      } else {
        item = await itemApi.add(slug, data);
        toast.success("Желание добавлено 🎁");
      }
      onAdded(item);
      if (!editItem) {
        setForm({ name: "", url: "", price: "", image_url: "", description: "", priority: 2, is_group_gift: false, target_amount: "" });
      }
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editItem ? "Редактировать желание" : "Добавить желание"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* URL with scraper */}
          <div className="space-y-2">
            <Label htmlFor="url">Ссылка на товар</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="url"
                  type="url"
                  placeholder="https://..."
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  onBlur={handleUrlBlur}
                  className="pl-9"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={scrapeUrl}
                disabled={scraping || !form.url}
                className="gap-1.5 shrink-0"
              >
                {scraping ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {scraping ? "Загрузка..." : "Заполнить"}
              </Button>
            </div>
            <p className="text-xs text-gray-400">Вставь ссылку — мы подтянем название, цену и картинку</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Название *</Label>
            <Input
              id="name"
              placeholder="Название желания"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="price">Цена (₽)</Label>
              <Input
                id="price"
                type="number"
                placeholder="0"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Приоритет</Label>
              <div className="flex gap-1">
                {[
                  { v: 1, label: "Низкий", color: "border-gray-200 text-gray-500" },
                  { v: 2, label: "Средний", color: "border-yellow-300 text-yellow-600 bg-yellow-50" },
                  { v: 3, label: "Хочу!", color: "border-red-300 text-red-600 bg-red-50" },
                ].map(({ v, label, color }) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setForm({ ...form, priority: v })}
                    className={`flex-1 py-2 text-xs rounded-lg border transition-colors ${
                      form.priority === v ? color : "border-gray-200 text-gray-400 hover:border-gray-300"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">Картинка (URL)</Label>
            <Input
              id="image_url"
              type="url"
              placeholder="https://..."
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            />
            {form.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.image_url}
                alt="preview"
                className="h-24 w-24 object-cover rounded-lg border"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            )}
          </div>

          {/* Group gift toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="text-sm font-medium text-gray-900">Групповой подарок</p>
              <p className="text-xs text-gray-400 mt-0.5">Несколько друзей могут скинуться</p>
            </div>
            <button
              type="button"
              onClick={() => setForm({ ...form, is_group_gift: !form.is_group_gift })}
              className={`w-11 h-6 rounded-full transition-colors ${
                form.is_group_gift ? "bg-purple-500" : "bg-gray-300"
              } relative`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
                  form.is_group_gift ? "left-5.5" : "left-0.5"
                }`}
              />
            </button>
          </div>

          {form.is_group_gift && (
            <div className="space-y-2">
              <Label htmlFor="target">Целевая сумма (₽)</Label>
              <Input
                id="target"
                type="number"
                placeholder="10000"
                min="1"
                value={form.target_amount}
                onChange={(e) => setForm({ ...form, target_amount: e.target.value })}
              />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" disabled={loading || !form.name.trim()}>
              {loading ? "Сохраняем..." : editItem ? "Сохранить" : "Добавить"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
