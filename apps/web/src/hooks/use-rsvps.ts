import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { RsvpWithProfile } from "@/lib/supabase/types";

export function useEventRsvps(eventId: string) {
  return useQuery({
    queryKey: ["rsvps", eventId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("rsvps")
        .select("*, profiles(id, full_name, avatar_url)")
        .eq("event_id", eventId)
        .eq("status", "attending");
      if (error) throw error;
      return data as RsvpWithProfile[];
    },
    enabled: !!eventId,
  });
}

export function useMyRsvp(eventId: string) {
  return useQuery({
    queryKey: ["my-rsvp", eventId],
    queryFn: async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase
        .from("rsvps")
        .select("*")
        .eq("event_id", eventId)
        .eq("user_id", user.id)
        .single();
      return data;
    },
    enabled: !!eventId,
  });
}

export function useToggleRsvp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      eventId,
      currentRsvpId,
    }: {
      eventId: string;
      currentRsvpId?: string;
    }) => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in to RSVP");

      if (currentRsvpId) {
        const { error } = await supabase
          .from("rsvps")
          .delete()
          .eq("id", currentRsvpId);
        if (error) throw error;
        return null;
      } else {
        const { data, error } = await supabase
          .from("rsvps")
          .insert({ event_id: eventId, user_id: user.id, status: "attending" })
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ["rsvps", eventId] });
      queryClient.invalidateQueries({ queryKey: ["my-rsvp", eventId] });
    },
  });
}