import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");

    const conditions = [eq(schema.userKeywords.userId, user.id)];
    if (categoryId) conditions.push(eq(schema.userKeywords.categoryId, categoryId));

    const keywords = await db
      .select()
      .from(schema.userKeywords)
      .where(and(...conditions));

    return NextResponse.json({ keywords });
  } catch (error) {
    console.error("[KEYWORDS_GET] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { keyword, categoryId } = await request.json();

    if (!keyword || !categoryId) {
      return NextResponse.json({ error: "Keyword și categoryId sunt obligatorii" }, { status: 400 });
    }

    const [created] = await db
      .insert(schema.userKeywords)
      .values({
        userId: user.id,
        keyword: keyword.trim().toLowerCase(),
        categoryId,
      })
      .returning();

    return NextResponse.json({ keyword: created });
  } catch (error) {
    console.error("[KEYWORDS_POST] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
