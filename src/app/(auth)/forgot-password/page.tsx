import Link from "next/link";

import { Logo } from "@/components/common/logo";
import { ThemeToggle } from "@/components/common/theme-toggle";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between p-6">
        <Logo />
        <ThemeToggle />
      </header>
      <main className="flex flex-1 items-center justify-center px-4 pb-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Password reset</CardTitle>
            <CardDescription>
              Password reset is not yet available on the backend API. This page
              is scaffolded for Milestone 2.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Contact your workspace administrator or use account registration
              to get started.
            </p>
          </CardContent>
          <CardFooter>
            <Link
              href={ROUTES.login}
              className="inline-flex h-8 items-center justify-center rounded-lg border border-border bg-background px-2.5 text-sm font-medium hover:bg-muted"
            >
              Back to sign in
            </Link>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
