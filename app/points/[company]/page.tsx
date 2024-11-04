"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut, Gift, Plane, ShoppingBag } from "lucide-react";
import { PointsDisplay } from "@/components/points-display";
import { PointsHistory } from "@/components/points-history";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://mongodb-typescript-api.onrender.com';

const companyConfigs = {
  techcorp: {
    name: "TechCorp Solutions",
    icon: Gift,
    color: "text-blue-600",
    apiPath: `${API_BASE_URL}/Company1/api/point_details`,
    pointsLabel: "Points",
  },
  retailmax: {
    name: "RetailMax Stores",
    icon: ShoppingBag,
    color: "text-emerald-600",
    apiPath: "/api/company2/rewards",
    pointsLabel: "Rewards",
  },
  skyhigh: {
    name: "SkyHigh Airlines",
    icon: Plane,
    color: "text-indigo-600",
    apiPath: "/api/company3/miles",
    pointsLabel: "Miles",
  },
};

export default function PointsPage({
  params,
}: {
  params: { company: string };
}) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();

  const company = companyConfigs[params.company as keyof typeof companyConfigs];

  if (!company) {
    router.push("/");
    return null;
  }

  const Icon = company.icon;

  useEffect(() => {
    const fetchPoints = async () => {
      try {
        const queryString = searchParams.toString();
        const response = await fetch(`${company.apiPath}?${queryString}`, {
          headers: {
            "Content-Type": "application/json",
            "API-KEY": process.env.API_KEY || "123456789",
          },
        });
        const data = await response.json();
        setData(data);
      } catch (error) {
        console.error("Failed to fetch points:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPoints();
  }, [searchParams, company.apiPath]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="animate-pulse text-lg text-blue-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <Icon className={`h-8 w-8 ${company.color}`} />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {company.name}
              </h1>
              <p className="text-gray-600">{searchParams.get("email")}</p>
            </div>
          </div>
          <Button variant="ghost" onClick={() => router.push("/")}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        <PointsDisplay
          data={data}
          company={params.company as "techcorp" | "retailmax" | "skyhigh"}
          pointsLabel={company.pointsLabel}
        />

        <PointsHistory
          points={data?.points || []}
          company={params.company}
          pointsLabel={company.pointsLabel}
        />
      </div>
    </div>
  );
}
