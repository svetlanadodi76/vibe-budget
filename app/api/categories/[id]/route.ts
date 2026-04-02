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
    const { name, color, icon } = await request.json();

    const [category] = await db
      .update(schema.categories)
      .set({ name, color, icon, updatedAt: new Date() })
      .where(and(eq(schema.categories.id, id), eq(schema.categories.userId, user.id)))
      .returning();

    if (!category) {
      return NextResponse.json({ error: "Categoria nu a fost găsită" }, { status: 404 });
    }

    return NextResponse.json({ category });
  } catch (error) {
    console.error("[CATEGORIES_PATCH] Error:", error);
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

    const [category] = await db
      .delete(schema.categories)
      .where(and(eq(schema.categories.id, id), eq(schema.categories.userId, user.id)))
      .returning();

    if (!category) {
      return NextResponse.json({ error: "Categoria nu a fost găsită" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CATEGORIES_DELETE] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
