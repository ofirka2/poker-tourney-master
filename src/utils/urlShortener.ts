// src/utils/urlShortener.ts

/**
 * A simple URL shortener service that uses localStorage for storage
 * In a production app, this would be replaced with a proper backend service
 */

// Prefix for localStorage keys to avoid conflicts
const STORAGE_PREFIX = 'poker-tournament-share-';

/**
 * Generates a short unique ID
 * @returns A short unique string ID
 */
const generateShortId = (): string => {
  // Generate a random ID of 8 characters
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Shortens a long URL by storing it and returning a short ID
 * @param longUrl The long URL to shorten
 * @returns A short URL
 */
  // Generate a short ID
  export const shortenUrl = (longUrl: string): string => {
    const shortId = generateShortId();
    localStorage.setItem(STORAGE_PREFIX + shortId, longUrl);
  
  // Store the mapping in localStorage
  localStorage.setItem(STORAGE_PREFIX + shortId, longUrl);
  
  // Return the shortened URL (using the current origin)
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}#/t/${shortId}`;
};

/**
 * Retrieves the original long URL from a short ID
 * @param shortId The short ID
 * @returns The original long URL if found, null otherwise
 */
export const expandUrl = (shortId: string): string | null => {
  const longUrl = localStorage.getItem(STORAGE_PREFIX + shortId);
  return longUrl;
};

/**
 * Gets all stored short URLs
 * @returns Array of short URL objects with id and url
 */
export const getAllShortUrls = (): Array<{ id: string, url: string }> => {
  const shortUrls = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(STORAGE_PREFIX)) {
      const shortId = key.replace(STORAGE_PREFIX, '');
      const longUrl = localStorage.getItem(key);
      if (longUrl) {
        shortUrls.push({ id: shortId, url: longUrl });
      }
    }
  }
  return shortUrls;
};

/**
 * Removes a short URL
 * @param shortId The short ID to remove
 */
export const removeShortUrl = (shortId: string): void => {
  localStorage.removeItem(STORAGE_PREFIX + shortId);
};