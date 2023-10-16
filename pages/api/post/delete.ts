import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/server/client";
import ProtectHanlder from "@/lib/server/protectHanlder";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method == "POST") {
    let ids = req.body;
    if (typeof req.body != "number") {
      ids = req.body.map((number) => {
        return Number(number);
      });
    }
    try {
      await prisma.post.deleteMany({
        where: { id: { in: ids } },
      });
      res.json({
        ok: true,
      });
    } catch {
      res.json({
        ok: false,
        error: "포스트 삭제중 오류가 발생하였습니다.",
      });
    }
  }
};

export default ProtectHanlder({
  handler,
  methods: ["POST"],
  isPrivate: true,
});
