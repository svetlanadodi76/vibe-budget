import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll() {},
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  let dbResult = null;
  let dbError = null;

  try {
    const count = await db.select().from(schema.transactions)
      .where(eq(schema.transactions.userId, user?.id ?? ""));
    dbResult = `${count.length} tranzactii`;
  } catch (e: unknown) {
    if (e instanceof Error) {
      dbError = e.message;
      const cause = (e as { cause?: unknown }).cause;
      if (cause instanceof Error) {
        dbError += " | CAUSE: " + cause.message;
      }
    } else {
      dbError = String(e);
    }
  }

  return NextResponse.json({
    userId: user?.id ?? null,
    dbResult,
    dbError,
    databaseUrl: process.env.DATABASE_URL?.replace(/:([^:@]+)@/, ":***@"),
  });
}
