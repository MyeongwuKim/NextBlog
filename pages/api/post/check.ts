import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/server/client";
import { getToken } from "next-auth/jwt";
import ProtectHanlder from "@/lib/server/protectHanlder";

//해당 포스트가 있는지, 비밀포스트인지 체크 권한이 없으면 에러
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method == "POST") {
    try {
      const postData = await prisma.post.findUnique({
        where: {
          id: Number(req.body.id),
        },
        select: {
          isPrivate: true,
        },
      });
      res.json({
        ok: true,
        data: postData,
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
  methods: ["POST"],
  isPrivate: false,
});
