import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type Payout = Database['public']['Tables']['payouts']['Row'];
type PayoutInsert = Database['public']['Tables']['payouts']['Insert'];
type PayoutUpdate = Database['public']['Tables']['payouts']['Update'];

export function usePayouts() {
  return useQuery({
    queryKey: ['payouts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payouts')
        .select(`
          *,
          customer:customers(*)
        `)
        .order('payout_date', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
}

export function usePayout(id: string) {
  return useQuery({
    queryKey: ['payouts', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payouts')
        .select(`
          *,
          customer:customers(*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function usePayoutStats() {
  return useQuery({
    queryKey: ['payout-stats'],
    queryFn: async () => {
      const [
        { count: totalPayouts },
        { data: totalAmount },
        { data: pendingPayouts },
        { data: recentPayouts }
      ] = await Promise.all([
        supabase.from('payouts').select('*', { count: 'exact', head: true }),
        supabase.from('payouts').select('amount'),
        supabase.from('payouts').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('payouts').select('*, customer:customers(*)').order('payout_date', { ascending: false }).limit(5)
      ]);

      const totalPaid = totalAmount?.reduce((sum, payout) => sum + payout.amount, 0) || 0;

      return {
        totalPayouts,
        totalPaid,
        pendingPayouts: pendingPayouts?.length || 0,
        recentPayouts: recentPayouts || []
      };
    },
  });
}

export function useCreatePayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: PayoutInsert) => {
      const { data: payout, error } = await supabase
        .from('payouts')
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return payout;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payouts'] });
      queryClient.invalidateQueries({ queryKey: ['payout-stats'] });
      toast({
        title: "Success",
        description: "Payout created successfully.",
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

export function useUpdatePayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: PayoutUpdate }) => {
      const { data: payout, error } = await supabase
        .from('payouts')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return payout;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['payouts'] });
      queryClient.invalidateQueries({ queryKey: ['payouts', id] });
      queryClient.invalidateQueries({ queryKey: ['payout-stats'] });
      toast({
        title: "Success",
        description: "Payout updated successfully.",
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

export function useDeletePayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('payouts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payouts'] });
      queryClient.invalidateQueries({ queryKey: ['payout-stats'] });
      toast({
        title: "Success",
        description: "Payout deleted successfully.",
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