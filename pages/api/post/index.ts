import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/server/client";
import { getToken } from "next-auth/jwt";
import ProtectHanlder from "@/lib/server/protectHanlder";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method == "GET") {
    try {
      let { categoryId, pageOffset } = req.query;
      let postData;
      let whereData = {};
      if (categoryId) {
        whereData = { categoryId: Number(categoryId) };
      }
      postData = await prisma.post.findMany({
        where: whereData,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          _count: { select: { comments: true } },
        },
        take: 10,
        skip: Number(pageOffset) * 10,
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
