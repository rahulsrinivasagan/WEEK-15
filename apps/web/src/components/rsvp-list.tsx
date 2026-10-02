"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useEventRsvps } from "@/hooks/use-rsvps";
import { Users, UserCheck, CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type RsvpListProps = {
  eventId: string;
};

export function RsvpList({ eventId }: RsvpListProps) {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const { data: rsvps, isLoading } = useEventRsvps(eventId);

  useEffect(() => {
    const channel = supabase
      .channel(`rsvps:event:${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "rsvps",
          filter: `event_id=eq.${eventId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["rsvps", eventId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, queryClient, supabase]);

  return (
    <div className="bg-card border border-border/60 rounded-2xl overflow-hidden card-shadow">
      <div className="px-6 py-4 border-b border-border/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm text-foreground">Attendees</h3>
          {rsvps && rsvps.length > 0 && (
            <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded-full">
              {rsvps.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          Live updates
        </div>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                <Skeleton className="h-4 w-32 rounded-md" />
              </div>
            ))}
          </div>
        ) : !rsvps?.length ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="bg-muted rounded-full p-3 mb-3">
              <UserCheck className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">No attendees yet</p>
            <p className="text-xs text-muted-foreground mt-1">Be the first to RSVP!</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {rsvps.map((rsvp, i) => {
              const name = rsvp.profiles?.full_name ?? "Anonymous";
              const initials = name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);

              const avatarColors = [
                "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300",
                "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
                "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
                "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
                "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300",
              ];
              const colorClass = avatarColors[i % avatarColors.length];

              return (
                <li
                  key={rsvp.id}
                  className="flex items-center gap-3 animate-fade-in"
                  style={{ animationDelay: `${i * 40}ms`, animationFillMode: "both" }}
                >
                  <div className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${colorClass}`}>
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{name}</p>
                    <p className="text-xs text-muted-foreground">Attending</p>
                  </div>
                  <div className="ml-auto">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}