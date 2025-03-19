// src/pages/ShortUrlRedirect.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { expandUrl } from "@/utils/urlShortener";
import Layout from "@/components/layout/Layout";

/**
 * A component that handles redirecting from short URLs to the full tournament view
 */
const ShortUrlRedirect: React.FC = () => {
  const { shortId } = useParams<{ shortId: string }>();
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!shortId) {
      setError("Invalid URL");
      return;
    }

    // Try to expand the short URL
    const fullUrl = expandUrl(shortId);
    
    if (!fullUrl) {
      setError("Tournament link not found or has expired");
      return;
    }

    // Extract the path and search params from the full URL
    try {
      const url = new URL(fullUrl);
      const path = url.pathname;
      const search = url.search;
      
      // Navigate to the tournament view
      navigate(`${path}${search}`, { replace: true });
    } catch (err) {
      console.error("Error parsing URL:", err);
      setError("Invalid tournament link");
    }
  }, [shortId, navigate]);

  if (error) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-red-500 text-2xl">!</span>
          </div>
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center animate-pulse mb-4">
          <span className="text-blue-500 text-2xl">⟳</span>
        </div>
        <h2 className="text-xl font-bold mb-2">Loading Tournament</h2>
        <p className="text-muted-foreground">Please wait, redirecting to the tournament view...</p>
      </div>
    </Layout>
  );
};

export default ShortUrlRedirect;