import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and, gte, lte, ilike, SQL } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const bankId = searchParams.get("bankId");
    const categoryId = searchParams.get("categoryId");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const search = searchParams.get("search");

    const conditions: SQL[] = [eq(schema.transactions.userId, user.id)];

    if (bankId) conditions.push(eq(schema.transactions.bankId, bankId));
    if (categoryId) conditions.push(eq(schema.transactions.categoryId, categoryId));
    if (from) conditions.push(gte(schema.transactions.date, from));
    if (to) conditions.push(lte(schema.transactions.date, to));
    if (search) conditions.push(ilike(schema.transactions.description, `%${search}%`));

    const rows = await db
      .select({
        id: schema.transactions.id,
        date: schema.transactions.date,
        description: schema.transactions.description,
        amount: schema.transactions.amount,
        currency: schema.transactions.currency,
        bankId: schema.transactions.bankId,
        categoryId: schema.transactions.categoryId,
        bankName: schema.banks.name,
        bankColor: schema.banks.color,
        categoryName: schema.categories.name,
        categoryIcon: schema.categories.icon,
      })
      .from(schema.transactions)
      .leftJoin(schema.banks, eq(schema.transactions.bankId, schema.banks.id))
      .leftJoin(schema.categories, eq(schema.transactions.categoryId, schema.categories.id))
      .where(and(...conditions))
      .orderBy(schema.transactions.date);

    // Inversăm ordinea pentru descrescător (Drizzle desc pe date string)
    const transactions = rows.reverse();

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error("[TRANSACTIONS_GET] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { date, description, amount, currency, bankId, categoryId } = await request.json();

    if (!date || !description || amount === undefined) {
      return NextResponse.json({ error: "Data, descrierea și suma sunt obligatorii" }, { status: 400 });
    }

    const [transaction] = await db
      .insert(schema.transactions)
      .values({
        userId: user.id,
        date,
        description,
        amount,
        currency: currency ?? "MDL",
        bankId: bankId || null,
        categoryId: categoryId || null,
      })
      .returning();

    return NextResponse.json({ transaction });
  } catch (error) {
    console.error("[TRANSACTIONS_POST] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
