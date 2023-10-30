import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/server/client";
import ProtectHanlder from "@/lib/server/protectHanlder";
import bcrypt from "bcryptjs";
import { getToken } from "next-auth/jwt";

interface CommentsBody {
  content: string;
  name: string;
  postId: number;
  categoryId: number;
}
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method == "POST") {
    try {
      let { content, name, postId, categoryId } = req.body as CommentsBody;
      let token = await getToken({
        req,
        cookieName: process.env.NEXTAUTH_TOKENNAME,
        secret: process.env.NEXTAUTH_SECRET,
      });

      let {
        accountId,
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

      const isMe = token && token.id == accountId ? true : false;

      if (!isMe && !name)
        throw new Error("세션 만료", {
          cause: "세션 만료 에러가 발생했습니다.",
        });

      let comment = await prisma.comment.create({
        data: {
          content,
          name: isMe ? ownerName : name,
          isMe,
          post: { connect: { id: postId } },
          category: { connect: { id: categoryId } },
        },
      });

      let history = await prisma.history.create({
        data: {
          comment: {
            connect: { id: comment.id },
          },
          post: {
            connect: { id: postId },
          },
        },
      });
      res.json({
        ok: true,
      });
    } catch (e) {
      res.json({
        ok: false,
        error: e.cause ? e.cause : "코멘트 작성중 오류가 발생했습니다.",
      });
    }
  } else {
  }
};

export default ProtectHanlder({
  handler,
  methods: ["POST"],
  isPrivate: false,
});
