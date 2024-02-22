import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/server/client";
import { getToken } from "next-auth/jwt";
import ProtectHanlder from "@/lib/server/protectHanlder";

//해당 포스트가 있는지, 비밀포스트인지 체크 권한이 없으면 에러
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method == "POST") {
    try {
      const { id: postId } = req.query;
      const { emailId } = JSON.parse(req.body);
      console.log("post Check OK!!");
      const token = await getToken({
        req,
        cookieName: process.env.NEXTAUTH_TOKENNAME,
        secret: process.env.NEXTAUTH_SECRET,
      });
      const postData = await prisma.post.findUnique({
        where: {
          id: Number(postId),
        },
        select: {
          isPrivate: true,
        },
      });
      let privatePost = false;

      if (postData.isPrivate && token) {
        let id = token.email.split("@")[0];
        privatePost = id != emailId;
      }

      if (privatePost) {
        res.json({
          ok: false,
          error: "접근권한이 없습니다.",
        });
      } else {
        res.json({
          ok: true,
        });
      }
    } catch {
      res.json({
        ok: false,
        error: "포스트 조회중 오류가 발생하였습니다.",
      });
    }
  }
};

export default ProtectHanlder({
  handler,
  methods: ["POST"],
  isPrivate: false,
});
