import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type Purchase = Database['public']['Tables']['purchases']['Row'];
type PurchaseInsert = Database['public']['Tables']['purchases']['Insert'];
type PurchaseUpdate = Database['public']['Tables']['purchases']['Update'];

export function usePurchases() {
  return useQuery({
    queryKey: ['purchases'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          *,
          customer:customers(*)
        `)
        .order('purchase_date', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
}

export function usePurchase(id: string) {
  return useQuery({
    queryKey: ['purchases', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchases')
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

export function usePurchaseStats() {
  return useQuery({
    queryKey: ['purchase-stats'],
    queryFn: async () => {
      const [
        { count: totalPurchases },
        { data: totalSales },
        { data: recentPurchases },
        { data: monthlyTrend }
      ] = await Promise.all([
        supabase.from('purchases').select('*', { count: 'exact', head: true }),
        supabase.from('purchases').select('amount'),
        supabase.from('purchases').select('*, customer:customers(*)').order('purchase_date', { ascending: false }).limit(10),
        supabase.from('purchases').select('amount, purchase_date').gte('purchase_date', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString())
      ]);

      const totalAmount = totalSales?.reduce((sum, purchase) => sum + purchase.amount, 0) || 0;

      // Process monthly trend
      const monthlyData = monthlyTrend?.reduce((acc: any, purchase) => {
        const month = new Date(purchase.purchase_date).toLocaleString('default', { month: 'short', year: 'numeric' });
        acc[month] = (acc[month] || 0) + purchase.amount;
        return acc;
      }, {}) || {};

      return {
        totalPurchases,
        totalSales: totalAmount,
        recentPurchases: recentPurchases || [],
        monthlyTrend: Object.entries(monthlyData).map(([month, amount]) => ({ month, amount }))
      };
    },
  });
}

export function useCreatePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: PurchaseInsert) => {
      const { data: purchase, error } = await supabase
        .from('purchases')
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return purchase;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-stats'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer-stats'] });
      toast({
        title: "Success",
        description: "Purchase created successfully.",
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

export function useUpdatePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: PurchaseUpdate }) => {
      const { data: purchase, error } = await supabase
        .from('purchases')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return purchase;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['purchases', id] });
      queryClient.invalidateQueries({ queryKey: ['purchase-stats'] });
      toast({
        title: "Success",
        description: "Purchase updated successfully.",
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

export function useDeletePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('purchases')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-stats'] });
      toast({
        title: "Success",
        description: "Purchase deleted successfully.",
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