import React, { createElement, Fragment, useEffect, useRef } from "react";
import ReactMD from "./reactMD";

interface Props {
  doc: string;
  title?: string;
}

const Preview: React.FC<Props> = (props) => {
  const previewRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const { current } = previewRef;
    current!.scrollTop = current!.scrollHeight; // left핸드 어쩌고 나오면 !를 써주자
  }, [props.doc]);

  useEffect(() => {
    const { current } = titleRef;
    current!.innerHTML = props.title!;
    console.log(props.title);
  }, [props.title]);
  // const md = unified()
  //   .use(remarkParse)
  //   .use(() => (tree) => console.log(JSON.stringify(tree, null, 2)))
  //   .use(remarkGfm)
  //   .use(remarkRehype)
  //   .use(rehypeReact, {
  //     createElement,
  //     Fragment,
  //     components: {
  //       code: RemarkCode,
  //       p: RemarkP,
  //       ol: RemarkOL,
  //       blockquote: RemarkBlock,
  //     },
  //   })
  //   .processSync(props.doc).result;

  return (
    <div
      ref={previewRef}
      className="w-full overflow-auto bg-white dark:bg-black flex flex-col  h-[calc(100%-0px)]"
    >
      <div
        ref={titleRef}
        className="font-bold text-2xl p-4 select-none relative h-auto break-words whitespace-pre-line"
      ></div>
      <div className="bg-white dark:text-white p-4 dark:bg-black  preview markdown-body relative h-auto w-full  break-words">
        <ReactMD doc={props.doc} />
        {/* <div
          style={{ background: "transparent" }}
          className="preview markdown-body p-4 w-full h-full overflow-auto relative"
        >
          {md}
        </div> */}
      </div>
    </div>
  );
};

export default Preview;
