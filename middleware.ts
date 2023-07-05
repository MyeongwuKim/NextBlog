// middleware.ts
import { getToken } from "next-auth/jwt";
import { NextResponse, NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let token = await getToken({
    req: request,
    cookieName: process.env.NEXTAUTH_TOKENNAME,
    secret: process.env.NEXTAUTH_SECRET,
  });
  //토큰이 없다면 로그인이 되어있지 않으므로 "로그인이 필요한 기능"이라고 경고창 띄우고 리다이렉트
  console.log("middle");
  if (!token) {
    return NextResponse.redirect(new URL(process.env.NEXTAUTH_URL));
  }
}

export const config = {
  matcher: ["/setting/:path*", "/write/:path*"],
};
