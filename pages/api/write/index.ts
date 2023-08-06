import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/server/client";
import ProtectHanlder from "@/lib/server/protectHanlder";
import { Prisma } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";

interface RequestBodyData {
  title: string;
  content: string;
  categoryId: number;
  allow: boolean;
  isPrivate: boolean;
  accountId: number;
  thumnail: string;
  imagesId: string[];
}
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method == "POST") {
    try {
      let {
        accountId,
        allow,
        categoryId,
        content,
        isPrivate,
        thumnail,
        title,
        imagesId,
      } = req.body as RequestBodyData;

      let post = await prisma.post.create({
        data: {
          content,
          title,
          allow,
          isPrivate,
          thumnail,
          category: {
            connect: {
              id: categoryId,
            },
          },
          account: {
            connect: {
              id: accountId,
            },
          },
        },
      });

      const transaction = await prisma.$transaction(
        imagesId.map((id) =>
          prisma.image.create({
            data: {
              imageId: id,
              Post: {
                connect: {
                  id: post?.id,
                },
              },
            },
          })
        )
      );
      res.json({
        ok: true,
      });
    } catch (e) {
      res.json({
        ok: false,
        error: `Prisma errorCode:${e.code}, ${e.meta.cause}`,
      });
    }
  }
};

export default ProtectHanlder({
  handler,
  methods: ["POST"],
});
