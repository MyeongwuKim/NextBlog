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
    const { commentId } = req.body;

    let { historyId } = await prisma.comment.findUnique({
      where: {
        id: commentId,
      },
      select: {
        historyId: true,
      },
    });

    await prisma.history.delete({
      where: {
        id: historyId,
      },
    });
    res.json({
      ok: true,
    });
  } catch {
    res.json({
      ok: false,
      error: "삭제중 오류가 발생 했습니다.",
    });
  }
};

export default ProtectHanlder({
  handler,
  methods: ["POST"],
  isPrivate: true,
});
