"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, Gift } from "lucide-react";

interface PointEntry {
  points: number;
  expiry: string;
}

export default function PointsPage() {
  const [points, setPoints] = useState<PointEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email");

  useEffect(() => {
    if (!email) {
      router.push("/");
      return;
    }

    const fetchPoints = async () => {
      try {
        const response = await fetch(
          `/api/points?email=${encodeURIComponent(
            email
          )}&companyId=${encodeURIComponent("CompanyA")}`,
          {
            headers: {
              "Content-Type": "application/json",
              "API-KEY": process.env.API_KEY || "123456789",
            },
          }
        );
        const data = await response.json();
        console.log("Fetched points:", data);
        setPoints(data);
      } catch (error) {
        console.error("Failed to fetch points:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPoints();
  }, [email, router]);

  const handleLogout = () => {
    router.push("/");
  };

  const calculateTotalPoints = () => {
    if (!Array.isArray(points)) {
      return 0;
    }
    return points.reduce((total, entry) => {
      const expiryDate = new Date(entry.expiry);
      const currentDate = new Date();
      if (expiryDate > currentDate) {
        return total + entry.points;
      }
      return total;
    }, 0);
  };

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
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Loyalty Points</h1>
            <p className="text-gray-600 mt-1">{email}</p>
          </div>
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        <Card className="bg-white shadow-xl rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Gift className="h-12 w-12 text-blue-600 mr-4" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {calculateTotalPoints()}
                </h2>
                <p className="text-gray-600">Total Active Points</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Points History
          </h3>
          {points != null &&
            Array.isArray(points) &&
            points.map((entry, index) => (
              <Card key={index} className="p-4 transition-all hover:shadow-md">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-lg font-semibold text-gray-900">
                      {entry.points > 0 ? "+" : ""}
                      {entry.points} points
                    </p>
                    <p className="text-sm text-gray-600">
                      Expires: {new Date(entry.expiry).toLocaleDateString()}
                    </p>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full ${
                      new Date(entry.expiry) > new Date()
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {new Date(entry.expiry) > new Date() ? "Active" : "Expired"}
                  </div>
                </div>
              </Card>
            ))}

          {points.length === 0 && (
            <Card className="p-6 text-center text-gray-600">
              No points history available
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
