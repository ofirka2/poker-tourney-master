// src/config/env.ts // Assuming this is the correct path

const parseNumericEnv = (key: string, defaultValue: number): number => {
  const value = import.meta.env[key];
  if (value === undefined) return defaultValue;

  const parsed = Number(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

const parseBooleanEnv = (key: string, defaultValue: boolean): boolean => {
  const value = import.meta.env[key];
  if (value === undefined) return defaultValue;

  // Handle string representation of booleans
  if (value === 'true' || value === '1') return true;
  if (value === 'false' || value === '0') return false;

  return defaultValue;
};

const parseStringEnv = (key: string, defaultValue: string): string => {
  const value = import.meta.env[key];
  if (value === undefined) return defaultValue;
  return value;
};

// Define chipset and format options directly within env.ts
export const chipsets = [
  { value: '25,100,500,1000,5000', label: '25, 100, 500, 1000, 5000' },
  { value: '25,50,100,500,1000', label: '25, 50, 100, 500, 1000' },
  { value: '5,25,100,500,1000', label: '5, 25, 100, 500, 1000' },
  { value: '1,2,5,10,25,50', label: '1, 2, 5, 10, 25, 50' },
  { value: 'custom', label: 'Custom Chipset...' }
];

export const formats = [
  { value: 'freezeout', label: 'Freezeout' },
  { value: 'rebuy', label: 'Rebuy' },
  { value: 'bounty', label: 'Bounty' },
  { value: 'deepstack', label: 'Deepstack' }
];

// Application environment variables with their default values
export const ENV = {
  // Tournament setup
  PLAYER_COUNT: parseNumericEnv('VITE_PLAYER_COUNT', 9),
  DESIRED_DURATION: parseNumericEnv('VITE_DESIRED_DURATION', 4), // in hours
  BUY_IN_AMOUNT: parseNumericEnv('VITE_BUY_IN_AMOUNT', 100), // in dollars
  ALLOW_REBUY: parseBooleanEnv('VITE_ALLOW_REBUY', true),
  ALLOW_ADDON: parseBooleanEnv('VITE_ALLOW_ADDON', true),

  // Add these lines:
  FORMAT: parseStringEnv('VITE_FORMAT', formats[0].value), // Default to first format option
  CHIPSET: parseStringEnv('VITE_CHIPSET', chipsets[0].value), // Default to first chipset option

  // Supabase configuration (documented here but used directly in client.ts)
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
};

// Type definition for the environment
export type AppEnvironment = typeof ENV;