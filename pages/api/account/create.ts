import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/server/client";
import { Account } from "@prisma/client";
import { getToken } from "next-auth/jwt";
import ProtectHanlder from "@/lib/server/protectHanlder";
import bcrypt from "bcryptjs";

interface CreateAccountData {
  email: string;
  phonenumber: string;
  password: string;
  name: string;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method == "POST") {
    const reqData = req.body as CreateAccountData;
    try {
      let { email, name, password, phonenumber } = reqData;

      const userData = await prisma.account.findUnique({
        where: {
          email,
        },
      });
      if (userData) throw new Error("이미 사용중인 이메일 주소입니다.");

      if (
        phonenumber.replace(/-/g, "") != "01056671992" ||
        email.split("@")[0] != "mw1992"
      )
        throw new Error("가입이 허용되지 않은 정보 입니다.");

      const encodedpassword = await bcrypt.hash(password, 10);
      await prisma.account.create({
        data: {
          emailId: email.split("@")[0],
          email,
          name,
          password: encodedpassword,
        },
      });
      res.json({
        ok: true,
      });
    } catch (err) {
      let errMsg = err.message
        ? err.message
        : "계정 생성중 오류가 발생했습니다.";
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
