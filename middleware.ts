import { getToken } from "next-auth/jwt";
import { NextResponse, NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname, origin, href } = request.nextUrl;

  const [route, emailId, secondParm] = request.nextUrl.pathname.split("/");
  if (
    pathname.startsWith("/signin") ||
    pathname.startsWith("/signup") ||
    !emailId
  )
    return;
  //계정 url 유효성 검사
  try {
    const response = await fetch(origin + "/api/account/check", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: emailId }),
    });
    let userCheck = await response.json();
    if (!userCheck.ok) throw new Error("user");
  } catch (e) {
    if (e.message == "user") return NextResponse.rewrite(origin + "/404");
  }
  if (secondParm) {
    //Post 권한 체크
    if (secondParm == "post") {
      try {
        let postId = request.nextUrl.searchParams.get("id");

        let req = await fetch(`${origin}/api/post/check/${postId}`, {
          method: "POST",
          headers: request.headers,
          body: JSON.stringify({ emailId: emailId }),
        });
        let { error, ok } = await req.json();
        if (!ok) {
          return NextResponse.rewrite(origin + "/404");
        }
      } catch {
        return NextResponse.rewrite(origin + "/404");
      }
    } else if (secondParm == "search") {
    } else {
      //manage,write 권한 체크
      const token = await getToken({
        req: request,
        cookieName: process.env.NEXTAUTH_TOKENNAME,
        secret: process.env.NEXTAUTH_SECRET,
      });
      if (!token) {
        return NextResponse.rewrite(origin + "/404");
      } else {
        if (token.email.split("@")[0] != emailId) {
          return NextResponse.rewrite(origin + "/404");
        }
      }
    }
  }
}

export const config = {
  matcher: ["/((?!api|_next|fonts|examples|[\\w-]+\\.\\w+).*)"],
};
