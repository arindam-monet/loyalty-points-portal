'use client';

import { Card } from '@/components/ui/card';

interface PointsHistoryProps {
  points: Array<{
    points: number;
    expiry: string;
    transactionId?: string;
    flightNumber?: string;
    routeCode?: string;
  }>;
  company: string;
  pointsLabel: string;
}

export function PointsHistory({ points, company, pointsLabel }: PointsHistoryProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        {pointsLabel} History
      </h3>
      
      {points.map((entry, index) => (
        <Card key={index} className="p-4 transition-all hover:shadow-md">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-lg font-semibold text-gray-900">
                {entry.points > 0 ? '+' : ''}{entry.points.toLocaleString()} {pointsLabel}
              </p>
              <p className="text-sm text-gray-600">
                Expires: {new Date(entry.expiry).toLocaleDateString()}
              </p>
              {company === 'retailmax' && entry.transactionId && (
                <p className="text-xs text-gray-500">
                  Transaction: {entry.transactionId}
                </p>
              )}
              {company === 'skyhigh' && (
                <p className="text-xs text-gray-500">
                  Flight: {entry.flightNumber} • Route: {entry.routeCode}
                </p>
              )}
            </div>
            <div className={`px-3 py-1 rounded-full ${
              new Date(entry.expiry) > new Date()
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {new Date(entry.expiry) > new Date() ? 'Active' : 'Expired'}
            </div>
          </div>
        </Card>
      ))}
      
      {points.length === 0 && (
        <Card className="p-6 text-center text-gray-600">
          No {pointsLabel.toLowerCase()} history available
        </Card>
      )}
    </div>
  );
}