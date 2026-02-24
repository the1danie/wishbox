"use client";
import Link from "next/link";
import { MoreHorizontal, Trash2, ExternalLink, Gift, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Wishlist } from "@/lib/api";
import { toast } from "sonner";

interface Props {
  wishlist: Wishlist;
  onDelete: (slug: string) => void;
}

export function WishlistCard({ wishlist, onDelete }: Props) {
  const publicUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/w/${wishlist.slug}`;

  const copyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    toast.success("Ссылка скопирована!");
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{wishlist.cover_emoji || "🎁"}</span>
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{wishlist.title}</h3>
              {wishlist.description && (
                <p className="text-sm text-gray-400 truncate mt-0.5">{wishlist.description}</p>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={copyLink}>
                <Copy className="w-4 h-4 mr-2" />
                Скопировать ссылку
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/w/${wishlist.slug}`} target="_blank">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Открыть как гость
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={() => onDelete(wishlist.slug)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Удалить
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Badge variant="secondary" className="gap-1.5">
            <Gift className="w-3 h-3" />
            {wishlist.item_count} {wishlist.item_count === 1 ? "желание" : wishlist.item_count >= 2 && wishlist.item_count <= 4 ? "желания" : "желаний"}
          </Badge>
          {!wishlist.is_public && (
            <Badge variant="outline" className="text-xs">Приватный</Badge>
          )}
        </div>

        <div className="flex gap-2">
          <Link href={`/w/${wishlist.slug}`} className="flex-1">
            <Button variant="outline" className="w-full h-9 text-sm">
              Редактировать
            </Button>
          </Link>
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={copyLink}>
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
