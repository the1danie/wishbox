"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, LogOut, Gift } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { WishlistCard } from "@/components/WishlistCard";
import { CreateWishlistModal } from "@/components/CreateWishlistModal";
import { wishlistApi, Wishlist } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    wishlistApi.list()
      .then(setWishlists)
      .catch(() => toast.error("Не удалось загрузить вишлисты"))
      .finally(() => setLoading(false));
  }, [user, router]);

  const handleDelete = async (slug: string) => {
    if (!confirm("Удалить вишлист? Это действие нельзя отменить.")) return;
    try {
      await wishlistApi.delete(slug);
      setWishlists((prev) => prev.filter((w) => w.slug !== slug));
      toast.success("Вишлист удалён");
    } catch {
      toast.error("Не удалось удалить");
    }
  };

  const handleLogout = () => {
    clearAuth();
    router.push("/");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl">🎁</span>
            <span className="font-bold text-gray-900">WishBox</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 hidden sm:block">{user.name}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              title="Выйти"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Page title */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Мои вишлисты</h1>
            <p className="text-gray-500 mt-0.5">
              {wishlists.length > 0
                ? `${wishlists.length} ${wishlists.length === 1 ? "вишлист" : "вишлиста"}`
                : "Пока ни одного вишлиста"}
            </p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Новый вишлист
          </Button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 bg-white rounded-2xl border border-gray-100 animate-pulse" />
            ))}
          </div>
        ) : wishlists.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-7xl mb-4">🎁</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Создай первый вишлист</h2>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              Добавь желания, поделись ссылкой с друзьями — и они сами разберутся с подарками
            </p>
            <Button onClick={() => setShowCreate(true)} className="gap-2">
              <Gift className="w-4 h-4" />
              Создать вишлист
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {wishlists.map((wl) => (
              <WishlistCard
                key={wl.id}
                wishlist={wl}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      <CreateWishlistModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={(wl) => {
          setWishlists((prev) => [wl, ...prev]);
          router.push(`/w/${wl.slug}`);
        }}
      />
    </div>
  );
}
