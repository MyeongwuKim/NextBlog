import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/server/client";
import { Account } from "@prisma/client";
import { getToken } from "next-auth/jwt";
import ProtectHanlder from "@/lib/server/protectHanlder";
import bcrypt from "bcryptjs";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method == "POST") {
    try {
      let data = await prisma.account.findFirst({
        where: { emailId: { equals: req.body.id } },
      });
      if (!data) throw new Error("유저정보가 없습니다.");
      res.json({
        ok: true,
      });
    } catch (err) {
      let errMsg = err.message
        ? err.message
        : "체크중 알수없는 오류가 발생했습니다.";
      res.json({
        ok: false,
        error: errMsg,
      });
    }
  }
};

export default ProtectHanlder({
  handler,
  methods: ["POST"],
  isPrivate: false,
});
