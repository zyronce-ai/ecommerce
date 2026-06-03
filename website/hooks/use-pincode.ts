'use client';

import { useState, useCallback, useRef } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface PincodeResult {
  city: string;
  state: string;
  cities: string[];
}

export function usePincode() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PincodeResult | null>(null);
  const [error, setError] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const lookup = useCallback((code: string) => {
    if (timer.current) clearTimeout(timer.current);

    if (code.length !== 6) {
      setResult(null);
      setError('');
      return;
    }

    setLoading(true);
    setError('');

    timer.current = setTimeout(async () => {
      try {
        const res = await fetch(`${API}/api/pincode/${code}`);
        if (!res.ok) throw new Error('Pincode not found');
        const data = await res.json();
        setResult(data);
      } catch (err: any) {
        setError(err.message || 'Failed to lookup pincode');
        setResult(null);
      } finally {
        setLoading(false);
      }
    }, 500);
  }, []);

  return { lookup, loading, result, error };
}
