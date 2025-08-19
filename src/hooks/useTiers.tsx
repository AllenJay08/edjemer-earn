import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type Tier = Database['public']['Tables']['customer_tiers']['Row'];
type TierInsert = Database['public']['Tables']['customer_tiers']['Insert'];
type TierUpdate = Database['public']['Tables']['customer_tiers']['Update'];

export function useTiers() {
  return useQuery({
    queryKey: ['tiers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_tiers')
        .select('*')
        .order('tier_order', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });
}

export function useTier(id: string) {
  return useQuery({
    queryKey: ['tiers', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_tiers')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateTier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TierInsert) => {
      const { data: tier, error } = await supabase
        .from('customer_tiers')
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return tier;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tiers'] });
      toast({
        title: "Success",
        description: "Tier created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateTier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TierUpdate }) => {
      const { data: tier, error } = await supabase
        .from('customer_tiers')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return tier;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['tiers'] });
      queryClient.invalidateQueries({ queryKey: ['tiers', id] });
      toast({
        title: "Success",
        description: "Tier updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteTier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('customer_tiers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tiers'] });
      toast({
        title: "Success",
        description: "Tier deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}