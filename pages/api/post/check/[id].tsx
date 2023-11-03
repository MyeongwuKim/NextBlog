import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/server/client";
import { getToken } from "next-auth/jwt";
import ProtectHanlder from "@/lib/server/protectHanlder";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method == "GET") {
    try {
      const { id: postId } = req.query;
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

      let privateCheck = postData.isPrivate && !token ? true : false;

      if (privateCheck) {
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
  methods: ["GET"],
  isPrivate: false,
});
