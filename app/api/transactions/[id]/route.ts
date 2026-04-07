import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { date, description, amount, currency, bankId, categoryId } = await request.json();

    const [transaction] = await db
      .update(schema.transactions)
      .set({
        date,
        description,
        amount,
        currency,
        bankId: bankId || null,
        categoryId: categoryId || null,
      })
      .where(and(eq(schema.transactions.id, id), eq(schema.transactions.userId, user.id)))
      .returning();

    if (!transaction) {
      return NextResponse.json({ error: "Tranzacția nu a fost găsită" }, { status: 404 });
    }

    return NextResponse.json({ transaction });
  } catch (error) {
    console.error("[TRANSACTIONS_PATCH] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const [transaction] = await db
      .delete(schema.transactions)
      .where(and(eq(schema.transactions.id, id), eq(schema.transactions.userId, user.id)))
      .returning();

    if (!transaction) {
      return NextResponse.json({ error: "Tranzacția nu a fost găsită" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[TRANSACTIONS_DELETE] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
