import { NextApiRequest, NextApiResponse } from "next";
import client from "@/lib/server/client";
import convert from "xml-js";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  let serviceKey =
    "0F9oTyNfZGrQXw462vKYqTGHora%2BocNTYetUBX04wpKgMHdXBbxCK%2BvTnamlHJ48WGFcKTgmKx%2FcWbAArNLVCw%3D%3D";
  var url =
    "http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst";

  var queryParams =
    "?" + encodeURIComponent("ServiceKey") + `=${serviceKey}`; /* Service Key*/
  queryParams +=
    "&" + encodeURIComponent("pageNo") + "=" + encodeURIComponent("1"); /* */
  queryParams +=
    "&" +
    encodeURIComponent("numOfRows") +
    "=" +
    encodeURIComponent("1000"); /* */
  queryParams +=
    "&" +
    encodeURIComponent("dataType") +
    "=" +
    encodeURIComponent("JSON"); /* */
  queryParams +=
    "&" +
    encodeURIComponent("base_date") +
    "=" +
    encodeURIComponent("20230721"); /* */
  queryParams +=
    "&" +
    encodeURIComponent("base_time") +
    "=" +
    encodeURIComponent("0800"); /* */
  queryParams +=
    "&" + encodeURIComponent("nx") + "=" + encodeURIComponent("55"); /* */
  queryParams +=
    "&" + encodeURIComponent("ny") + "=" + encodeURIComponent("127"); /* */

  let data = await (
    await fetch(url + queryParams, {
      headers: {
        "Content-Type": "application/json",
      },
    })
  ).json();

  res.json({
    ok: true,
    data: data.response.body.items,
  });
};

export default handler;
