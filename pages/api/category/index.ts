import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/server/client";
import { getToken } from "next-auth/jwt";
import { Category } from "@prisma/client";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method == "POST") {
    let token = await getToken({
      req,
      cookieName: process.env.NEXTAUTH_TOKENNAME,
      secret: process.env.NEXTAUTH_SECRET,
    });
    let categoryList;
    try {
      categoryList = await prisma.category.findMany({
        where: {
          account: {
            id: parseInt(token?.id.toString()),
          },
        },
        select: {
          order: true,
          name: true,
          id: true,
          accountId: true,
          _count: {
            select: {
              post: true,
            },
          },
        },
        orderBy: { order: "asc" },
      });
    } catch {
      res.json({
        ok: false,
        error: "카테고리 조회 에러",
      });
      return;
    }

    let { mutate, remove } = req.body;
    let reqCategory = mutate as Category[];
    let cloneAddCategory = JSON.parse(JSON.stringify(reqCategory));

    let addCategory = cloneAddCategory.filter((categoryItem, i) => {
      if (categoryList.some((item) => item.id == categoryItem.id)) {
        return false;
      } else {
        reqCategory.splice(i, 1);
        delete categoryItem.id;
        return true;
      }
    });

    cloneAddCategory = JSON.parse(JSON.stringify(reqCategory));

    let updateCategory: Category[] = cloneAddCategory.filter(
      (categoryItem: Category, i) => {
        if (
          categoryList.some((item) => {
            if (item.id == categoryItem.id) {
              if (
                item.name != categoryItem.name ||
                item.order != categoryItem.order
              ) {
                return true;
              }
            }
          })
        ) {
          return true;
        }
      }
    );

    try {
      const transaction = await prisma.$transaction(
        updateCategory.map((updateItem) =>
          prisma.category.updateMany({
            where: {
              id: updateItem.id,
            },
            data: {
              name: updateItem.name,
              order: updateItem.order,
            },
          })
        )
      );

      if (addCategory.length > 0) {
        await prisma.category.createMany({
          data: addCategory,
          skipDuplicates: true,
        });
      }

      if (remove.length > 0) {
        await prisma.category.deleteMany({
          where: { id: { in: remove } },
        });
      }

      let updateData = await prisma.category.findMany({
        where: {
          accountId: token.id,
        },
        include: {
          _count: {
            select: {
              post: true,
            },
          },
        },
      });
      res.json({
        ok: true,
        updateData,
      });
    } catch {
      res.json({
        ok: false,
        error: "변경사항 변경 에러",
      });
      return;
    }
  } else if (req.method == "GET") {
    let categoryData = await prisma.category.findMany({
      where: {
        account: {
          email: "mw1992@naver.com",
        },
      },
      include: {
        _count: true,
      },
    });

    res.json({
      ok: true,
      originCategory: categoryData,
    });
  }
};

export default handler;
