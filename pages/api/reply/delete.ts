import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/server/client";
import ProtectHanlder from "@/lib/server/protectHanlder";

interface CommentsBody {
  content: string;
  name: string;
  postId: number;
}
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { replyId } = req.body;

    let { historyId } = await prisma.reply.findUnique({
      where: {
        id: replyId,
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
