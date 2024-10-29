'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Gift } from 'lucide-react';

export default function Home() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    router.push(`/points?email=${encodeURIComponent(email)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-white shadow-xl rounded-xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Gift className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Loyalty Points Portal
          </h1>
          <p className="text-gray-600">
            Sign in to check your loyalty points balance
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
            />
            {error && (
              <p className="text-sm text-red-600 mt-1">{error}</p>
            )}
          </div>

          <Button type="submit" className="w-full">
            Check Points
          </Button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Enter your registered email to view your points balance and history
        </p>
      </Card>
    </div>
  );
}