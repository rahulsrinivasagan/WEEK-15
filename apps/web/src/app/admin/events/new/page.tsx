import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { EventForm } from "@/components/event-form";
import { Navbar } from "@/components/navbar";

export default async function NewEventPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-6">Create new event</h1>
        <EventForm />
      </main>
    </div>
  );
}