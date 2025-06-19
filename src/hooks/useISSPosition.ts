import { useEffect, useRef, useState } from 'react';

const API_URL = process.env.REACT_APP_ISS_API_URL || 'https://api.wheretheiss.at/v1/satellites/25544';
const HISTORY_API_URL = 'https://api.wheretheiss.at/v1/satellites/25544/positions?timestamps=';

type Position = [number, number];

interface UseISSPositionResult {
  issPosition: Position | null;
  pastPositions: Position[];
  error: string | null;
  loading: boolean;
}

export function useISSPosition(): UseISSPositionResult {
  const [issPosition, setIssPosition] = useState<Position | null>(null);
  const [pastPositions, setPastPositions] = useState<Position[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchISS() {
      try {
        setLoading(true);
        const res = await fetch(API_URL);
        if (!res.ok) {
          setError('Failed to fetch ISS position');
          return;
        }
        const data = await res.json();
        const pos: Position = [data.latitude, data.longitude];
        if (isMounted) {
          setIssPosition(pos);
          setPastPositions(prev => [...prev, pos]);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchISS();
    intervalRef.current = setInterval(fetchISS, 1000);
    return () => {
      isMounted = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const now = Math.floor(Date.now() / 1000);
        const timestamps = Array.from({ length: 20 }, (_, i) => now - i * 60).reverse();
        const res = await fetch(HISTORY_API_URL + timestamps.join(','));
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data)) {
          setPastPositions(data.map((d: any) => [d.latitude, d.longitude] as Position));
        }
      } catch {}
    }
    fetchHistory();
  }, []);

  return { issPosition, pastPositions, error, loading };
} 