import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/server/client";
import ProtectHanlder from "@/lib/server/protectHanlder";
import { getFormatImagesId } from "@/hooks/useUtils";

interface RequestBodyData {
  title: string;
  content: string;
  html: string;
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
        html,
        isPrivate,
        thumbnail,
        title,
        preview,
      } = req.body as RequestBodyData;

      let post = await prisma.post.create({
        data: {
          content,
          html,
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

      const imagesId = getFormatImagesId(html);
      for (let i = 0; i < imagesId.length; i++) {
        let id = imagesId[i];
        await imageUplaod(id);
      }

      res.json({
        ok: true,
        id: post.id,
      });
    } catch (e) {
      console.log(e.meta);
      let error = e?.code
        ? `Prisma errorCode:${e.code}, Prisma Error ${JSON.stringify(e.meta)}`
        : "포스트 작성중 에러가 발생했습니다.";
      res.json({
        ok: false,
        error,
      });
    }
  }
};

export default ProtectHanlder({
  handler,
  methods: ["POST"],
});
