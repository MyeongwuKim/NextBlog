import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/server/client";
import { getToken } from "next-auth/jwt";
import ProtectHanlder from "@/lib/server/protectHanlder";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method == "GET") {
    try {
      let { s, pageoffset } = req.query;
      let postData;
      let whereData;
      const user = await getToken({
        req,
        cookieName: process.env.NEXTAUTH_TOKENNAME,
        secret: process.env.NEXTAUTH_SECRET,
      });
      whereData = user
        ? {}
        : {
            NOT: { isPrivate: true },
          };
      whereData = { ...whereData, content: { contains: s.toString() } };
      //   if (categoryId) {
      //     whereData = { ...whereData,) };
      //   }
      console.log(pageoffset);
      postData = await prisma.post.findMany({
        where: whereData,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          _count: { select: { comments: true } },
        },
        take: 10,
        skip: Number(pageoffset) * 10,
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
