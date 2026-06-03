
-- Lock down leads table: all access goes through server functions using supabaseAdmin (service_role)
DROP POLICY IF EXISTS "Anyone can read leads" ON public.leads;
DROP POLICY IF EXISTS "Anyone can insert leads" ON public.leads;

-- Keep admin update policy; add admin select policy for direct admin access if ever needed
CREATE POLICY "Admins can read leads"
ON public.leads
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));
