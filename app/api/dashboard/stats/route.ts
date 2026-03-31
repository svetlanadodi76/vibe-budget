import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    // 1. Autentificare
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Luna curentă (format: "2026-03")
    const thisMonth = new Date().toISOString().slice(0, 7);

    // 3. Toate tranzacțiile userului
    const transactions = await db
      .select()
      .from(schema.transactions)
      .where(eq(schema.transactions.userId, user.id));

    // 4. Calcule
    const totalBalance = transactions.reduce((sum, t) => sum + Number(t.amount), 0);

    const thisMonthTransactions = transactions.filter((t) =>
      t.date.startsWith(thisMonth)
    );

    const incomeThisMonth = thisMonthTransactions
      .filter((t) => Number(t.amount) > 0)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expensesThisMonth = thisMonthTransactions
      .filter((t) => Number(t.amount) < 0)
      .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);

    // 5. Răspuns
    return NextResponse.json({
      totalBalance,
      incomeThisMonth,
      expensesThisMonth,
      currency: user.nativeCurrency,
    });
  } catch (error) {
    console.error("[DASHBOARD_STATS] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
