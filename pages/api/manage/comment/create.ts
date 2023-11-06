import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/server/client";
import ProtectHanlder from "@/lib/server/protectHanlder";
import bcrypt from "bcryptjs";
import { getToken } from "next-auth/jwt";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method == "POST") {
    try {
      let {
        content,
        data: { postId, categoryId, id, isReply },
      } = req.body;
      let token = await getToken({
        req,
        cookieName: process.env.NEXTAUTH_TOKENNAME,
        secret: process.env.NEXTAUTH_SECRET,
      });

      if (!token)
        throw new Error("세션 만료", {
          cause: "세션 만료 에러가 발생했습니다.",
        });

      let commentId;
      if (isReply) {
        const { commentId: replyCommentId } = await prisma.reply.findUnique({
          where: {
            id,
          },
          select: {
            commentId: true,
          },
        });
        commentId = replyCommentId;
      } else {
        const { id: originId } = await prisma.comment.findUnique({
          where: {
            id,
          },
          select: {
            id: true,
          },
        });
        commentId = originId;
      }

      let {
        account: { name: ownerName },
      } = await prisma.post.findUnique({
        where: { id: postId },
        select: {
          accountId: true,
          account: {
            select: {
              name: true,
            },
          },
        },
      });

      let reply = await prisma.reply.create({
        data: {
          content,
          name: ownerName,
          isMe: true,
          post: { connect: { id: postId } },
          comment: { connect: { id: commentId } },
          category: { connect: { id: categoryId } },
        },
      });

      await prisma.history.create({
        data: {
          isReply: true,
          reply: {
            connect: { id: reply.id },
          },
          post: {
            connect: {
              id: postId,
            },
          },
        },
      });

      res.json({
        ok: true,
      });
    } catch (e) {
      console.log(e);
      res.json({
        ok: false,
        error: e.cause ? e.cause : "답글 작성중 오류가 발생했습니다.",
      });
    }
  } else {
  }
};

export default ProtectHanlder({
  handler,
  methods: ["POST"],
  isPrivate: true,
});
