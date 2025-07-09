-- Update RLS policies for players table
-- Drop existing restrictive policies if any
DROP POLICY IF EXISTS "Authenticated users can read players" ON public.players;

-- Create comprehensive policies for players table
CREATE POLICY "Authenticated users and admins can view players"
    ON public.players
    FOR SELECT
    USING (auth.role() = 'authenticated' OR public.is_admin());

CREATE POLICY "Authenticated users and admins can insert players"
    ON public.players
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated' OR public.is_admin());

CREATE POLICY "Authenticated users and admins can update players"
    ON public.players
    FOR UPDATE
    USING (auth.role() = 'authenticated' OR public.is_admin());

CREATE POLICY "Authenticated users and admins can delete players"
    ON public.players
    FOR DELETE
    USING (auth.role() = 'authenticated' OR public.is_admin());

-- Update RLS policies for tables table
-- Drop existing restrictive policies if any
DROP POLICY IF EXISTS "Authenticated users can read tables" ON public.tables;

-- Create comprehensive policies for tables table
CREATE POLICY "Authenticated users and admins can view tables"
    ON public.tables
    FOR SELECT
    USING (auth.role() = 'authenticated' OR public.is_admin());

CREATE POLICY "Authenticated users and admins can insert tables"
    ON public.tables
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated' OR public.is_admin());

CREATE POLICY "Authenticated users and admins can update tables"
    ON public.tables
    FOR UPDATE
    USING (auth.role() = 'authenticated' OR public.is_admin());

CREATE POLICY "Authenticated users and admins can delete tables"
    ON public.tables
    FOR DELETE
    USING (auth.role() = 'authenticated' OR public.is_admin());