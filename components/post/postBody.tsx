import { getDeliveryDomain } from "@/hooks/useUtils";
import ReactMD from "../write/reactMD";
import { use, useEffect, useState } from "react";

const PostBody = ({
  postResponse,
  profileData,
  appendixEvt,
  dynamicLoadingState,
}) => {
  useEffect(() => {
    dynamicLoadingState(false);
  }, []);
  useEffect(() => {
    appendixEvt();
  }, [postResponse]);

  return (
    <>
      <div className="my-16" id="reactMD">
        <ReactMD doc={postResponse?.postData?.html} />
      </div>
      <div className="mb-8 text-xl  font-semibold">Post By</div>
      <div className="py-12 mb-16 border-y-[1px]  flex border-gray-200 dark:border-zinc-800">
        <div
          className="border-2 dark:border-zinc-800 relative flex flex-none
              flex-row items-center justify-center w-52 h-52 sm:w-24 sm:h-24 rounded-full bg-slate-500"
        >
          <img
            src={
              profileData?.avatar
                ? `${getDeliveryDomain(profileData?.avatar, "public")}`
                : ""
            }
            className={`${
              profileData?.avatar ? "block" : "hidden"
            } w-full h-full rounded-full`}
          />
          <span className="text-3xl sm:text-2xl font-semibold text-center text-white ">
            {!profileData?.avatar ? profileData?.name : ""}
          </span>
        </div>
        <div className="ml-4">
          <div className="mb-2 text-xl sm:text-lg font-bold">
            {profileData?.name}
          </div>
          <div className="text-lg sm:text-base font-semibold">
            {profileData?.introduce}
          </div>
        </div>
      </div>
    </>
  );
};

export default PostBody;
