import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: req });

  const sb = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (list) => {
          list.forEach(({ name, value }) => req.cookies.set(name, value));
          res = NextResponse.next({ request: req });
          list.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data } = await sb.auth.getUser();
  const path = req.nextUrl.pathname;
  const isLogin = path.startsWith("/login");

  if (!data.user && !isLogin) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  // allowlist: user login tapi bukan pasangan → keluar
  if (data.user && !isLogin) {
    const { data: ok } = await sb
      .from("allowed_users")
      .select("email")
      .eq("email", data.user.email);
    if (!ok || ok.length === 0) {
      await sb.auth.signOut();
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("e", "not-allowed");
      return NextResponse.redirect(url);
    }
  }
  if (data.user && isLogin) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|svg|ico)).*)"],
};
