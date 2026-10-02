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
import { CalendarDays, Mail, Lock, User, ArrowRight, Check } from "lucide-react";

const registerSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const result = registerSchema.safeParse({ fullName, email, password });
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        fullName: fieldErrors.fullName?.[0] ?? "",
        email: fieldErrors.email?.[0] ?? "",
        password: fieldErrors.password?.[0] ?? "",
      });
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (error) {
      toast.error("Registration failed", { description: error.message });
      setIsLoading(false);
      return;
    }

    toast.success("Account created!", { description: "Please check your email to confirm." });
    router.push("/auth/login");
  }

  const perks = [
    "Browse and RSVP to club events",
    "See live attendee updates",
    "Get notified about new events",
  ];

  return (
    <div className="min-h-screen flex auth-gradient">
      {/* Left panel — branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col justify-between p-12 relative overflow-hidden">
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

        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-white leading-tight">
              Join your club&apos;s<br />digital home.
            </h1>
            <p className="text-white/75 text-lg leading-relaxed">
              Create your free account and start connecting with your community today.
            </p>
          </div>

          <div className="space-y-3">
            {perks.map((perk) => (
              <div key={perk} className="flex items-center gap-3">
                <div className="bg-white/20 rounded-full p-1">
                  <Check className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-white/85 text-sm">{perk}</span>
              </div>
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
              Create your account
            </h2>
            <p className="text-muted-foreground mt-2">
              Join your community club on ClubHub — it&apos;s free
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-sm font-medium">
                Full name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Your Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isLoading}
                  className="pl-10 h-11 bg-background border-border/60 focus:border-primary transition-colors"
                />
              </div>
              {errors.fullName && (
                <p className="text-xs text-destructive mt-1">{errors.fullName}</p>
              )}
            </div>

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
                <p className="text-xs text-destructive mt-1">{errors.email}</p>
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
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="pl-10 h-11 bg-background border-border/60 focus:border-primary transition-colors"
                />
              </div>
              {errors.password && (
                <p className="text-xs text-destructive mt-1">{errors.password}</p>
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
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Create free account
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="text-primary font-semibold hover:underline underline-offset-4"
              >
                Sign in
              </Link>
            </p>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground/60">
            By creating an account you agree to our terms of service.
          </p>
        </div>
      </div>
    </div>
  );
}