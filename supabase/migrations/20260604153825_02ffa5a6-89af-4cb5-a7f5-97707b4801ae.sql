-- Lock down writes: only service_role can insert/update; public keeps read access
DROP POLICY IF EXISTS "Anyone can insert winners" ON public.simulator_winners;
DROP POLICY IF EXISTS "Anyone can update winners" ON public.simulator_winners;

REVOKE INSERT, UPDATE, DELETE ON public.simulator_winners FROM anon, authenticated, PUBLIC;
GRANT SELECT ON public.simulator_winners TO anon, authenticated;
GRANT ALL ON public.simulator_winners TO service_role;

-- Lock down the SECURITY DEFINER RPC so clients can't call it directly to inflate counts
REVOKE EXECUTE ON FUNCTION public.increment_winner(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_winner(text) TO service_role;