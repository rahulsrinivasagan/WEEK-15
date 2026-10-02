"use client";

import { useEvents } from "@/hooks/use-events";
import { useAuthStore } from "@/store/auth-store";
import { EventCard } from "@/components/event-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { CalendarX, Plus, Sparkles } from "lucide-react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export default function DashboardPage() {
  const { data: events, isLoading: eventsLoading, error } = useEvents();
  const { profile, isLoading: authLoading } = useAuthStore();
  const queryClient = useQueryClient();
  const isAdmin = profile?.role === "admin";
  const isLoading = authLoading || eventsLoading;

  // Refetch events every time page is visited
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["events"] });
  }, [queryClient]);

  const upcomingEvents = events?.filter(
    (e) => new Date(e.event_date) >= new Date()
  );
  const pastEvents = events?.filter(
    (e) => new Date(e.event_date) < new Date()
  );

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 rounded-lg" />
          <Skeleton className="h-4 w-72 rounded-md" />
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-destructive/10 rounded-full p-4 mb-4">
          <CalendarX className="h-8 w-8 text-destructive" />
        </div>
        <p className="font-semibold text-foreground">Failed to load events</p>
        <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-up">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              {isAdmin ? "Admin Dashboard" : "Member Dashboard"}
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Upcoming Events
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {upcomingEvents?.length
              ? `${upcomingEvents.length} event${upcomingEvents.length !== 1 ? "s" : ""} coming up`
              : "No upcoming events scheduled"}
          </p>
        </div>
        {isAdmin && (
          <Link href="/admin/events/new" className="shrink-0">
            <Button className="btn-primary-glow gap-2 font-semibold w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Create Event
            </Button>
          </Link>
        )}
      </div>

      {/* Upcoming events */}
      {!upcomingEvents?.length ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="bg-muted rounded-2xl p-6 mb-5">
            <CalendarX className="h-10 w-10 text-muted-foreground mx-auto" />
          </div>
          <p className="text-lg font-semibold text-foreground">No upcoming events</p>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-xs">
            {isAdmin
              ? "Create your first event to get started."
              : "Check back soon or ask an admin to create one."}
          </p>
          {isAdmin && (
            <Link href="/admin/events/new" className="mt-5">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create first event
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {upcomingEvents.map((event, i) => (
            <div
              key={event.id}
              className="animate-fade-up"
              style={{ animationDelay: `${i * 60}ms`, animationFillMode: "both" }}
            >
              <EventCard event={event} isAdmin={isAdmin} />
            </div>
          ))}
        </div>
      )}

      {/* Past events section */}
      {!!pastEvents?.length && (
        <div className="space-y-5 pt-4 border-t border-border/50">
          <h2 className="text-lg font-semibold text-muted-foreground">Past Events</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 opacity-60">
            {pastEvents.map((event) => (
              <EventCard key={event.id} event={event} isAdmin={isAdmin} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}