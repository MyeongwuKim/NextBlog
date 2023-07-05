import { NextApiRequest, NextApiResponse } from "next";
import client from "lib/client";
import { getToken } from "next-auth/jwt";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method == "POST") {
  } else if (req.method == "GET") {
    let token = await getToken({
      req,
      cookieName: process.env.NEXTAUTH_TOKENNAME,
      secret: process.env.NEXTAUTH_SECRET,
    });
    console.log(token);
    let categoryList = await client.category.findMany({
      where: {
        account: {
          id: parseInt(token?.id.toString()),
        },
      },
      orderBy: { order: "asc" },
    });

    res.json({
      ok: true,
      categoryList,
    });
  }
};

export default handler;
