import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Event } from "@/lib/supabase/types";

export function useEvents() {
  return useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: true });
      if (error) throw error;
      return data as Event[];
    },
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: ["events", id],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as Event;
    },
    enabled: !!id,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      values,
      userId,
    }: {
      values: Omit<Event, "id" | "created_at" | "updated_at" | "created_by">;
      userId: string;
    }) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("events")
        .insert({ ...values, created_by: userId })
        .select();
      if (error) throw error;
      return data?.[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...values }: Partial<Event> & { id: string }) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("events")
        .update({ ...values, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select();
      if (error) throw error;
      return data?.[0];
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["events", data?.id] });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}