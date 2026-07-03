import Link from "next/link";

import { ROUTES } from "@/constants/routes";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href={ROUTES.home} className={className}>
      <span className="font-semibold tracking-tight">
        Collab<span className="text-primary">Forge</span>
      </span>
    </Link>
  );
}
