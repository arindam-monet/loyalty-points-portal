'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface CompanyFormProps {
  company: string;
  onSubmit: (queryString: string) => void;
}

export function CompanyForm({ company, onSubmit }: CompanyFormProps) {
  const [email, setEmail] = useState('');
  const [memberId, setMemberId] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    let queryString = `email=${encodeURIComponent(email)}`;

    if (company === 'retailmax') {
      if (!memberId) {
        setError('Please enter your membership ID');
        return;
      }
      queryString += `&membershipId=${encodeURIComponent(memberId)}`;
    }

    if (company === 'skyhigh') {
      if (!memberId) {
        setError('Please enter your Frequent Flyer Number');
        return;
      }
      queryString += `&ffn=${encodeURIComponent(memberId)}`;
    }

    onSubmit(queryString);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {(company === 'retailmax' || company === 'skyhigh') && (
        <div className="space-y-2">
          <Label htmlFor="memberId">
            {company === 'retailmax' ? 'Membership ID' : 'Frequent Flyer Number'}
          </Label>
          <Input
            id="memberId"
            type="text"
            placeholder={company === 'retailmax' ? 'Enter membership ID' : 'Enter FFN'}
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
          />
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}

      <Button type="submit" className="w-full">
        Check {company === 'skyhigh' ? 'Miles' : 'Points'}
      </Button>
    </form>
  );
}