"use client";

import { useParams } from "next/navigation";
import { format } from "date-fns";
import { MapPin, Calendar, Users, ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { useEvent } from "@/hooks/use-events";
import { useMyRsvp, useToggleRsvp } from "@/hooks/use-rsvps";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RsvpList } from "@/components/rsvp-list";
import { toast } from "sonner";

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const { data: event, isLoading: eventLoading } = useEvent(id);
  const { data: myRsvp } = useMyRsvp(id);
  const toggleRsvp = useToggleRsvp();

  async function handleRsvp() {
    if (!user) {
      toast.error("Please sign in to RSVP");
      return;
    }
    try {
      await toggleRsvp.mutateAsync({
        eventId: id,
        currentRsvpId: myRsvp?.id,
      });
      toast.success(myRsvp ? "RSVP cancelled" : "You're attending!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast.error("Error", { description: message });
    }
  }

  if (eventLoading) {
    return (
      <div className="max-w-2xl space-y-6 animate-fade-in">
        <Skeleton className="h-4 w-28 rounded-md" />
        <div className="space-y-3">
          <Skeleton className="h-9 w-3/4 rounded-lg" />
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-2/3 rounded-md" />
        </div>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-2xl flex flex-col items-center justify-center py-24 text-center">
        <div className="bg-muted rounded-2xl p-6 mb-4">
          <Calendar className="h-10 w-10 text-muted-foreground mx-auto" />
        </div>
        <p className="font-semibold text-lg">Event not found</p>
        <p className="text-muted-foreground text-sm mt-1">
          This event may have been deleted or doesn&apos;t exist.
        </p>
        <Link href="/dashboard" className="mt-5">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to events
          </Button>
        </Link>
      </div>
    );
  }

  const isPast = new Date(event.event_date) < new Date();

  return (
    <div className="max-w-2xl space-y-8 animate-fade-up">
      {/* Back link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        Back to events
      </Link>

      {/* Event header card */}
      <div className="bg-card border border-border/60 rounded-2xl overflow-hidden card-shadow">
        {/* Color bar */}
        <div className={`h-2 w-full ${isPast ? "bg-muted-foreground/30" : "bg-primary"}`} />

        <div className="p-6 sm:p-8 space-y-5">
          {/* Title + badge */}
          <div className="flex items-start gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex-1 leading-tight">
              {event.title}
            </h1>
            {isPast ? (
              <Badge variant="secondary" className="shrink-0 mt-1">Past</Badge>
            ) : (
              <Badge className="shrink-0 mt-1 bg-primary/10 text-primary border-0">
                Upcoming
              </Badge>
            )}
          </div>

          {/* Description */}
          {event.description && (
            <p className="text-muted-foreground leading-relaxed">
              {event.description}
            </p>
          )}

          {/* Meta pills */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 bg-muted/60 rounded-xl px-4 py-2.5 text-sm">
              <Calendar className="h-4 w-4 text-primary shrink-0" />
              <span className="font-medium">
                {format(new Date(event.event_date), "EEEE, MMM d, yyyy")}
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">
                {format(new Date(event.event_date), "p")}
              </span>
            </div>

            {event.location && (
              <div className="flex items-center gap-2 bg-muted/60 rounded-xl px-4 py-2.5 text-sm">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span>{event.location}</span>
              </div>
            )}

            {event.max_capacity && (
              <div className="flex items-center gap-2 bg-muted/60 rounded-xl px-4 py-2.5 text-sm">
                <Users className="h-4 w-4 text-primary shrink-0" />
                <span>{event.max_capacity} spots available</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RSVP section */}
      {!isPast && user && (
        <div className={`
          rounded-2xl border p-5 flex flex-col sm:flex-row items-start sm:items-center
          justify-between gap-4 transition-all duration-300
          ${myRsvp
            ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50"
            : "bg-card border-border/60 card-shadow"
          }
        `}>
          <div className="flex items-center gap-3">
            {myRsvp ? (
              <div className="bg-emerald-100 dark:bg-emerald-900/50 rounded-full p-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            ) : (
              <div className="bg-primary/10 rounded-full p-2">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
            )}
            <div>
              <p className="font-semibold text-foreground text-sm">
                {myRsvp ? "You're going!" : "Will you attend?"}
              </p>
              <p className="text-xs text-muted-foreground">
                {myRsvp
                  ? "You've RSVPd to this event. Click to cancel."
                  : "Let others know you'll be there."}
              </p>
            </div>
          </div>

          <Button
            onClick={handleRsvp}
            disabled={toggleRsvp.isPending}
            variant={myRsvp ? "outline" : "default"}
            className={`shrink-0 font-semibold gap-2 ${
              myRsvp
                ? "border-emerald-300 dark:border-emerald-700 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                : "btn-primary-glow"
            }`}
          >
            {toggleRsvp.isPending ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                Updating...
              </span>
            ) : myRsvp ? (
              <>
                <XCircle className="h-4 w-4" />
                Cancel RSVP
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                RSVP — I&apos;m in!
              </>
            )}
          </Button>
        </div>
      )}

      {/* Live attendees */}
      <RsvpList eventId={id} />
    </div>
  );
}