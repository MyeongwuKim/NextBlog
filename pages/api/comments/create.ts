import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/server/client";
import ProtectHanlder from "@/lib/server/protectHanlder";
import bcrypt from "bcryptjs";
import { getToken } from "next-auth/jwt";

interface CommentsBody {
  content: string;
  name: string;
  password: string;
  postId: number;
}
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method == "POST") {
    try {
      let { content, name, password, postId } = req.body as CommentsBody;

      let token = await getToken({
        req,
        cookieName: process.env.NEXTAUTH_TOKENNAME,
        secret: process.env.NEXTAUTH_SECRET,
      });

      let { accountId } = await prisma.post.findUnique({
        where: { id: postId },
        select: {
          accountId: true,
        },
      });

      const isMe = token && token.id == accountId ? true : false;

      if (!isMe && !name && !password)
        throw new Error("세션 만료", {
          cause: "세션 만료 에러가 발생했습니다.",
        });

      let encodedpassword = null;
      if (!isMe) encodedpassword = await bcrypt.hash(password, 10);

      await prisma.comment.create({
        data: {
          content,
          name,
          password: encodedpassword,
          isMe,
          post: { connect: { id: postId } },
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
