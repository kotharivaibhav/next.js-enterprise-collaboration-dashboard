"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar, GripVertical } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Card } from "@/types/board";

interface KanbanCardProps {
  card: Card;
  onClick: () => void;
}

export function KanbanCard({ card, onClick }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id, data: { type: "card", card } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group rounded-lg border bg-card p-3 shadow-sm",
        isDragging && "opacity-50 ring-2 ring-primary/30",
      )}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          className="mt-0.5 cursor-grab text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>
        <button
          type="button"
          className="min-w-0 flex-1 text-left"
          onClick={onClick}
        >
          <p className="text-sm font-medium">{card.title}</p>
          {card.description && (
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
              {card.description}
            </p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {card.due_date && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="size-3" />
                {new Date(card.due_date).toLocaleDateString()}
              </span>
            )}
            {card.labels.map((label) => (
              <Badge key={label} variant="secondary" className="text-[10px]">
                {label}
              </Badge>
            ))}
          </div>
        </button>
      </div>
    </div>
  );
}

export function KanbanCardOverlay({ card }: { card: Card }) {
  return (
    <div className="w-72 rounded-lg border bg-card p-3 shadow-lg ring-2 ring-primary/20">
      <p className="text-sm font-medium">{card.title}</p>
    </div>
  );
}
