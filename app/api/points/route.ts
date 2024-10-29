import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { type NextRequest } from "next/server";

const API_KEY = process.env.API_KEY || "123456789";
const DB_NAME = "loyalty-program";
const COLLECTION_NAME = "loyalty-points";

// Middleware to validate API key
const validateApiKey = (request: Request) => {
  const apiKey = request.headers.get("API-KEY");
  if (!apiKey || apiKey !== API_KEY) {
    return false;
  }
  return true;
};

export async function GET(request: NextRequest) {
  if (!validateApiKey(request)) {
    return NextResponse.json(
      { message: "Forbidden: Invalid API key." },
      { status: 403 }
    );
  }

  const searchParams = request.nextUrl.searchParams;

  const companyId = searchParams.get("companyId");
  const email = searchParams.get("email");

  console.log(companyId, email);

  if (!companyId || !email) {
    return NextResponse.json(
      { message: "Company ID and email query parameters are required." },
      { status: 400 }
    );
  }

  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const companyDoc = await db
      .collection(COLLECTION_NAME)
      .findOne({ companyId });
    if (!companyDoc) {
      return NextResponse.json(
        { message: "Company not found." },
        { status: 404 }
      );
    }

    const customer = companyDoc.customers.find(
      (customer: any) => customer.email === email
    );
    if (!customer) {
      return NextResponse.json(
        { message: "Customer not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(customer.points);
  } catch (err) {
    console.error("Error fetching loyalty points:", err);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  if (!validateApiKey(request)) {
    return NextResponse.json(
      { message: "Forbidden: Invalid API key." },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const email = searchParams.get("email");

  const body = await request.json();
  const { points, expiry } = body;

  if (!companyId || !email || points === undefined || !expiry) {
    return NextResponse.json(
      { message: "Company ID, email, points, and expiry are required." },
      { status: 400 }
    );
  }

  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const companyDoc = await db
      .collection(COLLECTION_NAME)
      .findOne({ companyId });
    if (!companyDoc) {
      return NextResponse.json(
        { message: "Company not found." },
        { status: 404 }
      );
    }

    const customer = companyDoc.customers.find(
      (customer: any) => customer.email === email
    );
    if (!customer) {
      return NextResponse.json(
        { message: "Customer not found." },
        { status: 404 }
      );
    }

    // Calculate the current total points
    const currentPoints = customer.points.reduce(
      (total: number, entry: any) => {
        const expiryDate = new Date(entry.expiry);
        const currentDate = new Date();
        if (expiryDate > currentDate) {
          return total + entry.points;
        }
        return total;
      },
      0
    );

    // Check if the new total would be negative
    if (currentPoints + points < 0) {
      return NextResponse.json(
        { message: "Total points cannot be negative." },
        { status: 400 }
      );
    }

    // Update the customer's points
    const updateResult = await db.collection(COLLECTION_NAME).updateOne(
      { companyId, "customers.email": email },
      {
        $push: {
          "customers.$.points": { points, expiry: new Date(expiry) },
        } as any,
      }
    );

    return NextResponse.json({
      message: "Loyalty points updated successfully.",
    });
  } catch (err) {
    console.error("Error updating loyalty points:", err);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
