import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/server/client";
import { getToken } from "next-auth/jwt";
import { Category } from "@prisma/client";
import ProtectHanlder from "@/lib/server/protectHanlder";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { userId } = req.query;

  if (req.query.userId == "undefined") {
    res.json({
      ok: false,
    });
  } else {
    if (req.method == "GET") {
      let token = await getToken({
        req,
        cookieName: process.env.NEXTAUTH_TOKENNAME,
        secret: process.env.NEXTAUTH_SECRET,
      });
      let privateFilter = false;
      if (token) {
        privateFilter = token.email.split("@")[0] == userId;
      }
      let categoryData = await prisma.category.findMany({
        where: {
          account: {
            emailId: { equals: String(req.query.userId) },
          },
        },
        include: {
          post: {
            where: privateFilter
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
  }
};

export default ProtectHanlder({
  handler,
  methods: ["GET"],
  isPrivate: false,
});
