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

      let privateFilter = !token ? { isPrivate: true } : { isPrivate: null };

      const getBackForthData = async (orderBy) => {
        let data = await prisma.post.findMany({
          where: {
            NOT: privateFilter,
          },
          cursor: {
            id: Number(postId),
          },
          skip: 1,
          take: 1,
          select: {
            title: true,
            id: true,
          },
          orderBy: {
            createdAt: orderBy,
          },
        });

        return data.length > 0 ? data[0] : null;
      };

      let backForthPostsData = {
        prev: await getBackForthData("desc"),
        next: await getBackForthData("asc"),
      };

      res.json({
        ok: true,
        backForthPostsData,
      });
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
