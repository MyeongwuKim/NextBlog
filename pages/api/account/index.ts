import { NextApiRequest, NextApiResponse } from "next";
import client from "lib/client";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method == "POST") {
    const { email, password } = req.body;
    const existEmail = await client.account.findUnique({
      where: {
        email,
      },
    });
    if (existEmail) {
      res.json({
        ok: false,
        data: existEmail,
      });
      return;
    }
    const userData = await client.account.create({
      data: {
        name: "test",
        email,
        password,
        introduce: "안녕하세요 저는 김명우 입니다!",
      },
    });
    res.json({
      ok: true,
      data: userData,
    });
  }
};

export default handler;
