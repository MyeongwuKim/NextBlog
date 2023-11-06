import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/server/client";
import ProtectHanlder from "@/lib/server/protectHanlder";
import bcrypt from "bcryptjs";
import { getToken } from "next-auth/jwt";

interface CommentsBody {
  content: string;
  name: string;
  postId: number;
}
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    let token = await getToken({
      req,
      cookieName: process.env.NEXTAUTH_TOKENNAME,
      secret: process.env.NEXTAUTH_SECRET,
    });
    let filter = !token
      ? {
          NOT: {
            post: {
              isPrivate: true,
            },
          },
        }
      : {};
    let historyData = await prisma.history.findMany({
      where: filter,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        postId: true,
        isReply: true,
        comment: { select: { content: true, id: true } },
        reply: { select: { content: true, id: true } },
      },
      take: 3,
    });

    res.json({
      ok: true,
      historyData,
    });
  } catch {
    res.json({
      ok: false,
      error: "코멘트 조회중 오류가 발생 했습니다.",
    });
  }
};

export default ProtectHanlder({
  handler,
  methods: ["GET"],
  isPrivate: false,
});
