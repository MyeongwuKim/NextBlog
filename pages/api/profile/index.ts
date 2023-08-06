import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/server/client";
import { Account } from "@prisma/client";
import { getToken } from "next-auth/jwt";
import ProtectHanlder from "@/lib/server/protectHanlder";

interface RequestUserData {
  avatar?: string;
  originAvatar?: string;
  github?: string;
  password?: string;
  changePassword?: string;
  originPassword?: string;
  name: string;
  id: number;
  introduce?: string;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method == "POST") {
    const reqUserData = req.body as RequestUserData;
    try {
      let updateData: RequestUserData = {
        id: reqUserData.id,
        name: reqUserData.name,
        github: reqUserData.github,
        introduce: reqUserData.introduce,
      };
      if (reqUserData.changePassword) {
        updateData = { ...updateData, password: reqUserData.changePassword };
      }
      if (reqUserData.avatar !== undefined) {
        updateData = { ...updateData, avatar: reqUserData.avatar };
      }
      let result = await prisma.account.update({
        where: {
          id: reqUserData.id,
        },
        data: updateData,
      });
      res.json({
        ok: true,
      });
    } catch {
      res.json({
        ok: false,
        error: "유저 정보를 변경하는데 실패하였습니다.",
      });
    }
  } else if (req.method == "GET") {
    try {
      let token = await getToken({
        req,
        cookieName: process.env.NEXTAUTH_TOKENNAME,
        secret: process.env.NEXTAUTH_SECRET,
      });
      const profileData = await prisma.account.findUnique({
        where: { email: "mw1992@naver.com" },
        select: {
          avatar: true,
          email: true,
          name: true,
          github: true,
          id: true,
          introduce: true,
          password: true,
        },
      });
      res.json({
        ok: true,
        profile: profileData,
      });
    } catch {
      res.json({
        ok: false,
        error: "유저 정보를 가져오는데 실패하였습니다.",
      });
    }
  }
};

export default ProtectHanlder({
  handler,
  methods: ["GET", "POST"],
  isPrivate: false,
});
