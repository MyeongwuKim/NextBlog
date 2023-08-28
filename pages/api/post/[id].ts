import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/server/client";
import { getToken } from "next-auth/jwt";
import ProtectHanlder from "@/lib/server/protectHanlder";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method == "GET") {
    try {
      const postData = await prisma.post.findUnique({
        where: {
          id: Number(req.query.id),
        },
        include: {
          category: {
            select: {
              name: true,
            },
          },
          comments: {
            include: { replys: true },
          },
        },
      });

      res.json({
        ok: true,
        data: postData,
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
