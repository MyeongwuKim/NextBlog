import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/server/client";
import ProtectHanlder from "@/lib/server/protectHanlder";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method == "POST") {
    let ids = [];
    let {
      type,
      postIds,
    }: {
      type: Record<"allow" | "isPrivate" | "categoryId", boolean | number>;
      postIds: number[];
    } = req.body;

    if (typeof postIds != "number") {
      ids = postIds.map((number) => {
        return Number(number);
      });
    }

    try {
      if (
        ["allow", "isPrivate"].some((item) =>
          Object.keys(type)[0].includes(item)
        )
      ) {
        let data = {};
        if (typeof type.allow != "undefined") data = { allow: type.allow };
        else if (typeof type.isPrivate != "undefined")
          data = { isPrivate: type.isPrivate };

        await prisma.$transaction(
          ids.map((id) =>
            prisma.post.update({
              where: {
                id,
              },
              data,
            })
          )
        );
      } else {
        await prisma.$transaction(
          ids.map((id) =>
            prisma.post.update({
              where: {
                id,
              },
              data: {
                categoryId: Number(type.categoryId),
              },
            })
          )
        );
      }

      res.json({
        ok: true,
      });
    } catch {
      res.json({
        ok: false,
        error: "포스트 정보 변경중 오류가 발생하였습니다.",
      });
    }
  }
};

export default ProtectHanlder({
  handler,
  methods: ["POST"],
  isPrivate: true,
});
