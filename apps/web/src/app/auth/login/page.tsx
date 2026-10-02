"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CalendarDays, Mail, Lock, ArrowRight } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      });
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.error("Login failed", { description: error.message });
      setIsLoading(false);
      return;
    }

    toast.success("Welcome back!");
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex auth-gradient">
      {/* Left panel — branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col justify-between p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-32 right-16 w-48 h-48 rounded-full bg-white blur-2xl" />
          <div className="absolute top-1/2 left-1/3 w-32 h-32 rounded-full bg-white blur-xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-xl p-2.5">
              <CalendarDays className="h-6 w-6 text-white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">ClubHub</span>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Your community,<br />all in one place.
          </h1>
          <p className="text-white/75 text-lg leading-relaxed">
            Discover events, connect with members, and never miss out on what your club has to offer.
          </p>
          <div className="flex gap-4 pt-2">
            {["Events", "Members", "RSVPs", "Realtime"].map((tag) => (
              <span
                key={tag}
                className="bg-white/15 text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/20"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-white/50 text-sm">
            © 2026 ClubHub. Built with Next.js & Supabase.
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md animate-fade-up">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="bg-primary rounded-lg p-2">
              <CalendarDays className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">ClubHub</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground tracking-tight">
              Welcome back
            </h2>
            <p className="text-muted-foreground mt-2">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="pl-10 h-11 bg-background border-border/60 focus:border-primary transition-colors"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="pl-10 h-11 bg-background border-border/60 focus:border-primary transition-colors"
                />
              </div>
              {errors.password && (
                <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                  {errors.password}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11 font-semibold btn-primary-glow mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign in
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/register"
                className="text-primary font-semibold hover:underline underline-offset-4"
              >
                Create one free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}