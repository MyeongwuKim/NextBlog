import { NextApiRequest, NextApiResponse } from "next";
import client from "lib/client";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  res.json({
    ok: true,
  });
};

export default handler;
