import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

const API_KEY = process.env.API_KEY || "123456789";
const DB_NAME = "loyalty-program";
const COLLECTION_NAME = "loyalty-points";
const COMPANY_ID = "company3"; // Specific to this scores program

export async function GET(request: Request) {
  if (!validateApiKey(request)) {
    return NextResponse.json(
      { message: "Forbidden: Invalid API key." },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json(
      { message: "Email parameter is required." },
      { status: 400 }
    );
  }

  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const companyDoc = await db
      .collection(COLLECTION_NAME)
      .findOne({ companyId: COMPANY_ID });
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
    console.error("Error fetching loyalty scores:", err);
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
  const email = searchParams.get("email");
  const body = await request.json();
  const { points, expiry } = body;

  if (!email || points === undefined || !expiry) {
    return NextResponse.json(
      { message: "Email, points, and expiry are required." },
      { status: 400 }
    );
  }

  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const companyDoc = await db
      .collection(COLLECTION_NAME)
      .findOne({ companyId: COMPANY_ID });
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

    if (currentPoints + points < 0) {
      return NextResponse.json(
        { message: "Total points cannot be negative." },
        { status: 400 }
      );
    }

    await db.collection(COLLECTION_NAME).updateOne(
      { companyId: COMPANY_ID, "customers.email": email },
      {
        $push: {
          "customers.$.points": { points, expiry: new Date(expiry) },
        } as any,
      }
    );

    return NextResponse.json({
      message: "Loyalty scores updated successfully.",
    });
  } catch (err) {
    console.error("Error updating loyalty scores:", err);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}

function validateApiKey(request: Request) {
  const apiKey = request.headers.get("API-KEY");
  return apiKey === API_KEY;
}
