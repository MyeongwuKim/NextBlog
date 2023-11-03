import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/server/client";
import { getToken } from "next-auth/jwt";
import ProtectHanlder from "@/lib/server/protectHanlder";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method == "GET") {
    try {
      const { id: postId } = req.query;
      const token = await getToken({
        req,
        cookieName: process.env.NEXTAUTH_TOKENNAME,
        secret: process.env.NEXTAUTH_SECRET,
      });

      const postData = await prisma.post.findUnique({
        where: {
          id: Number(postId),
        },
        select: {
          category: {
            select: {
              id: true,
            },
          },
        },
      });

      let privateFilter = !token ? { isPrivate: true } : { isPrivate: null };

      const getNearCategoryData = async (take, orderBy) => {
        return await prisma.category.findUnique({
          where: {
            id: postData?.category.id,
          },
          select: {
            post: {
              where: {
                NOT: privateFilter,
              },
              cursor: {
                id: Number(postId),
              },
              skip: 1,
              take,
              select: {
                title: true,
                thumbnail: true,
                createdAt: true,
                id: true,
              },
              orderBy: {
                createdAt: orderBy,
              },
            },
          },
        });
      };

      let { post: prevPost } = await getNearCategoryData(4, "desc");
      let { post: nextPost } = await getNearCategoryData(4, "asc");
      let nearPostsData = [];
      let totalPostCount = prevPost.length + nextPost.length;

      const setPageData = (data, maxLength, reverse?) => {
        let selectData = [];
        if (data.length > 0) {
          for (
            let i = reverse ? maxLength - 1 : 0;
            reverse ? i > -1 : i < maxLength;
            reverse ? i-- : i++
          ) {
            selectData.push(data[i]);
          }
        }
        return selectData;
      };

      if (totalPostCount > 0) {
        let order = { left: 0, right: 0 };
        if (nextPost.length >= 2 && prevPost.length >= 2) {
          order = { left: 2, right: 2 };
        } else {
          let firstOne =
            nextPost.length > prevPost.length ? prevPost : nextPost;
          let secondOne =
            nextPost.length > prevPost.length ? nextPost : prevPost;
          let firstIter = firstOne.length;
          let secondIter =
            secondOne.length < 4
              ? secondOne.length
              : secondOne.length - firstIter;

          order = {
            left: prevPost.length < nextPost.length ? secondIter : firstIter,
            right: prevPost.length < nextPost.length ? firstIter : secondIter,
          };
        }

        let selectedNextPost = setPageData(nextPost, order.left, true);
        let selectedPrevPost = setPageData(prevPost, order.right);
        nearPostsData = [...selectedNextPost, ...selectedPrevPost];
      }

      res.json({
        ok: true,
        nearPostsData,
      });
    } catch {
      res.json({
        ok: false,
        error: "포스트 조회중 오류가 발생하였습니다.",
      });
    }
  }
};

export default ProtectHanlder({
  handler,
  methods: ["GET"],
  isPrivate: false,
});
