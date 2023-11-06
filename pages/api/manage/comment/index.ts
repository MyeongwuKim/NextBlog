import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/server/client";
import { getToken } from "next-auth/jwt";
import ProtectHanlder from "@/lib/server/protectHanlder";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method == "GET") {
    try {
      let { name, content, pageoffset, limit } = req.query;
      const pageSize =
        !limit || typeof Number(limit) !== "number" ? 5 : Number(limit);
      let selectList = {
        id: true,
        content: true,
        name: true,
        createdAt: true,
        postId: true,
        isMe: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        post: {
          select: {
            title: true,
          },
        },
      };
      let selectInfo = {};
      if (content) {
        selectInfo = {
          OR: [
            {
              comment: {
                content: {
                  contains: content.toString(),
                },
              },
            },
            {
              reply: {
                content: {
                  contains: content.toString(),
                },
              },
            },
          ],
        };
      }
      if (name) {
        selectInfo = {
          OR: [
            {
              comment: {
                name: {
                  startsWith: name.toString(),
                  endsWith: name.toString(),
                },
              },
            },
            {
              reply: {
                name: {
                  startsWith: name.toString(),
                  endsWith: name.toString(),
                },
              },
            },
          ],
        };
      }
      let maxCount = await prisma.history.count({
        where: selectInfo,
      });

      let commentsData = await prisma.history.findMany({
        orderBy: { createdAt: "desc" },
        where: selectInfo,
        select: {
          id: true,
          isReply: true,
          reply: {
            select: selectList,
          },
          comment: {
            select: selectList,
          },
        },
        take: pageSize,
        skip: Number(!pageoffset ? 0 : Number(pageoffset) - 1) * pageSize,
      });

      let formatCommentsData = commentsData.map((item) => {
        let formatData;
        let category;
        let categoryId;
        if (item.isReply) {
          delete item.comment;
          formatData = item.reply;
          categoryId = item.reply.category.id;
          category = item.reply.category.name;
        } else {
          delete item.reply;
          formatData = item.comment;
          categoryId = item.comment.category.id;
          category = item.comment.category.name;
        }
        return {
          ...formatData,
          isReply: item.isReply,
          category,
          categoryId,
          historyId: item.id,
        };
      });

      res.json({
        ok: true,
        data: { historyData: formatCommentsData, maxCount },
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
  isPrivate: false,
});
