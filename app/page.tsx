'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gift, Plane, ShoppingBag } from 'lucide-react';
import { CompanyForm } from '@/components/company-form';

export default function Home() {
  const [activeTab, setActiveTab] = useState('techcorp');
  const router = useRouter();

  const companies = {
    techcorp: {
      name: 'TechCorp Solutions',
      icon: Gift,
      description: 'Tech Rewards Program',
      color: 'text-blue-600',
      route: '/points/techcorp'
    },
    retailmax: {
      name: 'RetailMax Stores',
      icon: ShoppingBag,
      description: 'RetailMax Rewards Plus',
      color: 'text-emerald-600',
      route: '/points/retailmax'
    },
    skyhigh: {
      name: 'SkyHigh Airlines',
      icon: Plane,
      description: 'SkyHigh Miles Program',
      color: 'text-indigo-600',
      route: '/points/skyhigh'
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-white shadow-xl rounded-xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Loyalty Programs Portal
          </h1>
          <p className="text-gray-600">
            Access your rewards across different programs
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-8">
            {Object.keys(companies).map((key) => (
              <TabsTrigger key={key} value={key} className="text-sm">
                {companies[key].name}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(companies).map(([key, company]) => (
            <TabsContent key={key} value={key}>
              <div className="text-center mb-6">
                <div className="flex justify-center mb-4">
                  <company.icon className={`h-12 w-12 ${company.color}`} />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">
                  {company.name}
                </h2>
                <p className="text-sm text-gray-600">{company.description}</p>
              </div>

              <CompanyForm 
                company={key} 
                onSubmit={(data) => router.push(`${company.route}?${data}`)} 
              />
            </TabsContent>
          ))}
        </Tabs>
      </Card>
    </div>
  );
}