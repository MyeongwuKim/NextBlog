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
    if (e.message == "user") {
      console.log("userERROR");
      return NextResponse.rewrite(origin + "/404");
    }
  }
  if (secondParm) {
    //Post 권한 체크
    if (secondParm == "post") {
      try {
        let postId = request.nextUrl.searchParams.get("id");

        let req = await fetch(origin + `/api/post/check`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: postId }),
        });
        let { ok, data } = await req.json();

        const token = await getToken({
          req: request,
          cookieName: process.env.NEXTAUTH_TOKENNAME,
          secret: process.env.NEXTAUTH_SECRET,
        });

        let privatePost = false;
        if (data.isPrivate) {
          if (token) {
            let id = token.email.split("@")[0];
            //url에 들어있는 아이디와 토큰 아이디가 다르면(다른사람이면)
            privatePost = id != emailId;
          } else privatePost = true;
        }
        if (privatePost) {
          console.log("세컨드파람 : 권한없음");
          return NextResponse.rewrite(origin + "/404");
        }
      } catch {
        console.log("세컨드파람 에러!!");
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
        console.log("마지막 체크" + "토큰없음");
        return NextResponse.rewrite(origin + "/404");
      } else {
        if (token.email.split("@")[0] != emailId) {
          console.log("마지막 체크" + "이메일 아이디없음");
          return NextResponse.rewrite(origin + "/404");
        }
      }
    }
  }
}

export const config = {
  matcher: ["/((?!api|_next|fonts|examples|[\\w-]+\\.\\w+).*)"],
};
