import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { type NextRequest } from "next/server";

const API_KEY = process.env.API_KEY || "123456789";
const DB_NAME = "loyalty-program";
const COLLECTION_NAME = "loyalty-points";
const COMPANY_ID = "CompanyC";

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
  const frequentFlyerNumber = searchParams.get("ffn");

  if (!email || !frequentFlyerNumber) {
    return NextResponse.json(
      { message: "Email and Frequent Flyer Number are required." },
      { status: 400 }
    );
  }

  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const companyDoc = await db.collection(COLLECTION_NAME).findOne({
      companyId: COMPANY_ID,
      "customers.frequentFlyerNumber": frequentFlyerNumber,
    });

    if (!companyDoc) {
      return NextResponse.json(
        { message: "Frequent flyer not found." },
        { status: 404 }
      );
    }

    const customer = companyDoc.customers.find(
      (customer: any) =>
        customer.email === email &&
        customer.frequentFlyerNumber === frequentFlyerNumber
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
      frequentFlyerNumber: customer.frequentFlyerNumber,
      companyName: "SkyHigh Airlines",
      tierBenefits: customer.tierBenefits,
    });
  } catch (err) {
    console.error("Error fetching miles:", err);
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
  const frequentFlyerNumber = searchParams.get("ffn");
  const body = await request.json();
  const { miles, expiry, flightNumber, routeCode } = body;

  if (
    !email ||
    !frequentFlyerNumber ||
    miles === undefined ||
    !expiry ||
    !flightNumber ||
    !routeCode
  ) {
    return NextResponse.json(
      {
        message:
          "Email, FFN, miles, expiry, flight number, and route code are required.",
      },
      { status: 400 }
    );
  }

  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const result = await db.collection(COLLECTION_NAME).updateOne(
      {
        companyId: COMPANY_ID,
        "customers.frequentFlyerNumber": frequentFlyerNumber,
        "customers.email": email,
      },
      {
        $push: {
          "customers.$.points": {
            points: miles,
            expiry: new Date(expiry),
            flightNumber,
            routeCode,
          },
        } as any,
      }
    );

    return NextResponse.json({
      message: "Miles updated successfully.",
      programName: "SkyHigh Miles",
    });
  } catch (err) {
    console.error("Error updating miles:", err);
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
