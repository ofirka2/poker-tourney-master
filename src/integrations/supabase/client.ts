
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Retrieve environment variables with fallbacks to prevent errors
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if required configuration is available
if (!SUPABASE_URL) {
  console.error('ERROR: Missing VITE_SUPABASE_URL environment variable');
}

if (!SUPABASE_ANON_KEY) {
  console.error('ERROR: Missing VITE_SUPABASE_ANON_KEY environment variable');
}

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = SUPABASE_URL 
  ? createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null as any; // Fallback to avoid runtime crashes, but will show clear console error
