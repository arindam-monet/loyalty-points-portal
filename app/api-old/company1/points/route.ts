import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { type NextRequest } from "next/server";

const API_KEY = process.env.API_KEY || "123456789";
const DB_NAME = "loyalty-program";
const COLLECTION_NAME = "loyalty-points";
const COMPANY_ID = "CompanyA";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!validateApiKey(request)) {
    return NextResponse.json(
      { message: "Forbidden: Invalid API key." },
      { status: 403 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
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

    return NextResponse.json({
      points: customer.points,
      tier: customer.tier,
      companyName: "TechCorp Solutions",
    });
  } catch (err) {
    console.error("Error fetching points:", err);
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

    const result = await db.collection(COLLECTION_NAME).updateOne(
      { companyId: COMPANY_ID, "customers.email": email },
      {
        $push: {
          "customers.$.points": { points, expiry: new Date(expiry) },
        } as any,
      }
    );

    return NextResponse.json({
      message: "Points updated successfully.",
      programName: "TechCorp Rewards",
    });
  } catch (err) {
    console.error("Error updating points:", err);
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
