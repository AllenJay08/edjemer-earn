import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type BenefitLedger = Database['public']['Tables']['benefit_ledger']['Row'];

export function useBenefitLedger() {
  return useQuery({
    queryKey: ['benefit-ledger'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('benefit_ledger')
        .select(`
          *,
          customer:customers(*),
          purchase:purchases(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
}

export function useBenefitLedgerByCustomer(customerId: string) {
  return useQuery({
    queryKey: ['benefit-ledger', 'customer', customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('benefit_ledger')
        .select(`
          *,
          purchase:purchases(*)
        `)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!customerId,
  });
}

export function useBenefitStats() {
  return useQuery({
    queryKey: ['benefit-stats'],
    queryFn: async () => {
      const [
        { count: totalBenefits },
        { data: totalAmount },
        { data: benefitTypes }
      ] = await Promise.all([
        supabase.from('benefit_ledger').select('*', { count: 'exact', head: true }),
        supabase.from('benefit_ledger').select('amount'),
        supabase.from('benefit_ledger').select('benefit_type, amount')
      ]);

      const totalBenefitAmount = totalAmount?.reduce((sum, benefit) => sum + benefit.amount, 0) || 0;

      // Group by benefit type
      const typeDistribution = benefitTypes?.reduce((acc: any, benefit) => {
        acc[benefit.benefit_type] = (acc[benefit.benefit_type] || 0) + benefit.amount;
        return acc;
      }, {}) || {};

      return {
        totalBenefits,
        totalBenefitAmount,
        benefitTypeDistribution: Object.entries(typeDistribution).map(([type, amount]) => ({ type, amount }))
      };
    },
  });
}