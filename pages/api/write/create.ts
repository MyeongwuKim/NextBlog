import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/server/client";
import ProtectHanlder from "@/lib/server/protectHanlder";
import { getFormatImagesId } from "@/hooks/useUtils";

interface RequestBodyData {
  title: string;
  content: string;
  categoryId: number;
  allow: boolean;
  isPrivate: boolean;
  accountId: number;
  thumbnail: string;
  preview: string;
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
        thumbnail,
        title,
        preview,
      } = req.body as RequestBodyData;

      let post = await prisma.post.create({
        data: {
          content,
          title,
          allow,
          preview,
          isPrivate,
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

      if (thumbnail) {
        await prisma.post.update({
          where: {
            id: post.id,
          },
          data: {
            thumbnail,
          },
        });
      }

      const imageUplaod = async (id) => {
        await prisma.image.create({
          data: {
            imageId: id,
            Post: {
              connect: {
                id: post?.id,
              },
            },
          },
        });
      };

      for (let i = 0; i < getFormatImagesId(content).length; i++) {
        let id = getFormatImagesId(content)[i];
        await imageUplaod(id);
      }

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
