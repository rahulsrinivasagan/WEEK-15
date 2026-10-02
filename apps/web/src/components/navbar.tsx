"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { CalendarDays, Plus, LogOut, Shield } from "lucide-react";

export function Navbar() {
  const { user, profile } = useAuthStore();
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  }

  const displayName = profile?.full_name ?? user?.email ?? "";
  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : (user?.email?.[0] ?? "?").toUpperCase();

  return (
    <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 font-bold text-lg tracking-tight shrink-0 hover:opacity-80 transition-opacity"
        >
          <div className="bg-primary rounded-lg p-1.5">
            <CalendarDays className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="hidden sm:block">ClubHub</span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-3">
          {profile?.role === "admin" && (
            <Link href="/admin/events/new">
              <Button
                size="sm"
                className="btn-primary-glow gap-1.5 font-semibold hidden sm:flex"
              >
                <Plus className="h-4 w-4" />
                New Event
              </Button>
              {/* Mobile version — icon only */}
              <Button size="icon" className="sm:hidden h-9 w-9">
                <Plus className="h-4 w-4" />
              </Button>
            </Link>
          )}

          {/* User pill */}
          <div className="flex items-center gap-2 bg-muted/60 border border-border/50 rounded-full pl-1 pr-3 py-1">
            <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="hidden sm:flex flex-col leading-none">
              <span className="text-xs font-medium text-foreground truncate max-w-[120px]">
                {displayName}
              </span>
              {profile?.role === "admin" && (
                <span className="text-[10px] text-primary flex items-center gap-0.5 font-medium">
                  <Shield className="h-2.5 w-2.5" />
                  Admin
                </span>
              )}
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
}