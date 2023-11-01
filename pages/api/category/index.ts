import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/server/client";
import { getToken } from "next-auth/jwt";
import { Category } from "@prisma/client";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method == "GET") {
    let token = await getToken({
      req,
      cookieName: process.env.NEXTAUTH_TOKENNAME,
      secret: process.env.NEXTAUTH_SECRET,
    });

    let categoryData = await prisma.category.findMany({
      where: {
        account: {
          email: "mw1992@naver.com",
        },
      },
      include: {
        post: {
          where: token
            ? {}
            : {
                NOT: {
                  isPrivate: true,
                },
              },
          select: {
            id: true,
          },
        },
      },
    });

    res.json({
      ok: true,
      originCategory: categoryData,
    });
  }
};

export default handler;
