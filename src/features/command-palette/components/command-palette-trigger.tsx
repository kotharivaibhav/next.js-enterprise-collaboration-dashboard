"use client";

import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useUiStore } from "@/store/ui-store";

export function CommandPaletteTrigger() {
  const setCommandPaletteOpen = useUiStore(
    (state) => state.setCommandPaletteOpen,
  );

  return (
    <Button
      variant="outline"
      size="sm"
      className="hidden h-8 gap-2 text-muted-foreground md:flex"
      onClick={() => setCommandPaletteOpen(true)}
    >
      <Search className="size-3.5" />
      <span>Search…</span>
      <kbd className="pointer-events-none ml-2 hidden rounded border bg-muted px-1.5 font-mono text-[10px] font-medium lg:inline-block">
        ⌘K
      </kbd>
    </Button>
  );
}
