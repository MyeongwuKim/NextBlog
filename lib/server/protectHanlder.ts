import { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";

type method = "GET" | "POST" | "DELETE";

interface ProtectParams {
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>;
  methods: method[];
  isPrivate?: boolean;
}
type ProtectType = (props: ProtectParams) => void;

const ProtectHanlder: ProtectType = ({
  handler,
  methods,
  isPrivate = true,
}) => {
  return async function (req: NextApiRequest, res: NextApiResponse) {
    const user = await getToken({
      req,
      cookieName: process.env.NEXTAUTH_TOKENNAME,
      secret: process.env.NEXTAUTH_SECRET,
    });
    const userId = req.query.userId;

    if (req.method && !methods.includes(req.method as any)) {
      return res.status(405).end();
    }
    if (isPrivate && !user && user?.email != "mw1992@naver.com") {
      return res.status(401).json({ ok: false, error: "Plz log in." });
    }

    return handler(req, res);
  };
};

export default ProtectHanlder;
