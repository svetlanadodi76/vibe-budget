import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") ?? "current-month";

    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth(); // 0-based

    let fromDate: string;
    let toDate: string;

    if (period === "current-month") {
      fromDate = `${y}-${String(m + 1).padStart(2, "0")}-01`;
      const lastDay = new Date(y, m + 1, 0).getDate();
      toDate = `${y}-${String(m + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    } else if (period === "prev-month") {
      const prev = new Date(y, m - 1, 1);
      const py = prev.getFullYear();
      const pm = prev.getMonth();
      fromDate = `${py}-${String(pm + 1).padStart(2, "0")}-01`;
      const lastDay = new Date(py, pm + 1, 0).getDate();
      toDate = `${py}-${String(pm + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    } else if (period === "3-months") {
      const from = new Date(y, m - 2, 1);
      fromDate = `${from.getFullYear()}-${String(from.getMonth() + 1).padStart(2, "0")}-01`;
      const lastDay = new Date(y, m + 1, 0).getDate();
      toDate = `${y}-${String(m + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    } else if (period === "6-months") {
      const from = new Date(y, m - 5, 1);
      fromDate = `${from.getFullYear()}-${String(from.getMonth() + 1).padStart(2, "0")}-01`;
      const lastDay = new Date(y, m + 1, 0).getDate();
      toDate = `${y}-${String(m + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    } else {
      fromDate = "2000-01-01";
      toDate = "2099-12-31";
    }

    const rows = await db
      .select({
        date: schema.transactions.date,
        amount: schema.transactions.amount,
        categoryId: schema.transactions.categoryId,
        categoryName: schema.categories.name,
        categoryColor: schema.categories.color,
        categoryIcon: schema.categories.icon,
      })
      .from(schema.transactions)
      .leftJoin(schema.categories, eq(schema.transactions.categoryId, schema.categories.id))
      .where(
        and(
          eq(schema.transactions.userId, user.id),
          gte(schema.transactions.date, fromDate),
          lte(schema.transactions.date, toDate)
        )
      );

    // Pie chart: cheltuieli pe categorii
    const expenseRows = rows.filter((r) => Number(r.amount) < 0);
    const categoryMap: Record<string, { name: string; color: string; icon: string; total: number }> = {};

    for (const row of expenseRows) {
      const key = row.categoryId ?? "__necategorizat__";
      const name = row.categoryName ?? "Necategorizat";
      const color = row.categoryColor ?? "#94a3b8";
      const icon = row.categoryIcon ?? "❓";
      if (!categoryMap[key]) categoryMap[key] = { name, color, icon, total: 0 };
      categoryMap[key].total += Math.abs(Number(row.amount));
    }

    const pieData = Object.values(categoryMap)
      .sort((a, b) => b.total - a.total)
      .map((c) => ({
        name: `${c.icon} ${c.name}`,
        value: Math.round(c.total * 100) / 100,
        color: c.color,
      }));

    // Bar chart: cheltuieli pe luni
    const monthMap: Record<string, { income: number; expenses: number }> = {};

    for (const row of rows) {
      const month = String(row.date).slice(0, 7);
      if (!monthMap[month]) monthMap[month] = { income: 0, expenses: 0 };
      const amount = Number(row.amount);
      if (amount > 0) monthMap[month].income += amount;
      else monthMap[month].expenses += Math.abs(amount);
    }

    const barData = Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => {
        const [year, m] = month.split("-");
        const label = new Date(Number(year), Number(m) - 1, 1)
          .toLocaleString("ro-RO", { month: "short", year: "2-digit" });
        return {
          month: label,
          Venituri: Math.round(data.income * 100) / 100,
          Cheltuieli: Math.round(data.expenses * 100) / 100,
        };
      });

    return NextResponse.json({ pieData, barData });
  } catch (error) {
    console.error("[REPORTS_GET] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
