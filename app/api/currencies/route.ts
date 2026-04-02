import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currencies = await db
      .select()
      .from(schema.currencies)
      .where(eq(schema.currencies.userId, user.id))
      .orderBy(schema.currencies.createdAt);

    return NextResponse.json({ currencies });
  } catch (error) {
    console.error("[CURRENCIES_GET] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code, name, symbol } = await request.json();

    if (!code || !name) {
      return NextResponse.json({ error: "Codul și numele sunt obligatorii" }, { status: 400 });
    }

    const [currency] = await db
      .insert(schema.currencies)
      .values({ userId: user.id, code: code.toUpperCase(), name, symbol: symbol ?? "" })
      .returning();

    return NextResponse.json({ currency });
  } catch (error) {
    console.error("[CURRENCIES_POST] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
