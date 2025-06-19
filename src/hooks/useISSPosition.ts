import {useEffect, useRef, useState} from 'react';

const API_URL = process.env.REACT_APP_ISS_API_URL || 'https://api.wheretheiss.at/v1/satellites/25544';
const HISTORY_API_URL = 'https://api.wheretheiss.at/v1/satellites/25544/positions?timestamps=';

type Position = [number, number];

export interface ISSPositionResult {
  issPosition: Position | null;
  pastPositions: Position[];
  error: string | null;
  velocity: number;
  timestamp: number;
}

export function useISSPosition(): ISSPositionResult {
  const [issPosition, setIssPosition] = useState<Position | null>(null);
  const [pastPositions, setPastPositions] = useState<Position[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [velocity, setVelocity] = useState<number>(0);
  const [timestamp, setTimestamp] = useState<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchISS() {
      try {
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
          setVelocity(data.velocity);
          setTimestamp(data.timestamp);
        }
      } catch (err: any) {
        if (isMounted) setError(err.message);
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
        const timestamps = Array.from({length: 45}, (_, i) => now - (44 - i) * 60);
        const res = await fetch(HISTORY_API_URL + timestamps.join(','));
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data)) {
          setPastPositions(data.map((d: any) => [d.latitude, d.longitude] as Position));
        }
      } catch {
      }
    }

    fetchHistory();
  }, []);

  return {timestamp, velocity, issPosition, pastPositions, error};
} 