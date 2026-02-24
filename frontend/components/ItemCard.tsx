"use client";
import Image from "next/image";
import { ExternalLink, Edit2, Trash2, Users, CheckCircle, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Item } from "@/lib/api";

interface Props {
  item: Item;
  isOwner: boolean;
  onReserve?: (item: Item) => void;
  onCancelReserve?: (item: Item) => void;
  onContribute?: (item: Item) => void;
  onEdit?: (item: Item) => void;
  onDelete?: (item: Item) => void;
}

const PRIORITY_LABELS = { 1: null, 2: null, 3: { label: "Очень хочу!", color: "bg-red-100 text-red-600" } };

export function ItemCard({ item, isOwner, onReserve, onCancelReserve, onContribute, onEdit, onDelete }: Props) {
  const progress = item.target_amount
    ? Math.min(100, (Number(item.total_contributed) / Number(item.target_amount)) * 100)
    : 0;

  const priorityBadge = PRIORITY_LABELS[item.priority as keyof typeof PRIORITY_LABELS];

  return (
    <div
      className={`bg-white rounded-2xl border overflow-hidden transition-all ${
        item.is_reserved ? "border-green-200 opacity-80" : "border-gray-100 hover:shadow-md"
      }`}
    >
      {/* Image */}
      {item.image_url && (
        <div className="relative h-44 bg-gray-50 overflow-hidden">
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            className="object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
            unoptimized
          />
          {item.is_reserved && (
            <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
              <div className="bg-white rounded-full p-2 shadow-lg">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
            </div>
          )}
        </div>
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {priorityBadge && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityBadge.color}`}>
                  {priorityBadge.label}
                </span>
              )}
              {item.is_group_gift && (
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-purple-100 text-purple-600 flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  Групповой
                </span>
              )}
            </div>
            <h3 className="font-semibold text-gray-900 leading-tight">{item.name}</h3>
          </div>
          {isOwner && (
            <div className="flex gap-1 shrink-0">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit?.(item)}>
                <Edit2 className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-red-400 hover:text-red-600"
                onClick={() => onDelete?.(item)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </div>

        {/* Description */}
        {item.description && (
          <p className="text-sm text-gray-400 mb-3 line-clamp-2">{item.description}</p>
        )}

        {/* Price */}
        {item.price && (
          <p className="text-lg font-bold text-gray-900 mb-3">
            {Number(item.price).toLocaleString("ru-RU")} ₽
          </p>
        )}

        {/* Group gift progress */}
        {item.is_group_gift && (
          <div className="mb-4 space-y-1.5">
            <div className="flex justify-between text-xs text-gray-500">
              <span>{Number(item.total_contributed).toLocaleString()} ₽</span>
              {item.target_amount && (
                <span>из {Number(item.target_amount).toLocaleString()} ₽</span>
              )}
            </div>
            <Progress value={progress} className="h-1.5" />
            <p className="text-xs text-gray-400">
              {item.contributors_count} {item.contributors_count === 1 ? "участник" : "участника"}
              {!isOwner && item.contributors.length > 0 && (
                <span className="ml-1">
                  ({item.contributors.slice(0, 3).map(c => c.contributor_name).join(", ")}
                  {item.contributors.length > 3 ? ` и ещё ${item.contributors.length - 3}` : ""})
                </span>
              )}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-purple-600 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              Посмотреть товар
            </a>
          )}
        </div>

        {/* CTA buttons for guests */}
        {!isOwner && (
          <div className="mt-3 flex gap-2">
            {item.is_group_gift ? (
              <Button
                className="flex-1 h-9 gap-1.5"
                onClick={() => onContribute?.(item)}
                disabled={progress >= 100}
              >
                <ChevronUp className="w-4 h-4" />
                {progress >= 100 ? "Сбор завершён" : "Скинуться"}
              </Button>
            ) : item.is_reserved ? (
              <div className="flex-1 flex items-center gap-2 text-sm text-green-600 font-medium">
                <CheckCircle className="w-4 h-4" />
                Подарок занят
              </div>
            ) : (
              <Button
                className="flex-1 h-9"
                onClick={() => onReserve?.(item)}
              >
                Зарезервировать
              </Button>
            )}
          </div>
        )}

        {/* Owner view: reservation status */}
        {isOwner && item.is_reserved && (
          <div className="mt-3 flex items-center gap-2 text-sm text-green-600">
            <CheckCircle className="w-4 h-4" />
            Кто-то уже позаботился об этом 🎉
          </div>
        )}
      </div>
    </div>
  );
}
