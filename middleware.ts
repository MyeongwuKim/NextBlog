import { getToken } from "next-auth/jwt";
import { NextResponse, NextRequest } from "next/server";
import path from "path";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    cookieName: process.env.NEXTAUTH_TOKENNAME,
    secret: process.env.NEXTAUTH_SECRET,
  });
  const { pathname, origin, href } = request.nextUrl;

  if (!pathname.includes("manage") && pathname.includes("post")) {
    try {
      let postId = pathname.replace(/[^0-9]/g, "");
      let req = await fetch(`${origin}/api/post/${postId}`, { method: "GET" });
      let {
        data: {
          postData: { isPrivate, title, createdAt },
        },
      } = await req.json();
      let privateCheck = isPrivate && !token ? true : false;
      if (privateCheck) {
        return NextResponse.rewrite(origin + "/ErrorPage?cause=auth");
      } else {
        return NextResponse.rewrite(
          new URL(pathname + `?title=${title}&createdAt=${createdAt}`, href)
        );
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
  matcher: ["/manage/:path*", "/write/:path*", "/post/:path*"],
};
