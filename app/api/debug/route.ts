import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const allCookies = request.cookies.getAll();
  const cookieNames = allCookies.map((c) => c.name);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {},
      },
    }
  );

  const { data: { user }, error } = await supabase.auth.getUser();

  return NextResponse.json({
    cookieCount: allCookies.length,
    cookieNames,
    userId: user?.id ?? null,
    userEmail: user?.email ?? null,
    authError: error?.message ?? null,
  });
}
