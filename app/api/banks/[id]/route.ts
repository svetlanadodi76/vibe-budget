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
    const { name, color } = await request.json();

    const [bank] = await db
      .update(schema.banks)
      .set({ name, color, updatedAt: new Date() })
      .where(and(eq(schema.banks.id, id), eq(schema.banks.userId, user.id)))
      .returning();

    if (!bank) {
      return NextResponse.json({ error: "Banca nu a fost găsită" }, { status: 404 });
    }

    return NextResponse.json({ bank });
  } catch (error) {
    console.error("[BANKS_PATCH] Error:", error);
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

    const [bank] = await db
      .delete(schema.banks)
      .where(and(eq(schema.banks.id, id), eq(schema.banks.userId, user.id)))
      .returning();

    if (!bank) {
      return NextResponse.json({ error: "Banca nu a fost găsită" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[BANKS_DELETE] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
