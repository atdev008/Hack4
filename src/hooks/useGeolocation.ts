"use client";

import { useState, useEffect } from "react";

interface GeoLocation {
  lat: number;
  lng: number;
}

interface UseGeolocationResult {
  location: GeoLocation | null;
  loading: boolean;
  error: string | null;
}

export function useGeolocation(): UseGeolocationResult {
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLoading(false);
      },
      () => {
        // User denied or error — silently fail, we'll use province-based weather
        setError("denied");
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
    );
  }, []);

  return { location, loading, error };
}
