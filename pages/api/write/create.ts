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

      // const wait = (timeToDelay) =>
      //   new Promise((resolve) => setTimeout(resolve, timeToDelay)); //이와 같이 선언 후
      // for (let i = 10; i < 100; i++) {
      //   await wait(1000);
      //   await prisma.post.create({
      //     data: {
      //       content,
      //       html,
      //       title: title + "-" + i + "번",
      //       allow,
      //       preview,
      //       isPrivate,
      //       category: {
      //         connect: {
      //           id: categoryId,
      //         },
      //       },
      //       account: {
      //         connect: {
      //           id: accountId,
      //         },
      //       },
      //     },
      //   });
      //   console.log("완료!");
      // }

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

      for (let i = 0; i < getFormatImagesId(content).length; i++) {
        let id = getFormatImagesId(content)[i];
        await imageUplaod(id);
      }

      res.json({
        ok: true,
      });
    } catch (e) {
      console.log(e);
      let error = e?.code
        ? `Prisma errorCode:${e.code}, Prisma Error ${e.meta.cause}`
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
