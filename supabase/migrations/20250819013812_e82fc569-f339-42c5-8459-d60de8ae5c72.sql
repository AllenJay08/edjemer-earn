-- Create user roles enum and profiles table
CREATE TYPE public.app_role AS ENUM ('super_admin', 'manager', 'viewer');

-- User profiles table
CREATE TABLE public.profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User roles table
CREATE TABLE public.user_roles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'viewer',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, role)
);

-- Customer tiers table
CREATE TABLE public.customer_tiers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tier_name TEXT NOT NULL UNIQUE,
    min_purchases DECIMAL(10,2) NOT NULL DEFAULT 0,
    commission_rate DECIMAL(5,4) NOT NULL DEFAULT 0,
    benefits_multiplier DECIMAL(5,4) NOT NULL DEFAULT 1,
    tier_order INTEGER NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Customers table
CREATE TABLE public.customers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_code TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    address TEXT,
    recruited_by UUID REFERENCES public.customers(id),
    tier_id UUID REFERENCES public.customer_tiers(id),
    total_purchases DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_benefits DECIMAL(10,2) NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Purchases table
CREATE TABLE public.purchases (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    purchase_code TEXT NOT NULL UNIQUE,
    customer_id UUID REFERENCES public.customers(id) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    product_name TEXT NOT NULL,
    purchase_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    processed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Benefits ledger table
CREATE TABLE public.benefit_ledger (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES public.customers(id) NOT NULL,
    purchase_id UUID REFERENCES public.purchases(id),
    benefit_type TEXT NOT NULL CHECK (benefit_type IN ('purchase_benefit', 'recruitment_commission', 'tier_bonus')),
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Recruitment commissions table
CREATE TABLE public.recruitment_commissions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    recruiter_id UUID REFERENCES public.customers(id) NOT NULL,
    recruited_id UUID REFERENCES public.customers(id) NOT NULL,
    commission_rate DECIMAL(5,4) NOT NULL,
    total_earned DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Payouts table
CREATE TABLE public.payouts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES public.customers(id) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payout_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'failed')),
    reference_code TEXT NOT NULL UNIQUE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Audit logs table
CREATE TABLE public.audit_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benefit_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruitment_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get user role level
CREATE OR REPLACE FUNCTION public.get_user_role_level(_user_id UUID)
RETURNS INTEGER
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT CASE 
    WHEN public.has_role(_user_id, 'super_admin') THEN 3
    WHEN public.has_role(_user_id, 'manager') THEN 2
    WHEN public.has_role(_user_id, 'viewer') THEN 1
    ELSE 0
  END
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_roles  
CREATE POLICY "Super admins can view all roles"
ON public.user_roles FOR SELECT
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can manage roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for customer_tiers
CREATE POLICY "Authenticated users can view tiers"
ON public.customer_tiers FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Managers can manage tiers"
ON public.customer_tiers FOR ALL
USING (public.get_user_role_level(auth.uid()) >= 2);

-- RLS Policies for customers
CREATE POLICY "Authenticated users can view customers"
ON public.customers FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Managers can manage customers"
ON public.customers FOR ALL
USING (public.get_user_role_level(auth.uid()) >= 2);

-- RLS Policies for purchases
CREATE POLICY "Authenticated users can view purchases"
ON public.purchases FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Managers can manage purchases"
ON public.purchases FOR ALL
USING (public.get_user_role_level(auth.uid()) >= 2);

-- RLS Policies for benefit_ledger
CREATE POLICY "Authenticated users can view benefit ledger"
ON public.benefit_ledger FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Managers can manage benefit ledger"
ON public.benefit_ledger FOR ALL
USING (public.get_user_role_level(auth.uid()) >= 2);

-- RLS Policies for recruitment_commissions
CREATE POLICY "Authenticated users can view commissions"
ON public.recruitment_commissions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Managers can manage commissions"
ON public.recruitment_commissions FOR ALL
USING (public.get_user_role_level(auth.uid()) >= 2);

-- RLS Policies for payouts
CREATE POLICY "Authenticated users can view payouts"
ON public.payouts FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Managers can manage payouts"
ON public.payouts FOR ALL
USING (public.get_user_role_level(auth.uid()) >= 2);

-- RLS Policies for audit_logs
CREATE POLICY "Super admins can view audit logs"
ON public.audit_logs FOR SELECT
USING (public.has_role(auth.uid(), 'super_admin'));

-- Insert default customer tiers
INSERT INTO public.customer_tiers (tier_name, min_purchases, commission_rate, benefits_multiplier, tier_order) VALUES
('Bronze', 0, 0.02, 1.0, 1),
('Silver', 1000, 0.03, 1.2, 2),
('Gold', 5000, 0.05, 1.5, 3),
('Platinum', 15000, 0.07, 2.0, 4),
('Diamond', 50000, 0.10, 3.0, 5);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_customer_tiers_updated_at BEFORE UPDATE ON public.customer_tiers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_purchases_updated_at BEFORE UPDATE ON public.purchases FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_recruitment_commissions_updated_at BEFORE UPDATE ON public.recruitment_commissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payouts_updated_at BEFORE UPDATE ON public.payouts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to auto-assign tier based on purchases
CREATE OR REPLACE FUNCTION public.update_customer_tier()
RETURNS TRIGGER AS $$
DECLARE
    new_tier_id UUID;
BEGIN
    -- Find the appropriate tier based on total purchases
    SELECT id INTO new_tier_id
    FROM public.customer_tiers
    WHERE NEW.total_purchases >= min_purchases
    AND is_active = true
    ORDER BY tier_order DESC
    LIMIT 1;
    
    -- Update customer tier if it's different
    IF new_tier_id IS NOT NULL AND (OLD.tier_id IS NULL OR OLD.tier_id != new_tier_id) THEN
        NEW.tier_id = new_tier_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto tier assignment
CREATE TRIGGER trigger_update_customer_tier
BEFORE UPDATE OF total_purchases ON public.customers
FOR EACH ROW EXECUTE FUNCTION public.update_customer_tier();

-- Function to process purchase benefits
CREATE OR REPLACE FUNCTION public.process_purchase_benefits()
RETURNS TRIGGER AS $$
DECLARE
    customer_tier RECORD;
    recruiter_tier RECORD;
    benefit_amount DECIMAL(10,2);
    commission_amount DECIMAL(10,2);
BEGIN
    -- Skip if already processed
    IF NEW.processed = OLD.processed AND NEW.processed = true THEN
        RETURN NEW;
    END IF;
    
    -- Only process when marked as processed
    IF NEW.processed = true AND (OLD.processed = false OR OLD.processed IS NULL) THEN
        -- Get customer's tier info
        SELECT ct.* INTO customer_tier
        FROM public.customers c
        JOIN public.customer_tiers ct ON c.tier_id = ct.id
        WHERE c.id = NEW.customer_id;
        
        -- Calculate purchase benefit
        IF customer_tier.id IS NOT NULL THEN
            benefit_amount = NEW.amount * customer_tier.benefits_multiplier * 0.01; -- 1% base rate
            
            -- Add benefit to ledger
            INSERT INTO public.benefit_ledger (customer_id, purchase_id, benefit_type, amount, description)
            VALUES (NEW.customer_id, NEW.id, 'purchase_benefit', benefit_amount, 
                   'Purchase benefit for ' || NEW.product_name);
        END IF;
        
        -- Process recruitment commission if customer was recruited
        SELECT c.recruited_by, ct.* INTO recruiter_tier
        FROM public.customers c
        LEFT JOIN public.customer_tiers ct ON c.tier_id = ct.id
        WHERE c.id = NEW.customer_id AND c.recruited_by IS NOT NULL;
        
        IF recruiter_tier.recruited_by IS NOT NULL THEN
            commission_amount = NEW.amount * recruiter_tier.commission_rate;
            
            -- Add commission to ledger
            INSERT INTO public.benefit_ledger (customer_id, purchase_id, benefit_type, amount, description)
            VALUES (recruiter_tier.recruited_by, NEW.id, 'recruitment_commission', commission_amount,
                   'Recruitment commission from ' || (SELECT full_name FROM public.customers WHERE id = NEW.customer_id));
            
            -- Update recruitment commission record
            INSERT INTO public.recruitment_commissions (recruiter_id, recruited_id, commission_rate, total_earned)
            VALUES (recruiter_tier.recruited_by, NEW.customer_id, recruiter_tier.commission_rate, commission_amount)
            ON CONFLICT (recruiter_id, recruited_id) 
            DO UPDATE SET total_earned = recruitment_commissions.total_earned + commission_amount;
        END IF;
        
        -- Update customer totals
        UPDATE public.customers 
        SET total_purchases = total_purchases + NEW.amount,
            total_benefits = total_benefits + COALESCE(benefit_amount, 0)
        WHERE id = NEW.customer_id;
        
        -- Update recruiter totals if applicable
        IF recruiter_tier.recruited_by IS NOT NULL THEN
            UPDATE public.customers 
            SET total_benefits = total_benefits + commission_amount
            WHERE id = recruiter_tier.recruited_by;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for purchase processing
CREATE TRIGGER trigger_process_purchase_benefits
AFTER UPDATE ON public.purchases
FOR EACH ROW EXECUTE FUNCTION public.process_purchase_benefits();

-- Function for audit logging
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.audit_logs (user_id, action, table_name, record_id, new_values)
        VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_values, new_values)
        VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_values)
        VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create audit triggers for all tables
CREATE TRIGGER audit_customers AFTER INSERT OR UPDATE OR DELETE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();
CREATE TRIGGER audit_purchases AFTER INSERT OR UPDATE OR DELETE ON public.purchases FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();
CREATE TRIGGER audit_payouts AFTER INSERT OR UPDATE OR DELETE ON public.payouts FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();
CREATE TRIGGER audit_customer_tiers AFTER INSERT OR UPDATE OR DELETE ON public.customer_tiers FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- Create indexes for performance
CREATE INDEX idx_customers_recruited_by ON public.customers(recruited_by);
CREATE INDEX idx_customers_tier_id ON public.customers(tier_id);
CREATE INDEX idx_purchases_customer_id ON public.purchases(customer_id);
CREATE INDEX idx_purchases_purchase_date ON public.purchases(purchase_date);
CREATE INDEX idx_benefit_ledger_customer_id ON public.benefit_ledger(customer_id);
CREATE INDEX idx_benefit_ledger_created_at ON public.benefit_ledger(created_at);
CREATE INDEX idx_recruitment_commissions_recruiter_id ON public.recruitment_commissions(recruiter_id);
CREATE INDEX idx_payouts_customer_id ON public.payouts(customer_id);
CREATE INDEX idx_payouts_payout_date ON public.payouts(payout_date);
CREATE INDEX idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);