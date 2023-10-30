// middleware.ts
import { getToken } from "next-auth/jwt";
import { NextResponse, NextRequest } from "next/server";
import prisma from "./lib/server/client";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    cookieName: process.env.NEXTAUTH_TOKENNAME,
    secret: process.env.NEXTAUTH_SECRET,
  });
  const { pathname, origin } = request.nextUrl;

  if (pathname.includes("post")) {
    try {
      let postId = pathname.replace(/[^0-9]/g, "");
      console.log(`${origin}/api/post/${postId}`);
      let req = await fetch(`${origin}/api/post/${postId}`, { method: "GET" });
      let {
        data: { isPrivate },
      } = await req.json();
      let privateCheck = isPrivate && !token ? true : false;
      if (privateCheck) {
        return NextResponse.rewrite(origin + "/ErrorPage?cause=auth");
      }
    } catch {
      return NextResponse.rewrite(origin + "/ErrorPage");
    }
  } else if (!token) {
    //토큰이 없다면 로그인이 되어있지 않으므로 "로그인이 필요한 기능"이라고 경고창 띄우고 리다이렉트
    return NextResponse.rewrite(origin + "/ErrorPage?cause=auth");
  }
}

export const config = {
  matcher: ["/manage/:path*", "/write/:path*", "/test/:path*"],
};
