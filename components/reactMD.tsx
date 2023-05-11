import { NextPage } from "next";
import RemarkCode from "lib/remark-code";
import remarkGfm from "remark-gfm";
//  import  "github-markdown-css/github-markdown.css"; //<- github 스타일을 참조함
import RemarkP from "lib/remark-p";
import RemarkOL from "@/lib/remark-ol";
import ReactMarkDown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkBreaks from "remark-breaks";
import React from "react";

interface IReactMD {
  doc: string;
}

const ReactMD: NextPage<IReactMD> = ({ doc }) => {
  return (
    <>
      <ReactMarkDown
        components={{
          h1({ node, children, ...props }) {
            return (
              <h1 className="mb-[1em] text-[32px] font-bold" {...props}>
                {children}
              </h1>
            );
          },
          h2({ node, children, ...props }) {
            return (
              <h2 className="mb-[1em] text-[24px] font-bold" {...props}>
                {children}
              </h2>
            );
          },
          h3({ node, children, ...props }) {
            return (
              <h3 className="mb-[1em] text-[20px] font-bold" {...props}>
                {children}
              </h3>
            );
          },
          blockquote({ node, children, ...props }) {
            return (
              <blockquote
                className="mb-[1em] font-semibold border-l-4 whitespace-pre-line dark:bg-zinc-700 bg-gray-100 text-black dark:text-white border-emerald-500 px-4"
                {...props}
              >
                {children.map((child) => {
                  let reactElement = child as JSX.Element;
                  if (reactElement.props) {
                    let div = React.createElement(
                      "div",
                      null,
                      reactElement.props?.children
                    );
                    return div;
                  } else return child;
                })}
              </blockquote>
            );
          },
          p({ node, children, ...props }) {
            return (
              <p className="mb-[1em]" {...props}>
                {children}
              </p>
            );
          },
          code: RemarkCode,
        }}
        rehypePlugins={[rehypeRaw]}
        remarkPlugins={[remarkGfm, remarkBreaks]}
      >
        {doc}
      </ReactMarkDown>
    </>
  );
};

export default ReactMD;
