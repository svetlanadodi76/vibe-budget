import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { analyzeFinances, CoachInput } from "@/lib/ai/coach";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json() as CoachInput;

    if (!body.categories || !body.months) {
      return NextResponse.json({ error: "Date incomplete" }, { status: 400 });
    }

    const result = await analyzeFinances(body);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[AI_COACH] Error:", error);
    return NextResponse.json(
      { error: "Eroare la analiza AI" },
      { status: 500 }
    );
  }
}
