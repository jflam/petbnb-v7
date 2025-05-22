import { useState, useEffect } from 'react';
import useSWR from 'swr';

export interface Sitter {
  id: number;
  title: string;
  description: string;
  hourly_rate: number | null;
  daily_rate: number | null;
  address: string;
  city: string;
  available: boolean;
  image_url: string | null;
  rating: number;
  review_count: number;
  first_name: string;
  last_name: string;
  phone: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  } | null;
  meters?: number;
}

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

export function useAllSitters() {
  const { data, error, isLoading } = useSWR<Sitter[]>(
    '/api/sitters',
    fetcher
  );

  return {
    sitters: data || [],
    isLoading,
    error
  };
}

export function useNearbySitters(lon: number, lat: number, km = 5) {
  const { data, error, isLoading } = useSWR<Sitter[]>(
    `/api/sitters/nearby?lon=${lon}&lat=${lat}&km=${km}`,
    fetcher
  );

  return {
    sitters: data || [],
    isLoading,
    error
  };
}

// Hook to get the user's current location
export function useUserLocation() {
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLoading(false);
      },
      (error) => {
        setError(`Error getting location: ${error.message}`);
        setLoading(false);
        
        // Fallback to Seattle coordinates
        setLocation({
          lat: 47.6062,
          lng: -122.3321
        });
      }
    );
  }, []);

  return { location, error, loading };
}