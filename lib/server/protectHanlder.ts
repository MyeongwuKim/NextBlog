import { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";

type method = "GET" | "POST" | "DELETE";

interface ProtectParams {
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>;
  methods: method[];
}
type ProtectType = (props: ProtectParams) => void;

const ProtectHanlder: ProtectType = ({ handler, methods }) => {
  return async function (req: NextApiRequest, res: NextApiResponse) {
    const user = await getToken({
      req,
      cookieName: process.env.NEXTAUTH_TOKENNAME,
      secret: process.env.NEXTAUTH_SECRET,
    });
    if (req.method && !methods.includes(req.method as any)) {
      return res.status(405).end();
    }
    if (!user && user?.email != "mw1992@naver.com") {
      return res.status(401).json({ ok: false, error: "Plz log in." });
    }

    return handler(req, res);
  };
};

export default ProtectHanlder;
