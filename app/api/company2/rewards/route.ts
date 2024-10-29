import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { type NextRequest } from "next/server";

const API_KEY = process.env.API_KEY || "123456789";
const DB_NAME = "loyalty-program";
const COLLECTION_NAME = "loyalty-points";
const COMPANY_ID = "CompanyB";

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
  const membershipId = searchParams.get("membershipId");

  if (!email || !membershipId) {
    return NextResponse.json(
      { message: "Email and membership ID are required." },
      { status: 400 }
    );
  }

  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const companyDoc = await db.collection(COLLECTION_NAME).findOne({
      companyId: COMPANY_ID,
      "customers.membershipId": membershipId,
    });

    if (!companyDoc) {
      return NextResponse.json(
        { message: "Membership not found." },
        { status: 404 }
      );
    }

    const customer = companyDoc.customers.find(
      (customer: any) =>
        customer.email === email && customer.membershipId === membershipId
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
      membershipId: customer.membershipId,
      companyName: "RetailMax Stores",
    });
  } catch (err) {
    console.error("Error fetching rewards:", err);
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
  const membershipId = searchParams.get("membershipId");
  const body = await request.json();
  const { points, expiry, transactionId } = body;

  if (
    !email ||
    !membershipId ||
    points === undefined ||
    !expiry ||
    !transactionId
  ) {
    return NextResponse.json(
      {
        message:
          "Email, membership ID, points, transaction ID, and expiry are required.",
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
        "customers.membershipId": membershipId,
        "customers.email": email,
      },
      {
        $push: {
          "customers.$.points": {
            points,
            expiry: new Date(expiry),
            transactionId,
          },
        } as any,
      }
    );

    return NextResponse.json({
      message: "Rewards updated successfully.",
      programName: "RetailMax Rewards Plus",
    });
  } catch (err) {
    console.error("Error updating rewards:", err);
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
