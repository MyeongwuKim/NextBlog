/**현재시간 타임스탬프(년,월,일,시간,분,초 합친값)*/
export const getTimeStamp = () => {
  function fn() {
    let today = new Date();
    let timeStamp = [
      today.getFullYear(),
      today.getMonth() + 1,
      today.getDate(),
      today.getHours(),
      today.getMinutes(),
      today.getSeconds(),
    ].join("");

    return timeStamp;
  }
  return fn;
};
/**Date값 년,월,일로 포맷해서 가져옴 */
export const getFormatDate = (date: Date): string => {
  const formatDate = [
    new Date(date).getFullYear(),
    ".",
    (new Date(date).getMonth() + 1).toString().length > 1
      ? new Date(date).getMonth() + 1
      : "0" + (new Date(date).getMonth() + 1).toString(),
    ".",
    new Date(date).getDate().toString().length > 1
      ? new Date(date).getDate()
      : "0" + new Date(date).getDate().toString(),
  ].join("");

  return formatDate;
};
/**Date값 년,월,일,초 로 포맷해서 가져옴 */
export const getFormatFullDate = (date: Date): string => {
  const formatDate = [
    new Date(date).getFullYear(),
    ".",
    (new Date(date).getMonth() + 1).toString().length > 1
      ? new Date(date).getMonth() + 1
      : "0" + (new Date(date).getMonth() + 1).toString(),
    ".",
    new Date(date).getDate().toString().length > 1
      ? new Date(date).getDate()
      : "0" + new Date(date).getDate().toString(),
    " ",
    new Date(date).getHours().toString().length > 1
      ? new Date(date).getHours()
      : "0" + new Date(date).getHours().toString(),
    ":",
    new Date(date).getMinutes().toString().length > 1
      ? new Date(date).getMinutes()
      : "0" + new Date(date).getMinutes().toString(),
  ].join("");

  return formatDate;
};
/**클라우드플레어 이미지 주소(이미지 아이디, 형식 필요)*/
export const getDeliveryDomain = (
  id: string,
  suffix: "public" | "avatar" | "thumbnail"
) => {
  const uploadPrefix = "https://imagedelivery.net/0VaIqAONZ2vq2gejAGX7Sw/";
  const uploadSuffix = `/${suffix}`;

  return uploadPrefix + id + uploadSuffix;
};
/**Post Content에 있는 이미지 아이디 추출*/
export const getFormatImagesId = (content: string): string[] => {
  let imagesIdArr: string[] = [];
  let url = "https://imagedelivery.net/0VaIqAONZ2vq2gejAGX7Sw/";
  const regex = new RegExp(`${url}|(public)|/`, "g");

  // let imagesId = content
  //   .replace(regex, "")
  //   .replace(/ *\[[^\]]*]/g, "")
  //   .replace(/[(|)]/g, "");\

  var regExp = /\(([^)]+)\)/g;
  var matches = content.replace(regex, "").match(regExp);

  for (var i = 0; i < matches.length; i++) {
    var str = matches[i];
    imagesIdArr.push(str.replace(/[(|)]/g, ""));
  }

  return imagesIdArr;
};
