import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  ok: boolean;
  category: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  console.log(req.method);
  res.status(200).json({
    ok: false,
    category: "자바스크립트,자바,타입스크립트,",
  });
}
