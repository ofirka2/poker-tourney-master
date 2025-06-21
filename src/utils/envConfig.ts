
/**
 * Environment configuration utility
 * Provides type-safe access to environment variables with fallbacks
 */

/**
 * Get an environment variable as a string with a fallback value
 */
export const getEnvString = (key: string, fallback: string): string => {
  const value = import.meta.env[key];
  return value !== undefined ? String(value) : fallback;
};

/**
 * Get an environment variable as an integer with a fallback value
 */
export const getEnvInt = (key: string, fallback: number): number => {
  const value = import.meta.env[key];
  return value !== undefined ? parseInt(String(value), 10) : fallback;
};

/**
 * Get an environment variable as a float with a fallback value
 */
export const getEnvFloat = (key: string, fallback: number): number => {
  const value = import.meta.env[key];
  return value !== undefined ? parseFloat(String(value)) : fallback;
};

/**
 * Get an environment variable as a boolean with a fallback value
 */
export const getEnvBool = (key: string, fallback: boolean): boolean => {
  const value = import.meta.env[key];
  if (value === undefined) return fallback;
  return String(value).toLowerCase() === 'true';
};

/**
 * Tournament default configuration from environment variables
 */
export const tournamentDefaults = {
  playerCount: getEnvInt('VITE_DEFAULT_PLAYER_COUNT', 9),
  tournamentDuration: getEnvFloat('VITE_DEFAULT_TOURNAMENT_DURATION', 4),
  buyInAmount: getEnvInt('VITE_DEFAULT_BUY_IN_AMOUNT', 100),
  allowRebuy: getEnvBool('VITE_DEFAULT_ALLOW_REBUY', true),
  allowAddon: getEnvBool('VITE_DEFAULT_ALLOW_ADDON', true),
};
