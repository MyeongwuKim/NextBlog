import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const Pagination = ({
  endPageNumber,
  pageNumberArr,
  pageSize,
}: {
  pageSize: number;
  endPageNumber: number;
  pageNumberArr: number[];
}) => {
  const router = useRouter();

  return (
    <div className="flex justify-center">
      <div className="inline-flex -space-x-px text-sm">
        <div
          className={`${
            Number(
              router.query.pageoffset == undefined ? 1 : router.query.pageoffset
            ) -
              3 <=
            0
              ? "hidden"
              : "block"
          }`}
        >
          <Link
            href={{
              pathname: router.basePath,
              query: {
                ...router.query,
                pageoffset:
                  Number(router.query.pageoffset) - pageSize <= 0
                    ? 1
                    : Number(router.query.pageoffset) - pageSize,
              },
            }}
            className="flex items-center justify-center px-3 h-8 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-400 dark:hover:bg-zinc-600 dark:hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 12h-15m0 0l6.75 6.75M4.5 12l6.75-6.75"
              />
            </svg>
          </Link>
        </div>
        {pageNumberArr?.map((v, i) => (
          <PageItem key={v} pageNumber={v} />
        ))}
        <div
          className={`${
            Number(
              router.query.pageoffset == undefined ? 1 : router.query.pageoffset
            ) +
              3 >
            endPageNumber
              ? "hidden"
              : "block"
          }`}
        >
          <Link
            href={{
              pathname: router.basePath,
              query: {
                ...router.query,
                pageoffset:
                  Number(router.query.pageoffset) + pageSize > endPageNumber
                    ? endPageNumber
                    : Number(router.query.pageoffset) + pageSize,
              },
            }}
            className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-400 dark:hover:bg-zinc-600 dark:hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export const PageItem = ({ pageNumber }: { pageNumber: number }) => {
  const router = useRouter();
  return (
    <>
      <Link
        href={{
          pathname: router.basePath,
          query: { ...router.query, pageoffset: pageNumber },
        }}
        className={`flex items-center justify-center px-3 h-8 leading-tight border
        dark:border-zinc-700 border-gray-300
          ${
            Number(
              router.query.pageoffset == undefined ? 1 : router.query.pageoffset
            ) == pageNumber
              ? "pointer-events-none dark:bg-zinc-600 dark:text-white text-gray-700 bg-gray-100 "
              : `hover:bg-gray-100 text-gray-500 bg-white 
               border hover:text-gray-700  dark:bg-zinc-800  dark:text-gray-400 dark:hover:bg-zinc-600 dark:hover:text-white`
          }`}
      >
        {pageNumber}
      </Link>
    </>
  );
};

export default Pagination;
