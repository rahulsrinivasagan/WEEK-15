"use client";

import { useAuthStore } from "@/store/auth-store";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { format } from "date-fns";
import { useCreateEvent, useUpdateEvent } from "@/hooks/use-events";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { Event } from "@/lib/supabase/types";
import {
  Type,
  AlignLeft,
  MapPin,
  Clock,
  Users,
  ArrowLeft,
  Save,
  Plus,
} from "lucide-react";

const eventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  location: z.string().optional(),
  event_date: z.string().min(1, "Please select a date and time"),
  max_capacity: z.coerce.number().positive().optional().or(z.literal("")),
});

type EventFormProps = {
  event?: Event;
};

export function EventForm({ event }: EventFormProps) {
  const router = useRouter();
  const { user } = useAuthStore(); // ✅ moved to top level
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const isEditing = !!event;

  const [values, setValues] = useState({
    title: event?.title ?? "",
    description: event?.description ?? "",
    location: event?.location ?? "",
    event_date: event?.event_date
      ? format(new Date(event.event_date), "yyyy-MM-dd'T'HH:mm")
      : "",
    max_capacity: event?.max_capacity?.toString() ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleChange(field: string, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const result = eventSchema.safeParse(values);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors(
        Object.fromEntries(
          Object.entries(fieldErrors).map(([k, v]) => [k, v?.[0] ?? ""])
        )
      );
      return;
    }

    const payload = {
      title: values.title,
      description: values.description || null,
      location: values.location || null,
      event_date: new Date(values.event_date).toISOString(),
      max_capacity: values.max_capacity ? Number(values.max_capacity) : null,
    };

    try {
      if (isEditing) {
        await updateEvent.mutateAsync({ id: event.id, ...payload });
        toast.success("Event updated!");
      } else {
        await createEvent.mutateAsync({
          values: payload,
          userId: user?.id ?? "",
        });
        toast.success("Event created!");
      }
      router.push("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast.error("Error", { description: message });
    }
  }

  const isPending = createEvent.isPending || updateEvent.isPending;

  return (
    <div className="max-w-2xl animate-fade-up">
      <form onSubmit={handleSubmit}>
        <div className="bg-card border border-border/60 rounded-2xl overflow-hidden card-shadow">
          {/* Form header */}
          <div className="bg-muted/40 border-b border-border/40 px-6 py-5">
            <h2 className="font-semibold text-foreground">
              {isEditing ? "Edit event details" : "Event details"}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {isEditing
                ? "Update the information below"
                : "Fill in the details for your new event"}
            </p>
          </div>

          {/* Form fields */}
          <div className="p-6 space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium flex items-center gap-2">
                <Type className="h-3.5 w-3.5 text-muted-foreground" />
                Event title
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={values.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="e.g. Annual Sports Day"
                disabled={isPending}
                className="h-11 bg-background border-border/60 focus:border-primary transition-colors"
              />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium flex items-center gap-2">
                <AlignLeft className="h-3.5 w-3.5 text-muted-foreground" />
                Description
                <span className="text-muted-foreground text-xs font-normal">(optional)</span>
              </Label>
              <Textarea
                id="description"
                value={values.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Tell members what to expect, what to bring, and anything else they should know..."
                rows={4}
                disabled={isPending}
                className="bg-background border-border/60 focus:border-primary transition-colors resize-none"
              />
            </div>

            {/* Location + Date side by side on larger screens */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  Location
                  <span className="text-muted-foreground text-xs font-normal">(optional)</span>
                </Label>
                <Input
                  id="location"
                  value={values.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  placeholder="Community Hall, 123 Main St"
                  disabled={isPending}
                  className="h-11 bg-background border-border/60 focus:border-primary transition-colors"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="event_date" className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  Date and time
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="event_date"
                  type="datetime-local"
                  value={values.event_date}
                  onChange={(e) => handleChange("event_date", e.target.value)}
                  disabled={isPending}
                  className="h-11 bg-background border-border/60 focus:border-primary transition-colors"
                />
                {errors.event_date && (
                  <p className="text-xs text-destructive">{errors.event_date}</p>
                )}
              </div>
            </div>

            {/* Capacity */}
            <div className="space-y-2">
              <Label htmlFor="max_capacity" className="text-sm font-medium flex items-center gap-2">
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                Max capacity
                <span className="text-muted-foreground text-xs font-normal">(optional)</span>
              </Label>
              <Input
                id="max_capacity"
                type="number"
                value={values.max_capacity}
                onChange={(e) => handleChange("max_capacity", e.target.value)}
                placeholder="e.g. 50"
                disabled={isPending}
                className="h-11 bg-background border-border/60 focus:border-primary transition-colors max-w-xs"
              />
              <p className="text-xs text-muted-foreground">
                Leave empty for unlimited capacity
              </p>
            </div>
          </div>

          {/* Form footer */}
          <div className="bg-muted/30 border-t border-border/40 px-6 py-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
              disabled={isPending}
              className="gap-2 text-muted-foreground hover:text-foreground order-2 sm:order-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isPending}
              className="btn-primary-glow gap-2 font-semibold order-1 sm:order-2"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Saving...
                </span>
              ) : isEditing ? (
                <>
                  <Save className="h-4 w-4" />
                  Save changes
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Create event
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}