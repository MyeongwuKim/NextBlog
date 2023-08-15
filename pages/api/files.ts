import ProtectHanlder from "@/lib/server/protectHanlder";
import { NextApiRequest, NextApiResponse } from "next";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    let response;
    let fetchUrl;
    if (req.method == "POST") {
      fetchUrl = `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT}/images/v1/direct_upload`;
    } else if (req.method == "DELETE") {
      let { imageId } = JSON.parse(req.body);
      fetchUrl = `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT}/images/v1/${imageId}`;
    }
    response = await (
      await fetch(fetchUrl, {
        method: req.method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.CF_TOKEN}`,
        },
      })
    ).json();

    res.json({
      ok: true,
      ...response.result,
    });
  } catch {
    res.json({
      ok: false,
      error: "이미지 서버와 통신중 오류가 발생하였습니다.",
    });
  }
}

export default ProtectHanlder({
  handler,
  methods: ["POST", "DELETE"],
});
