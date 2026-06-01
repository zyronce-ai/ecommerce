'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!token) {
      const success = searchParams.get('success') === 'true';
      setStatus(success ? 'success' : 'error');
      if (!success) setErrorMsg('Missing verification token');
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/verify-email?token=${token}`)
      .then((r) => {
        if (r.redirected) {
          const url = new URL(r.url);
          if (url.searchParams.get('success') === 'true') {
            setStatus('success');
          } else {
            setStatus('error');
            setErrorMsg('Verification failed');
          }
          return;
        }
        return r.json().then((d) => { throw new Error(d.error || 'Verification failed'); });
      })
      .catch((err) => {
        setStatus('error');
        setErrorMsg(err.message);
      });
  }, [token, searchParams, router]);

  return (
    <Card className="w-full max-w-sm text-center">
      <CardHeader>
        {status === 'loading' ? (
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-2" />
        ) : status === 'success' ? (
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
        ) : (
          <XCircle className="h-12 w-12 text-destructive mx-auto mb-2" />
        )}
        <CardTitle>
          {status === 'loading' ? 'Verifying...' : status === 'success' ? 'Email Verified!' : 'Verification Failed'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {status === 'loading' ? 'Please wait...' : status === 'success' ? 'Your email has been verified. You can now log in.' : errorMsg || 'The verification link is invalid or expired. Please try signing up again.'}
        </p>
        {status !== 'loading' && (
          <Button asChild className="w-full"><Link href="/login">Go to Login</Link></Button>
        )}
      </CardContent>
    </Card>
  );
}

export default function VerifyPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Suspense fallback={<p className="text-muted-foreground">Loading...</p>}>
        <VerifyContent />
      </Suspense>
    </div>
  );
}
