import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";

export async function POST(request: NextRequest) {
  try {
    const { id, email, name, nativeCurrency } = await request.json();

    if (!id || !email || !name) {
      return NextResponse.json(
        { error: "Câmpurile id, email și name sunt obligatorii" },
        { status: 400 }
      );
    }

    await db.insert(schema.users).values({
      id,
      email,
      name,
      nativeCurrency: nativeCurrency ?? "RON",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[AUTH_REGISTER] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
