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

    const { searchParams } = new URL(request.url);
    const selectedMonth = searchParams.get("month") ?? new Date().toISOString().slice(0, 7);

    const allTransactions = await db
      .select()
      .from(schema.transactions)
      .where(eq(schema.transactions.userId, user.id));

    const totalBalance = allTransactions.reduce((sum, t) => sum + Number(t.amount), 0);

    const monthTransactions = allTransactions.filter((t) => {
      const dateStr = String(t.date);
      return dateStr.slice(0, 7) === selectedMonth;
    });

    const incomeThisMonth = monthTransactions
      .filter((t) => Number(t.amount) > 0)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expensesThisMonth = monthTransactions
      .filter((t) => Number(t.amount) < 0)
      .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);

    return NextResponse.json({
      totalBalance,
      incomeThisMonth,
      expensesThisMonth,
      currency: user.nativeCurrency,
    });
  } catch (error) {
    console.error("[DASHBOARD_STATS] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
