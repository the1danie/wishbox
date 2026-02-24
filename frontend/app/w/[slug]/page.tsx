"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Plus, Copy, Share2, ArrowLeft, Gift, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ItemCard } from "@/components/ItemCard";
import { AddItemModal } from "@/components/AddItemModal";
import { ReserveModal } from "@/components/ReserveModal";
import { ContributeModal } from "@/components/ContributeModal";
import { wishlistApi, itemApi, WishlistWithItems, Item } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { useWishlistWS, WSEvent } from "@/hooks/useWishlistWS";

export default function WishlistPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuthStore();

  const [wishlist, setWishlist] = useState<WishlistWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState<Item | null>(null);
  const [reserveItem, setReserveItem] = useState<Item | null>(null);
  const [contributeItem, setContributeItem] = useState<Item | null>(null);

  const isOwner = !!user && wishlist?.user_id === user.id;

  const fetchWishlist = useCallback(async () => {
    try {
      const data = await wishlistApi.get(slug);
      setWishlist(data);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // WebSocket real-time updates
  const handleWSEvent = useCallback((event: WSEvent) => {
    setWishlist((prev) => {
      if (!prev) return prev;

      switch (event.type) {
        case "item_added":
          // Refetch to get full item data
          fetchWishlist();
          return prev;

        case "item_updated":
          fetchWishlist();
          return prev;

        case "item_deleted":
          toast.info("Один из подарков был удалён из вишлиста");
          return {
            ...prev,
            items: prev.items.filter((i) => i.id !== event.item_id),
          };

        case "item_reserved":
          if (!isOwner) {
            toast.info(`${event.reserver_name} зарезервировал(а) подарок!`);
          }
          return {
            ...prev,
            items: prev.items.map((i) =>
              i.id === event.item_id ? { ...i, is_reserved: true } : i
            ),
          };

        case "item_unreserved":
          return {
            ...prev,
            items: prev.items.map((i) =>
              i.id === event.item_id ? { ...i, is_reserved: false } : i
            ),
          };

        case "contribution_added":
          if (!isOwner) {
            toast.info(`${event.contributor_name} скинулся на подарок!`);
          }
          return {
            ...prev,
            items: prev.items.map((i) =>
              i.id === event.item_id
                ? {
                    ...i,
                    total_contributed: event.total_contributed,
                    contributors_count: event.contributors_count,
                  }
                : i
            ),
          };

        default:
          return prev;
      }
    });
  }, [isOwner, fetchWishlist]);

  useWishlistWS(slug, handleWSEvent);

  const handleItemAdded = (item: Item) => {
    setWishlist((prev) => {
      if (!prev) return prev;
      const exists = prev.items.find((i) => i.id === item.id);
      if (exists) {
        return { ...prev, items: prev.items.map((i) => (i.id === item.id ? item : i)) };
      }
      return { ...prev, items: [item, ...prev.items], item_count: prev.item_count + 1 };
    });
    setEditItem(null);
  };

  const handleDeleteItem = async (item: Item) => {
    if (!confirm(`Удалить "${item.name}"?`)) return;
    try {
      await itemApi.delete(slug, item.id);
      setWishlist((prev) => prev ? {
        ...prev,
        items: prev.items.filter((i) => i.id !== item.id),
        item_count: prev.item_count - 1,
      } : prev);
      toast.success("Желание удалено");
    } catch {
      toast.error("Не удалось удалить");
    }
  };

  const handleReserved = (itemId: string) => {
    setWishlist((prev) => prev ? {
      ...prev,
      items: prev.items.map((i) => (i.id === itemId ? { ...i, is_reserved: true } : i)),
    } : prev);
  };

  const handleContributed = (itemId: string, amount: number) => {
    setWishlist((prev) => prev ? {
      ...prev,
      items: prev.items.map((i) =>
        i.id === itemId
          ? {
              ...i,
              total_contributed: Number(i.total_contributed) + amount,
              contributors_count: i.contributors_count + 1,
            }
          : i
      ),
    } : prev);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Ссылка скопирована!");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (notFound || !wishlist) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <span className="text-7xl">🎁</span>
        <h1 className="text-2xl font-bold text-gray-900">Вишлист не найден</h1>
        <p className="text-gray-500">Возможно, ссылка устарела или вишлист был удалён</p>
        <Link href="/">
          <Button>На главную</Button>
        </Link>
      </div>
    );
  }

  const activeItems = wishlist.items.filter((i) => !i.is_deleted);
  const reservedCount = activeItems.filter((i) => i.is_reserved).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href={isOwner ? "/dashboard" : "/"}>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xl">{wishlist.cover_emoji || "🎁"}</span>
              <h1 className="font-bold text-gray-900 truncate">{wishlist.title}</h1>
              {isOwner && (
                <Badge variant="secondary" className="text-xs hidden sm:flex">Мой вишлист</Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={copyLink} className="gap-1.5">
              <Copy className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Поделиться</span>
            </Button>
            {isOwner && (
              <Button size="sm" onClick={() => setShowAdd(true)} className="gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Добавить</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Wishlist info */}
        {!isOwner && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 flex items-start gap-4">
            <div className="text-4xl">{wishlist.cover_emoji || "🎁"}</div>
            <div>
              <h2 className="font-bold text-gray-900 text-lg">{wishlist.title}</h2>
              {wishlist.description && (
                <p className="text-gray-500 text-sm mt-0.5">{wishlist.description}</p>
              )}
              <p className="text-sm text-gray-400 mt-1">
                Вишлист {wishlist.owner_name}
              </p>
            </div>
          </div>
        )}

        {/* Stats bar for owner */}
        {isOwner && (
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            {wishlist.description && (
              <p className="text-gray-500 text-sm flex-1">{wishlist.description}</p>
            )}
            <div className="flex items-center gap-3 ml-auto">
              <span className="text-sm text-gray-400">
                {reservedCount}/{activeItems.length} зарезервировано
              </span>
              <Button variant="ghost" size="sm" onClick={copyLink} className="gap-1.5 text-purple-600">
                <Share2 className="w-3.5 h-3.5" />
                Поделиться с друзьями
              </Button>
            </div>
          </div>
        )}

        {/* Items grid */}
        {activeItems.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-7xl mb-4">✨</div>
            {isOwner ? (
              <>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Добавь первое желание</h2>
                <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                  Вставь ссылку на товар — мы сами подтянем название, цену и картинку
                </p>
                <Button onClick={() => setShowAdd(true)} className="gap-2">
                  <Gift className="w-4 h-4" />
                  Добавить желание
                </Button>
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Вишлист пока пустой</h2>
                <p className="text-gray-500">Хозяин ещё не добавил желания</p>
              </>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                isOwner={isOwner}
                onReserve={setReserveItem}
                onContribute={setContributeItem}
                onEdit={(i) => {
                  setEditItem(i);
                  setShowAdd(true);
                }}
                onDelete={handleDeleteItem}
              />
            ))}
            {/* Add card for owner */}
            {isOwner && (
              <button
                onClick={() => setShowAdd(true)}
                className="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-gray-400 hover:border-purple-300 hover:text-purple-500 transition-colors min-h-[180px]"
              >
                <Plus className="w-8 h-8" />
                <span className="text-sm font-medium">Добавить желание</span>
              </button>
            )}
          </div>
        )}
      </main>

      <AddItemModal
        open={showAdd}
        slug={slug}
        onClose={() => {
          setShowAdd(false);
          setEditItem(null);
        }}
        onAdded={handleItemAdded}
        editItem={editItem}
      />

      <ReserveModal
        open={!!reserveItem}
        slug={slug}
        item={reserveItem}
        onClose={() => setReserveItem(null)}
        onReserved={handleReserved}
      />

      <ContributeModal
        open={!!contributeItem}
        slug={slug}
        item={contributeItem}
        onClose={() => setContributeItem(null)}
        onContributed={handleContributed}
      />
    </div>
  );
}
