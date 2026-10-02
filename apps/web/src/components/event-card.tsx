"use client";

import Link from "next/link";
import { format } from "date-fns";
import { MapPin, Calendar, Users, ArrowRight, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Event } from "@/lib/supabase/types";
import { useDeleteEvent } from "@/hooks/use-events";
import { toast } from "sonner";

type EventCardProps = {
  event: Event;
  isAdmin: boolean;
};

// Generate a consistent soft color per event based on title
function getEventColor(title: string) {
  const colors = [
    { bg: "bg-blue-50 dark:bg-blue-950/40", accent: "bg-blue-500", text: "text-blue-700 dark:text-blue-300" },
    { bg: "bg-violet-50 dark:bg-violet-950/40", accent: "bg-violet-500", text: "text-violet-700 dark:text-violet-300" },
    { bg: "bg-emerald-50 dark:bg-emerald-950/40", accent: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-300" },
    { bg: "bg-amber-50 dark:bg-amber-950/40", accent: "bg-amber-500", text: "text-amber-700 dark:text-amber-300" },
    { bg: "bg-rose-50 dark:bg-rose-950/40", accent: "bg-rose-500", text: "text-rose-700 dark:text-rose-300" },
    { bg: "bg-cyan-50 dark:bg-cyan-950/40", accent: "bg-cyan-500", text: "text-cyan-700 dark:text-cyan-300" },
  ];
  const index = title.charCodeAt(0) % colors.length;
  return colors[index];
}

export function EventCard({ event, isAdmin }: EventCardProps) {
  const deleteEvent = useDeleteEvent();
  const isPast = new Date(event.event_date) < new Date();
  const color = getEventColor(event.title);

  async function handleDelete() {
    if (!confirm("Delete this event? This cannot be undone.")) return;
    try {
      await deleteEvent.mutateAsync(event.id);
      toast.success("Event deleted");
    } catch {
      toast.error("Could not delete event.");
    }
  }

  return (
    <div className={`
      group relative flex flex-col rounded-2xl border border-border/60
      bg-card card-shadow overflow-hidden
      hover:border-primary/30 hover:shadow-lg
      transition-all duration-300
      ${isPast ? "opacity-70" : ""}
    `}>
      {/* Color accent bar */}
      <div className={`h-1.5 w-full ${color.accent}`} />

      {/* Card body */}
      <div className="flex flex-col flex-1 p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-semibold text-foreground text-base leading-snug line-clamp-2 flex-1">
            {event.title}
          </h3>
          {isPast ? (
            <Badge variant="secondary" className="shrink-0 text-xs">Past</Badge>
          ) : (
            <Badge className={`shrink-0 text-xs border-0 ${color.bg} ${color.text}`}>
              Upcoming
            </Badge>
          )}
        </div>

        {/* Meta info */}
        <div className="space-y-2 mb-4 flex-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-primary/70" />
            <span className="font-medium">
              {format(new Date(event.event_date), "MMM d, yyyy")}
            </span>
            <span className="text-muted-foreground/60">·</span>
            <span>{format(new Date(event.event_date), "p")}</span>
          </div>

          {event.location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-primary/70" />
              <span className="truncate">{event.location}</span>
            </div>
          )}

          {event.max_capacity && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-3.5 w-3.5 shrink-0 text-primary/70" />
              <span>{event.max_capacity} spots</span>
            </div>
          )}

          {event.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 pt-1 leading-relaxed">
              {event.description}
            </p>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-border/40">
          <Link href={`/dashboard/events/${event.id}`} className="flex-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between group/btn text-primary hover:text-primary hover:bg-primary/8 font-medium"
            >
              View details
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
            </Button>
          </Link>

          {isAdmin && (
            <div className="flex gap-1.5">
              <Link href={`/admin/events/${event.id}/edit`}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                  title="Edit event"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={handleDelete}
                disabled={deleteEvent.isPending}
                title="Delete event"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}