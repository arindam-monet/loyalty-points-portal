"use client";

import { Card } from "@/components/ui/card";
import { Gift, Plane, ShoppingBag } from "lucide-react";

const icons = {
  techcorp: Gift,
  retailmax: ShoppingBag,
  skyhigh: Plane,
  healthplus: Gift,
};

interface PointsDisplayProps {
  points: number;
  company: "techcorp" | "retailmax" | "skyhigh" | "healthplus";
  pointsLabel: string;
}

export function PointsDisplay({
  points,
  company,
  pointsLabel,
}: PointsDisplayProps) {
  const Icon = icons[company];

  // const calculateTotal = () => {
  //   if (!data?.points) return 0;
  //   return data.points.reduce((total: number, entry: any) => {
  //     const expiryDate = new Date(entry.expiry);
  //     const currentDate = new Date();
  //     if (expiryDate > currentDate) {
  //       return total + entry.points;
  //     }
  //     return total;
  //   }, 0);
  // };

  return (
    <Card className="bg-white shadow-xl rounded-xl p-6 mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Icon className="h-12 w-12 text-blue-600 mr-4" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{points ?? 0}</h2>
            <p className="text-gray-600">Total Active {pointsLabel}</p>
          </div>
        </div>
        {/* {data?.tier && (
          <div className="bg-blue-50 px-4 py-2 rounded-full">
            <p className="text-blue-700 font-medium">{data.tier}</p>
          </div>
        )} */}
      </div>
    </Card>
  );
}
