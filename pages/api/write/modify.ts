import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/server/client";
import ProtectHanlder from "@/lib/server/protectHanlder";
import { getFormatImagesId } from "@/hooks/useUtils";
import { resolve } from "dns/promises";

interface RequestBodyData {
  postId: string;
  title: string;
  content: string;
  categoryId: number;
  allow: boolean;
  isPrivate: boolean;
  accountId: number;
  thumbnail: string;
  imagesId: { imageId: string }[];
  preview: string;
  prevThumbnail: string;
  html: string;
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
        prevThumbnail,
        postId,
        imagesId,
        html,
      } = req.body as RequestBodyData;

      await prisma.post.update({
        where: {
          id: Number(postId),
        },
        data: {
          allow,
          content,
          isPrivate,
          thumbnail: thumbnail != prevThumbnail ? thumbnail : prevThumbnail,
          title,
          html,
          preview,
          account: {
            connect: {
              id: accountId,
            },
          },
          category: {
            connect: {
              id: categoryId,
            },
          },
        },
      });

      const imageDelteFunc = async (imageId) => {
        let fetchUrl = `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT}/images/v1/${imageId}`;
        let response = await (
          await fetch(fetchUrl, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.CF_TOKEN}`,
            },
          })
        ).json();

        return response;
      };

      const prevImages = imagesId;
      const curImages = getFormatImagesId(content);
      let count = 0;
      /*예외케이스 체크 -> 같은 이미지 ID URL을 쓸것인가?,
       만약 내가 CF에 올려져있는 URL을 복사해서 쓴다면? 지울때 문제가 생김
      */
      for (let i = 0; i < prevImages.length; i++) {
        let prevId = prevImages[i].imageId;
        if (!curImages[i] || prevId != curImages[i]) {
          let res = await imageDelteFunc(prevId);
          await prisma.image.delete({
            where: {
              imageId: prevId,
            },
          });
        }
        count++;
      }
      for (let i = count; i < curImages.length; i++) {
        await prisma.post.update({
          where: {
            id: Number(postId),
          },
          data: {
            images: {
              connect: {
                imageId: curImages[i],
              },
            },
          },
        });
      }

      res.json({
        ok: true,
      });
    } catch (e) {
      res.json({
        ok: false,
        error: `Prisma errorCode:${e.code}, ${e?.meta?.cause}`,
      });
    }
  }
};

export default ProtectHanlder({
  handler,
  methods: ["POST"],
});
