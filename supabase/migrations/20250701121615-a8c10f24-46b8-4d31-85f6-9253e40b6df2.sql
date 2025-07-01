
-- Add user_id column to tournaments table to track ownership
ALTER TABLE public.tournaments 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create user_roles table for role-based access control
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS app_role
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
    SELECT role FROM public.user_roles WHERE user_id = user_uuid LIMIT 1;
$$;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'
    );
$$;

-- Drop existing tournaments policies
DROP POLICY IF EXISTS "Authenticated users can read tournaments" ON public.tournaments;

-- Create new RLS policies for tournaments
CREATE POLICY "Users can view own tournaments or admins can view all"
    ON public.tournaments
    FOR SELECT
    USING (
        auth.uid() = user_id OR public.is_admin()
    );

CREATE POLICY "Users can insert their own tournaments"
    ON public.tournaments
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tournaments or admins can update all"
    ON public.tournaments
    FOR UPDATE
    USING (
        auth.uid() = user_id OR public.is_admin()
    );

CREATE POLICY "Users can delete own tournaments or admins can delete all"
    ON public.tournaments
    FOR DELETE
    USING (
        auth.uid() = user_id OR public.is_admin()
    );

-- RLS policies for user_roles table
CREATE POLICY "Users can view their own roles and admins can view all"
    ON public.user_roles
    FOR SELECT
    USING (
        auth.uid() = user_id OR public.is_admin()
    );

CREATE POLICY "Only admins can insert roles"
    ON public.user_roles
    FOR INSERT
    WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update roles"
    ON public.user_roles
    FOR UPDATE
    USING (public.is_admin());

CREATE POLICY "Only admins can delete roles"
    ON public.user_roles
    FOR DELETE
    USING (public.is_admin());

-- Create trigger to automatically assign 'user' role to new users
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_role
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- Add update trigger for user_roles
CREATE TRIGGER update_user_roles_updated_at
    BEFORE UPDATE ON public.user_roles
    FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();
