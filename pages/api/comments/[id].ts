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
    let { id: postId } = req.query;
    const commentsData = await prisma.comment.findMany({
      where: {
        postId: Number(postId),
      },
      include: {
        replys: true,
      },
    });

    res.json({
      ok: true,
      commentsData,
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
