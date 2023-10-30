import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/server/client";
import { getToken } from "next-auth/jwt";
import ProtectHanlder from "@/lib/server/protectHanlder";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method == "GET") {
    try {
      let { title, content, category, pageoffset } = req.query;
      let selectInfo = {};
      const pageSize = 5;

      if (content) {
        selectInfo = {
          OR: {
            content: {
              contains: content,
            },
          },
        };
      }
      if (category) {
        selectInfo = {
          OR: {
            category: {
              name: {
                startsWith: category.toString(),
                endsWith: category.toString(),
              },
            },
          },
        };
      }
      if (title) {
        selectInfo = {
          OR: {
            title: {
              startsWith: title.toString(),
              endsWith: title.toString(),
            },
          },
        };
      }
      const endPageCount = await prisma.post.count({
        where: selectInfo,
      });

      const postData = await prisma.post.findMany({
        where: selectInfo,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          title: true,
          isPrivate: true,
          allow: true,
          content: true,
          html: true,
          createdAt: true,
          category: {
            select: {
              name: true,
              id: true,
            },
          },
          account: {
            select: {
              name: true,
            },
          },
        },
        take: pageSize,
        skip: Number(!pageoffset ? 0 : Number(pageoffset) - 1) * pageSize,
      });

      const categoryData = await prisma.category.findMany({
        select: {
          name: true,
          id: true,
        },
      });

      res.json({
        ok: true,
        data: {
          categoryList: categoryData,
          postHistory: postData,
          endPageCount,
        },
      });
    } catch {
      res.json({
        ok: false,
        error: "코멘트 리스트 조회중 오류가 발생하였습니다.",
      });
    }
  }
};

export default ProtectHanlder({
  handler,
  methods: ["GET"],
  isPrivate: true,
});
